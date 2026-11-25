/* Neon Rush STI2D : appli élève (hub, quiz, cours, schémas, suivi, réglages) */
{
const NR=window.NR={};
const {TPL,draw}=window.NR_SCHEMAS;
const API="https://isole-x.netlify.app/.netlify/functions/neon-contenu";
const DOM={
 I2D:{n:"Tronc commun I2D",c:"#00FF41"},
 SIN:{n:"Systèmes d'information et numérique",c:"#00E5FF"},
 EE:{n:"Énergies et environnement",c:"#7CFFB2"},
 ITEC:{n:"Innovation technologique et éco-conception",c:"#A98BFF"},
 AC:{n:"Architecture et construction",c:"#4FA3FF"}};
NR.DOM=DOM;NR.API=API;

const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const pct=x=>Math.round((x||0)*100);
const norm=s=>String(s||"").trim().toLowerCase().replace(/\s+/g," ");
NR.$=$;NR.esc=esc;NR.shuf=shuf;

/* ---------- contenu (d'origine, en cache, ou enregistré par le professeur) ---------- */
const CK="neonrush-contenu",DK="neonrush-brouillon";
const clone=o=>JSON.parse(JSON.stringify(o));
const ok4=c=>c&&["questions","cartes","fiches","schemas"].every(k=>Array.isArray(c[k]));
let K=null;
try{K=JSON.parse(localStorage.getItem(CK))}catch(e){}
if(!ok4(K))K=Object.assign(clone(window.NEON_DEFAUT),{maj:null});
NR.dirty=false;try{NR.dirty=localStorage.getItem(DK)==="1"}catch(e){}
NR.K=()=>K;
NR.setK=(nk,opt={})=>{K=nk;try{localStorage.setItem(CK,JSON.stringify(K))}catch(e){}if(!opt.quiet)rAll()};
NR.persist=()=>{try{localStorage.setItem(CK,JSON.stringify(K));localStorage.setItem(DK,NR.dirty?"1":"0")}catch(e){}};
NR.defaut=()=>Object.assign(clone(window.NEON_DEFAUT),{maj:null});
async function sync(){try{const r=await fetch(API,{cache:"no-store"});const j=await r.json();if(!j.ok||NR.dirty)return;
 if(j.contenu&&ok4(j.contenu)){if(j.maj!==K.maj)NR.setK(Object.assign(j.contenu,{maj:j.maj}))}
 else if(!j.contenu&&K.maj)NR.setK(NR.defaut())}catch(e){}}
NR.sync=sync;

/* ---------- progression élève ---------- */
const KEY="neonrush-sti2d-v1";
let S=null;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
S=Object.assign({spec:Object.keys(DOM),len:8,motion:true,qs:{},cs:{},sc:{},hist:[],ans:[],tab:0},S||{});
if(!S.sc)S.sc={};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const day=t=>{const d=new Date(t);return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()};
const specs=()=>Object.keys(DOM).filter(k=>S.spec.includes(k));
const byD=(arr,d)=>arr.filter(x=>x.d===d);

function mast(d){const q=byD(K.questions,d),c=byD(K.cartes,d),s=byD(K.schemas,d);
 const a=q.filter(x=>S.qs[x.id]&&S.qs[x.id].ok).length,b=c.filter(x=>S.cs[x.id]).length,e=s.filter(x=>S.sc[x.id]).length;
 const tot=q.length+c.length+s.length;
 return{all:tot?(a+b+e)/tot:0,q:q.length?a/q.length:0,c:c.length?b/c.length:0,s:s.length?e/s.length:null}}
function globalM(){const s=specs();return s.reduce((t,d)=>t+mast(d).all,0)/(s.length||1)}
function streak(){const set=new Set(S.hist.map(h=>day(h.t)));let n=0,t=new Date();if(!set.has(day(t)))t.setDate(t.getDate()-1);while(set.has(day(t))){n++;t.setDate(t.getDate()-1)}return n}
const xp=()=>S.hist.reduce((t,h)=>t+(h.xp||0),0);
function acc(){const a=S.ans.slice(-20);return a.length?pct(a.reduce((x,y)=>x+y,0)/a.length)+"%":"—"}
const errs=()=>K.questions.filter(x=>specs().includes(x.d)&&S.qs[x.id]&&!S.qs[x.id].ok);

function ring(p,col,ticks){const r=ticks?47:52,L=2*Math.PI*r;let t="";
 if(ticks)for(let i=0;i<60;i++){const a=i*6*Math.PI/180,on=i/60<p,q=i%5?55.5:54;t+=`<line class="tk${on?" on":""}" x1="${60+58*Math.sin(a)}" y1="${60-58*Math.cos(a)}" x2="${60+q*Math.sin(a)}" y2="${60-q*Math.cos(a)}"/>`}
 return `<svg viewBox="0 0 120 120" aria-hidden="true">${t}<circle cx="60" cy="60" r="${r}" class="rt"/><circle cx="60" cy="60" r="${r}" class="rv" style="stroke:${col};--C:${L}" stroke-dasharray="${L}" stroke-dashoffset="${L*(1-p)}" transform="rotate(-90 60 60)"/></svg>`}
const editBtn=(cat,id)=>NR.prof?`<button class="edit-q" data-edit="${cat}" data-id="${esc(id)}">✎ Corriger ce contenu</button>`:"";

/* ---------- écrans ---------- */
function rDash(){const g=globalM(),s=specs();
 const weak=s.slice().sort((a,b)=>mast(a).all-mast(b).all)[0];
 const sch=byD(K.schemas,weak).find(x=>!S.sc[x.id])||byD(K.schemas,weak)[0];
 $("#dash").innerHTML=`
 <div><p class="mut" style="margin:0 0 4px;font-size:13px">Assistant révision STI2D</p><h1>Cockpit de révision</h1></div>
 <div class="gauge">${ring(g,"#00E5FF",true)}<div class="mid"><div class="num">${pct(g)}<small>%</small></div><span class="mut" style="font-size:13px">maîtrise globale</span></div></div>
 <div class="stats"><div class="box stat"><div class="num">${streak()}</div><span>jours de suite</span></div><div class="box stat"><div class="num">${xp()}</div><span>XP</span></div><div class="box stat"><div class="num">${acc()}</div><span>réussite (20 dern.)</span></div></div>
 <div class="box halo" style="display:grid;gap:12px">
  <h2>Mission suivante</h2>
  <p class="mut" style="margin:0">Point faible : <b style="color:${DOM[weak].c}">${weak}</b> à ${pct(mast(weak).all)} %. Un quiz ciblé fait remonter la jauge.</p>
  <div class="row"><button class="btn" data-quiz="${weak}">Quiz ${weak}</button><button class="btn c" data-cards="${weak}">Flashcards ${weak}</button>${sch?`<button class="btn v" data-schema="${esc(sch.id)}">Schéma ${weak}</button>`:""}</div>
 </div>
 <div><h2 style="margin-bottom:10px">Jauges par spécialité</h2><div class="doms">${s.map(d=>{const m=mast(d).all;return `<button class="dom" data-quiz="${d}" aria-label="Quiz ${DOM[d].n}"><div class="r">${ring(m,DOM[d].c)}<b>${pct(m)}</b></div><em style="color:${DOM[d].c}">${d}</em></button>`}).join("")}</div></div>
 <div class="tools"><button class="btn ghost sm" data-idees>Boîte à idées</button>${NR.prof?`<button class="btn v sm" data-editor>Éditeur de contenu</button>`:""}</div>
 <p class="hint">Balaye <b>← →</b> pour changer d'écran · <b>↑</b> depuis le bas pour les réglages · <b>↓</b> pour fermer une fenêtre</p>`}

function rQuizTab(){const s=specs(),last=S.hist.filter(h=>h.k==="quiz").slice(-1)[0],e=errs();
 $("#quizTab").innerHTML=`
 <div><h1>Quiz terminal</h1><p class="mut">${S.len} questions, priorité à celles que tu n'as pas encore réussies.</p></div>
 <div class="box halo" style="display:grid;gap:14px">
  <h2>Cible</h2>
  <div class="chips" role="radiogroup">${["ALL",...s].map((d,i)=>`<label class="chip"><input type="radio" name="qd" value="${d}"${i?"":" checked"}><span>${d==="ALL"?"Toutes":d}</span></label>`).join("")}</div>
  <button class="btn" id="goQuiz">Lancer le quiz</button>
 </div>
 <div class="box" style="display:grid;gap:10px">
  <h2>Mes erreurs</h2>
  <p class="mut" style="margin:0">${e.length?e.length+" question"+(e.length>1?"s":"")+" à retravailler.":"Aucune erreur en attente."}</p>
  ${e.length?`<button class="btn bad" data-quiz="ERR">Rejouer mes erreurs</button>`:""}
 </div>
 ${last?`<div class="box"><h2>Dernière session</h2><p class="mut" style="margin:6px 0 0">${esc(last.d)} · ${last.s}/${last.n} · +${last.xp} XP</p></div>`:""}`;
 $("#goQuiz").onclick=()=>startQuiz(($("input[name=qd]:checked")||{}).value||"ALL")}

function rCours(){const s=specs();
 $("#cours").innerHTML=`<div><h1>Cours</h1><p class="mut">Fiches de synthèse, schémas animés à compléter et flashcards.</p></div>
 ${s.map(d=>{const fi=byD(K.fiches,d),sc=byD(K.schemas,d),nc=byD(K.cartes,d).length;return `<div style="display:grid;gap:10px"><h2 style="color:${DOM[d].c}">${d} <span class="mut" style="font:400 13px Inter">· ${esc(DOM[d].n)}</span></h2>
  ${fi.map(f=>`<button class="box fiche" data-fiche="${esc(f.id)}"><h3>${esc(f.t)}</h3><span class="mut" style="font-size:14px">${(f.p||[]).length} points clés</span></button>`).join("")}
  ${sc.map(x=>`<button class="box fiche" data-schema="${esc(x.id)}" style="border-color:rgba(139,92,246,.45)"><h3>${S.sc[x.id]?"✓ ":""}Schéma · ${esc(x.titre)}</h3><span class="mut" style="font-size:14px">${esc((TPL[x.t]||{}).nom||"")} · à compléter</span></button>`).join("")}
  ${nc?`<button class="btn c sm" data-cards="${d}">${nc} flashcards ${d}</button>`:""}</div>`}).join("")}
 <button class="btn c" data-cards="ALL">Toutes les flashcards</button>`}

function rSuivi(){const s=specs(),e=errs();
 const days=[...Array(7)].map((_,i)=>{const t=new Date();t.setDate(t.getDate()-6+i);const k=day(t);return{l:"DLMMJVS"[t.getDay()],v:S.hist.filter(h=>day(h.t)===k).reduce((a,h)=>a+(h.xp||0),0)}});
 const mx=Math.max(20,...days.map(d=>d.v));
 const kind={quiz:"Quiz",cards:"Cartes",schema:"Schéma"};
 $("#suivi").innerHTML=`<div><h1>Suivi</h1><p class="mut">Maîtrise = questions réussies + cartes sues + schémas complétés.</p></div>
 <div class="box">${s.map(d=>{const m=mast(d);return `<div class="mrow"><header><span style="color:${DOM[d].c};font-weight:600">${d}</span><b>${pct(m.all)} %</b></header>
  <div class="bar"><i style="width:${pct(m.all)}%;background:${DOM[d].c};box-shadow:0 0 10px ${DOM[d].c}"></i></div>
  <span class="mut" style="font-size:12px">Quiz ${pct(m.q)} % · Cartes ${pct(m.c)} %${m.s===null?"":" · Schémas "+pct(m.s)+" %"}</span></div>`}).join("")}</div>
 <div class="box"><h2>XP sur 7 jours</h2><div class="week">${days.map(d=>`<div><i style="height:${d.v/mx*100}%" title="${d.v} XP"></i>${d.l}</div>`).join("")}</div></div>
 <div class="box"><h2>Historique</h2>${S.hist.length?`<ul class="list">${S.hist.slice(-8).reverse().map(h=>`<li><span>${kind[h.k]||""} · ${esc(h.d)}</span><span class="mut" style="white-space:nowrap">${h.s}/${h.n} · +${h.xp} XP</span></li>`).join("")}</ul>`:`<p class="mut">Aucune session pour l'instant. Lance un quiz depuis le hub.</p>`}</div>
 <div class="box"><h2>À retravailler</h2>${e.length?`<ul class="list">${e.slice(0,6).map(q=>`<li><span>${esc(q.q)}</span><span class="tag" style="color:${DOM[q.d].c}">${q.d}</span></li>`).join("")}</ul><button class="btn bad" data-quiz="ERR" style="width:100%;margin-top:12px">Rejouer mes erreurs</button>`:`<p class="mut">Rien en attente.</p>`}</div>`}

function rAll(){rDash();rQuizTab();rCours();rSuivi();$("#profBadge").hidden=!NR.prof}
NR.rAll=rAll;

/* ---------- feuilles ---------- */
const stack=[];NR.stack=stack;
function openOv(el){if(stack.includes(el))return;el.style.zIndex=10+stack.length;el.classList.add("on");stack.push(el);document.body.classList.add("dim");el.querySelector(".ovs").scrollTop=0;setTimeout(()=>{const b=el.querySelector(".grab");b&&b.focus({preventScroll:true})},50)}
function closeOv(){const el=stack.pop();if(!el)return;el.classList.remove("on");
 if(el.id==="ovQuiz"&&qz&&!qz.done&&qz.res.length)endQuiz(true);
 if(el.id==="ovCards"&&fc&&!fc.done&&fc.i)endCards(true);
 if(el.id==="ovEdit")NR.afterEdit();
 if(!stack.length){document.body.classList.remove("dim");rAll()}}
function closeAll(){while(stack.length){const el=stack.pop();el.classList.remove("on")}document.body.classList.remove("dim")}
NR.openOv=openOv;NR.closeOv=closeOv;
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeOv);

function fx(k){const f=$("#fx");f.className="";void f.offsetWidth;f.className=k;try{navigator.vibrate&&navigator.vibrate(k==="ok"?18:[30,40,30])}catch(e){}}
NR.fx=fx;

/* ---------- quiz ---------- */
let qz=null;
function startQuiz(t){let pool=t==="ERR"?errs():K.questions.filter(x=>specs().includes(x.d)&&(t==="ALL"||x.d===t));
 const fresh=shuf(pool.filter(x=>!(S.qs[x.id]&&S.qs[x.id].ok))),done=shuf(pool.filter(x=>S.qs[x.id]&&S.qs[x.id].ok));
 const items=fresh.concat(done).slice(0,S.len);if(!items.length)return;
 qz={items,i:0,ok:0,res:[],xp:0,done:false,label:t==="ERR"?"Erreurs":t==="ALL"?"Toutes":t};
 openOv($("#ovQuiz"));rQ()}
function head(){return `<div class="qhead"><span style="color:var(--g)">NEON://QUIZ</span><span class="mut">${Math.min(qz.i+1,qz.items.length)}/${qz.items.length}</span></div>
 <div class="segs">${qz.items.map((_,i)=>`<i class="${qz.res[i]===1?"ok":qz.res[i]===0?"ko":i===qz.i?"cur":""}"></i>`).join("")}</div>
 <div style="display:flex;align-items:center;gap:10px;font-size:12px" class="mut"><span style="white-space:nowrap">Précision</span><div class="bar" style="flex:1"><i id="accBar" style="width:${qz.res.length?pct(qz.ok/qz.res.length):0}%;background:${qz.res.length&&qz.ok/qz.res.length<.5?"var(--bad)":"var(--g)"}"></i></div><b class="num" id="qxp" style="color:var(--g);white-space:nowrap">+${qz.xp} XP</b></div>`}
function rQ(){const q=qz.items[qz.i],ord=shuf([0,1,2,3].filter(k=>q.o[k]!=null&&q.o[k]!==""));qz.ord=ord;
 $("#quizBody").innerHTML=head()+`<div class="term"><div class="scan"></div>
  <div class="ln prompt" style="--d:0s">&gt; module ${esc(q.d)} · ${esc((DOM[q.d]||{}).n||"")}</div>
  <div class="ln qtxt" style="--d:.25s">${esc(q.q)}</div>
  ${ord.map((k,j)=>`<button class="opt ln" style="--d:${.55+j*.15}s" data-k="${k}"><kbd>${j+1}</kbd><span>${esc(q.o[k])}</span></button>`).join("")}
  <div id="after"></div></div>${editBtn("questions",q.id)}`;
 $("#quizBody").querySelectorAll(".opt").forEach(b=>b.onclick=()=>answer(+b.dataset.k))}
function answer(k){const q=qz.items[qz.i];if(qz.res[qz.i]!==undefined)return;const ok=k===0;
 qz.res[qz.i]=ok?1:0;if(ok){qz.ok++;qz.xp+=10}
 S.qs[q.id]={ok,n:((S.qs[q.id]||{}).n||0)+1};S.ans.push(ok?1:0);S.ans=S.ans.slice(-50);save();
 $("#quizBody").querySelectorAll(".opt").forEach(b=>{b.disabled=true;const v=+b.dataset.k;b.classList.add(v===0?"ok":v===k?"ko":"dim")});
 fx(ok?"ok":"ko");
 $("#quizBody").querySelectorAll(".segs i")[qz.i].className=ok?"ok":"ko";
 const ab=$("#accBar");ab.style.width=pct(qz.ok/qz.res.length)+"%";ab.style.background=qz.ok/qz.res.length<.5?"var(--bad)":"var(--g)";
 $("#qxp").textContent="+"+qz.xp+" XP";
 const last=qz.i===qz.items.length-1;
 $("#after").innerHTML=`<div class="ln expl" style="--d:0s">// ${ok?"Correct.":"Incorrect."} ${esc(q.e)}</div><button class="btn" id="nextQ" style="width:100%;margin-top:14px">${last?"Voir le bilan":"Question suivante"}</button>`;
 $("#nextQ").onclick=next;$("#nextQ").focus({preventScroll:true});$("#nextQ").scrollIntoView({block:"nearest",behavior:"smooth"})}
function next(){if(qz.i<qz.items.length-1){qz.i++;rQ();$("#ovQuiz .ovs").scrollTop=0}else endQuiz(false)}
function endQuiz(silent){if(qz.done)return;qz.done=true;const n=qz.res.length;
 S.hist.push({t:Date.now(),k:"quiz",d:qz.label,s:qz.ok,n,xp:qz.xp});save();if(silent)return;
 const r=qz.ok/n,wrong=qz.items.filter((_,i)=>qz.res[i]===0);
 $("#quizBody").innerHTML=`<div class="qhead"><span style="color:var(--g)">NEON://BILAN</span><span class="mut">${esc(qz.label)}</span></div>
 <div class="box halo" style="text-align:center;display:grid;gap:8px;padding:28px 16px"><div class="big">${qz.ok}/${n}</div><p class="mut" style="margin:0">${r===1?"Sans faute.":r>=.7?"Solide. Encore un effort sur les erreurs.":r>=.4?"En progrès. Revois les fiches concernées.":"À retravailler : commence par les flashcards."}</p><b class="num" style="color:var(--c)">+${qz.xp} XP</b></div>
 ${wrong.length?`<div class="box"><h2>Corrections</h2><ul class="list">${wrong.map(q=>`<li style="display:grid;gap:4px"><span>${esc(q.q)}</span><span style="color:var(--g)">${esc(q.o[0])}</span></li>`).join("")}</ul></div>`:""}
 <div class="row"><button class="btn" id="again">Rejouer</button><button class="btn ghost" id="qBack">Retour au hub</button></div>`;
 $("#again").onclick=()=>{const t=qz.label==="Erreurs"?"ERR":qz.label==="Toutes"?"ALL":qz.label;if(t==="ERR"&&!errs().length)return closeOv();stack.pop();$("#ovQuiz").classList.remove("on");startQuiz(t)};
 $("#qBack").onclick=closeOv;fx(r>=.5?"ok":"ko")}

/* ---------- flashcards ---------- */
let fc=null;
const schemaById=id=>K.schemas.find(s=>s.id===id);
function startCards(d){const pool=K.cartes.filter(x=>specs().includes(x.d)&&(d==="ALL"||x.d===d));
 const items=shuf(pool.filter(x=>!S.cs[x.id])).concat(shuf(pool.filter(x=>S.cs[x.id]))).slice(0,10);if(!items.length)return;
 fc={items,i:0,known:0,xp:0,done:false,label:d==="ALL"?"Toutes":d};openOv($("#ovCards"));rC()}
function rC(){const c=fc.items[fc.i],sc=c.fig&&schemaById(c.fig);
 $("#cardBody").innerHTML=`<div class="qhead"><span style="color:var(--c)">NEON://CARTES</span><span class="mut">${fc.i+1}/${fc.items.length}</span></div>
 <div class="bar"><i style="width:${fc.i/fc.items.length*100}%"></i></div>
 <div class="stage"><div class="fc" id="card" tabindex="0" role="button" aria-label="Retourner la carte"><div class="fc-in">
  <div class="face${sc?" hasfig":""}"><span class="tag" style="color:${(DOM[c.d]||{}).c}">${esc(c.d)}</span><h3>${esc(c.f)}</h3>${sc?`<div class="fig">${draw(sc,"fig")}</div>`:""}<small>Touche pour retourner</small></div>
  <div class="face b"><span class="tag" style="color:var(--g)">RÉPONSE</span><p>${esc(c.b)}</p><small>← à revoir · je sais →</small></div>
 </div></div></div>
 <div class="fcbtns"><button class="btn bad" id="cNo">À revoir</button><button class="btn" id="cYes">Je sais</button></div>${editBtn("cartes",c.id)}`;
 const card=$("#card");let sx=null,dx=0;
 card.addEventListener("pointerdown",e=>{sx=e.clientX;dx=0;card.style.transition="none"});
 card.addEventListener("pointermove",e=>{if(sx===null)return;dx=e.clientX-sx;if(Math.abs(dx)>8)card.style.transform=`translateX(${dx}px) rotate(${dx/20}deg)`});
 const up=()=>{if(sx===null)return;sx=null;card.style.transition="";card.style.transform="";if(dx>80)mark(true);else if(dx<-80)mark(false);else if(Math.abs(dx)<8)flip()};
 card.addEventListener("pointerup",up);card.addEventListener("pointercancel",()=>{sx=null;card.style.transition="";card.style.transform=""});
 card.onkeydown=e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();flip()}};
 $("#cNo").onclick=()=>mark(false);$("#cYes").onclick=()=>mark(true)}
function flip(){const c=$("#card");if(!c)return;c.classList.toggle("flip");if(c.classList.contains("flip")){c.classList.remove("zap");void c.offsetWidth;c.classList.add("zap")}}
function mark(k){const c=fc.items[fc.i],el=$("#card");if(!el||el.dataset.out)return;el.dataset.out=1;
 S.cs[c.id]=k;if(k){fc.known++;fc.xp+=5}save();fx(k?"ok":"ko");el.classList.add(k?"outR":"outL");
 setTimeout(()=>{fc.i++;fc.i<fc.items.length?rC():endCards(false)},280)}
function endCards(silent){if(fc.done)return;fc.done=true;S.hist.push({t:Date.now(),k:"cards",d:fc.label,s:fc.known,n:fc.i,xp:fc.xp});save();if(silent)return;
 $("#cardBody").innerHTML=`<div class="qhead"><span style="color:var(--c)">NEON://BILAN</span><span class="mut">${esc(fc.label)}</span></div>
 <div class="box halo" style="text-align:center;display:grid;gap:8px;padding:28px 16px"><div class="big">${fc.known}/${fc.items.length}</div><p class="mut" style="margin:0">cartes sues</p><b class="num" style="color:var(--c)">+${fc.xp} XP</b></div>
 <div class="row"><button class="btn c" id="cAgain">Nouveau paquet</button><button class="btn ghost" id="cBack">Retour au hub</button></div>`;
 $("#cAgain").onclick=()=>{const d=fc.label==="Toutes"?"ALL":fc.label;stack.pop();$("#ovCards").classList.remove("on");startCards(d)};$("#cBack").onclick=closeOv}

/* ---------- fiche ---------- */
let ficheId=null;
function openFiche(id){const f=K.fiches.find(x=>x.id===id);if(!f)return;ficheId=id;const sc=byD(K.schemas,f.d);
 $("#ficheBody").innerHTML=`<span class="tag" style="color:${(DOM[f.d]||{}).c};justify-self:start">${esc(f.d)}</span><h1>${esc(f.t)}</h1>
 ${f.f?`<div class="formula">${esc(f.f)}</div>`:""}<div class="box halo"><ul class="pts">${(f.p||[]).map(p=>`<li>${esc(p)}</li>`).join("")}</ul></div>
 <div class="row"><button class="btn c" data-cards="${esc(f.d)}">Flashcards ${esc(f.d)}</button><button class="btn" data-quiz="${esc(f.d)}">Quiz ${esc(f.d)}</button>${sc.length?`<button class="btn v" data-schema="${esc(sc[0].id)}">Schéma ${esc(f.d)}</button>`:""}</div>${editBtn("fiches",f.id)}`;
 openOv($("#ovFiche"))}

/* ---------- schémas à compléter (glisser-déposer) ---------- */
let sx=null;
function openSchema(id){const sc=schemaById(id);if(!sc||!TPL[sc.t])return;
 const n=TPL[sc.t].n,z=Array.from({length:n},(_,i)=>(sc.z||[])[i]||"");
 const bank=shuf(z.concat((sc.x||[]).filter(Boolean)));
 sx={sc,z,bank,placed:Array(n).fill(null),lock:Array(n).fill(false),sel:null,tries:0,done:false};
 openOv($("#ovSchema"));rS()}
const inZone=idx=>sx.placed.indexOf(idx);
function labHTML(idx){return `<button class="lab${sx.sel===idx?" sel":""}${sx.lock[inZone(idx)]?" lock":""}" data-l="${idx}">${esc(sx.bank[idx])}</button>`}
function rS(){const sc=sx.sc,free=sx.bank.map((_,i)=>i).filter(i=>inZone(i)<0);
 $("#schemaBody").innerHTML=`<div class="qhead"><span style="color:#cbb8ff">NEON://SCHÉMA</span><span class="tag" style="color:${(DOM[sc.d]||{}).c}">${esc(sc.d)}</span></div>
 <h1 style="font-size:22px">${esc(sc.titre)}</h1><p class="mut" style="margin:0">${esc(sc.consigne||"Glisse chaque étiquette dans la bonne case.")}</p>
 <div id="sWrap">${draw(sc,"ex",i=>sx.placed[i]!=null?labHTML(sx.placed[i]):"?")}</div>
 ${sx.done?`<div class="box halo"><p style="margin:0;color:var(--c)">// ${esc(sc.e||"Schéma complet.")}</p></div>
  <div class="row"><button class="btn v" id="sNext">Schéma suivant</button><button class="btn ghost" id="sBack">Retour</button></div>`
 :`<div class="bank" id="bank">${free.length?free.map(labHTML).join(""):`<span class="mut" style="font-size:13px;align-self:center">Toutes les étiquettes sont placées.</span>`}</div>
  <p class="mut" style="font-size:13px;margin:0;text-align:center">Glisse une étiquette sur une case, ou touche l'étiquette puis la case.</p>
  <div class="row"><button class="btn" id="sCheck">Vérifier</button><button class="btn ghost" id="sReset">Recommencer</button></div>`}
 ${editBtn("schemas",sc.id)}`;
 const svg=$("#sWrap svg");if(sx.done)svg.classList.add("run");
 if(sx.done){$("#sNext").onclick=()=>{const l=K.schemas.filter(x=>specs().includes(x.d)&&x.id!==sc.id);const n=l.find(x=>!S.sc[x.id])||l[0];if(n){stack.pop();$("#ovSchema").classList.remove("on");openSchema(n.id)}};$("#sBack").onclick=closeOv;return}
 $("#sCheck").onclick=check;$("#sReset").onclick=()=>{sx.placed=sx.placed.map((v,i)=>sx.lock[i]?v:null);sx.sel=null;rS()};
 document.querySelectorAll("#sWrap .zone").forEach(zn=>zn.onclick=e=>{if(e.target.closest(".lab"))return;const i=+zn.dataset.i;if(sx.sel!=null&&!sx.lock[i]){place(sx.sel,i);sx.sel=null;rS()}})}
function place(idx,i){if(sx.lock[i])return;const from=inZone(idx),occ=sx.placed[i];
 if(from>=0)sx.placed[from]=null;
 if(occ!=null&&occ!==idx&&from>=0)sx.placed[from]=occ;
 sx.placed[i]=idx}
function check(){let all=true;const ko=[];
 sx.placed.forEach((v,i)=>{const good=v!=null&&norm(sx.bank[v])===norm(sx.z[i]);if(good)sx.lock[i]=true;else{all=false;ko.push(i)}});
 if(all){sx.done=true;const gain=sx.tries?8:15;S.sc[sx.sc.id]=true;S.hist.push({t:Date.now(),k:"schema",d:sx.sc.titre,s:1,n:1,xp:gain});save();fx("ok");rS();return}
 sx.tries++;fx("ko");rS();
 ko.forEach(i=>{const z=document.querySelector(`#sWrap .zone[data-i="${i}"]`);z&&z.classList.add("ko")});
 document.querySelectorAll("#sWrap .zone").forEach(z=>{if(sx.lock[+z.dataset.i])z.classList.add("ok")});
 setTimeout(()=>{if(!sx||sx.done)return;ko.forEach(i=>sx.placed[i]=null);rS();document.querySelectorAll("#sWrap .zone").forEach(z=>{if(sx.lock[+z.dataset.i])z.classList.add("ok")})},900)}
/* glisser-déposer au doigt et à la souris */
let drag=null;
document.addEventListener("pointerdown",e=>{const l=e.target.closest("#schemaBody .lab");if(!l||!sx||sx.done)return;const idx=+l.dataset.l;if(sx.lock[inZone(idx)])return;
 drag={idx,el:l,x:e.clientX,y:e.clientY,moved:false,ghost:null,hov:null};try{l.setPointerCapture(e.pointerId)}catch(_){}});
document.addEventListener("pointermove",e=>{if(!drag)return;
 if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6){drag.moved=true;const g=drag.el.cloneNode(true);g.classList.add("ghost");document.body.appendChild(g);drag.ghost=g;drag.el.style.opacity=".3"}
 if(drag.moved){drag.ghost.style.left=e.clientX+"px";drag.ghost.style.top=e.clientY+"px";const z=(document.elementFromPoint(e.clientX,e.clientY)||{}).closest?.("#sWrap .zone");
  if(drag.hov&&drag.hov!==z)drag.hov.classList.remove("hov");if(z){z.classList.add("hov");drag.hov=z}}});
function endDrag(e,cancel){if(!drag)return;const d=drag;drag=null;if(d.ghost)d.ghost.remove();d.el.style.opacity="";if(d.hov)d.hov.classList.remove("hov");
 if(cancel){rS();return}
 if(d.moved){const z=(document.elementFromPoint(e.clientX,e.clientY)||{}).closest?.("#sWrap .zone");
  if(z)place(d.idx,+z.dataset.i);else if(inZone(d.idx)>=0)sx.placed[inZone(d.idx)]=null;sx.sel=null;rS()}
 else{if(inZone(d.idx)>=0){sx.placed[inZone(d.idx)]=null;sx.sel=null}else sx.sel=sx.sel===d.idx?null:d.idx;rS()}}
document.addEventListener("pointerup",e=>endDrag(e,false));
document.addEventListener("pointercancel",e=>endDrag(e,true));

/* ---------- réglages ---------- */
function openSet(){
 $("#setBody").innerHTML=`<h1>Réglages</h1>
 <div style="display:grid;gap:10px"><h2>Spécialités suivies</h2><div class="chips">${Object.keys(DOM).map(d=>`<label class="chip"><input type="checkbox" name="sp" value="${d}"${S.spec.includes(d)?" checked":""}><span>${d}</span></label>`).join("")}</div><p class="mut" id="spMsg" style="font-size:13px;margin:0">Le hub, les quiz et les cours ne montrent que ces spécialités.</p></div>
 <div style="display:grid;gap:10px"><h2>Longueur des quiz</h2><div class="chips">${[5,8,12].map(n=>`<label class="chip"><input type="radio" name="ln" value="${n}"${S.len===n?" checked":""}><span>${n} questions</span></label>`).join("")}</div></div>
 <div style="display:grid;gap:10px"><h2>Effets</h2><div class="chips"><label class="chip"><input type="checkbox" id="mo"${S.motion?" checked":""}><span>Animations lumineuses</span></label></div></div>
 <div style="display:grid;gap:10px"><h2>Une idée, un bug ?</h2><button class="btn ghost" data-idees>Boîte à idées</button></div>
 <div style="display:grid;gap:10px" id="profZone"></div>
 <div style="display:grid;gap:6px"><h2>Progression</h2><p class="mut" style="margin:0;font-size:14px">Enregistrée dans ce navigateur uniquement.</p><button class="btn bad" id="rst">Réinitialiser</button>
  <div class="confirm" id="cf"><p style="margin:0">Effacer XP, historique et maîtrise ?</p><div class="row"><button class="btn bad" id="rstY">Oui, effacer</button><button class="btn ghost" id="rstN">Annuler</button></div></div></div>`;
 $("#setBody").querySelectorAll("input[name=sp]").forEach(i=>i.onchange=()=>{const v=[...$("#setBody").querySelectorAll("input[name=sp]:checked")].map(x=>x.value);
  if(!v.length){i.checked=true;$("#spMsg").textContent="Garde au moins une spécialité.";return}S.spec=v;save()});
 $("#setBody").querySelectorAll("input[name=ln]").forEach(i=>i.onchange=()=>{S.len=+i.value;save()});
 $("#mo").onchange=e=>{S.motion=e.target.checked;save();calm()};
 $("#rst").onclick=()=>$("#cf").classList.add("on");$("#rstN").onclick=()=>$("#cf").classList.remove("on");
 $("#rstY").onclick=()=>{Object.assign(S,{qs:{},cs:{},sc:{},hist:[],ans:[]});save();$("#cf").classList.remove("on");$("#rst").textContent="Progression effacée"};
 NR.profZone&&NR.profZone($("#profZone"));
 openOv($("#ovSet"))}
const calm=()=>document.documentElement.classList.toggle("calm",!S.motion);calm();

/* ---------- navigation ---------- */
const track=$("#track"),panels=[...document.querySelectorAll(".panel")],NAMES=["hub","quiz","cours","suivi"];
const cur=()=>Math.round(track.scrollLeft/track.clientWidth);
NR.ecran=()=>{const t=stack[stack.length-1];return t?t.getAttribute("aria-label"):NAMES[cur()]};
function go(i,inst){i=Math.max(0,Math.min(3,i));track.scrollTo({left:i*track.clientWidth,behavior:inst||!S.motion?"auto":"smooth"})}
function dots(){const i=cur();document.querySelectorAll(".hud button").forEach((b,j)=>{b.classList.toggle("on",j===i);b.setAttribute("aria-current",j===i?"page":"false")});if(S.tab!==i){S.tab=i;save()}}
track.addEventListener("scroll",dots,{passive:true});
document.querySelectorAll(".hud button").forEach(b=>b.onclick=()=>go(+b.dataset.i));
$("#pull").onclick=openSet;

document.addEventListener("click",e=>{const t=e.target.closest("[data-quiz],[data-cards],[data-fiche],[data-schema],[data-edit],[data-idees],[data-editor]");if(!t)return;
 if(t.dataset.edit){NR.edit&&NR.edit(t.dataset.edit,t.dataset.id);return}
 if(t.hasAttribute("data-idees")){NR.idees&&NR.idees();return}
 if(t.hasAttribute("data-editor")){NR.edit&&NR.edit();return}
 if(t.dataset.quiz){closeAll();startQuiz(t.dataset.quiz)}
 else if(t.dataset.cards){closeAll();startCards(t.dataset.cards)}
 else if(t.dataset.schema){closeAll();openSchema(t.dataset.schema)}
 else if(t.dataset.fiche)openFiche(t.dataset.fiche)});

/* après une correction dans l'éditeur : rafraîchir la fenêtre ouverte */
NR.afterEdit=()=>{const top=stack[stack.length-1];if(!top)return;
 const find=(arr,id)=>K[arr].find(x=>x.id===id);
 if(top.id==="ovQuiz"&&qz&&!qz.done){qz.items=qz.items.map(x=>find("questions",x.id)||x);if(qz.res[qz.i]===undefined)rQ()}
 else if(top.id==="ovCards"&&fc&&!fc.done){fc.items=fc.items.map(x=>find("cartes",x.id)||x);rC()}
 else if(top.id==="ovFiche"&&ficheId){stack.pop();top.classList.remove("on");openFiche(ficheId)}
 else if(top.id==="ovSchema"&&sx){const id=sx.sc.id;stack.pop();top.classList.remove("on");openSchema(id)}};

/* gestes : ↓ ferme, ↑ depuis le bas ouvre les réglages */
let G=null;
const atBottom=()=>{const p=panels[cur()];return p.scrollTop+p.clientHeight>=p.scrollHeight-4};
const ovTop=()=>{const el=stack[stack.length-1];return !el||el.querySelector(".ovs").scrollTop<=2};
const noGesture=t=>t&&t.closest&&t.closest("input,textarea,select,label,.lab,.zone,#card,.ed");
function gs(x,y,t){G=noGesture(t)?null:{x,y,t:Date.now(),b:!stack.length&&atBottom(),top:ovTop()}}
function ge(x,y){if(!G)return;const dx=x-G.x,dy=y-G.y,dt=Date.now()-G.t,g=G;G=null;
 if(dt>800||Math.abs(dy)<70||Math.abs(dy)<1.4*Math.abs(dx))return;
 if(dy>0&&stack.length&&g.top)closeOv();else if(dy<0&&!stack.length&&g.b)openSet()}
addEventListener("touchstart",e=>{const t=e.touches[0];gs(t.clientX,t.clientY,e.target)},{passive:true});
addEventListener("touchend",e=>{const t=e.changedTouches[0];ge(t.clientX,t.clientY)},{passive:true});
addEventListener("mousedown",e=>gs(e.clientX,e.clientY,e.target));
addEventListener("mouseup",e=>ge(e.clientX,e.clientY));

addEventListener("keydown",e=>{if(e.target.matches&&e.target.matches("input,textarea,select"))return;
 if(e.key==="Escape"){closeOv();return}
 const top=stack[stack.length-1];
 if(!top){if(e.key==="ArrowRight")go(cur()+1);else if(e.key==="ArrowLeft")go(cur()-1);else if(e.key==="ArrowUp"&&atBottom()){e.preventDefault();openSet()}return}
 if(top.id==="ovQuiz"&&qz&&!qz.done){const n=+e.key;if(n>=1&&n<=qz.ord.length&&qz.res[qz.i]===undefined){answer(qz.ord[n-1])}else if(e.key==="Enter"&&qz.res[qz.i]!==undefined&&e.target.id!=="nextQ"){e.preventDefault();next()}}
 if(top.id==="ovCards"&&fc&&!fc.done&&$("#card")){if(e.key==="ArrowRight")mark(true);else if(e.key==="ArrowLeft")mark(false)}});
addEventListener("resize",()=>go(S.tab,true));

NR.prof=null;try{NR.prof=sessionStorage.getItem("neonrush-prof")}catch(e){}
NR.start=()=>{rAll();requestAnimationFrame(()=>{go(S.tab||0,true);dots()});sync()};
}
