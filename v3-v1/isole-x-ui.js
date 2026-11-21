"use strict";
/* =====================================================================
   INTERFACE — rendu, glisser-déposer, menus, modes, tutoriel, aide animée
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
  $('#goalBig').innerHTML=state.goal?`<span class="glab">🎯 Objectif</span>${mathEq([[T([S(state.target)])],state.goalSum])}`:'';
  $('#goalBig').classList.toggle('hidden',!state.goal);
  const tilt=pend?((1-pend.side)===0?-1:1)*(pend.w||1)*2:0;
  boardEl.style.transform=`rotate(${tilt}deg)`;boardEl.classList.toggle('tilted',!!pend);
  const bar=$('#isobar');
  if(iso>=0&&!state.won&&!pend&&!state.coach){
    bar.classList.remove('hidden');
    if(state.goal)bar.innerHTML=`<span>✅ <b>${esc(state.target)}</b> est isolé, mais il faut arriver à 🎯 ${mathEq([[T([S(state.target)])],state.goalSum])}. Continue à simplifier !</span>`;
    else{const left=Math.max(0,state.isoAt+state.bonusMax-state.moves);
      bar.innerHTML=`<span>✅ <b>${esc(state.target)}</b> est isolé ! ✨ Simplifie au maximum${left?` (encore ${left} coup${left>1?'s':''} bonus)`:''} pour <b>+50 points</b>.</span><button class="bigbtn" id="btnValid">Valider</button>`}
  }else bar.classList.add('hidden');
  $('#mathline').innerHTML=state.trad?`<span class="lab">Équation :</span>${mathEq(state.eq)}`:'';
  $('#mathline').classList.toggle('hidden',!state.trad);
  $('#history').classList.toggle('hidden',!state.trad);
  $('#history').innerHTML='<h3>Traduction pas à pas</h3>'+state.history.map((h,i)=>`<div class="hstep"><div class="d">${i}. ${esc(h.desc)}</div>${mathEq(h.eq)}</div>`).join('');
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
function fail(msg){if(SILENT)return false;toast(msg,'warn',4000);const b=$('#board');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');return false}
function modal(html,cls=''){hideToast();$('#mbox').className='mbox '+cls;$('#mbox').innerHTML=html;$('#modal').classList.remove('hidden');animateScenes($('#mbox'))}
function closeModal(){$('#modal').classList.add('hidden');$('#mbox').innerHTML=''}
function starHTML(k){return[1,2,3].map(i=>`<span class="${i<=k?'':'off'}">★</span>`).join('')}
function showWin(){
  const sc=scoreOf();let next='';
  if(state.mode==='level'){const k=progKey(state.ci,state.li),old=PROG[k]||{s:0,p:0};PROG[k]={s:Math.max(old.s,sc.stars),p:Math.max(old.p,sc.points)};saveProg();
    next=nextLevel()?`<button class="bigbtn" data-act="next">Défi suivant ▶</button>`:''}
  else if(state.mode==='random')next=`<button class="bigbtn" data-act="again">Nouvelle équation 🎲</button>`;
  else next=`<button class="bigbtn" data-act="expback">Autre équation 🧪</button>`;
  modal(`<h2>${esc(state.target)} est isolé ! 🎉</h2>${state.par?`<div class="stars">${starHTML(sc.stars)}</div>`:''}
   <div class="pts">${sc.points} points ${sc.simp?'<span class="simp">✨ simplification maximale +50</span>':'<span class="nosimp">pas simplifié au maximum</span>'}</div>
   <div>${state.moves} coup${state.moves>1?'s':''}${state.par?` — maxi ${state.par} pour ★★★`:''}</div>
   <div class="sol">${mathEq(state.eq)}</div>
   <div class="btns"><button class="ghostbtn" data-act="replay">⟲ Rejouer</button><button class="ghostbtn" data-act="menu">Menu</button>${next}</div>`);
}
function nextLevel(){const CH=chapters(),ch=CH[state.ci];if(state.li+1<ch.levels.length)return[state.ci,state.li+1];if(state.ci+1<CH.length)return[state.ci+1,0];return null}
$('#modal').addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b){if(e.target.id==='modal'&&!state.won){closeModal();introDone()}return}
  const a=b.dataset.act;
  if(a==='close'){closeModal();introDone();return}
  if(a==='tuto'){closeModal();SEEN.coach_tuto1=false;state.spec=state.spec||'sin';startLevel(0,0);return}
  closeModal();
  if(a==='next'){const nx=nextLevel();startLevel(nx[0],nx[1])}
  else if(a==='replay')replay();
  else if(a==='again')startRandom();
  else if(a==='expback')showExp();
  else if(a==='menu')backFromGame();
});
let lastSetup=null;
function replay(){if(state.mode==='level')startLevel(state.ci,state.li);else if(lastSetup)setup(Object.assign({},lastSetup,{eq:clone(lastSetup.eq0),coach:null,intro:null}))}

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

/* ---------- écrans ---------- */
function showScreen(id){hideToast();['landing','menu','game','exp'].forEach(k=>$('#'+k).classList.toggle('hidden',k!==id));if(id!=='game')stopCoach();window.scrollTo(0,0)}
function setSpec(k){state.spec=k;document.documentElement.style.setProperty('--acc',SPECS[k].acc);try{localStorage.setItem('isoleX_spec',k)}catch(e){}}
function toMenu(){closeModal();renderMenu();showScreen('menu')}
function toLanding(){closeModal();renderLanding();showScreen('landing')}
function backFromGame(){if(state.mode==='exp')showExp();else toMenu()}
function chaptersFor(k){const o=state.spec;state.spec=k;const r=chapters();state.spec=o;return r}
function renderLanding(){
  const tile=k=>{const sp=SPECS[k];let st=0,tot=0,pts=0;chaptersFor(k).forEach((ch,ci)=>ch.levels.forEach((_,li)=>{tot+=3;const p=PROG[k+'|'+ci+'-'+li];if(p){st+=p.s;pts+=p.p}}));
    return`<button class="spec" data-spec="${k}" style="--c:${sp.acc}"><span class="specicon">${iconSVG(sp.icon)}</span><span class="sname">${esc(sp.name)}</span><span class="sfull">${esc(sp.full)}</span><span class="sstar">★ ${st}/${tot} · ${pts} pts</span></button>`};
  $('#specSI').innerHTML=tile('si');$('#specSTI').innerHTML=['sin','itec','ee','ac'].map(tile).join('');
  document.querySelectorAll('[data-spec]').forEach(b=>b.onclick=()=>{setSpec(b.dataset.spec);toMenu()});
}
let genDiff=0,genThemes=new Set(['mix']);
function renderMenu(){
  const sp=SPECS[state.spec];
  $('#specHead').innerHTML=`<span class="specicon">${iconSVG(sp.icon)}</span><div><div class="kicker">${esc(sp.cls)}</div><h1>${esc(sp.name)} <span>${esc(sp.full)}</span></h1></div>`;
  $('#chapters').innerHTML=chapters().map((ch,ci)=>{
    let st=0,pts=0;ch.levels.forEach((_,li)=>{const p=PROG[progKey(ci,li)];if(p){st+=p.s;pts+=p.p}});
    return`<div class="chap${ch.formula?' formula':''}"><h2><span><span class="chico">${esc(ch.icon)}</span> ${ci+1}. ${esc(ch.name)}</span> <small>★ ${st}/${ch.levels.length*3} · ${pts} pts</small></h2><div class="lvls">${ch.levels.map((lv,li)=>{const p=PROG[progKey(ci,li)];const s=p?p.s:0;
      const lab=ch.formula?`<b>${esc(lv.t)}</b>`:li+1;const ult=li===9?' ultime':'';
      return`<button class="lvbtn${p?' done':''}${ult}${lv.goal?' goal':''}" data-c="${ci}" data-l="${li}" title="${lv.goal?'Résultat précis demandé':''}">${lab}<small>${'★'.repeat(s)+'☆'.repeat(3-s)}</small>${lv.goal?'<i>🎯</i>':''}</button>`}).join('')}</div></div>`}).join('');
  document.querySelectorAll('.lvbtn').forEach(b=>b.onclick=()=>startLevel(+b.dataset.c,+b.dataset.l));
  $('#themeChips').innerHTML=THEMES.map(t=>`<button class="chip${genThemes.has(t.k)?' on':''}" data-theme="${t.k}" aria-pressed="${genThemes.has(t.k)}">${genThemes.has(t.k)?'☑':'☐'} ${esc(t.n)}</button>`).join('');
  document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{const k=b.dataset.theme;if(genThemes.has(k)){if(genThemes.size>1)genThemes.delete(k)}else genThemes.add(k);renderMenu()});
  document.querySelectorAll('[data-diff]').forEach(b=>{b.classList.toggle('on',+b.dataset.diff===genDiff);b.onclick=()=>{genDiff=+b.dataset.diff;renderMenu()}});
}
function startRandom(){
  const th=pick([...genThemes]);let g,tries=0;
  do{g=genTheme(th,genDiff);tries++;
    try{const eq=parseEq(g.e);g.ok=true;g.eq=eq}catch(e){g.ok=false}}while(!g.ok&&tries<10);
  state.mode='random';const o={eq:g.eq,target:g.t||(th==='cplx'?'z':'x'),goal:g.goal,tip:g.tip||'',box:genDiff===0,label:'🎲',
    title:'Aléatoire · '+THEMES.find(t=>t.k===th).n+' · '+['Facile','Moyen','Difficile'][genDiff]};
  lastSetup=Object.assign({},o,{eq0:clone(g.eq)});setup(o);
}

/* ---------- mode expérimental ---------- */
let expSel=null;
const EXAMPLES=['3x+2=11','x^2-5=20','e^(2x)=9','U=R*I','2sin(x)=1','(1+i)*z=2','P=U^2/R','a(x+b)=c'];
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
    state.mode='exp';const o={eq,target:expSel,goal:gv||null,box:$('#expBox').checked,label:'🧪',title:'Mode expérimental · isoler '+expSel,tip:''};
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
};
const HELP=[['Les bases',['flip','add','cancel','like','copy']],['Fractions',['frac','mul','gcd','product','neg']],['Boîtes et pioche',['dev','fact','deckop']],['Puissances et fonctions',['pow2','tool','recip','inv','eval','explog','trig','lncomb']],['Complexes',['i2','conj']],['Score',['goal','bonus']]];
const sceneHTML=k=>`<div class="scard"><div class="scene" data-scene="${k}"></div><div class="scap">${SCENES[k].t}</div></div>`;
function animateScenes(root){root.querySelectorAll('[data-scene]').forEach(el=>playScene(el,SCENES[el.dataset.scene]))}
async function playScene(el,sc){
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  modal(`<h2>Aide animée</h2><div class="helpgrid">${HELP.map(([t,ks])=>`<h3>${esc(t)}</h3><div class="sgrid">${ks.map(sceneHTML).join('')}</div>`).join('')}</div>
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

/* ---------- boutons ---------- */
$('#btnBack').onclick=backFromGame;$('#btnLand').onclick=toLanding;
$('#btnUndo').onclick=undo;$('#btnHint').onclick=hint;
$('#btnReset').onclick=replay;
$('#btnTrad').onclick=()=>{state.trad=!state.trad;$('#btnTrad').classList.toggle('on',state.trad);render()};
$('#btnHelp').onclick=showHelp;$('#btnHelpMenu').onclick=showHelp;$('#btnHelpLand').onclick=showHelp;
$('#btnHist').onclick=()=>modal('<h2>Traduction pas à pas</h2><div class="histlist">'+state.history.map((h,i)=>`<div class="hstep"><div class="d">${i}. ${esc(h.desc)}</div>${mathEq(h.eq)}</div>`).join('')+'</div><div class="btns"><button class="bigbtn" data-act="close">Fermer</button></div>');
$('#tip').addEventListener('click',e=>{if(e.target.id==='tipX'){state.tipClosed=true;render()}});
$('#isobar').addEventListener('click',e=>{if(e.target.id==='btnValid')win()});
$('#btnGen').onclick=startRandom;
$('#btnExp').onclick=showExp;$('#btnExpBack').onclick=toLanding;$('#btnExpGo').onclick=startExp;
$('#expInput').addEventListener('input',expPreview);$('#expGoal').addEventListener('input',expPreview);
$('#expInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!$('#btnExpGo').disabled)startExp()});
$('#coachSkip').onclick=()=>{stopCoach();render()};
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!$('#game').classList.contains('hidden')){e.preventDefault();undo()}});
window.addEventListener('resize',()=>{if(state.coach)coachShow()});
try{const k=localStorage.getItem('isoleX_spec');setSpec(k&&SPECS[k]?k:'sin')}catch(e){setSpec('sin')}
renderLanding();
if(location.hash==='#experimental')showExp();
