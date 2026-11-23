/* Isole x ! l'atelier : fonctionne hors ligne après une première visite */
const CACHE='isolex-atelier-5.3';const MINE=k=>k.startsWith('isolex-atelier-');
const SHELL=['./','./index.html','./isole-x.html','./physics.html','./chimie.js?v=3.4u','./fablab.css?v=4.0u','./atelier.css?v=4.0u','./qrcode.js?v=4.0u','./isole-x.js?v=4.9u','./isole-x-levels.js?v=5.1u','./isole-x-ui.js?v=5.1u','./fablab.css?v=3.1u','./apparence.css?v=b1u','./apparence.js?v=b2u','./idees.js?v=1u','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>MINE(k)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);if(e.request.method!=='GET')return;
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){ // polices : cache d'abord
    e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{c.put(e.request,n.clone());return n}))));return}
  if(u.origin!==location.origin)return;
  const req=e.request.mode==='navigate'?fetch(e.request.url,{cache:'no-cache',credentials:'same-origin'}):fetch(e.request,{cache:'no-cache'});
  e.respondWith(req.then(n=>{const cp=n.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return n}).catch(()=>caches.match(e.request,{ignoreSearch:false}).then(r=>r||(e.request.mode==='navigate'?caches.match('./isole-x.html'):undefined))));
});
