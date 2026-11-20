"use strict";
/* =====================================================================
   ISOLE X ! — v3
   facteur : {t:'n',v} | {t:'s',v} | {t:'g',terms} | {t:'f',fn,n,arg}
   terme   : {neg,num:[facteurs],den:[facteurs]}     côté : [termes]
   ===================================================================== */
let UID=0; const uid=()=>'k'+(++UID);
const N=v=>({t:'n',v,id:uid()}), S=v=>({t:'s',v,id:uid()}), G=terms=>({t:'g',terms,id:uid()});
const F=(fn,n,arg)=>({t:'f',fn,n:n||0,arg,id:uid()});
const T=(num,den=[],neg=false)=>({id:uid(),neg,num,den});
let SILENT=false;

const state={spec:'college',usedHint:false,mode:'level',ci:0,li:0,rnd:null,exp:null,target:'x',eq:[[],[]],deck:[],flip:[],tools:[],pending:null,
  moves:0,par:0,undo:[],history:[],won:false,trad:true,tip:'',box:true,goal:null,goalKey:null,isoAt:null,bonusMax:0,coach:null};

/* ---------- utilitaires ---------- */
const $=q=>document.querySelector(q);
const esc=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a||1};
const clone=o=>JSON.parse(JSON.stringify(o));
function reid(o){const c=clone(o);(function w(z){if(Array.isArray(z))z.forEach(w);else if(z&&typeof z==='object'){if('id'in z)z.id=uid();for(const k in z)if(z[k]&&typeof z[k]==='object')w(z[k]);}})(c);return c;}
const IMAG=['i','j'];const isImagV=v=>IMAG.includes(v);
function walk(o,fn){(function w(z){if(Array.isArray(z))z.forEach(w);else if(z&&typeof z==='object'){fn(z);if(z.terms)w(z.terms);if(z.arg)w(z.arg);if(z.num){w(z.num);w(z.den)}}})(o)}
function hasSym(o,v){let r=false;walk(o,z=>{if(z.t==='s'&&z.v===v)r=true});return r}
const hasT=o=>hasSym(o,state.target);
function hasImag(o){let r=false;walk(o,z=>{if(z.t==='s'&&isImagV(z.v)&&z.v!==state.target)r=true});return r}
function keyF(f){return f.t==='n'?'#'+f.v:f.t==='s'?'$'+f.v:f.t==='g'?'('+f.terms.map(keyT).join('+')+')':'F'+f.fn+f.n+'('+f.arg.map(keyT).join('+')+')'}
function keyT(t){return (t.neg?'-':'')+t.num.map(keyF).join('*')+'/'+t.den.map(keyF).join('*')}
function sigT(t){const a=t.num.filter(f=>f.t!=='n').map(keyF).sort(),b=t.den.filter(f=>f.t!=='n').map(keyF).sort();return a.join('*')+'/'+b.join('*')}
function coef(t){let p=1,q=1;t.num.forEach(f=>{if(f.t==='n')p*=f.v});t.den.forEach(f=>{if(f.t==='n')q*=f.v});if(t.neg)p=-p;const g=gcd(p,q);return{p:p/g,q:q/g}}
/* forme canonique stricte (ordre indifférent, calculs non faits) */
function canF(f){return f.t==='n'?'#'+f.v:f.t==='s'?'$'+f.v:f.t==='g'?'('+canS(f.terms)+')':'F'+f.fn+f.n+'('+canS(f.arg)+')'}
function canT(t){return (t.neg?'-':'+')+t.num.map(canF).sort().join('*')+'/'+t.den.map(canF).sort().join('*')}
function canS(s){return s.map(canT).sort().join('|')}

/* ---------- fonctions ---------- */
const INV={exp:'ln',ln:'exp',log:'p10',p10:'log',sin:'asin',asin:'sin',cos:'acos',acos:'cos',tan:'atan',atan:'tan',root:'pow',pow:'root'};
const SUP={2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶'};
const FNAME={exp:'exp',ln:'ln',log:'log',p10:'10^',sin:'sin',cos:'cos',tan:'tan',asin:'arcsin',acos:'arccos',atan:'arctan'};
const fnLab=f=>f.fn==='root'?(f.n===2?'√':f.n===3?'∛':f.n+'√'):f.fn==='pow'?(SUP[f.n]||'^'+f.n):FNAME[f.fn];
const toolLab=t=>t.fn==='recip'?'1/□':t.fn==='root'?(t.n===2?'√□':t.n===3?'∛□':t.n+'√□'):t.fn==='pow'?'□'+(SUP[t.n]||'^'+t.n):t.fn==='exp'?'e<sup>□</sup>':t.fn==='p10'?'10<sup>□</sup>':FNAME[t.fn]+' □';
const toolTxt=t=>t.fn==='recip'?'1/( )':t.fn==='root'?(t.n===2?'√( )':'∛( )'):t.fn==='pow'?'( )'+(SUP[t.n]||'^'+t.n):t.fn==='exp'?'e^( )':t.fn==='p10'?'10^( )':FNAME[t.fn]+'( )';
const isInv=(f,g)=>(f.fn==='root'&&g.fn==='pow'&&f.n===g.n)||(f.fn==='pow'&&g.fn==='root'&&f.n===g.n)||(f.fn!=='root'&&f.fn!=='pow'&&INV[f.fn]===g.fn);
function innerFn(f){if(f.arg.length!==1)return null;const t=f.arg[0];if(t.neg||t.den.length||t.num.length!==1||t.num[0].t!=='f')return null;return t.num[0]}
function numVal(arg){
  if(!arg.length)return{p:0,q:1,pi:0};if(arg.length!==1)return null;const t=arg[0];let p=1,q=1,pi=0;
  for(const f of t.num){if(f.t==='n')p*=f.v;else if(f.t==='s'&&f.v==='π')pi++;else return null}
  for(const f of t.den){if(f.t==='n')q*=f.v;else return null}
  if(pi>1)return null;if(t.neg)p=-p;const g=gcd(p,q);return{p:p/g,q:q/g,pi};
}
const iroot=(a,n)=>{const r=Math.round(Math.pow(a,1/n));return Math.pow(r,n)===a?r:null};
const TRIG={sin:{'0':[0,1],'1/6':[1,2],'1/2':[1,1],'5/6':[1,2],'1':[0,1],'7/6':[-1,2],'3/2':[-1,1],'11/6':[-1,2]},
  cos:{'0':[1,1],'1/3':[1,2],'1/2':[0,1],'2/3':[-1,2],'1':[-1,1],'4/3':[-1,2],'3/2':[0,1],'5/3':[1,2]},
  tan:{'0':[0,1],'1/4':[1,1],'3/4':[-1,1],'1':[0,1],'5/4':[1,1],'7/4':[-1,1]}};
const ATRIG={asin:{'0':[0,1],'1/2':[1,6],'1':[1,2],'-1/2':[-1,6],'-1':[-1,2]},acos:{'1':[0,1],'1/2':[1,3],'0':[1,2],'-1/2':[2,3],'-1':[1,1]},atan:{'0':[0,1],'1':[1,4],'-1':[-1,4]}};
function evalFn(f,v){
  const R=(p,q,pi=0)=>{const g=gcd(p,q);return{p:p/g,q:q/g,pi}};
  switch(f.fn){
    case 'pow':if(v.pi)return null;{const p=Math.pow(v.p,f.n),q=Math.pow(v.q,f.n);return Math.abs(p)<1e7?R(p,q):null}
    case 'root':{if(v.pi)return null;if(v.p<0&&f.n%2===0)return null;const a=iroot(Math.abs(v.p),f.n),b=iroot(v.q,f.n);return a!==null&&b!==null?R(v.p<0?-a:a,b):null}
    case 'exp':return v.p===0?R(1,1):null;
    case 'ln':return v.p===1&&v.q===1&&!v.pi?R(0,1):null;
    case 'log':{if(v.pi||v.p<=0)return null;let k=0,a=v.p,b=v.q;while(a%10===0){a/=10;k++}while(b%10===0){b/=10;k--}return a===1&&b===1?R(k,1):null}
    case 'p10':{if(v.pi||v.q!==1||Math.abs(v.p)>6)return null;return v.p>=0?R(Math.pow(10,v.p),1):R(1,Math.pow(10,-v.p))}
    case 'sin':case 'cos':case 'tan':{
      if(!v.pi){if(v.p!==0)return null;return f.fn==='cos'?R(1,1):R(0,1)}
      let p=((v.p%(2*v.q))+2*v.q)%(2*v.q);const g=gcd(p,v.q);const k=p===0?'0':(v.q/g===1?String(p/g):(p/g)+'/'+(v.q/g));const r=TRIG[f.fn][k];return r?R(r[0],r[1]):null}
    case 'asin':case 'acos':case 'atan':{if(v.pi)return null;const k=v.q===1?String(v.p):v.p+'/'+v.q;const r=ATRIG[f.fn][k];return r?(r[0]===0?R(0,1):R(r[0],r[1],1)):null}
  }
  return null;
}
const resTerms=r=>r.p===0?[]:[T([N(Math.abs(r.p)),...(r.pi?[S('π')]:[])],r.q>1?[N(r.q)]:[],r.p<0)];
const rootProd=f=>{if(f.fn!=='root'||f.arg.length!==1)return null;const t=f.arg[0];return(!t.neg&&!t.den.length&&t.num.length===f.n&&t.num.every(x=>keyF(x)===keyF(t.num[0])))?t.num[0]:null};
const canTapFn=f=>{if(rootProd(f))return true;const g=innerFn(f);if(g&&isInv(f,g))return true;const v=numVal(f.arg);return !!(v&&evalFn(f,v))};

/* ---------- analyseur d'équations ---------- */
const FNAMES={sqrt:'root2',racine:'root2',rac:'root2',cbrt:'root3',exp:'exp',ln:'ln',log:'log',sin:'sin',cos:'cos',tan:'tan',arcsin:'asin',asin:'asin',arccos:'acos',acos:'acos',arctan:'atan',atan:'atan'};
function lex(s){
  s=s.replace(/[−–]/g,'-').replace(/[×·•]/g,'*').replace(/÷/g,'/').replace(/²/g,'^2').replace(/³/g,'^3');
  const out=[];let i=0;const isL=c=>/[A-Za-z_Α-Ωα-ω]/.test(c)&&c!=='π';
  while(i<s.length){const c=s[i];
    if(/\s/.test(c)){i++;continue}
    if(/[0-9.,]/.test(c)){let j=i;while(j<s.length&&/[0-9.,]/.test(s[j]))j++;out.push({k:'num',v:s.slice(i,j).replace(',','.')});i=j;continue}
    if(c==='π'){out.push({k:'name',v:'π'});i++;continue}
    if(isL(c)){let j=i+1;while(j<s.length&&(isL(s[j])||/[0-9']/.test(s[j])))j++;out.push({k:'name',v:s.slice(i,j)});i=j;continue}
    if('+-*/^()=√∛'.includes(c)){out.push({k:c});i++;continue}
    throw new Error(`Caractère inconnu : « ${c} »`);
  }
  return out;
}
function parseAST(str){
  const tk=lex(str);let p=0;const peek=()=>tk[p];
  const eat=k=>{const t=tk[p];if(!t||t.k!==k)throw new Error(`« ${k} » attendu`);p++;return t};
  const startsAtom=t=>t&&(t.k==='num'||t.k==='name'||t.k==='('||t.k==='√'||t.k==='∛');
  function expr(){let a=term();while(peek()&&(peek().k==='+'||peek().k==='-')){const op=tk[p++].k;a={k:op==='+'?'add':'sub',a,b:term()}}return a}
  function term(){let a=unary();for(;;){const t=peek();if(t&&t.k==='*'){p++;a={k:'mul',a,b:unary()}}else if(t&&t.k==='/'){p++;a={k:'div',a,b:unary()}}else if(startsAtom(t)){a={k:'mul',a,b:power()}}else break}return a}
  function unary(){const t=peek();if(t&&t.k==='-'){p++;return{k:'neg',a:unary()}}if(t&&t.k==='+'){p++;return unary()}return power()}
  function power(){const b=atom();if(peek()&&peek().k==='^'){p++;return{k:'pow',a:b,e:unary()}}return b}
  function atom(){const t=tk[p++];if(!t)throw new Error('Expression incomplète');
    if(t.k==='num')return{k:'num',v:t.v};
    if(t.k==='('){const e=expr();eat(')');return e}
    if(t.k==='√'||t.k==='∛')return{k:'fn',f:t.k==='√'?'root2':'root3',a:atom()};
    if(t.k==='name'){if(FNAMES[t.v]&&peek()&&peek().k==='('){p++;const e=expr();eat(')');return{k:'fn',f:FNAMES[t.v],a:e}}
      return{k:'sym',v:t.v==='pi'?'π':t.v}}
    throw new Error(`« ${t.k} » inattendu`);
  }
  const e=expr();if(p<tk.length)throw new Error(`« ${tk[p].v||tk[p].k} » inattendu`);return e;
}
function rat(str){if(!/^\d*\.?\d+$/.test(str))throw new Error('Nombre invalide : '+str);const [a,b='']=str.split('.');const q=Math.pow(10,b.length),p=parseInt((a||'')+b,10);const g=gcd(p,q);return{p:p/g,q:q/g}}
const negT=t=>(t.neg=!t.neg,t);
const mulT=(x,y)=>({id:uid(),neg:x.neg!==y.neg,num:x.num.concat(y.num),den:x.den.concat(y.den)});
const recT=x=>({id:uid(),neg:x.neg,num:x.den,den:x.num});
function toSum(a){switch(a.k){case'add':return toSum(a.a).concat(toSum(a.b));case'sub':return toSum(a.a).concat(toSum(a.b).map(negT));case'neg':return toSum(a.a).map(negT);default:return[toTerm(a)]}}
function asTerm(a){const s=toSum(a);return s.length===1?s[0]:T([G(s)])}
function toTerm(a){
  switch(a.k){
    case'num':{const r=rat(a.v);return T([N(r.p)],r.q>1?[N(r.q)]:[])}
    case'sym':return T([S(a.v)]);
    case'mul':return mulT(asTerm(a.a),asTerm(a.b));
    case'div':return mulT(asTerm(a.a),recT(asTerm(a.b)));
    case'fn':{const m=a.f.match(/^root(\d)$/);return T([m?F('root',+m[1],toSum(a.a)):F(a.f,0,toSum(a.a))])}
    case'pow':{
      if(a.a.k==='sym'&&a.a.v==='e')return T([F('exp',0,toSum(a.e))]);
      if(a.a.k==='num'&&a.a.v==='10'&&a.e.k!=='num')return T([F('p10',0,toSum(a.e))]);
      let e=a.e,ng=false;if(e.k==='neg'){ng=true;e=e.a}
      if(e.k!=='num'||!/^\d+$/.test(e.v))throw new Error('Exposant non entier : utilise sqrt( ) ou e^( )');
      const n=+e.v;const t=n===0?T([N(1)]):n===1?asTerm(a.a):T([F('pow',n,toSum(a.a))]);return ng?recT(t):t}
    default:return asTerm(a);
  }
}
function parseSum(str){const s=toSum(parseAST(str));norm(s);return s}
function parseEq(str){const parts=str.split('=');if(parts.length!==2)throw new Error('Il faut exactement un signe =');
  if(!parts[0].trim()||!parts[1].trim())throw new Error('Il manque un membre de chaque côté du =');return[parseSum(parts[0]),parseSum(parts[1])]}
function symbolsOf(eq){const s=new Set();walk(eq,z=>{if(z.t==='s'&&z.v!=='π'&&!isImagV(z.v))s.add(z.v)});return[...s]}

/* ---------- texte ---------- */
function textF(f){
  if(f.t==='g')return'('+textSum(f.terms)+')';
  if(f.t!=='f')return String(f.v);
  const a=textSum(f.arg);
  switch(f.fn){case'root':return fnLab(f)+'('+a+')';case'pow':return(f.arg.length===1&&f.arg[0].num.length===1&&!f.arg[0].den.length&&!f.arg[0].neg?a:'('+a+')')+(SUP[f.n]||'^'+f.n);
    case'exp':return'e^('+a+')';case'p10':return'10^('+a+')';default:return FNAME[f.fn]+'('+a+')'}
}
function textRow(fs){return fs.length?fs.map(textF).join('·'):'1'}
function textT(t,withSign){const a=textRow(t.num);let r=a;if(t.den.length){const b=textRow(t.den);r=(t.num.length>1?'('+a+')':a)+'/'+(t.den.length>1?'('+b+')':b)}return(withSign&&t.neg?'−':'')+r}
function textSum(sum){if(!sum.length)return'0';return sum.map((t,i)=>(i?(t.neg?' − ':' + '):(t.neg?'−':''))+textT(t,false)).join('')}

/* ---------- rendu HTML ---------- */
const MB={d:true,box:true};
function hF(f,m){
  const da=m.d?` data-fid="${f.id}"`:'';
  if(f.t==='g'){const dv=m.d?` data-dev="${f.id}"`:'';
    if(m.box)return`<span class="gbox"${da}${dv}>${hSum(f.terms,m)}</span>`;
    return`<span class="grp"><span class="par"${da}${dv}>(</span>${hSum(f.terms,m)}<span class="par"${da}${dv}>)</span></span>`}
  if(f.t==='f')return hFn(f,m);
  const cls=f.t==='n'?'n':(f.v===state.target?'box':(isImagV(f.v)?'s im':'s'));
  return`<span class="card ${cls}"${da}>${esc(f.v)}</span>`;
}
function hFn(f,m){
  const da=m.d?` data-fid="${f.id}" data-fn="${f.id}"`:'';const inner=hSum(f.arg,m);
  if(m.box){
    if(f.fn==='pow')return`<span class="fbox pow"${da}><span class="fin">${inner}</span><span class="ftab sup"${da}>${SUP[f.n]||'^'+f.n}</span></span>`;
    return`<span class="fbox fn-${f.fn}"${da}><span class="ftab"${da}>${fnLab(f)}</span><span class="fin">${inner}</span></span>`}
  const simple=f.arg.length===1&&f.arg[0].num.length===1&&!f.arg[0].den.length&&!f.arg[0].neg&&f.arg[0].num[0].t!=='f'&&f.arg[0].num[0].t!=='g';
  const par=x=>`<span class="par">(</span>${x}<span class="par">)</span>`;
  switch(f.fn){
    case'root':return`<span class="fpl"${da}><span class="fname"${da}>${fnLab(f)}</span><span class="froot">${inner}</span></span>`;
    case'pow':return`<span class="fpl"${da}>${simple?inner:par(inner)}<sup class="fsup"${da}>${f.n}</sup></span>`;
    case'exp':return`<span class="fpl"${da}><span class="fname"${da}>e</span><sup class="fsup">${inner}</sup></span>`;
    case'p10':return`<span class="fpl"${da}><span class="fname"${da}>10</span><sup class="fsup">${inner}</sup></span>`;
    default:return`<span class="fpl"${da}><span class="fname"${da}>${fnLab(f)}</span>${par(inner)}</span>`;
  }
}
function hRow(fs,t,m){if(!fs.length)return`<span class="card n one"${m.d?` data-tid="${t.id}"`:''}>1</span>`;return fs.map(f=>hF(f,m)).join('<span class="dot">·</span>')}
function hT(t,m){
  const da=m.d?` data-tid="${t.id}"`:'';const num=`<span class="row">${hRow(t.num,t,m)}</span>`;
  const body=t.den.length?`<span class="frac">${num}<span class="bar"${da}></span><span class="row">${hRow(t.den,t,m)}</span></span>`:num;
  return`<span class="term"${da}>${body}</span>`;
}
function hSum(sum,m){
  if(!sum.length)return`<span class="card n zero">0</span>`;
  return sum.map((t,i)=>(i===0?(t.neg?'<span class="sign">−</span>':''):`<span class="sign">${t.neg?'−':'+'}</span>`)+hT(t,m)).join('');
}
const MM={d:false,box:false};
const mathSum=s=>`<span class="math">${hSum(s,MM)}</span>`;
const mathEq=eq=>`<span class="math">${hSum(eq[0],MM)}<span class="eqs">=</span>${hSum(eq[1],MM)}</span>`;

/* ---------- normalisation automatique ---------- */
function norm(sum){
  for(let i=0;i<sum.length;i++){
    const t=sum[i];
    ['num','den'].forEach(r=>t[r].forEach(f=>{if(f.t==='g')norm(f.terms);if(f.t==='f')norm(f.arg)}));
    let ch=true;
    while(ch){ch=false;
      for(const r of['num','den']){const k=t[r].findIndex(f=>f.t==='g'&&f.terms.length===1);
        if(k>=0){const inn=t[r][k].terms[0];t[r].splice(k,1);t.neg=t.neg!==inn.neg;
          if(r==='num'){t.num.splice(k,0,...inn.num);t.den.push(...inn.den)}else{t.den.splice(k,0,...inn.num);t.num.push(...inn.den)}ch=true}}
    }
    t.num=t.num.filter(f=>!(f.t==='n'&&f.v===1));t.den=t.den.filter(f=>!(f.t==='n'&&f.v===1));
    if(t.num.some(f=>(f.t==='n'&&f.v===0)||(f.t==='g'&&!f.terms.length))){sum.splice(i,1);i--;continue}
    if(!t.neg&&!t.den.length&&t.num.length===1&&t.num[0].t==='g'){sum.splice(i,1,...t.num[0].terms);i--;continue}
  }
}

/* ---------- localisation ---------- */
function locate(id){for(let s=0;s<2;s++){const r=srch(state.eq[s],id,s,[]);if(r)return r}return null}
function srch(sum,id,side,chain){
  for(const t of sum){const ch=chain.concat([{term:t,sum}]);
    if(t.id===id)return{kind:'term',term:t,sum,side,chain:ch};
    for(const r of['num','den'])for(const f of t[r]){
      if(f.id===id)return{kind:'factor',f,row:r,term:t,sum,side,chain:ch};
      const sub=f.t==='g'?f.terms:f.t==='f'?f.arg:null;if(sub){const q=srch(sub,id,side,ch);if(q)return q}
    }}
  return null;
}

/* ---------- opérations sur les deux côtés ---------- */
function applyOp(side,op,card){
  const sm=state.eq[side],c=reid(card);
  if(op==='add'){sm.push(c);return}
  const mul=op==='mul',cn=mul?c.num:c.den,cd=mul?c.den:c.num;
  if(!sm.length)return;
  if(sm.length===1){const t=sm[0];t.neg=t.neg!==c.neg;t.num.unshift(...cn);t.den.push(...cd)}
  else{const g=G(sm.splice(0));sm.push({id:uid(),neg:c.neg,num:[...cn,g],den:[...cd]})}
}
function applyFn(side,tool){const sm=state.eq[side];const arg=sm.splice(0);
  if(tool.fn==='recip'){sm.push(arg.length===1?recT(arg[0]):T([],[G(arg)]));return}
  sm.push(T([F(tool.fn,tool.n,arg)]))}
const OPSYM={add:'+',mul:'×',div:'÷'};
function opLabel(op,card){const tx=textT(card,true);return OPSYM[op]+' '+(card.neg||card.den.length||card.num.length>1?'('+tx+')':tx)}

function doDeck(side,op,idx){
  const card=clone(state.deck[idx]);if(state.flip[idx])card.neg=!card.neg;
  const sig=op+'|'+keyT(card);
  if(state.pending){
    if(side!==state.pending.side||sig!==state.pending.sig)return fail(`Équilibre la balance ! Fais <b>${state.pending.label}</b> aussi de l'autre côté.`);
    applyOp(side,op,card);const lab=state.pending.label;state.pending=null;hideToast();return finishMove(lab+' des deux côtés');
  }
  pushUndo();applyOp(side,op,card);norm(state.eq[side]);
  state.pending={side:1-side,sig,op,idx,label:opLabel(op,card),w:op==='add'?(card.neg?-1:1):op==='mul'?1:-1};render();
  toast(`Maintenant <b>${state.pending.label}</b> de l'autre côté.`);return true;
}
function doTool(side,idx){
  const tool=state.tools[idx];if(tool.fn==='recip'&&!state.eq[side].length)return fail('On ne peut pas inverser 0.');const sig='fn|'+tool.fn+tool.n;
  if(state.pending){
    if(side!==state.pending.side||sig!==state.pending.sig)return fail(`Équilibre la balance ! Applique <b>${state.pending.label}</b> aussi de l'autre côté.`);
    applyFn(side,tool);const lab=state.pending.label;state.pending=null;hideToast();return finishMove(lab+' des deux côtés');
  }
  pushUndo();applyFn(side,tool);
  state.pending={side:1-side,sig,op:'fn',tidx:idx,label:toolTxt(tool),w:tool.fn==='recip'?-1:1};render();
  toast(`Applique <b>${state.pending.label}</b> de l'autre côté aussi.`);return true;
}

function removeF(l){const a=l.term[l.row];a.splice(a.indexOf(l.f),1)}
const like=(A,B)=>sigT(A)===sigT(B);
function combine(sum,A,B){
  const a=coef(A),b=coef(B);let p=a.p*b.q+b.p*a.q,q=a.q*b.q;const g=gcd(p,q);p/=g;q/=g;
  if(p===0){sum.splice(sum.indexOf(A),1);sum.splice(sum.indexOf(B),1);return 0}
  const nt={id:uid(),neg:p<0,num:[N(Math.abs(p)),...A.num.filter(f=>f.t!=='n').map(reid)],den:[N(q),...A.den.filter(f=>f.t!=='n').map(reid)]};
  sum.splice(sum.indexOf(B),1,nt);sum.splice(sum.indexOf(A),1);return p/q;
}
function factorize(sum,A,fa,B,fb){
  const A2={...A,num:A.num.filter(f=>f!==fa)},B2={...B,num:B.num.filter(f=>f!==fb)};
  const iA=sum.indexOf(A),iB=sum.indexOf(B);const nt=T([fa,G(iA<iB?[A2,B2]:[B2,A2])]);
  sum.splice(iA,1,nt);sum.splice(sum.indexOf(B),1);
}
const lnTerm=t=>!t.den.length&&t.num.length===1&&t.num[0].t==='f'&&(t.num[0].fn==='ln'||t.num[0].fn==='log');
function argTerm(arg){return arg.length===1?reid(arg[0]):T([G(reid(arg))])}
function combineLn(sum,A,B){
  const fa=A.num[0],fb=B.num[0];let ta=argTerm(fa.arg),tb=argTerm(fb.arg);if(A.neg)ta=recT(ta);if(B.neg)tb=recT(tb);
  const nt=T([F(fa.fn,0,[mulT(ta,tb)])]);sum.splice(sum.indexOf(A),1,nt);sum.splice(sum.indexOf(B),1);
}

function boardDrop(src,tgt){
  if(src===tgt)return false;
  const a=locate(src),b=locate(tgt);if(!a||!b)return false;
  if(state.pending)return fail(`Termine d'abord : <b>${state.pending.label}</b> de l'autre côté.`);
  if(a.side!==b.side)return fail("Pas du même côté du = ! Pour agir des deux côtés, utilise la pioche.");
  if(a.term===b.term&&a.kind==='factor'&&b.kind==='factor'){
    if(a.row!==b.row){
      if(keyF(a.f)===keyF(b.f)){pushUndo();const tx=textF(a.f);removeF(a);removeF(b);return finishMove(`Simplification : ${tx}/${tx} = 1`,'cancel')}
      if(a.f.t==='n'&&b.f.t==='n'){const g=gcd(a.f.v,b.f.v);
        if(g>1){pushUndo();a.f.v/=g;b.f.v/=g;return finishMove(`Simplification par ${g}`,'gcd')}
        return fail(`${a.f.v} et ${b.f.v} n'ont pas de diviseur commun.`)}
      return fail("Glisse une carte sur <b>la même carte</b> de l'autre étage (haut ↔ bas).");
    }
    if(a.f.t==='n'&&b.f.t==='n'){pushUndo();const tx=a.f.v+'·'+b.f.v;b.f.v*=a.f.v;removeF(a);return finishMove(`Calcul : ${tx} = ${b.f.v}`,'product')}
    if(a.f.t==='s'&&b.f.t==='s'&&isImagV(a.f.v)&&a.f.v===b.f.v){pushUndo();removeF(a);removeF(b);a.term.neg=!a.term.neg;return finishMove(`${a.f.v}·${a.f.v} = −1`,'i2')}
    if(a.f.t==='f'&&b.f.t==='f'&&a.f.fn==='exp'&&b.f.fn==='exp'){pushUndo();const nf=F('exp',0,reid(a.f.arg).concat(reid(b.f.arg)));a.term[a.row].splice(a.term[a.row].indexOf(b.f),1,nf);removeF(a);return finishMove('e^a·e^b = e^(a+b)')}
    const ba=powBase(a.f),bb=powBase(b.f);
    if(ba&&bb&&ba.k===bb.k){pushUndo();const nf=F('pow',ba.n+bb.n,[T([reid(ba.base)])]);const row=b.term[b.row];row.splice(row.indexOf(b.f),1,nf);removeF(a);
      return finishMove(`${textF(ba.base)}·${textF(ba.base)} = ${textF(nf)}`,'powmerge')}
    return fail("Seuls deux <b>nombres</b>, ou deux jetons identiques (v·v = v²), côte à côte se regroupent.");
  }
  const e=b.chain.find(c=>c.sum===a.sum);
  if(!e)return fail("Ces cartes ne sont pas dans la même somme.");
  const A=a.term,B=e.term;
  if(A===B)return fail(a.kind==='factor'?"Pour développer, touche la boîte ou la parenthèse.":"Glisse ce terme sur un autre terme.");
  if(lnTerm(A)&&lnTerm(B)&&A.num[0].fn===B.num[0].fn&&(a.kind==='term'||a.f===A.num[0])){
    pushUndo();combineLn(a.sum,A,B);return finishMove('ln(a) + ln(b) = ln(a·b)','lncomb')}
  if(like(A,B)){pushUndo();const tA=textT(A,true),tB=textT(B,true);const r=combine(a.sum,A,B);
    return finishMove(r===0?`Annulation : ${tA} et ${tB}`:`Réduction : ${tA} et ${tB}`,r===0?'cancel':'like')}
  if(a.kind==='factor'&&a.row==='num'){const m=B.num.find(f=>keyF(f)===keyF(a.f));
    if(m){pushUndo();const tx=textF(a.f);factorize(a.sum,A,a.f,B,m);return finishMove('Factorisation par '+tx,'fact')}
    return fail(`Pour factoriser, les deux termes doivent contenir <b>${esc(textF(a.f))}</b>.`)}
  return fail("Ces deux termes ne sont pas semblables.");
}
function powBase(f){
  if(f.t==='n')return null;
  if(f.t==='f'&&f.fn==='pow'){if(f.arg.length===1&&f.arg[0].num.length===1&&!f.arg[0].den.length&&!f.arg[0].neg)return{k:keyF(f.arg[0].num[0]),n:f.n,base:f.arg[0].num[0]};return{k:'('+f.arg.map(keyT).join('+')+')',n:f.n,base:G(f.arg)}}
  return{k:keyF(f),n:1,base:f};
}
function expandPow(id){
  if(state.pending)return fail(`Termine d'abord : <b>${state.pending.label}</b> de l'autre côté.`);
  const l=locate(id);if(!l||l.kind!=='factor'||l.f.t!=='f'||l.f.fn!=='pow')return false;
  const f=l.f,b=powBase(f);const base=b.base.t==='g'?b.base:b.base;pushUndo();
  const row=l.term[l.row],k=row.indexOf(f);const rest=f.n===2?reid(base):F('pow',f.n-1,[T([reid(base)])]);
  row.splice(k,1,reid(base),rest);return finishMove(`${textF(f)} = ${textF(base)}·${textF(rest)}`,'powsplit');
}
function develop(gid){
  if(state.pending)return fail(`Termine d'abord : <b>${state.pending.label}</b> de l'autre côté.`);
  const l=locate(gid);if(!l||l.kind!=='factor')return false;
  if(l.row==='den')return fail("On ne développe pas au dénominateur : multiplie plutôt les deux côtés par cette parenthèse.");
  const T0=l.term,others=T0.num.filter(f=>f!==l.f);
  if(!others.length&&!T0.den.length&&!T0.neg)return fail('Rien à développer ici.');
  pushUndo();
  const nts=l.f.terms.map(t=>({id:uid(),neg:T0.neg!==t.neg,num:[...others.map(reid),...t.num],den:[...T0.den.map(reid),...t.den]}));
  l.sum.splice(l.sum.indexOf(T0),1,...nts);return finishMove('Développement','dev');
}
function simplifyFn(id){
  if(state.pending)return fail(`Termine d'abord : <b>${state.pending.label}</b> de l'autre côté.`);
  const l=locate(id);if(!l||l.kind!=='factor'||l.f.t!=='f')return false;const f=l.f,row=l.term[l.row],k=row.indexOf(f);
  const rp=rootProd(f);if(rp){pushUndo();row.splice(k,1,G([T([reid(rp)])]));return finishMove(`${fnLab(f)}(${textF(rp)}·${textF(rp)}) = ${textF(rp)}`,'inv')}
  const g=innerFn(f);
  if(g&&isInv(f,g)){pushUndo();row.splice(k,1,G(reid(g.arg)));return finishMove(`${fnLab(f)} et ${fnLab(g)} s'annulent`,'inv')}
  const v=numVal(f.arg);
  if(v){const r=evalFn(f,v);if(r){pushUndo();row.splice(k,1,G(resTerms(r)));return finishMove(`Calcul : ${textF(f)}`,'eval')}
    return fail(`${esc(textF(f))} n'a pas de valeur exacte simple : on la garde telle quelle.`)}
  return fail("Pour simplifier une fonction, il faut sa réciproque juste dedans (ex. √(x²), ln(e^x)) ou un nombre.");
}
function copyToDeck(id){
  const l=locate(id);if(!l)return false;
  let card=l.kind==='factor'?T([reid(l.f)]):reid(l.term);card.neg=false;
  const k=keyT(card),i=state.deck.findIndex(c=>keyT(c)===k);
  if(i>=0){toast('Ce jeton est déjà dans la pioche.');flashDeck(i);return true}
  if(state.deck.length>=14)return fail('La pioche est pleine.');
  state.deck.push(card);state.flip.push(false);renderDeck();flashDeck(state.deck.length-1);
  toast('Jeton ajouté à la pioche : <b>'+esc(textT(card,false))+'</b>');return true;
}

/* ---------- coups, annulation, isolement, victoire ---------- */
function pushUndo(){if(SILENT)return;state.undo.push({eq:clone(state.eq),pending:clone(state.pending),moves:state.moves,hl:state.history.length,deck:clone(state.deck),flip:state.flip.slice(),tools:clone(state.tools),isoAt:state.isoAt,bonusMax:state.bonusMax});if(state.undo.length>200)state.undo.shift()}
function undo(){
  if(state.won)return;const u=state.undo.pop();if(!u)return toast("Rien à annuler.");
  Object.assign(state,{eq:u.eq,pending:u.pending,moves:u.moves,deck:u.deck,flip:u.flip,tools:u.tools,isoAt:u.isoAt,bonusMax:u.bonusMax});state.history.length=u.hl;render();
}
function finishMove(desc,kind){
  norm(state.eq[0]);norm(state.eq[1]);state.moves++;
  if(!SILENT){state.history.push({desc,eq:clone(state.eq)});if(window.sfx)sfx(kind==='cancel'||kind==='like'?'merge':'pop')}
  afterMove();render();if(kind&&!SILENT)maybeIntroAfter(kind);return true;
}
function isolated(sd){const sm=state.eq[sd];if(sm.length!==1)return false;const t=sm[0];return !t.neg&&!t.den.length&&t.num.length===1&&t.num[0].t==='s'&&t.num[0].v===state.target}
function isoSide(){for(const sd of[0,1])if(isolated(sd)&&!hasT(state.eq[1-sd]))return sd;return -1}
function goalMatch(){const s=isoSide();return s>=0&&canS(state.eq[1-s])===state.goalKey}
function fullySimplified(){return !findSimp(state.eq[0])&&!findSimp(state.eq[1])}
function afterMove(){
  if(state.pending)return;
  const iso=isoSide();
  if(iso<0){state.isoAt=null;return}
  if(SILENT)return;
  if(state.isoAt==null){state.isoAt=state.moves;state.bonusMax=state.goal?0:simpCount()}
  if(state.goal){if(goalMatch())win();return}
  if(fullySimplified())win();
  else maybeIntroAfter('bonus');
}
let winT;
function win(){if(state.won)return;state.won=true;render();if(window.onWin)onWin();winT=setTimeout(showWin,state.mode==='chrono'?250:700)}
function scoreOf(){
  const isoMoves=state.goal?state.moves:(state.isoAt??state.moves);const par=state.par;
  const stars=!par?0:isoMoves<=par?3:isoMoves<=par+2?2:1;
  const simp=state.goal?true:(fullySimplified()&&(state.bonusMax===0||state.moves<=state.isoAt+state.bonusMax));
  return{stars,simp,points:(par?stars*100:200)+(simp?50:0)};
}

/* ---------- progression ---------- */
let PROG={};try{PROG=JSON.parse(localStorage.getItem('isoleX_college')||'{}')}catch(e){}
function saveProg(){try{localStorage.setItem('isoleX_college',JSON.stringify(PROG))}catch(e){}}
let SEEN={};try{SEEN=JSON.parse(localStorage.getItem('isoleX_college_seen')||'{}')}catch(e){}
function saveSeen(){try{localStorage.setItem('isoleX_college_seen',JSON.stringify(SEEN))}catch(e){}}
const progKey=(ci,li)=>state.spec+'|'+ci+'-'+li;

/* ---------- pioche automatique ---------- */
function autoDeck(nocomp){
  const both=hasT(state.eq[0])&&hasT(state.eq[1]);const seen=new Map();
  walk(state.eq,z=>{if(z.t==='n'&&z.v!==1)seen.set(keyF(z),N(z.v));else if(z.t==='s'&&(z.v!==state.target||both))seen.set(keyF(z),S(z.v))});
  const arr=[...seen.values()].sort((a,b)=>a.t!==b.t?(a.t==='n'?-1:1):a.t==='n'?a.v-b.v:String(a.v).localeCompare(String(b.v)));
  const cards=arr.map(f=>T([f]));
  if(!nocomp)for(const sd of[0,1])for(const t of state.eq[sd])if(!hasT(t)&&(t.num.length+t.den.length>1||t.num.some(f=>f.t!=='n'&&f.t!=='s'))){
    const c=reid(t);c.neg=false;if(!cards.some(d=>keyT(d)===keyT(c))&&cards.length<12)cards.push(c)}
  if(!cards.some(c=>keyT(c)==='#1/'))cards.push(T([N(1)]));
  return cards;
}
function autoTools(){const m=new Map();walk(state.eq,z=>{if(z.t==='f'&&hasT(z)){const t={fn:INV[z.fn],n:z.n};m.set(t.fn+t.n,t)}});return[...m.values()]}

/* ---------- indices et résolution automatique ---------- */
function deckHas(t){const c=clone(t);c.neg=false;const k=keyT(c);return state.deck.findIndex(d=>keyT(d)===k)}
function deckNote(t){return deckHas(t)<0?" Ce jeton n'est pas dans la pioche : glisse d'abord le terme du plateau <b>dans la pioche</b>.":''}
function findSimp(sum){
  for(const t of sum){
    for(const a of t.num)for(const b of t.den)if(keyF(a)===keyF(b))return{msg:`Simplifie : glisse ${esc(textF(a))} (en haut) sur ${esc(textF(b))} (en bas).`,ids:[a.id,b.id]};
    for(const a of t.num)for(const b of t.den)if(a.t==='n'&&b.t==='n'&&gcd(a.v,b.v)>1)return{msg:`${a.v} et ${b.v} sont divisibles par ${gcd(a.v,b.v)} : glisse l'un sur l'autre.`,ids:[a.id,b.id]};
    for(const r of['num','den']){const im=t[r].filter(f=>f.t==='s'&&isImagV(f.v));if(im.length>1)return{msg:'i·i = −1 : glisse un i sur l\'autre.',ids:[im[0].id,im[1].id]}}
    for(const r of['num','den']){const fs=t[r].filter(f=>f.t!=='n'&&!(f.t==='s'&&isImagV(f.v)));for(let i=0;i<fs.length;i++)for(let j=i+1;j<fs.length;j++){const x=powBase(fs[i]),y=powBase(fs[j]);
      if(x&&y&&x.k===y.k)return{msg:`Deux jetons identiques : glisse l'un sur l'autre (${esc(textF(x.base))}·${esc(textF(x.base))} = ${esc(textF(x.base))}²).`,ids:[fs[i].id,fs[j].id]}}}
    for(const r of['num','den'])for(const f of t[r]){
      if(f.t==='f'){if(canTapFn(f))return{msg:`Touche <b>${esc(fnLab(f))}</b> pour simplifier.`,ids:[f.id],act:'tap'};const h=findSimp(f.arg);if(h)return h}
      if(f.t==='g'){const h=findSimp(f.terms);if(h)return h}
    }
  }
  for(let i=0;i<sum.length;i++)for(let j=i+1;j<sum.length;j++)if(like(sum[i],sum[j]))
    return{msg:`${esc(textT(sum[i],true))} et ${esc(textT(sum[j],true))} sont semblables : glisse l'un sur l'autre.`,ids:[sum[j].id,sum[i].id]};
  for(const t of sum)for(const r of['num','den']){const ns=t[r].filter(f=>f.t==='n');if(ns.length>1)return{msg:'Calcule ce produit : glisse un nombre sur l\'autre.',ids:[ns[0].id,ns[1].id]}}
  return null;
}
function findGroupDev(sum){for(const t of sum){const g=t.num.find(f=>f.t==='g');if(g&&(t.num.length>1||t.den.length||t.neg))return g;
  for(const f of t.num.concat(t.den)){const sub=f.t==='g'?f.terms:f.t==='f'?f.arg:null;if(sub){const r=findGroupDev(sub);if(r)return r}}}return null}
function conjCard(g){return T([G(g.terms.map(t=>{const c=reid(t);if(hasImag(c))c.neg=!c.neg;return c}))])}
function computeHint(){
  const tg=state.target,E=state.eq;
  const iso=isoSide();
  if(iso>=0){const o=1-iso;const h=findSimp(E[o]);if(h)return h;
    if(state.goal&&!goalMatch()){const g=findGroupDev(E[o]);if(g)return{msg:'Développe pour arriver au résultat demandé.',ids:[g.id],act:'dev'};return{msg:'Compare avec le résultat demandé 🎯.',ids:[]}}
    return{msg:'C\'est le plus simple possible : valide !',ids:[],act:'validate'}}
  const both=hasT(E[0])&&hasT(E[1]);const sd=hasT(E[0])?0:1;const sum=E[sd];
  let h=findSimp(sum)||(both?findSimp(E[1-sd]):null);if(h)return h;
  if(both){
    for(const s of[0,1])for(const t of E[s])if(hasT(t)&&t.den.length){const f=t.den.find(f=>!hasT(f));if(f)return{msg:`Multiplie les deux côtés par <b>${esc(textF(f))}</b> pour enlever la fraction.`+deckNote(T([f])),ids:[f.id],deck:T([f]),act:'mul'}}
    for(const s of[0,1])for(const t of E[s])if(hasT(t)){const g=t.num.find(f=>f.t==='g'&&hasT(f));if(g&&(t.num.length>1||t.den.length||t.neg))return{msg:'Développe d\'abord : touche la boîte.',ids:[g.id],act:'dev'}}
    const o=E[1-sd].find(hasT);return{msg:`Il y a des ${tg} des deux côtés. Ajoute l'opposé de <b>${esc(textT(o,true))}</b> des deux côtés.`+deckNote(o),ids:[o.id],deck:o,act:'add'};
  }
  if(sum.length>1){
    for(const t of sum)if(hasT(t)){const g=t.num.find(f=>f.t==='g'&&(hasT(f)||hasImag(f)));if(g&&(t.num.length>1||t.den.length||t.neg)&&(hasT(g)?sum.every(hasT):true))return{msg:'Développe : touche la boîte.',ids:[g.id],act:'dev'}}
    const L=sum.filter(lnTerm);for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++)if(L[i].num[0].fn===L[j].num[0].fn)return{msg:'ln(a) + ln(b) = ln(a·b) : glisse l\'un sur l\'autre.',ids:[L[i].id,L[j].id]};
    const o=sum.find(t=>!hasT(t));
    if(o){const op=clone(o);op.neg=!op.neg;return{msg:`Fais disparaître <b>${esc(textT(o,true))}</b> : ajoute ${esc(textT(op,true))} des deux côtés.`+deckNote(o),ids:[o.id],deck:o,act:'add'}}
    for(const t of sum)if(hasT(t)){const g=t.num.find(f=>f.t==='g'&&hasT(f));if(g&&(t.num.length>1||t.den.length||t.neg))return{msg:'Développe : touche la boîte.',ids:[g.id],act:'dev'}}
    return{msg:`Tous les termes contiennent ${tg} : factorise ! Glisse ${tg} d'un terme sur l'autre.`,ids:sum.map(t=>t.id),act:'fact'};
  }
  const t=sum[0];if(!t)return{msg:'…',ids:[]};
  const gi=t.num.filter(f=>f.t==='g'&&!hasT(f)&&hasImag(f));
  if(gi.length>1)return{msg:'Développe ce produit de nombres complexes.',ids:[gi[0].id],act:'dev'};
  if(gi.length===1){const c=conjCard(gi[0]);return{msg:`Multiplie les deux côtés par le conjugué <b>${esc(textT(c,false))}</b>.`,ids:[gi[0].id],deck:c,act:'mul',addCard:true}}
  if(t.den.length){const f=t.den.find(f=>!hasT(f))||t.den[0];return{msg:`Il y a une division par <b>${esc(textF(f))}</b> : multiplie les deux côtés par ${esc(textF(f))} (zone ×).`+deckNote(T([f])),ids:[f.id],deck:T([f]),act:'mul'}}
  const f=t.num.find(f=>!hasT(f));
  if(f){if(f.t==='s'&&isImagV(f.v))return{msg:`Multiplie les deux côtés par <b>${f.v}</b> : ${f.v}·${f.v} = −1 !`,ids:[f.id],deck:T([S(f.v)]),act:'mul'};
    const nf=t.neg?'−'+textF(f):textF(f);return{msg:`${tg} est multiplié par <b>${esc(nf)}</b> : divise les deux côtés par ${esc(nf)}${t.neg?' (jeton retourné)':''}.`+deckNote(T([f])),ids:[f.id],deck:T([f]),act:'div',flip:t.neg}}
  if(t.neg)return{msg:`Il reste un signe − : multiplie les deux côtés par −1 (retourne le jeton 1).`,ids:[t.id],deck:T([N(1)]),act:'neg'};
  const fn=t.num.find(f=>f.t==='f');
  if(fn){const tool={fn:INV[fn.fn],n:fn.n};return{msg:`${tg} est dans <b>${esc(fnLab(fn))}</b> : applique sa réciproque <b>${toolTxt(tool)}</b> aux deux côtés (outil de la pioche).`,ids:[fn.id],tool,act:'tool'}}
  const g=t.num.find(f=>f.t==='g');if(g)return{msg:'Touche la boîte pour développer.',ids:[g.id],act:'dev'};
  return{msg:'Tu y es presque !',ids:[]};
}
function doHint(h){
  const both=(fnc)=>{const a=fnc(0);if(a===false)return false;return fnc(1)};
  switch(h.act){
    case undefined:return h.ids.length>=2?boardDrop(h.ids[0],h.ids[1]):false;
    case 'validate':return false;
    case 'tap':return simplifyFn(h.ids[0]);
    case 'dev':return develop(h.ids[0]);
    case 'add':{const o=locate(h.ids[0]).term;let i=deckHas(o);if(i<0){copyToDeck(o.id);i=deckHas(o)}state.flip[i]=!o.neg;return both(s=>doDeck(s,'add',i))}
    case 'mul':case 'div':{let i=deckHas(h.deck);if(i<0){if(h.addCard){state.deck.push(clone(h.deck));state.flip.push(false)}else{const l=locate(h.ids[0]);copyToDeck(l.f?l.f.id:h.ids[0])}i=deckHas(h.deck)}
      if(i<0)return false;state.flip[i]=!!h.flip;return both(s=>doDeck(s,h.act,i))}
    case 'neg':{let i=deckHas(h.deck);if(i<0){state.deck.push(T([N(1)]));state.flip.push(false);i=state.deck.length-1}state.flip[i]=true;return both(s=>doDeck(s,'mul',i))}
    case 'tool':{let i=state.tools.findIndex(t=>t.fn===h.tool.fn&&t.n===h.tool.n);if(i<0){state.tools.push(h.tool);i=state.tools.length-1}return both(s=>doTool(s,i))}
    case 'fact':{const sm=state.eq[0].length>1&&hasT(state.eq[0])?state.eq[0]:state.eq[1];const A=sm.find(hasT);const f=A.num.find(hasT);const B=sm.find(t=>t!==A&&t.num.some(g=>keyF(g)===keyF(f)));if(!f||!B)return false;return boardDrop(f.id,B.id)}
  }
  return false;
}
function snapState(){return clone(state)}
function restoreState(s){for(const k in s)state[k]=s[k]}
function runSolver(maxSteps=70){ // renvoie {iso,total,ok}
  const snap=snapState();const wasS=SILENT;SILENT=true;let iso=-1,ok=false;
  try{for(let k=0;k<maxSteps;k++){
      if(isoSide()>=0&&!state.pending){if(iso<0)iso=state.moves;
        if(state.goal?goalMatch():fullySimplified()){ok=true;break}}
      const h=computeHint();if(!doHint(h))break;
    }
    if(!ok&&isoSide()>=0&&(state.goal?goalMatch():fullySimplified()))ok=true;
  }catch(e){console.warn(e)}
  const res={iso:iso<0?null:iso,total:state.moves,ok};SILENT=wasS;restoreState(snap);return res;
}
function simpCount(){const r=runSolver(40);return r.ok?Math.max(0,r.total-state.moves):3}

/* ---------- mise en place ---------- */
function setup(o){
  clearTimeout(winT);closeModal();hideToast();stopCoach();
  state.target=o.target||'x';state.eq=o.eq;norm(state.eq[0]);norm(state.eq[1]);
  state.box=o.box!==false;state.goal=o.goal||null;state.goalKey=null;
  if(state.goal){const g=parseEq(state.goal);
    const side=g[0].length===1&&g[0][0].num.length===1&&g[0][0].num[0].v===state.target?g[1]:g[0];state.goalKey=canS(side);state.goalSum=side}
  state.deck=o.deck?o.deck.map(d=>{const s=parseSum(d);return s.length===1?s[0]:T([G(s)])}):autoDeck(o.nocomp);
  if(!state.deck.some(c=>keyT(c)==='#1/'))state.deck.push(T([N(1)]));
  state.flip=state.deck.map(()=>false);state.tools=o.tools||autoTools();if(!state.tools.some(t=>t.fn==='recip'))state.tools.push({fn:'recip',n:0});
  state.pending=null;state.moves=0;state.undo=[];state.won=false;state.usedHint=false;state.tip=o.tip||'';state.isoAt=null;state.bonusMax=0;
  state.history=[{desc:'Départ',eq:clone(state.eq)}];
  const r=runSolver();state.par=r.ok?(state.goal?r.total:r.iso):(o.par||null);
  $('#lvlNum').textContent=o.label;$('#lvlTitle').textContent=o.title;state.tipClosed=false;
  showScreen('game');render();
  if(o.coach)startCoach(o.coach);else if(o.intro)showIntro(o.intro);
}
/* levelOpts : défini dans college-levels.js */
function startLevel(ci,li){state.mode='level';state.ci=ci;state.li=li;state.rnd=null;const o=levelOpts(ci,li);if(o.intro&&!o.intro.length)o.intro=null;setup(o)}
