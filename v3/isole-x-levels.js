"use strict";
/* =====================================================================
   NIVEAUX — 8 chapitres communs × 10 défis + 10 formules par spécialité
   e : équation   goal : résultat précis exigé   intro : animation de la nouveauté
   Effet boîte pour les défis 1 à 6, parenthèses classiques ensuite.
   ===================================================================== */
const COMMON=[
{name:'Addition & soustraction',icon:'＋',theme:'add',levels:[
 {e:'x+3=7',coach:'tuto1'},
 {e:'5=2+x',tip:"La pièce x peut être à droite : ce que tu fais d'un côté, fais-le de l'autre."},
 {e:'x-4+9=12',goal:'x=7',intro:'goal'},
 {e:'x+a=b'},
 {e:'a+x-b=c'},
 {e:'12=x+7-2',goal:'x=7'},
 {e:'x+2a=5a',goal:'x=3a',intro:'like'},
 {e:'x-3+b=2b+1',goal:'x=b+4'},
 {e:'7+x+a=3-a',goal:'x=-4-2a'},
 {e:'x+5/2=3/4',goal:'x=-7/4'},
]},
{name:'Multiplication & division',icon:'×',theme:'mul',levels:[
 {e:'3x=12',intro:'frac'},
 {e:'x/5=2',intro:'mul'},
 {e:'4x=10',goal:'x=5/2',intro:'gcd'},
 {e:'a*x=b'},
 {e:'c=x/b'},
 {e:'2x/3=4',goal:'x=6',intro:'product'},
 {e:'-x=7',goal:'x=-7',intro:'neg'},
 {e:'3x/(4a)=6',goal:'x=8a'},
 {e:'a*b*x/c=d'},
 {e:'2x/3=4/9',goal:'x=2/3'},
]},
{name:'Équations mixtes',icon:'±',theme:'mix',levels:[
 {e:'2x+3=11',goal:'x=4',tip:"Éloigne d'abord ce qui est <b>ajouté</b> à x, puis ce qui le <b>multiplie</b>."},
 {e:'x/4-1=2',goal:'x=12'},
 {e:'5x-7=2x+8',goal:'x=5'},
 {e:'a*x+b=c'},
 {e:'(x+b)/a=c'},
 {e:'3x+2=x+8',goal:'x=3'},
 {e:'(a+b)/(a*b)+x/5=d/d-9',deck:['5','9','a','b','d'],nocomp:true,intro:'copy',tip:"Le niveau de l'image ! Glisse un terme du plateau dans la pioche pour en faire un jeton."},
 {e:'(2x-3)/5=x-3',goal:'x=4'},
 {e:'a*x+b=c*x+d'},
 {e:'x/2+x/3=5',goal:'x=6'},
]},
{name:'Développer & factoriser',icon:'( )',theme:'dev',levels:[
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
{name:'Puissances & racines',icon:'√',theme:'pow',levels:[
 {e:'x^2=9',goal:'x=3',intro:['tool','inv','eval'],tip:"On travaille avec des grandeurs positives : √(x²) = x."},
 {e:'sqrt(x)=4',goal:'x=16'},
 {e:'x^2+7=32',goal:'x=5'},
 {e:'3x^2=48',goal:'x=4'},
 {e:'cbrt(x)=2',goal:'x=8'},
 {e:'x^3=a'},
 {e:'sqrt(x+5)=3',goal:'x=4'},
 {e:'2sqrt(x)-1=9',goal:'x=25'},
 {e:'(x-1)^2=16',goal:'x=5'},
 {e:'sqrt(2x+1)+3=8',goal:'x=12'},
]},
{name:'Exponentielle & logarithmes',icon:'eˣ',theme:'explog',levels:[
 {e:'e^x=5',intro:'explog'},
 {e:'ln(x)=2',goal:'x=e^2'},
 {e:'e^x+3=10',goal:'x=ln(7)'},
 {e:'10^x=1000',goal:'x=3'},
 {e:'log(x)=2',goal:'x=100'},
 {e:'3ln(x)=6',goal:'x=e^2'},
 {e:'e^(2x)=7',goal:'x=ln(7)/2'},
 {e:'ln(x+1)=0',goal:'x=0'},
 {e:'5e^(x-2)=15',goal:'x=2+ln(3)'},
 {e:'ln(x)+ln(2)=1',goal:'x=e^1/2',intro:'lncomb'},
]},
{name:'Trigonométrie',icon:'∿',theme:'trig',levels:[
 {e:'sin(x)=1/2',goal:'x=pi/6',intro:'trig',tip:"Angles en radians, entre 0 et π/2."},
 {e:'cos(x)=0',goal:'x=pi/2'},
 {e:'2sin(x)=1',goal:'x=pi/6'},
 {e:'tan(x)=1',goal:'x=pi/4'},
 {e:'2cos(x)-1=0',goal:'x=pi/3'},
 {e:'a*sin(x)=b'},
 {e:'sin(2x)=1',goal:'x=pi/4'},
 {e:'4cos(x)+3=5',goal:'x=pi/3'},
 {e:'sin(x/2)=1/2',goal:'x=pi/3'},
 {e:'U=Um*sin(ω*t)',t:'t',tip:"Tension sinusoïdale : isole l'instant <b>t</b>."},
]},
{name:'Nombres complexes',icon:'ℂ',theme:'cplx',t:'z',levels:[
 {e:'z+3i=5',goal:'z=5-3i',tip:"i est le nombre imaginaire : il se manipule comme une lettre, avec i·i = −1."},
 {e:'z-2=4i',goal:'z=2+4i'},
 {e:'2z=6+4i',goal:'z=3+2i'},
 {e:'i*i*z=3',goal:'z=-3',intro:'i2'},
 {e:'z+2i=3+5i',goal:'z=3+3i'},
 {e:'2z-i=4+3i',goal:'z=2+2i'},
 {e:'3z+2=z+4+6i',goal:'z=1+3i'},
 {e:'i*z=1+2i',goal:'z=2-i'},
 {e:'(1+i)*z=2',goal:'z=1-i',deck:['(1-i)','2','i','1'],intro:'conj'},
 {e:'(2+i)*z=5',goal:'z=2-i',deck:['(2-i)','5','i','1']},
]},
];

const SPECS={
 si:{name:'SI',full:"Sciences de l'ingénieur",cls:'1SI · TSI',acc:'#6c5ce7',icon:'gear',f:[
  {e:'F=m*a',t:'a',tip:"Principe fondamental de la dynamique. Isole l'accélération <b>a</b>."},
  {e:'C=F*r',t:'F',tip:"Couple d'une force. Isole <b>F</b>."},
  {e:'r=ωs/ωe',t:'ωe',tip:"Rapport de réduction. Isole la vitesse d'entrée <b>ωe</b>."},
  {e:'Ep=m*g*h',t:'h',tip:"Énergie potentielle. Isole la hauteur <b>h</b>."},
  {e:'f=1/T',t:'T',tip:"Fréquence et période. Isole <b>T</b>."},
  {e:'Ec=m*v^2/2',t:'v',tip:"Énergie cinétique Ec = ½·m·v². Isole la vitesse <b>v</b>."},
  {e:'P=R*I^2',t:'I',tip:"Effet Joule. Isole l'intensité <b>I</b>."},
  {e:'Us=Ue*R2/(R1+R2)',t:'Ue',tip:"Pont diviseur de tension. Isole <b>Ue</b>."},
  {e:'U=E-r*I',t:'I',tip:"Générateur réel. Isole <b>I</b>."},
  {e:'s=S*sin(ω*t)',t:'t',tip:"Signal sinusoïdal. Isole l'instant <b>t</b>."},
 ]},
 sin:{name:'SIN',full:"Systèmes d'information et numérique",cls:'STI2D',acc:'#1e88e5',icon:'chip',f:[
  {e:'U=R*I',t:'I',tip:"Loi d'Ohm. Isole l'intensité <b>I</b>."},
  {e:'P=U*I',t:'U',tip:"Puissance électrique. Isole la tension <b>U</b>."},
  {e:'τ=R*C',t:'C',tip:"Constante de temps d'un circuit RC. Isole la capacité <b>C</b>."},
  {e:'f=1/T',t:'T',tip:"Fréquence d'un signal. Isole la période <b>T</b>."},
  {e:'D=Q/t',t:'t',tip:"Débit binaire (Q : quantité de données). Isole la durée <b>t</b>."},
  {e:'q=Uref/N',t:'N',tip:"Quantum d'un CAN (N : nombre de niveaux). Isole <b>N</b>."},
  {e:'P=U^2/R',t:'U',tip:"Puissance dissipée par une résistance. Isole <b>U</b>."},
  {e:'Us=Ue*R2/(R1+R2)',t:'Ue',tip:"Pont diviseur. Isole la tension d'entrée <b>Ue</b>."},
  {e:'u=E*e^(-t/τ)',t:'t',tip:"Décharge d'un condensateur. Isole l'instant <b>t</b>."},
  {e:'f=1/(2*π*sqrt(L*C))',t:'C',tip:"Fréquence propre d'un circuit LC : le niveau ultime ! Isole <b>C</b>."},
 ]},
 itec:{name:'ITEC',full:'Innovation technologique et éco-conception',cls:'STI2D',acc:'#e67e22',icon:'cube',f:[
  {e:'σ=F/S',t:'S',tip:"Contrainte normale. Isole la section <b>S</b>."},
  {e:'M=F*d',t:'d',tip:"Moment d'une force. Isole le bras de levier <b>d</b>."},
  {e:'ω=2*π*N',t:'N',tip:"Vitesse angulaire. Isole la fréquence de rotation <b>N</b>."},
  {e:'v=R*ω',t:'R',tip:"Vitesse linéaire d'un point. Isole le rayon <b>R</b>."},
  {e:'σ=E*ε',t:'ε',tip:"Loi de Hooke. Isole la déformation <b>ε</b>."},
  {e:'P=m*g',t:'m',tip:"Poids. Isole la masse <b>m</b>."},
  {e:'Ec=m*v^2/2',t:'v',tip:"Énergie cinétique. Isole la vitesse <b>v</b>."},
  {e:'I=b*h^3/12',t:'h',tip:"Moment quadratique d'une section rectangulaire. Isole la hauteur <b>h</b>."},
  {e:'S=π*d^2/4',t:'d',tip:"Section d'un tube ou d'un axe. Isole le diamètre <b>d</b>."},
  {e:'f=sqrt(k/m)/(2*π)',t:'k',tip:"Fréquence propre d'un système masse-ressort : niveau ultime ! Isole la raideur <b>k</b>."},
 ]},
 ee:{name:'EE',full:'Énergies et environnement',cls:'STI2D',acc:'#f4b400',icon:'bolt',f:[
  {e:'P=U*I',t:'I',tip:"Puissance électrique. Isole <b>I</b>."},
  {e:'E=P*t',t:'t',tip:"Énergie consommée. Isole la durée <b>t</b>."},
  {e:'η=Pu/Pa',t:'Pa',tip:"Rendement. Isole la puissance absorbée <b>Pa</b>."},
  {e:'Pu=Pa-Pp',t:'Pa',tip:"Bilan de puissance (Pp : pertes). Isole <b>Pa</b>."},
  {e:'m=U2/U1',t:'U1',tip:"Rapport de transformation. Isole la tension primaire <b>U1</b>."},
  {e:'P=R*I^2',t:'I',tip:"Effet Joule. Isole <b>I</b>."},
  {e:'P=U^2/R',t:'U',tip:"Puissance d'un radiateur résistif. Isole <b>U</b>."},
  {e:'U=E-r*I',t:'I',tip:"Générateur réel. Isole <b>I</b>."},
  {e:'u=E*e^(-t/τ)',t:'t',tip:"Décharge d'un condensateur. Isole l'instant <b>t</b>."},
  {e:'Z=sqrt(R^2+X^2)',t:'R',tip:"Impédance d'un dipôle : niveau ultime ! Isole la résistance <b>R</b>."},
 ]},
 ac:{name:'AC',full:'Architecture et construction',cls:'STI2D',acc:'#2e9e5b',icon:'house',f:[
  {e:'R=e/λ',t:'λ',tip:"Résistance thermique d'une paroi. Isole la conductivité <b>λ</b>."},
  {e:'U=1/R',t:'R',tip:"Coefficient de transmission thermique. Isole <b>R</b>."},
  {e:'Φ=U*S*ΔT',t:'S',tip:"Déperditions d'une paroi. Isole la surface <b>S</b>."},
  {e:'Φ=ΔT/R',t:'ΔT',tip:"Flux à travers une paroi. Isole l'écart de température <b>ΔT</b>."},
  {e:'Q=m*c*ΔT',t:'m',tip:"Énergie thermique. Isole la masse <b>m</b>."},
  {e:'p=ρ*g*h',t:'h',tip:"Pression hydrostatique. Isole la hauteur d'eau <b>h</b>."},
  {e:'Qv=S*v',t:'v',tip:"Débit volumique. Isole la vitesse <b>v</b>."},
  {e:'V=π*r^2*h',t:'r',tip:"Volume d'une cuve cylindrique. Isole le rayon <b>r</b>."},
  {e:'Qv=π*d^2*v/4',t:'d',tip:"Débit dans une canalisation. Isole le diamètre <b>d</b>."},
  {e:'θ=θ0*e^(-t/τ)',t:'t',tip:"Refroidissement d'un bâtiment : niveau ultime ! Isole l'instant <b>t</b>."},
 ]},
};
function chapters(){const sp=SPECS[state.spec];return COMMON.concat([{name:'Formules '+sp.name,icon:'ƒ',theme:'formula',formula:true,levels:sp.f}])}

/* ---------- générateur aléatoire ciblé par thème ---------- */
const THEMES=[{k:'add',n:'Addition'},{k:'mul',n:'Multiplication'},{k:'mix',n:'Mixtes'},{k:'dev',n:'Développer'},{k:'pow',n:'Puissances'},{k:'explog',n:'Exp & ln'},{k:'trig',n:'Trigo'},{k:'cplx',n:'Complexes'},{k:'formula',n:'Formules'}];
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[ri(0,a.length-1)];
const sg=v=>v<0?'-'+(-v):'+'+v;           // signe + valeur pour concaténer
const frs=(p,q)=>{const g=gcd(p,q);p/=g;q/=g;if(q<0){p=-p;q=-q}return q===1?String(p):`${p}/${q}`};
function genTheme(th,d){
  let x0;do{x0=ri(-6,9)}while(x0===0);
  const a=ri(2,9),b=ri(1,9),c=ri(2,6);
  switch(th){
    case'add':return pick([()=>({e:`x${sg(a)}=${x0+a}`,goal:`x=${x0}`}),()=>({e:`${a}+x${sg(-b)}=${x0+a-b}`,goal:`x=${x0}`}),()=>({e:`x${sg(a)}${sg(b)}=${x0+a+b}${sg(-c)}`,goal:`x=${x0-c}`}),
      ()=>d>1?({e:`x+${a}/${c}=${b}/${c+1}`,goal:`x=${frs(b*c-a*(c+1),c*(c+1))}`}):({e:`x+a=b`})].slice(0,d+2))();
    case'mul':return pick([()=>({e:`${a}x=${a*x0}`,goal:`x=${x0}`}),()=>({e:`x/${a}=${x0}`,goal:`x=${a*x0}`}),()=>({e:`${a}x/${c}=${x0}`,goal:`x=${frs(c*x0,a)}`}),
      ()=>({e:`${a}x/${c}=${b}/${c+1}`,goal:`x=${frs(b*c,a*(c+1))}`})].slice(0,d+2))();
    case'mix':return pick([()=>({e:`${a}x${sg(b)}=${a*x0+b}`,goal:`x=${x0}`}),()=>({e:`x/${a}${sg(b)}=${x0+b}`,goal:`x=${a*x0}`}),()=>({e:`(x${sg(b)})/${a}=${x0}`,goal:`x=${a*x0-b}`}),
      ()=>{const cc=ri(1,a-1);return{e:`${a}x${sg(b)}=${cc}x${sg((a-cc)*x0+b)}`,goal:`x=${x0}`}}].slice(0,d+2))();
    case'dev':return pick([()=>({e:`${a}(x${sg(b)})=${a*(x0+b)}`,goal:`x=${x0}`}),()=>({e:`${a}(x${sg(b)})${sg(c)}=${a*(x0+b)+c}`,goal:`x=${x0}`}),
      ()=>({e:`${a}x+${a}*${b}=${a*(x0+b)}`,goal:`x=${x0}`}),()=>{const cc=ri(1,a-1);return{e:`${a}(x${sg(b)})-${cc}(x${sg(c)})=${a*(x0+b)-cc*(x0+c)}`,goal:`x=${x0}`}}].slice(0,d+2))();
    case'pow':{const k=ri(2,9);return pick([()=>({e:`x^2=${k*k}`,goal:`x=${k}`}),()=>({e:`sqrt(x)=${k}`,goal:`x=${k*k}`}),()=>({e:`${c}x^2${sg(b)}=${c*k*k+b}`,goal:`x=${k}`}),
      ()=>({e:`sqrt(x${sg(b)})=${k}`,goal:`x=${k*k-b}`}),()=>({e:`(x${sg(-b)})^2=${k*k}`,goal:`x=${k+b}`}),()=>({e:`cbrt(x${sg(b)})=${c}`,goal:`x=${c*c*c-b}`})].slice(0,2*d+2))()}
    case'explog':{const k=ri(2,9);return pick([()=>({e:`e^x=${k}`,goal:`x=ln(${k})`}),()=>({e:`ln(x)=${c}`,goal:`x=e^${c}`}),()=>({e:`${c}e^x${sg(b)}=${c*k+b}`,goal:`x=ln(${k})`}),
      ()=>({e:`10^x=${Math.pow(10,c-1)}`,goal:`x=${c-1}`}),()=>({e:`ln(x${sg(b)})=0`,goal:`x=${1-b}`}),()=>({e:`${c}ln(x)=${c*b}`,goal:`x=e^${b}`})].slice(0,2*d+2))()}
    case'trig':{const T1=[['sin',1,2,'pi/6'],['sin',1,1,'pi/2'],['cos',1,2,'pi/3'],['cos',0,1,'pi/2'],['tan',1,1,'pi/4']];const [f,vp,vq,r]=pick(T1);const v=frs(vp,vq);
      return pick([()=>({e:`${f}(x)=${v}`,goal:`x=${r}`}),()=>({e:`${c}${f}(x)${sg(b)}=${frs(c*vp+b*vq,vq)}`,goal:`x=${r}`}),()=>({e:`${f}(${c}x)=${v}`,goal:`x=${r}/${c}`})].slice(0,d+1))()}
    case'cplx':{const p=ri(1,6),q=ri(1,6);return pick([()=>({e:`z+${q}i=${p}`,goal:`z=${p}-${q}i`}),()=>({e:`z${sg(-b)}=${p}+${q}i`,goal:`z=${p+b}+${q}i`}),
      ()=>({e:`${c}z=${c*p}+${c*q}i`,goal:`z=${p}+${q}i`}),()=>({e:`${c}z${sg(b)}=z+${(c-1)*p+b}+${(c-1)*q}i`,goal:`z=${p}+${q}i`})].slice(0,d+2))()}
    case'formula':{const lv=pick(SPECS[state.spec].f);return{e:lv.e,t:lv.t,tip:lv.tip}}
  }
}
