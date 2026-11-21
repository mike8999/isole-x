/* Isole x ! Jungle 2 : fonctionne hors ligne après une première visite */
const CACHE='isolex-college-c9';const MINE=k=>k.startsWith('isolex-college-')||k.startsWith('isolex-jungle2-');
const SHELL=['./','./index.html','./fablab.css?v=c4','./jungle.css?v=c4','./isole-x.js?v=c5','./college-levels.js?v=c4','./isole-x-ui.js?v=c8','./qrcode.js?v=c4','./apparence.css?v=a3','./apparence.js?v=a3','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>MINE(k)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);if(e.request.method!=='GET')return;
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){ // polices : cache d'abord
    e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{c.put(e.request,n.clone());return n}))));return}
  if(u.origin!==location.origin)return;
  const req=e.request.mode==='navigate'?fetch(e.request.url,{cache:'no-cache',credentials:'same-origin'}):fetch(e.request,{cache:'no-cache'});
  e.respondWith(req.then(n=>{const cp=n.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return n}).catch(()=>caches.match(e.request,{ignoreSearch:false}).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):undefined))));
});
