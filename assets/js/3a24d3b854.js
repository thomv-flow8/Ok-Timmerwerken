(function(){
var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var op=[].slice.call(document.querySelectorAll('.op'));
if(rm || !('IntersectionObserver' in window)) op.forEach(function(e){ e.classList.add('in'); });
else { var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{threshold:.15});
op.forEach(function(e){ io.observe(e); }); }
function vang(){ var h=innerHeight; op.forEach(function(e){ if(!e.classList.contains('in') && e.getBoundingClientRect().top<h*.92) e.classList.add('in'); }); }
addEventListener('scroll',vang,{passive:true}); addEventListener('load',vang); vang();
if(location.hash && location.hash.length>1){ var doelEl=document.getElementById(decodeURIComponent(location.hash.slice(1)));
if(doelEl) addEventListener('load',function(){ setTimeout(function(){ document.documentElement.style.scrollBehavior='auto';
doelEl.scrollIntoView({block:'start'}); document.documentElement.style.scrollBehavior=''; vang(); },60); }); }
var krullen=[].slice.call(document.querySelectorAll('svg.krul path'));
krullen.forEach(function(p){ p._L=p.getTotalLength(); p.style.strokeDasharray=p._L; p.style.strokeDashoffset=rm?0:p._L; });
function krulScroll(){ var h=innerHeight; krullen.forEach(function(p){ var r=p.ownerSVGElement.getBoundingClientRect(), top=r.top+scrollY,
t=top<h ? .22+scrollY/(top+r.height)*1.1 : (h*.95-r.top)/(r.height+h*.25);
t=Math.min(1,Math.max(0,t)); p.style.strokeDashoffset=(p._L*(1-t)).toFixed(1); }); }
if(!rm && krullen.length){ addEventListener('scroll',krulScroll,{passive:true}); krulScroll(); }
var lb=document.getElementById('lichtbak'), lbImg=lb.querySelector('img'), lbVid=null, lbTxt=lb.querySelector('p');
function speler(){ if(!lbVid){ lbVid=document.createElement('video'); lbVid.controls=true; lbVid.muted=true; lbVid.loop=true; lbVid.setAttribute('playsinline',''); lbImg.after(lbVid); } return lbVid; }
function dicht(){ lb.classList.remove('open'); if(lbVid) lbVid.pause(); }
var kc=document.querySelector('.kc');
if(kc){
var rail=kc.querySelector('.kc-rail'), kaarten=[].slice.call(kc.querySelectorAll('.kc-kaart')), podium=kc.querySelector('.kc-podium'),
teller=kc.querySelector('.kc-teller'), aantal=kaarten.length, nu=0, vorig=[],
persp=kaarten.map(function(k){ return k.parentNode; });
function nn(i){ return (i<9?'0':'')+(i+1); }
function afstand(j){ var o=((j-nu)%aantal+aantal)%aantal; return o>aantal/2 ? o-aantal : o; }
function toon(i){ nu=(i+aantal)%aantal;
persp.forEach(function(p,j){ var o=afstand(j), sprong=vorig[j]!==undefined && Math.abs(o-vorig[j])>1;
if(sprong) p.style.transition='none';            // kaart die van de ene naar de andere kant wisselt: onzichtbaar verplaatsen
p.style.setProperty('--o',o); p.classList.toggle('ver',Math.abs(o)>2);
if(sprong){ void p.offsetWidth; p.style.transition=''; }
vorig[j]=o; });
kaarten.forEach(function(k,j){ k.classList.toggle('aan',j===nu);
var v=k.querySelector('video'); if(!v) return;
if(j===nu && !rm && kcZicht){ if(!v.getAttribute('src')) v.src=v.dataset.src; v.play().catch(function(){}); } else v.pause(); });
teller.textContent=nn(nu)+' / '+nn(aantal-1); }
rail.addEventListener('click',function(e){
var g=e.target.closest('.kc-groot');
if(g){ var k=kaarten[+g.dataset.groot], im=k.querySelector('img'), vd=k.querySelector('video');
if(vd){ vd.pause(); var sp=speler(); lbImg.hidden=true; sp.hidden=false; sp.poster=vd.poster; sp.src=vd.dataset.src; lbTxt.textContent=vd.getAttribute('aria-label'); sp.play().catch(function(){}); }
else { if(lbVid){ lbVid.hidden=true; lbVid.pause(); } lbImg.hidden=false; lbImg.src=im.src; lbImg.alt=im.alt; lbTxt.textContent=im.alt; }
lb.classList.add('open'); return; }
var k2=e.target.closest('.kc-kaart'); if(k2 && +k2.dataset.i!==nu) toon(+k2.dataset.i); });
if(!rm) kaarten.forEach(function(k){ var x=0,y=0,raf=0;
k.addEventListener('mousemove',function(e){ var r=k.getBoundingClientRect(); x=e.clientX-(r.left+r.width/2); y=e.clientY-(r.top+r.height/2);
if(!raf) raf=requestAnimationFrame(function(){ raf=0; k.style.setProperty('--x',x+'px'); k.style.setProperty('--y',y+'px'); }); });
k.addEventListener('mouseleave',function(){ k.style.setProperty('--x','0px'); k.style.setProperty('--y','0px'); }); });
kc.querySelector('.kc-vorige').addEventListener('click',function(){ toon(nu-1); });
kc.querySelector('.kc-volgende').addEventListener('click',function(){ toon(nu+1); });
podium.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'){ e.preventDefault(); toon(nu+1); } if(e.key==='ArrowLeft'){ e.preventDefault(); toon(nu-1); } });
var x0=null; podium.addEventListener('pointerdown',function(e){ x0=e.clientX; });
podium.addEventListener('pointerup',function(e){ if(x0===null) return; var dx=e.clientX-x0; x0=null; if(dx<-40) toon(nu+1); else if(dx>40) toon(nu-1); });
var kcZicht=false;
if('IntersectionObserver' in window) new IntersectionObserver(function(es){ kcZicht=es[0].isIntersecting; toon(nu); },{threshold:.25}).observe(podium);
toon(0);
}
lb.addEventListener('click',function(e){ if(e.target===lb||e.target.closest('button')) dicht(); });
addEventListener('keydown',function(e){ if(e.key==='Escape') dicht(); });
[].forEach.call(document.querySelectorAll('[data-jaar]'),function(e){ e.textContent=new Date().getFullYear(); });
(function(){
var tellers=[].slice.call(document.querySelectorAll('[data-tel]')); if(!tellers.length) return;
tellers.forEach(function(el){ var s=el.getAttribute('data-sinds'); if(s) el.setAttribute('data-naar', new Date().getFullYear()-parseInt(s,10)); });
function fmt(el,v){ return v.toFixed(parseInt(el.getAttribute('data-dec')||'0',10)).replace('.',',')+(el.getAttribute('data-na')||''); }
function eind(el){ el.textContent=fmt(el,parseFloat(el.getAttribute('data-naar'))); }
if(rm || !('IntersectionObserver' in window)){ tellers.forEach(eind); return; }
function telOp(el){
var naar=parseFloat(el.getAttribute('data-naar')), duur=1300, start=null;
function stap(t){ if(start===null) start=t; var p=Math.min(1,(t-start)/duur);
if(p<1){ el.textContent=fmt(el,naar*(1-Math.pow(1-p,3))); requestAnimationFrame(stap); } else eind(el); }   // ease-out
requestAnimationFrame(stap);
}
tellers.forEach(function(el){ el.textContent=fmt(el,0); });
var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ telOp(e.target); io.unobserve(e.target); } }); },{threshold:.6});
tellers.forEach(function(t){ io.observe(t); });
})();
(function(){
var paden=[].slice.call(document.querySelectorAll('.cta-krul path'));
if(!paden.length) return;
paden.forEach(function(p){ p._len=p.getTotalLength(); p.style.strokeDasharray=p._len; p.style.strokeDashoffset=rm?0:p._len; });
if(rm) return;
var tik=false;
function teken(){ tik=false; var h=innerHeight;
paden.forEach(function(p){ var r=p.ownerSVGElement.getBoundingClientRect();
var v=Math.min(1,Math.max(0,(h*.92-r.top)/(h*.45)));
p.style.strokeDashoffset=(p._len*(1-v)).toFixed(1); }); }
addEventListener('scroll',function(){ if(!tik){ tik=true; requestAnimationFrame(teken);} },{passive:true});
addEventListener('resize',teken); teken();
})();
(function(){
var els=[].slice.call(document.querySelectorAll('.nu-open')); if(!els.length) return;
function nl(){ var p={}; new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',weekday:'short',hour:'numeric',minute:'numeric',hourCycle:'h23'})
.formatToParts(new Date()).forEach(function(x){ p[x.type]=x.value; });
return {d:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday), m:+p.hour*60+(+p.minute)}; }
function eind(d){ return d>=1&&d<=5?20*60:d===6?16*60:0; }
function zet(){ var t=nl(), open=t.m>=420&&t.m<eind(t.d), txt;
if(open) txt='Nu bereikbaar — tot '+(eind(t.d)/60)+':00';
else { var d=t.d, w=(t.m<420&&eind(d))?'vandaag':d===0?'morgen':d===6?'maandag':d===5?'zaterdag':'morgen';
txt='Nu gesloten — '+w+' weer vanaf 07:00'; }
els.forEach(function(el){ el.classList.toggle('dicht',!open); el.querySelector('span').textContent=txt; el.hidden=false; }); }
zet(); setInterval(zet,60000);
})();
(function(){
var v=document.querySelector('.hero-beeld video'); if(!v) return;
var zuinig=navigator.connection&&navigator.connection.saveData;
if(rm||zuinig||!matchMedia('(min-width:821px)').matches) return;
v.muted=true; v.src=v.dataset.src; v.addEventListener('playing',function(){ v.classList.add('speelt'); });
var p=v.play(); if(p&&p.catch) p.catch(function(){});
var inBeeld=true;
function speel(){ if(!v.ended) v.play().catch(function(){}); }   // een afgelopen video niet opnieuw starten
if('IntersectionObserver' in window) new IntersectionObserver(function(es){ inBeeld=es[0].isIntersecting; inBeeld?speel():v.pause(); }).observe(v);
document.addEventListener('visibilitychange',function(){ if(!document.hidden&&inBeeld) speel(); });
})();
(function(){
[].forEach.call(document.querySelectorAll('.contact-grid > *'),function(kol,k){
[].forEach.call(kol.children,function(c,i){ c.style.setProperty('--i',i+k*3); }); });
var els=[].slice.call(document.querySelectorAll('.stappen,[data-teken],.contact-grid,.skyline-in'));
if(rm || !('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('in'); }); return; }
var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{threshold:.25});
els.forEach(function(e){ io.observe(e); });
})();
(function(){
var knop=document.querySelector('.menu-knop'), paneel=document.getElementById('menu');
if(!knop||!paneel) return;
function zet(open){ document.documentElement.classList.toggle('menu-open',open);
knop.setAttribute('aria-expanded',open?'true':'false');
if(open) paneel.querySelector('.menu-dicht').focus(); else knop.focus(); }
knop.addEventListener('click',function(){ zet(true); });
paneel.querySelector('.menu-dicht').addEventListener('click',function(){ zet(false); });
paneel.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){
document.documentElement.classList.remove('menu-open'); knop.setAttribute('aria-expanded','false'); }); });
addEventListener('keydown',function(e){ if(e.key==='Escape' && document.documentElement.classList.contains('menu-open')) zet(false); });
})();
(function(){ var f=document.getElementById('aanvraag'); if(!f) return;
f.addEventListener('submit',function(e){ e.preventDefault(); var m=f.querySelector('.form-melding'); m.hidden=false; m.scrollIntoView({block:'nearest'}); });
})();
if(!rm && !matchMedia('(hover:none)').matches){
document.querySelectorAll('.vitrine,[data-kantel]').forEach(function(el){
el.addEventListener('mousemove',function(e){ var r=el.getBoundingClientRect();
var x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
el.style.setProperty('--ry',(x*3.2).toFixed(2)+'deg'); el.style.setProperty('--rx',(-y*3.2).toFixed(2)+'deg');
el.style.setProperty('--sc','1.018'); });
el.addEventListener('mouseleave',function(){ el.style.setProperty('--ry','0deg'); el.style.setProperty('--rx','0deg'); el.style.setProperty('--sc','1'); });
});
}
(function(){
if(window.matchMedia('(hover:none)').matches) return;
var cur=document.createElement('div'); cur.className='cur'; document.body.appendChild(cur);
var mx=innerWidth/2, my=innerHeight/2, cx=mx, cy=my, zichtbaar=false;
addEventListener('mousemove',function(e){ mx=e.clientX; my=e.clientY;
if(!zichtbaar){ zichtbaar=true; cur.style.opacity=1; } },{passive:true});
addEventListener('mouseleave',function(){ cur.style.opacity=0; });
(function loop(){ cx+=(mx-cx)*.12; cy+=(my-cy)*.12;
cur.style.transform='translate('+cx+'px,'+cy+'px) translate(-50%,-50%)'; requestAnimationFrame(loop); })();
var sel='a,button,.vitrine,.knop,.pil,.soc,.wa,input,textarea,[role=button]';
document.addEventListener('mouseover',function(e){ if(e.target.closest&&e.target.closest(sel)) cur.classList.add('groot'); });
document.addEventListener('mouseout',function(e){ var n=e.relatedTarget;
if(e.target.closest&&e.target.closest(sel) && !(n&&n.closest&&n.closest(sel))) cur.classList.remove('groot'); });
})();
(function(){
var sub=document.querySelector('.nav-sub'); if(!sub) return;
function laad(){ [].forEach.call(sub.querySelectorAll('img[data-src]'),function(im){ im.src=im.dataset.src; im.removeAttribute('data-src'); }); }
['mouseenter','focusin','touchstart'].forEach(function(ev){ sub.addEventListener(ev,laad,{once:true,passive:true}); });
})();
})();
