const LANGUAGES = {
  'fr': 'french.txt',
  'en': 'english.txt',
};
const DEFAULT_LANG = 'en';
let _translations = {};
async function initI18n() {
  const browser = (navigator.language || DEFAULT_LANG).split('-')[0];
  const lang = LANGUAGES[browser] ? browser : DEFAULT_LANG;
  try {
    const r = await fetch(LANGUAGES[lang]);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    _translations = await r.json();
  } catch(e) {
    console.warn('[i18n] Impossible de charger', LANGUAGES[lang], ':', e.message);
    _translations = {};
  }
}
const T = (k) => _translations[k] || k;
const esc = (s) => (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const PREF="mgo_unified_version"; let LITE_MODE=document.documentElement.classList.contains("lite-mode"),__hlk=false;
const D=document,E=i=>D.getElementById(i),Q=s=>D.querySelectorAll(s),C=t=>D.createElement(t),LS=localStorage;
function tr(){Q("[data-i18n]").forEach(e=>{const k=e.dataset.i18n;k==="add_upper"?e.innerHTML=T(k):e.textContent=T(k)});}
const Rnd=(s)=>function(){var t=s+=1831565813;return t=Math.imul(t^t>>>15,1|t),(((t^=t+Math.imul(t^t>>>7,61|t))^t>>>14)>>>0)/4294967296};
function __playShineySplash(isFast = false) {
  document.documentElement.classList.add('is-shiney');
  const spt = Q(".sp-title")[0], sph = Q(".sp-hint")[0];
  setTimeout(() => {
      if(spt) { spt.style.transition = "opacity 0.25s ease"; spt.style.opacity = "0"; }
      if(sph) { sph.style.transition = "opacity 0.25s ease"; sph.style.opacity = "0"; }
      setTimeout(() => {
          if(spt) { spt.innerHTML = "Saison <em>Spéciale</em><span>☆</span>"; spt.style.opacity = "1"; }
          if(sph) { sph.textContent = "Bonne Chance !"; sph.style.opacity = "1"; }
      }, 250);
  }, isFast ? 150 : 600);
}
D.addEventListener("DOMContentLoaded", async ()=>{
  await initI18n();
  State.init();
  if(!LS.getItem(PREF)){
    E("__hub").style.display="flex";tr();
    E("__hub-sub").textContent=T("sub");E("__hub-lbl-full").textContent=T("full");E("__hub-desc-full").textContent=T("fullDesc");
    E("__hub-lbl-lite").textContent=T("lite");E("__hub-desc-lite").textContent=T("liteDesc");
  } else {
    __initApp();
  }
});
function __pickVersion(v,btn){
  if(__hlk)return; __hlk=true; Q(".hub-btn").forEach(b=>{b.style.pointerEvents="none";b.style.opacity=".5"});
  LITE_MODE=(v==="lite"); LS.setItem(PREF,v);
  D.documentElement.className=LITE_MODE?"lite-mode":"full-mode";
  const hub=E("__hub"), card=E("__hub-card"), splash=E("splash");
  if(btn){
    const r=btn.getBoundingClientRect(), vw=window.innerWidth, vh=window.innerHeight;
    const cx=r.left+r.width/2, cy=r.top+r.height/2;
    const scale=Math.ceil(Math.max(2*Math.max(cx,vw-cx)/r.width, 2*Math.max(cy,vh-cy)/r.height))+2;
    const bg=v==="full"?'linear-gradient(135deg,#4f52d3,#6366f1)':'linear-gradient(135deg,#831843,#be185d)';
    const el=C("div");
    el.style.cssText=`position:fixed;top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px;border-radius:16px;z-index:19999;pointer-events:none;background:${bg};transform-origin:center center;will-change:transform;transition:none`;
    D.body.appendChild(el);
    card.style.transition="opacity 0.3s ease"; card.style.opacity="0";
    requestAnimationFrame(()=>{
      el.style.transition="transform 0.55s cubic-bezier(0.4,0,0.2,1),border-radius 0.55s ease";
      el.style.transform=`scale(${scale})`; el.style.borderRadius="0";
      setTimeout(()=>{
        splash.style.cssText="opacity:0;z-index:10000;display:flex;transition:none";
        requestAnimationFrame(()=>{
          splash.style.transition="opacity 0.45s ease";
          splash.style.opacity="1";
          if (Rnd(State.cfg.seed)()<0.01) __playShineySplash();
        });
      },350);
      setTimeout(()=>{el.style.transition="opacity 0.4s ease";el.style.opacity="0"},400);
      setTimeout(()=>{el.remove();hub.style.display="none";splash.style.zIndex="";splash.style.transition="";__initApp(true)},820);
    });
  } else {
    hub.style.display="none"; __initApp();
  }
}
const State={
  cfg:{albums:24,mode:"cross",gold_ids:[],gold_ex:[],hidden:[],printHidden:[],setup_done:!1,ambiance:0,seed:Date.now(),usersList:[]},usr:{},_dC:null,_gC:null,
  getG(){return this._gC||(this._gC=new Set(this.cfg.gold_ids)),this._gC},
  getD(){if(this._dC)return this._dC;const e=new Set;return Object.values(this.usr).forEach(t=>{t&&t.state&&Object.entries(t.state).forEach(([t,s])=>{2===s&&e.add(+t)})}),this._dC=e,e},
  init(){
    try{const c=JSON.parse(LS.getItem("mgo_cfg"));if(c)this.cfg={...this.cfg,...c},this.cfg.seed||(this.cfg.seed=Date.now())}catch(e){}
    if(!this.cfg.usersList.length)this.cfg.usersList=[`${T('player')} 1`];
    this.cfg.usersList.forEach(u=>{const id=u.replace(/\s/g,"");try{this.usr[id]={state:{},nums:{},...JSON.parse(LS.getItem("mgo_u_"+id))}}catch(e){this.usr[id]={state:{},nums:{}}}});
  },
  saveC(){LS.setItem("mgo_cfg",JSON.stringify(this.cfg))},saveU(u){if(this.usr[u])LS.setItem("mgo_u_"+u,JSON.stringify(this.usr[u]))},
  setG(id,v){const s=new Set(this.cfg.gold_ids);v?s.add(id):s.delete(id);this.cfg.gold_ids=Array.from(s);this._gC=null;this.saveC()},
  updC(u,c,v,n=false){if(!this.usr[u])return;if(n){if(v)this.usr[u].nums[c]=v;else delete this.usr[u].nums[c]}else{const old=this.usr[u].state[c];if(v===0)delete this.usr[u].state[c];else this.usr[u].state[c]=v;if(old===2||v===2)this._dC=null;}clearTimeout(this._st);this._st=setTimeout(()=>this.saveU(u),300)},
};
window.UserManager={
  tu:[],_ni:new Set(),_ds:null,_ts:null,_tc:null,
  open(){
    this.tu=[...State.cfg.usersList];
    E("pv-view-head").style.display="none";
    E("view-list").style.display="none";
    E("pv-edit-head").style.display="block";
    E("users-edit-list").style.display="flex";
    E("pop-view").style.width="320px";
    E("pop-view").classList.add("show");
    this.render();
  },
  close(){
    this._ni.clear();
    E("pv-view-head").style.display="block";
    E("view-list").style.display="block";
    E("pv-edit-head").style.display="none";
    E("users-edit-list").style.display="none";
    E("pop-view").style.width="280px";
  },
  render(){const c=E("users-edit-list");c.innerHTML="";this.tu.forEach((u,i)=>{const r=C("div");r.className="um-row"+(this._ni.has(i)?" um-new":"");r.draggable=!0;r.dataset.idx=i;r.innerHTML=`<span class="um-handle">⠿</span><input type="text" class="um-input um-inp" value="${esc(u)}" data-idx="${i}"><button class="mini-btn danger um-del" data-idx="${i}" ${this.tu.length<=1?"disabled":""}>✕</button>`;r.addEventListener("dragstart",e=>{this._ds=r;e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",i);setTimeout(()=>r.classList.add("um-dragging"),0)});r.addEventListener("dragover",e=>{e.preventDefault();if(r!==this._ds){Q(".um-row").forEach(el=>el.classList.remove("um-drag-over"));r.classList.add("um-drag-over")}});r.addEventListener("drop",e=>{e.preventDefault();if(r!==this._ds){const to=i,from=+this._ds.dataset.idx;const item=this.tu.splice(from,1)[0];this.tu.splice(to,0,item);this.render()}});r.addEventListener("dragend",()=>{Q(".um-row").forEach(el=>el.classList.remove("um-dragging","um-drag-over"));this._ds=null});const h=r.querySelector(".um-handle");h.addEventListener("touchstart",e=>{e.preventDefault();this._ts=r;const cl=r.cloneNode(!0);cl.classList.add("um-touch-clone");cl.style.top=r.getBoundingClientRect().top+"px";D.body.appendChild(cl);this._tc=cl;r.classList.add("um-dragging")},{passive:!1});h.addEventListener("touchmove",e=>{if(!this._tc)return;e.preventDefault();const y=e.touches[0].clientY;this._tc.style.top=y-22+"px";const over=D.elementsFromPoint(e.touches[0].clientX,y).find(el=>el.classList.contains("um-row")&&el!==this._ts);Q(".um-row").forEach(el=>el.classList.remove("um-drag-over"));if(over)over.classList.add("um-drag-over")},{passive:!1});h.addEventListener("touchend",e=>{if(!this._tc)return;const over=D.elementsFromPoint(e.changedTouches[0].clientX,e.changedTouches[0].clientY).find(el=>el.classList.contains("um-row")&&el!==this._ts);this._tc.remove();this._tc=null;if(over){const to=+over.dataset.idx,item=this.tu.splice(+this._ts.dataset.idx,1)[0];this.tu.splice(to,0,item)}this.render();this._ts=null},{passive:!1});r.querySelector(".um-inp").onchange=e=>this.tu[+e.target.dataset.idx]=e.target.value.trim()||`${T('player')} ${i+1}`;r.querySelector(".um-del").onclick=e=>{if(this.tu.length>1){this.tu.splice(+e.target.dataset.idx,1);this.render()}};c.appendChild(r)})},
  add(){const i=this.tu.length;this.tu.push(`${T('player')} ${i+1}`);this._ni.add(i);this.render();requestAnimationFrame(()=>{const ul=E("users-edit-list");ul.scrollTop=ul.scrollHeight;const rs=Q('.um-row');if(rs[i]){rs[i].classList.add('um-flashing');setTimeout(()=>{rs[i].classList.remove('um-flashing');rs[i].classList.add('um-new')},950)}})},
  save(){
    this._ni.clear();const o=State.cfg.usersList.slice();this.tu.forEach((n,i)=>{const old=o[i];if(!old)return;const ok=old.replace(/\s/g,""),nk=n.replace(/\s/g,"");if(ok!==nk&&State.usr[ok]){State.usr[nk]=State.usr[ok];delete State.usr[ok];try{LS.removeItem("mgo_u_"+ok)}catch(e){}State.saveU(nk)}});const of1=o[0]?o[0].replace(/\s/g,""):null,nf1=this.tu[0]?this.tu[0].replace(/\s/g,""):null;if(of1&&nf1&&of1!==nf1&&State.usr[of1]){State.usr[of1].nums={};State.saveU(of1)}this.tu.forEach(u=>{const id=u.replace(/\s/g,"");if(!State.usr[id])State.usr[id]={state:{},nums:{}}});State.cfg.usersList=[...this.tu];State.saveC();
    if(E("setup-mod").classList.contains("open")){E("pop-view").classList.remove("show");setTimeout(()=>this.close(),250);}else{this.close();}
    UI.mns();UI.renderMain();UI.toast(T("players_updated"));
  }
};
let _pxApp=null;
const UI={
  toast(m){const t=E("toast");t.textContent=m;t.classList.add("show");clearTimeout(this._tt);this._tt=setTimeout(()=>t.classList.remove("show"),3500)},
  amb(){
    if(LITE_MODE)return;const bg=E("ambient-bg");if(!bg)return;
    if(_pxApp){_pxApp();_pxApp=null;}bg.innerHTML="";bg.style.background="";const m=State.cfg.ambiance||0,c=["79,70,229","192,38,211","6,182,212","244,114,182","251,191,36"],r=Rnd(State.cfg.seed);
    if(m===0||m===1||m===3){
      if(typeof PIXI==='undefined'){
        if(!window._pxErr){UI.toast("⚠️ Unable to load ambiance (connection issue)");window._pxErr=!0}
        bg.style.backgroundImage="var(--lite-bg)";return;
      }
      const a=new PIXI.Application({resizeTo:bg,backgroundAlpha:0,antialias:m===1,resolution:1,autoDensity:!0});a.view.style.cssText="position:absolute;inset:0;width:100%;height:100%;pointer-events:none";bg.appendChild(a.view);
      const o=[];
      if(m===0){for(let i=0;i<7;i++){const sz=45+40*r(),rgb=c[~~(r()*c.length)],sx=(90*r()-5)/100,sy=(90*r()-5)/100,tx=(18*r()-9)/100,ty=(18*r()-9)/100,d=(18+16*r())*1e3,ph=r()*Math.PI*2,ts=256,oc=C('canvas');oc.width=oc.height=ts;const cx=oc.getContext('2d'),grd=cx.createRadialGradient(128,128,0,128,128,128);grd.addColorStop(0,`rgba(${rgb},1)`);grd.addColorStop(.68,`rgba(${rgb},.15)`);grd.addColorStop(1,`rgba(${rgb},0)`);cx.fillStyle=grd;cx.fillRect(0,0,ts,ts);const spr=new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(oc)));spr.anchor.set(.5);spr.alpha=.55;a.stage.addChild(spr);o.push({spr,sx,sy,tx,ty,d,ph,sz})}}
      else if(m===1){const grads=[["#3b41d8","#6468f5"],["#c77b10","#f0aa22"],["#b8223b","#eb3a5f"],["#0e766e","#14b8a6"],["#7c3aed","#a855f7"]];for(let i=0;i<5;i++){const gc=grads[~~(r()*grads.length)],TW=256,TH=358,oc=C("canvas");oc.width=TW;oc.height=TH;const cx=oc.getContext("2d");cx.beginPath();cx.roundRect(0,0,TW,TH,16);cx.clip();const grd=cx.createLinearGradient(0,0,TW,TH);grd.addColorStop(0,gc[0]);grd.addColorStop(1,gc[1]);cx.fillStyle=grd;cx.fillRect(0,0,TW,TH);cx.strokeStyle="rgba(255,255,255,0.18)";cx.lineWidth=2;cx.stroke();const spr=new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(oc)));spr.anchor.set(.5);spr.alpha=.45;a.stage.addChild(spr);const sz=(30+25*r())/100*window.innerWidth;spr.width=sz;spr.height=sz*1.4;o.push({spr,sx:(85*r()-10)/100,sy:(85*r()-10)/100,tx:(20*r()-10)/100,ty:(20*r()-10)/100,r0:(40*r()-20)*Math.PI/180,r1:(40*r()-20)*Math.PI/180,d:(20+15*r())*1e3,ph:r()*Math.PI*2});}}
      if(m===0||m===1){a.ticker.add(()=>{const n=performance.now(),W=a.screen.width,H=a.screen.height;for(const b of o){const p=(Math.sin(n/b.d*Math.PI*2+b.ph)+1)/2;b.spr.x=b.sx*W+b.tx*W*p;b.spr.y=b.sy*H+b.ty*H*p;if(b.sz)b.spr.width=b.spr.height=b.sz/100*W;if(b.r1!==undefined)b.spr.rotation=b.r0+(b.r1-b.r0)*p;}});}
      else if(m===3){const lw=C("div");lw.style.cssText="position:absolute;inset:0;background:#020204;";bg.appendChild(lw);lw.appendChild(a.view);const goo=new PIXI.Container(),blur=new PIXI.BlurFilter(14,4);blur.padding=60;const thresh=new PIXI.Filter(null,"varying vec2 vTextureCoord;uniform sampler2D uSampler;void main(){vec4 c=texture2D(uSampler,vTextureCoord);vec3 rgb=(c.a>0.001)?c.rgb/c.a:vec3(0.0);float a=clamp(c.a*22.0-9.0,0.0,1.0);gl_FragColor=vec4(rgb*a,a);}");thresh.padding=60;goo.filters=[blur,thresh];a.stage.addChild(goo);const gfx=new PIXI.Graphics();goo.addChild(gfx);const P=2+~~(2*r()),D=[...c].sort(()=>r()-.5),pal=D.slice(0,P).map(x=>{const p=x.split(',');return (p[0]<<16)|(p[1]<<8)|p[2]}),blobs=[];for(let i=0;i<10;i++){const ny=r();blobs.push({x:r()*(a.screen.width||window.innerWidth),y:ny*(a.screen.height||window.innerHeight),vx:0,vy:0,r:35+55*r(),baseR:35+55*r(),col:pal[~~(r()*pal.length)],ph:r()*Math.PI*2,fq:.08+.12*r(),df:.06*(r()-.5),tp:1-ny,ti:.12+.18*r()})}let lt=0;a.ticker.add(()=>{const n=performance.now();const ds=Math.min((n-lt)/1e3,.05);if(!lt){lt=n;return}lt=n;const W=a.screen.width,H=a.screen.height;for(let i=0;i<10;i++){const b=blobs[i];b.tp+=(b.y/H-b.tp)*b.ti*ds;b.vy-=(b.tp-.42)*6.5*ds;b.ph+=b.fq*ds;b.vx+=Math.sin(b.ph+1.7*i)*ds+b.df*ds*3;for(let j=i+1;j<10;j++){const b2=blobs[j],dx=b2.x-b.x,dy=b2.y-b.y,d=Math.sqrt(dx*dx+dy*dy)+1,mn=.35*(b.r+b2.r);if(d<mn){const f=.08*(mn-d)*ds,nx=dx/d,ny=dy/d;b.vx-=nx*f;b.vy-=ny*f;b2.vx+=nx*f;b2.vy+=ny*f}}b.vx*=.994;b.vy*=.994;b.x+=b.vx;b.y+=b.vy;const pd=.3*b.r;if(b.x<-pd||b.x>W+pd){b.vx=Math.abs(b.vx)*.3*(b.x<-pd?1:-1);b.x=b.x<-pd?-pd:W+pd}if(b.y<-pd||b.y>H+pd){b.vy=Math.abs(b.vy)*.3*(b.y<-pd?1:-1);b.y=b.y<-pd?-pd:H+pd}b.r=b.baseR+Math.sin(6e-4*n+2.1*i)*b.baseR*.06}gfx.clear();for(let i=0;i<10;i++){gfx.beginFill(blobs[i].col,.92);gfx.drawCircle(blobs[i].x,blobs[i].y,blobs[i].r*1.8);gfx.endFill();}});}
      _pxApp=()=>a.destroy(!0,{children:!0,texture:!0,baseTexture:!0})
    }else if(m===2){for(let i=0;i<6;i++){const d=C("div");d.className="f-obj f-neon";const sz=8+18*r(),M=`rgb(${c[~~(r()*c.length)]})`,k=r()>.5?45:30*r()-15;d.style.cssText=`width:${sz}vw;height:${r()>.5?sz:sz*(.5+.8*r())}vw;top:${88*r()}%;left:${88*r()}%;border-color:${M};box-shadow:0 0 6px ${M}`;d.style.setProperty("--glow",M);d.style.setProperty("--d",14+18*r()+"s");d.style.setProperty("--pd",2.5+2*r()+"s");d.style.setProperty("--tx",26*r()-13+"vw");d.style.setProperty("--ty",26*r()-13+"vh");d.style.setProperty("--r0",k+"deg");d.style.setProperty("--r1",k+60*r()-30+"deg");bg.appendChild(d)}}
    else{
      bg.style.backgroundImage="radial-gradient(circle at 20% 25%,rgba(99,102,241,.28) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(244,114,182,.22) 0%,transparent 48%)";
      bg.innerHTML=`
      <div class="hub-orb" style="width:38vw;height:38vw;top:-8%;left:-10%;background:radial-gradient(circle,rgba(99,102,241,.25) 0%,transparent 70%);--d:20s;--tx:6vw;--ty:8vh"></div>
      <div class="hub-orb" style="width:30vw;height:30vw;top:55%;right:-8%;background:radial-gradient(circle,rgba(244,114,182,.2) 0%,transparent 70%);--d:16s;--tx:-8vw;--ty:-6vh"></div>
      <div class="hub-orb" style="width:22vw;height:22vw;bottom:-5%;left:30%;background:radial-gradient(circle,rgba(251,191,36,.22) 0%,transparent 70%);--d:24s;--tx:5vw;--ty:-5vh"></div>
      <div class="hub-orb" style="width:18vw;height:18vw;top:20%;right:5%;background:radial-gradient(circle,rgba(99,102,241,.15) 0%,transparent 70%);--d:14s;--tx:-4vw;--ty:7vh"></div>
      <div class="shiny-screen"><div class="shiny-deck"><div class="shiny-c shiny-c1"></div><div class="shiny-c shiny-c2">★</div><div class="shiny-c shiny-c3"></div></div><div class="shiny-logo">MGO <em>Tracker</em><span>.</span></div></div>`;
    }
  },
  ambSel(){const c=E("amb-sel");if(!c)return;c.innerHTML="";const I=["<span style='display:inline-block;width:10px;height:10px;background:#fff;border-radius:50%'></span>","<span style='display:inline-block;width:14px;height:9px;background:#fff;border-radius:3px'></span>","<span style='display:inline-block;width:10px;height:10px;border:2.5px solid #fff;border-radius:1px;box-sizing:border-box'></span>","<span style='display:grid;grid-template-columns:1fr 1fr;gap:2px;width:10px;height:10px'><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span></span>","<span style='font-size:0.85em;line-height:1'>✨</span>"],L=[T("amb_0"),T("amb_1"),T("amb_2"),T("amb_3"),T("amb_4")],cnt=Rnd(State.cfg.seed)()<0.01?5:4;for(let i=0;i<cnt;i++){const b=C("button");b.style.cssText=`width:32px;height:28px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:0.2s;border:2px solid ${State.cfg.ambiance===i?'var(--p)':'rgba(255,255,255,0.15)'};background:${State.cfg.ambiance===i?'rgba(99,102,241,0.2)':'rgba(0,0,0,0.3)'};box-shadow:${State.cfg.ambiance===i?'0 0 8px rgba(99,102,241,0.4)':'none'}`;b.innerHTML=I[i];b.title=L[i];b.onclick=()=>{if(State.cfg.ambiance!==i){State.cfg.ambiance=i;State.saveC();const bg=E("ambient-bg");if(bg){bg.style.opacity="0";setTimeout(()=>{this.amb();requestAnimationFrame(()=>requestAnimationFrame(()=>bg.style.opacity="1"))},450)}this.ambSel();this.toast(L[i])}};c.appendChild(b)}},
  renderMain(){const a=E("gen-cards");a.innerHTML="";const alb=State.cfg.albums,hlf=Math.ceil(alb/2),w=100/hlf;State.cfg.usersList.forEach((n,i)=>{const uid=n.replace(/\s/g,""),isp=i===0;a.insertAdjacentHTML("beforeend",`<div class="glass-card anim-section ${isp?"is-primary":""} ${isp&&State.cfg.mode==='number'?"mode-num":""}" data-sec="${esc(uid)}"><div class="card-header"><div class="user-info"><div class="user-avatar"><div class="ua-inner"><div class="ua-left"><div class="ua-name">${esc(n)}</div><div class="ua-percent">0%</div></div><div class="ua-stats-col"><div class="ua-top"></div><div class="ua-bot"></div></div></div></div><div class="user-name">${esc(n)}</div>${isp?`<button class="mini-btn" data-action="mode-toggle" style="margin-right:8px;height:24px">${State.cfg.mode==='number'?'123':'XXX'}</button><input type="text" class="user-note" placeholder="${T('note_ph')}" value="${esc(State.usr[uid]?.note||"")}" data-uid="${esc(uid)}" onclick="event.stopPropagation()" ondblclick="event.stopPropagation()">`:''}</div><div class="card-tools"><button class="mini-btn danger reset-u-btn" data-action="reset-u">↺</button></div><div class="expand-hint">⇕ Double-tap pour agrandir ⇕</div></div><div style="padding:0" data-u="${esc(uid)}"><div class="grid-scroll"><div class="track-row">${this._gr(1,hlf,w)}</div><div class="track-row">${this._gr(hlf+1,alb-hlf,w)}</div></div><div class="legend-bar"><div class="legend-item"><div class="legend-swatch s-have"></div>Obtenue</div><div class="legend-item"><div class="legend-swatch s-dupe"></div>Doublon</div><div class="legend-item"><div class="legend-swatch s-gold-dot"></div>Carte dorée</div></div></div></div>`)});this.hyd()},
  _gr(s,c,w){let h="";for(let i=0;i<c;i++){let g="";for(let k=0;k<9;k++)g+=`<div class="cell-wrap" data-uid="${9*(s+i-1)+k}" data-st="0"><div class="i-dot i-dupe"></div><div class="i-dot i-gold"></div><div class="cell-inner"><span class="t-x">X</span><span class="t-num"></span></div></div>`;h+=`<div class="alb-col" style="width:${w}%"><div class="alb-head">${T('album')} ${s+i}</div><div class="alb-grid">${g}</div></div>`}return h},
  hyd(){const g=State.getG(),d=State.getD();Q(".cell-wrap").forEach(c=>{const id=+c.dataset.uid,u=c.closest("[data-u]")?.dataset.u;if(!u||!State.usr[u])return;const st=State.usr[u].state?.[id]||0,nm=State.usr[u].nums?.[id]||"";this.uCV(c,st,nm,g.has(id),d.has(id))});this.uS();this.uV()},
  uSC(u,c,val){const isG=State.getG().has(+c),st=State.usr[u]?.state?.[c]||0,nm=State.usr[u]?.nums?.[c]||"";if(val===2||st===2){const isD=State.getD().has(+c);Q(`.cell-wrap[data-uid="${c}"]`).forEach(el=>{const uid=el.closest("[data-u]")?.dataset.u;if(uid)this.uCV(el,State.usr[uid]?.state?.[c]||0,State.usr[uid]?.nums?.[c]||"",isG,isD)})}else{const el=D.querySelector(`.glass-card[data-sec="${u}"] [data-u="${u}"] .cell-wrap[data-uid="${c}"]`);if(el)this.uCV(el,st,nm,isG,State.getD().has(+c))}this.uS()},
  uCV(c,st,nm,isG,isD){c.dataset.st=st;const ns=c.querySelector(".t-num");if(ns.textContent!==nm+"")ns.textContent=nm+"";isG?c.dataset.bg="1":delete c.dataset.bg;c.classList.remove("show-gold","show-dupe");if(st===0){if(isG)c.classList.add("show-gold");if(isD)c.classList.add("show-dupe")}},
  uS(){const tot=State.cfg.albums*9,gSet=State.getG();Q(".glass-card[data-sec]:not(#sec-gold)").forEach(c=>{const u=State.usr[c.dataset.sec];if(!u||!u.state)return;let n=0,g=0,gt=0;for(let i=0;i<tot;i++){if(u.state[i]>0)n++;if(gSet.has(i)){gt++;if(u.state[i]>0)g++}}const pct=tot>0?Math.round(n/tot*100):0,tp=c.querySelector(".ua-top"),bt=c.querySelector(".ua-bot"),pc=c.querySelector(".ua-percent"),av=c.querySelector(".user-avatar");if(tp)tp.textContent=`${n}/${tot}`;if(bt)bt.textContent=`${g}/${gt}`;if(pc){pc.textContent=pct+"%";pc.style.color=pct===100?'var(--gold)':pct>=50?'#fb923c':'#f87171'}if(av)av.style.background=`conic-gradient(var(--ok) ${pct}%, var(--p) 0)`})},
  uV(){Q(".anim-section").forEach(e=>e.classList.toggle("hidden",State.cfg.hidden.includes(e.dataset.sec)))},
  gEx(){const c=E("gold-list");c.innerHTML="";if(State.cfg.gold_ex.length>0)c.insertAdjacentHTML("beforeend",`<div class="gold-row-header"><span>${esc(T('album'))}</span><span>${esc(T('card'))}</span><span>${esc(T('date'))}</span><span></span></div>`);State.cfg.gold_ex.forEach((item,idx)=>{const r=C("div");r.className="gold-row";r.innerHTML=`<input class="g-inp" data-f="alb" maxlength="2" inputmode="numeric" placeholder="--" value="${esc(item.alb||item.album||"")}"><input class="g-inp" data-f="card" placeholder="${esc(T('card'))}" value="${esc(item.card||"")}"><input class="g-inp" data-f="date" maxlength="5" inputmode="numeric" placeholder="JJ/MM" value="${esc(item.date||"")}"><button style="background:0 0;border:none;color:var(--err);font-weight:700;cursor:pointer" data-action="del-gold" data-idx="${idx}">✕</button>`;const a=r.querySelector('[data-f="alb"]'),cd=r.querySelector('[data-f="card"]'),d=r.querySelector('[data-f="date"]');a.oninput=()=>{a.value=a.value.replace(/\D/g,"").slice(0,2);State.cfg.gold_ex[idx].alb=a.value;State.saveC()};cd.oninput=()=>{State.cfg.gold_ex[idx].card=cd.value;State.saveC()};d.onkeydown=(e)=>{if(e.key==="Backspace"&&d.value.endsWith("/"))d.value=d.value.slice(0,-1)};d.oninput=()=>{let raw=d.value.replace(/\D/g,"");if(raw.length>4)raw=raw.slice(0,4);d.value=raw.length>2?raw.slice(0,2)+"/"+raw.slice(2):raw;State.cfg.gold_ex[idx].date=d.value;State.saveC()};c.appendChild(r)})},
  mns(){
    const v=E("view-list"),p=E("sub-print");
    v.innerHTML="";p.innerHTML="";
    [...State.cfg.usersList,"Gold"].forEach(s=>{
      const id=s==="Gold"?"Gold":s.replace(/\s/g,""),h=State.cfg.hidden.includes(id);
      const shareBtn = s!=="Gold"?`<button class="mini-btn" style="padding:4px 8px;margin-right:10px;font-size:0.8rem;background:rgba(99,102,241,0.15);border-color:var(--p);color:#fff" onclick="Share.quick('${esc(s)}','${esc(id)}',this)">🔗</button>`: ``;
      v.insertAdjacentHTML("beforeend",`<div class="menu-item" style="padding:8px 12px">
        <div style="display:flex;align-items:center">${shareBtn}<span>${esc(s)}</span></div>
        <label style="cursor:pointer;display:flex">
          <input type="checkbox" ${h?"":"checked"} style="display:none" onchange="const i='${esc(id)}';State.cfg.hidden=this.checked?State.cfg.hidden.filter(x=>x!==i):[...State.cfg.hidden,i];State.saveC();UI.uV()">
          <div class="switch"></div>
        </label>
      </div>`);
      p.insertAdjacentHTML("beforeend",`<div class="menu-item" style="padding:5px 8px;font-size:0.8rem"><span>${esc(s)}</span><label style="cursor:pointer;display:flex;align-items:center"><input type="checkbox" class="print-chk" value="${esc(id)}" checked style="display:none"><div class="switch" style="transform:scale(0.7);transform-origin:right center"></div></label></div>`)
    });
    p.insertAdjacentHTML("beforeend",`<button class="mini-btn" data-action="do-print" style="justify-content:center;background:var(--p);color:#fff;margin-top:5px;width:100%">${T('print_upper')}</button>`)
  },
  gGrid(id){const c=E(id);if(!c)return;c.innerHTML="";const r=C("div");r.className="g-conf-row";const gS=State.getG();for(let i=1;i<=State.cfg.albums;i++){let cl="";for(let k=0;k<9;k++){const u=9*(i-1)+k;cl+=`<div class="g-cell ${gS.has(u)?"active":""}" data-uid="${u}"></div>`}r.insertAdjacentHTML("beforeend",`<div class="g-conf-col"><span style="font-size:9px;font-weight:700;margin-bottom:2px">${T('album')} ${i}</span><div class="g-conf-grid">${cl}</div></div>`)}r.onclick=e=>{if(e.target.classList.contains("g-cell")){const uid=+e.target.dataset.uid,a=e.target.classList.contains("active");State.setG(uid,!a);e.target.classList.toggle("active")}};c.appendChild(r)}
};
const Share={
  _pi:null,_rt:null,_qt:null,
  async quick(n,id,btn){
    btn.style.pointerEvents="none";
    const s=JSON.stringify({name:n,data:State.usr[id]||{state:{},nums:{}}});
    let l;
    try{const enc=new TextEncoder().encode(s),cs=new CompressionStream("gzip"),w=cs.writable.getWriter();w.write(enc);w.close();const buf=await new Response(cs.readable).arrayBuffer();let str="";new Uint8Array(buf).forEach(c=>str+=String.fromCharCode(c));l="z:"+btoa(str)}catch(e){l=btoa(unescape(encodeURIComponent(s)))}
    const url="https://kevinr99089.github.io/Mgo-Tracker/?share="+encodeURIComponent(l);
    const scc=()=>{UI.toast(T("share_copied"));const old=btn.innerHTML;btn.innerHTML="✅";btn.style.background="var(--ok)";btn.style.borderColor="var(--ok)";setTimeout(()=>{btn.innerHTML=old;btn.style.background="rgba(99,102,241,0.15)";btn.style.borderColor="var(--p)";btn.style.pointerEvents="auto"},2000)};
    const fb=()=>{const t=C("textarea");t.value=url;t.style.position="fixed";t.style.opacity="0";D.body.appendChild(t);t.focus();t.select();try{if(D.execCommand("copy"))scc();else throw new Error()}catch(e){prompt("Lien de partage :",url);btn.style.pointerEvents="auto"}t.remove()};
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(url).then(scc).catch(fb)}else{fb()}
  },
  async chk(){const p=new URLSearchParams(location.search);let raw=p.get('share');if(!raw&&location.hash.startsWith("#share:"))raw=location.hash.slice(7);if(!raw)return;try{let dec;if(raw.startsWith("z:")){const b=atob(raw.slice(2)),ar=Uint8Array.from(b,c=>c.charCodeAt(0)),ds=new DecompressionStream("gzip"),w=ds.writable.getWriter();w.write(ar);w.close();dec=new TextDecoder().decode(await new Response(ds.readable).arrayBuffer())}else dec=decodeURIComponent(escape(atob(raw)));const o=JSON.parse(dec);if(o.name&&o.data)this._pi=o}catch(e){console.error(e);this.cln()}},
  show(){const s=this._pi;if(!s)return;E("import-name").textContent="👤 "+s.name;const c=Object.values(s.data.state||{}).filter(x=>x===1).length,d=Object.values(s.data.state||{}).filter(x=>x===2).length;E("import-stats").textContent=`${c} carte(s) cochée(s) · ${d} doublon(s)`;const match=State.cfg.usersList.includes(s.name);let mem={};try{mem=JSON.parse(LS.getItem("mgo_share_mem")||"{}")}catch(e){}const rem=mem[s.name],valid=rem&&State.cfg.usersList.includes(rem);const bc=E("btn-import-confirm"),br=E("btn-import-replace"),bq=E("btn-import-quick");if(match){bc.textContent="✅ Mettre à jour ("+s.name+")";br.style.display="none";bq.style.display="none";this._qt=null}else{bc.textContent="➕ Ajouter";br.style.display="";if(valid){bq.style.display="";bq.textContent="⚡ Mettre à jour "+rem;this._qt=rem}else{bq.style.display="none";this._qt=null}}E("import-step-1").style.display="flex";E("import-step-2").style.display="none";E("mod-import").classList.add("open")},
  cln(){const u=new URL(location);let ch=false;if(u.searchParams.has('share')){u.searchParams.delete('share');ch=true}if(u.hash.startsWith('#share:')){u.hash='';ch=true}if(ch)history.replaceState(null,"",u.toString())},
  cls(){this.cln();E("mod-import").classList.remove("open");E("import-step-1").style.display="flex";E("import-step-2").style.display="none"},
  cI(){if(!this._pi)return;const t=this._pi.name.replace(/\s/g,"");if(!State.cfg.usersList.includes(this._pi.name)){State.cfg.usersList.push(this._pi.name);State.saveC()}State.usr[t]={state:{},nums:{},...this._pi.data};State.saveU(t);UI.toast(`✅ ${this._pi.name} importé !`);this._pi=null;this.cls();setTimeout(()=>location.reload(),900)},
  oR(){const l=E("import-player-select");l.innerHTML="";this._rt=null;E("btn-import-replace-confirm").disabled=!0;State.cfg.usersList.forEach(n=>{const b=C("button");b.className="mini-btn sb-btn";b.textContent="👤 "+n;b.onclick=()=>{l.querySelectorAll(".mini-btn").forEach(el=>{el.style.background="";el.style.borderColor="";el.style.color=""});b.style.background="var(--p)";b.style.borderColor="var(--p)";b.style.color="#fff";this._rt=n;E("btn-import-replace-confirm").disabled=!1};l.appendChild(b)});E("import-step-1").style.display="none";E("import-step-2").style.display="flex"},
  cR(){if(!this._pi||!this._rt)return;if(!confirm(`Remplacer "${this._rt}" ?`))return;const t=this._rt.replace(/\s/g,"");State.usr[t]={state:{},nums:{},...this._pi.data};State.saveU(t);try{const m=JSON.parse(LS.getItem("mgo_share_mem")||"{}");m[this._pi.name]=this._rt;LS.setItem("mgo_share_mem",JSON.stringify(m))}catch(e){}UI.toast(`✅ Remplacé pour ${this._rt} !`);this._pi=null;this._rt=null;this.cls();setTimeout(()=>location.reload(),900)},
  cQ(){if(!this._pi||!this._qt)return;const t=this._qt.replace(/\s/g,"");State.usr[t]={state:{},nums:{},...this._pi.data};State.saveU(t);UI.toast(`✅ ${this._qt} mis à jour !`);this._pi=null;this._qt=null;this.cls();setTimeout(()=>location.reload(),900)}
};
const Missions={
  _d:null, gk(d){const nd=new Date(d);nd.setHours(0,0,0,0);const dy=nd.getDay();nd.setDate(nd.getDate()+(dy===0?-6:1-dy));return nd.getFullYear()+'-'+String(nd.getMonth()+1).padStart(2,'0')+'-'+String(nd.getDate()).padStart(2,'0')},
  init(){const k=this.gk(new Date()),sk=LS.getItem('mgo_missions_week');if(sk!==k){LS.removeItem('mgo_missions_data');LS.setItem('mgo_missions_week',k);this._d=Array.from({length:7},()=>({texts:['','','']}))}else{try{this._d=JSON.parse(LS.getItem('mgo_missions_data'))||Array.from({length:7},()=>({texts:['','','']}))}catch(e){this._d=Array.from({length:7},()=>({texts:['','','']}))}}},
  save(){LS.setItem('mgo_missions_data',JSON.stringify(this._d))},
  open(){if(!this._d)this.init();const b=E('missions-body');b.innerHTML='';const now=new Date();now.setHours(0,0,0,0);const md=new Date(now);md.setDate(md.getDate()+(md.getDay()===0?-6:1-md.getDay()));const frD=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'],frM=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];for(let i=0;i<7;i++){const d=new Date(md);d.setDate(md.getDate()+i);const it=d.getTime()===now.getTime(),c=C('div');c.className='mission-day-card'+(it?' today-card':'');c.innerHTML=`<div class="mission-day-label">${frD[i]} ${d.getDate()} ${frM[d.getMonth()]} ${d.getFullYear()} ${it?`<span class="today-badge">Aujourd'hui</span>`:''}</div>`;for(let m=0;m<3;m++){const r=C('div');r.className='mission-row';const ta=C('textarea');ta.className='mission-input';ta.rows=1;ta.placeholder='Mission '+(m+1)+'…';ta.value=this._d[i].texts[m]||'';ta.oninput=()=>{ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,80)+'px';this._d[i].texts[m]=ta.value;this.save()};ta.onfocus=()=>ta.oninput();r.appendChild(ta);c.appendChild(r)}b.appendChild(c)}E('mod-missions').classList.add('open')}
};
let _lCC=null,_lCT=0;
const Actions={
  handle(e){const t=e.target,a=t.closest("[data-action]"),c=t.closest(".cell-wrap"),cd=t.closest(".glass-card");if(t.closest(".dock")){clearTimeout(window._dt);const dk=Q(".dock")[0];if(dk)dk.classList.add("dock-lit");window._dt=setTimeout(()=>{if(dk)dk.classList.remove("dock-lit")},3e3)}if(!D.contains(t)||t.closest(".popover")||t.closest(".dock")){}else{Q(".popover").forEach(p=>p.classList.remove("show"));const dk=Q(".dock")[0];if(dk)dk.classList.remove("dock-lit");UserManager.close()}
  if(c&&t.tagName!=="INPUT"){if(e.type==="dblclick"){e.stopPropagation();e.preventDefault();return}const nw=Date.now();if(_lCC===c&&nw-_lCT<300){_lCC=null;return}_lCC=c;_lCT=nw;const p=cd&&cd.classList.contains("is-primary"),u=c.closest("[data-u]")?.dataset.u,id=+c.dataset.uid;if(State.cfg.mode==="number"&&p){e.stopPropagation();const i=c.querySelector(".cell-inner");i.innerHTML="";const inp=C("input");inp.className="cell-input";inp.type="tel";inp.value=State.usr[u].nums[id]||"";inp.onblur=()=>{State.updC(u,id,inp.value.trim(),!0);UI.uSC(u,id,-1)};inp.onkeydown=ev=>{if(ev.key==="Enter")inp.blur()};i.appendChild(inp);setTimeout(()=>{try{inp.focus()}catch(er){}},50);return}const st=State.usr[u].state[id]||0,nx=(st+1)%3;window._hist=window._hist||[];window._hist.push({u,c:id,v:st});if(window._hist.length>50)window._hist.shift();State.updC(u,id,nx);UI.uSC(u,id,st);return}
  if(cd&&e.type==="dblclick"&&!a&&!c){
    const ch=cd.offsetHeight, isExp=cd.classList.contains("expanded");
    if(isExp){cd.classList.remove("blur-active","expanded");cd.classList.add("blur-out","transitioning")}
    else{cd.classList.add("transitioning","expanded")}
    requestAnimationFrame(()=>{
      const ch2=cd.offsetHeight,r=ch/Math.max(ch2,1);
      cd.style.transformOrigin="top center";
      cd.style.transition="none";
      cd.style.transform=`scaleY(${r})`;
      requestAnimationFrame(()=>{
        cd.style.transition="transform 0.42s var(--ease)";
        cd.style.transform="scaleY(1)";
        setTimeout(()=>{
          cd.style.cssText="";
          cd.classList.remove("transitioning");
          if(isExp)cd.classList.remove("blur-out");
          else cd.classList.add("blur-active");
        },440)
      })
    });
    return
  }
  if(!a)return;e.stopPropagation();const act=a.dataset.action,m={
    'toggle-menu':()=>{const p1=E("pop-menu"),p2=E("pop-view");if(p1.classList.contains("show")){p1.classList.remove("show")}else{p2.classList.remove("show");p1.classList.add("show");UserManager.close()}},
    'toggle-view':()=>{const p1=E("pop-menu"),p2=E("pop-view");if(p2.classList.contains("show")){p2.classList.remove("show");UserManager.close()}else{p1.classList.remove("show");p2.classList.add("show")}},
    'open-users':()=>UserManager.open(),'cancel-edit-users':()=>{if(E("setup-mod").classList.contains("open")){E("pop-view").classList.remove("show");setTimeout(()=>UserManager.close(),250)}else{UserManager.close()}},'add-user-row':()=>UserManager.add(),'save-users':()=>UserManager.save(),
    'undo':()=>{const l=(window._hist||[]).pop();if(l){State.updC(l.u,l.c,l.v);UI.hyd();UI.toast(T("undone"))}else UI.toast(T("nothing_to_undo"))},
    'mode-toggle':()=>{State.cfg.mode=State.cfg.mode==="number"?"cross":"number";State.saveC();UI.renderMain()},
    'reset-u':()=>{const cd=a.closest(".glass-card"),u=cd.dataset.sec,nm=cd.querySelector(".ua-name").textContent;if(confirm(T("reset_player_q").replace("{name}",nm))){State.usr[u].state={};State.usr[u].nums={};State.saveU(u);State._dC=null;UI.hyd();UI.toast(T("reset_done"))}},
    'reset-all':()=>{if(confirm(T("reset_warn1"))){const kp=confirm(T("reset_warn2")),ul=kp?[...State.cfg.usersList]:[`${T('player')} 1`];LS.clear();LS.setItem("mgo_cfg",JSON.stringify({albums:24,mode:"cross",gold_ids:[],gold_ex:[],hidden:[],printHidden:[],setup_done:!1,ambiance:0,seed:Date.now(),usersList:ul}));location.reload()}},
    'open-gold-mod':()=>{UI.gGrid("gold-grid-ctn");E("mod-gold").classList.add("open")},'close-gold':()=>{E("mod-gold").classList.remove("open");UI.hyd()},
    'open-missions':()=>Missions.open(),'close-missions':()=>E("mod-missions").classList.remove("open"),
    'add-gold-row':()=>{State.cfg.gold_ex.push({alb:"",card:"",date:""});State.saveC();UI.gEx()},'del-gold':()=>{if(confirm(T("delete_q"))){State.cfg.gold_ex.splice(+a.dataset.idx,1);State.saveC();UI.gEx()}},
    'toggle-print-sub':()=>{const p=E("sub-print");p.style.display=p.style.display==="none"?"flex":"none"},
    'do-print':()=>{const s=new Set(Array.from(Q(".print-chk:checked")).map(el=>el.value));Q(".glass-card").forEach(c=>c.classList.toggle("print-hidden",!s.has(c.dataset.sec)));window.print()},
    'save-file':()=>{const v="4.1.9 (Web)",b=new Blob([JSON.stringify({version:v,config:State.cfg,users:State.usr})],{type:"application/json"}),u=URL.createObjectURL(b),lk=C("a");lk.href=u;lk.download=`Mgo_Backup_V${v}.json`;D.body.appendChild(lk);lk.click();D.body.removeChild(lk);setTimeout(()=>URL.revokeObjectURL(u),5e3);UI.toast(T("file_dl"))},
    'load':()=>{const i=C("input");i.type="file";i.accept=".json";i.onchange=e=>{const r=new FileReader;r.onload=ev=>{try{const o=JSON.parse(ev.target.result);if(o.config&&o.users){State.cfg=o.config;if(!State.cfg.usersList)State.cfg.usersList=Object.keys(o.users);State.cfg.gold_ids=State.cfg.gold_ids||[];State.cfg.gold_ex=State.cfg.gold_ex||[];State.cfg.hidden=State.cfg.hidden||[];Object.keys(o.users).forEach(u=>{o.users[u].state=o.users[u].state||{};o.users[u].nums=o.users[u].nums||{}});State.usr=o.users;State.cfg.setup_done=!0;State.saveC();Object.keys(o.users).forEach(u=>State.saveU(u));location.reload()}else alert(T("file_invalid"))}catch(er){alert(T("file_err"))}};r.readAsText(e.target.files[0])};i.click()}
  };if(m[act])m[act]()}
};
function __initApp(fromHub=false){
  E("__switch-lbl").textContent = LITE_MODE ? T('switchToFull') : T('switchToLite');
  tr();
  const cnt=Rnd(State.cfg.seed)()<0.01?5:4;
  if(State.cfg.ambiance===4 && cnt===4){
    State.cfg.ambiance=0; State.saveC(); setTimeout(()=>UI.toast(T('cheat_1')),2500);
  } else if (State.cfg.ambiance>4 || State.cfg.ambiance<0) {
    State.cfg.ambiance=0; State.saveC(); setTimeout(()=>UI.toast(T('cheat_2')),2500);
  }
  Missions.init();Share.chk();
  E("btn-import-confirm").onclick=()=>Share.cI();E("btn-import-quick").onclick=()=>Share.cQ();
  E("btn-import-replace").onclick=()=>Share.oR();E("btn-import-replace-back").onclick=()=>{E("import-step-1").style.display="flex";E("import-step-2").style.display="none";Share._rt=null};
  E("btn-import-replace-confirm").onclick=()=>Share.cR();E("btn-import-cancel").onclick=()=>{Share._pi=null;Share._rt=null;Share.cls()};
  const sa=E("sl-alb");sa.value=State.cfg.albums;E("lbl-alb").textContent=State.cfg.albums;sa.oninput=e=>{E("lbl-alb").textContent=e.target.value;State.cfg.albums=+e.target.value;State._gC=null;State.saveC();UI.renderMain()};
  UI.renderMain();UI.gEx();UI.mns();
  if(!LITE_MODE){UI.ambSel();UI.amb();}
  const ah=Actions.handle.bind(Actions);D.body.addEventListener("click",ah);D.body.addEventListener("dblclick",ah);
  D.body.addEventListener("input",e=>{if(e.target.classList.contains("user-note")){const u=e.target.dataset.uid;if(State.usr[u]){const v=e.target.value;if(v)State.usr[u].note=v;else delete State.usr[u].note;clearTimeout(window._tn);window._tn=setTimeout(()=>State.saveU(u),400)}}});
  const iA=E("s-alb"),iV=E("s-alb-val");UI.gGrid("setup-gold-grid");iA.oninput=e=>{iV.textContent=e.target.value;State.cfg.albums=+e.target.value;State.saveC();UI.gGrid("setup-gold-grid")};
  E("btn-start-season").onclick=()=>{State.cfg.setup_done=!0;State.saveC();E("setup-mod").classList.remove("open");UI.mns();UI.renderMain();UI.toast(T("good_season"))};
  const isShiney = cnt === 5;
  const delay = isShiney ? (LITE_MODE ? 1000 : 1800) : 500;
  if(!fromHub && isShiney) __playShineySplash(LITE_MODE);
  const sp=E("splash");
  if(LITE_MODE){
    requestAnimationFrame(()=>setTimeout(()=>{
        if(!sp) return;
        sp.style.transition="opacity 0.4s ease";
        sp.style.opacity="0";
        setTimeout(()=>{sp.remove();if(!State.cfg.setup_done)E("setup-mod").classList.add("open");Share.show()},400)
    }, delay));
  } else {
    const bg=E("ambient-bg");
    setTimeout(()=>{
        if(!sp) return;
        sp.style.transition="opacity 0.35s ease, visibility 0.35s ease";
        sp.style.opacity="0";
        sp.style.visibility="hidden";
        sp.style.pointerEvents="none";
        setTimeout(()=>{UI.amb();requestAnimationFrame(()=>requestAnimationFrame(()=>bg.style.opacity="1"))},500);
        const s=[...Q(".anim-section")].filter(e=>!e.classList.contains("hidden"));
        Q(".anim-section").forEach(e=>{e.style.opacity="0";e.style.transform="translateY(22px)";e.style.transition="none"});
        s.forEach((e,i)=>setTimeout(()=>{e.style.transition="opacity 450ms var(--ease), transform 450ms var(--ease)";e.style.opacity="1";e.style.transform="translateY(0)"},75*i));
        setTimeout(()=>{Q(".anim-section").forEach(e=>{e.style.cssText=""});sp.remove();if(!State.cfg.setup_done)E("setup-mod").classList.add("open");Share.show()},75*s.length+450+80);
    }, delay + 200);
  }
}