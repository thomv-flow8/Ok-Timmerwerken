// Rastert de tekeningen uit assets/logo-nieuw/tekening.json naar PNG's.
// Leest dezelfde beschrijving als waaruit de SVG's worden geschreven, zodat de
// PNG en de SVG per definitie dezelfde vorm hebben.
//
//   swift tools/tekening-naar-png.swift <tekening.json> <uitmap>
//
// Het JSON-bestand bevat zowel de tekeningen als de lijst te maken bestanden,
// zodat een compilatie volstaat voor het hele pakket.

import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let arg = CommandLine.arguments
guard arg.count == 3 else {
    FileHandle.standardError.write("gebruik: <tekening.json> <uitmap>\n".data(using: .utf8)!)
    exit(2)
}
let jsonPad = arg[1]
let uitMap = URL(fileURLWithPath: arg[2], isDirectory: true)

guard let data = FileManager.default.contents(atPath: jsonPad),
      let top = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
      let tekeningen = top["tekeningen"] as? [String: Any],
      let opdrachten = top["uitvoer"] as? [[String: Any]] else {
    FileHandle.standardError.write("kan \(jsonPad) niet lezen\n".data(using: .utf8)!)
    exit(1)
}
try? FileManager.default.createDirectory(at: uitMap, withIntermediateDirectories: true)

// Padontleder. Het lijnwerk gebruikt M, L, V en H; de letteromtrekken van het
// woordmerk komen uit opentype.js en gebruiken daarnaast Q, C en Z.
func tekenPad(_ d: String, in ctx: CGContext) {
    var huidig = CGPoint.zero
    var i = d.startIndex
    var commando: Character = "M"
    func getal() -> CGFloat? {
        while i < d.endIndex, d[i] == " " || d[i] == "," { i = d.index(after: i) }
        var s = ""
        while i < d.endIndex {
            let c = d[i]
            if "0123456789.".contains(c) {
                s.append(c)
            } else if c == "-" || c == "+" {
                // Een teken hoort alleen aan het begin van een getal, of direct
                // na een exponent-e. Anders begint het een nieuw getal, zoals in
                // de aaneengeschreven letteromtrekken (bijvoorbeeld 21.34-3.47).
                if s.isEmpty || s.last == "e" || s.last == "E" {
                    s.append(c)
                } else { break }
            } else if c == "e" || c == "E" {
                s.append(c)
            } else {
                break
            }
            i = d.index(after: i)
        }
        return s.isEmpty ? nil : CGFloat(Double(s) ?? 0)
    }
    while i < d.endIndex {
        let teken = d[i]
        if teken == " " || teken == "," { i = d.index(after: i); continue }
        if teken == "Z" || teken == "z" { ctx.closePath(); i = d.index(after: i); continue }
        if "MLVHQC".contains(teken) { commando = teken; i = d.index(after: i); continue }
        switch commando {
        case "M":
            guard let x = getal(), let y = getal() else { return }
            huidig = CGPoint(x: x, y: y); ctx.move(to: huidig)
        case "L":
            guard let x = getal(), let y = getal() else { return }
            huidig = CGPoint(x: x, y: y); ctx.addLine(to: huidig)
        case "V":
            guard let y = getal() else { return }
            huidig = CGPoint(x: huidig.x, y: y); ctx.addLine(to: huidig)
        case "H":
            guard let x = getal() else { return }
            huidig = CGPoint(x: x, y: huidig.y); ctx.addLine(to: huidig)
        case "Q":
            guard let cx = getal(), let cy = getal(),
                  let x = getal(), let y = getal() else { return }
            huidig = CGPoint(x: x, y: y)
            ctx.addQuadCurve(to: huidig, control: CGPoint(x: cx, y: cy))
        case "C":
            guard let c1x = getal(), let c1y = getal(),
                  let c2x = getal(), let c2y = getal(),
                  let x = getal(), let y = getal() else { return }
            huidig = CGPoint(x: x, y: y)
            ctx.addCurve(to: huidig,
                         control1: CGPoint(x: c1x, y: c1y),
                         control2: CGPoint(x: c2x, y: c2y))
        default: return
        }
    }
}

func kleur(_ v: Any?) -> (CGFloat, CGFloat, CGFloat)? {
    guard let a = v as? [Double], a.count == 3 else { return nil }
    return (CGFloat(a[0] / 255), CGFloat(a[1] / 255), CGFloat(a[2] / 255))
}

let ruimte = CGColorSpaceCreateDeviceRGB()
var gemaakt = 0

for opdracht in opdrachten {
    guard let naam = opdracht["naam"] as? String,
          let bestand = opdracht["bestand"] as? String,
          let breedtePx = opdracht["breedte"] as? Int,
          let tekening = tekeningen[naam] as? [String: Any],
          let breed = tekening["breed"] as? Double,
          let hoog = tekening["hoog"] as? Double,
          let elementen = tekening["elementen"] as? [[String: Any]] else {
        FileHandle.standardError.write("opdracht overgeslagen: \(opdracht)\n".data(using: .utf8)!)
        continue
    }
    let (r, g, b) = kleur(opdracht["kleur"]) ?? (0, 0, 0)
    let schaal = Double(breedtePx) / breed
    let hoogtePx = Int((hoog * schaal).rounded())

    guard let ctx = CGContext(data: nil, width: breedtePx, height: hoogtePx, bitsPerComponent: 8,
                              bytesPerRow: 0, space: ruimte,
                              bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { continue }
    ctx.setAllowsAntialiasing(true)

    // Zonder achtergrondkleur blijft het vlak doorzichtig. Een apple-touch-icon
    // verdraagt geen doorzichtigheid, dus daar wordt wel gevuld.
    if let (ar, ag, ab) = kleur(opdracht["achtergrond"]) {
        ctx.setFillColor(red: ar, green: ag, blue: ab, alpha: 1)
        ctx.fill(CGRect(x: 0, y: 0, width: breedtePx, height: hoogtePx))
    }

    // SVG rekent vanaf linksboven, CoreGraphics vanaf linksonder.
    ctx.translateBy(x: 0, y: CGFloat(hoogtePx))
    ctx.scaleBy(x: CGFloat(schaal), y: CGFloat(-schaal))
    ctx.setStrokeColor(red: r, green: g, blue: b, alpha: 1)
    ctx.setLineJoin(.miter)
    ctx.setMiterLimit(4)

    for e in elementen {
        // Een element mag een eigen schaal en verschuiving hebben.
        ctx.saveGState()
        if let p = e["plaatsing"] as? [String: Any],
           let f = p["f"] as? Double, let dx = p["dx"] as? Double, let dy = p["dy"] as? Double {
            ctx.translateBy(x: CGFloat(dx), y: CGFloat(dy))
            ctx.scaleBy(x: CGFloat(f), y: CGFloat(f))
        }
        ctx.setLineWidth(CGFloat((e["dikte"] as? Double) ?? 7))
        switch e["soort"] as? String {
        case "vorm":
            // Het woordmerk: een gevulde letteromtrek, geen lijnwerk.
            guard let d = e["d"] as? String else { break }
            ctx.setFillColor(red: r, green: g, blue: b, alpha: 1)
            ctx.beginPath()
            tekenPad(d, in: ctx)
            ctx.fillPath(using: .winding)
        case "cirkel":
            guard let cx = e["cx"] as? Double, let cy = e["cy"] as? Double,
                  let rr = e["r"] as? Double else { break }
            ctx.setLineCap(.butt)
            ctx.beginPath()
            ctx.addEllipse(in: CGRect(x: cx - rr, y: cy - rr, width: rr * 2, height: rr * 2))
            ctx.strokePath()
        case "pad":
            guard let d = e["d"] as? String else { break }
            ctx.setLineCap((e["afsluiting"] as? String) == "square" ? .square : .butt)
            ctx.beginPath()
            tekenPad(d, in: ctx)
            ctx.strokePath()
        default: break
        }
        ctx.restoreGState()
    }

    let doel = uitMap.appendingPathComponent(bestand)
    guard let beeld = ctx.makeImage(),
          let bestemming = CGImageDestinationCreateWithURL(
            doel as CFURL, UTType.png.identifier as CFString, 1, nil) else { continue }
    CGImageDestinationAddImage(bestemming, beeld, nil)
    if CGImageDestinationFinalize(bestemming) {
        gemaakt += 1
        print("  \(bestand)  \(breedtePx)x\(hoogtePx)")
    }
}

print("\(gemaakt) van \(opdrachten.count) PNG's geschreven")
