/* =====================================================================
   APPARENCE — thèmes tout faits (certains à débloquer avec les pièces)
   et réglages fins : plateau, forme de l'inconnue, couleur d'accent,
   taille des jetons. Réglages communs à tous les jeux du site.
   ===================================================================== */
const LOOK=(()=>{
  const BUILD='21/11/2026 · n° 6';
  const KEY='isoleX_look',OWN='isoleX_look_owned';
  const THEMES=[
    {k:'etabli',n:'Établi fablab',d:'Bois, laiton et nid d\'abeille',sw:['#7c5128','#f4e2bd','#c9982e','#26292d'],price:120},
    {k:'jungle',n:'Jungle',d:'Feutre vert et œuf doré',sw:['#23692f','#fffbea','#ffcf3a','#2f6f35'],price:120},
    {k:'nuit',n:'Nuit',d:'Sombre, reposant pour les yeux',sw:['#0f131c','#323b50','#f5c542','#121722'],price:0},
    {k:'tableau',n:'Tableau blanc',d:'Clair et sobre, idéal au vidéoprojecteur',sw:['#e4e9ef','#ffffff','#ffe066','#fbfdff'],price:0},
    {k:'contraste',n:'Contraste élevé',d:'Noir, blanc et jaune, très lisible',sw:['#000000','#ffffff','#ffeb3b','#000000'],price:0},
    {k:'ocean',n:'Océan',d:'Lagon, sable et perle turquoise',sw:['#0b4f6c','#fdf6e3','#5eead4','#0b3a53'],price:150},
    {k:'espace',n:'Espace',d:'Étoiles, nébuleuse et soleil',sw:['#0b1026','#eef1f7','#ffb347','#120b2e'],price:200},
    {k:'bonbon',n:'Bonbon',d:'Pastels rose et lilas',sw:['#ffc2d9','#ffffff','#ff8fc2','#c8b6ff'],price:250},
    {k:'prestige',n:'Prestige',d:'Noir, ivoire et or',sw:['#0d0d0d','#fffaf0','#d4af37','#0f3d2e'],price:400},
  ];
  const BOARDS=[['auto','Selon le thème'],['nid','Nid d\'abeille'],['feutre','Feutre'],['ardoise','Ardoise'],['quadrillage','Quadrillage'],['bois','Bois']];
  const XS=[['auto','Selon le thème'],['laiton','Plaque'],['oeuf','Œuf'],['bille','Bille'],['hexa','Écrou'],['etoile','Étoile']];
  const ACCS=['auto','#1e88e5','#e53935','#ff8c42','#f4b400','#2e9e5b','#00a8a8','#6c5ce7','#d6336c'];
  const TOKS=[[1,'Normale'],[1.15,'Grande'],[1.3,'Très grande']];
  const DEF={theme:null,board:'auto',x:'auto',acc:'auto',tok:1};
  let cfg=Object.assign({},DEF);try{Object.assign(cfg,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
  let draft=Object.assign({},cfg); // aperçu en cours, enregistré seulement avec le bouton Enregistrer
  let own={};try{own=JSON.parse(localStorage.getItem(OWN)||'{}')}catch(e){}
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(cfg));localStorage.setItem(OWN,JSON.stringify(own))}catch(e){}};
  let native='etabli',shop=null;
  const find=k=>THEMES.find(t=>t.k===k);
  const owned=k=>{const t=find(k);return!!t&&(t.price===0||k===native||!!own[k])};
  const current=(c=draft)=>c.theme&&owned(c.theme)?c.theme:native;
  function apply(c=draft){
    const b=document.body;if(!b)return;const th=current(c);
    if(th===native)b.removeAttribute('data-theme');else b.dataset.theme=th;
    if(c.board&&c.board!=='auto')b.dataset.board=c.board;else b.removeAttribute('data-board');
    if(c.x&&c.x!=='auto')b.dataset.x=c.x;else b.removeAttribute('data-x');
    if(c.tok&&c.tok!==1){b.dataset.tok='1';b.style.setProperty('--tokz',c.tok)}else{b.removeAttribute('data-tok');b.style.removeProperty('--tokz')}
    if(c.acc&&c.acc!=='auto')b.style.setProperty('--acc',c.acc);else b.style.removeProperty('--acc');
    const m=document.querySelector('meta[name="theme-color"]');if(m){const t=find(th);m.content=t.sw[0]}
    requestAnimationFrame(fit);
  }
  /* opts : {coins:()=>n, spend:(prix)=>bool, onChange:()=>{}} ; sans opts.spend, on ne peut pas acheter ici */
  function init(nat,opts){native=nat;shop=opts||null;apply()}
  function prevHTML(){
    const c=(v,cl='n')=>`<span class="card ${cl}">${v}</span>`;
    return`<div class="scene lookscene"><div class="stage"><div class="sbed"><div class="sp">${c('x','box')}<span class="sign">+</span>${c(3)}<span class="dot">·</span>${c('a','s')}</div><div class="smid">=</div><div class="sp">${c(7)}</div></div></div></div>`;
  }
  function html(){
    const th=current(),coins=shop&&shop.coins?shop.coins():null;
    const dirty=changed();
    return`<div class="looktop"><button class="ghostbtn" data-lk="cancel" data-v="1">◀ Retour${dirty?' sans enregistrer':''}</button><h2>🎨 Apparence</h2>
      <span class="lookstate ${dirty?'dirty':'ok'}">${dirty?'● Modifié, pas encore enregistré':'✔ Tout est enregistré'}</span></div><div class="lookbody">${prevHTML()}
     <h3>Thème</h3><div class="lookgrid">${THEMES.map(t=>{const ok=owned(t.k),on=t.k===th;
       return`<button class="lth${on?' on':''}${ok?'':' locked'}" data-lk="theme" data-v="${t.k}"><span class="sw" style="background:${t.sw[0]}"><i style="background:${t.sw[1]}"></i><i class="x" style="background:${t.sw[2]}"></i><i style="background:${t.sw[3]};outline:2px solid ${t.sw[1]}"></i></span>
        <b>${t.n}${t.k===native?' ★':''}</b><small>${t.d}</small>${ok?'':`<span class="lk">${shop&&shop.spend?'🪙 '+t.price:'🔒'}</span>`}</button>`}).join('')}</div>
     ${coins!==null?`<p><small>🪙 ${coins} pièce${coins>1?'s':''} · les thèmes achetés le sont pour tous les jeux du site.</small></p>`:'<p><small>🔒 Les thèmes verrouillés se débloquent avec les pièces gagnées dans Isole x !</small></p>'}
     <h3>Plateau</h3><div class="lookrow">${BOARDS.map(([k,n])=>`<button class="chip${draft.board===k?' on':''}" data-lk="board" data-v="${k}">${n}</button>`).join('')}</div>
     <h3>Forme de l'inconnue</h3><div class="lookrow">${XS.map(([k,n])=>`<button class="chip${draft.x===k?' on':''}" data-lk="x" data-v="${k}">${n}</button>`).join('')}</div>
     <h3>Couleur des boutons</h3><div class="lookrow">${ACCS.map(c=>`<button class="lsw${c==='auto'?' auto':''}${draft.acc===c?' on':''}" data-lk="acc" data-v="${c}" title="${c==='auto'?'Selon la spécialité ou le thème':c}" style="${c==='auto'?'':'background:'+c}"></button>`).join('')}</div>
     <h3>Taille des jetons</h3><div class="lookrow">${TOKS.map(([v,n])=>`<button class="chip${+draft.tok===v?' on':''}" data-lk="tok" data-v="${v}">${n}</button>`).join('')}</div>
     <div class="lookrow" style="margin-top:14px;justify-content:center"><button class="ghostbtn" data-lk="reset" data-v="1">↺ Tout remettre par défaut</button></div>
     </div><div class="looksave"><small class="lookstate ${dirty?'dirty':'ok'}">${dirty?'● Tes changements sont visibles en aperçu : touche Enregistrer pour les garder.':'✔ Tout est enregistré. Choisis un thème ou un réglage pour l\'essayer.'}</small>
      <button class="ghostbtn" data-lk="cancel" data-v="1">${dirty?'Annuler':'◀ Retour'}</button><button class="bigbtn${dirty?' pulse':''}" data-lk="save" data-v="1"${dirty?'':' disabled'}>💾 Enregistrer</button>
      <small class="lookver">Version du ${BUILD}</small></div>`;
  }
  const changed=()=>JSON.stringify(draft)!==JSON.stringify(cfg);
  /* clic dans la fenêtre : renvoie {msg, act} ; act = 'save' ou 'cancel' quand il faut fermer */
  function click(el){
    const b=el.closest('[data-lk]');if(!b)return null;const k=b.dataset.lk,v=b.dataset.v;let msg='';
    if(k==='save'){if(!changed())return{act:'cancel',msg:''};cfg=Object.assign({},draft);save();apply();if(shop&&shop.onChange)shop.onChange();return{act:'save',msg:'✔ Apparence enregistrée'}}
    if(k==='cancel'){cancel();return{act:'cancel',msg:''}}
    if(k==='theme'){const t=find(v);
      if(!owned(v)){
        if(!(shop&&shop.spend))return{msg:'🔒 Ce thème se débloque avec les pièces gagnées dans Isole x !',warn:1};
        if(!shop.spend(t.price))return{msg:`Il te faut 🪙 ${t.price} pièces pour ce thème.`,warn:1};
        own[v]=1;try{localStorage.setItem(OWN,JSON.stringify(own))}catch(e){}msg=`🎨 Thème « ${t.n} » débloqué ! Touche Enregistrer pour le garder.`}
      draft.theme=v===native?null:v}
    else if(k==='board')draft.board=v;else if(k==='x')draft.x=v;else if(k==='acc')draft.acc=v;else if(k==='tok')draft.tok=+v;
    else if(k==='reset')draft=Object.assign({},DEF);
    apply();return{msg};
  }
  /* annule l'aperçu : revient aux réglages enregistrés */
  function cancel(){draft=Object.assign({},cfg);apply()}
  /* ---------- ajustement automatique : rien ne doit être coupé ---------- */
  const ov=el=>el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1;
  function fit(){
    document.querySelectorAll('#board .content').forEach(el=>{if(!el.offsetParent)return;el.style.fontSize='';let fs=parseFloat(getComputedStyle(el).fontSize),n=0;
      while(ov(el)&&fs>9&&n++<30){fs*=.92;el.style.fontSize=fs+'px'}});
    const rc=document.querySelector('#reaction');if(rc&&rc.offsetParent){const kids=[...rc.children];let z=+(getComputedStyle(document.body).getPropertyValue('--tokz')||1)||1,n=0;
      const set=v=>kids.forEach(k=>k.style.zoom=v);set(z);while(ov(rc)&&z>.45&&n++<30){z*=.92;set(z)}}
    const dk=document.querySelector('#deck');if(dk&&dk.offsetParent){const cards=[...dk.querySelectorAll('.dcard,.dtool')];let z=+(getComputedStyle(document.body).getPropertyValue('--tokz')||1)||1,n=0;
      const set=v=>cards.forEach(k=>k.style.zoom=v);set(z);const H=innerHeight;while(dk.getBoundingClientRect().bottom>H+1&&z>.6&&n++<20){z*=.92;set(z)}}
  }
  /* taille du texte : jamais au point de faire déborder l'écran */
  function textZoom(z){z=+z||1;if(z<=1)return 1;return Math.max(1,Math.min(z,innerWidth/340,innerHeight/540))}
  let rT;addEventListener('resize',()=>{clearTimeout(rT);rT=setTimeout(()=>{if(window.applyOpts)try{applyOpts()}catch(e){}fit()},120)});
  if(window.ResizeObserver)addEventListener('load',()=>{const ro=new ResizeObserver(()=>requestAnimationFrame(fit));['#board','#reaction','#deck'].forEach(q=>{const e=document.querySelector(q);if(e)ro.observe(e)})});
  /* mise à jour automatique : vérifie une nouvelle version à chaque ouverture et recharge la page une fois */
  function sw(){if(!('serviceWorker'in navigator)||!/^https:|^http:\/\/localhost/.test(location.href))return;
    const had=!!navigator.serviceWorker.controller;let done=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had&&!done){done=true;location.reload()}});
    navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>{r.update().catch(()=>{});document.addEventListener('visibilitychange',()=>{if(!document.hidden)r.update().catch(()=>{})})}).catch(()=>{})}
  /* défilement du milieu de la fenêtre (à garder quand on la redessine) */
  const scrollEl=()=>document.querySelector('#mbox .lookbody')||document.querySelector('#mbox');
  return{scrollEl,init,apply,html,click,cancel,fit,textZoom,changed,owned,current,sw,BUILD,THEMES,get cfg(){return cfg}};
})();
