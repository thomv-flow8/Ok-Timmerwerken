// Maakt een contactvel (raster met nummers) van alle afbeeldingen in een map.
// Gebruik: swift tools/contactvel.swift <map> <uit.png> [kolommen] [celgrootte]
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
import CoreText

let a = CommandLine.arguments
guard a.count >= 3 else { print("gebruik: contactvel.swift <map> <uit.png> [kolommen] [cel]"); exit(1) }
let map = a[1], uit = a[2]
let kolommen = a.count > 3 ? Int(a[3])! : 6
let cel = a.count > 4 ? Int(a[4])! : 300
let label = 26

let fm = FileManager.default
let bestanden = (try! fm.contentsOfDirectory(atPath: map))
    .filter { ["jpg","jpeg","png"].contains(($0 as NSString).pathExtension.lowercased()) }
    .sorted()
let rijen = Int(ceil(Double(bestanden.count) / Double(kolommen)))
let breedte = kolommen * cel, hoogte = rijen * (cel + label)

let ruimte = CGColorSpaceCreateDeviceRGB()
let ctx = CGContext(data: nil, width: breedte, height: hoogte, bitsPerComponent: 8,
                    bytesPerRow: 0, space: ruimte,
                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.setFillColor(CGColor(red: 0.08, green: 0.08, blue: 0.09, alpha: 1))
ctx.fill(CGRect(x: 0, y: 0, width: breedte, height: hoogte))

for (i, naam) in bestanden.enumerated() {
    let k = i % kolommen, r = i / kolommen
    let x = k * cel
    let y = hoogte - (r + 1) * (cel + label)
    guard let bron = CGImageSourceCreateWithURL(URL(fileURLWithPath: "\(map)/\(naam)") as CFURL, nil),
          let img = CGImageSourceCreateThumbnailAtIndex(bron, 0, [
              kCGImageSourceCreateThumbnailFromImageAlways: true,
              kCGImageSourceThumbnailMaxPixelSize: cel - 8,
              kCGImageSourceCreateThumbnailWithTransform: true] as CFDictionary) else { continue }
    let s = min(Double(cel - 8) / Double(img.width), Double(cel - 8) / Double(img.height))
    let w = Double(img.width) * s, h = Double(img.height) * s
    ctx.draw(img, in: CGRect(x: Double(x) + (Double(cel) - w) / 2,
                             y: Double(y) + Double(label) + (Double(cel) - h) / 2, width: w, height: h))

    let attrs: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(kCTFontAttributeName as String): CTFontCreateWithName("Menlo" as CFString, 15, nil),
        NSAttributedString.Key(kCTForegroundColorAttributeName as String): CGColor(red: 1, green: 1, blue: 1, alpha: 0.85)]
    let tekst = NSAttributedString(string: naam, attributes: attrs)
    let lijn = CTLineCreateWithAttributedString(tekst)
    ctx.textPosition = CGPoint(x: Double(x) + 8, y: Double(y) + 7)
    CTLineDraw(lijn, ctx)
}

let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: uit) as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(dest, ctx.makeImage()!, nil)
CGImageDestinationFinalize(dest)
print("geschreven: \(uit) — \(bestanden.count) afbeeldingen, \(breedte)x\(hoogte)")
