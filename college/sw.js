/* Isole x ! Jungle 2 : fonctionne hors ligne après une première visite */
const CACHE='isolex-college-c23';const MINE=k=>k.startsWith('isolex-college-')||k.startsWith('isolex-jungle2-');
const SHELL=['./','./index.html','./fablab.css?v=c5u','./jungle.css?v=c5u','./isole-x.js?v=c16u','./college-levels.js?v=c4u','./isole-x-ui.js?v=c17u','./qrcode.js?v=c4u','./apparence.css?v=b1u','./apparence.js?v=b1u','./idees.js?v=2u','./nouveautes.css?v=2u','./balade.js?v=1u','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
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
