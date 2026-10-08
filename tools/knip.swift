// Knipt, versnelt en ontdoet een video van geluid, en slaat hem licht op voor het web (H.264, vaste bitrate).
// Bouwen:   swiftc -O tools/knip.swift -o <map>/knip
// Gebruik:  knip <bron> <uit.mp4> <stuk> [<stuk> ...]
//   stuk = begin-eind in seconden, eventueel met snelheid: 17-45@1.5  (1.5× zo snel)
//   eind 'e' = tot het einde: 15-e
// Voorbeeld: knip bron.mp4 uit.mp4 0-8 25-37
import AVFoundation

let a = CommandLine.arguments
guard a.count >= 4 else { print("gebruik: knip <bron> <uit.mp4> <stuk> ..."); exit(1) }
let bron = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let uit = URL(fileURLWithPath: a[2])
try? FileManager.default.removeItem(at: uit)
guard let vBron = bron.tracks(withMediaType: .video).first else { print("geen videospoor"); exit(1) }
let duur = CMTimeGetSeconds(bron.duration)

// 1. samenstelling: alleen beeld (geen geluid), de stukken achter elkaar, eventueel versneld
let comp = AVMutableComposition()
let vSpoor = comp.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)!
// draai-instructie opnieuw opbouwen uit de echte afmeting: WhatsApp verkleint video's maar laat de verschuiving
// van het telefoonorigineel staan (bijv. 1080 bij een video van 576 breed), waardoor het beeld buiten het vlak valt
let t0 = vBron.preferredTransform
let draai = CGAffineTransform(a: t0.a, b: t0.b, c: t0.c, d: t0.d, tx: 0, ty: 0)
let vlak = CGRect(origin: .zero, size: vBron.naturalSize).applying(draai)
vSpoor.preferredTransform = draai.concatenating(CGAffineTransform(translationX: -vlak.minX, y: -vlak.minY))
var cursor = CMTime.zero
for stuk in a.dropFirst(3) {
  let delen = stuk.split(separator: "@"), bereik = delen[0].split(separator: "-")
  let begin = Double(bereik[0])!, eind = bereik[1] == "e" ? duur : min(Double(bereik[1])!, duur)
  let snelheid = delen.count > 1 ? Double(delen[1])! : 1.0
  let r = CMTimeRange(start: CMTime(seconds: begin, preferredTimescale: 600), end: CMTime(seconds: eind, preferredTimescale: 600))
  try! vSpoor.insertTimeRange(r, of: vBron, at: cursor)
  if snelheid != 1.0 {
    let nieuw = CMTime(seconds: (eind - begin) / snelheid, preferredTimescale: 600)
    vSpoor.scaleTimeRange(CMTimeRange(start: cursor, duration: r.duration), toDuration: nieuw)
    cursor = cursor + nieuw
  } else { cursor = cursor + r.duration }
}

// 2. opnieuw coderen met vaste bitrate, in de juiste stand (staand blijft staand)
let vc = AVMutableVideoComposition(propertiesOf: comp)
// eindmaat = afmeting ná de draai-instructie van de telefoon (anders wordt een staande video liggend uitgesneden)
vc.renderSize = CGSize(width: vlak.width.rounded(), height: vlak.height.rounded())
let maat = vc.renderSize
let lezer = try! AVAssetReader(asset: comp)
let lUit = AVAssetReaderVideoCompositionOutput(videoTracks: [vSpoor], videoSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange])
lUit.videoComposition = vc
lezer.add(lUit)
let schrijver = try! AVAssetWriter(outputURL: uit, fileType: .mp4)
schrijver.shouldOptimizeForNetworkUse = true   // 'faststart': begint te spelen voor het hele bestand binnen is
let wIn = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: Int(maat.width), AVVideoHeightKey: Int(maat.height),
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 1_500_000, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel, AVVideoMaxKeyFrameIntervalKey: 60]])
wIn.expectsMediaDataInRealTime = false
schrijver.add(wIn)
lezer.startReading(); schrijver.startWriting(); schrijver.startSession(atSourceTime: .zero)
let wachtrij = DispatchQueue(label: "knip")
let klaar = DispatchSemaphore(value: 0)
wIn.requestMediaDataWhenReady(on: wachtrij) {
  while wIn.isReadyForMoreMediaData {
    if let s = lUit.copyNextSampleBuffer() { wIn.append(s) }
    else { wIn.markAsFinished(); schrijver.finishWriting { klaar.signal() }; return }
  }
}
klaar.wait()
if schrijver.status != .completed { print("fout:", schrijver.error as Any); exit(1) }
let grootte = (try? FileManager.default.attributesOfItem(atPath: uit.path)[.size] as? Int) ?? 0
print(String(format: "ok %@ %.1fs %dx%d %.1f MB", uit.lastPathComponent, CMTimeGetSeconds(cursor), Int(maat.width), Int(maat.height), Double(grootte) / 1_048_576))
