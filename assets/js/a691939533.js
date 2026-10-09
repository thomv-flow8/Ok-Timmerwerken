(function(){
var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var cue = document.getElementById('cue');
var cueTekst = cue ? cue.querySelector('.sd-tekst') : null;
var cuePijl = cue ? cue.querySelector('.sd-pijl') : null;
function cueCheck(){
if(!cue) return;
var onder = document.elementFromPoint(window.innerWidth/2, window.innerHeight * 0.945);
var donker = false;
while(onder){
if(onder.classList && (onder.classList.contains('donker'))){ donker = true; break; }
if(onder.tagName === 'SECTION') break;
onder = onder.parentElement;
}
cue.classList.toggle('op-donker', donker);
var bijnaOnder = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 80);
cue.classList.toggle('omhoog', bijnaOnder);
if(cueTekst) cueTekst.textContent = bijnaOnder ? 'Scroll up' : 'Scroll down';
if(cuePijl) cuePijl.innerHTML = bijnaOnder ? '&#9650;' : '&#9660;';
}
var ct=false;
window.addEventListener('scroll', function(){ if(!ct){ct=true;requestAnimationFrame(function(){cueCheck();ct=false;});} }, {passive:true});
window.addEventListener('resize', cueCheck); cueCheck();
cue && cue.addEventListener('click', function(){
if(cue.classList.contains('omhoog')) window.scrollTo({top:0, behavior:'smooth'});
else window.scrollBy({top:Math.round(window.innerHeight*0.9), behavior:'smooth'});
});
(function(){
var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
var vitrines=[].slice.call(document.querySelectorAll('.vitrine'));
var io=new IntersectionObserver(function(es){
es.forEach(function(e){ var v=e.target.firstElementChild;
if(e.isIntersecting){ v.classList.add('in'); v._zicht=true; } else v._zicht=false; });
},{threshold:.2});
vitrines.forEach(function(v){ io.observe(v.parentElement); });
[].forEach.call(document.querySelectorAll('.vitrine'),function(v){
var a=v.closest('article').querySelector('a.pil'); if(!a) return;
v.addEventListener('click',function(){ location.href=a.href; });
});
function voorNa(el,as){
if(!el) return; var zelf=false, t0=performance.now();
el.addEventListener('mousemove',function(e){ zelf=true; var r=el.getBoundingClientRect();
var v=as==='y'?(e.clientY-r.top)/r.height:(e.clientX-r.left)/r.width;
el.style.setProperty('--pos',Math.min(100,Math.max(0,v*100))+'%'); });
el.addEventListener('mouseleave',function(){ zelf=false; t0=performance.now(); });
(function schuif(t){
if(!zelf && !rm && el._zicht){ var x=50+40*Math.sin((t-t0)/1300); el.style.setProperty('--pos',x.toFixed(2)+'%'); }
requestAnimationFrame(schuif);
})(performance.now());
}
voorNa(document.querySelector('.v-zolder'),'x');
voorNa(document.querySelector('.v-fundering'),'y');
var vakken=[].slice.call(document.querySelectorAll('.vak'));
var vignetten=[].slice.call(document.querySelectorAll('.vignet')), opbouw=[].slice.call(document.querySelectorAll('.opbouw')), timmer=document.querySelector('.v-timmer'),
timmerFl=timmer.querySelector('.fl');
var chaos=document.querySelector('.chaos .scene'), fase=document.getElementById('fase');
var krul=document.getElementById('krulpad'), krulLen=krul.getTotalLength();
krul.style.strokeDasharray=krulLen; krul.style.strokeDashoffset=krulLen;
function voortgang(el,start,eind){
var r=el.getBoundingClientRect(), h=innerHeight; return Math.min(1,Math.max(0,(start*h-r.top)/((start-eind)*h)));
}
var tik=false;
function scroll(){
tik=false; var h=innerHeight;
vitrines.forEach(function(v){ var r=v.parentElement.getBoundingClientRect();
if(r.top<h*.85 && r.bottom>0){ v.classList.add('in'); v._zicht=true; } });
if(!rm) vakken.forEach(function(vk){ var r=vk.getBoundingClientRect(), mid=r.top+r.height/2-h/2;
vk.style.transform='translateY('+(mid*-.12).toFixed(1)+'px)'; });
var kr=krul.ownerSVGElement.getBoundingClientRect();
var pk0=rm?1:Math.min(1,Math.max(0,(h*.85-kr.top)/(kr.height*.9)));
krul.style.strokeDashoffset=(krulLen*(1-pk0)).toFixed(1);
vignetten.forEach(function(v){ var p=rm?1:voortgang(v,.95,.3);
v.style.setProperty('--p',p.toFixed(3)); v.style.setProperty('--r',(14+p*62).toFixed(1)+'%'); });
opbouw.forEach(function(v){ v.style.setProperty('--p',(rm?1:voortgang(v,.95,.35)).toFixed(3)); });
timmerFl.textContent=parseFloat(timmer.style.getPropertyValue('--p')||0)<.86?'Regelwerk':'Afgewerkt';
var cr=chaos.parentElement.getBoundingClientRect(), loop=cr.height-h;
var pk=rm?.5:Math.min(1,Math.max(0,(-cr.top-loop*.15)/(loop*.7)));
chaos.style.setProperty('--p',pk.toFixed(3));
fase.textContent=pk<.5?'Tijdens':'Na';
}
addEventListener('scroll',function(){ if(!tik){ tik=true; requestAnimationFrame(scroll);} },{passive:true});
addEventListener('resize',scroll); scroll();
})();
(function(){
var sec=document.querySelector('.werkmuur'); if(!sec) return;
var muur=sec.querySelector('.muur'), rijen=[].slice.call(muur.children), bezig=false;
function laad(){ [].forEach.call(muur.querySelectorAll('img[data-src]'),function(im){ im.src=im.dataset.src; im.removeAttribute('data-src'); }); }
if('IntersectionObserver' in window){ var lo=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ laad(); lo.disconnect(); } },{rootMargin:'800px 0px'}); lo.observe(sec); } else laad();
if(rm) return;
function zet(){ bezig=false; var r=sec.getBoundingClientRect(), h=innerHeight;
if(r.bottom<-200||r.top>h+200) return;
var p=(h-r.top)/(h+r.height), basis=(p-.5)*-560;
rijen.forEach(function(rij,i){ rij.style.transform='translate3d('+(basis+(i%2?1:-1)*(p-.5)*180).toFixed(1)+'px,0,0)'; }); }
function plan(){ if(!bezig){ bezig=true; requestAnimationFrame(zet); } }
addEventListener('scroll',plan,{passive:true}); addEventListener('resize',plan); zet();
})();
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
var box=document.querySelector('.hero-beeld[data-video]'); if(!box) return;
var zuinig=navigator.connection&&navigator.connection.saveData;
if(rm||zuinig||!matchMedia('(min-width:821px)').matches) return;
var v=document.createElement('video'); v.muted=true; v.playsInline=true; v.setAttribute('playsinline',''); v.setAttribute('aria-hidden','true');
v.poster=box.querySelector('img').src; box.appendChild(v);
v.src=box.dataset.video; v.addEventListener('playing',function(){ v.classList.add('speelt'); });
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
