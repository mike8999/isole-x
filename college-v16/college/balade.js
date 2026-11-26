/* Balade du compagnon : quand l'élève ne touche à rien, le compagnon sort de sa place
   et fait une petite scène en haut de l'écran, puis revient. Fichier commun à la Jungle et à l'atelier. */
(()=>{
  const FIRST=5000,GAP_MIN=10000,GAP_MAX=20000,SPEED=220;
  const css=document.createElement('style');
  css.textContent=`
.bwalk{position:fixed;left:0;top:0;width:var(--bs);height:var(--bs);z-index:120;pointer-events:none;--bs:72px}
@media (max-width:600px){.bwalk{--bs:52px}}
.bwalk .bflip,.bwalk .bbody{width:100%;height:100%}
.bwalk .bbody{transform-origin:50% 90%}
.bwalk svg{width:100%;height:100%;overflow:visible}
.bwalk .bsay{position:absolute;left:50%;top:calc(100% + 4px);transform:translateX(-50%);white-space:nowrap;padding:4px 9px;border-radius:12px;background:#fffbea;color:#23272b;font:700 14px/1.2 sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.3);opacity:0;transition:opacity .2s}
.bwalk .bsay.show{opacity:1}
.bwalk .btok{position:absolute;left:50%;top:-30%;width:34%;height:42%;margin-left:-17%;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff6c2,#ffd23f 60%,#c99a12);box-shadow:0 2px 3px rgba(0,0,0,.35);display:grid;place-items:center;font:italic 700 calc(var(--bs)*.24)/1 Georgia,serif;color:#5a3a00}
.bwalk .bdust{position:absolute;bottom:4%;left:50%;width:8%;height:8%;border-radius:50%;background:#a07a4a}
.bwalk .bfly{position:absolute;width:12%;height:12%;border-radius:50%;background:#2b2b2b;box-shadow:-4px -3px 0 -1px rgba(220,240,255,.9),4px -3px 0 -1px rgba(220,240,255,.9)}
.bwalk .btongue{position:absolute;left:55%;top:52%;height:5%;width:0;border-radius:4px;background:#ff6f91;transform-origin:0 50%}
.bwalk .bspark{position:absolute;width:22%;height:22%}
#pet.bout{visibility:hidden}`;
  document.head.appendChild(css);

  const $=s=>document.querySelector(s);
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const charKey=()=>typeof CHARS!=='undefined'?(OPTS.char in CHARS?OPTS.char:'pepix'):'volt';
  const stage=()=>{try{return petStage()}catch(e){return 1}};
  const calm=()=>(typeof OPTS!=='undefined'&&OPTS.calm)||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shown=id=>{const e=document.getElementById(id);return e&&!e.classList.contains('hidden')};
  const busy=()=>document.hidden||calm()||(typeof SILENT!=='undefined'&&SILENT)||shown('modal')||/\bdrag/.test(document.body.className)||document.getElementById('parGhost');

  let timer=null,cur=null,lastEnd=0,gap=FIRST,lastScene='';
  function schedule(){clearTimeout(timer);const wait=Math.max(FIRST,lastEnd+gap-Date.now());timer=setTimeout(start,wait)}

  /* --- une balade en cours --- */
  class Walk{
    constructor(){
      this.dead=false;this.anims=[];this.k=charKey();this.st=stage();
      const w=document.createElement('div');w.className='bwalk';w.setAttribute('aria-hidden','true');
      w.innerHTML='<div class="bflip"><div class="bbody"></div></div><div class="bsay"></div>';
      document.body.appendChild(w);this.w=w;this.flip=w.firstChild;this.body=this.flip.firstChild;this.bub=w.lastChild;
      const pet=shown('game')&&$('#pet');const r=pet&&pet.getBoundingClientRect();
      if(r&&r.width)w.style.setProperty('--bs',Math.round(r.width)+'px');
      this.S=w.offsetWidth;this.minX=8;this.maxX=innerWidth-this.S-8;
      if(r&&r.width){this.home=Math.min(this.maxX,Math.max(this.minX,r.left+r.width/2-this.S/2));this.T=Math.max(4,r.top+r.height/2-this.S/2);this.pet=pet;pet.classList.add('bout')}
      else{this.home=innerWidth+10;this.T=6}
      this.x=this.home;this.y=0;this.place();this.mood('idle');
    }
    place(){this.w.style.transform=`translate(${this.x}px,${this.T+this.y}px)`}
    mood(m){this.body.innerHTML=creatureSVG(this.st,m)}
    check(){if(this.dead)throw 'stop'}
    async a(el,kf,o){this.check();const an=el.animate(kf,Object.assign({fill:'forwards'},o));this.anims.push(an);try{await an.finished}catch(e){}this.check();return an}
    async wait(ms){this.check();await new Promise(r=>setTimeout(r,ms));this.check()}
    say(t,ms=1600){this.bub.textContent=t;this.bub.classList.add('show');clearTimeout(this.sayT);this.sayT=setTimeout(()=>this.bub.classList.remove('show'),ms)}
    face(x){this.flip.style.transform=x<this.x?'scaleX(-1)':''}
    async go(x,speed=SPEED,gait='walk'){
      x=Math.round(x);const d=Math.abs(x-this.x);if(d<2)return;this.face(x);
      const ms=d/speed*1000,from=`translate(${this.x}px,${this.T+this.y}px)`,to=`translate(${x}px,${this.T+this.y}px)`;
      const step=gait==='run'?180:300,n=Math.max(1,Math.round(ms/step));
      const bob=this.body.animate(this.st===0?[{transform:'rotate(0)'},{transform:`rotate(${x<this.x?-360:360}deg)`}]
        :gait==='run'?[{transform:'rotate(-10deg) translateY(0)'},{transform:'rotate(-10deg) translateY(-8%)'},{transform:'rotate(-10deg) translateY(0)'}]
        :[{transform:'rotate(-7deg)'},{transform:'rotate(0) translateY(-6%)'},{transform:'rotate(7deg)'},{transform:'rotate(0) translateY(-6%)'},{transform:'rotate(-7deg)'}],
        {duration:this.st===0?ms:ms/n*2,iterations:this.st===0?1:Math.ceil(n/2)});
      this.anims.push(bob);
      await this.a(this.w,[{transform:from},{transform:to}],{duration:ms,easing:gait==='run'?'ease-in':'linear'});
      bob.cancel();this.x=x;this.place();
    }
    mid(){const r=Math.min(this.home,this.maxX);return Math.max(this.minX,rnd(r-420,r-140))}
    stop(){
      if(this.dead)return;this.dead=true;this.anims.forEach(a=>{try{a.cancel()}catch(e){}});clearTimeout(this.sayT);
      const w=this.w;w.style.transition='opacity .15s';w.style.opacity='0';setTimeout(()=>w.remove(),160);
      if(this.pet)this.pet.classList.remove('bout');
    }
  }

  /* --- les scènes --- */
  const SC={
    async promenade(b){
      const far=b.x>(b.minX+b.maxX)/2?b.minX+rnd(0,40):b.maxX-rnd(0,40);
      await b.go(far,280);await b.wait(300);b.say(pick(['Hop hop !','On se promène ?','Tranquille…']));await b.wait(600);
    },
    async saut(b){
      await b.go(b.mid());b.mood('happy');b.say(pick(['Youpi !','Hop là !','Wouhou !']));
      await b.a(b.body,[{transform:'translateY(0) rotate(0)'},{transform:'translateY(-45%) rotate(180deg)',offset:.5},{transform:'translateY(0) rotate(360deg)'}],{duration:800,easing:'ease-in-out'});
      await b.a(b.body,[{transform:'scale(1.12,.86)'},{transform:'scale(1)'}],{duration:220});await b.wait(400);b.mood('idle');
    },
    async sieste(b){
      await b.go(b.mid());b.mood('sleep');await b.wait(2600);
      b.mood('sad');b.say(pick(['Hein ?!','Quoi ? Qui ?','Je dormais pas !']));
      await b.a(b.body,[{transform:'translateY(0)'},{transform:'translateY(-30%)'},{transform:'translateY(0)'}],{duration:350,easing:'ease-out'});
      await b.wait(500);b.mood('idle');
    },
    async glissade(b){
      const left=b.x>(b.minX+b.maxX)/2,end=left?b.minX:b.maxX;
      await b.go(b.x+(left?40:-40),SPEED*.8);
      await b.go(end+(left?30:-30),SPEED*4,'run');
      b.say(pick(['Ouf !','Pile au bord !','Freinage !']));
      await b.a(b.body,[{transform:'rotate(0)'},{transform:`rotate(${left?-18:18}deg)`},{transform:`rotate(${left?8:-8}deg)`},{transform:'rotate(0)'}],{duration:600});
      await b.wait(400);
    },
    async coucou(b){
      const btns=[...document.querySelectorAll(shown('game')?'#game header .hbtn':'#homeBtns button,.hbtn')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.top<120&&r.left>b.minX&&r.right<innerWidth-8});
      const tx=btns.length?(r=>r.left+r.width/2-b.S/2)(pick(btns).getBoundingClientRect()):b.mid();
      await b.go(Math.min(b.maxX,Math.max(b.minX,tx)));
      await b.a(b.w,[{transform:`translate(${b.x}px,${b.T}px)`},{transform:`translate(${b.x}px,${-b.S*1.1}px)`}],{duration:300,easing:'ease-in'});
      await b.wait(900);b.mood('happy');
      await b.a(b.w,[{transform:`translate(${b.x}px,${-b.S*1.1}px)`},{transform:`translate(${b.x}px,${b.T-b.S*.35}px) rotate(-12deg)`}],{duration:280,easing:'ease-out'});
      b.say(pick(['Coucou !','Tu m’as vu ?','Bouh !']));await b.wait(1100);
      await b.a(b.w,[{transform:`translate(${b.x}px,${b.T-b.S*.35}px) rotate(-12deg)`},{transform:`translate(${b.x}px,${b.T}px)`}],{duration:300});
      b.place();b.mood('idle');
    },
    async jongle(b){
      await b.go(b.mid());const t=document.createElement('div');t.className='btok';t.textContent='x';b.w.appendChild(t);
      for(let i=0;i<3;i++){
        await b.a(t,[{transform:'translateY(0)'},{transform:'translateY(-110%)',easing:'ease-in'},{transform:'translateY(0)'}],{duration:520,easing:'ease-out'});
        b.body.animate([{transform:'scale(1,.9)'},{transform:'scale(1)'}],{duration:160});
      }
      b.mood('happy');b.say(pick(['Et hop !','Trois de suite !','x, toujours bien rangé !']));await b.wait(800);t.remove();b.mood('idle');
    },
    async propre(b){
      await b.go(b.mid());
      if(b.k==='buzix'){b.say('Ma queue !');await b.a(b.body,[{transform:'rotate(0)'},{transform:'rotate(720deg)'}],{duration:1300,easing:'ease-in-out'});b.mood('happy');await b.wait(500)}
      else if(b.k==='rainix'){
        const f=document.createElement('div');f.className='bfly';b.w.appendChild(f);
        await b.a(f,[{transform:'translate(180%,-60%)'},{transform:'translate(320%,-20%)'},{transform:'translate(240%,30%)'},{transform:'translate(420%,10%)'}],{duration:1400,easing:'ease-in-out'});
        b.face(b.x+1);const t=document.createElement('div');t.className='btongue';b.w.appendChild(t);
        await b.a(t,[{width:'0'},{width:'78%'}],{duration:140});f.remove();await b.a(t,[{width:'78%'},{width:'0'}],{duration:160});t.remove();
        b.mood('happy');b.say('Miam !');await b.wait(700);
      }
      else if(b.k==='volt'){
        const sp=[];for(let i=0;i<3;i++){const s=document.createElement('div');s.className='bspark';s.style.left=['-8%','80%','40%'][i];s.style.top=['10%','5%','-20%'][i];
          s.innerHTML='<svg viewBox="0 0 20 20"><path d="M11 1 4 11h5l-2 8 9-12h-6z" fill="#ffd23f" stroke="#b8860b" stroke-width="1.2"/></svg>';b.w.appendChild(s);sp.push(s)}
        b.mood('sad');b.say('Bzzt !');
        await b.a(b.body,[{transform:'translateX(0)'},{transform:'translateX(-5%)'},{transform:'translateX(5%)'},{transform:'translateX(-5%)'},{transform:'translateX(0)'}],{duration:500,iterations:2});
        sp.forEach(s=>s.remove());b.mood('happy');b.say('Court-circuit réparé !');await b.wait(900);
      }
      else{ // Pépix gratte le sol
        b.say('Grat grat…');
        for(let i=0;i<4;i++){const d=document.createElement('div');d.className='bdust';b.w.appendChild(d);
          d.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${rnd(-260,260)}%,${rnd(-200,-60)}%)`,opacity:0}],{duration:600,fill:'forwards'}).onfinish=()=>d.remove();
          await b.a(b.body,[{transform:'rotate(0)'},{transform:'rotate(-9deg)'},{transform:'rotate(9deg)'},{transform:'rotate(0)'}],{duration:260})}
        b.mood('happy');b.say('Trouvé un ver !');await b.wait(800);
      }
      b.mood('idle');
    }
  };

  async function start(force){
    if(cur)return;if(!force&&busy())return schedule();
    let names=Object.keys(SC);if(stage()===0)names=['promenade','saut','glissade'];
    names=names.filter(n=>n!==lastScene);const name=force||pick(names);lastScene=name;
    const b=cur=new Walk();
    try{
      if(b.home>innerWidth){await b.go(b.maxX-rnd(0,40))}
      await SC[name](b);
      await b.go(b.home);
    }catch(e){}
    if(cur===b){b.stop();cur=null}
    lastEnd=Date.now();gap=rnd(GAP_MIN,GAP_MAX);schedule();
  }
  function poke(){if(cur){cur.stop();cur=null;lastEnd=Date.now();gap=rnd(GAP_MIN,GAP_MAX)}schedule()}
  ['pointerdown','keydown','wheel','touchstart'].forEach(ev=>addEventListener(ev,poke,{capture:true,passive:true}));
  addEventListener('resize',poke);
  document.addEventListener('visibilitychange',poke);
  schedule();
  window.BALADE={jouer:n=>SC[n]&&!cur&&start(n)}; // pour tester une scène depuis la console
})();
