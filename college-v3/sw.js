/* Isole x ! Jungle 2 : fonctionne hors ligne après une première visite */
const CACHE='isolex-collegev3-c3';const MINE=k=>k.startsWith('isolex-collegev3-');
const SHELL=['./','./index.html','./fablab.css?v=c3','./jungle.css?v=c3','./isole-x.js?v=c3','./college-levels.js?v=c3','./isole-x-ui.js?v=c3','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>MINE(k)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);if(e.request.method!=='GET')return;
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){ // polices : cache d'abord
    e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{c.put(e.request,n.clone());return n}))));return}
  if(u.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(n=>{const cp=n.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return n}).catch(()=>caches.match(e.request,{ignoreSearch:false}).then(r=>r||caches.match('./index.html'))));
});
