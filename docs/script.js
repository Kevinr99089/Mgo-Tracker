const LANG_MAP = {
  fr: 'french',
  en: 'english'
};

const LANG_CODE = (navigator.language || 'en').substring(0, 2).toLowerCase();
const LANG_FILE = LANG_MAP[LANG_CODE] || 'english';

let _translations = {};
const T = (key) => _translations[key] || key;

async function loadLanguage() {
  try {
    const res = await fetch(`${LANG_FILE}.txt`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _translations = await res.json();
  } catch (e) {
    console.warn(`[i18n] Could not load "${LANG_FILE}.txt", falling back to keys.`, e);
    _translations = {};
  }
}

function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

const I18N_HTML_KEYS = new Set(['add_upper']);

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = T(key);
    if(I18N_HTML_KEYS.has(key)) { el.innerHTML = val; } else { el.textContent = val; }
  });
}

const CONST = {
VERSION: "4.08 (Web)",
KEYS: { CFG: "mgo_cfg", USR: "mgo_u_" }
};
let HIST = [];
function Mulberry32(a) {
return function() {
var t = a += 0x6D2B79F5;
t = Math.imul(t ^ (t >>> 15), t | 1);
t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
}
function isSeedShiny(seed) { return Mulberry32(seed)() < 0.01; }
function validateAmbiance(cfg) {
const maxValid = isSeedShiny(cfg.seed) ? 4 : 3;
if(cfg.ambiance == null || typeof cfg.ambiance !== 'number' || cfg.ambiance < 0 || !Number.isInteger(cfg.ambiance)) {
  cfg.ambiance = 0;
  return null;
}
if(cfg.ambiance > maxValid) {
  if(cfg.ambiance === 4 && !isSeedShiny(cfg.seed)) {
    cfg.ambiance = 0;
    return 'cheat_shiny';
  }
  cfg.ambiance = 0;
  return 'cheat_easter';
}
return null;
}
const State = {
cfg: { albums: 24, mode: "cross", gold_ids: [], gold_ex: [], hidden: [], printHidden: [], setup_done: false, ambiance: 0, seed: Date.now(), usersList: [] },
usr: {},
_dupesCache: null,
_goldCache: null,
_saveTimers: {},
getGoldSet() {
if(this._goldCache) return this._goldCache;
this._goldCache = new Set(this.cfg.gold_ids);
return this._goldCache;
},
invalidateGold() { this._goldCache = null; },
getDupesSet() {
if(this._dupesCache) return this._dupesCache;
const s = new Set();
Object.values(this.usr).forEach(u => {
  if(!u || !u.state) return;
  Object.entries(u.state).forEach(([k,v]) => { if(v===2) s.add(+k); });
});
this._dupesCache = s;
return s;
},
invalidateDupes() { this._dupesCache = null; },
debounceSave(id) {
clearTimeout(this._saveTimers[id]);
this._saveTimers[id] = setTimeout(() => this.saveU(id), 400);
},
init() {
const c = localStorage.getItem(CONST.KEYS.CFG);
if(c) {
try { 
const parsed = JSON.parse(c);
this.cfg = {...this.cfg, ...parsed}; 
if(!this.cfg.seed) this.cfg.seed = Date.now();
} catch(e){ console.error("Config corrupt", e); }
}
if(!this.cfg.usersList || this.cfg.usersList.length === 0) {
  this.cfg.usersList = [`${T('player')} 1`];
}
this.cfg.usersList.forEach(s => {
const id = s.replace(/\s/g, "");
const d = localStorage.getItem(CONST.KEYS.USR + id);
if(d) {
  try {
    const parsed = JSON.parse(d);
    this.usr[id] = { state: {}, nums: {}, ...parsed };
    if(!this.usr[id].state) this.usr[id].state = {};
    if(!this.usr[id].nums) this.usr[id].nums = {};
  } catch(e) {
    console.error("User data corrupt for", id, e);
    this.usr[id] = { state: {}, nums: {} };
  }
} else {
  this.usr[id] = { state: {}, nums: {} };
}
});
},
saveC() { localStorage.setItem(CONST.KEYS.CFG, JSON.stringify(this.cfg)); },
saveU(id) { if(this.usr[id]) localStorage.setItem(CONST.KEYS.USR + id, JSON.stringify(this.usr[id])); },
setGold(id, isG) {
const s = new Set(this.cfg.gold_ids);
isG ? s.add(id) : s.delete(id);
this.cfg.gold_ids = Array.from(s); 
this.invalidateGold();
this.saveC();
},
updateCell(u, c, val, isNum = false) {
if(!this.usr[u]) return;
if(!this.usr[u].state) this.usr[u].state = {};
if(!this.usr[u].nums) this.usr[u].nums = {};
if(isNum) {
if(!val) delete this.usr[u].nums[c];
else this.usr[u].nums[c] = val;
} else {
const prev = this.usr[u].state[c] || 0;
if(val === 0) delete this.usr[u].state[c];
else this.usr[u].state[c] = val;
if(prev === 2 || val === 2) this.invalidateDupes();
}
this.debounceSave(u);
},
resetUser(u) { if(this.usr[u]) { this.usr[u].state = {}; this.usr[u].nums = {}; this.invalidateDupes(); this.saveU(u); } }
};

window.UserManager = {
tempUsers: [],
_dragSrc: null,
_touchSrc: null,
_touchClone: null,
_touchStartY: 0,
open() {
  this.tempUsers = [...State.cfg.usersList];
  this.render();
  document.getElementById('mod-users').classList.add('open');
},
close() {
  document.getElementById('mod-users').classList.remove('open');
},
render() {
  const c = document.getElementById('users-edit-list');
  c.innerHTML = "";
  this.tempUsers.forEach((u, i) => {
      const row = document.createElement('div');
      row.className = 'um-row';
      row.draggable = true;
      row.dataset.idx = i;
      const safeU = esc(u);
      row.innerHTML = `
          <span class="um-handle" title="Glisser pour réordonner">⠿</span>
          <input type="text" class="g-inp um-inp" style="flex:1;border:1px solid var(--glass-b);border-radius:6px;padding:8px;color:#fff" value="${safeU}" data-idx="${i}">
          <button class="mini-btn danger um-del" data-idx="${i}" ${this.tempUsers.length<=1?'disabled':''}>×</button>
      `;
      row.addEventListener('dragstart', e => this._onDragStart(e, row));
      row.addEventListener('dragover',  e => this._onDragOver(e, row));
      row.addEventListener('dragleave', e => row.classList.remove('um-drag-over'));
      row.addEventListener('drop',      e => this._onDrop(e, row));
      row.addEventListener('dragend',   e => this._onDragEnd());
      const handle = row.querySelector('.um-handle');
      handle.addEventListener('touchstart', e => this._onTouchStart(e, row), {passive: false});
      handle.addEventListener('touchmove',  e => this._onTouchMove(e), {passive: false});
      handle.addEventListener('touchend',   e => this._onTouchEnd(e), {passive: false});
      row.querySelector('.um-inp').addEventListener('change', ev => this.update(+ev.target.dataset.idx, ev.target.value));
      row.querySelector('.um-del').addEventListener('click', ev => this.remove(+ev.target.dataset.idx));
      c.appendChild(row);
  });
},
_onDragStart(e, row) {
  this._dragSrc = row;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', row.dataset.idx);
  setTimeout(() => row.classList.add('um-dragging'), 0);
},
_onDragOver(e, row) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if(row !== this._dragSrc) {
      document.querySelectorAll('.um-row').forEach(r => r.classList.remove('um-drag-over'));
      row.classList.add('um-drag-over');
  }
},
_onDrop(e, row) {
  e.preventDefault();
  if(row === this._dragSrc) return;
  const from = +this._dragSrc.dataset.idx;
  const to   = +row.dataset.idx;
  const moved = this.tempUsers.splice(from, 1)[0];
  this.tempUsers.splice(to, 0, moved);
  this.render();
},
_onDragEnd() {
  document.querySelectorAll('.um-row').forEach(r => {
      r.classList.remove('um-dragging', 'um-drag-over');
  });
  this._dragSrc = null;
},
_onTouchStart(e, row) {
  e.preventDefault();
  this._touchSrc = row;
  this._touchStartY = e.touches[0].clientY;
  const clone = row.cloneNode(true);
  clone.classList.add('um-touch-clone');
  clone.style.top = row.getBoundingClientRect().top + 'px';
  document.body.appendChild(clone);
  this._touchClone = clone;
  row.classList.add('um-dragging');
},
_onTouchMove(e) {
  if(!this._touchClone) return;
  e.preventDefault();
  const y = e.touches[0].clientY;
  this._touchClone.style.top = (y - 22) + 'px';
  const els = document.elementsFromPoint(e.touches[0].clientX, y);
  const target = els.find(el => el.classList.contains('um-row') && el !== this._touchSrc);
  document.querySelectorAll('.um-row').forEach(r => r.classList.remove('um-drag-over'));
  if(target) target.classList.add('um-drag-over');
},
_onTouchEnd(e) {
  if(!this._touchClone) return;
  const y = e.changedTouches[0].clientY;
  const els = document.elementsFromPoint(e.changedTouches[0].clientX, y);
  const target = els.find(el => el.classList.contains('um-row') && el !== this._touchSrc);
  this._touchClone.remove();
  this._touchClone = null;
  if(target) {
      const from = +this._touchSrc.dataset.idx;
      const to   = +target.dataset.idx;
      const moved = this.tempUsers.splice(from, 1)[0];
      this.tempUsers.splice(to, 0, moved);
  }
  this.render();
  this._touchSrc = null;
},
update(idx, val) {
  this.tempUsers[idx] = val.trim() || `${T('player')} ${idx+1}`;
},
add() {
  this.tempUsers.push(`${T('player')} ${this.tempUsers.length + 1}`);
  this.render();
},
remove(idx) {
  if(this.tempUsers.length > 1) {
      this.tempUsers.splice(idx, 1);
      this.render();
  }
},
save() {
  const oldList = State.cfg.usersList;
  const oldPrimaryUid = oldList[0] ? oldList[0].replace(/\s/g, "") : null;
  const newPrimaryUid = this.tempUsers[0] ? this.tempUsers[0].replace(/\s/g, "") : null;
  if (oldPrimaryUid && newPrimaryUid && oldPrimaryUid !== newPrimaryUid) {
      if(State.usr[oldPrimaryUid]) {
          State.usr[oldPrimaryUid].nums = {};
          State.saveU(oldPrimaryUid);
      }
  }
  this.tempUsers.forEach((name) => {
      const uid = name.replace(/\s/g, "");
      if(!State.usr[uid]) {
          State.usr[uid] = { state: {}, nums: {} };
      }
  });
  State.cfg.usersList = [...this.tempUsers];
  State.saveC();
  this.close();
  UI.renderMenus();
  UI.renderMain();
  UI.showToast(T('players_updated'));
}
};

let _lavaRAF = null;
let _lavaCleanup = null;
function _lavaStop() {
  if(_lavaRAF) { cancelAnimationFrame(_lavaRAF); _lavaRAF = null; }
  if(_lavaCleanup) { _lavaCleanup(); _lavaCleanup = null; }
}
const UI = {
els: { app: document.getElementById('gen-cards'), toast: document.getElementById('toast'), bg: document.getElementById('ambient-bg') },
showToast(msg) {
this.els.toast.textContent = msg;
this.els.toast.classList.add('show');
clearTimeout(this._toastTimer);
this._toastTimer = setTimeout(() => this.els.toast.classList.remove('show'), 2000);
},
renderAmbiance() {
_lavaStop();
this.els.bg.innerHTML = "";
const rand = Mulberry32(State.cfg.seed);
const mode = State.cfg.ambiance || 0;
const colors = ['#4f46e5','#c026d3','#06b6d4','#f472b6','#fbbf24'];

if(mode === 4) {
  this.els.bg.innerHTML = `
  <div class="shiny-screen">
    <div class="shiny-deck">
      <div class="shiny-c shiny-c1"></div>
      <div class="shiny-c shiny-c2">★</div>
      <div class="shiny-c shiny-c3"></div>
    </div>
    <div class="shiny-logo">MGO <em>Tracker</em><span>.</span></div>
  </div>`;
  return;
}

if(mode === 0) {
  const count = 7;
  for(let i=0;i<count;i++) {
    const d = document.createElement('div');
    d.className = 'f-obj f-orb';
    const w = 45 + rand() * 40;
    const col = colors[Math.floor(rand() * colors.length)];
    d.style.cssText = `
      width:${w}vw; height:${w}vw;
      top:${rand()*90-5}%;
      left:${rand()*90-5}%;
      background:radial-gradient(circle at 50% 50%, ${col} 0%, transparent 68%);
    `;
    d.style.setProperty('--d',  (18 + rand()*16) + 's');
    d.style.setProperty('--tx', (rand()*18-9)    + 'vw');
    d.style.setProperty('--ty', (rand()*18-9)    + 'vh');
    d.style.setProperty('--r0', (rand()*30-15)   + 'deg');
    d.style.setProperty('--r1', (rand()*30-15)   + 'deg');
    this.els.bg.appendChild(d);
  }
  return;
}

if(mode === 1) {
  const cardGrads = [
    'linear-gradient(145deg,#3b41d8,#6468f5)',
    'linear-gradient(145deg,#c77b10,#f0aa22)',
    'linear-gradient(145deg,#b8233b,#eb3a5f)',
    'linear-gradient(145deg,#0e766e,#14b8a6)',
    'linear-gradient(145deg,#7c3aed,#a855f7)',
    'linear-gradient(145deg,#065f86,#0ea5e9)',
  ];
  const count = 7;
  for(let i=0;i<count;i++) {
    const d = document.createElement('div');
    d.className = 'f-obj f-card';
    const w = 18 + rand()*22;
    const ar = 0.65 + rand()*0.25;
    const initRot = (rand()*60-30);
    d.style.cssText = `
      width:${w}vw; height:${w/ar}vw;
      top:${rand()*85-5}%;
      left:${rand()*85-5}%;
      background:${cardGrads[Math.floor(rand()*cardGrads.length)]};
    `;
    d.style.setProperty('--d',  (20 + rand()*18) + 's');
    d.style.setProperty('--tx', (rand()*20-10)   + 'vw');
    d.style.setProperty('--ty', (rand()*20-10)   + 'vh');
    d.style.setProperty('--r0', initRot           + 'deg');
    d.style.setProperty('--r1', (initRot + rand()*40-20) + 'deg');
    this.els.bg.appendChild(d);
  }
  return;
}

if(mode === 2) {
  const count = 9;
  for(let i=0;i<count;i++) {
    const d = document.createElement('div');
    d.className = 'f-obj f-neon';
    const w = 8 + rand()*18;
    const h = rand() > 0.5 ? w : w*(0.5+rand()*0.8);
    const col = colors[Math.floor(rand()*colors.length)];
    const initRot = rand()>0.5 ? 45 : (rand()*30-15);
    d.style.cssText = `
      width:${w}vw; height:${h}vw;
      top:${rand()*88}%;
      left:${rand()*88}%;
      border-color:${col};
    `;
    d.style.setProperty('--glow', col);
    d.style.setProperty('--d',   (14 + rand()*18) + 's');
    d.style.setProperty('--pd',  (2.5 + rand()*2) + 's');
    d.style.setProperty('--tx',  (rand()*26-13)   + 'vw');
    d.style.setProperty('--ty',  (rand()*26-13)   + 'vh');
    d.style.setProperty('--r0',  initRot           + 'deg');
    d.style.setProperty('--r1',  (initRot + rand()*60-30) + 'deg');
    if(rand() < 0.30) {
      d.classList.add('f-neon-dying');
      d.style.setProperty('--fd', (3 + rand()*5) + 's');
    }
    this.els.bg.appendChild(d);
  }
  return;
}

if(mode === 3) {
  const wrap = document.createElement('div');
  wrap.className = 'lava-wrap';
  const cvs = document.createElement('canvas');
  cvs.className = 'lava-canvas';
  wrap.appendChild(cvs);
  this.els.bg.appendChild(wrap);

  const ctx = cvs.getContext('2d');
  let W, H, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = wrap.clientWidth;
    H = wrap.clientHeight;
    cvs.width  = W * dpr * 0.5;
    cvs.height = H * dpr * 0.5;
    cvs.style.width  = W + 'px';
    cvs.style.height = H + 'px';
    ctx.scale(dpr * 0.5, dpr * 0.5);
  }
  resize();

  const lavaColors = [];
  const nCol = 2 + Math.floor(rand() * 2);
  const shuffled = [...colors].sort(() => rand() - 0.5);
  for(let i = 0; i < nCol; i++) lavaColors.push(shuffled[i % shuffled.length]);

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return [r, g, b];
  }
  const rgbColors = lavaColors.map(hexToRgb);

  const BLOB_COUNT = 10;
  const blobs = [];
  for(let i = 0; i < BLOB_COUNT; i++) {
    const r = 35 + rand() * 55;
    const startY = rand() * H;
    blobs.push({
      x: rand() * W,
      y: startY,
      vx: 0, vy: 0,
      r: r,
      baseR: r,
      col: rgbColors[Math.floor(rand() * rgbColors.length)],
      phase: rand() * Math.PI * 2,
      freq: 0.08 + rand() * 0.12,
      drift: (rand() - 0.5) * 0.06,
      temp: 1 - (startY / H),
      tempInertia: 0.12 + rand() * 0.18,
    });
  }

  let pointer = { x: -9999, y: -9999, active: false };
  let _wrapRect = null;

  function onPointerDown(e) {
    const t = e.touches ? e.touches[0] : e;
    _wrapRect = wrap.getBoundingClientRect();
    pointer.x = t.clientX - _wrapRect.left;
    pointer.y = t.clientY - _wrapRect.top;
    pointer.active = true;
  }
  function onPointerMove(e) {
    if(!pointer.active || !_wrapRect) return;
    const t = e.touches ? e.touches[0] : e;
    pointer.x = t.clientX - _wrapRect.left;
    pointer.y = t.clientY - _wrapRect.top;
  }
  function onPointerUp() { pointer.active = false; _wrapRect = null; }

  wrap.style.pointerEvents = 'auto';
  wrap.addEventListener('mousedown',  onPointerDown);
  wrap.addEventListener('mousemove',  onPointerMove);
  wrap.addEventListener('mouseup',    onPointerUp);
  wrap.addEventListener('mouseleave', onPointerUp);
  wrap.addEventListener('touchstart', onPointerDown, {passive:true});
  wrap.addEventListener('touchmove',  onPointerMove, {passive:true});
  wrap.addEventListener('touchend',   onPointerUp);
  wrap.addEventListener('touchcancel',onPointerUp);

  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ctx.setTransform(1,0,0,1,0,0);
      resize();
      scaleFactor = dpr * 0.5;
      blobs.forEach(b => {
        b.x = Math.min(b.x, W);
        b.y = Math.min(b.y, H);
      });
    }, 150);
  }
  window.addEventListener('resize', onResize);

  let lastT = 0;
  let scaleFactor = dpr * 0.5;
  const DAMPING = 0.994;
  const BUOYANCY = 6.5;
  const GRAVITY_BIAS = 0.42;
  const WANDER = 1.0;
  const ATTRACT_STRENGTH = 25;
  const ATTRACT_RADIUS = 200;
  function tick(ts) {
    _lavaRAF = requestAnimationFrame(tick);
    const dt = Math.min((ts - lastT) / 1000, 0.05);
    lastT = ts;
    if(dt <= 0) return;

    for(let i = 0; i < BLOB_COUNT; i++) {
      const b = blobs[i];
      const yNorm = b.y / H;

      const envTemp = yNorm;
      b.temp += (envTemp - b.temp) * b.tempInertia * dt;

      b.vy -= (b.temp - GRAVITY_BIAS) * BUOYANCY * dt;

      b.phase += b.freq * dt;
      b.vx += Math.sin(b.phase + i * 1.7) * WANDER * dt;
      b.vx += b.drift * dt * 3;

      if(pointer.active) {
        const dx = pointer.x - b.x;
        const dy = pointer.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy) + 1;
        if(dist < ATTRACT_RADIUS) {
          const strength = (1 - dist / ATTRACT_RADIUS);
          const f = strength * strength * ATTRACT_STRENGTH * dt;
          b.vx += (dx / dist) * f;
          b.vy += (dy / dist) * f;
        }
      }

      for(let j = i+1; j < BLOB_COUNT; j++) {
        const o = blobs[j];
        const dx = o.x - b.x;
        const dy = o.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy) + 1;
        const minDist = (b.r + o.r) * 0.35;
        if(dist < minDist) {
          const push = (minDist - dist) * 0.08 * dt;
          const nx = dx/dist, ny = dy/dist;
          b.vx -= nx * push;
          b.vy -= ny * push;
          o.vx += nx * push;
          o.vy += ny * push;
        }
      }

      b.vx *= DAMPING;
      b.vy *= DAMPING;
      b.x += b.vx;
      b.y += b.vy;

      const margin = b.r * 0.3;
      if(b.x < -margin)  { b.x = -margin; b.vx = Math.abs(b.vx) * 0.3; }
      if(b.x > W+margin) { b.x = W+margin; b.vx = -Math.abs(b.vx) * 0.3; }
      if(b.y < -margin)  { b.y = -margin; b.vy = Math.abs(b.vy) * 0.3; }
      if(b.y > H+margin) { b.y = H+margin; b.vy = -Math.abs(b.vy) * 0.3; }

      b.r = b.baseR + Math.sin(ts * 0.0006 + i * 2.1) * b.baseR * 0.06;
    }

    ctx.setTransform(scaleFactor,0,0,scaleFactor,0,0);
    ctx.clearRect(0, 0, W, H);

    for(let i = 0; i < BLOB_COUNT; i++) {
      const b = blobs[i];
      const [r,g,bv] = b.col;
      const rad = b.r * 1.8;
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, rad);
      grad.addColorStop(0,   `rgba(${r},${g},${bv},0.95)`);
      grad.addColorStop(0.4, `rgba(${r},${g},${bv},0.7)`);
      grad.addColorStop(0.7, `rgba(${r},${g},${bv},0.3)`);
      grad.addColorStop(1,   `rgba(${r},${g},${bv},0)`);
      ctx.beginPath();
      ctx.arc(b.x, b.y, rad, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }
  _lavaRAF = requestAnimationFrame(tick);

  _lavaCleanup = function() {
    wrap.removeEventListener('mousedown',  onPointerDown);
    wrap.removeEventListener('mousemove',  onPointerMove);
    wrap.removeEventListener('mouseup',    onPointerUp);
    wrap.removeEventListener('mouseleave', onPointerUp);
    wrap.removeEventListener('touchstart', onPointerDown);
    wrap.removeEventListener('touchmove',  onPointerMove);
    wrap.removeEventListener('touchend',   onPointerUp);
    wrap.removeEventListener('touchcancel',onPointerUp);
    window.removeEventListener('resize', onResize);
    clearTimeout(resizeTimer);
  };
  return;
}
},
renderMain() {
this.els.app.innerHTML = "";
const alb = State.cfg.albums, half = Math.ceil(alb/2), w = 100/half;
State.cfg.usersList.forEach((name, idx) => {
const uid = name.replace(/\s/g, "");
const isPrimary = (idx === 0);
const btnTxt = State.cfg.mode === 'number' ? '123' : 'XXX';
let modeBtn = "";
if(isPrimary) {
 modeBtn = `<button class="mini-btn" data-action="mode-toggle" style="margin-right:8px;height:24px">${btnTxt}</button>`;
}
let noteHtml = "";
if(isPrimary) {
 const savedNote = esc(State.usr[uid].note || "");
 noteHtml = `<input type="text" class="user-note" placeholder="${esc(T('note_ph'))}" value="${savedNote}" data-uid="${esc(uid)}" onclick="event.stopPropagation()" ondblclick="event.stopPropagation()">`;
}
const primaryClass = isPrimary ? "is-primary" : "";
const numModeClass = (isPrimary && State.cfg.mode === 'number') ? "mode-num" : "";
const safeName = esc(name);
const html = `
<div class="glass-card anim-section ${primaryClass} ${numModeClass}" data-sec="${esc(uid)}">
  <div class="card-header">
      <div class="user-info">
          <div class="user-avatar">
             <div class="ua-inner">
                 <div class="ua-left">
                     <div class="ua-name">${safeName}</div>
                     <div class="ua-percent">0%</div>
                 </div>
                 <div class="ua-stats-col">
                     <div class="ua-top"></div>
                     <div class="ua-bot"></div>
                 </div>
             </div>
          </div>
          <div class="user-name">${safeName}</div>
          ${modeBtn}
          ${noteHtml}
      </div>
      <div class="card-tools"><button class="mini-btn danger" data-action="reset-u">↺</button></div>
  </div>
  <div style="padding:0" data-u="${uid}">
     <div class="grid-scroll">
        <div class="track-row">${this._genRow(1, half, w)}</div>
        <div class="track-row">${this._genRow(half+1, alb-half, w)}</div>
     </div>
  </div>
</div>`;
this.els.app.insertAdjacentHTML('beforeend', html);
});
this.hydrate();
},
_genRow(start, count, w) {
let h = "";
for(let i=0; i<count; i++) h += this._genAlb(start+i, w);
return h;
},
_genAlb(num, w) {
let g = "";
for(let k=0; k<9; k++) {
const cid = ((num-1)*9)+k;
g += `<div class="cell-wrap" data-uid="${cid}" data-st="0">
  <div class="i-dot i-dupe"></div><div class="i-dot i-gold"></div>
  <div class="cell-inner"><span class="t-x">X</span><span class="t-num"></span></div>
</div>`;
}
return `<div class="alb-col" style="width:${w}%"><div class="alb-head">${T('album')} ${num}</div><div class="alb-grid">${g}</div></div>`;
},
hydrate() {
const goldSet = State.getGoldSet();
const globalDupes = State.getDupesSet();
this.els.app.querySelectorAll('.cell-wrap').forEach(el => {
const cid = +el.dataset.uid;
const uid = el.closest('[data-u]')?.dataset.u;
if(!uid || !State.usr[uid]) return;
const st = (State.usr[uid].state && State.usr[uid].state[cid]) || 0;
const num = (State.usr[uid].nums && State.usr[uid].nums[cid]) || "";
const isGold = goldSet.has(cid);
const isDupe = globalDupes.has(cid);
this.updateCardVisuals(el, st, num, isGold, isDupe);
});
this.updateStats();
this.updateVis();
},
updateSingleCell(uid, cid, prevSt) {
const goldSet = State.getGoldSet();
const isGold = goldSet.has(+cid);
const st = (State.usr[uid]?.state?.[cid]) || 0;
const num = (State.usr[uid]?.nums?.[cid]) || "";
const dupeChanged = (prevSt === 2 || st === 2);
if(dupeChanged) {
  const globalDupes = State.getDupesSet();
  const isDupe = globalDupes.has(+cid);
  document.querySelectorAll(`.cell-wrap[data-uid="${cid}"]`).forEach(el => {
    const card = el.closest('[data-u]');
    if(!card) return;
    const u = card.dataset.u;
    const s = (State.usr[u]?.state?.[cid]) || 0;
    const n = (State.usr[u]?.nums?.[cid]) || "";
    this.updateCardVisuals(el, s, n, isGold, isDupe);
  });
} else {
  const card = document.querySelector(`.glass-card[data-sec="${uid}"] [data-u="${uid}"]`);
  if(!card) { this.hydrate(); return; }
  const el = card.querySelector(`.cell-wrap[data-uid="${cid}"]`);
  if(!el) { this.hydrate(); return; }
  const globalDupes = State.getDupesSet();
  this.updateCardVisuals(el, st, num, isGold, globalDupes.has(+cid));
}
this.updateStats();
},
updateCardVisuals(el, st, numStr, isGold, isDupe) {
el.dataset.st = st;
const numSpan = el.querySelector('.t-num');
const numStrSafe = numStr == null ? "" : String(numStr);
if(numSpan.textContent !== numStrSafe) numSpan.textContent = numStrSafe;
if(isGold) el.dataset.bg = "1"; else delete el.dataset.bg;
el.classList.remove('show-gold', 'show-dupe');
if(st === 0) {
if(isGold) el.classList.add('show-gold');
if(isDupe) el.classList.add('show-dupe');
}
},
updateStats() {
const tot = State.cfg.albums * 9;
const goldSet = State.getGoldSet();
const appEl = this.els.app;
appEl.querySelectorAll('.glass-card[data-sec]').forEach(card => {
if(card.id === 'sec-gold') return;
const uid = card.dataset.sec;
const usr = State.usr[uid];
if(!usr) return;
const stateMap = usr.state || {};
let n = 0, g = 0, gt = 0;
for(let cid = 0; cid < tot; cid++) {
  const st = stateMap[cid] || 0;
  const isG = goldSet.has(cid);
  if(st > 0) n++;
  if(isG) { gt++; if(st > 0) g++; }
}
const pct = tot > 0 ? Math.round(n / tot * 100) : 0;
const av = card.querySelector('.user-avatar');
const top = card.querySelector('.ua-top');
const bot = card.querySelector('.ua-bot');
const perc = card.querySelector('.ua-percent');
if(top) top.textContent = `${n}/${tot}`;
if(bot) bot.textContent = `${g}/${gt}`;
if(perc) {
 perc.textContent = `${pct}%`;
 const newColor = pct === 100 ? 'var(--gold)' : pct >= 50 ? '#fb923c' : '#f87171';
      perc.style.color = newColor;
}
if(av) av.style.background = `conic-gradient(var(--ok) ${pct}%, var(--p) 0)`;
});
},
renderGoldEx() {
const c = document.getElementById('gold-list');
c.innerHTML = "";
const frag = document.createDocumentFragment();
State.cfg.gold_ex.forEach((item, idx) => {
const row = document.createElement('div');
row.className = 'gold-row';
row.innerHTML = `<input class="g-inp" data-f="alb" placeholder="${esc(T('album'))}" value="${esc(item.alb || item.album || '')}"><input class="g-inp" data-f="card" placeholder="${esc(T('card'))}" value="${esc(item.card || '')}"><input class="g-inp" data-f="date" placeholder="${esc(T('date'))}" value="${esc(item.date || '')}"><button style="background:0 0;border:none;color:var(--err);font-weight:700;cursor:pointer" data-action="del-gold" data-idx="${idx}">×</button>`;
row.querySelectorAll('input').forEach(i => i.oninput = e => {
  State.cfg.gold_ex[idx][e.target.dataset.f] = e.target.value; State.saveC();
});
frag.appendChild(row);
});
c.appendChild(frag);
},
renderMenus() {
const vList = document.getElementById('view-list'); vList.innerHTML = "";
const pList = document.getElementById('sub-print'); pList.innerHTML = "";
const vFrag = document.createDocumentFragment();
const pFrag = document.createDocumentFragment();
const entries = [...State.cfg.usersList, "Gold"];
entries.forEach(s => {
const id = s==="Gold" ? "Gold" : s.replace(/\s/g, "");
const hide = State.cfg.hidden.includes(id);
const d = document.createElement('div');
d.className="menu-item";
d.innerHTML = `<span>${s}</span><label style="cursor:pointer;display:flex"><input type="checkbox" ${!hide?'checked':''} style="display:none"><div class="switch"></div></label>`;
d.querySelector('input').onchange = e => {
  State.cfg.hidden = e.target.checked ? State.cfg.hidden.filter(x=>x!==id) : [...State.cfg.hidden, id];
  State.saveC(); this.updateVis();
};
vFrag.appendChild(d);
const pd = document.createElement('div');
pd.className = 'menu-item';
pd.style.cssText = 'padding:5px 8px;font-size:0.8rem';
pd.innerHTML = `<span>${s}</span><label style="cursor:pointer;display:flex;align-items:center"><input type="checkbox" class="print-chk" value="${id}" checked style="display:none"><div class="switch" style="transform:scale(0.7);transform-origin:right center"></div></label>`;
pFrag.appendChild(pd);
});
vList.appendChild(vFrag);
const printBtn = document.createElement('button');
printBtn.className = 'mini-btn';
printBtn.dataset.action = 'do-print';
printBtn.style.cssText = 'justify-content:center;background:var(--p);color:#fff;margin-top:5px;width:100%';
printBtn.textContent = T('print_upper');
pFrag.appendChild(printBtn);
pList.appendChild(pFrag);
},
updateVis() {
document.getElementById('main-app').querySelectorAll('.anim-section').forEach(el => {
el.classList.toggle('hidden', State.cfg.hidden.includes(el.dataset.sec));
});
},
renderGoldGrid(containerId) {
const c = document.getElementById(containerId); 
if(!c) return;
c.innerHTML = "";
const alb = State.cfg.albums;
const goldSet = State.getGoldSet();
const rowDiv = document.createElement('div');
rowDiv.className = "g-conf-row";
for(let i=1; i<=alb; i++) {
let cells = "";
for(let k=0; k<9; k++) {
  const uid = ((i-1)*9)+k;
  const active = goldSet.has(uid) ? 'active' : '';
  cells += `<div class="g-cell ${active}" data-uid="${uid}"></div>`;
}
const col = document.createElement('div'); col.className = "g-conf-col";
col.innerHTML = `<span style="font-size:9px;font-weight:700;margin-bottom:2px">${T('album')} ${i}</span><div class="g-conf-grid">${cells}</div>`;
rowDiv.appendChild(col);
}
rowDiv.onclick = (e) => {
const t = e.target;
if(t.classList.contains('g-cell')) {
   const uid = +t.dataset.uid;
   const wasActive = t.classList.contains('active');
   State.setGold(uid, !wasActive);
   t.classList.toggle('active');
}
};
c.appendChild(rowDiv);
}
};
const Actions = {
_lastClickCell: null,
_lastClickTime: 0,
_popovers: null,
_getPopovers() {
  if(!this._popovers) this._popovers = document.querySelectorAll('.popover');
  return this._popovers;
},
handle(e) {
const t = e.target;
const btn = t.closest('[data-action]');
const cell = t.closest('.cell-wrap');
const glass = t.closest('.glass-card');
if(!t.closest('.popover') && !t.closest('.dock')) this._getPopovers().forEach(p=>p.classList.remove('show'));
if(cell && t.tagName !== 'INPUT') {
if(e.type === 'dblclick') { e.stopPropagation(); e.preventDefault(); return; }
const now = Date.now();
const lastCell = Actions._lastClickCell;
const lastTime = Actions._lastClickTime || 0;
if(lastCell === cell && (now - lastTime) < 300) { Actions._lastClickCell = null; return; }
Actions._lastClickCell = cell;
Actions._lastClickTime = now;
const glassCard = glass;
const isPrimary = glassCard && glassCard.classList.contains('is-primary');
const uid = cell.closest('[data-u]')?.dataset.u;
const cid = +cell.dataset.uid;
if(State.cfg.mode === 'number' && isPrimary) {
  e.stopPropagation();
  const inner = cell.querySelector('.cell-inner'); inner.innerHTML = "";
  const inp = document.createElement('input'); 
  inp.className = "cell-input"; inp.type="tel";
  inp.value = State.usr[uid].nums[cid] || "";
  inp.onblur = () => {
      const trimmed = inp.value.trim();
      State.updateCell(uid, cid, trimmed, true);
      UI.updateSingleCell(uid, cid, -1);
  };
  inp.onkeydown = x => { if(x.key==='Enter') inp.blur() };
  inner.appendChild(inp);
  setTimeout(() => { try { inp.focus(); } catch(_){} }, 50);
  return;
}
const cur = State.usr[uid].state[cid] || 0;
const nxt = (cur + 1) % 3;
HIST.push({u:uid, c:cid, v:cur}); if(HIST.length>50) HIST.shift();
State.updateCell(uid, cid, nxt);
UI.updateSingleCell(uid, cid, cur);
return;
}
if(glass && e.type === 'dblclick' && !btn && !cell) {
const isExpanded = glass.classList.contains('expanded');

if(!isExpanded) {
  glass.classList.add('transitioning');
  glass.classList.add('expanded');
  setTimeout(() => {
    glass.classList.remove('transitioning');
    glass.classList.add('blur-active');
  }, 420);
} else {
  glass.classList.remove('blur-active');
  glass.classList.add('blur-out');
  setTimeout(() => {
    glass.classList.remove('blur-out');
    glass.classList.add('transitioning');
    glass.classList.remove('expanded');
    setTimeout(() => glass.classList.remove('transitioning'), 420);
  }, 200);
}
return;
}
if(!btn) return;
e.stopPropagation();
const act = btn.dataset.action;
const actionMap = {
'toggle-menu': () => document.getElementById('pop-menu').classList.toggle('show'),
'toggle-view': () => document.getElementById('pop-view').classList.toggle('show'),
'open-users': () => window.UserManager.open(),
'close-users': () => window.UserManager.close(),
'add-user-row': () => window.UserManager.add(),
'save-users': () => window.UserManager.save(),
'undo': () => {
  const last = HIST.pop();
  if(last) { State.updateCell(last.u, last.c, last.v); UI.hydrate(); UI.showToast(T('undone')); }
},
'mode-toggle': () => {
  State.cfg.mode = State.cfg.mode === 'number' ? 'cross' : 'number';
  State.saveC(); 
  UI.renderMain();
},
'cycle-ambiance': () => {
  const rng = Mulberry32(State.cfg.seed);
  const isShiny = rng() < 0.01;
  const maxModes = isShiny ? 5 : 4;
  State.cfg.ambiance = (State.cfg.ambiance + 1) % maxModes;
  State.saveC();
  UI.renderAmbiance();
  const names = [T('amb_0'), T('amb_1'), T('amb_2'), T('amb_3'), T('amb_4')];
  UI.showToast(names[State.cfg.ambiance]);
},
'reset-u': () => {
  const u = btn.closest('.glass-card').dataset.sec;
  if(confirm(T('reset_board_q'))) { State.resetUser(u); UI.hydrate(); UI.showToast(T('reset_done')); }
},
'reset-all': () => { 
  if(confirm(T('reset_warn1'))) {
      const keepUsers = confirm(T('reset_warn2'));
      let oldUsers = keepUsers ? [...State.cfg.usersList] : [`${T('player')} 1`];
      let startAmb = State.cfg.ambiance;
      HIST.length = 0;
      localStorage.clear();
      const newSeed = Date.now();
      const freshConfig = { 
          albums: 24, mode: "cross", gold_ids: [], gold_ex: [], hidden: [], printHidden: [],
          setup_done: false, ambiance: startAmb, seed: newSeed, usersList: oldUsers
      };
      localStorage.setItem(CONST.KEYS.CFG, JSON.stringify(freshConfig));
      location.reload(); 
  }
},
'open-gold-mod': () => { UI.renderGoldGrid('gold-grid-ctn'); document.getElementById('mod-gold').classList.add('open'); },
'close-gold': () => { document.getElementById('mod-gold').classList.remove('open'); UI.hydrate(); },
'add-gold-row': () => { State.cfg.gold_ex.push({alb:"",card:"",date:""}); State.saveC(); UI.renderGoldEx(); },
'del-gold': () => { if(confirm(T('delete_q'))) { State.cfg.gold_ex.splice(+btn.dataset.idx, 1); State.saveC(); UI.renderGoldEx(); } },
'toggle-print-sub': () => { const s = document.getElementById('sub-print'); s.style.display = s.style.display==='none'?'flex':'none'; },
'do-print': () => {
  const vals = new Set(Array.from(document.querySelectorAll('.print-chk:checked')).map(x=>x.value));
  document.querySelectorAll('.glass-card').forEach(c => {
    c.classList.toggle('print-hidden', !vals.has(c.dataset.sec));
  });
  window.print();
},
'save-file': () => {
  const blob = new Blob([JSON.stringify({version: CONST.VERSION, config:State.cfg, users:State.usr})], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MGO_Backup_V${CONST.VERSION}.json`; 
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  UI.showToast(T('file_dl'));
},
'open-share': () => {
  document.getElementById('pop-menu').classList.remove('show');
  Share.openModal();
},
'close-share': () => {
  document.getElementById('mod-share').classList.remove('open');
},
'copy-share-link': () => {
  const field = document.getElementById('share-url-field');
  navigator.clipboard.writeText(field.value).then(() => {
    const btn = document.getElementById('share-copy-btn');
    const orig = btn.innerHTML;
    btn.innerHTML = T('share_copied');
    btn.style.background = 'var(--ok)';
    setTimeout(() => { btn.innerHTML = orig; btn.style.background = 'var(--p)'; }, 2000);
  }).catch(() => {
    field.select();
    document.execCommand('copy');
    UI.showToast(T('share_copied'));
  });
},
'save': () => actionMap['save-file'](),
'load': () => {
  const fi = document.createElement('input'); fi.type="file"; fi.accept=".json";
  fi.onchange = ev => {
      const r = new FileReader();
      r.onload = le => {
          try { 
             const d = JSON.parse(le.target.result); 
             if(d.config && d.users) {
                 State.cfg = d.config; 
                 if(!State.cfg.usersList) {
                     State.cfg.usersList = Object.keys(d.users);
                 }
                 if(!State.cfg.gold_ids) State.cfg.gold_ids = [];
                 if(!State.cfg.gold_ex) State.cfg.gold_ex = [];
                 if(!State.cfg.hidden) State.cfg.hidden = [];
                 if(!State.cfg.printHidden) State.cfg.printHidden = [];
                 Object.keys(d.users).forEach(k => {
                     if(!d.users[k].state) d.users[k].state = {};
                     if(!d.users[k].nums) d.users[k].nums = {};
                 });
                 State.usr = d.users; 
                 if(State.cfg.setup_done === undefined) State.cfg.setup_done = true;
                 HIST.length = 0;
                 State.saveC(); 
                 Object.keys(d.users).forEach(k=>State.saveU(k)); 
                 location.reload(); 
             } else { alert(T('file_invalid')); }
          } catch(x){ alert(T('file_err')); }
      };
      r.readAsText(ev.target.files[0]);
  };
  fi.click();
}
};
if(actionMap[act]) actionMap[act]();
}
};

const SetupWizard = {
init() {
const sAlb = document.getElementById('s-alb');
const sVal = document.getElementById('s-alb-val');
UI.renderGoldGrid('setup-gold-grid');
sAlb.oninput = (e) => {
  sVal.textContent = e.target.value;
  State.cfg.albums = +e.target.value;
  State.saveC();
  UI.renderGoldGrid('setup-gold-grid');
};
document.getElementById('btn-start-season').onclick = () => {
  State.cfg.setup_done = true;
  State.saveC();
  document.getElementById('setup-mod').classList.remove('open');
  UI.renderMenus();
  UI.renderMain(); 
  UI.showToast(T('good_season'));
};
}
};

const Share = {
  _selected: null,
  openModal() {
    this._selected = null;
    const list = document.getElementById('share-player-list');
    list.innerHTML = '';
    document.getElementById('share-link-section').style.display = 'none';
    State.cfg.usersList.forEach(name => {
      const id = name.replace(/\s/g, '');
      const btn = document.createElement('button');
      btn.className = 'mini-btn';
      btn.style.cssText = 'width:100%;justify-content:flex-start;padding:12px 16px;font-size:0.95rem;transition:0.2s';
      btn.innerHTML = `👤 ${esc(name)}`;
      btn.onclick = () => {
        list.querySelectorAll('.mini-btn').forEach(b => { b.style.background=''; b.style.color=''; b.style.borderColor=''; });
        btn.style.background = 'var(--p)';
        btn.style.color = '#fff';
        btn.style.borderColor = 'var(--p)';
        this._selected = name;
        this._generateLink(name, id);
      };
      list.appendChild(btn);
    });
    document.getElementById('mod-share').classList.add('open');
  },
  async _generateLink(name, id) {
    const userData = State.usr[id] || { state: {}, nums: {} };
    const payload = { name, data: userData };
    const json = JSON.stringify(payload);
    let encoded;
    try {
      const bytes = new TextEncoder().encode(json);
      const cs = new CompressionStream('gzip');
      const writer = cs.writable.getWriter();
      writer.write(bytes);
      writer.close();
      const buf = await new Response(cs.readable).arrayBuffer();
      let binary = '';
      new Uint8Array(buf).forEach(b => binary += String.fromCharCode(b));
      encoded = 'z:' + btoa(binary);
    } catch(e) {
      encoded = btoa(unescape(encodeURIComponent(json)));
    }
    const base = 'https://kevinr99089.github.io/Mgo-Tracker/';
    const url = `${base}#share:${encoded}`;
    document.getElementById('share-url-field').value = url;
    const sec = document.getElementById('share-link-section');
    sec.style.display = 'flex';
  },
  async checkImport() {
    const hash = window.location.hash;
    if (!hash.startsWith('#share:')) return;
    const encoded = hash.slice(7);
    try {
      let json;
      if (encoded.startsWith('z:')) {
        const binary = atob(encoded.slice(2));
        const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
        const ds = new DecompressionStream('gzip');
        const writer = ds.writable.getWriter();
        writer.write(bytes);
        writer.close();
        const buf = await new Response(ds.readable).arrayBuffer();
        json = new TextDecoder().decode(buf);
      } else {
        json = decodeURIComponent(escape(atob(encoded)));
      }
      const payload = JSON.parse(json);
      if (!payload.name || !payload.data) return;
      window.location.hash = '';
      history.replaceState(null, '', window.location.pathname + window.location.search);
      this._pendingImport = payload;
      document.getElementById('import-name').textContent = `👤 ${payload.name}`;
      const stateCount = Object.values(payload.data.state || {}).filter(v => v === 1).length;
      const dupeCount = Object.values(payload.data.state || {}).filter(v => v === 2).length;
      document.getElementById('import-stats').textContent =
        `${stateCount} carte(s) cochée(s) · ${dupeCount} doublon(s)`;
      document.getElementById('mod-import').classList.add('open');
    } catch(e) {
      console.error('Share import error', e);
    }
  },
  confirmImport() {
    const p = this._pendingImport;
    if (!p) return;
    const id = p.name.replace(/\s/g, '');
    if (!State.cfg.usersList.includes(p.name)) {
      State.cfg.usersList.push(p.name);
      State.saveC();
    }
    State.usr[id] = { state: {}, nums: {}, ...p.data };
    State.saveU(id);
    this._pendingImport = null;
    document.getElementById('mod-import').classList.remove('open');
    UI.showToast(`✅ ${p.name} importé !`);
    setTimeout(() => location.reload(), 900);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
await loadLanguage();
applyTranslations();
State.init();
Share.checkImport();
document.getElementById('btn-import-confirm').onclick = () => Share.confirmImport();
document.getElementById('btn-import-cancel').onclick = () => {
  Share._pendingImport = null;
  document.getElementById('mod-import').classList.remove('open');
};
const sl = document.getElementById('sl-alb');
sl.value = State.cfg.albums; 
document.getElementById('lbl-alb').textContent = State.cfg.albums;
let deb;
sl.oninput = e => { 
document.getElementById('lbl-alb').textContent = e.target.value; 
clearTimeout(deb);
deb = setTimeout(() => {
State.cfg.albums = +e.target.value; 
State.invalidateGold();
State.saveC(); 
UI.renderMain();
}, 300);
};
UI.renderMain();
UI.renderGoldEx();
UI.renderMenus();
const _cheatMsg = validateAmbiance(State.cfg);
if(_cheatMsg) { State.saveC(); }
UI.renderAmbiance();
if(_cheatMsg) { setTimeout(() => UI.showToast(T(_cheatMsg)), 500); }
else if(State.cfg.ambiance === 4) UI.showToast(T('shiny_season'));
const boundHandler = Actions.handle.bind(Actions);
document.body.addEventListener('click', boundHandler);
document.body.addEventListener('dblclick', boundHandler);
let _noteDeb;
document.body.addEventListener('input', (e) => {
if(e.target.classList.contains('user-note')) {
const uid = e.target.dataset.uid;
if(State.usr[uid]) {
   const val = e.target.value;
   if(!val) delete State.usr[uid].note;
   else State.usr[uid].note = val;
   clearTimeout(_noteDeb);
   _noteDeb = setTimeout(() => State.saveU(uid), 400);
}
}
});
SetupWizard.init();

const ambBg   = document.getElementById('ambient-bg');
const splash  = document.getElementById('splash');

requestAnimationFrame(() => requestAnimationFrame(() => {
  ambBg.style.opacity = '1';
}));

setTimeout(() => {

  splash.style.transition = 'opacity 0.4s ease, visibility 0.4s ease';
  splash.style.opacity     = '0';
  splash.style.visibility  = 'hidden';
  splash.style.pointerEvents = 'none';

  const allCards     = [...document.querySelectorAll('.anim-section')];
  const visibleCards = allCards.filter(c => !c.classList.contains('hidden'));

  allCards.forEach(c => {
    c.style.opacity    = '0';
    c.style.transform  = 'translateY(22px)';
    c.style.transition = 'none';
  });

  const STAGGER    = 85;
  const ANIM_DUR   = 480;
  const EASE_CARD  = 'cubic-bezier(0.22, 1, 0.36, 1)';

  visibleCards.forEach((card, i) => {
    setTimeout(() => {
      card.style.transition = `opacity ${ANIM_DUR}ms ${EASE_CARD}, transform ${ANIM_DUR}ms ${EASE_CARD}`;
      card.style.opacity    = '1';
      card.style.transform  = 'translateY(0)';
    }, i * STAGGER);
  });

  const cleanupDelay = visibleCards.length * STAGGER + ANIM_DUR + 100;

  setTimeout(() => {
    allCards.forEach(c => {
      c.style.removeProperty('opacity');
      c.style.removeProperty('transform');
      c.style.removeProperty('transition');
    });
    splash.remove();
    if (!State.cfg.setup_done) {
      document.getElementById('setup-mod').classList.add('open');
    }
  }, cleanupDelay);

}, 900);
});