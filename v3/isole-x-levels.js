"use strict";
/* =====================================================================
   NIVEAUX — 8 chapitres communs (5 défis pour les 2 premiers, 10 ensuite) + formules,
   problèmes (SI ou STI2D) et inéquations. Défis 1-2 : découverte ; dès le 3 : vraie progression.
   e : équation   goal : résultat précis exigé   intro : animation de la nouveauté
   Effet boîte pour les défis 1 à 6, parenthèses classiques ensuite.
   ===================================================================== */
const COMMON=[
{name:'Addition & soustraction',icon:'＋',theme:'add',levels:[
 {e:'x+3=7',coach:'tuto1'},
 {e:'x-4+9=12',goal:'x=7',intro:'goal'},
 {e:'x+2a-b=5a+3b',goal:'x=3a+4b',intro:'like',tip:"Regroupe les termes semblables : les <b>a</b> avec les a, les <b>b</b> avec les b."},
 {e:'12-a+x=2a-5+b',goal:'x=3a+b-17'},
 {e:'x-(3-a)+2b=7-(a-b)',goal:'x=10-2a-b',tip:"Défi ultime ! Attention aux signes <b>−</b> devant les parenthèses : touche une parenthèse pour la développer."},
]},
{name:'Multiplication & division',icon:'×',theme:'mul',levels:[
 {e:'3x=12',intro:'frac'},
 {e:'x/5=-2',goal:'x=-10',intro:'mul'},
 {e:'6x=-4',goal:'x=-2/3',intro:['gcd','neg']},
 {e:'3x/(4a)=6b',goal:'x=8a*b',intro:'product'},
 {e:'-(4a*x)/(3b)=2a/(9b*b)',goal:'x=-1/(6b)',tip:"Défi ultime ! Simplifie au maximum : il ne doit plus rester de <b>a</b>."},
]},
{name:'Équations mixtes',icon:'±',theme:'mix',levels:[
 {e:'2x+3=11',goal:'x=4',tip:"Éloigne d’abord ce qui est <b>ajouté</b> à x, puis ce qui le <b>multiplie</b>."},
 {e:'x/4-1=2',goal:'x=12'},
 {e:'(a+b)/(a*b)+x/5=d/d-9',intro:['copy','deckop'],deck:['5','9','a','b','d'],nocomp:true,tip:"Glisse un terme du plateau dans la pioche pour en faire un jeton."},
 {e:'x/2+x/3=5',goal:'x=6'},
 {e:'a*x+b=c*x+d',tip:"Rassemble les x d’un côté, puis <b>factorise</b> x."},
 {e:'5x-7=2x+8',goal:'x=5',tip:"Des x des deux côtés : rassemble-les d’abord du même côté."},
 {e:'7-3x=2x-8',goal:'x=3'},
 {e:'(x+b)/a=c-x',tip:"Les x sont des deux côtés et l’un est dans une fraction : commence par te débarrasser du dénominateur."},
 {e:'(2x-3)/5=x-3',goal:'x=4'},
 {e:'(3x-1)/4-(x+2)/3=x/6',goal:'x=11/3',tip:"Défi ultime ! Trois fractions : multiplie tout par un multiple commun de 4, 3 et 6."},
]},
{name:'Développer & factoriser',icon:'( )',theme:'dev',levels:[
 {e:'2(x+3)=10',goal:'x=2',intro:'dev'},
 {e:'3x+3*2=12',intro:'fact'},
 {e:'a*x+a*b=c'},
 {e:'x*a+x*b+x*c=d'},
 {e:'a(x+b)=c(x-d)'},
 {e:'4(x-2)=2x',goal:'x=4'},
 {e:'2(x+1)+3=9-(x-3)',goal:'x=7/3'},
 {e:'5(x-2)-3(x-4)=2(x+1)-x',goal:'x=0'},
 {e:'3(2x-1)-2(x+4)=1',goal:'x=3'},
 {e:'(x+2)(x-3)=x(x+1)+4',goal:'x=-5',tip:"Défi ultime ! Développe les deux produits : les x² vont s’annuler."},
]},
{name:'Puissances & racines',icon:'√',theme:'pow',levels:[
 {e:'x^2=9',goal:'x=3',intro:['tool','inv','eval'],tip:"On travaille avec des grandeurs positives : √(x²) = x."},
 {e:'sqrt(x)=4',goal:'x=16'},
 {e:'a*x^3=b'},
 {e:'cbrt(x)+1=3',goal:'x=8'},
 {e:'sqrt(x+5)=3',goal:'x=4'},
 {e:'(x-1)^2=16',goal:'x=5'},
 {e:'3x^2-5=43',goal:'x=4'},
 {e:'2sqrt(x)-1=9',goal:'x=25'},
 {e:'sqrt(2x+1)+3=8',goal:'x=12'},
 {e:'(2sqrt(x+1)-3)^2=25',goal:'x=15',tip:"Défi ultime ! Une racine dans un carré : enlève les couches une par une, de l’extérieur vers l’intérieur."},
]},
{name:'Exponentielle & logarithmes',icon:'eˣ',theme:'explog',levels:[
 {e:'e^x=5',intro:'explog'},
 {e:'ln(x)=2',goal:'x=e^2'},
 {e:'e^(2x)=7',goal:'x=ln(7)/2'},
 {e:'e^x+3=10',goal:'x=ln(7)'},
 {e:'ln(x)+ln(2)=1',goal:'x=e^1/2',intro:'lncomb'},
 {e:'log(2x)=2',goal:'x=50'},
 {e:'5e^(x-2)=15',goal:'x=2+ln(3)'},
 {e:'3ln(x)-1=5',goal:'x=e^2'},
 {e:'ln(3x-2)=0',goal:'x=1'},
 {e:'2e^(3x-1)+5=11',tip:"Défi ultime ! Isole d’abord l’exponentielle, puis passe au logarithme."},
]},
{name:'Trigonométrie',icon:'∿',theme:'trig',levels:[
 {e:'sin(x)=1/2',goal:'x=pi/6',intro:'trig',tip:"Angles en radians, entre 0 et π/2."},
 {e:'cos(x)=0',goal:'x=pi/2'},
 {e:'a*sin(x)=b'},
 {e:'3tan(x)=3',goal:'x=pi/4'},
 {e:'sin(2x)=1',goal:'x=pi/4'},
 {e:'sin(x/2)=1/2',goal:'x=pi/3'},
 {e:'2sin(x)-1=0',goal:'x=pi/6'},
 {e:'4cos(x)+3=5',goal:'x=pi/3'},
 {e:'2cos(3x)=1',goal:'x=pi/9'},
 {e:'u=Um*sin(ω*t+φ)+U0',t:'t',tip:"Défi ultime ! Tension sinusoïdale avec déphasage φ et décalage U0 : isole l’instant <b>t</b>."},
]},
{name:'Nombres complexes',icon:'ℂ',theme:'cplx',t:'z',levels:[
 {e:'z+3i=5',goal:'z=5-3i',tip:"i est le nombre imaginaire : il se manipule comme une lettre, avec i·i = −1."},
 {e:'2z=6+4i',goal:'z=3+2i'},
 {e:'i*i*z=3',goal:'z=-3',intro:'i2'},
 {e:'i*z=1+2i',goal:'z=2-i'},
 {e:'2z-i=4+3i',goal:'z=2+2i'},
 {e:'(1+i)*z=2',goal:'z=1-i',deck:['(1-i)','2','i','1'],intro:'conj'},
 {e:'3z+2=z+4+6i',goal:'z=1+3i'},
 {e:'(2+i)*z=5',goal:'z=2-i',deck:['(2-i)','5','i','1']},
 {e:'(1-i)*z=4+2i',goal:'z=1+3i',deck:['(1+i)','2','i','1']},
 {e:'(1+i)*z-2i=3+i',goal:'z=3',deck:['(1-i)','2','3','i'],tip:"Défi ultime ! Isole d’abord (1+i)·z, puis utilise le conjugué."},
]},
];

const SPECS={
 si:{name:'SI',full:"Sciences de l’ingénieur",cls:'1SI · TSI',acc:'#6c5ce7',icon:'gear',f:[
  {e:'F=m*a',t:'a',tip:"Principe fondamental de la dynamique. Isole l’accélération <b>a</b>."},
  {e:'Ep=m*g*h',t:'h',tip:"Énergie potentielle. Isole la hauteur <b>h</b>."},
  {e:'f=1/T',t:'T',intro:'recip',tip:"Fréquence et période. Isole <b>T</b> : essaie l’outil 1/□ !"},
  {e:'r=ωs/ωe',t:'ωe',tip:"Rapport de réduction. Isole la vitesse d’entrée <b>ωe</b>."},
  {e:'P=R*I^2',t:'I',tip:"Effet Joule. Isole l’intensité <b>I</b>."},
  {e:'U=E-r*I',t:'I',tip:"Générateur réel. Isole <b>I</b>."},
  {e:'s=S*sin(ω*t)',t:'t',tip:"Signal sinusoïdal. Isole l’instant <b>t</b>."},
  {e:'Ec=m*v*v/2',t:'v',intro:'pow2',tip:"Énergie cinétique Ec = ½·m·v². Astuce : glisse un v sur l’autre pour écrire v²."},
  {e:'Us=Ue*R2/(R1+R2)',t:'R2',tip:"Pont diviseur. Isole <b>R2</b> : attention, il apparaît deux fois !"},
  {e:'T=2*π*sqrt(l/g)',t:'g',tip:"Défi ultime ! Période d’un pendule : isole l’intensité de la pesanteur <b>g</b>."},
 ]},
 sin:{name:'SIN',full:"Systèmes d’information et numérique",cls:'STI2D',acc:'#1e88e5',icon:'chip',f:[
  {e:'U=R*I',t:'I',tip:"Loi d’Ohm. Isole l’intensité <b>I</b>."},
  {e:'τ=R*C',t:'C',tip:"Constante de temps d’un circuit RC. Isole la capacité <b>C</b>."},
  {e:'f=1/T',t:'T',intro:'recip',tip:"Fréquence d’un signal. Isole la période <b>T</b> : essaie l’outil 1/□ !"},
  {e:'q=Uref/N',t:'N',tip:"Quantum d’un CAN (N : nombre de niveaux). Isole <b>N</b>."},
  {e:'P=U^2/R',t:'U',tip:"Puissance dissipée par une résistance. Isole <b>U</b>."},
  {e:'Us=Ue*R2/(R1+R2)',t:'Ue',tip:"Pont diviseur. Isole la tension d’entrée <b>Ue</b>."},
  {e:'u=E*e^(-t/τ)',t:'t',tip:"Décharge d’un condensateur. Isole l’instant <b>t</b>."},
  {e:'Us=Ue*R2/(R1+R2)',t:'R2',tip:"Pont diviseur. Isole <b>R2</b> : attention, il apparaît deux fois !"},
  {e:'u=E*(1-e^(-t/τ))',t:'t',tip:"Charge d’un condensateur : isole l’instant <b>t</b>."},
  {e:'f=1/(2*π*sqrt(L*C))',t:'C',tip:"Défi ultime ! Fréquence propre d’un circuit LC : isole la capacité <b>C</b>."},
 ]},
 itec:{name:'ITEC',full:'Innovation technologique et éco-conception',cls:'STI2D',acc:'#e67e22',icon:'cube',f:[
  {e:'P=m*g',t:'m',tip:"Poids. Isole la masse <b>m</b>."},
  {e:'σ=F/S',t:'S',tip:"Contrainte normale. Isole la section <b>S</b>."},
  {e:'ω=2*π*N',t:'N',tip:"Vitesse angulaire. Isole la fréquence de rotation <b>N</b>."},
  {e:'σ=E*ΔL/L0',t:'L0',tip:"Loi de Hooke avec l’allongement relatif. Isole la longueur initiale <b>L0</b>."},
  {e:'Ec=m*v^2/2',t:'v',tip:"Énergie cinétique. Isole la vitesse <b>v</b>."},
  {e:'S=π*d^2/4',t:'d',tip:"Section d’un axe. Isole le diamètre <b>d</b>."},
  {e:'I=b*h^3/12',t:'h',tip:"Moment quadratique d’une section rectangulaire. Isole la hauteur <b>h</b>."},
  {e:'f=sqrt(k/m)/(2*π)',t:'k',tip:"Fréquence propre d’un système masse-ressort. Isole la raideur <b>k</b>."},
  {e:'Ec=m*R^2*ω^2/2+J*ω^2/2',t:'ω',tip:"Énergie cinétique d’une roue qui roule sans glisser (v = R·ω) : translation + rotation. Isole <b>ω</b> : il faudra factoriser ω²."},
  {e:'σ=32*M/(π*d^3)',t:'d',tip:"Défi ultime ! Contrainte de flexion dans un arbre : isole le diamètre <b>d</b>."},
 ]},
 ee:{name:'EE',full:'Énergies et environnement',cls:'STI2D',acc:'#f4b400',icon:'bolt',f:[
  {e:'P=U*I',t:'I',tip:"Puissance électrique. Isole <b>I</b>."},
  {e:'E=P*t',t:'t',tip:"Énergie consommée. Isole la durée <b>t</b>."},
  {e:'η=Pu/Pa',t:'Pa',tip:"Rendement. Isole la puissance absorbée <b>Pa</b>."},
  {e:'m=U2/U1',t:'U1',tip:"Rapport de transformation. Isole la tension primaire <b>U1</b>."},
  {e:'P=R*I^2',t:'I',tip:"Effet Joule. Isole <b>I</b>."},
  {e:'U=E-r*I',t:'I',tip:"Générateur réel. Isole <b>I</b>."},
  {e:'P=U^2/R',t:'U',tip:"Puissance d’un radiateur résistif. Isole <b>U</b>."},
  {e:'η=(Pa-Pp)/Pa',t:'Pa',tip:"Rendement avec les pertes Pp. Isole <b>Pa</b> : attention, il apparaît deux fois !"},
  {e:'u=E*e^(-t/τ)',t:'t',tip:"Décharge d’un condensateur. Isole l’instant <b>t</b>."},
  {e:'Z=sqrt(R^2+(L*ω-1/(C*ω))^2)',t:'L',tip:"Défi ultime ! Impédance d’un circuit RLC série : isole l’inductance <b>L</b>."},
 ]},
 ac:{name:'AC',full:'Architecture et construction',cls:'STI2D',acc:'#2e9e5b',icon:'house',f:[
  {e:'R=e/λ',t:'λ',tip:"Résistance thermique d’une paroi. Isole la conductivité <b>λ</b>."},
  {e:'U=1/R',t:'R',intro:'recip',tip:"Coefficient de transmission thermique. Isole <b>R</b>."},
  {e:'Φ=ΔT/R',t:'ΔT',tip:"Flux à travers une paroi. Isole l’écart de température <b>ΔT</b>."},
  {e:'Φ=U*S*ΔT',t:'S',tip:"Déperditions d’une paroi. Isole la surface <b>S</b>."},
  {e:'R=e1/λ1+e2/λ2',t:'e2',tip:"Paroi en deux couches. Isole l’épaisseur <b>e2</b> de l’isolant."},
  {e:'V=π*r^2*h',t:'r',tip:"Volume d’une cuve cylindrique. Isole le rayon <b>r</b>."},
  {e:'θ=θ0*e^(-t/τ)',t:'t',tip:"Refroidissement. Isole l’instant <b>t</b>."},
  {e:'Qv=π*d^2*v/4',t:'d',tip:"Débit dans une canalisation. Isole le diamètre <b>d</b>."},
  {e:'U=1/(Rsi+e/λ+Rse)',t:'e',tip:"Coefficient U d’une paroi isolée. Isole l’épaisseur <b>e</b> de l’isolant."},
  {e:'θ=θa+(θ0-θa)*e^(-t/τ)',t:'t',tip:"Défi ultime ! Refroidissement d’un bâtiment vers la température extérieure θa : isole l’instant <b>t</b>."},
 ]},
};
/* ---------- problèmes : choisir l'équation qui traduit la situation (SI d'un côté, STI2D de l'autre) ---------- */
const PROB_STI={name:'Problèmes STI2D',icon:'📖',theme:'story',story:true,levels:[
 {story:"Une résistance de <b>220 Ω</b> est parcourue par un courant d’intensité <b>I</b>. La tension à ses bornes vaut <b>11 V</b> (loi d’Ohm U = R·I). Trouve I.",ch:['220*I=11','I/220=11','220+I=11'],ok:0,t:'I',goal:'I=1/20',why:"Loi d’Ohm : U = R × I, donc 11 = 220 × I.",intro:'story'},
 {story:"Un vélo électrique roule à vitesse constante <b>v</b>. En <b>2 h</b>, il parcourt <b>50 km</b> (d = v·t). Trouve v.",ch:['2*v=50','v/2=50','v+2=50'],ok:0,t:'v',goal:'v=25',why:"d = v × t, donc 50 = v × 2."},
 {story:"Deux résistances en <b>série</b> : R et <b>470 Ω</b>. La résistance équivalente vaut <b>1 000 Ω</b>. Trouve R.",ch:['470*R=1000','R+470=1000','R/470=1000'],ok:1,t:'R',goal:'R=530',why:"En série, les résistances <b>s’additionnent</b> : R + 470 = 1 000."},
 {story:"Un panneau solaire fournit <b>300 W</b> pendant <b>t</b> heures, mais <b>1/5</b> de l’énergie est perdue dans le chargeur. La batterie reçoit <b>1 200 Wh</b>. Trouve t.",ch:['300*t*4/5=1200','300*t/5=1200','300*t-1/5=1200'],ok:0,t:'t',goal:'t=5',why:"Si 1/5 est perdu, la batterie reçoit les 4/5 de l’énergie produite : 300 × t × 4/5."},
 {story:"Facture d’électricité : abonnement de <b>12 €</b>, plus <b>1/5 €</b> (0,20 €) par kWh. Le total vaut <b>52 €</b>. Trouve l’énergie consommée E.",ch:['12+E/5=52','12*E+1/5=52','(12+E)/5=52'],ok:0,t:'E',goal:'E=200',why:"Chaque kWh coûte 1/5 € : E kWh coûtent E/5 €. On ajoute l’abonnement : 12 + E/5."},
 {story:"Un radiateur de <b>2 000 W</b> et une lampe de <b>P</b> watts fonctionnent ensemble pendant <b>5 h</b> et consomment <b>10 500 Wh</b>. Trouve P.",ch:['(2000+P)*5=10500','2000+P*5=10500','2000*P*5=10500'],ok:0,t:'P',goal:'P=100',why:"Les puissances s’additionnent, puis on multiplie le total par la durée : (2 000 + P) × 5."},
 {story:"Un moteur fournit une puissance utile de <b>450 W</b> avec un rendement <b>η = 3/4</b> (η = Pu/Pa). Trouve la puissance absorbée Pa.",ch:['3/4=Pa/450','3/4=450/Pa','3/4*450=Pa'],ok:1,t:'Pa',goal:'Pa=600',why:"Le rendement, c’est utile / absorbé : η = Pu / Pa = 450 / Pa."},
 {story:"Un capteur affiche <b>77 °F</b>. La température en °F vaut <b>9/5</b> de la température en °C, <b>plus 32</b>. Trouve la température C en °C.",ch:['9*C/5+32=77','9/(5*C)+32=77','9*(C+32)/5=77'],ok:0,t:'C',goal:'C=25',why:"On multiplie d’abord C par 9/5, puis on ajoute 32 : 9C/5 + 32."},
 {story:"Une voiture électrique consomme <b>15 kWh pour 100 km</b>. Sa batterie de <b>60 kWh</b> n’a plus que <b>12 kWh</b> après <b>d</b> km. Trouve d.",ch:['60-15*d/100=12','60-15/(100*d)=12','60-15*100*d=12'],ok:0,t:'d',goal:'d=320',why:"Pour d km, la voiture consomme 15 × d / 100 kWh. On l’enlève des 60 kWh de départ."},
 {story:"Défi ultime ! Deux résistances <b>R</b> et <b>2R</b> sont montées en <b>parallèle</b>. La résistance équivalente vaut <b>20 Ω</b>.",ch:['R+2*R=20','1/R+1/(2*R)=1/20','1/R+2*R=1/20'],ok:1,t:'R',goal:'R=30',why:"En parallèle, ce sont les <b>inverses</b> qui s’additionnent : 1/R + 1/(2R) = 1/20."},
]};
const PROB_SI={name:'Problèmes SI',icon:'📖',theme:'story',story:true,levels:[
 {story:"Un ressort de raideur <b>k = 50 N/m</b> est tiré avec une force de <b>20 N</b> (F = k·x). Trouve son allongement x.",ch:['50*x=20','x/50=20','50+x=20'],ok:0,t:'x',goal:'x=2/5',why:"F = k × x, donc 20 = 50 × x.",intro:'story'},
 {story:"Une force de <b>10 N</b> accélère une masse de <b>4 kg</b> (principe fondamental de la dynamique F = m·a). Trouve l’accélération a.",ch:['4*a=10','a/4=10','4+a=10'],ok:0,t:'a',goal:'a=5/2',why:"F = m × a, donc 10 = 4 × a."},
 {story:"Un moteur exerce un couple de <b>12 N·m</b> sur une poulie de rayon <b>r</b>. La courroie transmet une force de <b>80 N</b> (C = F·r). Trouve r.",ch:['80*r=12','r/80=12','80+r=12'],ok:0,t:'r',goal:'r=3/20',why:"C = F × r, donc 12 = 80 × r."},
 {story:"Un réducteur a un rapport <b>r = 1/4</b> (r = ωs/ωe). L’arbre d’entrée tourne à <b>200 rad/s</b>. Trouve la vitesse de sortie ωs.",ch:['1/4=ωs/200','1/4=200/ωs','1/4*ωs=200'],ok:0,t:'ωs',goal:'ωs=50',why:"Le rapport de réduction, c’est sortie / entrée : ωs / 200."},
 {story:"Une charge de <b>50 kg</b> est montée d’une hauteur <b>h</b>. Elle gagne <b>3 000 J</b> d’énergie potentielle (Ep = m·g·h, g = 10). Trouve h.",ch:['50*10*h=3000','50+10+h=3000','3000*h=50*10'],ok:0,t:'h',goal:'h=6',why:"Ep = m × g × h, donc 3 000 = 50 × 10 × h."},
 {story:"Un treuil soulève une masse <b>m</b> à la vitesse constante de <b>1/2 m/s</b> avec une puissance de <b>1 200 W</b> (P = m·g·v, g = 10). Trouve m.",ch:['m*10*1/2=1200','m+10+1/2=1200','m*10*2=1200'],ok:0,t:'m',goal:'m=240',why:"P = m × g × v, donc 1 200 = m × 10 × 1/2."},
 {story:"Une voiture de <b>1 000 kg</b> freine jusqu’à l’arrêt sur <b>40 m</b> avec une force de <b>5 000 N</b>. Le travail de freinage F·d est égal à l’énergie cinétique perdue ½·m·v². Trouve la vitesse <b>v</b> avant le freinage.",ch:['5000*40=1000*v^2/2','5000*40=1000*v/2','5000/40=1000*v^2/2'],ok:0,t:'v',goal:'v=20',why:"Travail F × d d’un côté, énergie cinétique m × v² / 2 de l’autre : la vitesse est au carré."},
 {story:"Un ascenseur de masse <b>m</b> monte de <b>12 m</b> en <b>20 s</b>. Son moteur absorbe <b>3 000 W</b> avec un rendement de <b>4/5</b>. L’énergie utile η·P·t sert à monter la charge : m·g·h (g = 10).",ch:['4/5*3000*20=m*10*12','3000*20=m*10*12*4/5','4/5*3000/20=m*10*12'],ok:0,t:'m',goal:'m=400',why:"Énergie utile = η × P × t (puissance × durée, multipliée par le rendement), et elle vaut m × g × h."},
 {story:"Un moteur de rendement <b>9/10</b> fournit une puissance utile de <b>450 W</b>. Trouve la puissance absorbée Pa (η = Pu/Pa).",ch:['9/10=450/Pa','9/10=Pa/450','9/10*450=Pa'],ok:0,t:'Pa',goal:'Pa=500',why:"Le rendement, c’est utile / absorbé : 9/10 = 450 / Pa."},
 {story:"Défi ultime ! Un chariot de <b>20 kg</b> monte une rampe de <b>21/5 m</b> (4,2 m) de haut. Arrivé en haut, il roule encore à <b>4 m/s</b>. L’énergie se conserve : ½·m·v² = m·g·h + ½·m·4² (g = 10). Trouve sa vitesse <b>v</b> en bas de la rampe.",ch:['20*v^2/2=20*10*21/5+20*4^2/2','20*v^2/2=20*10*21/5','20*v/2=20*10*21/5+20*4/2'],ok:0,t:'v',goal:'v=10',why:"En bas : énergie cinétique ½·m·v². En haut : énergie potentielle m·g·h <b>plus</b> l’énergie cinétique qui reste ½·m·4²."},
]};
[PROB_STI,PROB_SI].forEach(p=>p.levels.forEach(lv=>lv.answer=lv.ch[lv.ok]));
/* ---------- inéquations ---------- */
const INEQ={name:'Inéquations',icon:'<',theme:'ineq',levels:[
 {e:'x+4<9',goal:'x<5',intro:'ineq',tip:"Une <b>inéquation</b> : même règle que pour une équation, ce que tu fais d’un côté, fais-le de l’autre."},
 {e:'3x≥12',goal:'x≥4',tip:"Diviser par un nombre <b>positif</b> ne change pas le sens."},
 {e:'-2x>6',goal:'x<-3',intro:'ineqneg',tip:"Attention : multiplier ou diviser par un nombre <b>négatif</b> change le sens de l’inégalité !"},
 {e:'12*I≤60',t:'I',goal:'I≤5',tip:"Un composant alimenté sous <b>12 V</b> ne doit pas dépasser <b>60 W</b> (P = U·I ≤ 60). Quelle intensité I au maximum ?"},
 {e:'5-x≤2',goal:'x≥3'},
 {e:'3x+1>x+7',goal:'x>3'},
 {e:'(x-3)/2≥x+1',goal:'x≤-5'},
 {e:'3(x-2)-2(2x+1)≥x',goal:'x≤-4'},
 {e:'2-x/3>x+6',goal:'x<-3'},
 {e:'(2x+1)/3-(x-2)/4<x/6+1',goal:'x<2/3',tip:"Défi ultime ! Trois fractions dans une inéquation : multiplie tout par un nombre positif commun."},
]};
function chapters(){const sp=SPECS[state.spec]||SPECS.sin;return COMMON.concat([{name:'Formules '+sp.name,icon:'ƒ',theme:'formula',formula:true,levels:sp.f},state.spec==='si'?PROB_SI:PROB_STI,INEQ])}
const WORLD_COLORS=['#1e88e5','#e67e22','#ff3b2f','#8e44ad','#2e9e5b','#c9982e','#00a8a8','#6c5ce7','var(--acc)','#e4572e','#5f676f'];
const WORLDS=[];const THEMES=[];
function refreshWorlds(){WORLDS.length=0;chapters().forEach((c,i)=>{c.color=WORLD_COLORS[i];WORLDS.push(c)});THEMES.length=0;WORLDS.forEach(w=>THEMES.push({k:w.theme,n:w.name,icon:w.icon}))}
function levelOpts(ci,li){
  const ch=WORLDS[ci],lv=ch.levels[li],src=lv.story?lv.answer:lv.e;
  return{eq:parseEq(src),rel:parseRel(src),target:lv.t||ch.t||'x',goal:lv.goal,tip:lv.story?'📖 '+lv.story:lv.tip,deck:lv.deck,nocomp:lv.nocomp,par:lv.par,
    box:lv.box!==undefined?lv.box:(li<Math.ceil(ch.levels.length*.3)&&!ch.formula&&!ch.story&&ch.theme!=='ineq'),
    label:`${li+1}/${ch.levels.length}`,title:SPECS[state.spec].name+' · '+ch.name+(lv.t&&(ch.formula||ch.story)?' — isoler '+lv.t:''),
    coach:lv.coach&&!SEEN['coach_'+lv.coach]?lv.coach:null,intro:lv.intro?[].concat(lv.intro).filter(k=>!SEEN[k]):null};
}

/* ---------- générateur aléatoire ciblé par thème ---------- */
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
    case'story':{const lv=pick((state.spec==='si'?PROB_SI:PROB_STI).levels.slice(0,4+3*d));return{e:lv.answer,t:lv.t,goal:lv.goal,tip:'📖 '+lv.story}}
    case'ineq':{const r=pick(['<','>','≤','≥']);const k=pick([a,-a]);const val=k*x0+b;const fl=k<0?{'<':'>','>':'<','≤':'≥','≥':'≤'}[r]:r;
      return pick([()=>({e:`x${sg(b)}${r}${x0+b}`,goal:`x${r}${x0}`}),()=>({e:`${k}x${sg(b)}${r}${val}`,goal:`x${fl}${x0}`})].slice(0,d>0?2:1))()}
    case'formula':{const lv=pick(SPECS[state.spec].f);return{e:lv.e,t:lv.t,tip:lv.tip}}
  }
}
