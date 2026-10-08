// Schermafbeelding van een pagina met de WebKit-motor van macOS (dezelfde als Safari).
// Bouwen:   swiftc -O tools/schiet.swift -o <map>/schiet
// Gebruik:  schiet <url> <breedte> <hoogte> <uit.png> [css-selector om naartoe te scrollen]
// Animaties en invaders worden uitgezet, zodat de opname de eindtoestand toont.
import AppKit
import WebKit

let a = CommandLine.arguments
let url = URL(string: a[1])!, w = CGFloat(Double(a[2])!), h = CGFloat(Double(a[3])!), uit = a[4]
let doel = a.count > 5 ? a[5] : ""

class D: NSObject, WKNavigationDelegate {
  func webView(_ wv: WKWebView, didFinish n: WKNavigation!) {
    let js = """
    var s=document.createElement('style');s.textContent='*{animation:none!important;transition:none!important}.hero-in .badge,.hero-in h1,.hero-in p,.hero-in .hero-acties,.hero-in .feiten{opacity:1!important;transform:none!important}.op,.op *{opacity:1!important;transform:none!important}.vitrine .v-logo,.vitrine .tag{opacity:1!important;translate:0 0!important}.opbouw .stroken i{transform:scaleY(0)!important}';document.head.appendChild(s);
    document.querySelectorAll('.op').forEach(function(e){e.classList.add('in')});
    document.querySelectorAll('.feiten b[data-naar]').forEach(function(b){b.textContent=b.getAttribute('data-naar')+(b.getAttribute('data-na')||'')});
    """
    let scroll = doel.isEmpty ? "" : "document.documentElement.style.scrollBehavior='auto';var d=document.querySelector('\(doel)');if(d){d.scrollIntoView({block:'start'});window.scrollBy(0,-110);}"
    wv.evaluateJavaScript(js + scroll) { _, _ in
      DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
        let c = WKSnapshotConfiguration(); c.rect = CGRect(x: 0, y: 0, width: w, height: h)
        wv.takeSnapshot(with: c) { img, err in
          guard let img = img, let t = img.tiffRepresentation, let r = NSBitmapImageRep(data: t),
                let p = r.representation(using: .png, properties: [:]) else { print("fout", err as Any); exit(1) }
          try! p.write(to: URL(fileURLWithPath: uit)); print("ok", uit); exit(0)
        }
      }
    }
  }
}

let app = NSApplication.shared
let wv = WKWebView(frame: CGRect(x: 0, y: 0, width: w, height: h))
let d = D(); wv.navigationDelegate = d
let win = NSWindow(contentRect: wv.frame, styleMask: [.borderless], backing: .buffered, defer: false)
win.contentView = wv
wv.load(URLRequest(url: url))
DispatchQueue.main.asyncAfter(deadline: .now() + 25) { print("timeout"); exit(2) }
app.run()
