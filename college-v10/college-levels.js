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


/* ---------- monde 9 : problèmes à mettre en équation ---------- */
WORLDS.push({name:'Cascade des problèmes',icon:'💧',theme:'story',color:'#38b6c9',levels:[
 {story:"Léa a des billes. Elle en gagne <b>7</b> à la récré et en a maintenant <b>19</b>. Combien en avait-elle au départ ?",ch:['x+7=19','x-7=19','7x=19'],why:"Elle <b>gagne</b> 7 billes : on <b>ajoute</b> 7 à ce qu'elle avait.",goal:'x=12',intro:'story'},
 {story:"<b>3</b> cahiers identiques coûtent <b>12 €</b> en tout. Quel est le prix x d'un cahier ?",ch:['x+3=12','3x=12','x/3=12'],why:"3 cahiers à x € chacun : on paie <b>3 fois</b> x.",goal:'x=4'},
 {story:"Je pense à un nombre x. Je le <b>multiplie par 4</b>, puis j'<b>ajoute 5</b> : j'obtiens <b>33</b>.",ch:['4(x+5)=33','4x+5=33','4+5x=33'],why:"On multiplie d'abord, puis on ajoute : 4x, puis 4x + 5.",goal:'x=7'},
 {story:"Pour une sortie, chaque place de cinéma coûte <b>8 €</b>. Le groupe achète aussi un popcorn à <b>5 €</b> et paie <b>29 €</b>. Combien de places x ?",ch:['8+5x=29','8x+5=29','13x=29'],why:"x places à 8 € : 8x. On ajoute le popcorn : 8x + 5.",goal:'x=3'},
 {story:"Je pense à un nombre x. J'<b>ajoute 6</b>, puis je <b>multiplie le résultat par 3</b> : j'obtiens <b>39</b>.",ch:['3x+6=39','3(x+6)=39','x+6*3=39'],why:"« Le résultat » est x + 6 : on le met dans une parenthèse avant de multiplier par 3.",goal:'x=7'},
 {story:"Tom a <b>3 ans de plus</b> que Sam. À eux deux, ils ont <b>27 ans</b>. Quel est l'âge x de Sam ?",ch:['x+3=27','x+x+3=27','2x=27+3'],why:"Sam a x ans, Tom a x + 3 ans. Leur somme : x + (x + 3).",goal:'x=12'},
 {story:"Un rectangle a une longueur égale à sa largeur x <b>plus 4 cm</b>. Son <b>périmètre</b> vaut <b>40 cm</b>. Trouve sa largeur x.",ch:['x+x+4=40','2(x+x+4)=40','2x+4=40'],why:"Périmètre = 2 × (longueur + largeur) = 2 × (x + 4 + x).",goal:'x=8'},
 {story:"La <b>moitié</b> d'un nombre x, <b>plus 9</b>, est égale à ce nombre lui-même.",ch:['2x+9=x','x/2=x+9','x/2+9=x'],why:"La moitié de x s'écrit x/2. On ajoute 9 et on obtient x.",goal:'x=18'},
 {story:"Club de sport. Formule A : <b>20 €</b> d'inscription puis <b>2 €</b> par séance. Formule B : <b>6 €</b> par séance. Pour combien de séances x les deux formules coûtent-elles pareil ?",ch:['20+2x=6x','22x=6x','20x+2=6x'],why:"Formule A : 20 + 2x. Formule B : 6x. On cherche quand c'est égal.",goal:'x=5'},
 {story:"Niveau ultime ! Les angles d'un triangle mesurent <b>x</b>, <b>2x</b> et <b>x + 20</b> degrés. La somme des angles d'un triangle vaut <b>180°</b>.",ch:['2x+x+20=180','x+2x+x+20=180','x+2x=180+20'],why:"Il faut additionner les <b>trois</b> angles : x + 2x + (x + 20) = 180.",goal:'x=40'},
]});
/* ---------- monde 10 : seconde ---------- */
WORLDS.push({name:'Sommet de la seconde',icon:'🏔️',theme:'sec',color:'#6c63ff',levels:[
 {e:'x+4<9',goal:'x<5',intro:'ineq',tip:"Une <b>inéquation</b> : même règle que pour une équation, ce que tu fais d'un côté, fais-le de l'autre."},
 {e:'3x≥12',goal:'x≥4',tip:"Diviser par un nombre <b>positif</b> ne change pas le sens."},
 {e:'-2x>6',goal:'x<-3',intro:'ineqneg',tip:"Attention : multiplier ou diviser par un nombre <b>négatif</b> change le sens de l'inégalité !"},
 {e:'5-x≤2',goal:'x≥3'},
 {e:'3x+1>x+7',goal:'x>3'},
 {zero:'(x-2)(x+3)=0',steps:[{e:'x-2=0',goal:'x=2'},{e:'x+3=0',goal:'x=-3'}],intro:'zero'},
 {zero:'(2x-6)(x+5)=0',steps:[{e:'2x-6=0',goal:'x=3'},{e:'x+5=0',goal:'x=-5'}]},
 {zero:'(4x+8)(5-x)=0',steps:[{e:'4x+8=0',goal:'x=-2'},{e:'5-x=0',goal:'x=5'}]},
 {sys:['x+y=10','x-y=4'],steps:[{e:'x+y=10',t:'y',goal:'y=10-x',tip:"Étape 1 : isole <b>y</b> dans la 1<sup>re</sup> équation."},{e:'x-(10-x)=4',goal:'x=7',tip:"Étape 2 : on a remplacé y par 10 − x dans la 2<sup>e</sup> équation. Trouve x !"},{e:'y=10-7',t:'y',goal:'y=3',tip:"Étape 3 : x = 7, donc y = 10 − 7. Calcule y."}],intro:'system'},
 {sys:['2x+y=11','x+3y=13'],steps:[{e:'2x+y=11',t:'y',goal:'y=11-2x',tip:"Étape 1 : isole <b>y</b> dans la 1<sup>re</sup> équation."},{e:'x+3(11-2x)=13',goal:'x=4',tip:"Étape 2 : on remplace y par 11 − 2x dans la 2<sup>e</sup> équation. Développe et trouve x !"},{e:'y=11-2*4',t:'y',goal:'y=3',tip:"Étape 3 : x = 4, donc y = 11 − 2 × 4. Calcule y."}]},
]});
[0,1,1,1,1,1,1,2,0,1].forEach((k,i)=>{const lv=WORLDS[8].levels[i];lv.ok=k;lv.answer=lv.ch[k]});
function levelOpts(ci,li,step){
  const ch=WORLDS[ci],lv=ch.levels[li];
  if(lv.steps){const k=step||0,st=lv.steps[k];
    const pz=t=>esc(t).replace(/-/g,'−').replace(/\*/g,'·').replace(/([=<>≤≥])/,' $1 ');
    const pre=lv.zero?`${pz(lv.zero)} : un produit est nul si l'un de ses facteurs est nul. Facteur ${k+1} : `:lv.sys?`Système { ${lv.sys.map(pz).join(' ; ')} } — `:'';
    return{eq:parseEq(st.e),rel:parseRel(st.e),target:st.t||'x',goal:st.goal,tip:pre+(st.tip||`résous ${pz(st.e)}.`),box:false,
      label:`${li+1}/10 · ${k+1}/${lv.steps.length}`,title:ch.icon+' '+ch.name+(lv.zero?' — produit nul':' — système'),chain:{n:lv.steps.length,k},
      intro:k===0&&lv.intro?[].concat(lv.intro).filter(x=>!SEEN[x]):null}}
  return{eq:parseEq(lv.story?lv.answer:lv.e),rel:parseRel(lv.story?lv.answer:lv.e),target:lv.t||'x',goal:lv.goal,tip:lv.story?'📖 '+lv.story:lv.tip,deck:lv.deck,nocomp:lv.nocomp,box:lv.box!==undefined?lv.box:(li<6&&!ch.formula&&ch.theme!=='sec'),
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
    case'story':{const lv=pick(WORLDS[8].levels.slice(0,4+3*d));return{e:lv.answer,goal:lv.goal,tip:'📖 '+lv.story}}
    case'sec':{const r=pick(['<','>','≤','≥']);const k=pick([a,-a]);const val=k*x0+b;const fl=k<0?{'<':'>','>':'<','≤':'≥','≥':'≤'}[r]:r;
      return pick([()=>({e:`${k}x${sg(b)}${r}${val}`,goal:`x${fl}${x0}`}),()=>({e:`x${sg(b)}${r}${x0+b}`,goal:`x${r}${x0}`})].slice(0,d>0?2:1).reverse())()}
    case'trig':{const lv=pick(WORLDS[7].levels.slice(0,4+3*d));return{e:lv.e,t:lv.t,tip:lv.tip}}
  }
}
