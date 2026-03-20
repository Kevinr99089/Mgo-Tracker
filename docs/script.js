const i18n = {
en: {
  saved: "Saved!", new_season: "New Season", setup_board: "Set up your board to start.",
  manage_list: "👥 Manage player list", num_albums: "Number of Albums:", gold_cards: "Gold Cards",
  click_activate: "(Click to activate)", start_season: "START SEASON", menu: "Menu",
  undo: "Undo", gold_setup: "Gold Setup", view: "View", albums: "Albums:",
  ambiance: "Ambiance", change: "🎲 CHANGE", manage_players: "👥 Manage players",
  print: "🖨️ Print", save_btn: "💾 Save", load_btn: "📂 Load", reset_all: "🗑️ Reset All",
  display: "Display", gold_conf: "👑 GOLD Setup", close: "CLOSE",
  click_gold: "Click a cell to set a GOLD card.",
  main_player_info: "The first player in the list is the main player (Notes and Number Board). Numbers are reset if the first place changes.",
  add_player: "+ Add a player", save_upper: "SAVE", gold_trades: "Gold Trades",
  add_upper: "<b>+</b> ADD", album: "Album", card: "Card", date: "Date", player: "Player",
  note_ph: "Note...", undone: "Undone", reset_done: "Reset done",
  reset_warn1: "⚠ DO YOU REALLY WANT TO RESET EVERYTHING?\n\nThis will erase all data and start the new season wizard.",
  reset_warn2: "Do you want to keep the current player list?\n\n[OK] = Keep player list (Boards reset to zero)\n[Cancel] = Create a new list",
  delete_q: "Delete?", print_upper: "PRINT", file_dl: "File downloaded", file_invalid: "Invalid file",
  file_err: "File read error", good_season: "Have a great season!", shiny_season: "✨ SHINY SEASON! ✨",
  players_updated: "Players updated", amb_0: "Cosmic Orbs", amb_1: "Floating Cards",
  amb_2: "Neon Frames", amb_3: "✨ SPECIAL ✨", reset_board_q: "Reset this player's board?"
},
fr: {
  saved: "Sauvegardé !", new_season: "Nouvelle Saison", setup_board: "Configurez votre tableau pour commencer.",
  manage_list: "👥 Gérer la liste des joueurs", num_albums: "Nombre d'Albums:", gold_cards: "Cartes Or",
  click_activate: "(Cliquez pour activer)", start_season: "LANCER LA SAISON", menu: "Menu",
  undo: "Annuler", gold_setup: "Configurer Or", view: "Afficher", albums: "Albums:",
  ambiance: "Ambiance", change: "🎲 CHANGER", manage_players: "👥 Gérer les joueurs",
  print: "🖨️ Impression", save_btn: "💾 Sauvegarder", load_btn: "📂 Charger", reset_all: "🗑️ Tout Réinitialiser",
  display: "Affichage", gold_conf: "👑 Configuration OR", close: "FERMER",
  click_gold: "Cliquez sur une case pour définir une carte en OR.",
  main_player_info: "Le premier joueur de la liste est le joueur principal (Notes et Tableau à chiffres). Les chiffres sont réinitialisés en cas de changement de première place.",
  add_player: "+ Ajouter un joueur", save_upper: "ENREGISTRER", gold_trades: "Échanges Gold",
  add_upper: "<b>+</b> AJOUTER", album: "Album", card: "Carte", date: "Date", player: "Joueur",
  note_ph: "Note...", undone: "Annulé", reset_done: "Reset effectué",
  reset_warn1: "⚠ VOULEZ-VOUS VRAIMENT TOUT RÉINITIALISER ?\n\nCela va effacer toutes les données et démarrer l'assistant de nouvelle saison.",
  reset_warn2: "Voulez-vous conserver la liste actuelle des joueurs ?\n\n[OK] = Conserver la liste des joueurs (Tableaux remis à zéro)\n[Annuler] = Créer une nouvelle liste",
  delete_q: "Supprimer ?", print_upper: "IMPRIMER", file_dl: "Fichier téléchargé", file_invalid: "Fichier invalide",
  file_err: "Erreur lecture fichier", good_season: "Bonne saison !", shiny_season: "✨ SAISON SHINY ! ✨",
  players_updated: "Joueurs mis à jour", amb_0: "Orbes Cosmiques", amb_1: "Cartes Flottantes",
  amb_2: "Cadres Néons", amb_3: "✨ SPÉCIAL ✨", reset_board_q: "Réinitialiser le tableau de ce joueur ?"
}
};
const LANG = (navigator.language || 'en').startsWith('fr') ? 'fr' : 'en';
const T = (key) => i18n[LANG][key] || key;
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
VERSION: "4.02.3",
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
const State = {
cfg: { albums: 24, mode: "cross", gold_ids: [], gold_ex: [], hidden: [], printHidden: [], setup_done: false, ambiance: 0, seed: Date.now(), usersList: [] },
usr: {},
_dupesCache: null,
_saveTimers: {},
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
      row.style.display = "flex"; row.style.gap = "5px";
      const safeU = esc(u);
      row.innerHTML = `
          <button class="mini-btn" onclick="window.UserManager.move(${i}, -1)" ${i===0?'disabled':''}>▲</button>
          <button class="mini-btn" onclick="window.UserManager.move(${i}, 1)" ${i===this.tempUsers.length-1?'disabled':''}>▼</button>
          <input type="text" class="g-inp" style="flex:1;border:1px solid var(--glass-b);border-radius:6px;padding:8px;color:#fff" value="${safeU}" onchange="window.UserManager.update(${i}, this.value)">
          <button class="mini-btn danger" onclick="window.UserManager.remove(${i})" ${this.tempUsers.length<=1?'disabled':''}>×</button>
      `;
      c.appendChild(row);
  });
},
move(idx, dir) {
  const target = idx + dir;
  if(target < 0 || target >= this.tempUsers.length) return;
  const temp = this.tempUsers[idx];
  this.tempUsers[idx] = this.tempUsers[target];
  this.tempUsers[target] = temp;
  this.render();
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
  // Reset nums only if the primary player actually changed
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
const UI = {
els: { app: document.getElementById('gen-cards'), toast: document.getElementById('toast'), bg: document.getElementById('ambient-bg') },
showToast(msg) {
this.els.toast.textContent = msg;
this.els.toast.classList.add('show');
clearTimeout(this._toastTimer);
this._toastTimer = setTimeout(() => this.els.toast.classList.remove('show'), 2000);
},
renderAmbiance() {
this.els.bg.innerHTML = "";
const rand = Mulberry32(State.cfg.seed);
const mode = State.cfg.ambiance || 0;
const colors = ['#4f46e5', '#c026d3', '#06b6d4', '#f472b6', '#fbbf24'];
if(mode === 3) {
this.els.bg.innerHTML = `
<div class="shiny-bg-wrap">
  <div class="deck"><div class="card c1"></div><div class="card c2"></div><div class="card c3">★</div></div>
  <div class="logo">Monopoly GO Tracker<span>.</span></div>
</div>`;
return;
}
if(mode === 0 || mode === 1) {
const count = 6;
for(let i=0; i<count; i++) {
  const d = document.createElement('div');
  d.className = `f-obj ${mode===0 ? 'f-orb' : 'f-card'}`;
  const w = 30 + Math.floor(rand() * 25);
  const h = mode === 0 ? w : w * 1.4;
  d.style.width = w + 'vw';
  d.style.height = h + 'vw';
  d.style.background = colors[Math.floor(rand() * colors.length)];
  d.style.top = (rand() * 80 - 10) + '%';
  d.style.left = (rand() * 80 - 10) + '%';
  d.style.setProperty('--d', (20 + rand() * 15) + 's');
  d.style.setProperty('--tx', (rand() * 20 - 10) + 'vw');
  d.style.setProperty('--ty', (rand() * 20 - 10) + 'vh');
  if(mode === 1) d.style.setProperty('--r2', (rand() * 360) + 'deg');
  this.els.bg.appendChild(d);
}
} else if(mode === 2) {
const count = 12;
for(let i=0; i<count; i++) {
  const d = document.createElement('div');
  d.className = 'f-obj f-neon';
  const s = 10 + Math.floor(rand() * 20);
  const col = colors[Math.floor(rand() * colors.length)];
  d.style.width = s + 'vw';
  d.style.height = s + 'vw';
  d.style.borderColor = col;
  d.style.setProperty('--glow', col);
  d.style.top = (rand() * 90) + '%';
  d.style.left = (rand() * 90) + '%';
  if(rand() > 0.5) d.style.transform = 'rotate(45deg)';
  d.style.setProperty('--d', (15 + rand() * 20) + 's');
  d.style.setProperty('--tx', (rand() * 30 - 15) + 'vw');
  d.style.setProperty('--ty', (rand() * 30 - 15) + 'vh');
  d.style.setProperty('--r2', (rand() * 90 - 45) + 'deg');
  this.els.bg.appendChild(d);
}
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
const goldSet = new Set(State.cfg.gold_ids);
const globalDupes = State.getDupesSet();
document.querySelectorAll('.cell-wrap').forEach(el => {
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
const goldSet = new Set(State.cfg.gold_ids);
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
const goldSet = new Set(State.cfg.gold_ids);
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
 perc.style.color = pct === 100 ? 'var(--gold)' : 'var(--ok)';
}
if(av) av.style.background = `conic-gradient(var(--ok) ${pct}%, var(--p) 0)`;
});
},
renderGoldEx() {
const c = document.getElementById('gold-list');
c.innerHTML = "";
State.cfg.gold_ex.forEach((item, idx) => {
const row = document.createElement('div');
row.className = 'gold-row';
row.innerHTML = `<input class="g-inp" data-f="alb" placeholder="${esc(T('album'))}" value="${esc(item.alb || '')}"><input class="g-inp" data-f="card" placeholder="${esc(T('card'))}" value="${esc(item.card || '')}"><input class="g-inp" data-f="date" placeholder="${esc(T('date'))}" value="${esc(item.date || '')}"><button style="background:0 0;border:none;color:var(--err);font-weight:700;cursor:pointer" data-action="del-gold" data-idx="${idx}">×</button>`;
row.querySelectorAll('input').forEach(i => i.oninput = e => {
  State.cfg.gold_ex[idx][e.target.dataset.f] = e.target.value; State.saveC();
});
c.appendChild(row);
});
},
renderMenus() {
const vList = document.getElementById('view-list'); vList.innerHTML = "";
[...State.cfg.usersList, "Gold"].forEach(s => {
const id = s==="Gold" ? "Gold" : s.replace(/\s/g, "");
const hide = State.cfg.hidden.includes(id);
const d = document.createElement('div');
d.className="menu-item";
d.innerHTML = `<span>${s}</span><label style="cursor:pointer;display:flex"><input type="checkbox" ${!hide?'checked':''} style="display:none"><div class="switch"></div></label>`;
d.querySelector('input').onchange = e => {
  State.cfg.hidden = e.target.checked ? State.cfg.hidden.filter(x=>x!==id) : [...State.cfg.hidden, id];
  State.saveC(); this.updateVis();
};
vList.appendChild(d);
});
const pList = document.getElementById('sub-print'); pList.innerHTML = "";
[...State.cfg.usersList, "Gold"].forEach(s => {
const id = s==="Gold" ? "Gold" : s.replace(/\s/g, "");
pList.insertAdjacentHTML('beforeend', `
<div class="menu-item" style="padding:5px 8px;font-size:0.8rem">
  <span>${s}</span>
  <label style="cursor:pointer;display:flex;align-items:center">
      <input type="checkbox" class="print-chk" value="${id}" checked style="display:none">
      <div class="switch" style="transform:scale(0.7);transform-origin:right center"></div>
  </label>
</div>`);
});
pList.insertAdjacentHTML('beforeend', `<button class="mini-btn" data-action="do-print" style="justify-content:center;background:var(--p);color:#fff;margin-top:5px;width:100%">${T('print_upper')}</button>`);
},
updateVis() {
document.querySelectorAll('.anim-section').forEach(el => {
el.classList.toggle('hidden', State.cfg.hidden.includes(el.dataset.sec));
});
},
renderGoldGrid(containerId) {
const c = document.getElementById(containerId); 
if(!c) return;
c.innerHTML = "";
const alb = State.cfg.albums;
const rowDiv = document.createElement('div');
rowDiv.className = "g-conf-row";
for(let i=1; i<=alb; i++) {
let cells = "";
for(let k=0; k<9; k++) {
  const uid = ((i-1)*9)+k;
  const active = State.cfg.gold_ids.includes(uid) ? 'active' : '';
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
handle(e) {
const t = e.target;
const btn = t.closest('[data-action]');
const cell = t.closest('.cell-wrap');
const glass = t.closest('.glass-card');
if(!t.closest('.popover') && !t.closest('.dock')) document.querySelectorAll('.popover').forEach(p=>p.classList.remove('show'));
if(cell && !t.tagName.match(/INPUT/i)) {
if(e.type === 'dblclick') { e.stopPropagation(); e.preventDefault(); return; }
const now = Date.now();
const lastCell = Actions._lastClickCell;
const lastTime = Actions._lastClickTime || 0;
if(lastCell === cell && (now - lastTime) < 300) { Actions._lastClickCell = null; return; }
Actions._lastClickCell = cell;
Actions._lastClickTime = now;
const glassCard = cell.closest('.glass-card');
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
glass.classList.toggle('expanded');
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
  const maxModes = isShiny ? 4 : 3;
  State.cfg.ambiance = (State.cfg.ambiance + 1) % maxModes;
  State.saveC();
  UI.renderAmbiance();
  const names = [T('amb_0'), T('amb_1'), T('amb_2'), T('amb_3')];
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
  document.querySelectorAll('.glass-card').forEach(c => c.classList.remove('print-hidden'));
  const vals = Array.from(document.querySelectorAll('.print-chk:checked')).map(x=>x.value);
  document.querySelectorAll('.glass-card').forEach(c => { if(!vals.includes(c.dataset.sec)) c.classList.add('print-hidden'); });
  window.print();
},
'save': () => {
  const blob = new Blob([JSON.stringify({version: CONST.VERSION, config:State.cfg, users:State.usr})], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MGO_Backup_V${CONST.VERSION}.json`; 
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Delay revoke to ensure download starts (some browsers need more time)
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  UI.showToast(T('file_dl'));
},
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
                 // Sanitize each user entry
                 Object.keys(d.users).forEach(k => {
                     if(!d.users[k].state) d.users[k].state = {};
                     if(!d.users[k].nums) d.users[k].nums = {};
                 });
                 State.usr = d.users; 
                 if(State.cfg.setup_done === undefined) State.cfg.setup_done = true;
                 HIST.length = 0; // Clear undo history — old states are irrelevant after load
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
document.addEventListener('DOMContentLoaded', () => {
applyTranslations();
State.init();
const sl = document.getElementById('sl-alb');
sl.value = State.cfg.albums; 
document.getElementById('lbl-alb').textContent = State.cfg.albums;
let deb;
sl.oninput = e => { 
document.getElementById('lbl-alb').textContent = e.target.value; 
clearTimeout(deb);
deb = setTimeout(() => {
State.cfg.albums = +e.target.value; 
State.saveC(); 
UI.renderMain();
}, 300);
};
UI.renderMain();
UI.renderGoldEx();
UI.renderMenus();
UI.renderAmbiance();
if(State.cfg.ambiance === 3) UI.showToast(T('shiny_season'));
document.body.addEventListener('click', Actions.handle.bind(Actions));
document.body.addEventListener('dblclick', Actions.handle.bind(Actions));
document.body.addEventListener('input', (e) => {
if(e.target.classList.contains('user-note')) {
const uid = e.target.dataset.uid;
if(State.usr[uid]) {
   const val = e.target.value;
   if(!val) delete State.usr[uid].note;
   else State.usr[uid].note = val;
   State.saveU(uid);
}
}
});
SetupWizard.init();
setTimeout(() => {
document.body.classList.add('app-ready');
setTimeout(() => {
  document.getElementById('splash').remove();
  if(!State.cfg.setup_done) {
      document.getElementById('setup-mod').classList.add('open');
  }
}, 600);
}, 1200);
});
