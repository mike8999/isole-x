"use strict";
/* =====================================================================
   ISOLE X ! JUNGLE — collège et seconde
   8 mondes × 10 défis. e : équation · goal : résultat précis · t : lettre à isoler
   Effet boîte du défi 1 au 6, écriture normale du 7 au 10.
   ===================================================================== */
const WORLDS=[
{name:'Clairière des nombres',icon:'🌱',theme:'add',color:'#7cc242',levels:[
 {e:'x+3=7',coach:'tuto1'},
 {e:'5=2+x',tip:"La créature x peut être à droite : ce que tu fais d'un côté, fais-le de l'autre."},
 {e:'x-4=6',goal:'x=10',intro:'goal'},
 {e:'x+8=3',goal:'x=-5',tip:"Le résultat peut être négatif !"},
 {e:'x+a=b',tip:"Les lettres se déplacent comme les nombres."},
 {e:'-3+x=-7',goal:'x=-4'},
 {e:'12=x+7-2',goal:'x=7'},
 {e:'x+2a=5a',goal:'x=3a',intro:'like'},
 {e:'x-3+b=2b+1',goal:'x=b+4'},
 {e:'7+x+a=3-a',goal:'x=-4-2a'},
]},
{name:'Bosquet des multiplications',icon:'🍌',theme:'mul',color:'#f7c948',levels:[
 {e:'3x=12',intro:'frac'},
 {e:'x/5=2',intro:'mul'},
 {e:'4x=10',goal:'x=5/2',intro:'gcd'},
 {e:'-2x=8',goal:'x=-4'},
 {e:'a*x=b'},
 {e:'2x/3=4',goal:'x=6',intro:'product'},
 {e:'-x=7',goal:'x=-7',intro:'neg'},
 {e:'x/4=-3',goal:'x=-12'},
 {e:'3x/(4a)=6',goal:'x=8a'},
 {e:'a*b*x/c=d'},
]},
{name:'Rivière des fractions',icon:'🍉',theme:'frac',color:'#ff6b6b',levels:[
 {e:'x+1/2=3/2',goal:'x=1',tip:"Une fraction se déplace comme un nombre : retourne-la pour obtenir son opposé."},
 {e:'x-1/3=1/3',goal:'x=2/3'},
 {e:'x/2=5/4',goal:'x=5/2'},
 {e:'2x=3/5',goal:'x=3/10'},
 {e:'x/3+1=2',goal:'x=3'},
 {e:'3x/4=9/2',goal:'x=6'},
 {e:'x/2+x/3=5',goal:'x=6'},
 {e:'x+5/2=3/4',goal:'x=-7/4'},
 {e:'2x/3=4/9',goal:'x=2/3'},
 {e:'x/4-x/6=1',goal:'x=12'},
]},
{name:'Volcan des équations',icon:'🌋',theme:'mix',color:'#ff8c42',levels:[
 {e:'2x+3=11',goal:'x=4',tip:"Éloigne d'abord ce qui est <b>ajouté</b> à x, puis ce qui le <b>multiplie</b>."},
 {e:'x/4-1=2',goal:'x=12'},
 {e:'5x-7=2x+8',goal:'x=5',tip:"Des x des deux côtés ? Rassemble-les d'abord du même côté."},
 {e:'3x+2=x+8',goal:'x=3'},
 {e:'7-2x=1',goal:'x=3'},
 {e:'a*x+b=c'},
 {e:'(x+b)/a=c'},
 {e:'(2x-3)/5=x-3',goal:'x=4'},
 {e:'(a+b)/(a*b)+x/5=d/d-9',deck:['5','9','a','b','d'],nocomp:true,intro:['copy','deckop'],tip:"Glisse un terme du plateau dans la pioche pour en faire un jeton."},
 {e:'a*x+b=c*x+d'},
]},
{name:'Grotte des boîtes',icon:'🎁',theme:'dev',color:'#b388eb',levels:[
 {e:'2(x+3)=10',intro:'dev'},
 {e:'3x+3*2=12',intro:'fact'},
 {e:'4(x-2)=2x',goal:'x=4'},
 {e:'a*x+a*b=c'},
 {e:'a*x+b*x=c'},
 {e:'2(x+1)+3=9',goal:'x=2'},
 {e:'3(2x-1)-2(x+4)=1',goal:'x=3'},
 {e:'a(x+b)=c(x-d)'},
 {e:'x*a+x*b+x*c=d'},
 {e:'5(x-2)-3(x-4)=2(x+1)-x',goal:'x=0'},
]},
{name:'Arbre des puissances',icon:'🌳',theme:'pow',color:'#2fbf71',levels:[
 {e:'x^2=9',goal:'x=3',intro:['tool','inv','eval'],tip:"Ici x est positif : √(x²) = x."},
 {e:'sqrt(x)=4',goal:'x=16'},
 {e:'x^2+7=32',goal:'x=5'},
 {e:'3x^2=48',goal:'x=4'},
 {e:'x*x=25',goal:'x=5',intro:'pow2'},
 {e:'x^2=a'},
 {e:'sqrt(x+5)=3',goal:'x=4'},
 {e:'2sqrt(x)-1=9',goal:'x=25'},
 {e:'(x-1)^2=16',goal:'x=5'},
 {e:'sqrt(2x+1)+3=8',goal:'x=12'},
]},
{name:'Labo des formules',icon:'🔬',theme:'formula',color:'#4ea8de',formula:true,levels:[
 {e:'v=d/t',t:'d',tip:"Vitesse moyenne : v = d/t. Isole la distance <b>d</b>."},
 {e:'P=m*g',t:'m',tip:"Poids : P = m·g. Isole la masse <b>m</b>."},
 {e:'U=R*I',t:'I',tip:"Loi d'Ohm : U = R·I. Isole l'intensité <b>I</b>."},
 {e:'ρ=m/V',t:'m',tip:"Masse volumique : ρ = m/V. Isole la masse <b>m</b>."},
 {e:'E=P*t',t:'t',tip:"Énergie : E = P·t. Isole la durée <b>t</b>."},
 {e:'v=d/t',t:'t',intro:'recip',tip:"Même formule, isole la durée <b>t</b> : essaie l'outil 1/□ !"},
 {e:'A=π*r^2',t:'r',tip:"Aire d'un disque : A = π·r². Isole le rayon <b>r</b>."},
 {e:'P=2*(L+l)',t:'l',tip:"Périmètre d'un rectangle : P = 2·(L + l). Isole la largeur <b>l</b>."},
 {e:'V=L*l*h',t:'h',tip:"Volume d'un pavé : V = L·l·h. Isole la hauteur <b>h</b>."},
 {e:'c^2=a^2+b^2',t:'a',tip:"Théorème de Pythagore : niveau ultime ! Isole le côté <b>a</b>."},
]},
{name:'Temple de la trigo',icon:'📐',theme:'trig',color:'#e07a5f',formula:true,levels:[
 {e:'cos(A)=AB/AC',t:'AB',intro:'trigo',tip:"Triangle ABC rectangle en B : cos(A) = adjacent / hypoténuse. Isole <b>AB</b>."},
 {e:'sin(A)=BC/AC',t:'BC',tip:"sin(A) = opposé / hypoténuse. Isole <b>BC</b>."},
 {e:'tan(A)=BC/AB',t:'BC',tip:"tan(A) = opposé / adjacent. Isole <b>BC</b>."},
 {e:'cos(A)=AB/AC',t:'AC',tip:"Isole l'hypoténuse <b>AC</b> : elle est au dénominateur !"},
 {e:'sin(A)=BC/AC',t:'AC',tip:"Isole l'hypoténuse <b>AC</b>."},
 {e:'tan(A)=BC/AB',t:'AB',tip:"Isole le côté adjacent <b>AB</b>."},
 {e:'cos(A)=AB/AC',t:'A',intro:'angle',tip:"Retrouve l'angle <b>A</b> avec l'outil arccos (touche cos⁻¹ de la calculatrice)."},
 {e:'sin(A)=BC/AC',t:'A',tip:"Retrouve l'angle <b>A</b> avec arcsin (sin⁻¹)."},
 {e:'tan(A)=BC/AB',t:'A',tip:"Retrouve l'angle <b>A</b> avec arctan (tan⁻¹)."},
 {e:'h=d*tan(A)+1.5',t:'d',tip:"Hauteur d'un arbre vue à 1,5 m du sol : niveau ultime ! Isole la distance <b>d</b>."},
]},
];
function chapters(){return WORLDS}
function levelOpts(ci,li){
  const ch=WORLDS[ci],lv=ch.levels[li];
  return{eq:parseEq(lv.e),target:lv.t||'x',goal:lv.goal,tip:lv.tip,deck:lv.deck,nocomp:lv.nocomp,box:lv.box!==undefined?lv.box:li<6,
    label:`${li+1}/10`,title:ch.icon+' '+ch.name+(lv.t?' — isoler '+lv.t:''),
    coach:lv.coach&&!SEEN['coach_'+lv.coach]?lv.coach:null,intro:lv.intro?[].concat(lv.intro).filter(k=>!SEEN[k]):null};
}

/* ---------- générateur aléatoire ciblé par thème ---------- */
const THEMES=WORLDS.map(w=>({k:w.theme,n:w.name,icon:w.icon}));
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[ri(0,a.length-1)];
const sg=v=>v<0?'-'+(-v):'+'+v;
const frs=(p,q)=>{const g=gcd(p,q);p/=g;q/=g;if(q<0){p=-p;q=-q}return q===1?String(p):`${p}/${q}`};
function genTheme(th,d){
  let x0;do{x0=ri(-6,9)}while(x0===0);
  if(d===0)x0=ri(1,9);
  const a=ri(2,9),b=ri(1,9),c=ri(2,6);
  switch(th){
    case'add':return pick([()=>({e:`x${sg(a)}=${x0+a}`,goal:`x=${x0}`}),()=>({e:`${a}+x${sg(-b)}=${x0+a-b}`,goal:`x=${x0}`}),()=>({e:`x${sg(a)}${sg(b)}=${x0+a+b}${sg(-c)}`,goal:`x=${x0-c}`}),()=>({e:`${x0+a}=x${sg(a)}`,goal:`x=${x0}`})].slice(0,d+2))();
    case'mul':return pick([()=>({e:`${a}x=${a*x0}`,goal:`x=${x0}`}),()=>({e:`x/${a}=${x0}`,goal:`x=${a*x0}`}),()=>({e:`-${a}x=${-a*x0}`,goal:`x=${x0}`}),()=>({e:`${a}x/${c}=${x0}`,goal:`x=${frs(c*x0,a)}`})].slice(0,d+2))();
    case'frac':{const q=ri(2,6),p=ri(1,q-1);return pick([()=>({e:`x+${p}/${q}=${p+q*b}/${q}`,goal:`x=${b}`}),()=>({e:`x/${a}=${b}/${c}`,goal:`x=${frs(a*b,c)}`}),
      ()=>({e:`${a}x=${b}/${c}`,goal:`x=${frs(b,a*c)}`}),()=>({e:`x/${c}+${b}=${b+x0}`,goal:`x=${c*x0}`})].slice(0,d+2))()}
    case'mix':return pick([()=>({e:`${a}x${sg(b)}=${a*x0+b}`,goal:`x=${x0}`}),()=>({e:`x/${a}${sg(b)}=${x0+b}`,goal:`x=${a*x0}`}),()=>({e:`(x${sg(b)})/${a}=${x0}`,goal:`x=${a*x0-b}`}),
      ()=>{const cc=ri(1,a-1);return{e:`${a}x${sg(b)}=${cc}x${sg((a-cc)*x0+b)}`,goal:`x=${x0}`}}].slice(0,d+2))();
    case'dev':return pick([()=>({e:`${a}(x${sg(b)})=${a*(x0+b)}`,goal:`x=${x0}`}),()=>({e:`${a}(x${sg(b)})${sg(c)}=${a*(x0+b)+c}`,goal:`x=${x0}`}),
      ()=>({e:`${a}x+${a}*${b}=${a*(x0+b)}`,goal:`x=${x0}`}),()=>{const cc=ri(1,a-1);return{e:`${a}(x${sg(b)})-${cc}(x${sg(c)})=${a*(x0+b)-cc*(x0+c)}`,goal:`x=${x0}`}}].slice(0,d+2))();
    case'pow':{const k=ri(2,9);return pick([()=>({e:`x^2=${k*k}`,goal:`x=${k}`}),()=>({e:`sqrt(x)=${k}`,goal:`x=${k*k}`}),()=>({e:`${c}x^2${sg(b)}=${c*k*k+b}`,goal:`x=${k}`}),
      ()=>({e:`sqrt(x${sg(b)})=${k}`,goal:`x=${k*k-b}`}),()=>({e:`(x${sg(-b)})^2=${k*k}`,goal:`x=${k+b}`})].slice(0,2*d+1))()}
    case'formula':{const lv=pick(WORLDS[6].levels.slice(0,4+3*d));return{e:lv.e,t:lv.t,tip:lv.tip}}
    case'trig':{const lv=pick(WORLDS[7].levels.slice(0,4+3*d));return{e:lv.e,t:lv.t,tip:lv.tip}}
  }
}
