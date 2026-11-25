/* Neon Rush STI2D : modèles de schémas animés (viewBox 400 × 240).
   Chaque modèle : nombre de cases (zones) et de légendes, position des cases, dessin SVG. */
{
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* texte sur deux lignes si trop long */
function txt(x,y,s,max,anchor){s=String(s||"");anchor=anchor||"middle";max=max||16;
 if(s.length<=max)return `<text x="${x}" y="${y}" text-anchor="${anchor}">${esc(s)}</text>`;
 const w=s.split(" ");let a="",b="";for(const m of w){if((a+" "+m).trim().length<=Math.max(max,s.length/2)&&!b)a=(a+" "+m).trim();else b=(b+" "+m).trim()}
 return `<text x="${x}" y="${y-6}" text-anchor="${anchor}"><tspan x="${x}">${esc(a)}</tspan><tspan x="${x}" dy="13">${esc(b)}</tspan></text>`}
const arrowR=(x,y)=>`<path class="ar" d="M${x} ${y} l-8 -4.5 v9 z"/>`;

const TPL={
 circuit:{nom:"Circuit électronique (DEL)",n:4,leg:2,
  zn:["près du générateur","près de l'interrupteur","près de la résistance","près de la DEL"],
  ln:["valeur près du générateur","valeur en haut à droite"],
  pos:[[27,64,26],[35,38,26],[66,38,26],[73,64,26]],
  draw(l){return `
   <path class="w" d="M50 60 H350 V190 H50 Z"/>
   <path class="flow" d="M50 125 V60 H350 V190 H50 Z"/>
   <rect class="bg" x="36" y="108" width="28" height="34"/>
   <line class="k" x1="34" y1="118" x2="66" y2="118"/><line class="k" x1="42" y1="132" x2="58" y2="132" stroke-width="4"/>
   <text x="72" y="113" text-anchor="start" style="fill:var(--g)">+</text>
   ${txt(4,100,l[0],8,"start")}
   <rect class="bg" x="118" y="44" width="46" height="24"/>
   <circle cx="122" cy="60" r="3" class="ar"/><circle cx="160" cy="60" r="3" class="ar"/>
   <line class="k sw-off" x1="122" y1="60" x2="156" y2="44"/><line class="k sw-on" x1="122" y1="60" x2="160" y2="60"/>
   <rect class="bg" x="232" y="50" width="56" height="20"/><rect class="k" x="235" y="53" width="50" height="14" rx="2"/>
   ${txt(330,46,l[1],14)}
   <rect class="bg" x="334" y="108" width="32" height="34"/>
   <path class="led" d="M338 113 H362 L350 133 Z"/><line class="k" x1="338" y1="134" x2="362" y2="134"/>
   <g class="ray"><path class="k" d="M366 116 l12 -8 M368 126 l12 -6" style="stroke:#ff3d6a"/></g>`}},
 poutre:{nom:"Poutre sur deux appuis",n:4,leg:2,
  zn:["sur la charge","près de l'appui de gauche","près de l'appui de droite","entre les réactions (en bas)"],
  ln:["valeur de la charge","longueur (cote)"],
  pos:[[72,20,30],[33,66,25],[67,66,25],[50,89,32]],
  draw(l){return `
   <line class="w" x1="60" y1="96" x2="340" y2="96" stroke-dasharray="4 4"/><line class="w" x1="60" y1="90" x2="60" y2="102"/><line class="w" x1="340" y1="90" x2="340" y2="102"/>
   ${txt(120,90,l[1],14)}
   <rect x="40" y="112" width="320" height="14" rx="3" fill="#13202a" stroke="var(--c)" stroke-width="1.6"/>
   <path class="deform" d="M40 119 Q200 150 360 119"/>
   <path class="k" d="M60 126 L46 150 H74 Z"/><line class="k" x1="38" y1="152" x2="82" y2="152"/>
   <path class="w" d="M42 152 l-6 8 M52 152 l-6 8 M62 152 l-6 8 M72 152 l-6 8 M82 152 l-6 8"/>
   <path class="k" d="M340 126 L328 142 H352 Z"/><circle class="k" cx="333" cy="147" r="4"/><circle class="k" cx="347" cy="147" r="4"/><line class="k" x1="320" y1="153" x2="360" y2="153"/>
   <g class="load"><line x1="200" y1="34" x2="200" y2="104" stroke="var(--g)" stroke-width="3"/><path d="M200 111 l-7 -12 h14 z" fill="var(--g)"/></g>
   ${txt(190,46,l[0],14,"end")}
   <g class="react"><line x1="60" y1="228" x2="60" y2="170" stroke="var(--c)" stroke-width="3"/><path d="M60 162 l-7 12 h14 z" fill="var(--c)"/>
   <line x1="340" y1="228" x2="340" y2="170" stroke="var(--c)" stroke-width="3"/><path d="M340 162 l-7 12 h14 z" fill="var(--c)"/>
   <text x="72" y="205" text-anchor="start">RA</text><text x="328" y="205" text-anchor="end">RB</text></g>`}},
 energie:{nom:"Chaîne de puissance (4 blocs)",n:4,leg:4,
  zn:["sous le bloc 1","sous le bloc 2","sous le bloc 3","sous le bloc 4"],
  ln:["composant du bloc 1","composant du bloc 2","composant du bloc 3","composant du bloc 4"],
  pos:[[12.5,74,23],[37.5,74,23],[62.5,74,23],[87.5,74,23]],
  draw(l){const xs=[8,108,208,308];return `
   <text x="8" y="36" text-anchor="start" style="fill:var(--c)">Énergie électrique</text><text x="392" y="36" text-anchor="end" style="fill:var(--g)">Énergie mécanique</text>
   <line class="w" x1="8" y1="50" x2="384" y2="50"/>${arrowR(392,50)}
   ${[0,1,2].map(i=>`<circle class="pulse" cx="10" cy="50" r="4" fill="var(--g)" style="--L:370px;animation-delay:${i*.87}s"/>`).join("")}
   ${xs.map((x,i)=>`<rect class="blk" x="${x}" y="70" width="84" height="54" rx="10" style="--dl:${i*.4}s"/>${txt(x+42,101,l[i],12)}`).join("")}
   ${[92,192,292].map(x=>`<line class="w" x1="${x}" y1="97" x2="${x+10}" y2="97"/>${arrowR(x+16,97)}`).join("")}`}},
 info:{nom:"Chaîne d'information (3 blocs)",n:3,leg:3,
  zn:["sous le bloc 1","sous le bloc 2","sous le bloc 3"],
  ln:["composant du bloc 1","composant du bloc 2","composant du bloc 3"],
  pos:[[17.5,74,30],[50,74,30],[82.5,74,30]],
  draw(l){const xs=[15,145,275];return `
   <text x="8" y="36" text-anchor="start" style="fill:var(--c)">Grandeur physique</text><text x="392" y="36" text-anchor="end" style="fill:var(--g)">Information</text>
   <line class="w" x1="8" y1="50" x2="384" y2="50"/>${arrowR(392,50)}
   ${[0,1,2,3].map(i=>`<rect class="pulse" x="8" y="46" width="8" height="8" rx="1" fill="${i%2?"var(--c)":"var(--g)"}" style="--L:370px;animation-delay:${i*.65}s"/>`).join("")}
   ${xs.map((x,i)=>`<rect class="blk" x="${x}" y="70" width="110" height="54" rx="10" style="--dl:${i*.5}s"/>${txt(x+55,101,l[i],16)}`).join("")}
   ${[125,255].map(x=>`<line class="w" x1="${x}" y1="97" x2="${x+12}" y2="97"/>${arrowR(x+20,97)}`).join("")}`}},
 cinematique:{nom:"Chaîne cinématique (pignon-crémaillère)",n:4,leg:2,
  zn:["sous le moteur","au-dessus des engrenages","au-dessus du pignon","sous la crémaillère"],
  ln:["mouvement d'entrée","mouvement de sortie"],
  pos:[[12,74,22],[40,24,27],[70,24,26],[59,74,28]],
  draw(l){return `
   ${txt(50,72,l[0],16)}
   <rect x="20" y="86" width="60" height="48" rx="6" fill="#0d1820" stroke="var(--c)" stroke-width="1.8"/><text x="50" y="114">M</text>
   <line class="w" x1="80" y1="110" x2="125" y2="110" stroke-width="3"/>
   <g class="gear g1" style="transform-origin:125px 110px"><circle cx="125" cy="110" r="17" fill="none" stroke="var(--c)" stroke-width="5" stroke-dasharray="3.3 3.37"/><circle cx="125" cy="110" r="14" fill="#0b141b" stroke="var(--c)" stroke-width="1.2"/><line x1="125" y1="110" x2="125" y2="98" stroke="var(--g)" stroke-width="2"/></g>
   <line class="w" x1="169" y1="110" x2="270" y2="110" stroke-width="3"/>
   <g class="gear g2" style="transform-origin:169px 110px"><circle cx="169" cy="110" r="29" fill="none" stroke="var(--c)" stroke-width="5" stroke-dasharray="3.2 3.3"/><circle cx="169" cy="110" r="26" fill="#0b141b" stroke="var(--c)" stroke-width="1.2"/><line x1="169" y1="110" x2="169" y2="88" stroke="var(--g)" stroke-width="2"/></g>
   <rect x="209" y="101" width="14" height="18" fill="none" stroke="#5d7584" stroke-width="1.5"/><line class="w" x1="205" y1="122" x2="227" y2="122"/>
   <g class="gear g2" style="transform-origin:270px 110px"><circle cx="270" cy="110" r="21" fill="none" stroke="var(--c)" stroke-width="5" stroke-dasharray="3.2 3.4"/><circle cx="270" cy="110" r="18" fill="#0b141b" stroke="var(--c)" stroke-width="1.2"/><line x1="270" y1="110" x2="270" y2="94" stroke="var(--g)" stroke-width="2"/></g>
   <g class="rack"><line x1="150" y1="134" x2="330" y2="134" stroke="var(--c)" stroke-width="5" stroke-dasharray="3.2 3.4"/><rect x="150" y="136" width="180" height="9" fill="#13202a" stroke="var(--c)" stroke-width="1.4"/></g>
   <rect x="186" y="131" width="26" height="18" fill="none" stroke="#5d7584" stroke-width="1.5"/><rect x="332" y="131" width="26" height="18" fill="none" stroke="#5d7584" stroke-width="1.5"/>
   <line class="w" x1="140" y1="154" x2="398" y2="154"/>
   ${txt(250,226,l[1],20)}<path class="ar" d="M318 222 l-9 -5 v10 z" transform="translate(16 0)"/>`}}
};

/* mode : "ex" (exercice, cases vides gérées par l'appli) ou "fig" (illustration complète) */
function draw(sc,mode,placedHTML){const T=TPL[sc.t];if(!T)return "";
 const leg=Array.from({length:T.leg},(_,i)=>(sc.leg||[])[i]||"");
 const zones=T.pos.map((p,i)=>{const inner=mode==="fig"?esc((sc.z||[])[i]||""):(placedHTML?placedHTML(i):"");
  return `<div class="zone${mode==="fig"?" fixed":""}" data-i="${i}" style="left:${p[0]}%;top:${p[1]}%;width:${p[2]}%">${inner}</div>`}).join("");
 return `<div class="schema"><svg class="sv${mode==="fig"?" run":""}" viewBox="0 0 400 240" aria-hidden="true">${T.draw(leg)}</svg>${zones}</div>`}
window.NR_SCHEMAS={TPL,draw};
}
