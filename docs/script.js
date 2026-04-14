
const TRANSLATIONS_CONFIG = {
    defaultLang: 'en',
    languages: {
        'fr': 'french.txt',
        'en': 'english.txt'
    }
};
let currentTranslations = {};
function getBrowserLanguage() {
    return (navigator.language || "en").startsWith("fr") ? "fr" : "en";
}
async function initTranslations() {
    const lang = getBrowserLanguage();
    const fileToLoad = TRANSLATIONS_CONFIG.languages[lang] || TRANSLATIONS_CONFIG.languages[TRANSLATIONS_CONFIG.defaultLang];
    try {
        const response = await fetch(fileToLoad);
        if (!response.ok) throw new Error('Network response was not ok');
        currentTranslations = await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement de la traduction. Fallback sur les clés:', error);
    }
}
const s = (key) => currentTranslations[key] || key;
function a(e) {
    return (e + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
const n_set = new Set(["add_upper"]);
function r() {
    document.querySelectorAll("[data-i18n]").forEach(e => {
        const t = e.dataset.i18n;
        const aStr = s(t);
        if (n_set.has(t)) e.innerHTML = aStr;
        else e.textContent = aStr;
    });
    document.querySelectorAll("[data-i18n-title]").forEach(e => {
        e.title = s(e.dataset.i18nTitle);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(e => {
        e.placeholder = s(e.dataset.i18nPlaceholder);
    });
}
const __MGO_PREF = 'mgo_unified_version';
let LITE_MODE = document.documentElement.className === 'lite-mode';
window.__pickVersion = function(v) {
    LITE_MODE = v === 'lite';
    if(document.getElementById('__hub-chk').checked) localStorage.setItem(__MGO_PREF, v);
    else localStorage.removeItem(__MGO_PREF);
    document.documentElement.className = LITE_MODE ? 'lite-mode' : 'full-mode';
    document.getElementById('__hub').style.display = 'none';
    __initApp();
};
const o = { VERSION: "4.1.3 (Web)", KEYS: { CFG: "mgo_cfg", USR: "mgo_u_" } };
let i = [];
function l(e){return function(){var t=e+=1831565813;return t=Math.imul(t^t>>>15,1|t),(((t^=t+Math.imul(t^t>>>7,61|t))^t>>>14)>>>0)/4294967296}}
function c(e){return l(e)()<.01}
function d(e){const t=c(e.seed)?4:3;return null==e.ambiance||"number"!=typeof e.ambiance||e.ambiance<0||!Number.isInteger(e.ambiance)?(e.ambiance=0,null):e.ambiance>t?4!==e.ambiance||c(e.seed)?(e.ambiance=0,"cheat_easter"):(e.ambiance=0,"cheat_shiny"):null}
const u = {
    cfg: { albums: 24, mode: "cross", gold_ids: [], gold_ex: [], hidden: [], printHidden: [], setup_done: !1, ambiance: 0, seed: Date.now(), usersList: [] },
    usr: {},
    _dupesCache: null,
    _goldCache: null,
    _saveTimers: {},
    getGoldSet(){return this._goldCache||(this._goldCache=new Set(this.cfg.gold_ids)),this._goldCache},
    invalidateGold(){this._goldCache=null},
    getDupesSet(){if(this._dupesCache)return this._dupesCache;const e=new Set;return Object.values(this.usr).forEach(t=>{t&&t.state&&Object.entries(t.state).forEach(([t,s])=>{2===s&&e.add(+t)})}),this._dupesCache=e,e},
    invalidateDupes(){this._dupesCache=null},
    debounceSave(e){clearTimeout(this._saveTimers[e]),this._saveTimers[e]=setTimeout(()=>this.saveU(e),400)},
    init(){const e=localStorage.getItem("mgo_cfg");if(e)try{const t=JSON.parse(e);this.cfg={...this.cfg,...t},this.cfg.seed||(this.cfg.seed=Date.now())}catch(e){console.error("Config corrupt",e)}this.cfg.usersList&&0!==this.cfg.usersList.length||(this.cfg.usersList=[s("player")+" 1"]),this.cfg.usersList.forEach(e=>{const t=e.replace(/\s/g,""),s=localStorage.getItem("mgo_u_"+t);if(s)try{const e=JSON.parse(s);this.usr[t]={state:{},nums:{},...e},this.usr[t].state||(this.usr[t].state={}),this.usr[t].nums||(this.usr[t].nums={})}catch(e){console.error("User data corrupt",e),this.usr[t]={state:{},nums:{}}}else this.usr[t]={state:{},nums:{}}})},
    saveC(){localStorage.setItem("mgo_cfg",JSON.stringify(this.cfg))},
    saveU(e){this.usr[e]&&localStorage.setItem("mgo_u_"+e,JSON.stringify(this.usr[e]))},
    setGold(e,t){const s_set=new Set(this.cfg.gold_ids);t?s_set.add(e):s_set.delete(e),this.cfg.gold_ids=Array.from(s_set),this.invalidateGold(),this.saveC()},
    updateCell(e,t,s_val,a_flag=!1){if(this.usr[e]){if(this.usr[e].state||(this.usr[e].state={}),this.usr[e].nums||(this.usr[e].nums={}),a_flag)s_val?this.usr[e].nums[t]=s_val:delete this.usr[e].nums[t];else{const a_val=this.usr[e].state[t]||0;0===s_val?delete this.usr[e].state[t]:this.usr[e].state[t]=s_val,2!==a_val&&2!==s_val||this.invalidateDupes()}this.debounceSave(e)}},
    resetUser(e){this.usr[e]&&(this.usr[e].state={},this.usr[e].nums={},this.invalidateDupes(),this.saveU(e))}
};
window.UserManager = {
    tempUsers: [], _newIndices: new Set(), _dragSrc: null, _touchSrc: null, _touchClone: null, _touchStartY: 0,
    open(){this.tempUsers=[...u.cfg.usersList],this.render(),document.getElementById("mod-users").classList.add("open")},
    close(){this._newIndices.clear(),document.getElementById("mod-users").classList.remove("open")},
    render(){
        const e=document.getElementById("users-edit-list");e.innerHTML="";
        this.tempUsers.forEach((t,idx)=>{
            const n=document.createElement("div");n.className="um-row"+(this._newIndices.has(idx)?" um-new":"");n.draggable=!0;n.dataset.idx=idx;
            const r_name=a(t);
            n.innerHTML=`
              <span class="um-handle" title="${a(s("drag_reorder"))}">⠿</span>
              <input type="text" class="g-inp um-inp" style="flex:1;border:1px solid var(--glass-b);border-radius:6px;padding:8px;color:#fff" value="${r_name}" data-idx="${idx}">
              <button class="mini-btn danger um-del" data-idx="${idx}" ${this.tempUsers.length<=1?"disabled":""}>×</button>
            `;
            n.addEventListener("dragstart",ev=>this._onDragStart(ev,n));
            n.addEventListener("dragover",ev=>this._onDragOver(ev,n));
            n.addEventListener("dragleave",ev=>n.classList.remove("um-drag-over"));
            n.addEventListener("drop",ev=>this._onDrop(ev,n));
            n.addEventListener("dragend",ev=>this._onDragEnd());
            const o_handle=n.querySelector(".um-handle");
            o_handle.addEventListener("touchstart",ev=>this._onTouchStart(ev,n),{passive:!1});
            o_handle.addEventListener("touchmove",ev=>this._onTouchMove(ev),{passive:!1});
            o_handle.addEventListener("touchend",ev=>this._onTouchEnd(ev),{passive:!1});
            n.querySelector(".um-inp").addEventListener("change",ev=>this.update(+ev.target.dataset.idx,ev.target.value));
            n.querySelector(".um-del").addEventListener("click",ev=>this.remove(+ev.target.dataset.idx));
            e.appendChild(n);
        });
    },
    _onDragStart(e,t){this._dragSrc=t,e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",t.dataset.idx),setTimeout(()=>t.classList.add("um-dragging"),0)},
    _onDragOver(e,t){e.preventDefault(),e.dataTransfer.dropEffect="move",t!==this._dragSrc&&(document.querySelectorAll(".um-row").forEach(e=>e.classList.remove("um-drag-over")),t.classList.add("um-drag-over"))},
    _onDrop(e,t){if(e.preventDefault(),t===this._dragSrc)return;const s_idx=+t.dataset.idx,a_user=this.tempUsers.splice(+this._dragSrc.dataset.idx,1)[0];this.tempUsers.splice(s_idx,0,a_user),this.render()},
    _onDragEnd(){document.querySelectorAll(".um-row").forEach(e=>{e.classList.remove("um-dragging","um-drag-over")}),this._dragSrc=null},
    _onTouchStart(e,t){e.preventDefault(),this._touchSrc=t,this._touchStartY=e.touches[0].clientY;const s_node=t.cloneNode(!0);s_node.classList.add("um-touch-clone"),s_node.style.top=t.getBoundingClientRect().top+"px",document.body.appendChild(s_node),this._touchClone=s_node,t.classList.add("um-dragging")},
    _onTouchMove(e){if(!this._touchClone)return;e.preventDefault();const t_y=e.touches[0].clientY;this._touchClone.style.top=t_y-22+"px";const s_elem=document.elementsFromPoint(e.touches[0].clientX,t_y).find(el=>el.classList.contains("um-row")&&el!==this._touchSrc);document.querySelectorAll(".um-row").forEach(el=>el.classList.remove("um-drag-over")),s_elem&&s_elem.classList.add("um-drag-over")},
    _onTouchEnd(e){if(!this._touchClone)return;const t_elem=document.elementsFromPoint(e.changedTouches[0].clientX,e.changedTouches[0].clientY).find(el=>el.classList.contains("um-row")&&el!==this._touchSrc);if(this._touchClone.remove(),this._touchClone=null,t_elem){const idx=+t_elem.dataset.idx,s_user=this.tempUsers.splice(+this._touchSrc.dataset.idx,1)[0];this.tempUsers.splice(idx,0,s_user)}this.render(),this._touchSrc=null},
    update(e,t){this.tempUsers[e]=t.trim()||`${s("player")} ${e+1}`},
    add(){const ni=this.tempUsers.length;this.tempUsers.push(`${s("player")} ${ni+1}`);this._newIndices.add(ni);this.render();requestAnimationFrame(()=>{const rows=document.querySelectorAll('#users-edit-list .um-row');const row=rows[ni];if(!row)return;row.classList.add('um-flashing');setTimeout(()=>{row.classList.remove('um-flashing');row.classList.add('um-new');},950);})},
    remove(e){this.tempUsers.length>1&&(this.tempUsers.splice(e,1),this.render())},
    save(){
        this._newIndices.clear();const originalList=u.cfg.usersList.slice();
        this.tempUsers.forEach((newName,i)=>{
            const oldName=originalList[i];if(!oldName)return;
            const oldKey=oldName.replace(/\s/g,""),newKey=newName.replace(/\s/g,"");
            if(oldKey!==newKey&&u.usr[oldKey]){
                u.usr[newKey]=u.usr[oldKey];delete u.usr[oldKey];
                try{localStorage.removeItem("mgo_u_"+oldKey)}catch(e){}
                u.saveU(newKey);
            }
        });
        const oldFirstKey=originalList[0]?originalList[0].replace(/\s/g,""):null,newFirstKey=this.tempUsers[0]?this.tempUsers[0].replace(/\s/g,""):null;
        oldFirstKey&&newFirstKey&&oldFirstKey!==newFirstKey&&u.usr[oldFirstKey]&&(u.usr[oldFirstKey].nums={},u.saveU(oldFirstKey));
        this.tempUsers.forEach(e=>{const t=e.replace(/\s/g,"");u.usr[t]||(u.usr[t]={state:{},nums:{}})});
        u.cfg.usersList=[...this.tempUsers];u.saveC();this.close();g.renderMenus();g.renderMain();g.showToast(s("players_updated"));
    }
};
let m=null,p=null;
function h(){m&&(cancelAnimationFrame(m),m=null),p&&(p(),p=null)}
const g = {
    els: { app: document.getElementById("gen-cards"), toast: document.getElementById("toast"), bg: document.getElementById("ambient-bg") },
    showToast(e){this.els.toast.textContent=e,this.els.toast.classList.add("show"),clearTimeout(this._toastTimer),this._toastTimer=setTimeout(()=>this.els.toast.classList.remove("show"),2e3)},
    renderAmbiance(){
        if(LITE_MODE||!this.els.bg)return;h(),this.els.bg.innerHTML="";
        const e_rnd=l(u.cfg.seed),t_amb=u.cfg.ambiance||0,s_cols=["#4f46e5","#c026d3","#06b6d4","#f472b6","#fbbf24"];
        if(4!==t_amb){
            if(0===t_amb){const c_cnt=7;for(let d=0;d<c_cnt;d++){const gn=document.createElement("div");gn.className="f-obj f-orb";const v=45+40*e_rnd(),f=s_cols[Math.floor(e_rnd()*s_cols.length)];gn.style.cssText=`width:${v}vw; height:${v}vw; top:${90*e_rnd()-5}%; left:${90*e_rnd()-5}%; background:radial-gradient(circle at 50% 50%, ${f} 0%, transparent 68%);`;gn.style.setProperty("--d",18+16*e_rnd()+"s");gn.style.setProperty("--tx",18*e_rnd()-9+"vw");gn.style.setProperty("--ty",18*e_rnd()-9+"vh");gn.style.setProperty("--r0",30*e_rnd()-15+"deg");gn.style.setProperty("--r1",30*e_rnd()-15+"deg");this.els.bg.appendChild(gn)}return}
            if(1===t_amb){const y_cols=["linear-gradient(145deg,#3b41d8,#6468f5)","linear-gradient(145deg,#c77b10,#f0aa22)","linear-gradient(145deg,#b8233b,#eb3a5f)","linear-gradient(145deg,#0e766e,#14b8a6)","linear-gradient(145deg,#7c3aed,#a855f7)","linear-gradient(145deg,#065f86,#0ea5e9)"],b_cnt=7;for(let _=0;_<b_cnt;_++){const E=document.createElement("div");E.className="f-obj f-card";const L=18+22*e_rnd(),w=.65+.25*e_rnd(),C=60*e_rnd()-30;E.style.cssText=`width:${L}vw; height:${L/w}vw; top:${85*e_rnd()-5}%; left:${85*e_rnd()-5}%; background:${y_cols[Math.floor(e_rnd()*y_cols.length)]};`;E.style.setProperty("--d",20+18*e_rnd()+"s");E.style.setProperty("--tx",20*e_rnd()-10+"vw");E.style.setProperty("--ty",20*e_rnd()-10+"vh");E.style.setProperty("--r0",C+"deg");E.style.setProperty("--r1",C+40*e_rnd()-20+"deg");this.els.bg.appendChild(E)}return}
            if(2===t_amb){const S_cnt=9;for(let x=0;x<S_cnt;x++){const T=document.createElement("div");T.className="f-obj f-neon";const I=8+18*e_rnd(),$=e_rnd()>.5?I:I*(.5+.8*e_rnd()),M=s_cols[Math.floor(e_rnd()*s_cols.length)],k=e_rnd()>.5?45:30*e_rnd()-15;T.style.cssText=`width:${I}vw; height:${$}vw; top:${88*e_rnd()}%; left:${88*e_rnd()}%; border-color:${M};`;T.style.setProperty("--glow",M);T.style.setProperty("--d",14+18*e_rnd()+"s");T.style.setProperty("--pd",2.5+2*e_rnd()+"s");T.style.setProperty("--tx",26*e_rnd()-13+"vw");T.style.setProperty("--ty",26*e_rnd()-13+"vh");T.style.setProperty("--r0",k+"deg");T.style.setProperty("--r1",k+60*e_rnd()-30+"deg");e_rnd()<.3&&(T.classList.add("f-neon-dying"),T.style.setProperty("--fd",3+5*e_rnd()+"s"));this.els.bg.appendChild(T)}return}
            if(3===t_amb){const A=document.createElement("div");A.className="lava-wrap";const N=document.createElement("canvas");N.className="lava-canvas";A.appendChild(N);this.els.bg.appendChild(A);const R=N.getContext("2d");let B,U,O;function a_rs(){O=Math.min(window.devicePixelRatio||1,2),B=A.clientWidth,U=A.clientHeight,N.width=B*O*.5,N.height=U*O*.5,N.style.width=B+"px",N.style.height=U+"px",R.scale(.5*O,.5*O)}a_rs();const q=[],P=2+Math.floor(2*e_rnd()),D=[...s_cols].sort(()=>e_rnd()-.5);for(let te=0;te<P;te++)q.push(D[te%D.length]);const G=q.map(function(e){return[parseInt(e.slice(1,3),16),parseInt(e.slice(3,5),16),parseInt(e.slice(5,7),16)]}),H=10,j=[];for(let se=0;se<H;se++){const ae=35+55*e_rnd(),ne=e_rnd()*U;j.push({x:e_rnd()*B,y:ne,vx:0,vy:0,r:ae,baseR:ae,col:G[Math.floor(e_rnd()*G.length)],phase:e_rnd()*Math.PI*2,freq:.08+.12*e_rnd(),drift:.06*(e_rnd()-.5),temp:1-ne/U,tempInertia:.12+.18*e_rnd()})}let F,V={x:-9999,y:-9999,active:!1},z=null;function n_md(e){const t=e.touches?e.touches[0]:e;z=A.getBoundingClientRect(),V.x=t.clientX-z.left,V.y=t.clientY-z.top,V.active=!0}function r_mm(e){if(!V.active||!z)return;const t=e.touches?e.touches[0]:e;V.x=t.clientX-z.left,V.y=t.clientY-z.top}function o_mu(){V.active=!1,z=null}function i_rs(){clearTimeout(F),F=setTimeout(()=>{R.setTransform(1,0,0,1,0,0),a_rs(),J=.5*O,j.forEach(e=>{e.x=Math.min(e.x,B),e.y=Math.min(e.y,U)})},150)}const __ac=new AbortController(),__sig=__ac.signal;A.style.pointerEvents="auto";A.addEventListener("mousedown",n_md,{signal:__sig});A.addEventListener("mousemove",r_mm,{signal:__sig});A.addEventListener("mouseup",o_mu,{signal:__sig});A.addEventListener("mouseleave",o_mu,{signal:__sig});A.addEventListener("touchstart",n_md,{passive:!0,signal:__sig});A.addEventListener("touchmove",r_mm,{passive:!0,signal:__sig});A.addEventListener("touchcancel",o_mu,{signal:__sig});window.addEventListener("resize",i_rs,{signal:__sig});let Y=0,J=.5*O;const W=.994,X=6.5,K=.42,Z=1,Q=25,ee=200;return m=requestAnimationFrame(function e_loop(t){m=requestAnimationFrame(e_loop);const s_dt=Math.min((t-Y)/1e3,.05);if(Y=t,!(s_dt<=0)){for(let e=0;e<H;e++){const a_p=j[e];if(a_p.temp+=(a_p.y/U-a_p.temp)*a_p.tempInertia*s_dt,a_p.vy-=(a_p.temp-K)*X*s_dt,a_p.phase+=a_p.freq*s_dt,a_p.vx+=Math.sin(a_p.phase+1.7*e)*Z*s_dt,a_p.vx+=a_p.drift*s_dt*3,V.active){const ox=V.x-a_p.x,oy=V.y-a_p.y,od=Math.sqrt(ox*ox+oy*oy)+1,onx=ox/od,ony=oy/od,otx=-ony,oty=onx,oratio=1-Math.min(od,ee)/ee,oradF=oratio*oratio*65*s_dt,oorbF=oratio*45*s_dt;a_p.vx+=onx*oradF+otx*oorbF;a_p.vy+=ony*oradF+oty*oorbF}for(let t_i=e+1;t_i<H;t_i++){const e_p2=j[t_i],n_dx=e_p2.x-a_p.x,r_dy=e_p2.y-a_p.y,o_dist=Math.sqrt(n_dx*n_dx+r_dy*r_dy)+1,i_minD=.35*(a_p.r+e_p2.r);if(o_dist<i_minD){const t_f=.08*(i_minD-o_dist)*s_dt,l_nx=n_dx/o_dist,c_ny=r_dy/o_dist;a_p.vx-=l_nx*t_f,a_p.vy-=c_ny*t_f,e_p2.vx+=l_nx*t_f,e_p2.vy+=c_ny*t_f}}a_p.vx*=W,a_p.vy*=W,a_p.x+=a_p.vx,a_p.y+=a_p.vy;const n_rad=.3*a_p.r;a_p.x<-n_rad&&(a_p.x=-n_rad,a_p.vx=.3*Math.abs(a_p.vx)),a_p.x>B+n_rad&&(a_p.x=B+n_rad,a_p.vx=.3*-Math.abs(a_p.vx)),a_p.y<-n_rad&&(a_p.y=-n_rad,a_p.vy=.3*Math.abs(a_p.vy)),a_p.y>U+n_rad&&(a_p.y=U+n_rad,a_p.vy=.3*-Math.abs(a_p.vy)),a_p.r=a_p.baseR+Math.sin(6e-4*t+2.1*e)*a_p.baseR*.06}R.setTransform(J,0,0,J,0,0),R.clearRect(0,0,B,U);for(let e=0;e<H;e++){const t_p=j[e],[s_c1,a_c2,n_c3]=t_p.col,r_rad2=1.8*t_p.r,o_grad=R.createRadialGradient(t_p.x,t_p.y,0,t_p.x,t_p.y,r_rad2);o_grad.addColorStop(0,`rgba(${s_c1},${a_c2},${n_c3},0.95)`),o_grad.addColorStop(.4,`rgba(${s_c1},${a_c2},${n_c3},0.7)`),o_grad.addColorStop(.7,`rgba(${s_c1},${a_c2},${n_c3},0.3)`),o_grad.addColorStop(1,`rgba(${s_c1},${a_c2},${n_c3},0)`),R.beginPath(),R.arc(t_p.x,t_p.y,r_rad2,0,2*Math.PI),R.fillStyle=o_grad,R.fill()}}}),void(p=()=>{__ac.abort();clearTimeout(F)})}
        } else {
            this.els.bg.innerHTML=`<div class="shiny-screen"><div class="shiny-deck"><div class="shiny-c shiny-c1"></div><div class="shiny-c shiny-c2">★</div><div class="shiny-c shiny-c3"></div></div><div class="shiny-logo">MGO <em>Tracker</em><span>.</span></div></div>`
        }
    },
    renderMain(){
        this.els.app.innerHTML="";
        const e=u.cfg.albums,t=Math.ceil(e/2),n_w=100/t;
        u.cfg.usersList.forEach((r_usr,o_idx)=>{
            const i_key=r_usr.replace(/\s/g,""),l_prim=0===o_idx;
            let c_btn="";
            l_prim&&(c_btn=`<button class="mini-btn" data-action="mode-toggle" style="margin-right:8px;height:24px">${"number"===u.cfg.mode?"123":"XXX"}</button>`);
            let d_note="";
            if(l_prim){
                const e_val=a(u.usr[i_key].note||"");
                d_note=`<input type="text" class="user-note" data-i18n-placeholder="note_ph" placeholder="${a(s("note_ph"))}" value="${e_val}" data-uid="${a(i_key)}" onclick="event.stopPropagation()" ondblclick="event.stopPropagation()">`
            }
            const m_cls=l_prim?"is-primary":"",p_cls=l_prim&&"number"===u.cfg.mode?"mode-num":"",h_name=a(r_usr);
            const html_str=`
            <div class="glass-card anim-section ${m_cls} ${p_cls}" data-sec="${a(i_key)}">
              <div class="card-header">
                  <div class="user-info">
                      <div class="user-avatar">
                         <div class="ua-inner">
                             <div class="ua-left">
                                 <div class="ua-name">${h_name}</div>
                                 <div class="ua-percent">0%</div>
                             </div>
                             <div class="ua-stats-col">
                                 <div class="ua-top"></div>
                                 <div class="ua-bot"></div>
                             </div>
                         </div>
                      </div>
                      <div class="user-name">${h_name}</div>
                      ${c_btn}
                      ${d_note}
                  </div>
                  <div class="card-tools"><button class="mini-btn danger reset-u-btn" data-action="reset-u" data-i18n-title="reset_tooltip" title="${a(s("reset_tooltip"))}">↺</button></div>
              <div class="expand-hint" data-i18n="expand_hint">${s("expand_hint")}</div>
              </div>
              <div style="padding:0" data-u="${i_key}">
                 <div class="grid-scroll">
                    <div class="track-row">${this._genRow(1,t,n_w)}</div>
                    <div class="track-row">${this._genRow(t+1,e-t,n_w)}</div>
                 </div>
                 <div class="legend-bar">
                   <div class="legend-item"><div class="legend-swatch s-have"></div><span data-i18n="legend_have">${s("legend_have")}</span></div>
                   <div class="legend-item"><div class="legend-swatch s-dupe"></div><span data-i18n="legend_dupe">${s("legend_dupe")}</span></div>
                   <div class="legend-item"><div class="legend-swatch s-gold-dot"></div><span data-i18n="legend_gold">${s("legend_gold")}</span></div>
                 </div>
              </div>
            </div>`;
            this.els.app.insertAdjacentHTML("beforeend",html_str)
        });
        this.hydrate()
    },
    _genRow(e,t,w){let a_str="";for(let n=0;n<t;n++)a_str+=this._genAlb(e+n,w);return a_str},
    _genAlb(e,t){
        let a_str="";
        for(let j=0;j<9;j++){
            a_str+=`<div class="cell-wrap" data-uid="${9*(e-1)+j}" data-st="0"><div class="i-dot i-dupe"></div><div class="i-dot i-gold"></div><div class="cell-inner"><span class="t-x">X</span><span class="t-num"></span></div></div>`
        }
        return`<div class="alb-col" style="width:${t}%"><div class="alb-head">${s("album")} ${e}</div><div class="alb-grid">${a_str}</div></div>`
    },
    hydrate(){
        const e_gold=u.getGoldSet(),t_dupes=u.getDupesSet();
        this.els.app.querySelectorAll(".cell-wrap").forEach(s_node=>{
            const a_uid=+s_node.dataset.uid,n_user=s_node.closest("[data-u]")?.dataset.u;
            if(!n_user||!u.usr[n_user])return;
            const r_st=u.usr[n_user].state&&u.usr[n_user].state[a_uid]||0,o_num=u.usr[n_user].nums&&u.usr[n_user].nums[a_uid]||"",i_gold=e_gold.has(a_uid),l_dupe=t_dupes.has(a_uid);
            this.updateCardVisuals(s_node,r_st,o_num,i_gold,l_dupe)
        });
        this.updateStats();this.updateVis()
    },
    updateSingleCell(e,t,s_val){
        const a_gold=u.getGoldSet().has(+t),n_st=u.usr[e]?.state?.[t]||0,r_num=u.usr[e]?.nums?.[t]||"";
        if(2===s_val||2===n_st){
            const e_dupe=u.getDupesSet().has(+t);
            document.querySelectorAll(`.cell-wrap[data-uid="${t}"]`).forEach(s_node=>{
                const n_user=s_node.closest("[data-u]");if(!n_user)return;
                const r_key=n_user.dataset.u;
                this.updateCardVisuals(s_node,u.usr[r_key]?.state?.[t]||0,u.usr[r_key]?.nums?.[t]||"",a_gold,e_dupe)
            })
        }else{
            const s_card=document.querySelector(`.glass-card[data-sec="${e}"] [data-u="${e}"]`);
            if(!s_card)return void this.hydrate();
            const o_cell=s_card.querySelector(`.cell-wrap[data-uid="${t}"]`);
            if(!o_cell)return void this.hydrate();
            const i_dupes=u.getDupesSet();
            this.updateCardVisuals(o_cell,n_st,r_num,a_gold,i_dupes.has(+t))
        }
        this.updateStats()
    },
    updateCardVisuals(e,t,s_num,a_gold,n_dupe){
        e.dataset.st=t;const r_node=e.querySelector(".t-num"),o_val=null==s_num?"":s_num+"";
        r_node.textContent!==o_val&&(r_node.textContent=o_val);
        a_gold?e.dataset.bg="1":delete e.dataset.bg;
        e.classList.remove("show-gold","show-dupe");
        0===t&&(a_gold&&e.classList.add("show-gold"),n_dupe&&e.classList.add("show-dupe"))
    },
    updateStats(){
        const e_tot=9*u.cfg.albums,t_gold=u.getGoldSet();
        this.els.app.querySelectorAll(".glass-card[data-sec]").forEach(s_card=>{
            if("sec-gold"===s_card.id)return;
            const a_usr=u.usr[s_card.dataset.sec];if(!a_usr)return;
            const n_st=a_usr.state||{};
            let r=0,o=0,i=0;
            for(let j=0;j<e_tot;j++){const v=n_st[j]||0;v>0&&r++,t_gold.has(j)&&(i++,v>0&&o++)}
            const l_pct=e_tot>0?Math.round(r/e_tot*100):0,c_av=s_card.querySelector(".user-avatar"),d_top=s_card.querySelector(".ua-top"),m_bot=s_card.querySelector(".ua-bot"),p_pct=s_card.querySelector(".ua-percent");
            d_top&&(d_top.textContent=`${r}/${e_tot}`);
            m_bot&&(m_bot.textContent=`${o}/${i}`);
            p_pct&&(p_pct.textContent=l_pct+"%",p_pct.style.color=100===l_pct?"var(--gold)":l_pct>=50?"#fb923c":"#f87171");
            c_av&&(c_av.style.background=`conic-gradient(var(--ok) ${l_pct}%, var(--p) 0)`)
        })
    },
    renderGoldEx(){
        const e=document.getElementById("gold-list");e.innerHTML="";
        if(u.cfg.gold_ex.length>0){const h=document.createElement("div");h.className="gold-row-header";h.innerHTML=`<span>${a(s("album"))}</span><span>${a(s("card"))}</span><span>${a(s("date"))}</span><span></span>`;e.appendChild(h)}
        const t=document.createDocumentFragment();
        u.cfg.gold_ex.forEach((ex,n)=>{
            const r=document.createElement("div");r.className="gold-row";
            r.innerHTML=`<input class="g-inp" data-f="alb" maxlength="2" inputmode="numeric" placeholder="--" value="${a(ex.alb||ex.album||"")}"><input class="g-inp" data-f="card" placeholder="${a(s("card"))}" value="${a(ex.card||"")}"><input class="g-inp" data-f="date" maxlength="5" inputmode="numeric" placeholder="JJ/MM" value="${a(ex.date||"")}"><button style="background:0 0;border:none;color:var(--err);font-weight:700;cursor:pointer" data-action="del-gold" data-idx="${n}">×</button>`;
            const albInp=r.querySelector('[data-f="alb"]'),cardInp=r.querySelector('[data-f="card"]'),dateInp=r.querySelector('[data-f="date"]');
            albInp.oninput=()=>{albInp.value=albInp.value.replace(/\D/g,"").slice(0,2);u.cfg.gold_ex[n].alb=albInp.value;u.saveC()};
            cardInp.oninput=()=>{u.cfg.gold_ex[n].card=cardInp.value;u.saveC()};
            dateInp.addEventListener("keydown",ev=>{if(ev.key==="Backspace"&&dateInp.value.endsWith("/")){dateInp.value=dateInp.value.slice(0,-1);ev.preventDefault()}});
            dateInp.oninput=()=>{let raw=dateInp.value.replace(/\D/g,"");if(raw.length>4)raw=raw.slice(0,4);dateInp.value=raw.length>2?raw.slice(0,2)+"/"+raw.slice(2):raw;u.cfg.gold_ex[n].date=dateInp.value;u.saveC()};
            t.appendChild(r)
        });
        e.appendChild(t)
    },
    renderMenus(){
        const e=document.getElementById("view-list");e.innerHTML="";
        const t=document.getElementById("sub-print");t.innerHTML="";
        const a_frag1=document.createDocumentFragment(),n_frag2=document.createDocumentFragment();
        [...u.cfg.usersList,"Gold"].forEach(lbl=>{
            const k="Gold"===lbl?"Gold":lbl.replace(/\s/g,""),isHidd=u.cfg.hidden.includes(k);
            const r=document.createElement("div");r.className="menu-item";
            r.innerHTML=`<span>${lbl}</span><label style="cursor:pointer;display:flex"><input type="checkbox" ${isHidd?"":"checked"} style="display:none"><div class="switch"></div></label>`;
            r.querySelector("input").onchange=ev=>{u.cfg.hidden=ev.target.checked?u.cfg.hidden.filter(h=>h!==k):[...u.cfg.hidden,k];u.saveC();this.updateVis()};
            a_frag1.appendChild(r);
            const o=document.createElement("div");o.className="menu-item";o.style.cssText="padding:5px 8px;font-size:0.8rem";
            o.innerHTML=`<span>${lbl}</span><label style="cursor:pointer;display:flex;align-items:center"><input type="checkbox" class="print-chk" value="${k}" checked style="display:none"><div class="switch" style="transform:scale(0.7);transform-origin:right center"></div></label>`;
            n_frag2.appendChild(o)
        });
        e.appendChild(a_frag1);
        const r_btn=document.createElement("button");r_btn.className="mini-btn";r_btn.dataset.action="do-print";r_btn.style.cssText="justify-content:center;background:var(--p);color:#fff;margin-top:5px;width:100%";r_btn.textContent=s("print_upper");
        n_frag2.appendChild(r_btn);t.appendChild(n_frag2)
    },
    updateVis(){
        document.getElementById("main-app").querySelectorAll(".anim-section").forEach(e=>{e.classList.toggle("hidden",u.cfg.hidden.includes(e.dataset.sec))})
    },
    renderGoldGrid(e){
        const t=document.getElementById(e);if(!t)return;t.innerHTML="";
        const a_alb=u.cfg.albums,n_gold=u.getGoldSet(),r=document.createElement("div");r.className="g-conf-row";
        for(let i=1;i<=a_alb;i++){
            let html="";for(let j=0;j<9;j++){const id=9*(i-1)+j;html+=`<div class="g-cell ${n_gold.has(id)?"active":""}" data-uid="${id}"></div>`}
            const col=document.createElement("div");col.className="g-conf-col";col.innerHTML=`<span style="font-size:9px;font-weight:700;margin-bottom:2px">${s("album")} ${i}</span><div class="g-conf-grid">${html}</div>`;
            r.appendChild(col)
        }
        r.onclick=ev=>{const t=ev.target;if(t.classList.contains("g-cell")){const id=+t.dataset.uid,isActive=t.classList.contains("active");u.setGold(id,!isActive);t.classList.toggle("active")}};
        t.appendChild(r)
    },
    switchAmbiance(){
        if(LITE_MODE||!this.els.bg)return;
        const bg=this.els.bg;bg.style.transition="opacity 0.4s ease";bg.style.opacity="0";
        setTimeout(()=>{this.renderAmbiance();requestAnimationFrame(()=>requestAnimationFrame(()=>{bg.style.transition="opacity 0.4s ease";bg.style.opacity="1"}))},450)
    },
    renderAmbianceSelector(){
        const el=document.getElementById("amb-sel");if(!el)return;el.innerHTML="";
        const hasSpecial=l(u.cfg.seed)()<.01,count=hasSpecial?5:4;
        const icons=["<span style='display:inline-block;width:10px;height:10px;background:#fff;border-radius:50%'></span>","<span style='display:inline-block;width:14px;height:9px;background:#fff;border-radius:3px'></span>","<span style='display:inline-block;width:10px;height:10px;border:2.5px solid #fff;border-radius:1px;box-sizing:border-box'></span>","<span style='display:grid;grid-template-columns:1fr 1fr;gap:2px;width:10px;height:10px'><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span></span>","<span style='font-size:0.85em;line-height:1'>✨</span>"];
        const labels=[s("amb_0"),s("amb_1"),s("amb_2"),s("amb_3"),s("amb_4")];
        for(let i=0;i<count;i++){
            const btn=document.createElement("button"),isActive=u.cfg.ambiance===i;
            btn.style.cssText=`width:40px;height:36px;border-radius:10px;border:2px solid ${isActive?"var(--p)":"rgba(255,255,255,0.15)"};background:${isActive?"rgba(99,102,241,0.2)":"rgba(0,0,0,0.3)"};cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border 0.2s,background 0.2s;box-shadow:${isActive?"0 0 8px rgba(99,102,241,0.4)":"none"}`;
            btn.innerHTML=icons[i];btn.title=labels[i];
            btn.onclick=()=>{if(u.cfg.ambiance===i)return;u.cfg.ambiance=i;u.saveC();g.switchAmbiance();g.renderAmbianceSelector();g.showToast(labels[i])};
            el.appendChild(btn)
        }
    }
};
const v = {
    _lastClickCell:null,_lastClickTime:0,_popovers:null,
    _getPopovers(){return this._popovers||(this._popovers=document.querySelectorAll(".popover")),this._popovers},
    handle(e){
        const t=e.target,a=t.closest("[data-action]"),n_cell=t.closest(".cell-wrap"),r_card=t.closest(".glass-card");
        if(t.closest(".popover")||t.closest(".dock")||this._getPopovers().forEach(e=>e.classList.remove("show")),n_cell&&"INPUT"!==t.tagName){
            if("dblclick"===e.type)return e.stopPropagation(),void e.preventDefault();
            const ts=Date.now();
            if(v._lastClickCell===n_cell&&ts-(v._lastClickTime||0)<300)return void(v._lastClickCell=null);
            v._lastClickCell=n_cell,v._lastClickTime=ts;
            const isPrim=r_card&&r_card.classList.contains("is-primary"),usrKey=n_cell.closest("[data-u]")?.dataset.u,uid=+n_cell.dataset.uid;
            if("number"===u.cfg.mode&&isPrim){
                e.stopPropagation();
                const inner=n_cell.querySelector(".cell-inner");inner.innerHTML="";
                const inp=document.createElement("input");inp.className="cell-input";inp.type="tel";inp.value=u.usr[usrKey].nums[uid]||"";
                inp.onblur=()=>{const val=inp.value.trim();u.updateCell(usrKey,uid,val,!0);g.updateSingleCell(usrKey,uid,-1)};
                inp.onkeydown=ev=>{"Enter"===ev.key&&inp.blur()};
                inner.appendChild(inp);return void setTimeout(()=>{try{inp.focus()}catch(e){}},50)
            }
            const st=u.usr[usrKey].state[uid]||0,nxt=(st+1)%3;
            return i.push({u:usrKey,c:uid,v:st}),i.length>50&&i.shift(),u.updateCell(usrKey,uid,nxt),void g.updateSingleCell(usrKey,uid,st)
        }
        if(r_card&&"dblclick"===e.type&&!a&&!n_cell)return void(r_card.classList.contains("expanded")?(r_card.classList.remove("blur-active"),r_card.classList.add("blur-out"),setTimeout(()=>{r_card.classList.remove("blur-out"),r_card.classList.add("transitioning"),r_card.classList.remove("expanded"),setTimeout(()=>r_card.classList.remove("transitioning"),420)},200)):(r_card.classList.add("transitioning"),r_card.classList.add("expanded"),setTimeout(()=>{r_card.classList.remove("transitioning"),r_card.classList.add("blur-active")},420)));
        if(!a)return;
        e.stopPropagation();
        const act=a.dataset.action;
        const cmds={
            "toggle-menu":()=>{const pm=document.getElementById("pop-menu"),pv=document.getElementById("pop-view"),wasOpen=pm.classList.contains("show");pv.classList.remove("show");wasOpen?pm.classList.remove("show"):pm.classList.add("show")},
            "toggle-view":()=>{const pm=document.getElementById("pop-menu"),pv=document.getElementById("pop-view"),wasOpen=pv.classList.contains("show");pm.classList.remove("show");wasOpen?pv.classList.remove("show"):pv.classList.add("show")},
            "open-users":()=>window.UserManager.open(),
            "close-users":()=>window.UserManager.close(),
            "add-user-row":()=>window.UserManager.add(),
            "save-users":()=>window.UserManager.save(),
            undo:()=>{const pop=i.pop();pop?(u.updateCell(pop.u,pop.c,pop.v),g.hydrate(),g.showToast(s("undone"))):g.showToast(s("nothing_to_undo"))},
            "mode-toggle":()=>{u.cfg.mode="number"===u.cfg.mode?"cross":"number";u.saveC();g.renderMain()},
            "cycle-ambiance":()=>{if(LITE_MODE)return;const e_sp=l(u.cfg.seed)()<.01;u.cfg.ambiance=(u.cfg.ambiance+1)%(e_sp?5:4);u.saveC();g.renderAmbiance();const t_lbl=[s("amb_0"),s("amb_1"),s("amb_2"),s("amb_3"),s("amb_4")];g.showToast(t_lbl[u.cfg.ambiance])},
            "reset-u":()=>{const sec=a.closest(".glass-card").dataset.sec;confirm(s("reset_board_q"))&&(u.resetUser(sec),g.hydrate(),g.showToast(s("reset_done")))},
            "reset-all":()=>{if(confirm(s("reset_warn1"))){let lst=confirm(s("reset_warn2"))?[...u.cfg.usersList]:[s("player")+" 1"],amb=u.cfg.ambiance;i.length=0;localStorage.clear();const ts=Date.now();localStorage.setItem("mgo_cfg",JSON.stringify({albums:24,mode:"cross",gold_ids:[],gold_ex:[],hidden:[],printHidden:[],setup_done:!1,ambiance:amb,seed:ts,usersList:lst}));location.reload()}},
            "open-gold-mod":()=>{g.renderGoldGrid("gold-grid-ctn");document.getElementById("mod-gold").classList.add("open")},
            "close-gold":()=>{document.getElementById("mod-gold").classList.remove("open");g.hydrate()},
            "add-gold-row":()=>{u.cfg.gold_ex.push({alb:"",card:"",date:""});u.saveC();g.renderGoldEx()},
            "del-gold":()=>{confirm(s("delete_q"))&&(u.cfg.gold_ex.splice(+a.dataset.idx,1),u.saveC(),g.renderGoldEx())},
            "toggle-print-sub":()=>{const el=document.getElementById("sub-print");el.style.display="none"===el.style.display?"flex":"none"},
            "do-print":()=>{const set=new Set(Array.from(document.querySelectorAll(".print-chk:checked")).map(el=>el.value));document.querySelectorAll(".glass-card").forEach(el=>{el.classList.toggle("print-hidden",!set.has(el.dataset.sec))});window.print()},
            "save-file":()=>{const blob=new Blob([JSON.stringify({version:o.VERSION,config:u.cfg,users:u.usr})],{type:"application/json"}),url=URL.createObjectURL(blob),a_link=document.createElement("a");a_link.href=url;a_link.download=`Mgo_Backup_V${o.VERSION}.json`;document.body.appendChild(a_link);a_link.click();document.body.removeChild(a_link);setTimeout(()=>URL.revokeObjectURL(url),5e3);g.showToast(s("file_dl"))},
            "open-share":()=>{document.getElementById("pop-menu").classList.remove("show");y.openModal()},
            "close-share":()=>{document.getElementById("mod-share").classList.remove("open")},
            "copy-share-link":()=>{const el=document.getElementById("share-url-field");navigator.clipboard.writeText(el.value).then(()=>{const btn=document.getElementById("share-copy-btn"),prev=btn.innerHTML;btn.innerHTML=s("share_copied");btn.style.background="var(--ok)";setTimeout(()=>{btn.innerHTML=prev;btn.style.background="var(--p)"},2e3)}).catch(()=>{el.select();document.execCommand("copy");g.showToast(s("share_copied"))})},
            save:()=>cmds["save-file"](),
            load:()=>{const inp=document.createElement("input");inp.type="file";inp.accept=".json";inp.onchange=ev=>{const fr=new FileReader;fr.onload=e=>{try{const d=JSON.parse(e.target.result);d.config&&d.users?(u.cfg=d.config,u.cfg.usersList||(u.cfg.usersList=Object.keys(d.users)),u.cfg.gold_ids||(u.cfg.gold_ids=[]),u.cfg.gold_ex||(u.cfg.gold_ex=[]),u.cfg.hidden||(u.cfg.hidden=[]),u.cfg.printHidden||(u.cfg.printHidden=[]),Object.keys(d.users).forEach(k=>{d.users[k].state||(d.users[k].state={});d.users[k].nums||(d.users[k].nums={})}),u.usr=d.users,void 0===u.cfg.setup_done&&(u.cfg.setup_done=!0),i.length=0,u.saveC(),Object.keys(d.users).forEach(k=>u.saveU(k)),location.reload()):alert(s("file_invalid"))}catch(e){alert(s("file_err"))}};fr.readAsText(ev.target.files[0])};inp.click()}
        };
        cmds[act]&&cmds[act]()
    }
};
const f = {
    init(){
        const sl=document.getElementById("s-alb"),val=document.getElementById("s-alb-val");
        g.renderGoldGrid("setup-gold-grid");
        sl.oninput=ev=>{val.textContent=ev.target.value;u.cfg.albums=+ev.target.value;u.saveC();g.renderGoldGrid("setup-gold-grid")};
        document.getElementById("btn-start-season").onclick=()=>{u.cfg.setup_done=!0;u.saveC();document.getElementById("setup-mod").classList.remove("open");g.renderMenus();g.renderMain();g.showToast(s("good_season"))}
    }
};
const y = {
    _selected: null,
    openModal(){
        this._selected=null;const list=document.getElementById("share-player-list");list.innerHTML="";
        document.getElementById("share-link-section").style.display="none";
        u.cfg.usersList.forEach(usr=>{
            const key=usr.replace(/\s/g,""),btn=document.createElement("button");
            btn.className="mini-btn";btn.style.cssText="width:100%;justify-content:flex-start;padding:12px 16px;font-size:0.95rem;transition:0.2s";
            btn.innerHTML="👤 "+a(usr);
            btn.onclick=()=>{list.querySelectorAll(".mini-btn").forEach(b=>{b.style.background="";b.style.color="";b.style.borderColor=""});btn.style.background="var(--p)";btn.style.color="#fff";btn.style.borderColor="var(--p)";this._selected=usr;this._generateLink(usr,key)};
            list.appendChild(btn)
        });
        document.getElementById("mod-share").classList.add("open")
    },
    async _generateLink(name,key){
        const dat=JSON.stringify({name:name,data:u.usr[key]||{state:{},nums:{}}});
        let res;try{const enc=(new TextEncoder).encode(dat),cs=new CompressionStream("gzip"),w=cs.writable.getWriter();w.write(enc);w.close();const buf=await new Response(cs.readable).arrayBuffer();let str="";new Uint8Array(buf).forEach(b=>str+=String.fromCharCode(b));res="z:"+btoa(str)}catch(e){res=btoa(unescape(encodeURIComponent(dat)))}
        const full="https://kevinr99089.github.io/Mgo-Tracker/?share="+encodeURIComponent(res);
        document.getElementById("share-url-field").value=full;
        document.getElementById("share-link-section").style.display="flex"
    },
    async checkImport(){
        const params=new URLSearchParams(window.location.search);let raw=params.get('share');if(!raw&&window.location.hash.startsWith("#share:"))raw=window.location.hash.slice(7);if(!raw)return;
        try{let dec;if(raw.startsWith("z:")){const b=atob(raw.slice(2)),arr=Uint8Array.from(b,c=>c.charCodeAt(0)),ds=new DecompressionStream("gzip"),w=ds.writable.getWriter();w.write(arr);w.close();const buf=await new Response(ds.readable).arrayBuffer();dec=(new TextDecoder).decode(buf)}else dec=decodeURIComponent(escape(atob(raw)));const obj=JSON.parse(dec);if(!obj.name||!obj.data)return;this._pendingImport=obj}catch(e){console.error("Share import error",e);this._cleanURL()}
    },
    showImportIfPending(){
        const obj=this._pendingImport;if(!obj)return;
        document.getElementById("import-name").textContent="👤 "+obj.name;
        const checks=Object.values(obj.data.state||{}).filter(e=>1===e).length,dupes=Object.values(obj.data.state||{}).filter(e=>2===e).length;
        document.getElementById("import-stats").textContent=s("import_stats").replace("{c}",checks).replace("{d}",dupes);
        const match=u.cfg.usersList.includes(obj.name);
        let mem={};try{mem=JSON.parse(localStorage.getItem("mgo_share_mem")||"{}")}catch(e){}
        const rem=mem[obj.name],remValid=rem&&u.cfg.usersList.includes(rem);
        const btnC=document.getElementById("btn-import-confirm"),btnR=document.getElementById("btn-import-replace"),btnQ=document.getElementById("btn-import-quick");
        if(match){btnC.textContent="✅ "+s("import_update")+" ("+obj.name+")";btnR.style.display="none";btnQ.style.display="none";this._quickTarget=null}
        else{btnC.textContent="➕ "+s("import_add");btnR.style.display="";if(remValid){btnQ.style.display="";btnQ.textContent="⚡ "+s("import_update")+" "+rem;this._quickTarget=rem}else{btnQ.style.display="none";this._quickTarget=null}}
        document.getElementById("import-step-1").style.display="flex";document.getElementById("import-step-2").style.display="none";
        document.getElementById("mod-import").classList.add("open")
    },
    confirmImport(){
        const obj=this._pendingImport;if(!obj)return;
        const key=obj.name.replace(/\s/g,"");
        u.cfg.usersList.includes(obj.name)||(u.cfg.usersList.push(obj.name),u.saveC());
        u.usr[key]={state:{},nums:{},...obj.data};u.saveU(key);
        this._pendingImport=null;this._replaceTarget=null;this._closeImportModal();
        g.showToast(`✅ ${obj.name} ${s("imported")}`);
        setTimeout(()=>location.reload(),900)
    },
    _cleanURL(){const url=new URL(window.location);let chg=!1;if(url.searchParams.has('share')){url.searchParams.delete('share');chg=!0}if(url.hash.startsWith('#share:')){url.hash='';chg=!0}if(chg){history.replaceState(null,"",url.toString())}},
    _closeImportModal(){this._cleanURL();document.getElementById("mod-import").classList.remove("open");document.getElementById("import-step-1").style.display="flex";document.getElementById("import-step-2").style.display="none"},
    openReplaceStep(){
        const list=document.getElementById("import-player-select");list.innerHTML="";this._replaceTarget=null;document.getElementById("btn-import-replace-confirm").disabled=!0;
        u.cfg.usersList.forEach(name=>{
            const btn=document.createElement("button");btn.className="mini-btn";btn.style.cssText="width:100%;justify-content:flex-start;padding:10px 14px;font-size:0.9rem;transition:0.2s";btn.textContent="👤 "+name;
            btn.onclick=()=>{list.querySelectorAll(".mini-btn").forEach(b=>{b.style.background="";b.style.borderColor="";b.style.color=""});btn.style.background="var(--p)";btn.style.borderColor="var(--p)";btn.style.color="#fff";this._replaceTarget=name;document.getElementById("btn-import-replace-confirm").disabled=!1};
            list.appendChild(btn)
        });
        document.getElementById("import-step-1").style.display="none";document.getElementById("import-step-2").style.display="flex"
    },
    confirmReplace(){
        const obj=this._pendingImport;if(!obj||!this._replaceTarget)return;
        if(!confirm(s("import_replace_warn").replace("{name}", this._replaceTarget)))return;
        const key=this._replaceTarget.replace(/\s/g,"");
        u.usr[key]={state:{},nums:{},...obj.data};u.saveU(key);
        const repl=this._replaceTarget;
        let mem={};try{mem=JSON.parse(localStorage.getItem("mgo_share_mem")||"{}")}catch(e){}
        mem[obj.name]=repl;localStorage.setItem("mgo_share_mem",JSON.stringify(mem));
        this._pendingImport=null;this._replaceTarget=null;this._closeImportModal();
        g.showToast(`✅ ${s("data_replaced").replace("{name}", repl)}`);
        setTimeout(()=>location.reload(),900)
    },
    confirmQuickUpdate(){
        const obj=this._pendingImport;if(!obj||!this._quickTarget)return;
        const key=this._quickTarget.replace(/\s/g,"");
        u.usr[key]={state:{},nums:{},...obj.data};u.saveU(key);
        const tg=this._quickTarget;this._pendingImport=null;this._quickTarget=null;this._closeImportModal();
        g.showToast(`✅ ${tg} ${s("updated")}`);
        setTimeout(()=>location.reload(),900)
    }
};
function __initApp(){
    r();u.init();y.checkImport();
    document.getElementById("btn-import-confirm").onclick=()=>y.confirmImport();
    document.getElementById("btn-import-quick").onclick=()=>y.confirmQuickUpdate();
    document.getElementById("btn-import-replace").onclick=()=>y.openReplaceStep();
    document.getElementById("btn-import-replace-back").onclick=()=>{document.getElementById("import-step-1").style.display="flex";document.getElementById("import-step-2").style.display="none";y._replaceTarget=null};
    document.getElementById("btn-import-replace-confirm").onclick=()=>y.confirmReplace();
    document.getElementById("btn-import-cancel").onclick=()=>{y._pendingImport=null;y._replaceTarget=null;y._closeImportModal()};
    const sl=document.getElementById("sl-alb");let t_alb;
    sl.value=u.cfg.albums;document.getElementById("lbl-alb").textContent=u.cfg.albums;
    sl.oninput=ev=>{document.getElementById("lbl-alb").textContent=ev.target.value;clearTimeout(t_alb);t_alb=setTimeout(()=>{u.cfg.albums=+ev.target.value;u.invalidateGold();u.saveC();g.renderMain()},300)};
    g.renderMain();g.renderGoldEx();g.renderMenus();
    if(!LITE_MODE){
        const ext=d(u.cfg);ext&&u.saveC();g.renderAmbianceSelector();
        if(ext)setTimeout(()=>g.showToast(s(ext)),500);else if(4===u.cfg.ambiance)g.showToast(s("shiny_season"))
    }
    const evtHnd=v.handle.bind(v);let t_not;
    document.body.addEventListener("click",evtHnd);
    document.body.addEventListener("dblclick",evtHnd);
    document.body.addEventListener("input",ev=>{if(ev.target.classList.contains("user-note")){const uid=ev.target.dataset.uid;if(u.usr[uid]){const val=ev.target.value;val?u.usr[uid].note=val:delete u.usr[uid].note;clearTimeout(t_not);t_not=setTimeout(()=>u.saveU(uid),400)}}});
    f.init();
    const __sp=document.getElementById("splash");
    if(LITE_MODE){
        requestAnimationFrame(()=>setTimeout(()=>{__sp.style.transition="opacity 0.4s ease";__sp.style.opacity="0";setTimeout(()=>{__sp.remove();u.cfg.setup_done||document.getElementById("setup-mod").classList.add("open");y.showImportIfPending()},400)},500))
    }else{
        const __bg=document.getElementById("ambient-bg");
        setTimeout(()=>{
            g.renderAmbiance();requestAnimationFrame(()=>requestAnimationFrame(()=>{__bg.style.opacity="1"}));
            __sp.style.transition="opacity 0.4s ease, visibility 0.4s ease";__sp.style.opacity="0";__sp.style.visibility="hidden";__sp.style.pointerEvents="none";
            const els=[...document.querySelectorAll(".anim-section")],visEls=els.filter(e=>!e.classList.contains("hidden"));
            els.forEach(e=>{e.style.opacity="0";e.style.transform="translateY(22px)";e.style.transition="none"});
            const cb="cubic-bezier(0.22, 1, 0.36, 1)";
            visEls.forEach((e,idx)=>{setTimeout(()=>{e.style.transition=`opacity 480ms ${cb}, transform 480ms ${cb}`;e.style.opacity="1";e.style.transform="translateY(0)"},85*idx)});
            setTimeout(()=>{els.forEach(e=>{e.style.removeProperty("opacity");e.style.removeProperty("transform");e.style.removeProperty("transition")});__sp.remove();u.cfg.setup_done||document.getElementById("setup-mod").classList.add("open");y.showImportIfPending()},85*visEls.length+480+100)
        },900)
    }
}
document.addEventListener("DOMContentLoaded", async () => {
    LITE_MODE = document.documentElement.className === "lite-mode";
    await initTranslations();
    const __sv = localStorage.getItem(__MGO_PREF);
    if (!__sv) {
        document.getElementById("__hub").style.display = "flex";
        r();
        return;
    }
    __initApp();
});