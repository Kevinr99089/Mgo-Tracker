const PREF="mgo_unified_version"; let LITE_MODE=document.documentElement.classList.contains("lite-mode"),__hlk=false;
const D=document,E=i=>D.getElementById(i),Q=s=>D.querySelectorAll(s),C=t=>D.createElement(t),LS=localStorage;
const EMOJIS = D.getElementById('emoji-bank').dataset;
let i18n={};
const repE=(s)=>(s+"").replace(/\{e:([a-z]+)\}/g,(m,k)=>EMOJIS[k]||'');
const T=(k)=>repE(i18n[k]||k),esc=(s)=>(s+"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
function tr(){Q("[data-i18n]").forEach(e=>{const k=e.dataset.i18n;k==="add_upper"?e.innerHTML=T(k):e.textContent=T(k)});Q("[data-i18n-html]").forEach(e=>{e.innerHTML=T(e.dataset.i18nHtml)||'';});document.title=T('page_title');}
function __playShineySplash(isFast = false) {
  document.documentElement.classList.add('is-shiney');
  const spt = Q(".sp-title")[0], sph = Q(".sp-hint")[0];
  setTimeout(() => {
      [spt, sph].forEach(el => {
        if(!el) return;
        const cur = getComputedStyle(el).opacity;
        el.style.animation = "none";
        el.style.opacity = cur;
        void el.offsetHeight;
      });
      if(spt){spt.style.transition="opacity 0.3s ease";spt.style.opacity="0";}
      if(sph){sph.style.transition="opacity 0.25s ease";sph.style.opacity="0";}
      setTimeout(() => {
          if(spt) { spt.innerHTML = T('shiney_title'); spt.style.opacity = "1"; }
          if(sph) { sph.textContent = T('shiney_hint'); sph.style.opacity = "1"; }
      }, 300);
  }, isFast ? 150 : 1050);
}
function __flyDeckToHeader(sp){
  const spDeck=sp&&sp.querySelector(".sp-deck"),hdrDeck=E("app-hdr-deck");
  if(!spDeck||!hdrDeck)return;
  const spR=spDeck.getBoundingClientRect(),hR=hdrDeck.getBoundingClientRect();
  const dx=(hR.left+hR.width/2)-(spR.left+spR.width/2),dy=(hR.top+hR.height/2)-(spR.top+spR.height/2);
  const sc=Math.min(hR.width/Math.max(spR.width,1),hR.height/Math.max(spR.height,1));
  const spT=sp.querySelector(".sp-title"),spH=sp.querySelector(".sp-hint");
  const _sh=document.documentElement.classList.contains('is-shiney');
  if(!_sh&&spT){spT.style.transition="opacity 0.22s ease";spT.style.opacity="0";}
  if(!_sh&&spH){spH.style.transition="opacity 0.18s ease";spH.style.opacity="0";}
  setTimeout(()=>{
    spDeck.style.transition="transform 0.52s cubic-bezier(0.4,0,0.2,1)";
    spDeck.style.transformOrigin="center center";
    spDeck.style.transform=`translate(${dx}px,${dy}px) scale(${sc})`;
    setTimeout(()=>hdrDeck.classList.add("visible"),560);
  },200);
}
D.addEventListener("DOMContentLoaded",()=>{
  (function(){
    const lang=(navigator.language||navigator.userLanguage||'en').toLowerCase();
    const base=lang.split('-')[0];
    const loadJson=f=>fetch(`langs/${f}`).then(r=>r.ok?r.json():Promise.reject());
    const load=()=>{
      if(lang===base)return loadJson(`${lang}.txt`);
      return loadJson(`${lang}.txt`).catch(()=>loadJson(`${base}.txt`));
    };
    load()
      .catch(()=>base==='en'?Promise.reject():loadJson('en.txt'))
      .catch(()=>({}))
      .then(strings=>{
      i18n=strings;
      Q("[data-e]").forEach(el => el.innerHTML = EMOJIS[el.dataset.e] || '');
      State.init();window._sc=Rnd(State.cfg.seed)()<0.01;
      Q(".hub-btn[data-pick-version]").forEach(btn=>btn.addEventListener("click",()=>__pickVersion(btn.dataset.pickVersion,btn)));
      if(!LS.getItem(PREF)){
        E("__hub").style.display="flex";tr();
        E("__hub-sub").textContent=T("sub");E("__hub-lbl-full").textContent=T("full");E("__hub-desc-full").textContent=T("fullDesc");
        E("__hub-lbl-lite").textContent=T("lite");E("__hub-desc-lite").textContent=T("liteDesc");
      } else {
        __initApp();
      }
    });
  }());
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
          if(window._sc)__playShineySplash();
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
  cfg:{albums:24,mode:"cross",gold_ids:[],gold_ex:[],hidden:[],setup_done:!1,ambiance:0,ambStatic:!1,seed:Date.now(),usersList:[]},usr:{},_dC:null,_gC:null,
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
window.PlayerManager={
  tu:[],_ni:new Set(),_ds:null,_ts:null,_tc:null,
  open(){
    this.tu=[...State.cfg.usersList];
    const pv=E("pop-players");
    const fromH=pv.offsetHeight;
    E("players-view-head").style.display="none";
    E("players-list").style.display="none";
    E("players-edit-head").style.display="block";
    E("players-edit-list").style.display="flex";
    E("players-save-footer").style.display="flex";
    pv.style.width="320px";
    pv.classList.add("show");
    this.render();
    const maxH=window.innerHeight-110;
    const toH=Math.min(pv.scrollHeight,maxH);
    pv.animate([{height:fromH+"px"},{height:toH+"px"}],{duration:300,easing:"cubic-bezier(0.25,0.8,0.25,1)"});
  },
  close(){
    this._ni.clear();
    const pv=E("pop-players");
    const fromH=pv.offsetHeight;
    E("players-view-head").style.display="block";
    E("players-list").style.display="block";
    E("players-edit-head").style.display="none";
    E("players-edit-list").style.display="none";
    E("players-save-footer").style.display="none";
    pv.style.width="280px";
    const toH=pv.scrollHeight;
    pv.animate([{height:fromH+"px"},{height:toH+"px"}],{duration:300,easing:"cubic-bezier(0.25,0.8,0.25,1)"});
  },
  render(){const c=E("players-edit-list");c.innerHTML="";this.tu.forEach((u,i)=>{const r=C("div");r.className="pm-row"+(this._ni.has(i)?" pm-new":"");r.draggable=!0;r.dataset.idx=i;r.innerHTML=`<span class="pm-handle">⠿</span><input type="text" class="pm-input pm-inp" value="${esc(u)}" data-idx="${i}"><button class="mini-btn danger pm-del" data-idx="${i}" ${this.tu.length<=1?"disabled":""}>${EMOJIS.cls}</button>`;r.addEventListener("dragstart",e=>{this._ds=r;e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",i);setTimeout(()=>r.classList.add("pm-dragging"),0)});r.addEventListener("dragover",e=>{e.preventDefault();if(r!==this._ds){Q(".pm-row").forEach(el=>el.classList.remove("pm-drag-over"));r.classList.add("pm-drag-over")}});r.addEventListener("drop",e=>{e.preventDefault();if(r!==this._ds){const to=i,from=+this._ds.dataset.idx;const item=this.tu.splice(from,1)[0];this.tu.splice(to,0,item);this.render()}});r.addEventListener("dragend",()=>{Q(".pm-row").forEach(el=>el.classList.remove("pm-dragging","pm-drag-over"));this._ds=null});const h=r.querySelector(".pm-handle");h.addEventListener("touchstart",e=>{e.preventDefault();this._ts=r;const rect=r.getBoundingClientRect();const cl=r.cloneNode(!0);cl.classList.add("pm-touch-clone");cl.style.top=rect.top+"px";cl.style.left=rect.left+"px";cl.style.width=rect.width+"px";D.body.appendChild(cl);this._tc=cl;r.classList.add("pm-dragging")},{passive:!1});h.addEventListener("touchmove",e=>{if(!this._tc)return;e.preventDefault();const y=e.touches[0].clientY;this._tc.style.top=y-22+"px";const over=D.elementsFromPoint(e.touches[0].clientX,y).find(el=>el.classList.contains("pm-row")&&el!==this._ts);Q(".pm-row").forEach(el=>el.classList.remove("pm-drag-over"));if(over)over.classList.add("pm-drag-over")},{passive:!1});h.addEventListener("touchend",e=>{if(!this._tc)return;const over=D.elementsFromPoint(e.changedTouches[0].clientX,e.changedTouches[0].clientY).find(el=>el.classList.contains("pm-row")&&el!==this._ts);this._tc.remove();this._tc=null;if(over){const to=+over.dataset.idx,item=this.tu.splice(+this._ts.dataset.idx,1)[0];this.tu.splice(to,0,item)}this.render();this._ts=null},{passive:!1});r.querySelector(".pm-inp").onchange=e=>this.tu[+e.target.dataset.idx]=e.target.value.trim()||`${T('player')} ${i+1}`;r.querySelector(".pm-del").onclick=e=>{if(this.tu.length>1){this.tu.splice(+e.target.dataset.idx,1);this.render()}};c.appendChild(r)})},
  add(){const i=this.tu.length;this.tu.push(`${T('player')} ${i+1}`);this._ni.add(i);this.render();requestAnimationFrame(()=>{const ul=E("players-edit-list");ul.scrollTop=ul.scrollHeight;const rs=Q('.pm-row');if(rs[i]){rs[i].classList.add('pm-flashing');setTimeout(()=>{rs[i].classList.remove('pm-flashing');rs[i].classList.add('pm-new')},950)}})},
  save(){
    this._ni.clear();const o=State.cfg.usersList.slice();this.tu.forEach((n,i)=>{const old=o[i];if(!old)return;const ok=old.replace(/\s/g,""),nk=n.replace(/\s/g,"");if(ok!==nk&&State.usr[ok]){State.usr[nk]=State.usr[ok];delete State.usr[ok];try{LS.removeItem("mgo_u_"+ok)}catch(e){}State.saveU(nk)}});const of1=o[0]?o[0].replace(/\s/g,""):null,nf1=this.tu[0]?this.tu[0].replace(/\s/g,""):null;if(of1&&nf1&&of1!==nf1&&State.usr[of1]){State.usr[of1].nums={};State.saveU(of1)}this.tu.forEach(u=>{const id=u.replace(/\s/g,"");if(!State.usr[id])State.usr[id]={state:{},nums:{}}});State.cfg.usersList=[...this.tu];State.saveC();
    if(E("setup-mod").classList.contains("open")){E("pop-players").classList.remove("show");setTimeout(()=>this.close(),250);}else{this.close();}
    UI.mns();UI.renderMain();UI.toast(T("players_updated"));
  }
};
let _pxApp=null;
const UI={
  dialog(opts){const ov=E("mod-dialog"),msg=E("dialog-msg"),btns=E("dialog-btns"),chkw=E("dialog-chk-wrap"),title=E("dialog-title"),cl=()=>ov.classList.remove("open");if(!opts.keep){document.querySelectorAll(".popover").forEach(p=>p.classList.remove("show"));document.querySelectorAll(".dock-btn.active").forEach(b=>b.classList.remove("active"));}E("dialog-close-btn").onclick=opts.onClose||cl;title.innerHTML=opts.title||T("dialog_title_default");msg.textContent=opts.msg||"";btns.innerHTML="";chkw.innerHTML="";chkw.style.display=opts.checkbox?"block":"none";if(opts.checkbox)chkw.innerHTML=`<label class="dialog-chk-row"><input type="checkbox" id="dialog-chk"${opts.checkbox.checked!==false?' checked':''}><span>${esc(opts.checkbox.label)}</span></label>`;(opts.buttons||[]).forEach(b=>{const btn=document.createElement("button");btn.className="dialog-btn "+(b.cls||"");btn.innerHTML=b.label;btn.onclick=()=>{cl();b.cb&&b.cb()};btns.appendChild(btn)});ov.classList.add("open")},
  confirm(msg,okCb,cancelCb,okLbl,cancelLbl){this.dialog({msg,buttons:[{label:cancelLbl||T("btn_cancel"),cls:"",cb:cancelCb},{label:okLbl||T("btn_confirm"),cls:"primary",cb:okCb}]})},
  alert(msg,cb){this.dialog({msg,buttons:[{label:T("btn_ok"),cls:"primary",cb:cb}]})},
  toast(m){const t=E("toast");const dur=Math.min(6500,Math.max(2500,1800+m.replace(/[^\x00-\x7F]/g,"xx").length*45));clearTimeout(this._tt);t.classList.remove("show");void t.offsetHeight;t.textContent=m;t.classList.add("show");requestAnimationFrame(()=>{const W=t.offsetWidth,H=t.offsetHeight,R=25;const P=Math.round(2*(W-2*R)+2*(H-2*R)+2*Math.PI*R);let svg=t._tp;if(!svg){svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.classList.add("tp");svg.setAttribute("style","position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:0");svg.innerHTML='<defs><linearGradient id="tpg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#f472b6"/></linearGradient></defs><rect fill="none" stroke="url(#tpg)" stroke-width="2.5"/>';t._tp=svg}if(!svg.isConnected)t.appendChild(svg);const rc=svg.querySelector("rect");rc.setAttribute("x","1.25");rc.setAttribute("y","1.25");rc.setAttribute("width",W-2.5);rc.setAttribute("height",H-2.5);rc.setAttribute("rx",R);rc.setAttribute("ry",R);rc.style.strokeDasharray=P;rc.style.strokeDashoffset=0;rc.style.transition="none";void rc.getBoundingClientRect();requestAnimationFrame(()=>{rc.style.transition="stroke-dashoffset "+dur+"ms linear";rc.style.strokeDashoffset=-P})});this._tt=setTimeout(()=>t.classList.remove("show"),dur)},
  amb(){
    if(LITE_MODE)return;const bg=E("ambient-bg");if(!bg)return;
    if(_pxApp){_pxApp();_pxApp=null;}bg.innerHTML="";bg.style.background="";const m=State.cfg.ambiance||0,c=["79,70,229","192,38,211","6,182,212","244,114,182","251,191,36"],r=Rnd(State.cfg.seed);
    if(m===0||m===1||m===3){
      if(typeof PIXI==='undefined'){
        if(!window._pxErr){UI.toast(T('ambiance_error'));window._pxErr=!0}
        bg.style.backgroundImage="var(--lite-bg)";return;
      }
      const a=new PIXI.Application({resizeTo:bg,backgroundAlpha:0,antialias:m===1,resolution:1,autoDensity:!0});a.view.style.cssText="position:absolute;inset:0;width:100%;height:100%;pointer-events:none";bg.appendChild(a.view);
      const o=[];
      if(m===0){for(let i=0;i<7;i++){const sz=45+40*r(),rgb=c[~~(r()*c.length)],cx2=(10+75*r())/100,cy2=(10+75*r())/100,tx=(30*r()-15)/100,ty=(30*r()-15)/100,d=(18+16*r())*1e3,ph=r()*Math.PI*2,ts=256,oc=C('canvas');oc.width=oc.height=ts;const cx3=oc.getContext('2d'),grd=cx3.createRadialGradient(128,128,0,128,128,128);grd.addColorStop(0,`rgba(${rgb},1)`);grd.addColorStop(.68,`rgba(${rgb},.15)`);grd.addColorStop(1,`rgba(${rgb},0)`);cx3.fillStyle=grd;cx3.fillRect(0,0,ts,ts);const spr=new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(oc)));spr.anchor.set(.5);spr.alpha=.55;a.stage.addChild(spr);o.push({spr,cx:cx2,cy:cy2,tx,ty,d,ph,sz})}}
      else if(m===1){const grads=[["#3b41d8","#6468f5"],["#c77b10","#f0aa22"],["#b8223b","#eb3a5f"],["#0e766e","#14b8a6"],["#7c3aed","#a855f7"]];for(let i=0;i<5;i++){const gc=grads[~~(r()*grads.length)],TW=256,TH=358,oc=C("canvas");oc.width=TW;oc.height=TH;const cx2=oc.getContext("2d");cx2.beginPath();cx2.roundRect(0,0,TW,TH,16);cx2.clip();const grd=cx2.createLinearGradient(0,0,TW,TH);grd.addColorStop(0,gc[0]);grd.addColorStop(1,gc[1]);cx2.fillStyle=grd;cx2.fillRect(0,0,TW,TH);cx2.strokeStyle="rgba(255,255,255,0.18)";cx2.lineWidth=2;cx2.stroke();const spr=new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(oc)));spr.anchor.set(.5);spr.alpha=.45;a.stage.addChild(spr);const sz=(30+25*r())/100*window.innerWidth;spr.width=sz;spr.height=sz*1.4;o.push({spr,sx:(85*r()-10)/100,sy:(85*r()-10)/100,tx:(20*r()-10)/100,ty:(20*r()-10)/100,r0:(40*r()-20)*Math.PI/180,r1:(40*r()-20)*Math.PI/180,d:(20+15*r())*1e3,ph:r()*Math.PI*2});}}
      else if(m===3){
        bg.style.background='#020204';
        const goo=new PIXI.Container(),blur=new PIXI.BlurFilter(16,4);blur.padding=200;
        const thresh=new PIXI.Filter(null,"varying vec2 vTextureCoord;uniform sampler2D uSampler;void main(){vec4 c=texture2D(uSampler,vTextureCoord);vec3 rgb=(c.a>0.001)?c.rgb/c.a:vec3(0.0);float a=clamp(c.a*22.0-9.0,0.0,1.0);gl_FragColor=vec4(rgb*a,a);}");thresh.padding=200;
        goo.filters=[blur,thresh];a.stage.addChild(goo);
        const TS=256,ot=C("canvas");ot.width=ot.height=TS;const ct=ot.getContext("2d");
        const gt=ct.createRadialGradient(128,128,0,128,128,128);
        gt.addColorStop(0,"rgba(255,255,255,0.95)");gt.addColorStop(.4,"rgba(255,255,255,0.7)");
        gt.addColorStop(.7,"rgba(255,255,255,0.3)");gt.addColorStop(1,"rgba(255,255,255,0)");
        ct.fillStyle=gt;ct.fillRect(0,0,TS,TS);
        const shTex=new PIXI.Texture(new PIXI.BaseTexture(ot));
        const nP=3+~~(2*r()),D=[...c].sort(()=>r()-.5),pal=D.slice(0,nP).map(x=>{const p=x.split(',');return(+p[0]<<16)|(+p[1]<<8)|+p[2]});
        const blobs=[];
        for(let i=0;i<10;i++){const ny=r(),spr=new PIXI.Sprite(shTex);spr.anchor.set(.5);goo.addChild(spr);const col=pal[~~(r()*pal.length)];spr.tint=col;blobs.push({spr,x:r()*(a.screen.width||window.innerWidth),y:ny*(a.screen.height||window.innerHeight),vx:0,vy:0,r:35+55*r(),baseR:35+55*r(),col,ph:r()*Math.PI*2,fq:.08+.12*r(),df:.04*(r()-.5),tp:1-ny,ti:.12+.18*r()});}
        const BUOY=5.0,DAMP=0.988,FIXED_DT=1/60,MAX_SPD=FIXED_DT*48;
        let acc=0,lt=0;
        function physStep(n){const ds=FIXED_DT,W=a.screen.width,H=a.screen.height;for(let i=0;i<10;i++){const b=blobs[i];const bias=0.15+0.7*(0.5+0.5*Math.sin(n*0.0002+b.ph));b.tp+=(b.y/H-b.tp)*b.ti*ds;b.vy-=(b.tp-bias)*BUOY*ds;b.ph+=b.fq*ds;b.vx+=0.4*Math.sin(b.ph+1.7*i)*ds+b.df*ds*1.5;for(let j=i+1;j<10;j++){const b2=blobs[j],dx=b2.x-b.x,dy=b2.y-b.y,dd=Math.sqrt(dx*dx+dy*dy)+1,mn=.35*(b.r+b2.r);if(dd<mn){const f=.08*(mn-dd)*ds,nx=dx/dd,ny=dy/dd;b.vx-=nx*f;b.vy-=ny*f;b2.vx+=nx*f;b2.vy+=ny*f}}b.vx*=DAMP;b.vy*=DAMP;const spd=Math.sqrt(b.vx*b.vx+b.vy*b.vy);if(spd>MAX_SPD){const sc=MAX_SPD/spd;b.vx*=sc;b.vy*=sc;}b.x+=b.vx;b.y+=b.vy;const pd=.3*b.r;if(b.x<b.r){b.vx=Math.abs(b.vx)*.3;b.x=b.r;}if(b.x>W-b.r){b.vx=-Math.abs(b.vx)*.3;b.x=W-b.r;}if(b.y<-pd){b.vy=Math.abs(b.vy)*.3;b.y=-pd;}if(b.y>H+pd){b.vy=-Math.abs(b.vy)*.3;b.y=H+pd;}b.r=b.baseR+Math.sin(6e-4*n+2.1*i)*b.baseR*.06;}}
        a.ticker.add(()=>{const n=performance.now();if(!lt){lt=n;return;}const elapsed=(n-lt)/1000;lt=n;acc+=elapsed;acc=Math.min(acc,FIXED_DT*8);while(acc>=FIXED_DT){physStep(n);acc-=FIXED_DT;}blobs.forEach(b=>{b.spr.x=b.x;b.spr.y=b.y;b.spr.width=b.spr.height=b.r*3.6;});});
      }
      if(m===0||m===1){a.ticker.add(()=>{const n=performance.now(),W=a.screen.width,H=a.screen.height;for(const b of o){if(m===0){const p=Math.sin(n/b.d*Math.PI*2+b.ph);b.spr.x=b.cx*W+b.tx*W*p;b.spr.y=b.cy*H+b.ty*H*p;if(b.sz)b.spr.width=b.spr.height=b.sz/100*W;}else{const p=(Math.sin(n/b.d*Math.PI*2+b.ph)+1)/2;b.spr.x=b.sx*W+b.tx*W*p;b.spr.y=b.sy*H+b.ty*H*p;if(b.sz)b.spr.width=b.spr.height=b.sz/100*W;if(b.r1!==undefined)b.spr.rotation=b.r0+(b.r1-b.r0)*p;}}});}
      _pxApp=()=>a.destroy(!0,{children:!0,texture:!0,baseTexture:!0})
      if(State.cfg.ambStatic)setTimeout(()=>a.ticker.stop(),50);
    }else if(m===2){for(let i=0;i<6;i++){const d=C("div");d.className="f-obj f-neon";const sz=8+18*r(),M=`rgb(${c[~~(r()*c.length)]})`,k=r()>.5?45:30*r()-15;d.style.cssText=`width:${sz}vw;height:${r()>.5?sz:sz*(.5+.8*r())}vw;top:${88*r()}%;left:${88*r()}%;border-color:${M};box-shadow:0 0 6px ${M}`;d.style.setProperty("--glow",M);d.style.setProperty("--d",14+18*r()+"s");d.style.setProperty("--pd",2.5+2*r()+"s");d.style.setProperty("--tx",26*r()-13+"vw");d.style.setProperty("--ty",26*r()-13+"vh");d.style.setProperty("--r0",k+"deg");d.style.setProperty("--r1",k+60*r()-30+"deg");bg.appendChild(d)}if(State.cfg.ambStatic)requestAnimationFrame(()=>requestAnimationFrame(()=>bg.querySelectorAll('.f-obj').forEach(el=>el.style.animationPlayState='paused')));}
    else{
      bg.style.backgroundImage="radial-gradient(circle at 20% 25%,rgba(99,102,241,.28) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(244,114,182,.22) 0%,transparent 48%)";
      bg.innerHTML=`
      <div class="hub-orb" style="width:38vw;height:38vw;top:-8%;left:-10%;background:radial-gradient(circle,rgba(99,102,241,.25) 0%,transparent 70%);--d:20s;--tx:6vw;--ty:8vh"></div>
      <div class="hub-orb" style="width:30vw;height:30vw;top:55%;right:-8%;background:radial-gradient(circle,rgba(244,114,182,.28) 0%,transparent 70%);--d:16s;--tx:-8vw;--ty:-6vh"></div>
      <div class="hub-orb" style="width:22vw;height:22vw;bottom:-5%;left:30%;background:radial-gradient(circle,rgba(251,191,36,.22) 0%,transparent 70%);--d:24s;--tx:5vw;--ty:-5vh"></div>
      <div class="hub-orb" style="width:18vw;height:18vw;top:20%;right:5%;background:radial-gradient(circle,rgba(99,102,241,.15) 0%,transparent 70%);--d:14s;--tx:-4vw;--ty:7vh"></div>
      <div class="shiny-screen"><div class="shiny-deck"><div class="shiny-c shiny-c1"></div><div class="shiny-c shiny-c2">${EMOJIS.str}</div><div class="shiny-c shiny-c3"></div></div><div class="shiny-logo">MGO <em>Tracker</em><span>.</span></div></div>`;
      if(State.cfg.ambStatic)requestAnimationFrame(()=>requestAnimationFrame(()=>bg.querySelectorAll('.hub-orb,.shiny-c,.shiny-logo').forEach(el=>el.style.animationPlayState='paused')));
    }
  },
  uUndoBtn(){if(!this._uBtn)this._uBtn=document.querySelector('[data-action="undo"]');const btn=this._uBtn;if(!btn)return;const has=(window._hist||[]).length>0;btn.style.color=has?'var(--p)':'rgba(255,255,255,.4)';btn.style.opacity=has?'1':'0.5'},
  ambSel(){const c=E("amb-sel");const _fade=()=>{const _bg=E("ambient-bg");if(_bg){_bg.style.opacity="0";setTimeout(()=>{this.amb();requestAnimationFrame(()=>requestAnimationFrame(()=>_bg.style.opacity="1"))},450)}};if(!c)return;c.innerHTML="";const I=["<span class='ai ai-orb'></span>","<span class='ai ai-card'></span>","<span class='ai ai-neon'></span>","<span class='ai ai-lava'><span></span><span></span><span></span><span></span></span>",`<span class='ai-spk'>${EMOJIS.spk}</span>`],L=[T("amb_0"),T("amb_1"),T("amb_2"),T("amb_3"),T("amb_4")],cnt=window._sc?5:4;const _sub=()=>State.cfg.ambStatic?T('amb_static').replace(/\S+ /,''):T('amb_animated');const subEl=E("amb-sub-lbl"),togBtn=E("amb-tog-btn");if(subEl){subEl.textContent=`${State.cfg.ambStatic?'⏸':'▶'} ${_sub()}`;subEl.className='amb-sub '+(State.cfg.ambStatic?'is-static':'is-anim')}if(togBtn)togBtn.onclick=()=>{State.cfg.ambStatic=!State.cfg.ambStatic;State.saveC();_fade();this.ambSel()};for(let i=0;i<cnt;i++){const b=C("button");b.className="amb-pill"+(State.cfg.ambiance===i?" active":"");b.dataset.v=i;b.innerHTML=I[i];b.title=L[i];b.onclick=()=>{if(State.cfg.ambiance!==i){State.cfg.ambiance=i;State.saveC();_fade();c.querySelectorAll(".amb-pill").forEach(p=>p.classList.toggle("active",+p.dataset.v===i));this.toast(L[i])}};c.appendChild(b)}},
  renderMain(){const a=E("gen-cards");a.innerHTML="";const alb=State.cfg.albums,hlf=Math.ceil(alb/2),w=100/hlf;State.cfg.usersList.forEach((n,i)=>{const uid=n.replace(/\s/g,""),isp=i===0;a.insertAdjacentHTML("beforeend",`<div class="glass-card anim-section ${isp?"is-primary":""} ${isp&&State.cfg.mode==='number'?"mode-num":""}" data-sec="${esc(uid)}"><div class="card-header"><div class="user-info"><div class="user-avatar"><div class="ua-inner"><span class="ua-name">${esc(n)}</span><div class="ua-vsep"></div><span class="ua-top">0/0</span><div class="ua-vsep"></div><span class="ua-bot">★ 0/0</span><div class="ua-vsep"></div><span class="ua-percent">0%</span></div></div>${isp?`<button class="mini-btn" data-action="mode-toggle" style="height:20px;font-size:.6rem;padding:1px 5px;flex-shrink:0">${State.cfg.mode==='number'?'123':'XXX'}</button>`:''}<div class="user-name">${esc(n)}</div></div><div class="card-tools"><button class="mini-btn danger reset-u-btn" data-action="reset-u">↺</button></div><div class="expand-hint">${T('expand_hint')||''}</div></div><div style="padding:0" data-u="${esc(uid)}"><div class="grid-scroll"><div class="track-row">${this._gr(1,hlf,w)}</div><div class="track-row">${this._gr(hlf+1,alb-hlf,w)}</div></div><div class="legend-bar"><div class="legend-item"><div class="legend-swatch s-have"></div>${T('legend_have')||''}</div><div class="legend-item"><div class="legend-swatch s-dupe"></div>${T('legend_dupe')||''}</div><div class="legend-item"><div class="legend-swatch s-gold-dot"></div>${T('legend_gold')||''}</div></div></div></div>`)});const firstUid=State.cfg.usersList[0]?.replace(/\s/g,"")||"",noteEl=E("app-header-note");if(noteEl){noteEl.placeholder=T('note_ph');noteEl.value=State.usr[firstUid]?.note||"";noteEl.dataset.uid=firstUid;noteEl.oninput=()=>{const v=noteEl.value,uid=noteEl.dataset.uid;if(State.usr[uid]){if(v)State.usr[uid].note=v;else delete State.usr[uid].note;clearTimeout(window._tn);window._tn=setTimeout(()=>State.saveU(uid),400)}}}this.hyd()},
  _gr(s,c,w){let h="";for(let i=0;i<c;i++){let g="";for(let k=0;k<9;k++)g+=`<div class="cell-wrap" data-uid="${9*(s+i-1)+k}" data-st="0"><div class="i-dot i-dupe"></div><div class="i-dot i-gold"></div><div class="cell-inner"><span class="t-x">X</span><span class="t-num"></span></div></div>`;h+=`<div class="alb-col" style="width:${w}%;--col-w:${w}%"><div class="alb-head">${T('album')} ${s+i}</div><div class="alb-grid">${g}</div></div>`}return h},
  hyd(){const g=State.getG(),d=State.getD();Q(".glass-card[data-sec]").forEach(card=>{const u=card.dataset.sec;if(!State.usr[u])return;card.querySelectorAll(".cell-wrap").forEach(c=>{const id=+c.dataset.uid,st=State.usr[u].state?.[id]||0,nm=State.usr[u].nums?.[id]||"";this.uCV(c,st,nm,g.has(id),d.has(id))})});this.uS();this.uV()},
  uSC(u,c,val){const isG=State.getG().has(+c),st=State.usr[u]?.state?.[c]||0,nm=State.usr[u]?.nums?.[c]||"";if(val===2||st===2){const isD=State.getD().has(+c);Q(`.cell-wrap[data-uid="${c}"]`).forEach(el=>{const uid=el.closest("[data-u]")?.dataset.u;if(uid)this.uCV(el,State.usr[uid]?.state?.[c]||0,State.usr[uid]?.nums?.[c]||"",isG,isD)})}else{const el=D.querySelector(`.glass-card[data-sec="${u}"] [data-u="${u}"] .cell-wrap[data-uid="${c}"]`);if(el)this.uCV(el,st,nm,isG,State.getD().has(+c))}this.uS(u)},
  uCV(c,st,nm,isG,isD){c.dataset.st=st;const ns=c.querySelector(".t-num");if(ns.textContent!==nm+"")ns.textContent=nm+"";isG?c.dataset.bg="1":delete c.dataset.bg;c.classList.remove("show-gold","show-dupe");if(st===0){if(isG)c.classList.add("show-gold");if(isD)c.classList.add("show-dupe")}},
  uS(sec=null){const tot=State.cfg.albums*9,gSet=State.getG();let gt=0;for(const id of gSet){if(id<tot)gt++;}const cards=sec?[D.querySelector(`.glass-card[data-sec="${sec}"]`)].filter(Boolean):[...Q(".glass-card[data-sec]")];cards.forEach(c=>{const u=State.usr[c.dataset.sec];if(!u||!u.state)return;let n=0,g=0;for(const [sid,st] of Object.entries(u.state)){if(st>0){const id=+sid;if(id<tot){n++;if(gSet.has(id))g++}}}const pct=tot>0?Math.round(n/tot*100):0,pctCol=pct===100?'var(--gold)':pct>=50?'#fb923c':'#f87171';const ut=c.querySelector(".ua-top"),ub=c.querySelector(".ua-bot"),up=c.querySelector(".ua-percent"),av=c.querySelector(".user-avatar");if(ut)ut.textContent=`${n}/${tot}`;if(ub)ub.textContent=`★ ${g}/${gt}`;if(up){up.textContent=pct+"%";up.style.color=pctCol}if(av)av.style.background=pct===100?'var(--gold)':pct>=50?`conic-gradient(#f97316 ${pct}%,var(--p) 0)`:`conic-gradient(var(--ok) ${pct}%,var(--p) 0)`;});const hc=E("hdr-cards"),hg=E("hdr-gold");if(hc)hc.textContent=tot;if(hg)hg.textContent=gSet.size},
  uV(){const hs=new Set(State.cfg.hidden);Q(".anim-section").forEach(e=>e.classList.toggle("hidden",hs.has(e.dataset.sec)))},
  gEx(){const c=E("gold-list");c.innerHTML="";if(State.cfg.gold_ex.length>0)c.insertAdjacentHTML("beforeend",`<div class="gold-row-header"><span>${esc(T('album'))}</span><span>${esc(T('card'))}</span><span>${esc(T('date'))}</span><span></span></div>`);State.cfg.gold_ex.forEach((item,idx)=>{const r=C("div");r.className="gold-row";r.innerHTML=`<input class="g-inp" data-f="alb" maxlength="2" inputmode="numeric" placeholder="--" value="${esc(item.alb||item.album||"")}"><input class="g-inp" data-f="card" placeholder="${esc(T('card'))}" value="${esc(item.card||"")}"><input class="g-inp" data-f="date" maxlength="5" inputmode="numeric" placeholder="${T('date_placeholder')}" value="${esc(item.date||"")}"><button style="background:0 0;border:none;color:var(--err);font-weight:700;cursor:pointer" data-action="del-gold" data-idx="${idx}">${EMOJIS.cls}</button>`;const a=r.querySelector('[data-f="alb"]'),cd=r.querySelector('[data-f="card"]'),d=r.querySelector('[data-f="date"]');a.oninput=()=>{a.value=a.value.replace(/\D/g,"").slice(0,2);State.cfg.gold_ex[idx].alb=a.value;State.saveC()};cd.oninput=()=>{State.cfg.gold_ex[idx].card=cd.value;State.saveC()};d.onkeydown=(e)=>{if(e.key==="Backspace"&&d.value.endsWith("/"))d.value=d.value.slice(0,-1)};d.oninput=()=>{let raw=d.value.replace(/\D/g,"");if(raw.length>4)raw=raw.slice(0,4);d.value=raw.length>2?raw.slice(0,2)+"/"+raw.slice(2):raw;State.cfg.gold_ex[idx].date=d.value;State.saveC()};c.appendChild(r)})},
  mns(){
    const v=E("players-list"),p=E("sub-print");
    v.innerHTML="";p.innerHTML="";
    [...State.cfg.usersList].forEach(s=>{
      const id=s.replace(/\s/g,""),h=State.cfg.hidden.includes(id);
      const shareBtn=`<button class="mini-btn" style="padding:4px 8px;margin-right:10px;font-size:0.8rem;background:rgba(99,102,241,0.15);border-color:var(--p);color:#fff" onclick="Share.quick('${esc(s)}','${esc(id)}',this)">${EMOJIS.shr}</button>`;
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
let _lCC=null,_lCT=0;
let _qdock=null,_qpop=null;
const Actions={
  handle(e){const t=e.target,a=t.closest("[data-action]"),c=t.closest(".cell-wrap"),cd=t.closest(".glass-card");if(!_qdock)_qdock=Q(".dock")[0];if(!_qpop)_qpop=[...Q(".popover")];if(t.closest(".dock")){clearTimeout(window._dt);if(_qdock)_qdock.classList.add("dock-lit");window._dt=setTimeout(()=>{if(_qdock)_qdock.classList.remove("dock-lit")},3e3)}if(D.contains(t)&&!t.closest(".popover")&&!t.closest(".dock")&&!t.closest(".modal-overlay")){_qpop.forEach(p=>p.classList.remove("show"));if(_qdock)_qdock.classList.remove("dock-lit");PlayerManager.close()}
  if(c&&t.tagName!=="INPUT"){if(e.type==="dblclick"){e.stopPropagation();e.preventDefault();return}const nw=Date.now();if(_lCC===c&&nw-_lCT<300){_lCC=null;return}_lCC=c;_lCT=nw;const p=cd&&cd.classList.contains("is-primary"),u=c.closest("[data-u]")?.dataset.u,id=+c.dataset.uid;if(State.cfg.mode==="number"&&p){e.stopPropagation();const i=c.querySelector(".cell-inner");i.innerHTML="";const inp=C("input");inp.className="cell-input";inp.type="tel";inp.value=State.usr[u].nums[id]||"";inp.onblur=()=>{State.updC(u,id,inp.value.trim(),!0);UI.uSC(u,id,-1)};inp.onkeydown=ev=>{if(ev.key==="Enter")inp.blur()};i.appendChild(inp);setTimeout(()=>{try{inp.focus()}catch(er){}},50);return}const st=State.usr[u].state[id]||0,nx=(st+1)%3;window._hist=window._hist||[];window._hist.push({u,c:id,v:st});if(window._hist.length>50)window._hist.shift();State.updC(u,id,nx);UI.uSC(u,id,st);UI.uUndoBtn();return}
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
    'toggle-menu':()=>{const p1=E("pop-menu"),p2=E("pop-players");const bm=D.querySelector('[data-action="toggle-menu"]'),bp=D.querySelector('[data-action="toggle-players"]');if(p1.classList.contains("show")){p1.classList.remove("show");bm?.classList.remove("active")}else{p2.classList.remove("show");p1.classList.add("show");PlayerManager.close();bm?.classList.add("active");bp?.classList.remove("active")}},
    'toggle-players':()=>{const p1=E("pop-menu"),p2=E("pop-players");const bm=D.querySelector('[data-action="toggle-menu"]'),bp=D.querySelector('[data-action="toggle-players"]');if(p2.classList.contains("show")){p2.classList.remove("show");PlayerManager.close();bp?.classList.remove("active")}else{p1.classList.remove("show");p2.classList.add("show");bp?.classList.add("active");bm?.classList.remove("active")}},
    'open-players':()=>PlayerManager.open(),'cancel-players':()=>{const cl=()=>{if(E("setup-mod").classList.contains("open")){E("pop-players").classList.remove("show");setTimeout(()=>PlayerManager.close(),250)}else{PlayerManager.close()}};if(JSON.stringify(PlayerManager.tu)!==JSON.stringify(State.cfg.usersList)){UI.dialog({keep:!0,title:T("dialog_title_default"),msg:T("cancel_edit_msg"),buttons:[{label:T("cancel_edit_continue"),cb:null},{label:T("btn_cancel"),cls:"danger",cb:cl},{label:T("save_users_btn"),cls:"primary",cb:()=>PlayerManager.save()}]})}else{cl()}},'add-player':()=>PlayerManager.add(),'save-players':()=>PlayerManager.save(),
    'undo':()=>{const l=(window._hist||[]).pop();if(l){State.updC(l.u,l.c,l.v);UI.hyd();UI.toast(T("undone"));UI.uUndoBtn()}},
    'mode-toggle':()=>{const exp=[...Q(".glass-card.expanded")].map(c=>({s:c.dataset.sec,b:c.classList.contains("blur-active")}));State.cfg.mode=State.cfg.mode==="number"?"cross":"number";State.saveC();UI.renderMain();exp.forEach(({s,b})=>{const c=D.querySelector(`.glass-card[data-sec="${s}"]`);if(c){c.classList.add("expanded");if(b)c.classList.add("blur-active")}});},
    'reset-u':()=>{const cd=a.closest(".glass-card"),u=cd.dataset.sec,nm=cd.querySelector(".ua-name").textContent;UI.confirm(T("reset_player_q").replace("{name}",nm),()=>{State.usr[u].state={};State.usr[u].nums={};State.saveU(u);State._dC=null;UI.hyd();UI.toast(T("reset_done"))})},
    'reset-all':()=>{UI.dialog({title:T("reset_all"),msg:T("reset_warn1"),checkbox:{label:T("keep_players_lbl"),checked:true},buttons:[{label:T("btn_cancel"),cls:"",cb:null},{label:T("btn_reset_confirm"),cls:"danger",cb:()=>{const kp=document.getElementById("dialog-chk")?.checked!==false;const ul=kp?[...State.cfg.usersList]:[`${T('player')} 1`];LS.clear();LS.setItem("mgo_cfg",JSON.stringify({albums:24,mode:"cross",gold_ids:[],gold_ex:[],hidden:[],setup_done:!1,ambiance:0,ambStatic:!1,seed:Date.now(),usersList:ul}));location.reload()}}]})},
    'open-gold-mod':()=>{Q(".popover").forEach(p=>p.classList.remove("show"));PlayerManager.close();UI.gGrid("gold-grid-ctn");E("mod-gold").classList.add("open")},'close-gold':()=>{E("mod-gold").classList.remove("open");UI.hyd()},
    'open-missions':()=>{Q(".popover").forEach(p=>p.classList.remove("show"));PlayerManager.close();Missions.open()},'close-missions':()=>E("mod-missions").classList.remove("open"),
    'open-gold-trades':()=>{Q(".popover").forEach(p=>p.classList.remove("show"));PlayerManager.close();UI.gEx();E("mod-gold-trades").classList.add("open")},'close-gold-trades':()=>{E("mod-gold-trades").classList.remove("open")},
    'add-gold-row':()=>{State.cfg.gold_ex.push({alb:"",card:"",date:""});State.saveC();UI.gEx()},'del-gold':()=>{UI.confirm(T("delete_q"),()=>{State.cfg.gold_ex.splice(+a.dataset.idx,1);State.saveC();UI.gEx()})},
    'toggle-print-sub':()=>{const p=E("sub-print");p.style.display=p.style.display==="none"?"flex":"none"},
    'do-print':()=>{const s=new Set(Array.from(Q(".print-chk:checked")).map(el=>el.value));Q(".glass-card").forEach(c=>c.classList.toggle("print-hidden",!s.has(c.dataset.sec)));window.print()},
    'save-file':()=>{const v="4.3.0 (Web)",b=new Blob([JSON.stringify({version:v,config:State.cfg,users:State.usr})],{type:"application/json"}),u=URL.createObjectURL(b),lk=C("a");lk.href=u;lk.download=`Mgo_Backup_V${v}.json`;D.body.appendChild(lk);lk.click();D.body.removeChild(lk);setTimeout(()=>URL.revokeObjectURL(u),5e3);UI.toast(T("file_dl"))},
    'load':()=>{const i=C("input");i.type="file";i.accept=".json";i.onchange=e=>{const r=new FileReader;r.onload=ev=>{try{const o=JSON.parse(ev.target.result);if(o.config&&o.users){State.cfg=o.config;if(!State.cfg.usersList)State.cfg.usersList=Object.keys(o.users);State.cfg.gold_ids=State.cfg.gold_ids||[];State.cfg.gold_ex=State.cfg.gold_ex||[];State.cfg.hidden=State.cfg.hidden||[];Object.keys(o.users).forEach(u=>{o.users[u].state=o.users[u].state||{};o.users[u].nums=o.users[u].nums||{}});State.usr=o.users;State.cfg.setup_done=!0;State.saveC();Object.keys(o.users).forEach(u=>State.saveU(u));location.reload()}else UI.alert(T("file_invalid"))}catch(er){UI.alert(T("file_err"))}};r.readAsText(e.target.files[0])};i.click()}
  };if(m[act])m[act]()}
};
function __initApp(fromHub=false){
  E("__switch-lbl").textContent = LITE_MODE ? T('switchToFull') : T('switchToLite');
  E("btn-version-switch").onclick=()=>{LS.setItem(PREF,LITE_MODE?'full':'lite');location.reload()};
  tr();
  const cnt=window._sc?5:4;
  if(State.cfg.ambiance===4 && cnt===4){
    State.cfg.ambiance=0; State.saveC(); setTimeout(()=>UI.toast(T('cheat_1')),2500);
  } else if (State.cfg.ambiance>4 || State.cfg.ambiance<0) {
    State.cfg.ambiance=0; State.saveC(); setTimeout(()=>UI.toast(T('cheat_2')),2500);
  }
  Missions.init();Share.chk();
  E("btn-import-confirm").onclick=()=>Share.cI();E("btn-import-quick").onclick=()=>Share.cQ();
  E("btn-import-replace").onclick=()=>Share.oR();E("btn-import-replace-back").onclick=()=>{E("import-step-1").style.display="flex";E("import-step-2").style.display="none";Share._rt=null};
  E("btn-import-replace-confirm").onclick=()=>Share.cR();E("btn-import-cancel").onclick=()=>{Share._pi=null;Share._rt=null;Share.cls()};
  E("lbl-alb").textContent=State.cfg.albums;const _pc=E("alb-pills"),_upd=v=>{const exp=[...Q(".glass-card.expanded")].map(c=>({s:c.dataset.sec,b:c.classList.contains("blur-active")}));State.cfg.albums=v;State._gC=null;State.saveC();UI.renderMain();exp.forEach(({s,b})=>{const c=D.querySelector(`.glass-card[data-sec="${s}"]`);if(c){c.classList.add("expanded");if(b)c.classList.add("blur-active")}});E("lbl-alb").textContent=v;_pc.querySelectorAll(".alb-pill").forEach(p=>p.classList.toggle("active",+p.textContent===v))};for(let v=21;v<=26;v++){const b=C("button");b.className="alb-pill"+(State.cfg.albums===v?" active":"");b.textContent=v;b.onclick=()=>_upd(v);_pc.appendChild(b)}
  UI.uUndoBtn();
  if(!LITE_MODE){UI.ambSel();}
  const ah=Actions.handle.bind(Actions);D.body.addEventListener("click",ah);D.body.addEventListener("dblclick",ah);
  const _sap=E("s-alb-pills");_sap.innerHTML="";UI.gGrid("setup-gold-grid");for(let v=21;v<=26;v++){const b=C("button");b.className="alb-pill"+(State.cfg.albums===v?" active":"");b.textContent=v;b.onclick=()=>{State.cfg.albums=v;State.saveC();_sap.querySelectorAll(".alb-pill").forEach(p=>p.classList.toggle("active",+p.textContent===v));UI.gGrid("setup-gold-grid")};_sap.appendChild(b)}
  E("btn-start-season").onclick=()=>{State.cfg.setup_done=!0;State.saveC();E("setup-mod").classList.remove("open");UI.mns();UI.renderMain();UI.toast(T("good_season"))};
  const isShiney = cnt === 5;
  const delay = isShiney ? (LITE_MODE ? 1000 : 1800) : 500;
  if(!fromHub && isShiney) __playShineySplash(LITE_MODE);
  setTimeout(()=>{UI.renderMain();UI.mns();},300);
  const sp=E("splash");
  if(LITE_MODE){
    requestAnimationFrame(()=>setTimeout(()=>{
        if(!sp) return;
        E('app-hdr-deck').classList.add('visible');
        sp.style.transition="opacity 0.25s ease";sp.style.opacity="0";
        setTimeout(()=>{sp.remove();if(!State.cfg.setup_done)E("setup-mod").classList.add("open");Share.show()},250);
    }, delay));
  } else {
    const bg=E("ambient-bg");
    setTimeout(()=>{
        if(!sp) return;
        const s=[...Q(".anim-section")].filter(e=>!e.classList.contains("hidden"));
        Q(".anim-section").forEach(e=>{e.style.opacity="0";e.style.transform="translateY(22px)";e.style.transition="none"});
        __flyDeckToHeader(sp);
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          s.forEach((e,i)=>setTimeout(()=>{e.style.transition="opacity 450ms var(--ease), transform 450ms var(--ease)";e.style.opacity="1";e.style.transform="translateY(0)"},75*i));
        }));
        setTimeout(()=>{
          sp.style.transition="opacity 0.55s ease, visibility 0.55s ease";
          sp.style.opacity="0";sp.style.visibility="hidden";sp.style.pointerEvents="none";
          setTimeout(()=>{
            UI.amb();requestAnimationFrame(()=>requestAnimationFrame(()=>bg.style.opacity="1"));
            setTimeout(()=>{Q(".anim-section").forEach(e=>{e.style.cssText=""});sp.remove();if(!State.cfg.setup_done)E("setup-mod").classList.add("open");Share.show()},75*s.length+450+80);
          },550);
        },200);
    }, delay + 200);
  }
}
const Share={
  _pi:null,_rt:null,_qt:null,
  async quick(n,id,btn){
    btn.style.pointerEvents="none";
    const s=JSON.stringify({name:n,data:State.usr[id]||{state:{},nums:{}}});
    let l;
    try{const enc=new TextEncoder().encode(s),cs=new CompressionStream("gzip"),w=cs.writable.getWriter();w.write(enc);w.close();const buf=await new Response(cs.readable).arrayBuffer();let str="";new Uint8Array(buf).forEach(c=>str+=String.fromCharCode(c));l="z:"+btoa(str)}catch(e){l=btoa(unescape(encodeURIComponent(s)))}
    const url="https://kevinr99089.github.io/Mgo-Tracker/?share="+encodeURIComponent(l);
    const scc=()=>{UI.toast(T("share_copied"));const old=btn.innerHTML;btn.innerHTML=EMOJIS.ok;btn.style.background="var(--ok)";btn.style.borderColor="var(--ok)";setTimeout(()=>{btn.innerHTML=old;btn.style.background="rgba(99,102,241,0.15)";btn.style.borderColor="var(--p)";btn.style.pointerEvents="auto"},2000)};
    const fb=()=>{const t=C("textarea");t.value=url;t.style.position="fixed";t.style.opacity="0";D.body.appendChild(t);t.focus();t.select();try{if(D.execCommand("copy"))scc();else throw new Error()}catch(e){prompt(T('share_link_prompt')||'',url);btn.style.pointerEvents="auto"}t.remove()};
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(url).then(scc).catch(fb)}else{fb()}
  },
  async chk(){const p=new URLSearchParams(location.search);let raw=p.get('share');if(!raw&&location.hash.startsWith("#share:"))raw=location.hash.slice(7);if(!raw)return;try{let dec;if(raw.startsWith("z:")){const b=atob(raw.slice(2)),ar=Uint8Array.from(b,c=>c.charCodeAt(0)),ds=new DecompressionStream("gzip"),w=ds.writable.getWriter();w.write(ar);w.close();dec=new TextDecoder().decode(await new Response(ds.readable).arrayBuffer())}else dec=decodeURIComponent(escape(atob(raw)));const o=JSON.parse(dec);if(o.name&&o.data)this._pi=o}catch(e){console.error(e);this.cln()}},
  show(){const s=this._pi;if(!s)return;E("import-name").textContent=T('user_prefix')+s.name;const c=Object.values(s.data.state||{}).filter(x=>x===1).length,d=Object.values(s.data.state||{}).filter(x=>x===2).length;E("import-stats").textContent=`${c} ${T('share_cards')} · ${d} ${T('share_dupes')}`;const match=State.cfg.usersList.includes(s.name);let mem={};try{mem=JSON.parse(LS.getItem("mgo_share_mem")||"{}")}catch(e){}const rem=mem[s.name],valid=rem&&State.cfg.usersList.includes(rem);const bc=E("btn-import-confirm"),br=E("btn-import-replace"),bq=E("btn-import-quick");if(match){bc.textContent=(T('import_update_existing')||'').replace('{name}',s.name);br.style.display="none";bq.style.display="none";this._qt=null}else{bc.textContent=T('import_add_btn')||'';br.style.display="";if(valid){bq.style.display="";bq.textContent=(T('import_update_quick')||'').replace('{name}',rem);this._qt=rem}else{bq.style.display="none";this._qt=null}}E("import-step-1").style.display="flex";E("import-step-2").style.display="none";E("mod-import").classList.add("open")},
  cln(){const u=new URL(location);let ch=false;if(u.searchParams.has('share')){u.searchParams.delete('share');ch=true}if(u.hash.startsWith('#share:')){u.hash='';ch=true}if(ch)history.replaceState(null,"",u.toString())},
  cls(){this.cln();E("mod-import").classList.remove("open");E("import-step-1").style.display="flex";E("import-step-2").style.display="none"},
  cI(){if(!this._pi)return;const t=this._pi.name.replace(/\s/g,"");if(!State.cfg.usersList.includes(this._pi.name)){State.cfg.usersList.push(this._pi.name);State.saveC()}State.usr[t]={state:{},nums:{},...this._pi.data};State.saveU(t);UI.toast((T('toast_imported')||'').replace('{name}',this._pi.name));this._pi=null;this.cls();setTimeout(()=>location.reload(),900)},
  oR(){const l=E("import-player-select");l.innerHTML="";this._rt=null;E("btn-import-replace-confirm").disabled=!0;State.cfg.usersList.forEach(n=>{const b=C("button");b.className="mini-btn sb-btn";b.textContent=T('user_prefix')+n;b.onclick=()=>{l.querySelectorAll(".mini-btn").forEach(el=>{el.style.background="";el.style.borderColor="";el.style.color=""});b.style.background="var(--p)";b.style.borderColor="var(--p)";b.style.color="#fff";this._rt=n;E("btn-import-replace-confirm").disabled=!1};l.appendChild(b)});E("import-step-1").style.display="none";E("import-step-2").style.display="flex"},
  cR(){if(!this._pi||!this._rt)return;UI.confirm((T('confirm_replace')||'').replace('{name}',this._rt),()=>{const t=this._rt.replace(/\s/g,"");State.usr[t]={state:{},nums:{},...this._pi.data};State.saveU(t);try{const m=JSON.parse(LS.getItem("mgo_share_mem")||"{}");m[this._pi.name]=this._rt;LS.setItem("mgo_share_mem",JSON.stringify(m))}catch(e){}UI.toast((T('toast_replaced')||'').replace('{name}',this._rt));this._pi=null;this._rt=null;this.cls();setTimeout(()=>location.reload(),900)})},
  cQ(){if(!this._pi||!this._qt)return;const t=this._qt.replace(/\s/g,"");State.usr[t]={state:{},nums:{},...this._pi.data};State.saveU(t);UI.toast((T('toast_updated')||'').replace('{name}',this._qt));this._pi=null;this._qt=null;this.cls();setTimeout(()=>location.reload(),900)}
};
const Missions={
  _d:null, gk(d){const nd=new Date(d);nd.setHours(0,0,0,0);const dy=nd.getDay();nd.setDate(nd.getDate()+(dy===0?-6:1-dy));return nd.getFullYear()+'-'+String(nd.getMonth()+1).padStart(2,'0')+'-'+String(nd.getDate()).padStart(2,'0')},
  init(){const _df=()=>Array.from({length:7},()=>({texts:['','','']}));const k=this.gk(new Date()),sk=LS.getItem('mgo_missions_week');if(sk!==k){LS.removeItem('mgo_missions_data');LS.setItem('mgo_missions_week',k);this._d=_df()}else{try{this._d=JSON.parse(LS.getItem('mgo_missions_data'))||_df()}catch(e){this._d=_df()}}},
  save(){LS.setItem('mgo_missions_data',JSON.stringify(this._d))},
  open(){if(!this._d)this.init();const b=E('missions-body');b.innerHTML='';const now=new Date();now.setHours(0,0,0,0);const md=new Date(now);md.setDate(md.getDate()+(md.getDay()===0?-6:1-md.getDay()));const loc=navigator.language||'fr-FR';const fmtDay=new Intl.DateTimeFormat(loc,{weekday:'long'});const fmtMonth=new Intl.DateTimeFormat(loc,{month:'long'});const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);for(let i=0;i<7;i++){const d=new Date(md);d.setDate(md.getDate()+i);const it=d.getTime()===now.getTime(),c=C('div');c.className='mission-day-card'+(it?' today-card':'');c.innerHTML=`<div class="mission-day-label">${cap(fmtDay.format(d))} ${d.getDate()} ${cap(fmtMonth.format(d))} ${d.getFullYear()} ${it?`<span class="today-badge">${T('today_badge')||''}</span>`:''}</div>`;for(let m=0;m<3;m++){const r=C('div');r.className='mission-row';const ta=C('textarea');ta.className='mission-input';ta.rows=1;ta.placeholder=(T('mission_placeholder')||'').replace('{n}',m+1);ta.value=this._d[i].texts[m]||'';ta.oninput=()=>{ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,80)+'px';this._d[i].texts[m]=ta.value;this.save()};ta.onfocus=()=>ta.oninput();r.appendChild(ta);c.appendChild(r)}b.appendChild(c)}E('mod-missions').classList.add('open')}
};