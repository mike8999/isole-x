/* Boîte à idées : suggestions anonymes envoyées à la base Notion via une fonction Netlify */
(function(){
  const S=document.currentScript,JEU=S.dataset.jeu||'Atelier STI2D';
  const URL_F='https://isole-x.netlify.app/.netlify/functions/idees';
  const TYPES=[['Ergonomie','🖐️ Plus pratique'],['Fonctionnalité','✨ Nouvelle idée'],['Bug','🐞 Bug'],['Autre','💬 Autre']];
  const st=document.createElement('style');st.textContent=`
.ideebox textarea{width:100%;min-height:120px;margin:10px 0 4px;padding:10px 12px;border-radius:12px;border:2px solid currentColor;background:rgba(255,255,255,.55);color:inherit;font:inherit;font-size:16px;resize:vertical;user-select:text;-webkit-user-select:text}
.ideebox .itypes{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px}
.ideebox .icount{font-size:12px;opacity:.7;text-align:right}
.ideebox .imsg{min-height:1.3em;margin:6px 0 0;font-weight:600}
.ideebox .isite{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}`;
  document.head.appendChild(st);
  let type='Fonctionnalité',brouillon='';
  function ecran(){return['home','menu','world','train','game','exp'].find(k=>{const e=document.getElementById(k);return e&&!e.classList.contains('hidden')})||''}
  function ouvrir(){
    const from=ecran();
    modal(`<h2>💡 Boîte à idées</h2><p>Une idée pour améliorer le jeu ? Un bouton mal placé, un bug ? Écris-le ici : <b>c'est anonyme</b>, ton nom n'est pas envoyé.</p>
      <div class="itypes">${TYPES.map(([v,l])=>`<button class="chip${v===type?' on':''}" data-itype="${v}">${l}</button>`).join('')}</div>
      <textarea id="ideeTxt" maxlength="600" placeholder="Mon idée : …">${brouillon.replace(/</g,'&lt;')}</textarea>
      <input class="isite" id="ideeSite" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="icount" id="ideeCount">${brouillon.length}/600</div>
      <p class="imsg" id="ideeMsg"></p>
      <div class="btns"><button class="bigbtn" id="ideeSend">Envoyer</button><button class="ghostbtn" data-act="close">Fermer</button></div>`,'ideebox');
    const t=document.getElementById('ideeTxt'),m=document.getElementById('ideeMsg'),b=document.getElementById('ideeSend');
    t.oninput=()=>{brouillon=t.value;document.getElementById('ideeCount').textContent=t.value.length+'/600'};
    document.querySelectorAll('[data-itype]').forEach(c=>c.onclick=()=>{type=c.dataset.itype;document.querySelectorAll('[data-itype]').forEach(x=>x.classList.toggle('on',x===c))});
    b.onclick=async()=>{
      const texte=t.value.trim();if(texte.length<5){m.textContent='✏️ Écris au moins quelques mots.';return}
      b.disabled=true;m.textContent='Envoi…';
      try{
        const r=await fetch(URL_F,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({texte,type,jeu:JEU,ecran:from,site:document.getElementById('ideeSite').value})});
        const j=await r.json().catch(()=>({}));
        if(!r.ok||!j.ok)throw new Error(j.error||'Erreur');
        brouillon='';t.value='';document.getElementById('ideeCount').textContent='0/600';m.textContent='✅ Merci ! Ton idée a bien été envoyée.';b.textContent='Envoyer une autre idée';
      }catch(e){m.textContent='⚠️ '+(navigator.onLine===false?'Pas de connexion Internet : ton texte est gardé, réessaie plus tard.':(e.message&&e.message!=='Failed to fetch'?e.message:'Envoi impossible pour le moment, réessaie plus tard.'))}
      b.disabled=false;
    };
    setTimeout(()=>t.focus(),50);
  }
  const ref=document.getElementById('btnSettings');
  if(ref){const btn=document.createElement('button');btn.className='ghostbtn';btn.id='btnIdees';btn.textContent='💡 Boîte à idées';btn.onclick=ouvrir;ref.after(btn)}
  window.showIdees=ouvrir;
})();
