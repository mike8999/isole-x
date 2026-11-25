/* Neon Rush STI2D : mode professeur (éditeur de tout le contenu, enregistré en ligne) et boîte à idées */
{
const NR=window.NR,{$,esc,DOM,API}=NR,{TPL,draw}=window.NR_SCHEMAS;
const IDEES="https://isole-x.netlify.app/.netlify/functions/idees";
const post=async(url,body)=>{const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw new Error(j.error||"Erreur "+r.status);return j};
const errTxt=e=>navigator.onLine===false?"Pas de connexion Internet.":(e.message&&e.message!=="Failed to fetch"?e.message:"Serveur injoignable, réessaie plus tard.");

/* ---------- accès professeur (réglages) ---------- */
NR.profZone=box=>{
 if(NR.prof){box.innerHTML=`<h2>Mode professeur <span class="tag" style="color:#cbb8ff">ACTIF</span></h2>
  <div class="row"><button class="btn v" data-editor>Ouvrir l'éditeur</button><button class="btn ghost" id="profOut">Quitter le mode professeur</button></div>`;
  $("#profOut").onclick=()=>{NR.prof=null;try{sessionStorage.removeItem("neonrush-prof")}catch(e){}NR.profZone(box);NR.rAll()};return}
 box.innerHTML=`<h2>Mode professeur</h2>
  <form id="profF" style="display:grid;gap:10px" autocomplete="off"><label class="f" style="display:grid;gap:6px;font-size:13px;color:var(--mut)">Code professeur
  <input class="inp" id="profCode" type="password" inputmode="numeric" maxlength="12" autocomplete="off"></label>
  <button class="btn v" type="submit">Entrer</button><p class="msg" id="profMsg"></p></form>`;
 const m=$("#profMsg");
 $("#profF").onsubmit=async e=>{e.preventDefault();const code=$("#profCode").value.trim();if(!code)return;m.className="msg";m.textContent="Vérification…";
  try{await post(API,{action:"check",code});NR.prof=code;try{sessionStorage.setItem("neonrush-prof",code)}catch(_){}
   m.className="msg ok";m.textContent="Mode professeur activé.";NR.rAll();setTimeout(()=>NR.profZone(box),500)}
  catch(err){m.className="msg err";m.textContent=errTxt(err)}}};

/* ---------- éditeur ---------- */
const CATS={questions:"Questions",cartes:"Flashcards",fiches:"Fiches",schemas:"Schémas"};
const ed={cat:"questions",dom:"ALL",q:"",open:null};
const newId=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const titleOf=(cat,x)=>cat==="questions"?x.q:cat==="cartes"?x.f:cat==="fiches"?x.t:x.titre;
const domSel=x=>`<label class="f">Spécialité<select data-f="d">${Object.keys(DOM).map(d=>`<option value="${d}"${x.d===d?" selected":""}>${d} · ${esc(DOM[d].n)}</option>`).join("")}</select></label>`;
const inp=(lab,f,v,cls)=>`<label class="f${cls?" "+cls:""}">${lab}<input class="inp" data-f="${f}" value="${esc(v)}"></label>`;
const area=(lab,f,v)=>`<label class="f">${lab}<textarea data-f="${f}">${esc(v)}</textarea></label>`;
function form(cat,x){let h=domSel(x);
 if(cat==="questions")h+=area("Énoncé","q",x.q)+`<div class="grid2">${inp("Bonne réponse","o.0",x.o[0],"good")}${inp("Mauvaise réponse 1","o.1",x.o[1])}${inp("Mauvaise réponse 2","o.2",x.o[2])}${inp("Mauvaise réponse 3","o.3",x.o[3])}</div>`+area("Explication affichée après la réponse","e",x.e);
 if(cat==="cartes")h+=inp("Recto (question)","f",x.f)+area("Verso (réponse)","b",x.b)+`<label class="f">Illustration animée au recto<select data-f="fig"><option value="">Aucune</option>${NR.K().schemas.map(s=>`<option value="${esc(s.id)}"${x.fig===s.id?" selected":""}>${esc(s.d)} · ${esc(s.titre)}</option>`).join("")}</select></label>`;
 if(cat==="fiches")h+=inp("Titre","t",x.t)+inp("Formule mise en avant","f",x.f)+area("Points clés (un par ligne)","p",(x.p||[]).join("\n"));
 if(cat==="schemas"){const T=TPL[x.t];
  h+=`<label class="f">Modèle de schéma<select data-f="t">${Object.keys(TPL).map(k=>`<option value="${k}"${x.t===k?" selected":""}>${esc(TPL[k].nom)}</option>`).join("")}</select></label>`
  +inp("Titre","titre",x.titre)+inp("Consigne","consigne",x.consigne)
  +`<p class="mut" style="margin:0;font-size:13px">Étiquettes attendues dans les cases (bonne réponse) :</p><div class="grid2">${T.zn.map((n,i)=>inp(`Case ${i+1} · ${n}`,"z."+i,(x.z||[])[i]||"","good")).join("")}</div>`
  +`<p class="mut" style="margin:0;font-size:13px">Textes fixes du dessin :</p><div class="grid2">${T.ln.map((n,i)=>inp(`Légende ${i+1} · ${n}`,"leg."+i,(x.leg||[])[i]||"")).join("")}</div>`
  +area("Étiquettes pièges (une par ligne)","x",(x.x||[]).join("\n"))+area("Explication affichée quand le schéma est juste","e",x.e)
  +`<div><p class="mut" style="margin:0 0 6px;font-size:13px">Aperçu (corrigé)</p><div class="prev">${draw(x,"fig")}</div></div>`}
 return `<div class="form">${h}<div class="row"><button class="btn bad sm" data-del>Supprimer</button></div></div>`}
function setField(x,f,v){const [a,b]=f.split(".");
 if(b!=null){x[a]=x[a]||[];x[a][+b]=v;return}
 if(f==="p"||f==="x"){x[f]=v.split("\n").map(s=>s.trim()).filter(Boolean);return}
 if(f==="t"&&x.leg!==undefined){const T=TPL[v];x.t=v;x.z=Array.from({length:T.n},(_,i)=>(x.z||[])[i]||"");x.leg=Array.from({length:T.leg},(_,i)=>(x.leg||[])[i]||"");return"redraw"}
 x[f]=v}
function status(t,cls){const s=$("#edStatus");if(s){s.className="ed-status "+(cls||"");s.textContent=t}}
const dirtyTxt=()=>NR.dirty?"Modifications non enregistrées : les élèves voient encore l'ancienne version.":(NR.K().maj?"Version en ligne du "+new Date(NR.K().maj).toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"})+".":"Contenu d'origine (rien d'enregistré en ligne).");
function touch(){NR.dirty=true;NR.persist();status(dirtyTxt(),"dirty")}
function list(){const K=NR.K(),q=ed.q.toLowerCase();
 return K[ed.cat].filter(x=>(ed.dom==="ALL"||x.d===ed.dom)&&(!q||JSON.stringify(x).toLowerCase().includes(q)))}
function rE(){const K=NR.K(),items=list();
 $("#editBody").innerHTML=`<div class="ed">
 <div class="ed-top"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h1 style="font-size:22px">Éditeur</h1><span class="tag" style="color:#cbb8ff">PROF</span></div>
  <div class="chips">${Object.keys(CATS).map(c=>`<label class="chip"><input type="radio" name="ecat" value="${c}"${ed.cat===c?" checked":""}><span>${CATS[c]} ${K[c].length}</span></label>`).join("")}</div>
  <div class="grid2"><select id="edDom" class="inp">${["ALL",...Object.keys(DOM)].map(d=>`<option value="${d}"${ed.dom===d?" selected":""}>${d==="ALL"?"Toutes les spécialités":d}</option>`).join("")}</select><input id="edQ" class="inp" type="search" placeholder="Rechercher…" value="${esc(ed.q)}"></div>
  <button class="btn v sm" id="edAdd">+ Ajouter ${({questions:"une question",cartes:"une flashcard",fiches:"une fiche",schemas:"un schéma"})[ed.cat]}</button></div>
 <div style="display:grid;gap:8px;margin-top:6px" id="edList">${items.length?items.map(x=>`<div class="item${ed.open===x.id?" open":""}" data-id="${esc(x.id)}"><button data-tog><span class="tag" style="color:${(DOM[x.d]||{}).c}">${esc(x.d)}</span><span class="tt">${esc(titleOf(ed.cat,x)||"(sans titre)")}</span></button>${ed.open===x.id?form(ed.cat,x):""}</div>`).join(""):`<p class="mut">Aucun élément.</p>`}</div>
 <details class="more"><summary>Plus d'options</summary><div style="display:grid;gap:10px;margin-top:10px">
  <button class="btn ghost sm" id="edExp">Exporter le contenu (fichier .json)</button>
  <label class="btn ghost sm" style="display:grid;place-items:center">Importer un fichier .json<input type="file" id="edImp" accept=".json,application/json" hidden></label>
  <button class="btn ghost sm" id="edUndo">Annuler mes modifications non enregistrées</button>
  <button class="btn bad sm" id="edOrig">Revenir au contenu d'origine</button>
  <div class="confirm" id="edCf"><p style="margin:0">Remplacer tout le contenu en ligne par celui d'origine ? Les élèves le verront au prochain chargement.</p><div class="row"><button class="btn bad sm" id="edOrigY">Oui, revenir à l'origine</button><button class="btn ghost sm" id="edOrigN">Annuler</button></div></div>
 </div></details>
 <div class="ed-save"><p class="ed-status" id="edStatus"></p><button class="btn" id="edSave">Enregistrer en ligne pour les élèves</button></div></div>`;
 status(dirtyTxt(),NR.dirty?"dirty":"");bind()}
function bind(){const K=NR.K();
 document.querySelectorAll("input[name=ecat]").forEach(i=>i.onchange=()=>{ed.cat=i.value;ed.open=null;rE()});
 $("#edDom").onchange=e=>{ed.dom=e.target.value;rE()};
 let tq;$("#edQ").oninput=e=>{clearTimeout(tq);tq=setTimeout(()=>{ed.q=e.target.value;const p=e.target.selectionStart;rE();const n=$("#edQ");n.focus();n.setSelectionRange(p,p)},250)};
 $("#edAdd").onclick=()=>{const d=ed.dom==="ALL"?"I2D":ed.dom;let x;
  if(ed.cat==="questions")x={id:newId("q"),d,q:"",o:["","","",""],e:""};
  if(ed.cat==="cartes")x={id:newId("c"),d,f:"",b:"",fig:""};
  if(ed.cat==="fiches")x={id:newId("f"),d,t:"",f:"",p:[]};
  if(ed.cat==="schemas")x={id:newId("s"),d,t:"info",titre:"",consigne:"Associe chaque composant à sa fonction.",z:["","",""],leg:["","",""],x:[],e:""};
  K[ed.cat].unshift(x);ed.open=x.id;ed.q="";touch();rE();const f=document.querySelector(`.item[data-id="${x.id}"] [data-f]:not(select)`);f&&f.focus()};
 document.querySelectorAll("#edList .item").forEach(it=>{const id=it.dataset.id,x=K[ed.cat].find(y=>y.id===id);
  it.querySelector("[data-tog]").onclick=()=>{ed.open=ed.open===id?null:id;rE();const n=document.querySelector(`.item[data-id="${id}"]`);n&&n.scrollIntoView({block:"nearest"})};
  if(ed.open!==id)return;
  let tp;
  it.querySelectorAll("[data-f]").forEach(el=>{const h=()=>{const r=setField(x,el.dataset.f,el.value);touch();
   it.querySelector(".tt").textContent=titleOf(ed.cat,x)||"(sans titre)";
   if(el.dataset.f==="d")it.querySelector(".tag").textContent=x.d;
   if(r==="redraw"){rE();return}
   if(ed.cat==="schemas"){clearTimeout(tp);tp=setTimeout(()=>{const p=it.querySelector(".prev");if(p)p.innerHTML=draw(x,"fig")},300)}};
   el.addEventListener(el.tagName==="SELECT"?"change":"input",h)});
  const del=it.querySelector("[data-del]");del.onclick=()=>{if(!del.dataset.sure){del.dataset.sure=1;del.textContent="Confirmer la suppression";return}
   K[ed.cat]=K[ed.cat].filter(y=>y.id!==id);if(ed.cat==="schemas")K.cartes.forEach(c=>{if(c.fig===id)c.fig=""});ed.open=null;touch();rE()}});
 $("#edSave").onclick=async()=>{const b=$("#edSave");b.disabled=true;status("Enregistrement…");
  try{const j=await post(API,{action:"save",code:NR.prof,contenu:NR.K()});NR.K().maj=j.maj;NR.dirty=false;NR.persist();status("Enregistré. Les élèves voient cette version au prochain chargement.","ok");NR.fx("ok")}
  catch(e){status(errTxt(e),"err");NR.fx("ko");if(/code/i.test(e.message)){NR.prof=null;try{sessionStorage.removeItem("neonrush-prof")}catch(_){}}}
  b.disabled=false};
 $("#edExp").onclick=()=>{const K=NR.K(),blob=new Blob([JSON.stringify({questions:K.questions,cartes:K.cartes,fiches:K.fiches,schemas:K.schemas},null,1)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="neon-rush-contenu-"+new Date().toISOString().slice(0,10)+".json";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)};
 $("#edImp").onchange=async e=>{const f=e.target.files[0];if(!f)return;
  try{const c=JSON.parse(await f.text());if(!["questions","cartes","fiches","schemas"].every(k=>Array.isArray(c[k])))throw new Error("Fichier incomplet");
   NR.setK(Object.assign(c,{maj:NR.K().maj}),{quiet:true});touch();ed.open=null;rE();status("Fichier importé : vérifie puis enregistre en ligne.","dirty")}
  catch(err){status("Import impossible : "+err.message,"err")}};
 $("#edUndo").onclick=async()=>{NR.dirty=false;NR.persist();NR.setK(NR.defaut(),{quiet:true});await NR.sync();ed.open=null;rE()};
 $("#edOrig").onclick=()=>$("#edCf").classList.add("on");$("#edOrigN").onclick=()=>$("#edCf").classList.remove("on");
 $("#edOrigY").onclick=async()=>{try{await post(API,{action:"reset",code:NR.prof});NR.dirty=false;NR.setK(NR.defaut(),{quiet:true});NR.persist();ed.open=null;rE();status("Contenu d'origine rétabli en ligne.","ok")}catch(e){status(errTxt(e),"err")}}}
NR.edit=(cat,id)=>{if(!NR.prof)return;if(cat){ed.cat=cat;ed.open=id||null;ed.dom="ALL";ed.q=""}rE();NR.openOv($("#ovEdit"));
 if(id)setTimeout(()=>{const n=document.querySelector(`.item[data-id="${id}"]`);n&&n.scrollIntoView({block:"start"})},80)};

/* ---------- boîte à idées (base Notion « Boîte à idées – Isole x ! », Jeu = Neon Rush STI2D) ---------- */
const TYPES=[["Ergonomie","Plus pratique"],["Fonctionnalité","Nouvelle idée"],["Bug","Bug"],["Autre","Autre"]];
let type="Fonctionnalité",brouillon="";
NR.idees=()=>{const from=NR.ecran();
 $("#ideeBody").innerHTML=`<div class="idee" style="display:grid;gap:12px"><h1>Boîte à idées</h1>
 <p class="mut" style="margin:0">Une idée pour améliorer l'appli, un exercice qui manque, un bug ? Écris-le ici. C'est anonyme : ton nom n'est pas envoyé.</p>
 <div class="chips">${TYPES.map(([v,l])=>`<label class="chip"><input type="radio" name="itype" value="${v}"${v===type?" checked":""}><span>${l}</span></label>`).join("")}</div>
 <textarea id="ideeTxt" maxlength="600" placeholder="Mon idée : …">${esc(brouillon)}</textarea>
 <input class="isite" id="ideeSite" tabindex="-1" autocomplete="off" aria-hidden="true">
 <div class="mut" style="font-size:12px;text-align:right" id="ideeCount">${brouillon.length}/600</div>
 <p class="msg" id="ideeMsg"></p><button class="btn" id="ideeSend">Envoyer</button></div>`;
 const t=$("#ideeTxt"),m=$("#ideeMsg"),b=$("#ideeSend");
 t.oninput=()=>{brouillon=t.value;$("#ideeCount").textContent=t.value.length+"/600"};
 document.querySelectorAll("input[name=itype]").forEach(i=>i.onchange=()=>type=i.value);
 b.onclick=async()=>{const texte=t.value.trim();if(texte.length<5){m.className="msg err";m.textContent="Écris au moins quelques mots.";return}
  b.disabled=true;m.className="msg";m.textContent="Envoi…";
  try{await post(IDEES,{texte,type,jeu:"Neon Rush STI2D",ecran:("Neon Rush · "+String(from||"")).slice(0,120),site:$("#ideeSite").value});
   brouillon="";t.value="";$("#ideeCount").textContent="0/600";m.className="msg ok";m.textContent="Merci, ton idée a bien été envoyée.";b.textContent="Envoyer une autre idée";NR.fx("ok")}
  catch(e){m.className="msg err";m.textContent=errTxt(e)+" Ton texte est gardé."}
  b.disabled=false};
 NR.openOv($("#ovIdee"));setTimeout(()=>t.focus({preventScroll:true}),350)};

NR.start();
}
