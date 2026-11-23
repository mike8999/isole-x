"use strict";
/* =====================================================================
   PHYSIC'S & CO — bloc Chimie : équilibrer les équations (STI2D)
   ===================================================================== */
const CHEM=[
{k:'comb',name:'Combustions',icon:'🔥',acc:'#e4572e',levels:[
 {r:'H2 + O2 -> H2O',s:[2,1,2],n:"Combustion du dihydrogène (pile, fusée)",coach:true},
 {r:'C + O2 -> CO',s:[2,1,2],n:"Combustion incomplète du carbone : formation de monoxyde de carbone"},
 {r:'CH4 + O2 -> CO2 + H2O',s:[1,2,1,2],n:"Combustion du méthane (gaz naturel, chaudière)"},
 {r:'C3H8 + O2 -> CO2 + H2O',s:[1,5,3,4],n:"Combustion du propane (bouteille de gaz)"},
 {r:'C2H5OH + O2 -> CO2 + H2O',s:[1,3,2,3],n:"Combustion de l'éthanol (bioéthanol)"},
 {r:'C4H10 + O2 -> CO2 + H2O',s:[2,13,8,10],n:"Combustion du butane : astuce, commence par C puis H, et équilibre O en dernier"},
 {r:'C6H12O6 + O2 -> CO2 + H2O',s:[1,6,6,6],n:"Combustion du glucose (respiration, bois)"},
 {r:'CH4 + O2 -> CO + H2O',s:[2,3,2,4],n:"Combustion incomplète du méthane : danger CO !"},
 {r:'C2H2 + O2 -> CO2 + H2O',s:[2,5,4,2],n:"Combustion de l'acétylène (poste de soudure)"},
 {r:'C8H18 + O2 -> CO2 + H2O',s:[2,25,16,18],n:"Combustion de l'octane (essence) : niveau ultime !"},
]},
{k:'redox',name:'Oxydoréduction',icon:'⚡',acc:'#1e88e5',levels:[
 {r:'H2O -> H2 + O2',s:[2,2,1],n:"Électrolyse de l'eau : production d'hydrogène"},
 {r:'Fe + O2 -> Fe2O3',s:[4,3,2],n:"Corrosion du fer : la rouille"},
 {r:'Zn + Ag^+ -> Zn^2+ + Ag',s:[1,2,1,2],n:"Pile zinc-argent : les charges électriques doivent aussi être équilibrées",intro:'charge'},
 {r:'Cu^2+ + e- -> Cu',s:[1,2,1],n:"Demi-équation : réduction des ions cuivre",intro:'electron'},
 {r:'Al -> Al^3+ + e-',s:[1,1,3],n:"Demi-équation : oxydation de l'aluminium"},
 {r:'H2 -> H^+ + e-',s:[1,2,2],n:"Pile à combustible : réaction à l'anode"},
 {r:'O2 + H^+ + e- -> H2O',s:[1,4,4,2],n:"Pile à combustible : réaction à la cathode"},
 {r:'Ag^+ + Cu -> Ag + Cu^2+',s:[2,1,2,1],n:"Dépôt d'argent sur un fil de cuivre"},
 {r:'Al + Cu^2+ -> Al^3+ + Cu',s:[2,3,2,3],n:"L'aluminium réduit les ions cuivre"},
 {r:'MnO4^- + H^+ + Fe^2+ -> Mn^2+ + Fe^3+ + H2O',s:[1,8,5,1,5,4],n:"Dosage par le permanganate : niveau ultime !"},
]},
{k:'acid',name:'Acides et bases',icon:'🧪',acc:'#2e9e5b',levels:[
 {r:'H2SO4 + OH^- -> SO4^2- + H2O',s:[1,2,1,2],n:"Neutralisation de l'acide sulfurique par les ions hydroxyde"},
 {r:'HCl + Ca(OH)2 -> CaCl2 + H2O',s:[2,1,1,2],n:"Acide chlorhydrique + chaux éteinte"},
 {r:'Pb^2+ + I^- -> PbI2',s:[1,2,1],n:"Précipité jaune d'iodure de plomb : la « pluie d'or »"},
 {r:'H2SO4 + NaOH -> Na2SO4 + H2O',s:[1,2,1,2],n:"Acide sulfurique + soude"},
 {r:'Cu^2+ + OH^- -> Cu(OH)2',s:[1,2,1],n:"Précipité bleu d'hydroxyde de cuivre (test des ions Cu²⁺)"},
 {r:'Mg + H^+ -> Mg^2+ + H2',s:[1,2,1,1],n:"Attaque du magnésium par un acide"},
 {r:'Fe^3+ + OH^- -> Fe(OH)3',s:[1,3,1],n:"Précipité rouille d'hydroxyde de fer III"},
 {r:'CaCO3 + H^+ -> Ca^2+ + CO2 + H2O',s:[1,2,1,1,1],n:"Détartrage du calcaire par un acide"},
 {r:'H3PO4 + NaOH -> Na3PO4 + H2O',s:[1,3,1,3],n:"Acide phosphorique + soude"},
 {r:'Al(OH)3 + H^+ -> Al^3+ + H2O',s:[1,3,1,3],n:"Dissolution de l'hydroxyde d'aluminium : niveau ultime !"},
]},
{k:'mat',name:'Matériaux et énergie',icon:'🏭',acc:'#f4b400',levels:[
 {r:'Mg + O2 -> MgO',s:[2,1,2],n:"Combustion du magnésium (alliages légers)"},
 {r:'N2 + H2 -> NH3',s:[1,3,2],n:"Synthèse de l'ammoniac (engrais)"},
 {r:'Li + O2 -> Li2O',s:[4,1,2],n:"Oxydation du lithium (batteries)"},
 {r:'C6H12O6 -> C2H5OH + CO2',s:[1,2,2],n:"Fermentation : production de bioéthanol"},
 {r:'SiO2 + C -> Si + CO',s:[1,2,1,2],n:"Production du silicium (panneaux photovoltaïques)"},
 {r:'Fe2O3 + CO -> Fe + CO2',s:[1,3,2,3],n:"Haut fourneau : production de la fonte"},
 {r:'Al2O3 -> Al + O2',s:[2,4,3],n:"Électrolyse de l'alumine : production de l'aluminium"},
 {r:'CH4 + H2O -> CO + H2',s:[1,1,1,3],n:"Vaporeformage : production d'hydrogène"},
 {r:'Fe3O4 + H2 -> Fe + H2O',s:[1,4,3,4],n:"Réduction de la magnétite par l'hydrogène (acier vert)"},
 {r:'CO2 + H2O -> C6H12O6 + O2',s:[6,6,1,6],n:"Photosynthèse : niveau ultime !"},
]},
];
const COLORS={H:'#f1f1f1',C:'#2b2b2b',O:'#e53935',N:'#3f51b5',S:'#fdd835',Cl:'#43a047',Na:'#8e24aa',Ca:'#9e9e9e',Fe:'#ef6c00',Cu:'#b87333',Zn:'#78909c',Al:'#b0bec5',Mg:'#66bb6a',Ag:'#cfd8dc',Mn:'#ab47bc',Pb:'#546e7a',I:'#6a1b9a',P:'#ff9800',Li:'#ec407a',Si:'#8d6e63'};

/* ---------- analyse des formules ---------- */
function parseSpecies(str){
  str=str.trim();if(str==='e-')return{f:'e-',atoms:{},charge:-1,html:'e<sup>−</sup>'};
  let charge=0,body=str;const m=str.match(/\^(\d*)([+-])$/);if(m){charge=(m[1]?+m[1]:1)*(m[2]==='+'?1:-1);body=str.slice(0,m.index)}
  let i=0;function group(){const at={};while(i<body.length&&body[i]!==')'){
      if(body[i]==='('){i++;const g=group();i++;const n=num();for(const k in g)at[k]=(at[k]||0)+g[k]*n;continue}
      const mm=body.slice(i).match(/^([A-Z][a-z]?)/);if(!mm)throw new Error('Formule : '+str);i+=mm[1].length;const n=num();at[mm[1]]=(at[mm[1]]||0)+n}return at}
  function num(){const mm=body.slice(i).match(/^\d+/);if(!mm)return 1;i+=mm[0].length;return+mm[0]}
  const atoms=group();
  const html=body.replace(/(\d+)/g,'<sub>$1</sub>')+(charge?`<sup>${Math.abs(charge)>1?Math.abs(charge):''}${charge>0?'+':'−'}</sup>`:'');
  return{f:str,atoms,charge,html};
}
function parseReaction(r){const [L,R]=r.split('->');const sp=[...L.split(' + ').map(s=>({...parseSpecies(s),side:0})),...R.split(' + ').map(s=>({...parseSpecies(s),side:1}))];return sp}
function counts(sp,co){const el={},ch=[0,0];sp.forEach((s,i)=>{for(const k in s.atoms){el[k]=el[k]||[0,0];el[k][s.side]+=s.atoms[k]*co[i]}ch[s.side]+=s.charge*co[i]});return{el,ch}}
const hasCharge=sp=>sp.some(s=>s.charge);
function balanced(sp,co){const c=counts(sp,co);return Object.values(c.el).every(v=>v[0]===v[1])&&c.ch[0]===c.ch[1]}
const gcdA=a=>a.reduce((x,y)=>{while(y){[x,y]=[y,x%y]}return x});

/* ---------- état ---------- */
const $=q=>document.querySelector(q);
const esc=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const st={mode:'level',ti:0,li:0,sp:[],co:[],moves:0,par:0,undo:[],won:false,coach:null,lv:null};
let PROG={};try{PROG=JSON.parse(localStorage.getItem('chem_v1')||'{}')}catch(e){}
const saveProg=()=>{try{localStorage.setItem('chem_v1',JSON.stringify(PROG))}catch(e){}};
let SEEN={};try{SEEN=JSON.parse(localStorage.getItem('chem_v1_seen')||'{}')}catch(e){}
const saveSeen=()=>{try{localStorage.setItem('chem_v1_seen',JSON.stringify(SEEN))}catch(e){}};
const setAcc=c=>document.documentElement.style.setProperty('--acc',c);

/* ---------- jeu ---------- */
function startLevel(ti,li,mode='level'){
  st.mode=mode;st.ti=ti;st.li=li;const th=CHEM[ti],lv=th.levels[li];st.lv=lv;setAcc(th.acc);
  st.sp=parseReaction(lv.r);st.co=st.sp.map(()=>1);st.moves=0;st.undo=[];st.won=false;
  st.par=lv.s.reduce((a,b)=>a+b,0)-lv.s.length;
  $('#lvlNum').textContent=mode==='random'?'🎲':`${li+1}/10`;$('#lvlTitle').textContent=th.name;
  $('#tip').innerHTML=`<span class="tagacc"></span><span>${esc(lv.n)}</span>`;
  show('game');render();
  if(lv.coach&&!SEEN.coach){SEEN.coach=1;saveSeen();startCoach()}
  else if(lv.intro&&!SEEN[lv.intro]){showIntro([lv.intro])}
}
function bump(i,d){
  if(st.won)return;const v=st.co[i]+d;if(v<1||v>40)return;
  st.undo.push(st.co.slice());st.co[i]=v;st.moves++;render();
  const el=document.querySelector(`[data-coef="${i}"]`);if(el){el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump')}
  if(balanced(st.sp,st.co)&&gcdA(st.co)===1)win();
}
function undo(){if(st.won||!st.undo.length)return;st.co=st.undo.pop();st.moves--;render()}
let winT;
function win(){if(st.won)return;st.won=true;render();winT=setTimeout(showWin,600)}
function score(){const g=gcdA(st.co);const stars=st.moves<=st.par+2?3:st.moves<=st.par+6?2:1;const simp=g===1;return{stars,simp,points:stars*100+(simp?50:0)}}
function render(){
  const c=counts(st.sp,st.co);const pend=null;void pend;
  const side=s=>st.sp.map((p,i)=>p.side!==s?'':`${st.sp.findIndex(q=>q.side===s)===i?'':'<span class="cplus">+</span>'}
    <div class="mol"><button class="cbtn up" data-up="${i}" aria-label="Augmenter">▲</button>
      <div class="coef${st.co[i]>1?'':' one'}" data-coef="${i}">${st.co[i]}</div>
      <button class="cbtn dn" data-dn="${i}" ${st.co[i]<=1?'disabled':''} aria-label="Diminuer">▼</button>
      <div class="formula">${p.html}</div><div class="balls">${ballsOf(p)}</div></div>`).join('');
  $('#reaction').innerHTML=`<div class="rside">${side(0)}</div><div class="arrow">⟶</div><div class="rside">${side(1)}</div>`;
  const rows=Object.keys(c.el).map(k=>row(k,c.el[k][0],c.el[k][1],`<span class="atom" style="--a:${COLORS[k]||'#888'}">${k}</span>`));
  if(hasCharge(st.sp))rows.push(row('q',c.ch[0],c.ch[1],'<span class="atom q">±</span>',true));
  $('#counter').innerHTML=rows.join('');
  const ok=balanced(st.sp,st.co),g=gcdA(st.co);
  $('#moves').innerHTML=`Coup <b>${st.moves}</b> / ${st.par+2}`;
  const bar=$('#isobar');
  if(ok&&g>1&&!st.won){bar.classList.remove('hidden');bar.innerHTML=`<span>✅ Équilibrée ! ✨ Mais tous les coefficients sont divisibles par <b>${g}</b> : simplifie-les pour <b>+50 points</b>.</span><button class="bigbtn" id="btnValid">Valider</button>`}
  else bar.classList.add('hidden');
  coachCheck();
}
function ballsOf(p){let h='';for(const k in p.atoms){const n=p.atoms[k];h+=`<span class="bgrp">${n<=6?`<i style="--a:${COLORS[k]||'#888'}"></i>`.repeat(n):`<i style="--a:${COLORS[k]||'#888'}"></i><b>×${n}</b>`}</span>`}return h}
function row(k,l,r,lab,charge){
  const ok=l===r;const d=Math.max(-1,Math.min(1,(r-l)/Math.max(1,Math.max(Math.abs(l),Math.abs(r)))));const ang=(d*14).toFixed(1);
  const fmt=v=>charge?(v>0?'+'+v:v<0?'−'+(-v):'0'):v;
  return`<div class="crow${ok?' ok':''}" data-el="${k}">${lab}<span class="cnt">${fmt(l)}</span>
    <svg class="scale" viewBox="0 0 80 40"><path d="M40 8v26M28 36h24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><g style="transform:rotate(${ang}deg);transform-origin:40px 9px;transition:transform .4s"><path d="M8 9h64" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M8 9l-6 12h12zM72 9l-6 12h12z" fill="currentColor" opacity=".55"/></g><circle cx="40" cy="8" r="3" fill="currentColor"/></svg>
    <span class="cnt">${fmt(r)}</span><span class="cstat">${ok?'✓':'✗'}</span></div>`;
}
function hint(){
  if(st.won)return;const c=counts(st.sp,st.co),sol=st.lv.s;
  if(balanced(st.sp,st.co)){const g=gcdA(st.co);toast(`💡 Divise tous les coefficients par ${g} : utilise les ▼.`,'hintt',5000);return}
  const m=Math.max(...st.co.map((v,i)=>Math.ceil(v/sol[i])));const tgt=sol.map(v=>v*m);
  const cand=st.sp.map((p,i)=>i).filter(i=>st.co[i]<tgt[i]);
  for(const k in c.el){const [l,r]=c.el[k];if(l===r)continue;const i=cand.find(i=>st.sp[i].atoms[k]);
    if(i!==undefined){flash(i);toast(`💡 <b>${k}</b> : ${l} à gauche, ${r} à droite. Augmente le coefficient de <b>${st.sp[i].html}</b>.`,'hintt',5500);return}}
  if(cand.length){const i=cand[0];flash(i);toast(c.ch[0]!==c.ch[1]?`💡 Charges : ${c.ch[0]} à gauche, ${c.ch[1]} à droite. Augmente <b>${st.sp[i].html}</b>.`:`💡 Augmente le coefficient de <b>${st.sp[i].html}</b>.`,'hintt',5500)}
}
function hintIdx(){const sol=st.lv.s;const m=Math.max(...st.co.map((v,i)=>Math.ceil(v/sol[i])));const tgt=sol.map(v=>v*m);const c=counts(st.sp,st.co);const cand=st.sp.map((p,i)=>i).filter(i=>st.co[i]<tgt[i]);
  for(const k in c.el){const [l,r]=c.el[k];if(l===r)continue;const i=cand.find(i=>st.sp[i].atoms[k]);if(i!==undefined)return i}return cand[0]}
function flash(i){const el=document.querySelector(`[data-coef="${i}"]`);if(el){el.classList.remove('hint');void el.offsetWidth;el.classList.add('hint')}}

/* ---------- toast / modales ---------- */
let toastT;
function toast(msg,cls='',ms=3200){const t=$('#toast');t.innerHTML=msg;t.className='show '+cls;clearTimeout(toastT);toastT=setTimeout(()=>t.className=cls,ms)}
function modal(html,cls=''){clearTimeout(toastT);$('#toast').className='';$('#mbox').className='mbox '+cls;$('#mbox').innerHTML=html;$('#modal').classList.remove('hidden')}
function closeModal(){$('#modal').classList.add('hidden');$('#mbox').innerHTML=''}
const starHTML=k=>[1,2,3].map(i=>`<span class="${i<=k?'':'off'}">★</span>`).join('');
function eqHTML(){return st.sp.map((p,i)=>`${i&&st.sp[i-1].side===p.side?' + ':i?' ⟶ ':''}${st.co[i]>1?`<b>${st.co[i]}</b> `:''}${p.html}`).join('')}
function showWin(){
  const sc=score();
  if(st.mode==='level'){const k=st.ti+'-'+st.li,o=PROG[k]||{s:0,p:0};PROG[k]={s:Math.max(o.s,sc.stars),p:Math.max(o.p,sc.points)};saveProg()}
  const nx=st.mode==='level'?nextLevel():null;
  modal(`<h2>Équation équilibrée ! ⚖</h2><div class="stars">${starHTML(sc.stars)}</div>
   <div class="pts">${sc.points} points ${sc.simp?'<span class="simp">✨ plus petits coefficients +50</span>':''}</div>
   <div>${st.moves} coup${st.moves>1?'s':''} — maxi ${st.par+2} pour ★★★</div>
   <div class="sol chem">${eqHTML()}</div>
   <div class="btns"><button class="ghostbtn" data-act="replay">⟲ Rejouer</button><button class="ghostbtn" data-act="menu">Menu</button>
   ${st.mode==='random'?'<button class="bigbtn" data-act="again">Autre défi 🎲</button>':nx?'<button class="bigbtn" data-act="next">Défi suivant ▶</button>':''}</div>`);
}
function nextLevel(){if(st.li<9)return[st.ti,st.li+1];if(st.ti+1<CHEM.length)return[st.ti+1,0];return null}
$('#modal').addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b){if(e.target.id==='modal'&&!st.won)closeModal();return}
  const a=b.dataset.act;closeModal();
  if(a==='close'){if(introKeys){introKeys.forEach(k=>SEEN[k]=1);saveSeen();introKeys=null}return}
  if(a==='next'){const n=nextLevel();startLevel(n[0],n[1])}else if(a==='replay')startLevel(st.ti,st.li,st.mode);else if(a==='again')startRandom();else if(a==='menu')toMenu();
  else if(a==='tuto'){SEEN.coach=0;startLevel(0,0)}});

/* ---------- aide animée ---------- */
const SC={
 bump:{t:'Touche ▲ : une molécule de plus.',h:`<div class="cs"><div class="mini"><span class="mbtn pulse">▲</span><span class="mcoef roll"><span>1</span><span>2</span></span><span class="mf">H<sub>2</sub>O</span></div></div>`},
 atoms:{t:'Chaque atome : autant à gauche qu’à droite.',h:`<div class="cs"><div class="mrow"><span class="atom" style="--a:#e53935">O</span><span class="mcnt">2</span><svg class="scale tilt" viewBox="0 0 80 40"><path d="M40 8v26M28 36h24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><g class="beam"><path d="M8 9h64" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M8 9l-6 12h12zM72 9l-6 12h12z" fill="currentColor" opacity=".55"/></g></svg><span class="mcnt roll2"><span>1</span><span>2</span></span><span class="cstat roll3"><span>✗</span><span>✓</span></span></div></div>`},
 charge:{t:'Les charges électriques doivent aussi être égales.',h:`<div class="cs"><div class="mini"><span class="mf">Zn</span> + <span class="mcoef roll"><span>1</span><span>2</span></span><span class="mf">Ag<sup>+</sup></span> ⟶ <span class="mf">Zn<sup>2+</sup></span> + <span class="mf">2 Ag</span></div><div class="mrow"><span class="atom q">±</span><span class="mcnt roll"><span>+1</span><span>+2</span></span><svg class="scale" viewBox="0 0 80 40"><path d="M40 8v26M28 36h24M8 9h64" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><span class="mcnt">+2</span><span class="cstat roll3"><span>✗</span><span>✓</span></span></div></div>`},
 electron:{t:'Un électron e⁻ compte pour une charge −1.',h:`<div class="cs"><div class="mini"><span class="mf">Cu<sup>2+</sup></span> + <span class="mcoef roll"><span>1</span><span>2</span></span><span class="mf">e<sup>−</sup></span> ⟶ <span class="mf">Cu</span></div><div class="mrow"><span class="atom q">±</span><span class="mcnt roll"><span>+1</span><span>0</span></span><span class="mcnt">0</span><span class="cstat roll3"><span>✗</span><span>✓</span></span></div></div>`},
 simp:{t:'✨ Les plus petits coefficients possibles : +50 points.',h:`<div class="cs"><div class="mini"><span class="mcoef roll"><span>4</span><span>2</span></span><span class="mf">H<sub>2</sub></span> + <span class="mcoef roll"><span>2</span><span>1</span></span><span class="mf">O<sub>2</sub></span> ⟶ <span class="mcoef roll"><span>4</span><span>2</span></span><span class="mf">H<sub>2</sub>O</span></div></div>`},
};
const sc=k=>`<div class="scard"><div class="scene chemscene">${SC[k].h}</div><div class="scap">${SC[k].t}</div></div>`;
let introKeys=null;
function showIntro(keys){introKeys=keys;modal(`<h2>Nouveau !</h2><div class="sgrid n${keys.length}">${keys.map(sc).join('')}</div><div class="btns"><button class="bigbtn" data-act="close">À moi !</button></div>`,'intro')}
function showHelp(){modal(`<h2>Aide animée</h2><div class="sgrid">${Object.keys(SC).map(sc).join('')}</div><div class="btns"><button class="ghostbtn" data-act="tuto">▶ Revoir le tutoriel</button><button class="bigbtn" data-act="close">Fermer</button></div>`,'help')}

/* ---------- tutoriel guidé ---------- */
const COACH=[
 {cap:'Compte les <b>O</b> : 2 à gauche, 1 à droite. Touche <b>▲</b> sous H₂O',el:()=>document.querySelector('[data-up="2"]'),done:()=>st.co[2]>=2},
 {cap:'Maintenant les <b>H</b> : 2 à gauche, 4 à droite. Touche <b>▲</b> sous H₂',el:()=>document.querySelector('[data-up="0"]'),done:()=>st.co[0]>=2||st.won},
];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function startCoach(){st.coach={step:0,run:0};$('#coach').classList.remove('hidden');coachShow()}
function stopCoach(){st.coach=null;$('#coach').classList.add('hidden')}
function coachCheck(){if(!st.coach)return;let ch=false;while(st.coach.step<COACH.length&&COACH[st.coach.step].done()){st.coach.step++;ch=true}if(st.coach.step>=COACH.length)return stopCoach();if(ch)coachShow()}
function coachShow(){const co=st.coach;co.run++;const run=co.run,step=COACH[co.step];$('#coachCap').innerHTML=`<span class="cnum">${co.step+1}/${COACH.length}</span> ${step.cap}`;
  (async()=>{const hand=$('#coachHand');while(st.coach&&st.coach.run===run){await sleep(500);const el=step.el();if(!el)continue;const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
    hand.style.opacity=1;await hand.animate([{transform:`translate(${x+40}px,${y+60}px)`},{transform:`translate(${x}px,${y}px)`}],{duration:500,fill:'forwards'}).finished;
    await hand.animate([{transform:`translate(${x}px,${y}px) scale(1)`},{transform:`translate(${x}px,${y}px) scale(.75)`},{transform:`translate(${x}px,${y}px) scale(1)`}],{duration:420,fill:'forwards'}).finished;
    await sleep(300);hand.style.opacity=0;await sleep(700)}})()}

/* ---------- menus ---------- */
function show(id){['menu','game'].forEach(k=>$('#'+k).classList.toggle('hidden',k!==id));if(id!=='game')stopCoach();window.scrollTo(0,0)}
let rndThemes=new Set(['comb']);
function toMenu(){clearTimeout(winT);closeModal();setAcc('#e4572e');renderMenu();show('menu')}
function renderMenu(){
  $('#themes').innerHTML=CHEM.map((th,ti)=>{let s=0,p=0;th.levels.forEach((_,li)=>{const o=PROG[ti+'-'+li];if(o){s+=o.s;p+=o.p}});
    return`<div class="chap" style="--acc:${th.acc}"><h2><span><span class="chico">${th.icon}</span> ${esc(th.name)}</span><small>★ ${s}/30 · ${p} pts</small></h2>
     <div class="lvls">${th.levels.map((lv,li)=>{const o=PROG[ti+'-'+li];const k=o?o.s:0;return`<button class="lvbtn${o?' done':''}${li===9?' ultime':''}" data-t="${ti}" data-l="${li}" title="${esc(lv.r)}">${li+1}<small>${'★'.repeat(k)+'☆'.repeat(3-k)}</small></button>`}).join('')}</div></div>`}).join('');
  document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>startLevel(+b.dataset.t,+b.dataset.l));
  $('#rndChips').innerHTML=CHEM.map(t=>`<button class="chip${rndThemes.has(t.k)?' on':''}" data-rt="${t.k}">${rndThemes.has(t.k)?'☑':'☐'} ${t.icon} ${esc(t.name)}</button>`).join('');
  document.querySelectorAll('[data-rt]').forEach(b=>b.onclick=()=>{const k=b.dataset.rt;if(rndThemes.has(k)){if(rndThemes.size>1)rndThemes.delete(k)}else rndThemes.add(k);renderMenu()});
}
function startRandom(){
  const pool=[];CHEM.forEach((t,ti)=>{if(rndThemes.has(t.k))t.levels.forEach((_,li)=>pool.push([ti,li]))});
  const notMastered=pool.filter(([ti,li])=>!(PROG[ti+'-'+li]&&PROG[ti+'-'+li].s===3));const src=notMastered.length?notMastered:pool;
  const [ti,li]=src[Math.floor(Math.random()*src.length)];startLevel(ti,li,'random');
}

/* ---------- événements ---------- */
$('#reaction').addEventListener('click',e=>{const u=e.target.closest('[data-up]'),d=e.target.closest('[data-dn]');if(u)bump(+u.dataset.up,1);else if(d)bump(+d.dataset.dn,-1)});
$('#btnBack').onclick=toMenu;$('#btnUndo').onclick=undo;$('#btnHint').onclick=hint;$('#btnReset').onclick=()=>startLevel(st.ti,st.li,st.mode);
$('#btnHelp').onclick=showHelp;$('#btnHelpMenu').onclick=showHelp;
/* apparence : thèmes (les thèmes à pièces se débloquent dans Isole x !) */
LOOK.init('etabli');
function showLook(){modal(LOOK.html(),'lookbox')}
$('#btnLookMenu').onclick=showLook;
$('#mbox').addEventListener('click',e=>{if(!e.target.closest('[data-lk]')||!$('#mbox').classList.contains('lookbox'))return;const r=LOOK.click(e.target);if(!r)return;
  if(r.act){closeModal();if(!$('#game').classList.contains('hidden'))render();else renderMenu();if(r.msg)toast(r.msg);return}
  const sc=LOOK.scrollEl().scrollTop;showLook();LOOK.scrollEl().scrollTop=sc;if(r.msg)toast(r.msg,r.warn?'warn':'')});
const _closeModal=closeModal;closeModal=function(){if($('#mbox').classList.contains('lookbox'))LOOK.cancel();_closeModal()};
const _render=render;render=function(){_render.apply(this,arguments);LOOK.fit()};$('#btnRnd').onclick=startRandom;
$('#isobar').addEventListener('click',e=>{if(e.target.id==='btnValid')win()});
$('#coachSkip').onclick=stopCoach;
renderMenu();
