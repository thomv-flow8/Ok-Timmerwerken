(function(){
function inkorten(k){ var p=k.querySelector('.rv-tekst'), b=k.querySelector('.rv-meer');
k.classList.add('kort'); if(p.scrollHeight>p.clientHeight+4){ b.hidden=false; b.addEventListener('click',function(){ var open=k.classList.toggle('kort'); b.textContent=open?'Lees volledig':'Minder tonen'; }); } else k.classList.remove('kort'); }
[].forEach.call(document.querySelectorAll('.rv'),inkorten);
var muur=document.querySelector('.rv-muur'), knop=document.querySelector('.rv-alle'), rest=null, filter='alle', bezig=false;
function haal(klaar){ if(rest) return klaar(); if(bezig) return; bezig=true; knop.disabled=true;
fetch('../assets/data/reviews-meer.json?v=9f25bc7e').then(function(r){ if(!r.ok) throw r; return r.json(); })
.then(function(d){ rest=d; bezig=false; knop.disabled=false; klaar(); })
.catch(function(){ bezig=false; knop.disabled=false; document.querySelector('.rv-fout').hidden=false; }); }
function meer(n){ var stuk=rest.splice(0,n), tmp=document.createElement('div'); tmp.innerHTML=stuk.join('');
[].slice.call(tmp.children).forEach(function(k){ k.hidden=filter!=='alle' && k.dataset.bron.indexOf(filter)<0; muur.appendChild(k); inkorten(k); });
if(rest.length) knop.querySelector('span').textContent='('+rest.length+')'; else knop.hidden=true; }
knop.addEventListener('click',function(){ haal(function(){ meer(24); }); });
var f=document.querySelector('.rv-filter');
f.addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return;
filter=b.dataset.f;
[].forEach.call(f.children,function(x){ x.classList.toggle('aan',x===b); });
function pas(){ [].forEach.call(document.querySelectorAll('.rv'),function(k){ k.hidden=filter!=='alle' && k.dataset.bron.indexOf(filter)<0; }); }
pas(); if(filter!=='alle') haal(function(){ if(rest.length) meer(rest.length); pas(); }); });
})();
