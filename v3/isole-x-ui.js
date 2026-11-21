"use strict";
/* =====================================================================
   INTERFACE ISOLE X ! JUNGLE — rendu, glisser-déposer, menus, modes, tutoriel, aide animée
   ===================================================================== */
const ICONS={
 gear:'<circle cx="32" cy="32" r="9"/><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13.6 13.6l5.7 5.7M44.7 44.7l5.7 5.7M13.6 50.4l5.7-5.7M44.7 19.3l5.7-5.7"/><circle cx="32" cy="32" r="18"/>',
 chip:'<rect x="16" y="16" width="32" height="32" rx="3"/><rect x="25" y="25" width="14" height="14"/><path d="M24 8v8M32 8v8M40 8v8M24 48v8M32 48v8M40 48v8M8 24h8M8 32h8M8 40h8M48 24h8M48 32h8M48 40h8"/>',
 cube:'<path d="M32 8 54 20v24L32 56 10 44V20z"/><path d="M10 20l22 12 22-12M32 32v24"/>',
 bolt:'<path d="M36 6 14 36h16l-4 22 24-32H34z"/>',
 house:'<path d="M8 30 32 10l24 20"/><path d="M14 26v28h36V26"/><rect x="27" y="38" width="10" height="16"/>',
 flask:'<path d="M24 8h16M27 8v16L12 52a3 3 0 0 0 3 4h34a3 3 0 0 0 3-4L37 24V8"/><path d="M18 42h28"/>',
};
const iconSVG=k=>`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ---------- rendu ---------- */
function render(){
  if(SILENT)return;
  const MBx={d:true,box:state.box},pend=state.pending;
  document.querySelectorAll('#board .panel').forEach(p=>{
    const sd=+p.dataset.side;p.querySelector('.content').innerHTML=hSum(state.eq[sd],MBx);
    p.classList.toggle('await',!!pend&&pend.side===sd);
    p.querySelectorAll('.zone').forEach(z=>{z.classList.toggle('off',!!pend&&(pend.side!==sd||pend.op!==z.dataset.zone));
      z.classList.toggle('want',!!pend&&pend.side===sd&&pend.op===z.dataset.zone)});
  });
  const iso=isoSide();
  const max=(iso>=0&&!state.goal&&state.isoAt!=null)?state.isoAt+state.bonusMax:state.par;
  $('#moves').innerHTML=`Coup <b>${state.moves}</b> / ${max??'—'}`;
  $('#goalBig').innerHTML=state.goal?`<span class="glab">🎯 Objectif</span>${mathEq([[T([S(state.target)])],state.goalSum],state.goalRel)}`:'';const em=document.querySelector('.eqmed');if(em){em.textContent=state.rel||'=';em.classList.toggle('ineq',(state.rel||'=')!=='=')}
  $('#goalBig').classList.toggle('hidden',!state.goal);
  const tilt=pend?((1-pend.side)===0?-1:1)*(pend.w||1)*2:0;
  boardEl.style.transform=`rotate(${tilt}deg)`;boardEl.classList.toggle('tilted',!!pend);
  const bar=$('#isobar');
  if(iso>=0&&!state.won&&!pend&&!state.coach){
    bar.classList.remove('hidden');
    if(state.goal){const hh=computeHint();bar.innerHTML=`<span>✅ <b>${esc(state.target)}</b> est isolé, mais il faut arriver exactement à 🎯 ${mathEq([[T([S(state.target)])],state.goalSum],state.goalRel)}.${hh&&hh.act==='dev'?` <b>💡 ${hh.msg}</b>`:' Continue à simplifier !'}</span>`}
    else{const left=Math.max(0,state.isoAt+state.bonusMax-state.moves);
      bar.innerHTML=`<span>✅ <b>${esc(state.target)}</b> est isolé ! ✨ Simplifie au maximum${left?` (encore ${left} coup${left>1?'s':''} bonus)`:''} pour <b>+50 points</b>.</span><button class="bigbtn" id="btnValid">Valider</button>`}
  }else bar.classList.add('hidden');
  $('#mathline').innerHTML=state.trad?`<span class="lab">Équation :</span>${mathEq(state.eq)}`:'';
  $('#mathline').classList.toggle('hidden',!state.trad);
  $('#history').classList.toggle('hidden',!state.trad);
  $('#history').innerHTML='<h3>Traduction pas à pas</h3>'+state.history.map((h,i)=>`<div class="hstep"><div class="d">${i}. ${esc(h.desc)}</div>${mathEq(h.eq,h.rel)}</div>`).join('');
  $('#history').scrollTop=1e6;
  const tipEl=$('#tip');
  if(state.coach){tipEl.classList.add('hidden')}
  else if(state.tip&&!state.tipClosed){tipEl.innerHTML=`<span class="tagacc"></span><span>${state.tip}</span><button id="tipX" title="Fermer">✕</button>`;tipEl.classList.remove('hidden')}
  else tipEl.classList.add('hidden');
  renderDeck();coachCheck();
}
function renderDeck(){
  if(SILENT)return;const pend=state.pending;const MBd={d:false,box:state.box};
  const cards=state.deck.map((c,i)=>{const f=state.flip[i];
    return`<div class="dcard${f?' neg':''}${pend&&pend.op!=='fn'&&pend.idx===i?' want':''}" data-deck="${i}">${f?'<span class="sign">−</span>':''}${hT(c,MBd)}${c.user?`<span class="ddel" data-del="${i}" title="Retirer ce jeton">✕</span>`:''}</div>`}).join('');
  const tools=state.tools.map((t,i)=>`<div class="dtool${pend&&pend.op==='fn'&&pend.tidx===i?' want':''}" data-tool="${i}" title="Outil : appliquer ${esc(toolTxt(t))} aux deux côtés">${toolLab(t)}</div>`).join('');
  $('#deck').innerHTML='<span class="lab">PIOCHE — touche un jeton pour le retourner (±)</span>'+cards+(tools?'<span class="tsep"></span>'+tools:'');
}
function flashDeck(i){if(SILENT)return;const el=document.querySelector(`#deck [data-deck="${i}"]`);if(el){el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash')}}

/* ---------- toast / modales ---------- */
let toastT;
function toast(msg,cls='',ms=3200){if(SILENT)return;const t=$('#toast');t.innerHTML=msg;t.className='show '+cls;clearTimeout(toastT);toastT=setTimeout(()=>t.className=cls,ms)}
function hideToast(){if(SILENT)return;clearTimeout(toastT);$('#toast').className=''}
function fail(msg){if(SILENT)return false;const wi=WHY.findIndex(w=>w.re.test(msg));state.fails=(state.fails||0)+1;toast(msg+(wi>=0?` <button class="whybtn" data-why="${wi}">Pourquoi ?</button>`:'')+(state.fails===3?'<br><small>💡 Besoin d\'aide ? Touche l\'ampoule.</small>':''),'warn',wi>=0?6500:4000);const b=$('#board');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');sfx('fail');petMood('sad');return false}
function modal(html,cls=''){hideToast();$('#mbox').className='mbox '+cls;$('#mbox').innerHTML=html;$('#modal').classList.remove('hidden');animateScenes($('#mbox'))}
function closeModal(){$('#modal').classList.add('hidden');$('#mbox').innerHTML=''}
function starHTML(k){return[1,2,3].map(i=>`<span class="${i<=k?'':'off'}">★</span>`).join('')}
function onWin(){petMood('happy')}
function showWin(){
  if(state.mode==='chrono'){chronoSolved();return}
  if(state.mode==='level'&&state.chain&&state.chain.k<state.chain.n-1){chainStepWin();return}
  if(state.chain&&CHAIN){state.moves+=CHAIN.moves;state.par=(state.par||0)+CHAIN.par}
  const sol=solutionLine();let dbonus=0;if(state.mode==='daily')dbonus=dailyWin();
  const sc=scoreOf();let next='';const before=petStage();
  if(state.mode==='level'){const k=progKey(state.ci,state.li),old=PROG[k]||{s:0,p:0};PROG[k]={s:Math.max(old.s,sc.stars),p:Math.max(old.p,sc.points)};saveProg();
    next=nextLevel()?`<button class="bigbtn" data-act="next">Défi suivant ▶</button>`:''}
  else if(state.mode==='random')next=`<button class="bigbtn" data-act="again">Nouvelle équation 🎲</button>`;
  else if(state.mode==='daily')next=`<button class="bigbtn" data-act="home">Carte ▶</button>`;
  else next=`<button class="bigbtn" data-act="expback">Autre équation 🧪</button>`;
  const S=STATS;S.wins++;S.noHint=state.usedHint?0:S.noHint+1;S.bestNoHint=Math.max(S.bestNoHint,S.noHint);
  if(state.goal)S.goals++;else if(sc.simp)S.simp++;if(sc.stars===3)S.perfect++;saveStats();
  const nb=checkBadges(),after=petStage();
  modal(`<div class="winpet">${creatureSVG(after,'happy')}</div><h2>${esc(state.target)} est isolé ! 🎉</h2>${state.par?`<div class="stars">${starHTML(sc.stars)}</div>`:''}
   <div class="pts">${sc.points} points ${sc.simp?'<span class="simp">✨ simplification maximale +50</span>':'<span class="nosimp">pas simplifié au maximum</span>'}</div>
   <div>${state.moves} coup${state.moves>1?'s':''}${state.par?` — maxi ${state.par} pour ★★★`:''}</div>
   <div class="sol">${mathEq(state.eq)}</div>${sol?`<div class="solline">${sol}</div>`:''}
   ${state.mode==='daily'?`<div class="evo">📅 ${dbonus?`Défi du jour réussi ! Série : <b>${DAILY.streak} jour${DAILY.streak>1?'s':''}</b> · +${dbonus} 🪙`:'Déjà réussi aujourd\'hui : reviens demain !'}</div>`:''}
   ${after>before?`<div class="evo">🎊 Volt a été amélioré : il est maintenant <b>${PET_NAMES[after]}</b> !</div>`:''}
   ${nb.slice(0,2).map(b=>`<div class="newbadge">🏅 Nouveau badge : <b>${b.icon} ${esc(b.name)}</b></div>`).join('')}${nb.length>2?`<div class="newbadge">🏅 … et ${nb.length-2} autre${nb.length>3?'s':''} badge${nb.length>3?'s':''} !</div>`:''}
   <div class="btns"><button class="ghostbtn" data-act="replay">⟲ Rejouer</button><button class="ghostbtn" data-act="menu">Carte</button>${next}</div>`,'win');
  sfx(nb.length||after>before?'badge':'win');confetti(nb.length||after>before?120:70);
}
function nextLevel(){const ch=WORLDS[state.ci];if(state.li+1<ch.levels.length)return[state.ci,state.li+1];if(state.ci+1<WORLDS.length&&unlocked(state.ci+1))return[state.ci+1,0];return null}
$('#modal').addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b){if(e.target.id==='modal'&&!state.won){closeModal();introDone()}return}
  const a=b.dataset.act;
  if(a==='close'){closeModal();introDone();return}
  if(a==='tuto'){closeModal();SEEN.coach_tuto1=false;startLevel(0,0);return}
  closeModal();
  if(a==='step'){startLevel(state.ci,state.li,state.chain.k+1);return}
  if(a==='shop'){showShop();return}
  if(a==='next'){const nx=nextLevel();startLevel(nx[0],nx[1])}
  else if(a==='replay')replay();
  else if(a==='again')startRandom();
  else if(a==='chrono')startChrono();
  else if(a==='expback')showExp();
  else if(a==='menu')backFromGame();
  else if(a==='home')toHome();
});
let lastSetup=null;
function replay(){if(state.mode==='level')startLevel(state.ci,state.li);else if(state.mode==='daily')startDaily();else if(state.mode==='chrono')startChrono();else if(lastSetup)setup(Object.assign({},lastSetup,{eq:clone(lastSetup.eq0),coach:null,intro:null}))}

/* ---------- glisser-déposer (souris + tactile) ---------- */
const boardEl=$('#board'),deckEl=$('#deck');
let drag=null,hotEl=null;
$('#game').addEventListener('pointerdown',e=>{
  if(state.won||e.button>0)return;
  const del=e.target.closest('[data-del]');if(del){e.preventDefault();removeDeckCard(+del.dataset.del);return}
  const el=e.target.closest('[data-deck],[data-tool],[data-fid],[data-tid]');
  if(!el||!(boardEl.contains(el)||deckEl.contains(el)))return;
  e.preventDefault();
  const kind=el.dataset.deck!==undefined?'deck':el.dataset.tool!==undefined?'tool':'board';
  let gsrc=el;
  if(kind==='board'){if(!el.dataset.fid)gsrc=el.closest('.term')||el;
    if(el.classList.contains('ftab')||el.classList.contains('fname')||el.classList.contains('fsup'))gsrc=el.closest('.fbox,.fpl');
    if(el.classList.contains('par')&&el.dataset.dev)gsrc=el.closest('.grp')}
  drag={el,gsrc,x0:e.clientX,y0:e.clientY,moved:false,kind,src:kind==='deck'?+el.dataset.deck:kind==='tool'?+el.dataset.tool:(el.dataset.fid||el.dataset.tid),dev:el.dataset.dev,fn:el.dataset.fn};
  window.addEventListener('pointermove',onMove);window.addEventListener('pointerup',onUp);window.addEventListener('pointercancel',onCancel);
});
function onMove(e){
  if(!drag)return;
  if(!drag.moved){if(Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<7)return;
    drag.moved=true;const g=document.createElement('div');g.className='ghost';g.innerHTML=drag.gsrc.outerHTML;document.body.appendChild(g);drag.ghost=g;
    drag.gsrc.classList.add('lifted');document.body.classList.add(drag.kind==='deck'?'dragdeck':drag.kind==='tool'?'dragtool':'dragboard')}
  drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';setHot(dropTarget(e.clientX,e.clientY));
}
function dropTarget(cx,cy){
  const h=document.elementFromPoint(cx,cy);if(!h)return null;
  if(drag.kind==='deck'){const dc=h.closest('[data-deck]');if(dc&&+dc.dataset.deck!==drag.src)return dc;return h.closest('[data-zone]:not([data-zone="fn"])')}
  if(drag.kind==='tool')return h.closest('[data-zone="fn"]');
  if(deckEl.contains(h))return deckEl;
  const t=h.closest('[data-fid],[data-tid]');if(t&&boardEl.contains(t)&&!drag.gsrc.contains(t))return t;return null;
}
function setHot(el){if(hotEl===el)return;if(hotEl)hotEl.classList.remove('hot');hotEl=el;if(el)el.classList.add('hot')}
function endDrag(){window.removeEventListener('pointermove',onMove);window.removeEventListener('pointerup',onUp);window.removeEventListener('pointercancel',onCancel);
  if(drag&&drag.ghost)drag.ghost.remove();if(drag)drag.gsrc.classList.remove('lifted');document.body.classList.remove('dragdeck','dragboard','dragtool');setHot(null)}
function onCancel(){endDrag();drag=null}
function onUp(e){
  const d=drag;if(!d)return;const tgt=d.moved?dropTarget(e.clientX,e.clientY):null;endDrag();drag=null;
  if(!d.moved){
    if(d.kind==='deck'){state.flip[d.src]=!state.flip[d.src];renderDeck();coachCheck()}
    else if(d.kind==='tool')toast("Glisse l'outil sur un côté du plateau : il s'appliquera à tout ce côté.");
    else if(d.fn)tapFn(d.fn);
    else if(d.dev)develop(d.dev);
    return;
  }
  if(!tgt)return;
  if(d.kind==='deck'&&tgt.dataset.deck!==undefined)combineDeck(d.src,+tgt.dataset.deck);
  else if(d.kind==='deck')doDeck(+tgt.closest('.panel').dataset.side,tgt.dataset.zone,d.src);
  else if(d.kind==='tool')doTool(+tgt.closest('.panel').dataset.side,d.src);
  else if(tgt===deckEl)copyToDeck(d.src);
  else boardDrop(d.src,tgt.dataset.fid||tgt.dataset.tid);
}

/* ---------- toucher une fonction : simple = simplifier, double = libérer la puissance ---------- */
let lastTap={id:null,t:0},tapTimer=null;
function tapFn(id){
  const l=locate(id);if(!l||!l.f)return;const f=l.f,now=Date.now();
  if(f.fn==='pow'){
    if(lastTap.id===id&&now-lastTap.t<450){clearTimeout(tapTimer);lastTap={id:null,t:0};expandPow(id);return}
    lastTap={id,t:now};clearTimeout(tapTimer);
    if(canTapFn(f)){tapTimer=setTimeout(()=>simplifyFn(id),460);return}
    tapTimer=setTimeout(()=>toast(`Double-touche <b>${esc(textF(f))}</b> pour l'écrire en produit.`),460);return;
  }
  simplifyFn(id);
}
$('#game').addEventListener('dblclick',e=>e.preventDefault());
/* ---------- opérations intermédiaires dans la pioche ---------- */
function combineDeck(a,b){
  if(state.pending)return fail(`Termine d'abord : <b>${state.pending.label}</b> de l'autre côté.`);
  const ca=clone(state.deck[a]),cb=clone(state.deck[b]);if(state.flip[a])ca.neg=!ca.neg;if(state.flip[b])cb.neg=!cb.neg;
  const va=numVal([ca]),vb=numVal([cb]);let card;
  if(va&&vb&&!va.pi&&!vb.pi){const p=va.p*vb.q+vb.p*va.q,q=va.q*vb.q;const r=resTerms({p:p/gcd(p,q),q:q/gcd(p,q),pi:0});card=r.length?r[0]:T([N(0)])}
  else card=T([G([reid(cb),reid(ca)])]);
  const neg=card.neg;card.neg=false;card.user=true;
  if(state.deck.some(c=>keyT(c)===keyT(card))){toast('Ce jeton existe déjà dans la pioche.');return}
  if(state.deck.length>=14)return fail('La pioche est pleine : retire un jeton avec ✕.');
  state.deck.push(card);state.flip.push(neg);renderDeck();flashDeck(state.deck.length-1);
  toast(`Nouveau jeton : <b>${esc((neg?'−':'')+textT(card,false))}</b> (opération dans la pioche, ça ne compte pas comme un coup).`);
}
function removeDeckCard(i){if(state.pending)return fail('Termine d’abord l’opération en cours.');state.deck.splice(i,1);state.flip.splice(i,1);renderDeck()}

/* ---------- indice ---------- */
function hint(){
  if(state.won)return;
  if(state.pending){if(state.pending.op==='fn')toast(`Applique <b>${state.pending.label}</b> de l'autre côté aussi.`,'hintt');else{flashDeck(state.pending.idx);toast(`Fais la même chose de l'autre côté : <b>${state.pending.label}</b>.`,'hintt')}return}
  const h=computeHint();
  if(h.act==='validate'){toast('💡 '+h.msg,'hintt');return}
  h.ids.forEach(id=>{document.querySelectorAll(`#board [data-fid="${id}"],#board [data-tid="${id}"]`).forEach(el=>{el.classList.remove('hint');void el.offsetWidth;el.classList.add('hint')})});
  if(h.deck){const i=deckHas(h.deck);if(i>=0)flashDeck(i);else if(h.addCard){state.deck.push(clone(h.deck));state.flip.push(false);renderDeck();flashDeck(state.deck.length-1)}}
  if(h.tool){const i=state.tools.findIndex(t=>t.fn===h.tool.fn&&t.n===h.tool.n);const el=document.querySelector(`#deck [data-tool="${i}"]`);if(el){el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash')}}
  toast('💡 '+h.msg,'hintt',6000);
}

/* ---------- progression, créature, badges ---------- */
let STATS={wins:0,noHint:0,bestNoHint:0,simp:0,goals:0,perfect:0,chronoBest:0};
try{Object.assign(STATS,JSON.parse(localStorage.getItem('isoleX_college2_stats')||'{}'))}catch(e){}
const saveStats=()=>{try{localStorage.setItem('isoleX_college2_stats',JSON.stringify(STATS))}catch(e){}};
let OPTS={mute:false};try{Object.assign(OPTS,JSON.parse(localStorage.getItem('isoleX_college2_opts')||'{}'))}catch(e){}
/* mode professeur : protégé par un code, jamais enregistré (s'éteint à la fermeture de la page) */
let TEACHER=false;delete OPTS.teacher;
const PROF_H='ba760f62';
const profHash=c=>{let h=2166136261;for(const ch of 'volt-atelier|'+c){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h.toString(16)};
let profFails=0,profLockUntil=0;
const saveOpts=()=>{try{localStorage.setItem('isoleX_college2_opts',JSON.stringify(OPTS))}catch(e){}};
let GOT={};try{GOT=JSON.parse(localStorage.getItem('isoleX_college2_badges')||'{}')}catch(e){}
const saveGot=()=>{try{localStorage.setItem('isoleX_college2_badges',JSON.stringify(GOT))}catch(e){}};
const worldStars=i=>WORLDS[i].levels.reduce((a,_,li)=>a+((PROG[progKey(i,li)]||{}).s||0),0);
const worldPts=i=>WORLDS[i].levels.reduce((a,_,li)=>a+((PROG[progKey(i,li)]||{}).p||0),0);
const worldDone=i=>WORLDS[i].levels.every((_,li)=>PROG[progKey(i,li)]);
const totalStars=()=>WORLDS.reduce((a,_,i)=>a+worldStars(i),0);
const maxStars=i=>WORLDS[i]?WORLDS[i].levels.length*3:30;
const need=i=>Math.ceil(maxStars(prevWorld(i))/2); // la moitié des étoiles du chapitre précédent
const unlocked=i=>TEACHER||i===0||worldStars(prevWorld(i))>=need(i);
const PET_STEPS=[0,5,25,60,120,200];
const PET_NAMES=['un kit à monter','un prototype','un petit robot','un robot','un grand robot','légendaire'];
const petStage=()=>{const t=totalStars();let s=0;PET_STEPS.forEach((v,i)=>{if(t>=v)s=i});return s};
const BADGES=[
 {k:'first',icon:'🥚',name:'Premier défi',d:'Réussir un premier défi',ok:()=>STATS.wins>=1},
 {k:'w10',icon:'⭐',name:'Dix défis',d:'Réussir 10 défis',ok:()=>STATS.wins>=10},
 {k:'w50',icon:'🌟',name:'Cinquante défis',d:'Réussir 50 défis',ok:()=>STATS.wins>=50},
 {k:'perf10',icon:'💎',name:'Sans faute',d:'10 défis réussis avec ★★★',ok:()=>STATS.perfect>=10},
 {k:'nohint5',icon:'🧠',name:'Cerveau de l\'atelier',d:'5 défis de suite sans indice',ok:()=>STATS.bestNoHint>=5},
 {k:'simp10',icon:'✨',name:'Simplificateur',d:'10 simplifications maximales',ok:()=>STATS.simp>=10},
 {k:'goal10',icon:'🎯',name:"Tireur d'élite",d:'10 résultats précis atteints',ok:()=>STATS.goals>=10},
 {k:'ch5',icon:'⚡',name:'Éclair',d:'5 équations en un défi chrono',ok:()=>STATS.chronoBest>=5},
 {k:'ch12',icon:'🌩️',name:'Tempête',d:'12 équations en un défi chrono',ok:()=>STATS.chronoBest>=12},
 ...['Addition','Multiplication','Équations mixtes','Développer','Puissances','Exp et ln','Trigonométrie','Complexes','Formules de spécialité','Problèmes','Inéquations'].map((n,i)=>({k:'world'+i,icon:['＋','×','±','( )','√','eˣ','∿','ℂ','ƒ','📖','<'][i],name:'Maître : '+n,d:'Réussir tous les défis du chapitre',ok:()=>WORLDS[i]&&worldDone(i)})),
 {k:'detective',icon:'🔎',name:'Détective',d:'5 problèmes bien traduits du premier coup',ok:()=>(STATS.storyFirst||0)>=5},
 {k:'day3',icon:'📅',name:'Fidèle',d:'Défi du jour 3 jours de suite',ok:()=>DAILY.best>=3},
 {k:'day7',icon:'🗓️',name:'Inarrêtable',d:'Défi du jour 7 jours de suite',ok:()=>DAILY.best>=7},
 {k:'style',icon:'🛍️',name:'Volt customisé',d:'Acheter un objet à la boutique',ok:()=>Object.keys(SHOP.owned).length>=1},
 {k:'legend',icon:'👑',name:'Légende de l\'atelier',d:'Volt devient légendaire',ok:()=>petStage()>=5},
];
function checkBadges(){const nb=[];BADGES.forEach(b=>{if(!GOT[b.k]&&b.ok()){GOT[b.k]=Date.now();nb.push(b)}});if(nb.length)saveGot();return nb}
function creatureSVG(stage,mood='idle'){
  const C=eqItem('color')||{},col=C.col||'#b8c2cc',dark=C.dark||'#4b535b',belly=C.belly||'#e9edf0';
  if(stage===0)return`<svg viewBox="0 0 120 120" class="pet st0 ${mood}" aria-label="Caisse de pièces de Volt"><ellipse cx="60" cy="112" rx="38" ry="6" fill="rgba(0,0,0,.3)"/>
    ${totalStars()>=3?`<path d="M60 42v-14" stroke="#4b535b" stroke-width="3"/><circle cx="60" cy="25" r="5" fill="#ff3b2f" class="blink"/>`:''}
    <rect x="22" y="44" width="76" height="64" rx="6" fill="#c08a4f" stroke="#5b3a1c" stroke-width="3"/><path d="M22 66h76M22 88h76" stroke="#8a5a2b" stroke-width="3"/>
    <path d="M26 48l68 56M94 48l-68 56" stroke="#8a5a2b" stroke-width="3" opacity=".6"/>
    <g transform="translate(60 76)"><circle r="12" fill="#d9dde1" stroke="#5f676f" stroke-width="2.5"/><circle r="4.5" fill="#5f676f"/>${[0,45,90,135,180,225,270,315].map(a=>`<rect x="-3" y="-16" width="6" height="6" rx="1" fill="#d9dde1" stroke="#5f676f" stroke-width="2" transform="rotate(${a})"/>`).join('')}</g>
    <circle cx="30" cy="52" r="2.5" fill="#5b3a1c"/><circle cx="90" cy="52" r="2.5" fill="#5b3a1c"/><circle cx="30" cy="100" r="2.5" fill="#5b3a1c"/><circle cx="90" cy="100" r="2.5" fill="#5b3a1c"/>
    <text x="60" y="61" text-anchor="middle" font-family="Chakra Petch,sans-serif" font-weight="700" font-size="9" fill="#5b3a1c">KIT VOLT</text></svg>`;
  const r=20+stage*3,cy=108-1.5*r,top=cy-r*.6,ex=r*.4,ey=cy-r*.08,er=r*.2;
  const eye=x=>mood==='happy'?`<path d="M${x-er} ${ey+er*.3}q${er} -${er*1.6} ${er*2} 0" fill="none" stroke="#3df5ff" stroke-width="3.4" stroke-linecap="round"/>`
    :mood==='sad'?`<rect x="${x-er}" y="${ey-er*.2}" width="${er*2}" height="${er*.8}" rx="${er*.4}" fill="#3df5ff"/>`
    :`<circle cx="${x}" cy="${ey}" r="${er}" fill="#0d2a33"/><circle cx="${x}" cy="${ey}" r="${er*.72}" fill="#3df5ff"/><circle cx="${x+er*.3}" cy="${ey-er*.3}" r="${er*.22}" fill="#fff"/>`;
  const mouth=mood==='happy'?`<path d="M${60-r*.32} ${cy+r*.24}q${r*.32} ${r*.3} ${r*.64} 0" fill="none" stroke="#3df5ff" stroke-width="3" stroke-linecap="round"/>`
    :mood==='sad'?`<path d="M${60-r*.28} ${cy+r*.36}q${r*.28} -${r*.2} ${r*.56} 0" fill="none" stroke="#3df5ff" stroke-width="3" stroke-linecap="round"/>`
    :`<rect x="${60-r*.34}" y="${cy+r*.22}" width="${r*.68}" height="${r*.16}" rx="${r*.06}" fill="#0d2a33"/>${[0,1,2,3].map(k=>`<rect x="${60-r*.3+k*r*.16}" y="${cy+r*.25}" width="${r*.1}" height="${r*.1}" fill="#3df5ff" opacity="${k%2?.5:1}"/>`).join('')}`;
  const bTop=cy+r*.62,bH=r*.82,bW=r*1.5;
  return`<svg viewBox="0 0 120 120" class="pet st${stage} ${mood}" aria-label="Volt"><ellipse cx="60" cy="113" rx="${r*.95}" ry="5" fill="rgba(0,0,0,.3)"/>
   ${stage>=5?`<ellipse cx="60" cy="${top-r*.28}" rx="${r*.7}" ry="${r*.16}" fill="none" stroke="#ffd23f" stroke-width="3"/><circle cx="20" cy="30" r="2.5" fill="#ffe680"/><circle cx="100" cy="22" r="3" fill="#ffe680"/><circle cx="98" cy="74" r="2" fill="#ffe680"/>`:''}
   ${stage>=4?`<path d="M${60-bW*.5} ${bTop+bH*.9}l-${r*.12} ${r*.4}h${r*.24}z M${60+bW*.5} ${bTop+bH*.9}l-${r*.12} ${r*.4}h${r*.24}z" fill="#ff8c42" class="flame"/><rect x="${60-bW*.5-r*.22}" y="${bTop+r*.05}" width="${r*.22}" height="${bH*.9}" rx="${r*.06}" fill="${dark}"/><rect x="${60+bW*.5}" y="${bTop+r*.05}" width="${r*.22}" height="${bH*.9}" rx="${r*.06}" fill="${dark}"/>`:''}
   ${stage<=2?`<circle cx="${60-r*.42}" cy="${bTop+bH+r*.12}" r="${r*.2}" fill="#2b2f33" stroke="#5f676f" stroke-width="2"/><circle cx="${60+r*.42}" cy="${bTop+bH+r*.12}" r="${r*.2}" fill="#2b2f33" stroke="#5f676f" stroke-width="2"/>`
     :`<rect x="${60-r*.48}" y="${bTop+bH-2}" width="${r*.2}" height="${r*.3}" fill="${dark}"/><rect x="${60+r*.28}" y="${bTop+bH-2}" width="${r*.2}" height="${r*.3}" fill="${dark}"/><rect x="${60-r*.62}" y="${bTop+bH+r*.24}" width="${r*.44}" height="${r*.14}" rx="${r*.06}" fill="#2b2f33"/><rect x="${60+r*.18}" y="${bTop+bH+r*.24}" width="${r*.44}" height="${r*.14}" rx="${r*.06}" fill="#2b2f33"/>`}
   ${stage>=2?`<path d="M${60-bW*.5} ${bTop+r*.2}q-${r*.45} ${r*.1} -${r*.5} ${r*.55}" stroke="${dark}" stroke-width="${r*.14}" fill="none" stroke-linecap="round"/><path d="M${60+bW*.5} ${bTop+r*.2}q${r*.45} ${r*.1} ${r*.5} ${r*.55}" stroke="${dark}" stroke-width="${r*.14}" fill="none" stroke-linecap="round"/><circle cx="${60-bW*.5-r*.5}" cy="${bTop+r*.8}" r="${r*.12}" fill="#c9982e"/><circle cx="${60+bW*.5+r*.5}" cy="${bTop+r*.8}" r="${r*.12}" fill="#c9982e"/>`:''}
   <rect x="${60-bW/2}" y="${bTop}" width="${bW}" height="${bH}" rx="${r*.18}" fill="${col}" stroke="${dark}" stroke-width="2.5"/>
   <rect x="${60-bW*.3}" y="${bTop+bH*.18}" width="${bW*.6}" height="${bH*.6}" rx="${r*.08}" fill="${belly}" stroke="${dark}" stroke-width="1.5"/>
   <circle cx="${60-bW*.12}" cy="${bTop+bH*.48}" r="${r*.08}" fill="#ff3b2f"/><circle cx="${60+bW*.12}" cy="${bTop+bH*.48}" r="${r*.08}" fill="#2e9e5b"/>
   <rect x="${60-r*.14}" y="${cy+r*.55}" width="${r*.28}" height="${r*.12}" fill="${dark}"/>
   ${stage>=1?`<path d="M60 ${top}v-${r*.38}" stroke="${dark}" stroke-width="2.5"/><circle cx="60" cy="${top-r*.42}" r="${r*.11}" fill="#ff3b2f" class="blink"/>`:''}
   ${stage>=3?`<rect x="${60-r*1.06}" y="${cy-r*.22}" width="${r*.14}" height="${r*.44}" rx="${r*.05}" fill="${dark}"/><rect x="${60+r*.92}" y="${cy-r*.22}" width="${r*.14}" height="${r*.44}" rx="${r*.05}" fill="${dark}"/>`:''}
   <rect x="${60-r*.95}" y="${top}" width="${r*1.9}" height="${r*1.2}" rx="${r*.3}" fill="${col}" stroke="${dark}" stroke-width="2.5"/>
   <rect x="${60-r*.78}" y="${top+r*.14}" width="${r*1.56}" height="${r*.92}" rx="${r*.2}" fill="#16343d"/>
   ${eye(60-ex)}${eye(60+ex)}${mouth}${mood==='sad'?`<path d="M${60+ex+er*.6} ${ey+er*1.1}q3 6 0 9q-3 -3 0 -9z" fill="#7ad7ff"/>`:''}
   ${accSVG({r,cy,top,ex,ey,er})}</svg>`;
}
let petT;
function petMood(m){const el=$('#pet');if(!el||SILENT)return;el.innerHTML=creatureSVG(petStage(),m);el.className='petmini '+m;clearTimeout(petT);petT=setTimeout(()=>{el.innerHTML=creatureSVG(petStage(),'idle');el.className='petmini'},1400)}

/* ---------- sons et confettis ---------- */
let AC=null;
function sfx(k){if(OPTS.mute||SILENT)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime;
  const N=(f,d,type='sine',v=.13,at=0)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,t+at);g.gain.exponentialRampToValueAtTime(.001,t+at+d);o.connect(g);g.connect(AC.destination);o.start(t+at);o.stop(t+at+d+.02)};
  switch(k){case'pop':N(520,.09,'triangle');break;case'merge':N(660,.08,'triangle');N(990,.12,'triangle',.11,.07);break;case'fail':N(200,.2,'sawtooth',.06);N(150,.22,'sawtooth',.05,.08);break;
    case'win':[523,659,784,1046].forEach((f,i)=>N(f,.28,'triangle',.12,i*.09));break;case'badge':[784,988,1175,1568,1976].forEach((f,i)=>N(f,.34,'sine',.11,i*.1));break;case'flip':N(420,.05,'square',.04);break;case'tick':N(880,.04,'square',.03);break}}catch(e){}}
function confetti(n=70){if(SILENT||OPTS.calm||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const cols=['#ff6b6b','#ffd23f','#7cc242','#4ea8de','#b388eb','#ff8c42'];
  for(let i=0;i<n;i++){const d=document.createElement('i');d.className='conf';d.style.background=cols[i%cols.length];d.style.left=(Math.random()*100)+'vw';document.body.appendChild(d);
    const x=(Math.random()-.5)*240,rot=Math.random()*720;d.animate([{transform:'translate(0,-20px) rotate(0)'},{transform:`translate(${x}px,${innerHeight+40}px) rotate(${rot}deg)`}],{duration:1600+Math.random()*1400,easing:'cubic-bezier(.2,.6,.4,1)',delay:Math.random()*300}).onfinish=()=>d.remove()}}

/* ---------- écrans ---------- */
function showScreen(id){hideToast();['home','menu','world','train','game','exp'].forEach(k=>$('#'+k).classList.toggle('hidden',k!==id));if(id!=='game'){stopCoach();stopChrono(false)}window.scrollTo(0,0)}
function toHome(){closeModal();renderHome();showScreen('home')}
function toMenu(){closeModal();renderMenu();showScreen('menu')}
function backFromGame(){if(state.mode==='exp')showExp();else if(state.mode==='level')toWorld(state.ci);else if(state.mode==='random')showTrain();else toHome()}
function renderHome(){
  const st=petStage(),t=totalStars(),nxt=PET_STEPS[st+1];
  $('#petCard').innerHTML=`<div class="bigpet">${creatureSVG(st,'idle')}</div><div class="petinfo"><div class="petname">Volt <span>${PET_NAMES[st]}</span></div>
    <div class="petbar"><i style="width:${nxt?Math.round(100*(t-PET_STEPS[st])/(nxt-PET_STEPS[st])):100}%"></i></div>
    <div class="petnext">★ ${t} étoile${t>1?'s':''}${nxt?` · encore ${nxt-t} pour l'améliorer`:' · niveau maximum !'}</div></div>`;
  $('#homeBtns').innerHTML=`<button class="hb" data-h="badges">🏅<b>Badges</b><small>${Object.keys(GOT).length}/${BADGES.length}</small></button>
    <button class="hb" data-h="chrono">⚡<b>Défi chrono</b><small>record : ${STATS.chronoBest}</small></button>
    <button class="hb" data-h="train">🎲<b>Entraînement</b><small>par thème</small></button>
    <button class="hb" data-h="exp">🧪<b>Mode expérimental</b><small>ton équation</small></button>
    <button class="hb${dailyDone()?' done':''}" data-h="daily">📅<b>Défi du jour</b><small>${dailyDone()?'✔ réussi · ':''}série : ${curStreak()} 🔥</small></button>
    <button class="hb" data-h="shop">🛍️<b>Boutique</b><small>🪙 ${coins()}</small></button>`;
  document.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>({badges:showBadges,chrono:startChrono,train:showTrain,exp:showExp,daily:startDaily,shop:showShop})[b.dataset.h]());
  const tile=k=>{const sp=SPECS[k];let st=0,pts=0;chaptersFor(k).forEach((ch,ci)=>ch.levels.forEach((_,li)=>{const p=PROG[k+'|'+ci+'-'+li];if(p){st+=p.s;pts+=p.p}}));
    return`<button class="spec${k===state.spec?' cur':''}" data-spec="${k}" style="--c:${sp.acc}"><span class="specicon">${iconSVG(sp.icon)}</span><span class="sname">${esc(sp.name)}</span><span class="sfull">${esc(sp.full)}</span><span class="sstar">★ ${st} · ${pts} pts</span></button>`};
  $('#specSI').innerHTML=tile('si');$('#specSTI').innerHTML=['sin','itec','ee','ac'].map(tile).join('');
  document.querySelectorAll('[data-spec]').forEach(b=>b.onclick=()=>{setSpec(b.dataset.spec);toMenu()});
  $('#btnMute').textContent=OPTS.mute?'🔇':'🔊';$('#optTeacher').checked=TEACHER;
}
function chaptersFor(k){const o=state.spec;state.spec=k;const r=chapters();state.spec=o;return r}
function setSpec(k){if(!SPECS[k])k='sin';state.spec=k;document.documentElement.style.setProperty('--acc',SPECS[k].acc);try{localStorage.setItem('isoleX_spec',k)}catch(e){}refreshWorlds()}
function renderMenu(){
  const sp=SPECS[state.spec];
  $('#specHead').innerHTML=`<span class="specicon">${iconSVG(sp.icon)}</span><div><div class="kicker">${esc(sp.cls)}</div><h1>${esc(sp.name)} <span>${esc(sp.full)}</span></h1></div>`;
  $('#worlds').innerHTML=WORLDS.map((w,i)=>{const s=worldStars(i),u=unlocked(i);
    return`<button class="wtile${u?'':' locked'}" data-w="${i}" style="--wc:${w.color}"><span class="wnum">${i+1}</span><span class="wicon">${w.icon}</span><span class="wname">${esc(w.name)}</span>
      <span class="wbar"><i style="width:${Math.round(100*s/maxStars(i))}%"></i></span><span class="wstar">★ ${s}/${maxStars(i)}</span>${u?'':`<span class="wlock">🔒 ${need(i)} ★ dans le chapitre ${prevWorld(i)+1}</span>`}</button>`}).join('');
  document.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{const i=+b.dataset.w;if(!unlocked(i)){sfx('fail');toast(`🔒 Gagne ${need(i)} étoiles dans le chapitre ${prevWorld(i)+1} pour ouvrir celui-ci (tu en as ${worldStars(prevWorld(i))}).`,'warn');return}toWorld(i)});
}
function toWorld(i){closeModal();state.ci=i;const w=WORLDS[i];document.documentElement.style.setProperty('--wc',w.color);
  $('#worldHead').innerHTML=`<span class="wbig">${w.icon}</span><div><div class="kicker">${esc(SPECS[state.spec].name)} · chapitre ${i+1}</div><h1>${esc(w.name)}</h1><div class="kicker">★ ${worldStars(i)}/${maxStars(i)} · ${worldPts(i)} points</div></div>`;
  $('#stones').innerHTML=w.levels.map((lv,li)=>{const p=PROG[progKey(i,li)];const s=p?p.s:0;
    return`<button class="stone${p?' done':''}${li===w.levels.length-1?' ultime':''}" data-l="${li}" style="--i:${li}"><span class="snum">${li===w.levels.length-1?'👑':w.formula||w.story?esc(lv.t||li+1):li+1}</span><small>${'★'.repeat(s)+'☆'.repeat(3-s)}</small>${lv.goal?'<i>🎯</i>':''}</button>`}).join('');
  document.querySelectorAll('.stone').forEach(b=>b.onclick=()=>startLevel(i,+b.dataset.l));
  showScreen('world');
}
function showBadges(){modal(`<h2>🏅 Badges</h2><div class="badges">${BADGES.map(b=>`<div class="bdg${GOT[b.k]?' got':''}"><span class="bi">${GOT[b.k]?b.icon:'❔'}</span><b>${esc(b.name)}</b><small>${esc(b.d)}</small></div>`).join('')}</div>
  <div class="btns"><button class="bigbtn" data-act="close">Fermer</button></div>`,'badgesbox')}
let genDiff=0,genThemes=new Set(['add']);
function showTrain(){renderTrain();showScreen('train')}
function renderTrain(){
  const av=THEMES.filter((t,i)=>unlocked(i));[...genThemes].forEach(k=>{if(!av.some(t=>t.k===k))genThemes.delete(k)});if(!genThemes.size)genThemes.add(av[0].k);
  $('#themeChips').innerHTML=av.map(t=>`<button class="chip${genThemes.has(t.k)?' on':''}" data-theme="${t.k}">${genThemes.has(t.k)?'☑':'☐'} ${t.icon} ${esc(t.n)}</button>`).join('');
  document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{const k=b.dataset.theme;if(genThemes.has(k)){if(genThemes.size>1)genThemes.delete(k)}else genThemes.add(k);renderTrain()});
  document.querySelectorAll('[data-diff]').forEach(b=>{b.classList.toggle('on',+b.dataset.diff===genDiff);b.onclick=()=>{genDiff=+b.dataset.diff;renderTrain()}});
}
function genEq(th,d){let g,tries=0;do{g=genTheme(th,d);tries++;try{g.eq=parseEq(g.e);g.ok=true}catch(e){g.ok=false}}while(!g.ok&&tries<10);return g}
function startRandom(){
  const th=pick([...genThemes]);const g=genEq(th,genDiff);
  state.mode='random';const o={eq:g.eq,rel:parseRel(g.e),target:g.t||(th==='cplx'?'z':'x'),goal:g.goal,tip:g.tip||'',box:genDiff===0,label:'🎲',title:SPECS[state.spec].name+' · Entraînement · '+THEMES.find(t=>t.k===th).n+' · '+['Facile','Moyen','Difficile'][genDiff]};
  lastSetup=Object.assign({},o,{eq0:clone(g.eq)});setup(o);
}
/* ---------- défi chrono ---------- */
let CHR=null,chrT=null;
function startChrono(){
  stopChrono(false);const th=THEMES.filter((t,i)=>unlocked(i)&&!['formula','story'].includes(t.k)).map(t=>t.k);
  CHR={end:Date.now()+120000,solved:0,themes:th.length?th:['add']};state.mode='chrono';nextChrono();
  $('#chrono').classList.remove('hidden');chrT=setInterval(tickChrono,250);tickChrono();
}
function nextChrono(){if(!CHR)return;const d=CHR.solved<3?0:CHR.solved<7?1:2;const th=pick(CHR.themes);const g=genEq(th,d);
  setup({eq:g.eq,rel:parseRel(g.e),target:g.t||(th==='cplx'?'z':'x'),goal:g.goal,box:d===0,label:'⚡ '+(CHR.solved+1),title:'Défi chrono · '+CHR.solved+' réussie'+(CHR.solved>1?'s':''),tip:''})}
function chronoSolved(){if(!CHR)return;CHR.solved++;sfx('win');confetti(35);if(Date.now()<CHR.end)setTimeout(nextChrono,450)}
function tickChrono(){if(!CHR)return;const left=Math.max(0,CHR.end-Date.now());const s=Math.ceil(left/1000);
  $('#chrono').textContent=`⏱ ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;$('#chrono').classList.toggle('hurry',s<=15);
  if(s<=5&&s>0&&Math.abs(left%1000-0)<260)sfx('tick');if(left<=0)stopChrono(true)}
function stopChrono(show){if(!CHR){clearInterval(chrT);return}clearInterval(chrT);const n=CHR.solved;CHR=null;$('#chrono').classList.add('hidden');if(!show)return;
  state.won=true;const rec=n>STATS.chronoBest;STATS.chronoBest=Math.max(STATS.chronoBest,n);saveStats();const nb=checkBadges();
  modal(`<div class="winpet">${creatureSVG(petStage(),n?'happy':'sad')}</div><h2>⏱ Temps écoulé !</h2><div class="pts">${n} équation${n>1?'s':''} résolue${n>1?'s':''} en 2 minutes</div>
   <div>${rec?'🏆 Nouveau record !':'Record : '+STATS.chronoBest}</div>${nb.map(b=>`<div class="newbadge">🏅 Nouveau badge : <b>${b.icon} ${esc(b.name)}</b></div>`).join('')}
   <div class="btns"><button class="ghostbtn" data-act="home">Carte</button><button class="bigbtn" data-act="chrono">Rejouer ⚡</button></div>`,'win');
  sfx(rec||nb.length?'badge':'win');if(n)confetti(rec?120:50);
}

/* ---------- mode expérimental ---------- */
let expSel=null;
const EXAMPLES=['3x+2=11','x^2-5=20','e^(2x)=9','U=R*I','2sin(x)=1','(1+i)*z=2','P=U^2/R','2x-3<7'];
function showExp(){showScreen('exp');$('#expEx').innerHTML=EXAMPLES.map(e=>`<button class="chip" data-ex="${esc(e)}">${esc(e)}</button>`).join('');
  document.querySelectorAll('[data-ex]').forEach(b=>b.onclick=()=>{$('#expInput').value=b.dataset.ex;$('#expGoal').value='';expSel=null;expPreview()});expPreview()}
function expPreview(){
  const v=$('#expInput').value.trim();const out=$('#expPrev'),ch=$('#expUnk'),go=$('#btnExpGo');go.disabled=true;
  if(!v){out.innerHTML='<span class="muted">Écris une équation, par exemple 3x + 2 = 11</span>';ch.innerHTML='';return}
  try{const eq=parseEq(v);const syms=symbolsOf(eq);
    if(!syms.length&&!hasSym(eq,'z'))throw new Error('Il faut au moins une lettre à isoler.');
    if(!expSel||!syms.includes(expSel))expSel=syms.includes('x')?'x':syms.includes('z')?'z':syms[0];
    const old=state.target;state.target=expSel;out.innerHTML=mathEq(eq);state.target=old;
    ch.innerHTML=syms.map(s=>`<button class="chip${s===expSel?' on':''}" data-unk="${esc(s)}">${s===expSel?'☑':'☐'} ${esc(s)}</button>`).join('');
    document.querySelectorAll('[data-unk]').forEach(b=>b.onclick=()=>{expSel=b.dataset.unk;expPreview()});
    const gv=$('#expGoal').value.trim();if(gv){parseEq(gv)}
    go.disabled=false;
  }catch(e){out.innerHTML=`<span class="err">⚠ ${esc(e.message)}</span>`;ch.innerHTML=''}
}
function startExp(){
  try{const eq=parseEq($('#expInput').value);let gv=$('#expGoal').value.trim();if(gv&&!gv.includes('='))gv=expSel+'='+gv;
    state.mode='exp';const o={eq,rel:parseRel($('#expInput').value),target:expSel,goal:gv||null,box:$('#expBox').checked,label:'🧪',title:'🧪 Mode expérimental · isoler '+expSel,tip:''};
    lastSetup=Object.assign({},o,{eq0:clone(eq)});setup(o);
    if(!state.par)toast("Je n'ai pas trouvé de solution automatique : à toi de jouer, sans maximum de coups.",'',5000);
  }catch(e){$('#expPrev').innerHTML=`<span class="err">⚠ ${esc(e.message)}</span>`}
}

/* ---------- mini-scènes animées (intros et aide) ---------- */
const c=(v,a,cl='n')=>`<span class="card ${cl}"${a?` data-a="${a}"`:''}>${v}</span>`;
const Xc=(a,v='x')=>c(v,a,'box');const sy=(v,a)=>c(v,a,'s');const sgn=s=>`<span class="sign">${s}</span>`;const dot='<span class="dot">·</span>';
const fr=(n,d,a)=>`<span class="frac"${a?` data-a="${a}"`:''}><span class="row">${n}</span><span class="bar"></span><span class="row">${d}</span></span>`;
const tm=(h,a)=>`<span class="term"${a?` data-a="${a}"`:''}>${h}</span>`;
const bx=(h,a)=>`<span class="gbox"${a?` data-a="${a}"`:''}>${h}</span>`;
const fb=(lab,h,a)=>`<span class="fbox"${a?` data-a="${a}"`:''}><span class="ftab">${lab}</span><span class="fin">${h}</span></span>`;
const pw=(h,n,a)=>`<span class="fbox pow"${a?` data-a="${a}"`:''}><span class="fin">${h}</span><span class="ftab sup">${SUP[n]}</span></span>`;
const bed=(l,r,a)=>`<div class="sbed"><div class="sp"${a==='L'?' data-a="B"':''}>${l}</div><div class="smid">=</div><div class="sp"${a==='R'?' data-a="B"':''}>${r}</div></div>`;
const rail=h=>`<div class="srail">${h}</div>`;
const bedR=(l,r,a,rel)=>bed(l,r,a).replace('<div class="smid">=</div>',`<div class="smid">${rel}</div>`);
const dk=(h,a,neg)=>`<span class="dcard${neg?' neg':''}"${a?` data-a="${a}"`:''}>${neg?sgn('−'):''}${h}</span>`;
const SCENES={
 flip:{t:'Touche un jeton : il devient son opposé.',tap:1,b:rail(dk(c(3),'A')),a:rail(dk(c(3),'',1))},
 add:{t:'Glisse un jeton sur « + Ajouter »… des deux côtés !',b:bed(Xc()+sgn('+')+c(3),c(7),'L')+rail(dk(c(3),'A',1)),a:bed(Xc()+sgn('+')+c(3)+sgn('−')+c(3),c(7)+sgn('−')+c(3))+rail(dk(c(3),'',1))},
 cancel:{t:'a et −a s’annulent : glisse l’un sur l’autre.',b:bed(Xc()+sgn('+')+tm(c(3),'B')+sgn('−')+tm(c(3),'A'),c(7)),a:bed(Xc(),c(7)+sgn('−')+c(3))},
 goal:{t:'🎯 Arrive exactement au résultat demandé.',b:bed(Xc(),tm(c(7),'B')+sgn('−')+tm(c(3),'A')),a:bed(Xc(),c(4)+' <span class="sbadge">🎯</span>')},
 bonus:{t:'✨ x est isolé ? Simplifie encore : +50 points !',b:bed(Xc(),fr(c(12,'A'),c(3,'B'))),a:bed(Xc(),c(4)+' <span class="sbadge">✨+50</span>')},
 like:{t:'Termes semblables : ils se regroupent.',b:bed(tm(c(3)+dot+Xc(),'B')+sgn('−')+tm(Xc(),'A'),c(8)),a:bed(c(2)+dot+Xc(),c(8))},
 copy:{t:'Glisse un terme dans la pioche : il devient un jeton.',b:bed(tm(fr(bx(sy('a')+sgn('+')+sy('b')),sy('a')+dot+sy('b')),'A'),c(9))+`<div class="srail" data-a="B">${dk(c(5))}</div>`,a:bed(fr(bx(sy('a')+sgn('+')+sy('b')),sy('a')+dot+sy('b')),c(9))+rail(dk(c(5))+dk(fr(bx(sy('a')+sgn('+')+sy('b')),sy('a')+dot+sy('b'))))},
 frac:{t:'Même jeton en haut et en bas : ça fait 1.',b:bed(fr(c(3,'A')+dot+Xc(),c(3,'B')),c(4)),a:bed(Xc(),c(4))},
 mul:{t:'« × Multiplier » : tout le côté est multiplié.',b:bed(fr(Xc(),c(5)),c(2),'L')+rail(dk(c(5),'A')),a:bed(fr(c(5)+dot+Xc(),c(5)),c(5)+dot+c(2))+rail(dk(c(5)))},
 gcd:{t:'Simplifie par un diviseur commun.',b:bed(Xc(),fr(c(10,'A'),c(4,'B'))),a:bed(Xc(),fr(c(5),c(2)))},
 product:{t:'Calcule : glisse un nombre sur l’autre.',b:bed(Xc(),c(3,'A')+dot+c(4,'B')),a:bed(Xc(),c(12))},
 neg:{t:'× (−1) fait disparaître le signe −.',b:bed(sgn('−')+Xc(),c(7),'L')+rail(dk(c(1),'A',1)),a:bed(Xc(),sgn('−')+c(7))+rail(dk(c(1),'',1))},
 dev:{t:'Touche la boîte : on développe.',tap:1,b:bed(c(2)+dot+bx(Xc()+sgn('+')+c(3),'A'),c(10)),a:bed(c(2)+dot+Xc()+sgn('+')+c(2)+dot+c(3),c(10))},
 fact:{t:'Même jeton dans deux termes : factorise.',b:bed(tm(c(3,'A')+dot+Xc())+sgn('+')+tm(c(3)+dot+c(2),'B'),c(12)),a:bed(c(3)+dot+bx(Xc()+sgn('+')+c(2)),c(12))},
 tool:{t:'Un outil s’applique à tout un côté… des deux côtés !',b:bed(pw(Xc(),2),c(9),'L')+rail(`<span class="dtool" data-a="A">√□</span>`),a:bed(fb('√',pw(Xc(),2)),fb('√',c(9)))+rail(`<span class="dtool">√□</span>`)},
 inv:{t:'Une fonction et sa réciproque s’annulent : touche-la.',tap:1,b:bed(fb('√',pw(Xc(),2),'A'),c(3)),a:bed(Xc(),c(3))},
 eval:{t:'Fonction d’un nombre : touche-la pour calculer.',tap:1,b:bed(Xc(),fb('√',c(9),'A')),a:bed(Xc(),c(3))},
 explog:{t:'ln et exp sont réciproques : ln(eˣ) = x.',tap:1,b:bed(fb('ln',fb('exp',Xc()),'A'),fb('ln',c(5))),a:bed(Xc(),fb('ln',c(5)))},
 trig:{t:'arcsin(½) = π/6 : touche pour calculer.',tap:1,b:bed(Xc(),fb('arcsin',fr(c(1),c(2)),'A')),a:bed(Xc(),fr(sy('π'),c(6)))},
 lncomb:{t:'ln a + ln b = ln(a·b).',b:bed(tm(fb('ln',Xc()),'A')+sgn('+')+tm(fb('ln',c(2)),'B'),c(1)),a:bed(fb('ln',c(2)+dot+Xc()),c(1))},
 i2:{t:'i · i = −1 : glisse un i sur l’autre.',b:bed(c('i','A','s im')+dot+c('i','B','s im')+dot+Xc('','z'),c(3)),a:bed(sgn('−')+Xc('','z'),c(3))},
 pow2:{t:'Deux jetons identiques côte à côte : v·v = v². Double-touche v² pour revenir à v·v.',b:bed(sy('m')+dot+sy('v','A')+dot+sy('v','B'),sy('Ec')),a:bed(sy('m')+dot+pw(sy('v'),2),sy('Ec'))},
 recip:{t:'Outil 1/□ : on inverse les deux côtés.',b:bed(sy('f'),fr(c(1),Xc('','T')),'L')+rail(`<span class="dtool" data-a="A">1/□</span>`),a:bed(fr(c(1),sy('f')),Xc('','T'))+rail(`<span class="dtool">1/□</span>`)},
 deckop:{t:'Dans la pioche, glisse un jeton sur un autre : ils s’additionnent ou se regroupent entre ( ).',b:rail(dk(sy('a'),'A')+dk(sy('b'),'B')),a:rail(dk(sy('a'))+dk(sy('b'))+dk(bx(sy('b')+sgn('+')+sy('a'))))},
 conj:{t:'Multiplie par le conjugué : (1−i)(1+i) = 2.',b:bed(bx(c(1)+sgn('+')+c('i','','s im'))+dot+Xc('','z'),c(2),'L')+rail(dk(bx(c(1)+sgn('−')+c('i','','s im')),'A')),a:bed(c(2)+dot+Xc('','z'),c(2)+dot+bx(c(1)+sgn('−')+c('i','','s im')))},
 story:{t:'Lis le problème, puis choisis l’équation qui le traduit.',tap:1,b:`<div class="sstory">« Je gagne 7 billes, j'en ai 19 »</div><div class="schoices"><span class="schip">x − 7 = 19</span><span class="schip" data-a="A">x + 7 = 19</span></div>`,a:bed(Xc()+sgn('+')+c(7),c(19))},
 ineq:{t:'Inéquation : on ajoute la même chose des deux côtés, le sens < ne change pas.',b:bedR(Xc()+sgn('+')+c(4),c(9),'L','<')+rail(dk(c(4),'A',1)),a:bedR(Xc()+sgn('+')+c(4)+sgn('−')+c(4),c(9)+sgn('−')+c(4),'','<')+rail(dk(c(4),'',1))},
 ineqneg:{t:'Diviser par un nombre négatif : le sens s’inverse, > devient < !',b:bedR(sgn('−')+c(2)+dot+Xc(),c(6),'L','>')+rail(dk(c(2),'A',1)),a:bedR(Xc(),sgn('−')+c(3),'','<')},
 zero:{t:'Produit nul : A × B = 0 ⇔ A = 0 ou B = 0. On résout deux petites équations.',tap:1,b:bed(bx(Xc()+sgn('−')+c(2),'A')+dot+bx(Xc()+sgn('+')+c(3)),c(0)),a:`<div class="szero">${bed(Xc()+sgn('−')+c(2),c(0))}<span class="sou">ou</span>${bed(Xc()+sgn('+')+c(3),c(0))}</div>`},
 system:{t:'Système : isole y dans une équation, puis remplace-le dans l’autre.',tap:1,b:`<div class="ssys">{ x + <span class="card s" data-a="A">y</span> = 10 ; x − y = 4 }</div>`,a:bed(sy('y'),c(10)+sgn('−')+sy('x'))+`<div class="ssys">x − (10 − x) = 4</div>`},
 trigo:{t:'cos(A) = AB/AC : multiplie par AC des deux côtés pour libérer AB.',b:bed(fb('cos',sy('A')),fr(Xc('','AB'),sy('AC')),'L')+rail(dk(sy('AC'),'A')),a:bed(sy('AC')+dot+fb('cos',sy('A')),fr(sy('AC')+dot+Xc('','AB'),sy('AC')))+rail(dk(sy('AC')))},
 angle:{t:'Outil arccos (cos⁻¹) : arccos(cos A) = A.',b:bed(fb('cos',Xc('','A')),fr(sy('AB'),sy('AC')),'L')+rail(`<span class="dtool" data-a="A">arccos□</span>`),a:bed(fb('arccos',fb('cos',Xc('','A'))),fb('arccos',fr(sy('AB'),sy('AC'))))+rail(`<span class="dtool">arccos□</span>`)},
};
const HELP=[['Les bases',['flip','add','cancel','like','copy']],['Fractions',['frac','mul','gcd','product','neg']],['Boîtes et pioche',['dev','fact','deckop']],['Puissances et fonctions',['pow2','tool','recip','inv','eval','explog','trig','lncomb']],['Complexes',['i2','conj']],['Problèmes et inéquations',['story','ineq','ineqneg']],['Score',['goal','bonus']]];
const sceneHTML=k=>`<div class="scard"><div class="scene" data-scene="${k}"></div><div class="scap">${SCENES[k].t}</div></div>`;
function animateScenes(root){root.querySelectorAll('[data-scene]').forEach(el=>playScene(el,SCENES[el.dataset.scene]))}
async function playScene(el,sc){
  const reduce=OPTS.calm||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  el.innerHTML=`<div class="stage">${sc.b}</div><div class="shand">👆</div>`;const hand=el.querySelector('.shand');
  const pos=n=>{const r=n.getBoundingClientRect(),o=el.getBoundingClientRect();return{x:r.left-o.left+r.width/2,y:r.top-o.top+r.height/2}};
  while(el.isConnected){
    const st=el.querySelector('.stage');st.innerHTML=sc.b;st.classList.remove('pop');hand.style.opacity=0;
    if(reduce){await sleep(1500);if(!el.isConnected)return;st.innerHTML=sc.a;await sleep(2500);continue}
    await sleep(700);if(!el.isConnected)return;
    const A=st.querySelector('[data-a="A"]'),B=el.querySelector('[data-a="B"]');if(!A)return;const pa=pos(A);
    hand.style.opacity=1;await hand.animate([{transform:`translate(${pa.x+40}px,${pa.y+50}px)`},{transform:`translate(${pa.x}px,${pa.y}px)`}],{duration:500,fill:'forwards',easing:'ease-out'}).finished;
    if(sc.tap||!B){await hand.animate([{transform:`translate(${pa.x}px,${pa.y}px) scale(1)`},{transform:`translate(${pa.x}px,${pa.y}px) scale(.8)`},{transform:`translate(${pa.x}px,${pa.y}px) scale(1)`}],{duration:380,fill:'forwards'}).finished}
    else{const pb=pos(B);const gh=A.cloneNode(true);gh.classList.add('sghost');const ra=A.getBoundingClientRect(),o=el.getBoundingClientRect();
      gh.style.left=(ra.left-o.left)+'px';gh.style.top=(ra.top-o.top)+'px';el.appendChild(gh);A.style.opacity=.3;
      const dx=pb.x-pa.x,dy=pb.y-pa.y;
      await Promise.all([gh.animate([{transform:'translate(0,0)'},{transform:`translate(${dx}px,${dy}px)`}],{duration:900,fill:'forwards',easing:'ease-in-out'}).finished,
        hand.animate([{transform:`translate(${pa.x}px,${pa.y}px)`},{transform:`translate(${pb.x}px,${pb.y}px)`}],{duration:900,fill:'forwards',easing:'ease-in-out'}).finished]);gh.remove()}
    if(!el.isConnected)return;st.innerHTML=sc.a;st.classList.add('pop');hand.style.opacity=0;await sleep(1900);
  }
}
let introQueue=null;
function showIntro(keys){
  keys=[].concat(keys).filter(k=>SCENES[k]);if(!keys.length)return;introQueue=keys;
  modal(`<h2>Nouveau !</h2><div class="sgrid n${keys.length}">${keys.map(sceneHTML).join('')}</div><div class="btns"><button class="bigbtn" data-act="close">À moi !</button></div>`,'intro');
}
function introDone(){if(introQueue){introQueue.forEach(k=>SEEN[k]=true);saveSeen();introQueue=null}}
function maybeIntroAfter(kind){if(kind==='bonus'&&!SEEN.bonus&&!state.coach&&!state.won)setTimeout(()=>{if(!state.won&&isoSide()>=0&&$('#modal').classList.contains('hidden'))showIntro(['bonus'])},350)}
function showHelp(){
  modal(`<h2>🐾 Aide animée de Volt</h2><div class="helpgrid">${HELP.map(([t,ks])=>`<h3>${esc(t)}</h3><div class="sgrid">${ks.map(sceneHTML).join('')}</div>`).join('')}</div>
   <div class="btns"><button class="ghostbtn" data-act="tuto">▶ Revoir le tutoriel</button><button class="bigbtn" data-act="close">Fermer</button></div>`,'help');
}

/* ---------- tutoriel guidé (main animée sur la vraie interface) ---------- */
const COACH={tuto1:[
  {cap:'Touche le jeton <b>3</b> : il devient <b>−3</b>',tap:()=>deckCard('3'),done:()=>state.flip[deckIdx('3')]||state.pending||state.moves>0},
  {cap:'Glisse <b>−3</b> à gauche, sur « + Ajouter »',drag:()=>[deckCard('3'),panelAt(0)],done:()=>(state.pending&&state.pending.side===1)||state.moves>0},
  {cap:'Pareil à droite : la balance reste juste ⚖',drag:()=>[deckCard('3'),panelAt(1)],done:()=>!state.pending&&state.moves>0},
  {cap:'Glisse <b>−3</b> sur <b>3</b> : ils s’annulent !',drag:()=>[termAt(0,-1),termAt(0,1)],done:()=>isoSide()>=0||state.won},
  {cap:'✨ Bonus : glisse <b>−3</b> sur <b>7</b> pour simplifier',drag:()=>[termAt(1,-1),termAt(1,0)],done:()=>state.won},
]};
const deckIdx=v=>state.deck.findIndex(c=>keyT(c)==='#'+v+'/');
const deckCard=v=>document.querySelector(`#deck [data-deck="${deckIdx(v)}"]`);
const panelAt=s=>document.querySelector(`#board .panel[data-side="${s}"] .content`);
const termAt=(s,i)=>{const t=state.eq[s][i<0?state.eq[s].length+i:i];return t?document.querySelector(`#board [data-tid="${t.id}"]`):null};
function startCoach(k){state.coach={k,step:0,run:0};SEEN['coach_'+k]=true;saveSeen();$('#coach').classList.remove('hidden');coachShow()}
function stopCoach(){state.coach=null;const c=$('#coach');if(c)c.classList.add('hidden')}
function coachCheck(){const co=state.coach;if(!co)return;const steps=COACH[co.k];let changed=false;
  while(co.step<steps.length&&steps[co.step].done()){co.step++;changed=true}
  if(co.step>=steps.length){stopCoach();return}if(changed)coachShow()}
function coachShow(){const co=state.coach;if(!co)return;co.run++;const run=co.run;const step=COACH[co.k][co.step];
  $('#coachCap').innerHTML=`<span class="cnum">${co.step+1}/${COACH[co.k].length}</span> ${step.cap}`;coachLoop(run,step)}
async function coachLoop(run,step){
  const hand=$('#coachHand');const alive=()=>state.coach&&state.coach.run===run;
  while(alive()){
    await sleep(500);if(!alive())return;
    const els=step.tap?[step.tap()]:step.drag();if(!els[0]){await sleep(500);continue}
    const p=n=>{const r=n.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}};const a=p(els[0]);
    hand.style.opacity=1;await hand.animate([{transform:`translate(${a.x+40}px,${a.y+60}px)`},{transform:`translate(${a.x}px,${a.y}px)`}],{duration:500,fill:'forwards',easing:'ease-out'}).finished;
    if(step.tap){await hand.animate([{transform:`translate(${a.x}px,${a.y}px) scale(1)`},{transform:`translate(${a.x}px,${a.y}px) scale(.75)`},{transform:`translate(${a.x}px,${a.y}px) scale(1)`}],{duration:420,fill:'forwards'}).finished}
    else if(els[1]){const b=p(els[1]);await hand.animate([{transform:`translate(${a.x}px,${a.y}px) scale(.85)`},{transform:`translate(${b.x}px,${b.y}px) scale(.85)`}],{duration:1100,fill:'forwards',easing:'ease-in-out'}).finished}
    await sleep(350);hand.style.opacity=0;await sleep(700);
  }
}

/* =====================================================================
   VERSION 2 : histoires, étapes, explications d'erreurs, boutique,
   défi du jour, réglages (lisibilité, taille, animations), hors ligne
   ===================================================================== */
const UNLOCK_FROM={8:2,9:2,10:2};
const prevWorld=i=>UNLOCK_FROM[i]??i-1;
/* ---------- problèmes : choisir la bonne équation ---------- */
let storyTry=0;
function showStory(ci,li){
  const lv=WORLDS[ci].levels[li];state.ci=ci;state.li=li;state.mode='level';storyTry=0;
  const order=lv.ch.map((_,i)=>i);
  modal(`<div class="winpet">${creatureSVG(petStage(),'idle')}</div><h2>📖 Le problème</h2><div class="storytxt">${lv.story}</div>
   <div class="kick">Quelle équation traduit ce problème ?</div>
   <div class="stchoices">${order.map(i=>`<button class="stch" data-story="${i}">${mathEq(parseEq(lv.ch[i]),parseRel(lv.ch[i]))}</button>`).join('')}</div>
   <div id="storyWhy"></div><div class="btns"><button class="ghostbtn" data-act="menu">Retour</button></div>`,'story');
}
function storyPick(i){
  const lv=WORLDS[state.ci].levels[state.li];const b=document.querySelector(`[data-story="${i}"]`);
  if(i===lv.ok){b.classList.add('ok');sfx('merge');if(storyTry===0){STATS.storyFirst=(STATS.storyFirst||0)+1;saveStats()}
    setTimeout(()=>{const o=levelOpts(state.ci,state.li);if(o.intro&&!o.intro.length)o.intro=null;state.chain=null;setup(o)},650);return}
  storyTry++;b.classList.add('bad');b.disabled=true;sfx('fail');
  $('#storyWhy').innerHTML=`<div class="whybox">🤔 Pas tout à fait. ${lv.why}</div>`;
}
/* ---------- niveaux en plusieurs étapes ---------- */
let CHAIN=null;
function startLevel(ci,li,step=0){
  const lv=WORLDS[ci].levels[li];
  if(lv.story&&!step)return showStory(ci,li);
  state.mode='level';state.ci=ci;state.li=li;state.rnd=null;
  const o=levelOpts(ci,li,step);if(o.intro&&!o.intro.length)o.intro=null;
  if(o.chain&&o.chain.k===0)CHAIN={moves:0,par:0,sols:[]};
  setup(o);state.chain=o.chain||null;render();
}
const prettySol=g=>g.replace(/-/g,'−').replace(/([=<>≤≥])/,' $1 ').replace(/\*/g,'·');
function chainStepWin(){
  const lv=WORLDS[state.ci].levels[state.li],k=state.chain.k;
  CHAIN.moves+=state.moves;CHAIN.par+=state.par||0;CHAIN.sols.push(lv.steps[k].goal);
  modal(`<div class="winpet">${creatureSVG(petStage(),'happy')}</div><h2>✔ Étape ${k+1}/${state.chain.n} réussie !</h2>
<div class="sol">${mathEq(state.eq)}</div><div>${lv.zero?'Le facteur suivant peut aussi être nul…':'On garde ce résultat pour l\'étape suivante.'}</div>
   <div class="btns"><button class="bigbtn" data-act="step">Étape suivante ▶</button></div>`,'win');sfx('win');confetti(30);
}
function solutionLine(){
  if(state.chain&&CHAIN){const lv=WORLDS[state.ci].levels[state.li];const all=CHAIN.sols.concat(lv.steps[state.chain.k].goal);
    if(lv.zero)return`Solutions : ${all.map(prettySol).join(' <b>ou</b> ')}`;
    return`Solution du système : ${all.slice(1).map(prettySol).join(' <b>et</b> ')}`}
  if(state.rel&&state.rel!=='='){const s=isoSide();if(s<0)return'';const r=s===0?state.rel:MIRROR[state.rel];const v=textSum(state.eq[1-s]).replace(/-/g,'−');
    const I={'<':`]−∞ ; ${v}[`,'≤':`]−∞ ; ${v}]`,'>':`]${v} ; +∞[`,'≥':`[${v} ; +∞[`}[r];return`Ensemble des solutions : <b>${esc(state.target)} ∈ ${I}</b>`}
  return'';
}
/* ---------- explication des erreurs ---------- */
const WHY=[
 {re:/Équilibre la balance|Termine d|opération en cours/,s:'add',t:"Une équation est une <b>balance</b>. Si tu fais une opération d'un seul côté, elle penche : l'égalité devient fausse. Refais <b>exactement</b> la même opération de l'autre côté pour la rééquilibrer."},
 {re:/Pas du même côté/,s:'add',t:"Un terme ne « saute » pas par-dessus le = tout seul. Pour faire disparaître +3 d'un côté, on ajoute −3 <b>des deux côtés</b>. C'est ce qu'on appelle parfois « passer de l'autre côté »."},
 {re:/diviseur commun|même carte|étage/,s:'gcd',t:"Dans une fraction, on ne simplifie que par un nombre qui divise <b>à la fois</b> le haut et le bas : 6/4 = 3/2 (on divise par 2), mais 5/3 ne se simplifie pas."},
 {re:/Seuls deux/,s:'product',t:"Dans un produit, on calcule deux nombres côte à côte (2·3 = 6) ou on regroupe v·v = v². Mais 2·x ne se calcule pas : il reste 2x."},
 {re:/pas semblables|même somme/,s:'like',t:"On additionne seulement des termes <b>de même nature</b> : des x avec des x (3x + 2x = 5x), des nombres avec des nombres. 3x + 2 ne fait pas 5x !"},
 {re:/factoriser/,s:'fact',t:"Factoriser, c'est mettre en commun un facteur présent dans <b>chaque</b> terme : 3x + 3·2 = 3(x + 2). Si un terme ne contient pas ce facteur, on ne peut pas."},
 {re:/développe|Rien à développer/,s:'dev',t:"Développer : on multiplie le facteur devant la parenthèse par <b>chaque</b> terme dedans : 2(x + 3) = 2x + 6. Une fraction au dénominateur s'enlève plutôt en multipliant les deux côtés."},
 {re:/réciproque|valeur exacte/,s:'inv',t:"Une fonction s'annule avec sa <b>réciproque</b> : √(x²) = x (si x ≥ 0), (√x)² = x. Applique d'abord l'outil réciproque des deux côtés."},
 {re:/inéquation|signe d'une lettre/,s:'ineqneg',t:"Dans une inéquation, multiplier ou diviser par un nombre <b>négatif</b> retourne le sens. Avec une lettre, on ne sait pas si elle est positive ou négative : on ne peut pas savoir si le sens change."},
];
function showWhy(i){const w=WHY[i];modal(`<h2>🤔 Pourquoi ce coup est refusé ?</h2><div class="whybox big">${w.t}</div>
  ${SCENES[w.s]?`<div class="sgrid n1">${sceneHTML(w.s)}</div>`:''}<div class="btns"><button class="bigbtn" data-act="close">J'ai compris</button></div>`,'intro')}
/* ---------- boutique de Volt ---------- */
let SHOP={owned:{},eq:{}};try{Object.assign(SHOP,JSON.parse(localStorage.getItem('isoleX_college2_shop')||'{}'))}catch(e){}
const saveShop=()=>{try{localStorage.setItem('isoleX_college2_shop',JSON.stringify(SHOP))}catch(e){}};
const ITEMS=[
 {k:'hat',slot:'head',icon:'⛑️',name:'Casque de chantier',price:60},
 {k:'flowers',slot:'head',icon:'🎧',name:'Casque audio',price:90},
 {k:'cap',slot:'head',icon:'🧢',name:'Casquette',price:120},
 {k:'party',slot:'head',icon:'🥳',name:'Chapeau de fête',price:200},
 {k:'glasses',slot:'eyes',icon:'🥽',name:'Lunettes de protection',price:80},
 {k:'shades',slot:'eyes',icon:'🕶️',name:'Lunettes de soleil',price:150},
 {k:'bow',slot:'neck',icon:'🎀',name:'Nœud papillon',price:70},
 {k:'scarf',slot:'neck',icon:'🧣',name:'Écharpe',price:110},
 {k:'blue',slot:'color',icon:'🔵',name:'Volt bleu SIN',price:100,col:'#5aa9e6',dark:'#1d5f9c',belly:'#d6ecff'},
 {k:'pink',slot:'color',icon:'🟠',name:'Volt orange ITEC',price:140,col:'#f39c4a',dark:'#a6561a',belly:'#ffe6cc'},
 {k:'purple',slot:'color',icon:'🟣',name:'Volt violet SI',price:180,col:'#9b8cf0',dark:'#4b3fb8',belly:'#e8e0ff'},
 {k:'gold',slot:'color',icon:'🟡',name:'Volt en laiton',price:300,col:'#ffd23f',dark:'#b8860b',belly:'#fff4c2'},
];
const coinsEarned=()=>Math.floor(Object.values(PROG).reduce((a,p)=>a+(p.p||0),0)/10)+(STATS.bonusCoins||0);
const coins=()=>coinsEarned()-(STATS.spent||0);
const eqItem=slot=>ITEMS.find(it=>it.k===SHOP.eq[slot]);
function accSVG(G){const {r,cy,top,ex,ey,er}=G;let h='';const hd=eqItem('head'),ey2=eqItem('eyes'),nk=eqItem('neck');
  if(nk&&nk.k==='scarf')h+=`<path d="M${60-r*.72} ${cy+r*.5}q${r*.72} ${r*.3} ${r*1.44} 0l-${r*.06} ${r*.22}q-${r*.66} ${r*.28} -${r*1.32} 0z" fill="#e63946" stroke="#9d1d27" stroke-width="1.5"/><path d="M${60+r*.3} ${cy+r*.62}l${r*.18} ${r*.5} ${r*.2} -${r*.06} -${r*.1} -${r*.46}z" fill="#e63946" stroke="#9d1d27" stroke-width="1.2"/>`;
  if(nk&&nk.k==='bow')h+=`<path d="M60 ${cy+r*.6}l-${r*.3} -${r*.16}v${r*.32}z M60 ${cy+r*.6}l${r*.3} -${r*.16}v${r*.32}z" fill="#ff4d6d" stroke="#a4133c" stroke-width="1.5"/><circle cx="60" cy="${cy+r*.6}" r="${r*.07}" fill="#a4133c"/>`;
  if(ey2&&ey2.k==='glasses')h+=`<g fill="rgba(255,140,66,.28)" stroke="#ff8c42" stroke-width="3"><circle cx="${60-ex}" cy="${ey}" r="${er*1.35}"/><circle cx="${60+ex}" cy="${ey}" r="${er*1.35}"/></g><path d="M${60-ex+er*1.35} ${ey}h${2*ex-2.7*er}" stroke="#ff8c42" stroke-width="3"/>`;
  if(ey2&&ey2.k==='shades')h+=`<g fill="#1b1b2f" stroke="#000" stroke-width="1.5"><rect x="${60-ex-er*1.5}" y="${ey-er*1.05}" width="${er*3}" height="${er*2}" rx="${er*.8}"/><rect x="${60+ex-er*1.5}" y="${ey-er*1.05}" width="${er*3}" height="${er*2}" rx="${er*.8}"/></g><path d="M${60-ex+er*1.5} ${ey-er*.4}h${2*ex-3*er}" stroke="#000" stroke-width="2"/><path d="M${60-ex-er*.9} ${ey-er*.6}l${er*.6} -${er*.2}" stroke="#fff" stroke-width="1.5" opacity=".7"/>`;
  if(hd&&hd.k==='hat')h+=`<path d="M${60-r*.9} ${top+r*.12}q0 -${r*.78} ${r*.9} -${r*.78}t${r*.9} ${r*.78}z" fill="#ffcf3a" stroke="#b8860b" stroke-width="1.8"/><rect x="${60-r*1.08}" y="${top+r*.06}" width="${r*2.16}" height="${r*.16}" rx="${r*.08}" fill="#f2b705" stroke="#b8860b" stroke-width="1.5"/><path d="M60 ${top-r*.64}v${r*.68}" stroke="#e0a800" stroke-width="${r*.12}"/>`;
  if(hd&&hd.k==='cap')h+=`<path d="M${60-r*.7} ${top+r*.2}q0 -${r*.62} ${r*.7} -${r*.62}t${r*.7} ${r*.62}z" fill="#4361ee" stroke="#23379c" stroke-width="1.5"/><path d="M${60+r*.2} ${top+r*.2}q${r*.6} -${r*.06} ${r*.9} ${r*.12}q-${r*.4} ${r*.1} -${r*.9} 0z" fill="#3046c4" stroke="#23379c" stroke-width="1.5"/><circle cx="60" cy="${top-r*.42}" r="${r*.07}" fill="#ffd23f"/>`;
  if(hd&&hd.k==='party')h+=`<path d="M${60-r*.36} ${top+r*.14}L${60+r*.05} ${top-r*.85}L${60+r*.4} ${top+r*.14}z" fill="#ff8c42" stroke="#c65a12" stroke-width="1.5"/><path d="M${60-r*.22} ${top-r*.2}l${r*.5} ${r*.1}M${60-r*.3} ${top-.0*r}l${r*.62} ${r*.1}" stroke="#ffe27a" stroke-width="2.5"/><circle cx="${60+r*.05}" cy="${top-r*.9}" r="${r*.1}" fill="#ffe27a"/>`;
  if(hd&&hd.k==='flowers')h+=`<path d="M${60-r*.95} ${cy-r*.05}q0 -${r*1.05} ${r*.95} -${r*1.05}t${r*.95} ${r*1.05}" fill="none" stroke="#2b2f33" stroke-width="${r*.14}"/><rect x="${60-r*1.18}" y="${cy-r*.32}" width="${r*.34}" height="${r*.62}" rx="${r*.14}" fill="#ff3b2f" stroke="#2b2f33" stroke-width="1.5"/><rect x="${60+r*.84}" y="${cy-r*.32}" width="${r*.34}" height="${r*.62}" rx="${r*.14}" fill="#ff3b2f" stroke="#2b2f33" stroke-width="1.5"/>`;
  return h;
}
function showShop(){
  const c=coins();
  modal(`<h2>🛍️ La boutique de Volt</h2><div class="shoptop"><div class="winpet">${creatureSVG(Math.max(1,petStage()),'happy')}</div>
   <div><div class="coins">🪙 ${c} pièce${c>1?'s':''}</div><small>1 pièce pour 10 points gagnés, + bonus du défi du jour et du chrono.${petStage()===0?' Il faut d\'abord monter Volt pour lui mettre des accessoires.':''}</small></div></div>
   <div class="shopgrid">${ITEMS.map(it=>{const own=SHOP.owned[it.k],on=SHOP.eq[it.slot]===it.k;
     return`<div class="sitem${own?' own':''}${on?' on':''}"><span class="si">${it.icon}</span><b>${esc(it.name)}</b>
      ${own?`<button class="chip${on?' on':''}" data-shop="wear" data-k="${it.k}">${on?'✔ Porté':'Porter'}</button>`:`<button class="chip" data-shop="buy" data-k="${it.k}"${c<it.price?' disabled':''}>🪙 ${it.price}</button>`}</div>`}).join('')}</div>
   <div class="btns"><button class="bigbtn" data-act="close">Fermer</button></div>`,'badgesbox');
}
document.getElementById('mbox').addEventListener('click',e=>{
  const st=e.target.closest('[data-story]');if(st){storyPick(+st.dataset.story);return}
  const b=e.target.closest('[data-shop]');if(!b)return;const it=ITEMS.find(i=>i.k===b.dataset.k);
  if(b.dataset.shop==='buy'){if(coins()<it.price)return;STATS.spent=(STATS.spent||0)+it.price;saveStats();SHOP.owned[it.k]=1;SHOP.eq[it.slot]=it.k;saveShop();sfx('badge');confetti(40);checkBadges()}
  else{SHOP.eq[it.slot]=SHOP.eq[it.slot]===it.k?null:it.k;saveShop();sfx('pop')}
  showShop();
});
/* ---------- défi du jour ---------- */
let DAILY={last:'',streak:0,best:0};try{Object.assign(DAILY,JSON.parse(localStorage.getItem('isoleX_college2_daily')||'{}'))}catch(e){}
const saveDaily=()=>{try{localStorage.setItem('isoleX_college2_daily',JSON.stringify(DAILY))}catch(e){}};
const dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const yesterday=()=>{const d=new Date();d.setDate(d.getDate()-1);return dayKey(d)};
const dailyDone=()=>DAILY.last===dayKey();
const curStreak=()=>DAILY.last===dayKey()||DAILY.last===yesterday()?DAILY.streak:0;
function seeded(str){let h=1779033703;for(const ch of str)h=Math.imul(h^ch.charCodeAt(0),3432918353),h=h<<13|h>>>19;
  return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296}}
function startDaily(){
  const R=Math.random;Math.random=seeded('volt'+dayKey());let g,th;
  try{th=pick(['add','mul','mix','dev','pow','ineq']);g=genEq(th,1)}finally{Math.random=R}
  state.mode='daily';const o={eq:g.eq,rel:parseRel(g.e),target:'x',goal:g.goal,tip:"📅 L'équation du jour est la même pour toute la classe. Reviens demain pour allonger ta série !",box:false,label:'📅',title:'Défi du jour · '+(THEMES.find(t=>t.k===th)||{n:th}).n};
  lastSetup=Object.assign({},o,{eq0:clone(g.eq)});setup(o);state.chain=null;
}
function dailyWin(){if(dailyDone())return 0;DAILY.streak=DAILY.last===yesterday()?DAILY.streak+1:1;DAILY.last=dayKey();DAILY.best=Math.max(DAILY.best,DAILY.streak);saveDaily();
  const bonus=20+10*Math.min(DAILY.streak,7);STATS.bonusCoins=(STATS.bonusCoins||0)+bonus;saveStats();return bonus}
/* ---------- réglages et accessibilité ---------- */
function applyOpts(){document.body.classList.toggle('dys',!!OPTS.dys);document.body.classList.toggle('calm',!!OPTS.calm);
  document.documentElement.style.setProperty('--zoom',OPTS.size||1);$('#app').style.zoom=LOOK.textZoom(OPTS.size||1)}
let installEvt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e});
function showSettings(){
  const sz=OPTS.size||1;
  modal(`<h2>⚙️ Réglages</h2><div class="setlist">
   <label class="setrow"><input type="checkbox" data-opt="dys"${OPTS.dys?' checked':''}> <span><b>Police très lisible</b><small>Lettres bien distinctes (Atkinson Hyperlegible), plus d'espace entre les lettres.</small></span></label>
   <label class="setrow"><input type="checkbox" data-opt="calm"${OPTS.calm?' checked':''}> <span><b>Animations réduites</b><small>Pas de confettis ni de plateau qui penche, aides sans mouvement.</small></span></label>
   <label class="setrow"><input type="checkbox" data-opt="mute"${OPTS.mute?' checked':''}> <span><b>Couper les sons</b></span></label>
   <div class="setrow"><span><b>🎨 Apparence</b><small>Thèmes (nuit, tableau blanc, contraste élevé, océan…), style du plateau, forme de l'inconnue, couleurs, taille des jetons.</small></span><button class="chip on" id="btnLookSet">Choisir</button></div>
   <div class="setrow"><span><b>Taille du texte</b><small>Sur un petit écran, elle est limitée automatiquement pour que rien ne soit coupé.</small></span><span class="sizes">${[[1,'Normal'],[1.15,'Grand'],[1.3,'Très grand']].map(([v,l])=>`<button class="chip${sz===v?' on':''}" data-size="${v}">${l}</button>`).join('')}</span></div>
   <div class="setrow"><span><b>📲 Utiliser sans Internet</b><small>${installEvt?'Installe l\'appli sur cet appareil : elle marchera même hors ligne.':'Après une première visite, le jeu fonctionne hors ligne. Sur iPad ou iPhone : bouton Partager → « Sur l\'écran d\'accueil ». Sur Android ou ordinateur : menu du navigateur → « Installer l\'application ».'}</small></span>${installEvt?'<button class="chip on" id="btnInstall">Installer</button>':''}</div>
   </div><p class="lookver" style="text-align:center">Version du ${LOOK.BUILD}</p><div class="btns"><button class="bigbtn" data-act="close">Fermer</button></div>`,'badgesbox');
  document.querySelectorAll('[data-opt]').forEach(i=>i.onchange=()=>{OPTS[i.dataset.opt]=i.checked;saveOpts();applyOpts();$('#btnMute').textContent=OPTS.mute?'🔇':'🔊'});
  document.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{OPTS.size=+b.dataset.size;saveOpts();applyOpts();showSettings()});
  $('#btnLookSet').onclick=showLook;
  const bi=$('#btnInstall');if(bi)bi.onclick=async()=>{installEvt.prompt();await installEvt.userChoice;installEvt=null;showSettings()};
}
LOOK.sw();

/* ---------- sauvegarde : code et QR code, sans serveur ---------- */
const B32='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const SLOT_KEYS=['head','eyes','neck','color'];
const DAY0=Date.UTC(2026,0,1);
function bitW(){const b=[];return{b,put(v,n){for(let i=n-1;i>=0;i--)b.push((v>>i)&1)},vint(v){v=Math.max(0,Math.floor(v||0));do{const c=v&7;v=Math.floor(v/8);b.push(v?1:0);this.put(c,3)}while(v)}}}
function bitR(b){let p=0;return{get(n){let v=0;for(let i=0;i<n;i++){if(p>=b.length)throw new Error('court');v=v*2+b[p++]}return v},vint(){let v=0,m=1,more;do{more=this.get(1);v+=this.get(3)*m;m*=8}while(more);return v},left:()=>b.length-p}}
const crc10=bits=>{let h=0x2A5;for(const x of bits){h=((h<<1)|x)^((h&0x200)?0x233:0);h&=0x3FF}return h};
const levelList=()=>{const a=[];WORLDS.forEach((w,ci)=>w.levels.forEach((lv,li)=>a.push({k:progKey(ci,li),goal:!!(lv.goal||lv.steps)})));return a};
function makeSaveCode(){
  const w=bitW();const zv=v=>{v=Math.max(0,Math.floor(v||0));if(!v)w.put(0,1);else{w.put(1,1);w.vint(v-1)}};
  w.put(3,3);w.put(Object.keys(SPECS).indexOf(state.spec),3);
  ['chronoBest','bestNoHint','storyFirst','bonusCoins','spent'].forEach(k=>zv(STATS[k]));
  const own=ITEMS.map(it=>SHOP.owned[it.k]?1:0);if(own.some(Boolean)){w.put(1,1);own.forEach(x=>w.put(x,1));SLOT_KEYS.forEach(sl=>{const its=ITEMS.filter(i=>i.slot===sl);w.put(its.findIndex(i=>i.k===SHOP.eq[sl])+1,3)})}else w.put(0,1);
  if(DAILY.last){w.put(1,1);zv(Math.round((Date.UTC(...DAILY.last.split('-').map((v,i)=>i===1?v-1:+v))-DAY0)/864e5));zv(DAILY.streak);zv(DAILY.best)}else w.put(0,1);
  const L=levelList(),runs=[];let i=0;
  while(i<L.length){let g=0;while(i<L.length&&!PROG[L[i].k]){g++;i++}if(i>=L.length)break;const st=i;while(i<L.length&&PROG[L[i].k])i++;runs.push([g,st,i])}
  zv(runs.length);runs.forEach(([g,a,b])=>{zv(g);zv(b-a-1);for(let k=a;k<b;k++){const p=PROG[L[k].k],sp=p.p>p.s*100;if(p.s===3&&sp)w.put(1,1);else{w.put(0,1);w.put(p.s,2);w.put(sp?1:0,1)}}});
  const bits=w.b;while((bits.length+10)%5)bits.push(0);const c=crc10(bits);bits.push(...[9,8,7,6,5,4,3,2,1,0].map(i=>(c>>i)&1));
  let out='';for(let i=0;i<bits.length;i+=5)out+=B32[bits.slice(i,i+5).reduce((a,x)=>a*2+x,0)];
  return out.match(/.{1,4}/g).join('-');
}
function readSaveCode(code){
  const s=code.toUpperCase().replace(/[\s\-_.]/g,'').replace(/O/g,'0').replace(/[IL]/g,'1').replace(/U/g,'V');
  if(s.length<3)throw new Error('Code trop court.');
  const bits=[];for(const ch of s){const v=B32.indexOf(ch);if(v<0)throw new Error(`Caractère inconnu : « ${ch} ».`);for(let i=4;i>=0;i--)bits.push((v>>i)&1)}
  const body=bits.slice(0,-10),c=bits.slice(-10).reduce((a,x)=>a*2+x,0);if(crc10(body)!==c)throw new Error('Ce code contient une erreur : vérifie chaque caractère.');
  const r=bitR(body);const zv=()=>r.get(1)?r.vint()+1:0;if(r.get(3)!==3)throw new Error('Code d\'une version inconnue.');const spk=Object.keys(SPECS)[r.get(3)];if(!spk)throw new Error('Spécialité inconnue.');const spOld=state.spec;setSpec(spk);
  const d={stats:{},owned:{},eq:{},daily:{last:'',streak:0,best:0},prog:{}};
  ['chronoBest','bestNoHint','storyFirst','bonusCoins','spent'].forEach(k=>d.stats[k]=zv());
  if(r.get(1)){ITEMS.forEach(it=>{if(r.get(1))d.owned[it.k]=1});SLOT_KEYS.forEach(sl=>{const its=ITEMS.filter(i=>i.slot===sl);const v=r.get(3);d.eq[sl]=v?(its[v-1]||{}).k||null:null})}
  if(r.get(1)){const dl=zv();d.daily={last:dayKey(new Date(DAY0+dl*864e5+12*36e5)),streak:zv(),best:zv()}}
  const L=levelList();let i=0;const nr=zv();
  for(let q=0;q<nr;q++){i+=zv();const n=zv()+1;for(let k=0;k<n;k++,i++){let st=3,sp=1;if(!r.get(1)){st=r.get(2);sp=r.get(1)}if(L[i])d.prog[L[i].k]={s:st,p:st*100+(sp?50:0)}}}
  const done=L.filter(l=>d.prog[l.k]);
  Object.assign(d.stats,{wins:done.length,perfect:done.filter(l=>d.prog[l.k].s===3).length,goals:done.filter(l=>l.goal).length,simp:done.filter(l=>!l.goal&&d.prog[l.k].p%100).length,noHint:0});
  d.spec=spk;setSpec(spOld);return d;
}
function applySave(d){
  setSpec(d.spec);for(const k in PROG)if(k.startsWith(d.spec+'|'))delete PROG[k];Object.assign(PROG,d.prog);saveProg();
  Object.assign(STATS,d.stats);saveStats();SHOP.owned=d.owned;SHOP.eq=d.eq;saveShop();Object.assign(DAILY,d.daily);saveDaily();
  for(const k in GOT)delete GOT[k];BADGES.forEach(b=>{if(b.ok())GOT[b.k]=Date.now()});saveGot();
  SEEN.coach_tuto1=true;WORLDS.forEach((w,ci)=>w.levels.forEach((lv,li)=>{if(PROG[progKey(ci,li)]&&lv.intro)[].concat(lv.intro).forEach(k=>SEEN[k]=true)}));saveSeen();
}
const saveSummary=d=>{const st=Object.values(d.prog).reduce((a,p)=>a+p.s,0),n=Object.keys(d.prog).length;return`${esc(SPECS[d.spec].name)} · ★ ${st} étoile${st>1?'s':''} · ${n} défi${n>1?'s':''} réussi${n>1?'s':''}`};
const saveURL=code=>location.href.split('#')[0].split('?')[0].replace(/[^/]*$/,'')+'#reprendre='+code.replace(/-/g,'');
function showSave(tab='save'){
  const code=makeSaveCode();let qr='';
  try{if(window.qrcode){const q=qrcode(0,'M');q.addData(saveURL(code));q.make();qr=q.createSvgTag({cellSize:4,margin:2,scalable:true,alt:'QR code de sauvegarde'})}}catch(e){}
  modal(`<h2>💾 Ma sauvegarde</h2>
   <div class="savetabs"><button class="chip${tab==='save'?' on':''}" data-stab="save">Sauvegarder</button><button class="chip${tab==='load'?' on':''}" data-stab="load">Reprendre sur cet appareil</button></div>
   ${tab==='save'?`<p>Ta progression reste sur cet appareil. Pour la retrouver <b>sur un autre ordinateur ou une tablette</b>, note ce code ou prends le QR code en photo.</p>
    <div class="savebox"><div class="savecode" id="saveCode">${code}</div>${qr?`<div class="saveqr">${qr}</div>`:''}</div>
    <div class="kicker">${saveSummary(readSaveCode(code))}</div>
    <p><small>Le code change quand tu progresses : refais une sauvegarde à la fin de chaque séance. Il ne contient ni ton nom ni aucune donnée personnelle.${qr?' Scanne le QR code avec l\'appareil photo d\'une tablette : le jeu s\'ouvre et reprend ta partie.':''}</small></p>
    <div class="btns"><button class="ghostbtn" id="btnCopySave">📋 Copier le code</button><button class="bigbtn" data-act="close">Fermer</button></div>`
   :`<p>Tape ton code de sauvegarde. <b>Attention :</b> la progression actuelle de cet appareil sera remplacée.</p>
    <input id="loadCode" class="loadcode" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX-XXXX">
    <div id="loadMsg" class="profmsg"></div>
    <div class="btns"><button class="ghostbtn" data-act="close">Annuler</button><button class="bigbtn" id="btnLoadSave">Reprendre ▶</button></div>`}`,'badgesbox');
  document.querySelectorAll('[data-stab]').forEach(b=>b.onclick=()=>showSave(b.dataset.stab));
  const cp=$('#btnCopySave');if(cp)cp.onclick=async()=>{try{await navigator.clipboard.writeText(code);cp.textContent='✔ Copié !'}catch(e){const r=document.createRange();r.selectNodeContents($('#saveCode'));getSelection().removeAllRanges();getSelection().addRange(r);cp.textContent='Sélectionné : fais Ctrl+C'}};
  const go=$('#btnLoadSave');if(go){const inp=$('#loadCode');setTimeout(()=>inp.focus(),50);
    const run=()=>{try{const d=readSaveCode(inp.value);confirmLoad(d)}catch(e){$('#loadMsg').textContent=e.message;sfx('fail')}};go.onclick=run;inp.onkeydown=e=>{if(e.key==='Enter')run()}}
}
let pendingSave=null;
function confirmLoad(d){pendingSave=d;
  modal(`<h2>💾 Reprendre cette partie ?</h2><div class="pts">${saveSummary(d)}</div><p>La progression actuelle de cet appareil sera <b>remplacée</b>.</p>
   <div class="btns"><button class="ghostbtn" data-act="close">Annuler</button><button class="bigbtn" id="btnDoLoad">Oui, reprendre</button></div>`,'intro');
  $('#btnDoLoad').onclick=()=>{applySave(pendingSave);pendingSave=null;closeModal();toHome();sfx('badge');confetti(60);toast('✔ Partie reprise : bon retour à l\'atelier !')};
}
function checkSaveLink(){const m=location.hash.match(/reprendre=([0-9A-Za-z]+)/);if(!m)return;history.replaceState(null,'',location.href.split('#')[0]);
  try{confirmLoad(readSaveCode(m[1]))}catch(e){toast('Ce lien de sauvegarde est abîmé : '+e.message,'warn',6000)}}

/* ---------- apparence : thèmes et réglages fins ---------- */
let lookFrom='home';
function showLook(){if(!$('#mbox').classList.contains('lookbox'))lookFrom=['home','menu','world','train','game','exp'].find(k=>$('#'+k)&&!$('#'+k).classList.contains('hidden'))||'home';modal(LOOK.html(),'lookbox')}
document.getElementById('mbox').addEventListener('click',e=>{if(!e.target.closest('[data-lk]')||!$('#mbox').classList.contains('lookbox'))return;
  const r=LOOK.click(e.target);if(!r)return;
  if(r.act){closeModal();sfx(r.act==='save'?'badge':'pop');if(lookFrom==='home')toHome();else showScreen(lookFrom);if(lookFrom==='game')render();if(r.msg)toast(r.msg);return}
  sfx(r.msg&&r.msg.startsWith('🎨')?'badge':'pop');const sc=LOOK.scrollEl().scrollTop;showLook();LOOK.scrollEl().scrollTop=sc;if(r.msg)toast(r.msg,r.warn?'warn':'')});
/* fermer la fenêtre Apparence sans enregistrer annule l'aperçu */
const _closeModal=closeModal;closeModal=function(){if($('#mbox').classList.contains('lookbox'))LOOK.cancel();_closeModal()};
/* après chaque affichage : ajuster la taille pour que rien ne soit coupé */
const _render=render;render=function(){_render.apply(this,arguments);LOOK.fit()};
const _renderDeck=renderDeck;renderDeck=function(){_renderDeck.apply(this,arguments);LOOK.fit()};
LOOK.init('etabli',{coins:()=>coins(),spend:pr=>{if(coins()<pr)return false;STATS.spent=(STATS.spent||0)+pr;saveStats();return true},onChange:()=>{if(!$('#home').classList.contains('hidden'))renderHome()}});

/* ---------- boutons ---------- */
$('#btnBack').onclick=backFromGame;$('#btnWorldBack').onclick=toMenu;$('#btnLand').onclick=toHome;$('#btnMenuTrain').onclick=showTrain;$('#btnTrainBack').onclick=toMenu;
$('#btnUndo').onclick=undo;$('#btnHint').onclick=()=>{state.usedHint=true;hint()};
$('#btnReset').onclick=replay;
$('#btnTrad').onclick=()=>{state.trad=!state.trad;$('#btnTrad').classList.toggle('on',state.trad);render()};
$('#toast').addEventListener('click',e=>{const b=e.target.closest('[data-why]');if(b)showWhy(+b.dataset.why)});$('#btnSettings').onclick=showSettings;$('#btnLook').onclick=showLook;$('#btnSave').onclick=()=>showSave('save');
$('#btnHelp').onclick=showHelp;$('#btnHelpHome').onclick=showHelp;
$('#btnHist').onclick=()=>modal('<h2>Traduction pas à pas</h2><div class="histlist">'+state.history.map((h,i)=>`<div class="hstep"><div class="d">${i}. ${esc(h.desc)}</div>${mathEq(h.eq,h.rel)}</div>`).join('')+'</div><div class="btns"><button class="bigbtn" data-act="close">Fermer</button></div>');
$('#tip').addEventListener('click',e=>{if(e.target.id==='tipX'){state.tipClosed=true;render()}});
$('#isobar').addEventListener('click',e=>{if(e.target.id==='btnValid')win()});
$('#btnGen').onclick=startRandom;
$('#btnExpBack').onclick=toHome;$('#btnExpGo').onclick=startExp;
$('#expInput').addEventListener('input',expPreview);$('#expGoal').addEventListener('input',expPreview);
$('#expInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!$('#btnExpGo').disabled)startExp()});
$('#coachSkip').onclick=()=>{stopCoach();render()};
$('#btnMute').onclick=()=>{OPTS.mute=!OPTS.mute;saveOpts();$('#btnMute').textContent=OPTS.mute?'🔇':'🔊';sfx('pop')};
$('#optTeacher').onchange=e=>{if(!e.target.checked){TEACHER=false;renderHome();return}e.target.checked=false;askProfCode()};
function askProfCode(){
  const wait=Math.ceil((profLockUntil-Date.now())/1000);
  if(wait>0){toast(`🔒 Trop d'essais : attends ${wait} s.`,'warn');return}
  modal(`<h2>🔒 Mode professeur</h2><p>Tape le code professeur pour ouvrir tous les mondes.<br><small>Il se désactive tout seul quand on ferme la page.</small></p>
   <input id="profCode" class="profcode" type="password" inputmode="numeric" autocomplete="off" maxlength="12" placeholder="••••">
   <div id="profMsg" class="profmsg"></div>
   <div class="btns"><button class="ghostbtn" data-act="close">Annuler</button><button class="bigbtn" id="profOk">Valider</button></div>`,'intro');
  const inp=$('#profCode');setTimeout(()=>inp.focus(),50);
  const go=()=>{if(profHash(inp.value.trim())===PROF_H){profFails=0;TEACHER=true;closeModal();renderHome();sfx('badge');toast('🔓 Mode professeur activé : tous les mondes sont ouverts jusqu\'à la fermeture de la page.')}
    else{profFails++;inp.value='';sfx('fail');if(profFails>=3){profFails=0;profLockUntil=Date.now()+60000;closeModal();toast("🔒 Code incorrect 3 fois : réessaie dans 1 minute.",'warn')}
      else $('#profMsg').textContent=`Code incorrect (${3-profFails} essai${3-profFails>1?'s':''} restant${3-profFails>1?'s':''}).`}};
  $('#profOk').onclick=go;inp.onkeydown=e=>{if(e.key==='Enter')go()};
}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!$('#game').classList.contains('hidden')){e.preventDefault();undo()}});
window.addEventListener('resize',()=>{if(state.coach)coachShow()});
document.documentElement.style.setProperty('--acc','#ff8c42');
try{setSpec(localStorage.getItem('isoleX_spec')||'sin')}catch(e){setSpec('sin')}
applyOpts();renderHome();checkSaveLink();
if(location.hash==='#labo')showExp();
