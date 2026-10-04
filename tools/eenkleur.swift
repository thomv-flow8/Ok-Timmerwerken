// Kleurt alle zichtbare pixels van een PNG om naar één vlakke kleur, met behoud van transparantie.
// Gebruik: swift tools/eenkleur.swift <in.png> <uit.png> <r> <g> <b>   (0-255)
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let a = CommandLine.arguments
guard a.count >= 6 else { print("gebruik: eenkleur.swift <in> <uit> <r> <g> <b>"); exit(1) }
let r = UInt8(a[3])!, g = UInt8(a[4])!, b = UInt8(a[5])!

guard let bron = CGImageSourceCreateWithURL(URL(fileURLWithPath: a[1]) as CFURL, nil),
      let img = CGImageSourceCreateImageAtIndex(bron, 0, nil) else { print("kan bron niet lezen"); exit(1) }

let w = img.width, h = img.height
var pix = [UInt8](repeating: 0, count: w * h * 4)
let ctx = CGContext(data: &pix, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                    space: CGColorSpaceCreateDeviceRGB(),
                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))

// Premultiplied: de kleur schaalt mee met de alfa, zodat randen zacht blijven.
for i in stride(from: 0, to: pix.count, by: 4) {
    let alfa = Int(pix[i + 3])
    guard alfa > 0 else { continue }
    pix[i]     = UInt8(Int(r) * alfa / 255)
    pix[i + 1] = UInt8(Int(g) * alfa / 255)
    pix[i + 2] = UInt8(Int(b) * alfa / 255)
}

let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: a[2]) as CFURL,
                                           UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(dest, ctx.makeImage()!, nil)
CGImageDestinationFinalize(dest)
print("geschreven: \(a[2])  (\(w)x\(h))")
