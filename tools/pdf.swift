// Zet een lokaal html-bestand om naar een A4-pdf met paginering, via de WebKit-motor van macOS.
// Bouwen:   swiftc -O tools/pdf.swift -o <map>/pdf
// Gebruik:  pdf <bron.html> <uit.pdf>
import AppKit
import WebKit

let a = CommandLine.arguments
guard a.count == 3 else { print("gebruik: pdf <bron.html> <uit.pdf>"); exit(1) }
let bron = URL(fileURLWithPath: a[1]), uit = URL(fileURLWithPath: a[2])
// A4 in punten; de marges staan hieronder (geen marge in @page van de html zetten)
let a4 = NSSize(width: 595.28, height: 841.89)

class D: NSObject, WKNavigationDelegate {
  func webView(_ wv: WKWebView, didFinish n: WKNavigation!) {
    // even wachten tot lettertypes en beelden klaar zijn
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
      let info = NSPrintInfo()
      info.paperSize = a4
      info.topMargin = 40; info.bottomMargin = 46; info.leftMargin = 45; info.rightMargin = 45   // ca. 14/16 mm
      info.horizontalPagination = .fit; info.verticalPagination = .automatic
      info.jobDisposition = .save
      info.dictionary()[NSPrintInfo.AttributeKey.jobSavingURL] = uit
      let op = wv.printOperation(with: info)
      op.showsPrintPanel = false; op.showsProgressPanel = false
      op.view?.frame = NSRect(origin: .zero, size: a4)
      op.runModal(for: win, delegate: self, didRun: #selector(D.klaar(_:gelukt:context:)), contextInfo: nil)
    }
  }
  @objc func klaar(_ op: NSPrintOperation, gelukt: Bool, context: UnsafeMutableRawPointer?) {
    let grootte = (try? FileManager.default.attributesOfItem(atPath: uit.path)[.size] as? Int) ?? 0
    let paginas = CGPDFDocument(uit as CFURL)?.numberOfPages ?? 0
    print(gelukt && grootte > 0 ? "ok \(uit.lastPathComponent) \(paginas) pagina's \(grootte / 1024) KB" : "fout bij \(uit.lastPathComponent)")
    exit(gelukt ? 0 : 1)
  }
}

let app = NSApplication.shared
let wv = WKWebView(frame: NSRect(origin: .zero, size: a4))
let d = D(); wv.navigationDelegate = d
let win = NSWindow(contentRect: wv.frame, styleMask: [.borderless], backing: .buffered, defer: false)
win.contentView = wv
// toegang tot de hele projectmap, zodat lettertypes en logo laden
wv.loadFileURL(bron, allowingReadAccessTo: URL(fileURLWithPath: "/"))
DispatchQueue.main.asyncAfter(deadline: .now() + 30) { print("timeout"); exit(2) }
app.run()
