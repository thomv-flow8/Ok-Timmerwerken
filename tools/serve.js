// Eenvoudige lokale webserver voor de previews (geen afhankelijkheden).
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT) || 5173;
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.png':'image/png',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.json':'application/json', '.woff2':'font/woff2', '.mp4':'video/mp4' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Niet gevonden'); }
    const kop = { 'Content-Type': types[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
    // Range-verzoeken (206): Safari speelt video alleen af als de server stukjes van het bestand kan leveren
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m) {
      let start = m[1] === '' ? data.length - Number(m[2]) : Number(m[1]);
      let eind = m[1] !== '' && m[2] !== '' ? Number(m[2]) : data.length - 1;
      eind = Math.min(eind, data.length - 1);
      if (isNaN(start) || start < 0 || start > eind) { res.writeHead(416, { 'Content-Range': 'bytes */' + data.length }); return res.end(); }
      res.writeHead(206, Object.assign(kop, { 'Content-Range': `bytes ${start}-${eind}/${data.length}`, 'Content-Length': eind - start + 1 }));
      return res.end(data.subarray(start, eind + 1));
    }
    res.writeHead(200, Object.assign(kop, { 'Content-Length': data.length }));
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => console.log('Preview: http://localhost:' + port + '/preview/'));
