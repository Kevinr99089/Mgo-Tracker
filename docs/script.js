const VER_KEY = 'mgo_unified_version';
let LITE_MODE = document.documentElement.classList.contains('lite-mode'),
  initLocked = false;
const D = document,
  E = (i) => D.getElementById(i),
  Q = (s) => D.querySelectorAll(s),
  C = (t) => D.createElement(t),
  LS = localStorage;
let undoStack  = [],
  shineyMode = false,
  pixiErr    = false,
  noteTimer  = null,
  dockTimer  = null;
const EMOJIS = D.getElementById('emoji-bank').dataset;
const APP_VER = '4.4.0 (Web)';
const SHARE_URL   = 'https://kevinr99089.github.io/Mgo-Tracker/?share=';
const ALBUM_MIN   = 21;
const ALBUM_MAX   = 26;
const AMB_MAX     = 6;
const Season = {
  off: null,
  ok() {
    return this.off !== null;
  },
  now() {
    return new Date(Date.now() + (this.off || 0));
  },
  async verify() {
    try {
      const o = await (window.__NT || Promise.resolve(null));
      if (Number.isFinite(o)) this.off = o;
    } catch {  }
    return this.ok();
  },
  isHalloween(d) {
    if (!this.ok()) return false;
    d = d || this.now();
    return d.getMonth() === 9 && d.getDate() === 31;
  },
  isXmas(d) {
    if (!this.ok()) return false;
    d = d || this.now();
    const mo = d.getMonth(),
      dy = d.getDate();
    return (mo === 11 && dy >= 10) || (mo === 0 && dy === 1);
  },
  allowed(i) {
    if (!Number.isInteger(i) || i < 0 || i > AMB_MAX) return false;
    if (i === 4) return shineyMode;
    if (i === 5) return this.isHalloween();
    if (i === 6) return this.isXmas();
    return true;
  },
  event(d) {
    d = d || this.now();
    if (this.isHalloween(d)) return { id: 'hw' + d.getFullYear(), amb: 5 };
    if (this.isXmas(d))
      return { id: 'xm' + (d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear()), amb: 6 };
    return null;
  },
  list() {
    const a = [0, 1, 2, 3];
    if (shineyMode) a.push(4);
    if (this.isHalloween()) a.push(5);
    if (this.isXmas()) a.push(6);
    return a;
  },
};
const STORAGE = {
  CFG:       'mgo_cfg',
  USER:      'mgo_u_',
  MISS_DATA: 'mgo_missions_data_',
  MISS_OLD:  'mgo_missions_data',
  MISS_WEEK: 'mgo_missions_week',
  NOTE:      'mgo_gold_note',
  SHARE:     'mgo_share_mem',
};
let i18n = {};
const T = (k) => i18n[k] || k,
  esc = (s) =>
    (s + '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
function tr() {
  Q('[data-i18n]').forEach((e) => {
    const k = e.dataset.i18n;
    k === 'add_btn' ? (e.innerHTML = T(k)) : (e.textContent = T(k));
  });
  Q('[data-i18n-html]').forEach((e) => {
    e.innerHTML = T(e.dataset.i18nHtml) || '';
  });
  Q('[data-i18n-aria]').forEach((e) => {
    e.setAttribute('aria-label', T(e.dataset.i18nAria));
  });
  Q('[data-i18n-ph]').forEach((e) => {
    e.setAttribute('data-placeholder', T(e.dataset.i18nPh));
  });
  document.title = T('pg_ttl');
}
function __playShineySplash(isFast = false) {
  document.documentElement.classList.add('is-shiney');
  const spt = Q('.sp-title')[0],
    sph = Q('.sp-hint')[0];
  setTimeout(
    () => {
      [spt, sph].forEach((el) => {
        if (!el) return;
        const cur = getComputedStyle(el).opacity;
        el.style.animation = 'none';
        el.style.opacity = cur;
        void el.offsetHeight;
      });
      if (spt) {
        spt.style.transition = 'opacity 0.3s ease';
        spt.style.opacity = '0';
      }
      if (sph) {
        sph.style.transition = 'opacity 0.25s ease';
        sph.style.opacity = '0';
      }
      setTimeout(() => {
        if (spt) {
          spt.innerHTML = T('shy_ttl');
          spt.style.opacity = '1';
        }
        if (sph) {
          sph.textContent = T('shy_hint');
          sph.style.opacity = '1';
        }
      }, 150);
    },
    isFast ? 150 : 1050
  );
}
function __flyDeckToHeader(sp) {
  const spDeck = sp && sp.querySelector('.sp-deck'),
    hdrDeck = E('app-hdr-deck');
  if (!spDeck || !hdrDeck) return;
  const spR = spDeck.getBoundingClientRect(),
    hR = hdrDeck.getBoundingClientRect();
  const dx = hR.left + hR.width / 2 - (spR.left + spR.width / 2),
    dy = hR.top + hR.height / 2 - (spR.top + spR.height / 2);
  const sc = Math.min(hR.width / Math.max(spR.width, 1), hR.height / Math.max(spR.height, 1));
  const spT = sp.querySelector('.sp-title'),
    spH = sp.querySelector('.sp-hint');
  const _sh = D.documentElement.classList.contains('is-shiney');
  if (!_sh && spT) {
    spT.style.transition = 'opacity 0.22s ease';
    spT.style.opacity = '0';
  }
  if (!_sh && spH) {
    spH.style.transition = 'opacity 0.18s ease';
    spH.style.opacity = '0';
  }
  setTimeout(() => {
    spDeck.style.transition = 'transform 0.52s cubic-bezier(0.4,0,0.2,1)';
    spDeck.style.transformOrigin = 'center center';
    spDeck.style.transform = `translate(${dx}px,${dy}px) scale(${sc})`;
    setTimeout(() => hdrDeck.classList.add('visible'), 560);
  }, 200);
}
D.addEventListener('DOMContentLoaded', () => {
  const loadJson = (code) =>
    fetch(`langs/${code}.txt`).then((r) => (r.ok ? r.json() : Promise.reject()));
  const rawLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  const base = rawLang.startsWith('zh')
    ? (/hant|-tw|-hk|-mo/.test(rawLang) ? 'zh-hant' : 'zh')
    : rawLang.split('-')[0];
  const load = () =>
    rawLang === base ? loadJson(base) : loadJson(rawLang).catch(() => loadJson(base));
  load()
    .catch(() => (base === 'en' ? Promise.reject() : loadJson('en')))
    .catch(() => ({}))
    .then((strings) => {
      i18n = strings;
      Q('[data-e]').forEach((el) => (el.innerHTML = EMOJIS[el.dataset.e] || ''));
      State.init();
      shineyMode = Rnd(State.cfg.seed)() < 0.01;
      Q('.hub-btn[data-pick-version]').forEach((btn) =>
        btn.addEventListener('click', () => __pickVersion(btn.dataset.pickVersion, btn))
      );
      if (!LS.getItem(VER_KEY)) {
        E('__hub').style.display = 'flex';
        tr();
        E('__hub-sub').textContent = T('ver_pick');
        E('__hub-lbl-full').textContent = T('ver_full');
        E('__hub-desc-full').textContent = T('ver_full_d');
        E('__hub-lbl-lite').textContent = T('ver_lite');
        E('__hub-desc-lite').textContent = T('ver_lite_d');
      } else {
        __initApp();
      }
    });
});
function __pickVersion(v, btn) {
  if (initLocked) return;
  initLocked = true;
  Q('.hub-btn').forEach((b) => {
    b.style.pointerEvents = 'none';
    b.style.opacity = '.5';
  });
  LITE_MODE = v === 'lite';
  LS.setItem(VER_KEY, v);
  D.documentElement.classList.remove('lite-mode', 'full-mode');
  D.documentElement.classList.add(LITE_MODE ? 'lite-mode' : 'full-mode');
  const hub = E('__hub'),
    card = E('__hub-card'),
    splash = E('splash');
  if (btn) {
    const r = btn.getBoundingClientRect(),
      vw = window.innerWidth,
      vh = window.innerHeight;
    const cx = r.left + r.width / 2,
      cy = r.top + r.height / 2;
    const scale =
      Math.ceil(
        Math.max((2 * Math.max(cx, vw - cx)) / r.width, (2 * Math.max(cy, vh - cy)) / r.height)
      ) + 2;
    const bg =
      v === 'full'
        ? 'linear-gradient(135deg,#4f52d3,#6366f1)'
        : 'linear-gradient(135deg,#831843,#be185d)';
    const el = C('div');
    el.style.cssText = `position:fixed;top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px;border-radius:16px;z-index:19999;pointer-events:none;background:${bg};transform-origin:center center;will-change:transform;transition:none`;
    D.body.appendChild(el);
    card.style.transition = 'opacity 0.3s ease';
    card.style.opacity = '0';
    requestAnimationFrame(() => {
      el.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1),border-radius 0.55s ease';
      el.style.transform = `scale(${scale})`;
      el.style.borderRadius = '0';
      setTimeout(() => {
        splash.style.cssText = 'opacity:0;z-index:10000;display:flex;transition:none';
        requestAnimationFrame(() => {
          splash.style.transition = 'opacity 0.45s ease';
          splash.style.opacity = '1';
          if (shineyMode) __playShineySplash();
        });
      }, 350);
      setTimeout(() => {
        el.style.transition = 'opacity 0.4s ease';
        el.style.opacity = '0';
      }, 400);
      setTimeout(() => {
        el.remove();
        hub.style.display = 'none';
        splash.style.zIndex = '';
        splash.style.transition = '';
        __initApp(true);
      }, 820);
    });
  } else {
    hub.style.display = 'none';
    __initApp();
  }
}
const DEFAULT_CFG = {
  albums:     24,
  mode:       'cross',
  gold_ids:   [],
  gold_ex:    [],
  hidden:     [],
  setup_done: false,
  ambiance:   0,
  ambPrev:    null,
  ambSeas:    '',
  ambStatic:  false,
  seed:       0,
  usersList:  [],
};
const State = {
  cfg: { ...DEFAULT_CFG, seed: Date.now() },
  usr: {},
  dupCache: null,
  goldCache: null,
  getGoldSet() {
    if (!this.goldCache) this.goldCache = new Set(this.cfg.gold_ids);
    return this.goldCache;
  },
  getDupSet() {
    if (this.dupCache) return this.dupCache;
    const dupes = new Set();
    for (const usr of Object.values(this.usr)) {
      if (!usr?.state) continue;
      for (const [id, st] of Object.entries(usr.state)) {
        if (st === 2) dupes.add(+id);
      }
    }
    return (this.dupCache = dupes);
  },
  init() {
    try {
      const c = JSON.parse(LS.getItem(STORAGE.CFG));
      if (c) ((this.cfg = { ...this.cfg, ...c }), this.cfg.seed || (this.cfg.seed = Date.now()));
    } catch {  }
    if (!this.cfg.usersList.length) this.cfg.usersList = [`${T('ply')} 1`];
    for (const name of this.cfg.usersList) {
      const id = name.replace(/\s/g, '');
      try {
        const saved = JSON.parse(LS.getItem(STORAGE.USER + id));
        this.usr[id] = { state: {}, nums: {}, ...saved };
      } catch {
        this.usr[id] = { state: {}, nums: {} };
      }
    }
  },
  saveCfg() {
    LS.setItem(STORAGE.CFG, JSON.stringify(this.cfg));
  },
  saveUser(u) {
    if (this.usr[u]) LS.setItem(STORAGE.USER + u, JSON.stringify(this.usr[u]));
  },
  setGold(id, v) {
    const s = new Set(this.cfg.gold_ids);
    v ? s.add(id) : s.delete(id);
    this.cfg.gold_ids = [...s];
    this.goldCache = null;
    this.saveCfg();
  },
  updateCard(u, c, v, n = false) {
    if (!this.usr[u]) return;
    if (n) {
      if (v) this.usr[u].nums[c] = v;
      else delete this.usr[u].nums[c];
    } else {
      const old = this.usr[u].state[c];
      if (v === 0) delete this.usr[u].state[c];
      else this.usr[u].state[c] = v;
      if (old === 2 || v === 2) this.dupCache = null;
    }
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveUser(u), 300);
  },
};
function buildAlbumPills(container, onChange) {
  container.innerHTML = '';
  for (let v = ALBUM_MIN; v <= ALBUM_MAX; v++) {
    const b = C('button');
    b.className = 'alb-pill' + (State.cfg.albums === v ? ' active' : '');
    b.textContent = v;
    b.onclick = () => {
      container.querySelectorAll('.alb-pill').forEach((p) =>
        p.classList.toggle('active', +p.textContent === v)
      );
      onChange(v);
    };
    container.appendChild(b);
  }
}
function closeAllPopovers() {
  Q('.popover').forEach((p) => p.classList.remove('show'));
}
function withExpandedState(fn) {
  const expanded = [...Q('.glass-card.expanded')].map((c) => ({
    sec:  c.dataset.sec,
    blur: c.classList.contains('blur-active'),
  }));
  fn();
  expanded.forEach(({ sec, blur }) => {
    const c = D.querySelector(`.glass-card[data-sec="${sec}"]`);
    if (!c) return;
    c.classList.add('expanded');
    if (blur) c.classList.add('blur-active');
  });
}
const isSetupOpen = () => E('setup-mod').classList.contains('open');
window.PlayerManager = {
  tu: [],
  newIdxs: new Set(),
  dragSrc: null,
  touchSrc: null,
  touchClone: null,
  open() {
    this.tu = [...State.cfg.usersList];
    const pv = E('pop-players');
    const fromH = pv.offsetHeight;
    E('players-view-head').style.display = 'none';
    E('players-list').style.display = 'none';
    E('players-edit-head').style.display = 'block';
    E('players-edit-list').style.display = 'flex';
    E('players-save-footer').style.display = 'flex';
    pv.style.width = '320px';
    pv.classList.add('show');
    this.render();
    const maxH = window.innerHeight - 110;
    const toH = Math.min(pv.scrollHeight, maxH);
    pv.animate([{ height: fromH + 'px' }, { height: toH + 'px' }], {
      duration: 300,
      easing: 'cubic-bezier(0.25,0.8,0.25,1)',
    });
  },
  close() {
    this.newIdxs.clear();
    const pv = E('pop-players');
    const fromH = pv.offsetHeight;
    E('players-view-head').style.display = 'block';
    E('players-list').style.display = 'block';
    E('players-edit-head').style.display = 'none';
    E('players-edit-list').style.display = 'none';
    E('players-save-footer').style.display = 'none';
    pv.style.width = '280px';
    const toH = pv.scrollHeight;
    pv.animate([{ height: fromH + 'px' }, { height: toH + 'px' }], {
      duration: 300,
      easing: 'cubic-bezier(0.25,0.8,0.25,1)',
    });
  },
  render() {
    const list = E('players-edit-list');
    const frag = D.createDocumentFragment();
    this.tu.forEach((u, i) => {
      const r = C('li');
      r.className = 'pm-row' + (this.newIdxs.has(i) ? ' pm-new' : '');
      r.draggable = true;
      r.dataset.idx = i;
      r.innerHTML = `<span class="pm-handle">⠿</span><input type="text" class="pm-input pm-inp" value="${esc(u)}" data-idx="${i}"><button class="mini-btn danger pm-del" data-idx="${i}" ${this.tu.length <= 1 ? 'disabled' : ''}>${EMOJIS.cls}</button>`;
      this._bindDrag(r);
      this._bindTouch(r.querySelector('.pm-handle'), r);
      frag.appendChild(r);
    });
    list.innerHTML = '';
    list.appendChild(frag);
    list.onchange = (e) => {
      const inp = e.target.closest('.pm-inp');
      if (inp) this.tu[+inp.dataset.idx] = inp.value.trim() || `${T('ply')} ${+inp.dataset.idx + 1}`;
    };
    list.onclick = (e) => {
      const btn = e.target.closest('.pm-del');
      if (btn && !btn.disabled && this.tu.length > 1) {
        this.tu.splice(+btn.dataset.idx, 1);
        this.render();
      }
    };
  },
  _bindDrag(r) {
    r.addEventListener('dragstart', (e) => {
      this.dragSrc = r;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', r.dataset.idx);
      setTimeout(() => r.classList.add('pm-dragging'), 0);
    });
    r.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (r !== this.dragSrc) {
        Q('.pm-row').forEach((el) => el.classList.remove('pm-drag-over'));
        r.classList.add('pm-drag-over');
      }
    });
    r.addEventListener('drop', (e) => {
      e.preventDefault();
      if (r !== this.dragSrc) {
        const item = this.tu.splice(+this.dragSrc.dataset.idx, 1)[0];
        this.tu.splice(+r.dataset.idx, 0, item);
        this.render();
      }
    });
    r.addEventListener('dragend', () => {
      Q('.pm-row').forEach((el) => el.classList.remove('pm-dragging', 'pm-drag-over'));
      this.dragSrc = null;
    });
  },
  _bindTouch(handle, row) {
    const opts = { passive: false };
    handle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touchSrc = row;
      const { top, left, width } = row.getBoundingClientRect();
      const clone = row.cloneNode(true);
      clone.classList.add('pm-touch-clone');
      Object.assign(clone.style, { top: top + 'px', left: left + 'px', width: width + 'px' });
      D.body.appendChild(clone);
      this.touchClone = clone;
      row.classList.add('pm-dragging');
    }, opts);
    handle.addEventListener('touchmove', (e) => {
      if (!this.touchClone) return;
      e.preventDefault();
      const { clientX, clientY } = e.touches[0];
      this.touchClone.style.top = clientY - 22 + 'px';
      Q('.pm-row').forEach((el) => el.classList.remove('pm-drag-over'));
      D.elementsFromPoint(clientX, clientY)
        .find((el) => el.classList.contains('pm-row') && el !== this.touchSrc)
        ?.classList.add('pm-drag-over');
    }, opts);
    handle.addEventListener('touchend', (e) => {
      if (!this.touchClone) return;
      const { clientX, clientY } = e.changedTouches[0];
      const over = D.elementsFromPoint(clientX, clientY)
        .find((el) => el.classList.contains('pm-row') && el !== this.touchSrc);
      this.touchClone.remove();
      this.touchClone = null;
      if (over) {
        const item = this.tu.splice(+this.touchSrc.dataset.idx, 1)[0];
        this.tu.splice(+over.dataset.idx, 0, item);
      }
      this.render();
      this.touchSrc = null;
    }, opts);
  },
  add() {
    const i = this.tu.length;
    this.tu.push(`${T('ply')} ${i + 1}`);
    this.newIdxs.add(i);
    this.render();
    requestAnimationFrame(() => {
      const ul = E('players-edit-list');
      ul.scrollTop = ul.scrollHeight;
      const rs = Q('.pm-row');
      if (rs[i]) {
        rs[i].classList.add('pm-flashing');
        setTimeout(() => {
          rs[i].classList.remove('pm-flashing');
          rs[i].classList.add('pm-new');
        }, 950);
      }
    });
  },
  save() {
    this.newIdxs.clear();
    const o = State.cfg.usersList.slice();
    this.tu.forEach((n, i) => {
      const old = o[i];
      if (!old) return;
      const ok = old.replace(/\s/g, ''),
        nk = n.replace(/\s/g, '');
      if (ok !== nk && State.usr[ok]) {
        State.usr[nk] = State.usr[ok];
        delete State.usr[ok];
        try {
          LS.removeItem(STORAGE.USER + ok);
        } catch {  }
        State.saveUser(nk);
      }
    });
    const of1 = o[0] ? o[0].replace(/\s/g, '') : null,
      nf1 = this.tu[0] ? this.tu[0].replace(/\s/g, '') : null;
    if (of1 && nf1 && of1 !== nf1 && State.usr[nf1]) {
      State.usr[nf1].nums = {};
      State.saveUser(nf1);
    }
    this.tu.forEach((u) => {
      const id = u.replace(/\s/g, '');
      if (!State.usr[id]) State.usr[id] = { state: {}, nums: {} };
    });
    State.cfg.usersList = [...this.tu];
    State.saveCfg();
    if (isSetupOpen()) {
      E('pop-players').classList.remove('show');
      setTimeout(() => this.close(), 250);
    } else {
      this.close();
    }
    UI.renderMenu();
    UI.renderMain();
    UI.toast(T('ply_upd'));
  },
};
let pixiApp = null;
const UI = {
  dialog(opts) {
    const ov = E('mod-dialog'),
      msg = E('dialog-msg'),
      btns = E('dialog-btns'),
      chkw = E('dialog-checkUrl-wrap'),
      title = E('dialog-title'),
      cl = () => ov.classList.remove('open');
    if (!opts.keep) {
      Q('.popover').forEach((p) => p.classList.remove('show'));
      Q('.dock-btn.active').forEach((b) => b.classList.remove('active'));
    }
    E('dialog-close-btn').onclick = opts.onClose || cl;
    title.innerHTML = opts.title || T('dlg_ttl');
    msg.textContent = opts.msg || '';
    btns.innerHTML = '';
    chkw.innerHTML = '';
    chkw.style.display = opts.checkbox ? 'block' : 'none';
    if (opts.checkbox)
      chkw.innerHTML = `<label class="dialog-checkUrl-row"><input type="checkbox" id="dialog-checkUrl"${opts.checkbox.checked !== false ? ' checked' : ''}><span>${esc(opts.checkbox.label)}</span></label>`;
    (opts.buttons || []).forEach((b) => {
      const btn = C('button');
      btn.className = 'dialog-btn ' + (b.cls || '');
      btn.innerHTML = b.label;
      btn.onclick = () => {
        cl();
        b.cb && b.cb();
      };
      btns.appendChild(btn);
    });
    ov.classList.add('open');
  },
  confirm(msg, okCb, cancelCb, okLbl, cancelLbl) {
    this.dialog({
      msg,
      buttons: [
        { label: cancelLbl || T('btn_cancel'), cls: '', cb: cancelCb },
        { label: okLbl || T('btn_confirm'), cls: 'primary', cb: okCb },
      ],
    });
  },
  alert(msg, cb) {
    this.dialog({ msg, buttons: [{ label: T('btn_ok'), cls: 'primary', cb: cb }] });
  },
  toast(m, err = false) {
    const t = E('toast');
    const dur = Math.min(6500, Math.max(2500, 1800 + m.replace(/[^\x00-\x7F]/g, 'xx').length * 45));
    clearTimeout(this.toastTimer);
    t.classList.remove('show');
    void t.offsetHeight;
    t.textContent = m;
    t.classList.add('show');
    requestAnimationFrame(() => {
      const W = t.offsetWidth,
        H = t.offsetHeight,
        R = 25;
      const P = Math.round(2 * (W - 2 * R) + 2 * (H - 2 * R) + 2 * Math.PI * R);
      let svg = t.toastSvg;
      if (!svg) {
        svg = D.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('tp');
        svg.setAttribute(
          'style',
          'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:0'
        );
        svg.innerHTML =
          '<defs><linearGradient id="tpg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#f472b6"/></linearGradient></defs><rect fill="none" stroke="url(#tpg)" stroke-width="2.5"/>';
        t.toastSvg = svg;
      }
      const stops = svg.querySelectorAll('stop');
      if (err) {
        stops[0].setAttribute('stop-color', '#ef4444');
        stops[1].setAttribute('stop-color', '#f43f5e');
      } else {
        stops[0].setAttribute('stop-color', '#6366f1');
        stops[1].setAttribute('stop-color', '#f472b6');
      }
      if (!svg.isConnected) t.appendChild(svg);
      const rc = svg.querySelector('rect');
      rc.setAttribute('x', '1.25');
      rc.setAttribute('y', '1.25');
      rc.setAttribute('width', W - 2.5);
      rc.setAttribute('height', H - 2.5);
      rc.setAttribute('rx', R);
      rc.setAttribute('ry', R);
      rc.style.strokeDasharray = P;
      rc.style.strokeDashoffset = 0;
      rc.style.transition = 'none';
      void rc.getBoundingClientRect();
      requestAnimationFrame(() => {
        rc.style.transition = 'stroke-dashoffset ' + dur + 'ms linear';
        rc.style.strokeDashoffset = -P;
      });
    });
    this.toastTimer = setTimeout(() => t.classList.remove('show'), dur);
  },
  initAmbiance() {
    if (LITE_MODE) return;
    const bg = E('ambient-bg');
    if (!bg) return;
    if (pixiApp) {
      pixiApp();
      pixiApp = null;
    }
    bg.innerHTML = '';
    bg.style.background = '';
    const m = State.cfg.ambiance || 0;
    bg.classList.toggle('hw-tint', m !== 5 && Season.isHalloween());
    const
      c = ['79,70,229', '192,38,211', '6,182,212', '244,114,182', '251,191,36'],
      r = Rnd(State.cfg.seed);
    if (m !== 4) {
      if (typeof PIXI === 'undefined') {
        if (!pixiErr) {
          UI.toast(T('amb_err'), true);
          pixiErr = true;
        }
        bg.style.backgroundImage = 'var(--lite-bg)';
        return;
      }
      const a = new PIXI.Application({
        resizeTo: bg,
        backgroundAlpha: 0,
        antialias: m === 1 || m >= 5,
        resolution: 1,
        autoDensity: true,
      });
      a.view.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
      bg.appendChild(a.view);
      const o = [];
      if (m === 0) {
        for (let i = 0; i < 7; i++) {
          const sz = 45 + 40 * r(),
            rgb = c[~~(r() * c.length)],
            cx2 = (10 + 75 * r()) / 100,
            cy2 = (10 + 75 * r()) / 100,
            tx = (30 * r() - 15) / 100,
            ty = (30 * r() - 15) / 100,
            d = (18 + 16 * r()) * 1e3,
            ph = r() * Math.PI * 2,
            ts = 256,
            oc = C('canvas');
          oc.width = oc.height = ts;
          const cx3 = oc.getContext('2d'),
            grd = cx3.createRadialGradient(128, 128, 0, 128, 128, 128);
          grd.addColorStop(0, `rgba(${rgb},1)`);
          grd.addColorStop(0.68, `rgba(${rgb},.15)`);
          grd.addColorStop(1, `rgba(${rgb},0)`);
          cx3.fillStyle = grd;
          cx3.fillRect(0, 0, ts, ts);
          const spr = new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(oc)));
          spr.anchor.set(0.5);
          spr.alpha = 0.55;
          a.stage.addChild(spr);
          o.push({ spr, cx: cx2, cy: cy2, tx, ty, d, ph, sz });
        }
      } else if (m === 1) {
        const grads = [
          ['#3b41d8', '#6468f5'],
          ['#c77b10', '#f0aa22'],
          ['#b8223b', '#eb3a5f'],
          ['#0e766e', '#14b8a6'],
          ['#7c3aed', '#a855f7'],
        ];
        for (let i = 0; i < 6; i++) {
          const gc = grads[~~(r() * grads.length)],
            TW = 256,
            TH = 358,
            oc = C('canvas');
          oc.width = TW;
          oc.height = TH;
          const cx2 = oc.getContext('2d');
          cx2.beginPath();
          if (typeof cx2.roundRect === 'function') {
            cx2.roundRect(0, 0, TW, TH, 16);
          } else {
            const rad = 16;
            cx2.moveTo(rad, 0);
            cx2.lineTo(TW - rad, 0);
            cx2.quadraticCurveTo(TW, 0, TW, rad);
            cx2.lineTo(TW, TH - rad);
            cx2.quadraticCurveTo(TW, TH, TW - rad, TH);
            cx2.lineTo(rad, TH);
            cx2.quadraticCurveTo(0, TH, 0, TH - rad);
            cx2.lineTo(0, rad);
            cx2.quadraticCurveTo(0, 0, rad, 0);
            cx2.closePath();
          }
          cx2.clip();
          const grd = cx2.createLinearGradient(0, 0, TW, TH);
          grd.addColorStop(0, gc[0]);
          grd.addColorStop(1, gc[1]);
          cx2.fillStyle = grd;
          cx2.fillRect(0, 0, TW, TH);
          cx2.strokeStyle = 'rgba(255,255,255,0.42)';
          cx2.lineWidth = 3;
          cx2.stroke();
          const spr = new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(oc)));
          spr.anchor.set(0.5);
          spr.alpha = 0.68;
          a.stage.addChild(spr);
          const sz = ((30 + 25 * r()) / 100) * window.innerWidth;
          spr.width = sz;
          spr.height = sz * 1.4;
          o.push({
            spr,
            sx: (((i % 2) + 0.1 + r() * 0.8) / 2) * 0.9,
            sy: ((Math.floor(i / 2) + 0.1 + r() * 0.8) / 3) * 0.9,
            tx: (20 * r() - 10) / 100,
            ty: (20 * r() - 10) / 100,
            r0: ((40 * r() - 20) * Math.PI) / 180,
            r1: ((40 * r() - 20) * Math.PI) / 180,
            d: (20 + 15 * r()) * 1e3,
            ph: r() * Math.PI * 2,
          });
        }
      } else if (m === 3) {
        bg.style.background = '#020204';
        const goo = new PIXI.Container(),
          blur = new PIXI.BlurFilter(16, 4);
        blur.padding = 200;
        const thresh = new PIXI.Filter(
          null,
          'varying vec2 vTextureCoord;uniform sampler2D uSampler;void main(){vec4 c=texture2D(uSampler,vTextureCoord);vec3 rgb=(c.a>0.001)?c.rgb/c.a:vec3(0.0);float a=clamp(c.a*22.0-9.0,0.0,1.0);gl_FragColor=vec4(rgb*a,a);}'
        );
        thresh.padding = 200;
        goo.filters = [blur, thresh];
        a.stage.addChild(goo);
        const TS = 256,
          ot = C('canvas');
        ot.width = ot.height = TS;
        const ct = ot.getContext('2d');
        const gt = ct.createRadialGradient(128, 128, 0, 128, 128, 128);
        gt.addColorStop(0, 'rgba(255,255,255,0.95)');
        gt.addColorStop(0.4, 'rgba(255,255,255,0.7)');
        gt.addColorStop(0.7, 'rgba(255,255,255,0.3)');
        gt.addColorStop(1, 'rgba(255,255,255,0)');
        ct.fillStyle = gt;
        ct.fillRect(0, 0, TS, TS);
        const shTex = new PIXI.Texture(new PIXI.BaseTexture(ot));
        const nP = 3 + ~~(2 * r()),
          pal = [...c]
            .sort(() => r() - 0.5)
            .slice(0, nP)
            .map((x) => {
              const p = x.split(',');
              return (+p[0] << 16) | (+p[1] << 8) | +p[2];
            });
        const blobs = [];
        for (let i = 0; i < 10; i++) {
          const ny = r(),
            spr = new PIXI.Sprite(shTex);
          spr.anchor.set(0.5);
          goo.addChild(spr);
          const col = pal[~~(r() * pal.length)];
          spr.tint = col;
          blobs.push({
            spr,
            x: r() * (a.screen.width || window.innerWidth),
            y: ny * (a.screen.height || window.innerHeight),
            vx: 0,
            vy: 0,
            r: 35 + 55 * r(),
            baseR: 35 + 55 * r(),
            col,
            ph: r() * Math.PI * 2,
            fq: 0.08 + 0.12 * r(),
            df: 0.04 * (r() - 0.5),
            tp: 1 - ny,
            ti: 0.12 + 0.18 * r(),
          });
        }
        const BUOY = 5.0,
          DAMP = 0.988,
          FIXED_DT = 1 / 60,
          MAX_SPD = FIXED_DT * 48;
        let acc = 0,
          lt = 0;
        function physStep(n) {
          const ds = FIXED_DT,
            W = a.screen.width || bg.offsetWidth || window.innerWidth,
            H = a.screen.height || bg.offsetHeight || window.innerHeight;
          for (let i = 0; i < 10; i++) {
            const b = blobs[i];
            const bias = 0.15 + 0.7 * (0.5 + 0.5 * Math.sin(n * 0.0002 + b.ph));
            b.tp += (b.y / H - b.tp) * b.ti * ds;
            b.vy -= (b.tp - bias) * BUOY * ds;
            b.ph += b.fq * ds;
            b.vx += 0.4 * Math.sin(b.ph + 1.7 * i) * ds + b.df * ds * 1.5;
            for (let j = i + 1; j < 10; j++) {
              const b2 = blobs[j],
                dx = b2.x - b.x,
                dy = b2.y - b.y,
                dd = Math.sqrt(dx * dx + dy * dy) + 1,
                mn = 0.35 * (b.r + b2.r);
              if (dd < mn) {
                const f = 0.08 * (mn - dd) * ds,
                  nx = dx / dd,
                  ny = dy / dd;
                b.vx -= nx * f;
                b.vy -= ny * f;
                b2.vx += nx * f;
                b2.vy += ny * f;
              }
            }
            b.vx *= DAMP;
            b.vy *= DAMP;
            const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            if (spd > MAX_SPD) {
              const sc = MAX_SPD / spd;
              b.vx *= sc;
              b.vy *= sc;
            }
            b.x += b.vx;
            b.y += b.vy;
            const pd = 0.3 * b.r;
            if (b.x < b.r) {
              b.vx = Math.abs(b.vx) * 0.3;
              b.x = b.r;
            }
            if (b.x > W - b.r) {
              b.vx = -Math.abs(b.vx) * 0.3;
              b.x = W - b.r;
            }
            if (b.y < -pd) {
              b.vy = Math.abs(b.vy) * 0.3;
              b.y = -pd;
            }
            if (b.y > H + pd) {
              b.vy = -Math.abs(b.vy) * 0.3;
              b.y = H + pd;
            }
            b.r = b.baseR + Math.sin(6e-4 * n + 2.1 * i) * b.baseR * 0.06;
          }
        }
        a.ticker.add(() => {
          const n = performance.now();
          if (!lt) {
            lt = n;
            return;
          }
          const elapsed = (n - lt) / 1000;
          lt = n;
          acc += elapsed;
          acc = Math.min(acc, FIXED_DT * 8);
          while (acc >= FIXED_DT) {
            physStep(n);
            acc -= FIXED_DT;
          }
          blobs.forEach((b) => {
            b.spr.x = b.x;
            b.spr.y = b.y;
            b.spr.width = b.spr.height = b.r * 3.6;
          });
        });
      } else if (m === 2) {
        bg.style.background =
          'linear-gradient(180deg,#020e1f 0%,#011428 35%,#010a1a 70%,#020508 100%)';
        const gW4 = () => a.screen.width || window.innerWidth;
        const gH4 = () => a.screen.height || window.innerHeight;
        const getVT = () => (a.screen.height || window.innerHeight * 1.6) * 0.1;
        const getVB = () => (a.screen.height || window.innerHeight * 1.6) * 0.8;
        const bTs = 64,
          bOc = C('canvas');
        bOc.width = bOc.height = bTs;
        const bCtx = bOc.getContext('2d');
        bCtx.beginPath();
        bCtx.arc(32, 32, 26, 0, Math.PI * 2);
        bCtx.strokeStyle = 'rgba(160,220,255,0.85)';
        bCtx.lineWidth = 2;
        bCtx.stroke();
        bCtx.beginPath();
        bCtx.arc(22, 20, 8, 0, Math.PI * 2);
        bCtx.fillStyle = 'rgba(255,255,255,0.28)';
        bCtx.fill();
        const bubTex = new PIXI.Texture(new PIXI.BaseTexture(bOc));
        const bubbles4 = [];
        const vbI = gH4() * 1.1,
          vtI = gH4() * 0.1;
        for (let i = 0; i < 22; i++) {
          const spr = new PIXI.Sprite(bubTex);
          spr.anchor.set(0.5);
          const sz = 5 + 16 * r();
          spr.width = spr.height = sz * 2;
          spr.alpha = 0.35 + 0.55 * r();
          bubbles4.push({
            spr,
            x: r() * gW4(),
            y: vtI + r() * (vbI - vtI),
            sz,
            spd: 0.18 + 0.5 * r(),
            drift: 0.25 * (r() - 0.5),
            wph: r() * Math.PI * 2,
            wspd: 0.016 + 0.024 * r(),
          });
          a.stage.addChild(spr);
        }
        const rayContainer4 = new PIXI.Container();
        const rayBlur4 = new PIXI.BlurFilter(14, 2);
        rayBlur4.padding = 120;
        rayContainer4.filters = [rayBlur4];
        a.stage.addChild(rayContainer4);
        const rayDefs4 = [];
        const raySprites4 = [];
        const rayTexture4 = (() => {
          const rc = C('canvas');
          rc.width = 200;
          rc.height = 700;
          const rx = rc.getContext('2d');
          const rg = rx.createLinearGradient(0, 0, 0, 700);
          rg.addColorStop(0, 'rgba(120,210,255,0.30)');
          rg.addColorStop(0.5, 'rgba(80,170,255,0.10)');
          rg.addColorStop(1, 'rgba(20,80,180,0)');
          rx.fillStyle = rg;
          rx.fillRect(0, 0, 200, 700);
          return new PIXI.Texture(new PIXI.BaseTexture(rc));
        })();
        for (let i = 0; i < 6; i++) {
          rayDefs4.push({
            cx: 0.08 + 0.84 * (i / 5),
            topW: 3 + 5 * r(),
            botFrac: 0.038 + 0.022 * r(),
            ph: r() * Math.PI * 2,
            spd: 0.00025 + 0.00015 * r(),
            drift: 0.025 + 0.015 * r(),
          });
          const spr = new PIXI.Sprite(rayTexture4);
          spr.anchor.set(0.5, 0);
          rayContainer4.addChild(spr);
          raySprites4.push(spr);
        }
        const waveGfx4 = new PIXI.Graphics();
        a.stage.addChild(waveGfx4);
        const swGfx4 = new PIXI.Graphics();
        a.stage.addChild(swGfx4);
        const swDefs4 = [
          { rx: 0.03, h: 0.42, w: 8, cl: 0x22c55e, al: 0.92 },
          { rx: 0.08, h: 0.3, w: 6, cl: 0x16a34a, al: 0.82 },
          { rx: 0.13, h: 0.22, w: 5, cl: 0x15803d, al: 0.72 },
          { rx: 0.87, h: 0.24, w: 5, cl: 0x15803d, al: 0.72 },
          { rx: 0.92, h: 0.38, w: 8, cl: 0x22c55e, al: 0.9 },
          { rx: 0.97, h: 0.28, w: 6, cl: 0x16a34a, al: 0.78 },
        ];
        a.ticker.add(() => {
          const n = performance.now(),
            W = gW4();
          const vT = getVT(),
            vB = getVB(),
            vH = vB - vT;
          bubbles4.forEach((b) => {
            b.wph += b.wspd;
            b.x += b.drift + Math.sin(b.wph) * 0.5;
            b.y -= b.spd;
            if (b.y < vT - b.sz * 3) {
              b.y = vB + b.sz * 3;
              b.x = r() * W;
            }
            b.spr.x = b.x;
            b.spr.y = b.y;
          });
          rayDefs4.forEach((rd, i) => {
            rd.ph += rd.spd;
            const spr = raySprites4[i];
            const cx = (rd.cx + Math.sin(rd.ph) * rd.drift) * W;
            const bw = rd.botFrac * W;
            spr.x = cx;
            spr.y = vT;
            spr.width = bw * 2;
            spr.height = vB - vT;
            spr.rotation = Math.sin(rd.ph * 0.7 + i) * 0.08;
            spr.alpha = 0.22 + 0.12 * Math.sin(rd.ph * 1.3 + i * 0.5);
          });
          waveGfx4.clear();
          const steps = 60,
            wpts4 = [];
          waveGfx4.beginFill(0x1e6fa0, 0.52);
          waveGfx4.moveTo(0, vT - 10);
          for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * W;
            const y =
              vT +
              12 +
              Math.sin((i / steps) * Math.PI * 4.5 + n * 0.0009) * 14 +
              Math.sin((i / steps) * Math.PI * 2.5 + n * 0.0013) * 8;
            wpts4.push({ x, y });
            waveGfx4.lineTo(x, y);
          }
          waveGfx4.lineTo(W, vT - 10);
          waveGfx4.closePath();
          waveGfx4.endFill();
          waveGfx4.lineStyle(2.5, 0x7dd3fc, 0.82);
          waveGfx4.moveTo(wpts4[0].x, wpts4[0].y);
          for (let i = 1; i < wpts4.length; i++) waveGfx4.lineTo(wpts4[i].x, wpts4[i].y);
          waveGfx4.lineStyle(0);
          waveGfx4.beginFill(0x0e4a70, 0.35);
          waveGfx4.moveTo(0, vT - 10);
          for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * W;
            const y =
              vT -
              2 +
              Math.sin((i / steps) * Math.PI * 3.2 + n * 0.0011 + 1.5) * 9 +
              Math.cos((i / steps) * Math.PI * 2 + n * 0.0008) * 5;
            waveGfx4.lineTo(x, y);
          }
          waveGfx4.lineTo(W, vT - 10);
          waveGfx4.closePath();
          waveGfx4.endFill();
          swGfx4.clear();
          swDefs4.forEach((sw, idx) => {
            const bx = sw.rx * W,
              by = vB,
              swH = sw.h * vH;
            const t = n * 0.0006 + idx * 1.8;
            const s1 = Math.sin(t) * 30,
              s2 = Math.sin(t + 0.9) * 18;
            swGfx4.lineStyle(sw.w, sw.cl, sw.al);
            swGfx4.moveTo(bx, by);
            swGfx4.bezierCurveTo(
              bx + s1,
              by - swH * 0.33,
              bx - s2,
              by - swH * 0.66,
              bx + s1 * 0.5,
              by - swH
            );
            const mx = bx + s1 * 0.4,
              my = by - swH * 0.55;
            swGfx4.lineStyle(sw.w - 1, sw.cl, sw.al * 0.7);
            swGfx4.moveTo(mx, my);
            swGfx4.bezierCurveTo(
              mx + 10,
              my - swH * 0.12,
              mx + 20,
              my - swH * 0.18,
              mx + 14,
              my - swH * 0.22
            );
          });
        });
      } else if (m === 5) {
        bg.style.background =
          'radial-gradient(circle at 50% 64%,#3d1707 0%,#200b02 38%,#0d0400 68%,#020100 100%)';
        const gW5 = () => a.screen.width || bg.offsetWidth || window.innerWidth;
        const gH5 = () => a.screen.height || bg.offsetHeight || window.innerHeight;
        const vT5 = () => gH5() * 0.0625;
        const vH5 = () => gH5() * 0.625;
        const radTex5 = (rgb, a0, mid) => {
          const oc = C('canvas');
          oc.width = oc.height = 256;
          const g2 = oc.getContext('2d'),
            gr = g2.createRadialGradient(128, 128, 0, 128, 128, 128);
          gr.addColorStop(0, `rgba(${rgb},${a0})`);
          gr.addColorStop(0.5, `rgba(${rgb},${mid})`);
          gr.addColorStop(1, `rgba(${rgb},0)`);
          g2.fillStyle = gr;
          g2.fillRect(0, 0, 256, 256);
          return new PIXI.Texture(new PIXI.BaseTexture(oc));
        };
        const fogTex5 = radTex5('154,52,18', 0.85, 0.14);
        const emberTex5 = radTex5('251,146,60', 1, 0.32);
        const haloTex5 = radTex5('249,115,22', 0.6, 0.11);
        const moonOc5 = C('canvas');
        moonOc5.width = moonOc5.height = 256;
        const mg5 = moonOc5.getContext('2d');
        const mgr5 = mg5.createRadialGradient(128, 128, 44, 128, 128, 128);
        mgr5.addColorStop(0, 'rgba(255,170,90,0.40)');
        mgr5.addColorStop(0.45, 'rgba(214,110,40,0.13)');
        mgr5.addColorStop(1, 'rgba(160,60,10,0)');
        mg5.fillStyle = mgr5;
        mg5.fillRect(0, 0, 256, 256);
        const mdisc5 = mg5.createRadialGradient(106, 104, 8, 128, 128, 68);
        mdisc5.addColorStop(0, '#ffe3b8');
        mdisc5.addColorStop(0.55, '#f2a24a');
        mdisc5.addColorStop(1, '#c2670f');
        mg5.beginPath();
        mg5.arc(128, 128, 66, 0, Math.PI * 2);
        mg5.fillStyle = mdisc5;
        mg5.fill();
        mg5.fillStyle = 'rgba(146,70,18,0.22)';
        [
          [104, 110, 13],
          [150, 143, 17],
          [117, 159, 9],
          [157, 101, 7],
        ].forEach(([mx, my, mr]) => {
          mg5.beginPath();
          mg5.arc(mx, my, mr, 0, Math.PI * 2);
          mg5.fill();
        });
        const moonSpr5 = new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(moonOc5)));
        moonSpr5.anchor.set(0.5);
        moonSpr5.alpha = 0.9;
        a.stage.addChild(moonSpr5);
        const fogs5 = [];
        for (let i = 0; i < 6; i++) {
          const spr = new PIXI.Sprite(fogTex5);
          spr.anchor.set(0.5);
          spr.alpha = 0.28 + 0.22 * r();
          a.stage.addChild(spr);
          fogs5.push({
            spr,
            cx: 0.12 + 0.76 * r(),
            cy: 0.3 + 0.55 * r(),
            tx: (26 * r() - 13) / 100,
            ty: (14 * r() - 7) / 100,
            sz: 55 + 45 * r(),
            d: (17 + 14 * r()) * 1e3,
            ph: r() * Math.PI * 2,
          });
        }
        const PKW = 460,
          PKH = 380,
          pkX = PKW / 2,
          pkY = PKH * 0.6,
          pkRX = PKW * 0.46,
          pkRY = PKH * 0.4;
        const facePath5 = (g2) => {
          const ew = pkRX * 0.2,
            eh = pkRY * 0.19,
            eox = pkRX * 0.42,
            eoy = pkY - pkRY * 0.3;
          [-1, 1].forEach((s) => {
            const ex = pkX + s * eox;
            g2.moveTo(ex - s * ew, eoy - eh);
            g2.lineTo(ex + s * ew, eoy + eh * 0.12);
            g2.lineTo(ex - s * ew * 0.45, eoy + eh);
            g2.closePath();
          });
          const nw = pkRX * 0.09,
            nh = pkRY * 0.12,
            ny = pkY + pkRY * 0.02;
          g2.moveTo(pkX, ny - nh);
          g2.lineTo(pkX + nw, ny + nh * 0.75);
          g2.lineTo(pkX - nw, ny + nh * 0.75);
          g2.closePath();
          const mw = pkRX * 0.6,
            my = pkY + pkRY * 0.36,
            mh = pkRY * 0.17,
            seg = 6,
            sw = (2 * mw) / seg,
            pts = [];
          for (let i = 0; i <= seg; i++) {
            const t = i / seg,
              x = pkX - mw + 2 * mw * t,
              cv = Math.cos((t - 0.5) * Math.PI);
            pts.push({ x, yt: my - mh * 0.2 - cv * mh * 0.3, yb: my + cv * mh * 0.95 });
          }
          g2.moveTo(pts[0].x, pts[0].yt);
          for (let i = 1; i <= seg; i++) {
            if (i === 2 || i === 5) {
              g2.lineTo(pts[i].x - sw * 0.42, pts[i].yt);
              g2.lineTo(pts[i].x, pts[i].yt + mh * 0.72);
              g2.lineTo(pts[i].x + sw * 0.42, pts[i].yt);
            } else g2.lineTo(pts[i].x, pts[i].yt);
          }
          g2.lineTo(pts[seg].x, pts[seg].yb);
          for (let i = seg - 1; i >= 0; i--) {
            if (i === 3) {
              g2.lineTo(pts[i].x + sw * 0.42, pts[i].yb);
              g2.lineTo(pts[i].x, pts[i].yb - mh * 0.8);
              g2.lineTo(pts[i].x - sw * 0.42, pts[i].yb);
            } else g2.lineTo(pts[i].x, pts[i].yb);
          }
          g2.closePath();
        };
        const bodyOc5 = C('canvas');
        bodyOc5.width = PKW;
        bodyOc5.height = PKH;
        const bg5 = bodyOc5.getContext('2d');
        bg5.fillStyle = '#46330f';
        bg5.beginPath();
        bg5.moveTo(pkX - 17, pkY - pkRY + 10);
        bg5.quadraticCurveTo(pkX - 10, pkY - pkRY - 44, pkX + 20, pkY - pkRY - 56);
        bg5.lineTo(pkX + 33, pkY - pkRY - 40);
        bg5.quadraticCurveTo(pkX + 7, pkY - pkRY - 28, pkX + 16, pkY - pkRY + 8);
        bg5.closePath();
        bg5.fill();
        [
          [-0.62, 0.44, 0.86, '#8f3208', '#431303'],
          [0.62, 0.44, 0.86, '#8f3208', '#431303'],
          [-0.34, 0.56, 0.95, '#b8440a', '#5f1e05'],
          [0.34, 0.56, 0.95, '#b8440a', '#5f1e05'],
          [0, 0.63, 1, '#d95f0e', '#712604'],
        ].forEach(([dx, lrx, lry, c1, c2]) => {
          const cx5 = pkX + dx * pkRX;
          const g3 = bg5.createLinearGradient(cx5 - pkRX * lrx, pkY - pkRY * lry, cx5 + pkRX * lrx, pkY + pkRY * lry);
          g3.addColorStop(0, c1);
          g3.addColorStop(1, c2);
          bg5.beginPath();
          bg5.ellipse(cx5, pkY, pkRX * lrx, pkRY * lry, 0, 0, Math.PI * 2);
          bg5.fillStyle = g3;
          bg5.fill();
        });
        bg5.strokeStyle = 'rgba(48,12,1,0.5)';
        bg5.lineWidth = 2.6;
        [
          [-0.34, 0.56, 0.95],
          [0.34, 0.56, 0.95],
          [-0.62, 0.44, 0.86],
          [0.62, 0.44, 0.86],
        ].forEach(([dx, lrx, lry]) => {
          const a0 = dx < 0 ? Math.PI * 0.5 + 0.45 : -Math.PI * 0.5 + 0.45,
            a1 = dx < 0 ? Math.PI * 1.5 - 0.45 : Math.PI * 0.5 - 0.45;
          bg5.beginPath();
          bg5.ellipse(pkX + dx * pkRX, pkY, pkRX * lrx, pkRY * lry, 0, a0, a1);
          bg5.stroke();
        });
        bg5.globalCompositeOperation = 'destination-out';
        bg5.beginPath();
        facePath5(bg5);
        bg5.fill();
        bg5.globalCompositeOperation = 'source-over';
        bg5.strokeStyle = 'rgba(22,5,0,0.9)';
        bg5.lineWidth = 4.5;
        bg5.beginPath();
        facePath5(bg5);
        bg5.stroke();
        const glowOc5 = C('canvas');
        glowOc5.width = PKW;
        glowOc5.height = PKH;
        const gg5 = glowOc5.getContext('2d');
        gg5.fillStyle = '#ffffff';
        gg5.beginPath();
        facePath5(gg5);
        gg5.fill();
        gg5.globalCompositeOperation = 'source-atop';
        const fgr5 = gg5.createRadialGradient(pkX, pkY + pkRY * 0.3, 8, pkX, pkY, pkRX * 1.15);
        fgr5.addColorStop(0, 'rgba(255,248,214,1)');
        fgr5.addColorStop(0.45, 'rgba(255,240,170,0.96)');
        fgr5.addColorStop(1, 'rgba(255,168,36,0.8)');
        gg5.fillStyle = fgr5;
        gg5.fillRect(0, 0, PKW, PKH);
        gg5.globalCompositeOperation = 'source-over';
        const glowTex5 = new PIXI.Texture(new PIXI.BaseTexture(glowOc5));
        const pk5 = new PIXI.Container();
        pk5.pivot.set(PKW / 2, PKH / 2);
        const halo5 = new PIXI.Sprite(haloTex5);
        halo5.anchor.set(0.5);
        halo5.x = pkX;
        halo5.y = pkY - pkRY * 0.1;
        halo5.width = halo5.height = PKW * 2.1;
        halo5.blendMode = PIXI.BLEND_MODES.ADD;
        pk5.addChild(halo5);
        const core5 = new PIXI.Sprite(glowTex5);
        const coreBlur5 = new PIXI.BlurFilter(9, 3);
        coreBlur5.padding = 60;
        core5.filters = [coreBlur5];
        pk5.addChild(core5);
        const body5 = new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(bodyOc5)));
        pk5.addChild(body5);
        const spill5 = new PIXI.Sprite(glowTex5);
        const spillBlur5 = new PIXI.BlurFilter(34, 3);
        spillBlur5.padding = 150;
        spill5.filters = [spillBlur5];
        spill5.blendMode = PIXI.BLEND_MODES.ADD;
        pk5.addChild(spill5);
        a.stage.addChild(pk5);
        const embers5 = [];
        for (let i = 0; i < 26; i++) {
          const spr = new PIXI.Sprite(emberTex5);
          spr.anchor.set(0.5);
          spr.blendMode = PIXI.BLEND_MODES.ADD;
          a.stage.addChild(spr);
          embers5.push({
            spr,
            x: r(),
            y: r(),
            sz: 3 + 7 * r(),
            spd: 0.12 + 0.3 * r(),
            drift: 0.4 * (r() - 0.5),
            ph: r() * Math.PI * 2,
            wsp: 0.012 + 0.02 * r(),
          });
        }
        const lerpC5 = (c1, c2, t) => {
          const r1 = (c1 >> 16) & 255,
            g1 = (c1 >> 8) & 255,
            b1 = c1 & 255,
            r2 = (c2 >> 16) & 255,
            g2b = (c2 >> 8) & 255,
            b2 = c2 & 255;
          return (
            ((r1 + (r2 - r1) * t) << 16) | ((g1 + (g2b - g1) * t) << 8) | (b1 + (b2 - b1) * t)
          );
        };
        let fl5 = 1,
          flT5 = 1,
          flNext5 = 0;
        a.ticker.add(() => {
          const n = performance.now(),
            W = gW5(),
            H = gH5(),
            vT = vT5(),
            vH = vH5();
          if (n > flNext5) {
            flT5 = 0.44 + 0.66 * Math.random();
            flNext5 = n + 50 + Math.random() * 150;
          }
          fl5 += (flT5 - fl5) * 0.14;
          const s =
            fl5 * (0.82 + 0.15 * Math.sin(n * 0.0062) + 0.08 * Math.sin(n * 0.0173 + 1.1));
          const sc5 = Math.max(0.28, Math.min(1.22, s));
          const tint5 = lerpC5(0xf59517, 0xffe36e, Math.min(1, Math.max(0, (sc5 - 0.35) / 0.65)));
          core5.alpha = 0.42 + 0.58 * Math.min(1, sc5);
          core5.scale.set(0.995 + 0.012 * sc5);
          core5.tint = tint5;
          spill5.alpha = 0.06 + 0.26 * sc5;
          spill5.tint = lerpC5(0xf59e0b, 0xfff0a8, Math.min(1, Math.max(0, (sc5 - 0.35) / 0.65)));
          halo5.alpha = 0.1 + 0.28 * sc5;
          halo5.scale.set((PKW * 2.1 * (0.97 + 0.05 * sc5)) / 256);
          moonSpr5.x = W * 0.76;
          moonSpr5.y = vT + vH * 0.13;
          moonSpr5.width = moonSpr5.height = Math.min(W * 0.42, vH * 0.42);
          fogs5.forEach((f) => {
            const p = Math.sin((n / f.d) * Math.PI * 2 + f.ph);
            f.spr.x = f.cx * W + f.tx * W * p;
            f.spr.y = vT + f.cy * vH + f.ty * vH * p;
            f.spr.width = f.spr.height = (f.sz / 100) * W * 0.9;
          });
          const pkScale = Math.min(((W / 1.1) * 0.68) / PKW, (vH * 0.48) / PKH);
          pk5.scale.set(pkScale);
          pk5.x = W / 2;
          pk5.y = vT + vH * 0.7 + Math.sin(n * 0.0007) * vH * 0.006;
          embers5.forEach((e) => {
            e.ph += e.wsp;
            e.y -= e.spd / (vH || 1);
            e.x += (e.drift + Math.sin(e.ph) * 0.6) / (W || 1);
            if (e.y < -0.05) {
              e.y = 1.05;
              e.x = r();
            }
            if (e.x < -0.05) e.x = 1.05;
            if (e.x > 1.05) e.x = -0.05;
            e.spr.x = e.x * W;
            e.spr.y = vT + e.y * vH;
            e.spr.width = e.spr.height = e.sz * 2.6;
            e.spr.alpha = (0.25 + 0.45 * Math.abs(Math.sin(e.ph * 1.7))) * (0.5 + 0.5 * sc5);
          });
        });
      } else if (m === 6) {
        bg.style.background =
          'linear-gradient(180deg,#03081a 0%,#081130 32%,#0e1b42 56%,#0a1330 78%,#050a1c 100%)';
        const gW6 = () => a.screen.width || bg.offsetWidth || window.innerWidth;
        const gH6 = () => a.screen.height || bg.offsetHeight || window.innerHeight;
        const vT6 = () => gH6() * 0.0625;
        const vH6 = () => gH6() * 0.625;
        const dotOc6 = C('canvas');
        dotOc6.width = dotOc6.height = 32;
        const dg6 = dotOc6.getContext('2d'),
          dgr6 = dg6.createRadialGradient(16, 16, 0, 16, 16, 16);
        dgr6.addColorStop(0, 'rgba(255,255,255,1)');
        dgr6.addColorStop(0.42, 'rgba(255,255,255,0.7)');
        dgr6.addColorStop(1, 'rgba(255,255,255,0)');
        dg6.fillStyle = dgr6;
        dg6.fillRect(0, 0, 32, 32);
        const dotTex6 = new PIXI.Texture(new PIXI.BaseTexture(dotOc6));
        const moonOc6 = C('canvas');
        moonOc6.width = moonOc6.height = 256;
        const mg6 = moonOc6.getContext('2d'),
          mgr6 = mg6.createRadialGradient(128, 128, 40, 128, 128, 128);
        mgr6.addColorStop(0, 'rgba(200,225,255,0.34)');
        mgr6.addColorStop(0.45, 'rgba(140,180,240,0.11)');
        mgr6.addColorStop(1, 'rgba(90,130,200,0)');
        mg6.fillStyle = mgr6;
        mg6.fillRect(0, 0, 256, 256);
        const md6 = mg6.createRadialGradient(112, 108, 6, 128, 128, 58);
        md6.addColorStop(0, '#ffffff');
        md6.addColorStop(0.6, '#e2edff');
        md6.addColorStop(1, '#b9cbe8');
        mg6.beginPath();
        mg6.arc(128, 128, 56, 0, Math.PI * 2);
        mg6.fillStyle = md6;
        mg6.fill();
        mg6.fillStyle = 'rgba(150,175,210,0.28)';
        [
          [110, 112, 11],
          [148, 140, 14],
          [122, 156, 7],
        ].forEach(([mx, my, mr]) => {
          mg6.beginPath();
          mg6.arc(mx, my, mr, 0, Math.PI * 2);
          mg6.fill();
        });
        const moon6 = new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(moonOc6)));
        moon6.anchor.set(0.5);
        a.stage.addChild(moon6);
        const stars6 = [];
        for (let i = 0; i < 34; i++) {
          const spr = new PIXI.Sprite(dotTex6);
          spr.anchor.set(0.5);
          a.stage.addChild(spr);
          stars6.push({
            spr,
            x: r(),
            y: 0.02 + 0.42 * r(),
            sz: 2 + 3 * r(),
            ph: r() * Math.PI * 2,
            sp: 0.001 + 0.0022 * r(),
          });
        }
        const hills6 = new PIXI.Graphics();
        a.stage.addChild(hills6);
        const deerTex6 = (lead) => {
          const oc = C('canvas');
          oc.width = 140;
          oc.height = 120;
          const g2 = oc.getContext('2d');
          g2.lineCap = 'round';
          g2.strokeStyle = '#6b421d';
          g2.lineWidth = 6;
          [
            [46, 74, 24, 102],
            [56, 76, 46, 108],
            [92, 72, 114, 98],
            [86, 74, 74, 108],
          ].forEach(([x1, y1, x2, y2]) => {
            g2.beginPath();
            g2.moveTo(x1, y1);
            g2.lineTo(x2, y2);
            g2.stroke();
          });
          g2.fillStyle = '#8b5a2b';
          g2.beginPath();
          g2.ellipse(70, 62, 35, 20, 0, 0, Math.PI * 2);
          g2.fill();
          g2.beginPath();
          g2.moveTo(92, 54);
          g2.lineTo(104, 24);
          g2.lineTo(118, 30);
          g2.lineTo(102, 64);
          g2.closePath();
          g2.fill();
          g2.beginPath();
          g2.ellipse(115, 26, 16, 10, -0.34, 0, Math.PI * 2);
          g2.fill();
          g2.strokeStyle = '#8b5a2b';
          g2.lineWidth = 5;
          g2.beginPath();
          g2.moveTo(38, 58);
          g2.lineTo(26, 46);
          g2.stroke();
          g2.fillStyle = '#a97142';
          g2.beginPath();
          g2.ellipse(128, 21, 8, 5.5, -0.3, 0, Math.PI * 2);
          g2.fill();
          g2.fillStyle = lead ? '#ef4444' : '#3b2412';
          g2.beginPath();
          g2.arc(133, 18, 4.4, 0, Math.PI * 2);
          g2.fill();
          if (lead) {
            const ng = g2.createRadialGradient(133, 18, 1, 133, 18, 15);
            ng.addColorStop(0, 'rgba(248,113,113,0.55)');
            ng.addColorStop(1, 'rgba(239,68,68,0)');
            g2.fillStyle = ng;
            g2.beginPath();
            g2.arc(133, 18, 15, 0, Math.PI * 2);
            g2.fill();
          }
          g2.fillStyle = '#1b1108';
          g2.beginPath();
          g2.arc(117, 22, 2.1, 0, Math.PI * 2);
          g2.fill();
          g2.strokeStyle = '#d9b382';
          g2.lineWidth = 3.2;
          [
            [110, 17, 100, 2],
            [104, 9, 93, 5],
            [107, 8, 112, 0],
            [116, 15, 124, 3],
            [121, 8, 130, 4],
            [122, 7, 126, -2],
          ].forEach(([x1, y1, x2, y2]) => {
            g2.beginPath();
            g2.moveTo(x1, y1);
            g2.lineTo(x2, y2);
            g2.stroke();
          });
          return new PIXI.Texture(new PIXI.BaseTexture(oc));
        };
        const sleighOc6 = C('canvas');
        sleighOc6.width = 210;
        sleighOc6.height = 150;
        const sg6 = sleighOc6.getContext('2d');
        sg6.lineCap = 'round';
        sg6.strokeStyle = '#fbbf24';
        sg6.lineWidth = 6;
        sg6.beginPath();
        sg6.moveTo(20, 124);
        sg6.lineTo(158, 124);
        sg6.quadraticCurveTo(190, 124, 186, 96);
        sg6.stroke();
        sg6.lineWidth = 4;
        [
          [44, 124, 48, 104],
          [126, 124, 124, 104],
        ].forEach(([x1, y1, x2, y2]) => {
          sg6.beginPath();
          sg6.moveTo(x1, y1);
          sg6.lineTo(x2, y2);
          sg6.stroke();
        });
        const bodyPath6 = () => {
          sg6.beginPath();
          sg6.moveTo(36, 106);
          sg6.lineTo(150, 106);
          sg6.quadraticCurveTo(174, 104, 176, 82);
          sg6.lineTo(150, 78);
          sg6.lineTo(72, 78);
          sg6.lineTo(70, 44);
          sg6.quadraticCurveTo(68, 26, 44, 24);
          sg6.quadraticCurveTo(56, 40, 52, 62);
          sg6.quadraticCurveTo(38, 78, 36, 106);
          sg6.closePath();
        };
        const sgr6 = sg6.createLinearGradient(36, 24, 176, 106);
        sgr6.addColorStop(0, '#dc2626');
        sgr6.addColorStop(1, '#7f1d1d');
        bodyPath6();
        sg6.fillStyle = sgr6;
        sg6.fill();
        sg6.strokeStyle = '#fbbf24';
        sg6.lineWidth = 3;
        bodyPath6();
        sg6.stroke();
        sg6.fillStyle = '#166534';
        sg6.beginPath();
        sg6.ellipse(88, 62, 22, 17, 0, 0, Math.PI * 2);
        sg6.fill();
        [
          ['#b91c1c', 74, 46, 15, 13],
          ['#1d4ed8', 94, 44, 13, 12],
        ].forEach(([col, x, y, w, h]) => {
          sg6.fillStyle = col;
          sg6.fillRect(x, y, w, h);
          sg6.strokeStyle = '#fde68a';
          sg6.lineWidth = 2;
          sg6.beginPath();
          sg6.moveTo(x + w / 2, y);
          sg6.lineTo(x + w / 2, y + h);
          sg6.moveTo(x, y + h / 2);
          sg6.lineTo(x + w, y + h / 2);
          sg6.stroke();
        });
        sg6.fillStyle = '#dc2626';
        sg6.beginPath();
        sg6.ellipse(140, 62, 20, 23, 0, 0, Math.PI * 2);
        sg6.fill();
        sg6.fillStyle = '#f8fafc';
        sg6.fillRect(122, 74, 38, 7);
        sg6.fillStyle = '#f5c9a6';
        sg6.beginPath();
        sg6.arc(148, 32, 12, 0, Math.PI * 2);
        sg6.fill();
        sg6.fillStyle = '#f8fafc';
        sg6.beginPath();
        sg6.ellipse(147, 44, 13, 11, 0, 0, Math.PI * 2);
        sg6.fill();
        sg6.beginPath();
        sg6.ellipse(158, 34, 5, 4, 0, 0, Math.PI * 2);
        sg6.fill();
        sg6.fillStyle = '#1b1108';
        sg6.beginPath();
        sg6.arc(153, 29, 1.8, 0, Math.PI * 2);
        sg6.fill();
        sg6.fillStyle = '#dc2626';
        sg6.beginPath();
        sg6.moveTo(136, 24);
        sg6.quadraticCurveTo(140, 2, 122, 4);
        sg6.quadraticCurveTo(134, 12, 134, 24);
        sg6.closePath();
        sg6.fill();
        sg6.fillStyle = '#f8fafc';
        sg6.fillRect(133, 22, 26, 6);
        sg6.beginPath();
        sg6.arc(120, 5, 5, 0, Math.PI * 2);
        sg6.fill();
        sg6.strokeStyle = '#dc2626';
        sg6.lineWidth = 7;
        sg6.beginPath();
        sg6.moveTo(150, 56);
        sg6.lineTo(172, 44);
        sg6.stroke();
        sg6.fillStyle = '#f8fafc';
        sg6.beginPath();
        sg6.arc(174, 42, 5, 0, Math.PI * 2);
        sg6.fill();
        const sleighSpr6 = new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(sleighOc6)));
        sleighSpr6.anchor.set(0.5);
        const grp6 = new PIXI.Container();
        grp6.rotation = -0.07;
        const reins6 = new PIXI.Graphics();
        const deers6 = [];
        const leadT6 = deerTex6(true),
          normT6 = deerTex6(false);
        sleighSpr6.x = -290;
        sleighSpr6.y = 4;
        grp6.addChild(sleighSpr6);
        grp6.addChild(reins6);
        for (let i = 0; i < 4; i++) {
          const spr = new PIXI.Sprite(i === 3 ? leadT6 : normT6);
          spr.anchor.set(0.5);
          spr.x = -110 + i * 118;
          grp6.addChild(spr);
          deers6.push({ spr, ph: i * 0.8, bx: spr.x });
        }
        a.stage.addChild(grp6);
        const flakes6 = [];
        for (let i = 0; i < 110; i++) {
          const spr = new PIXI.Sprite(dotTex6);
          spr.anchor.set(0.5);
          a.stage.addChild(spr);
          flakes6.push({
            spr,
            x: r(),
            y: r(),
            sz: 2 + 5 * r(),
            spd: 0.22 + 0.7 * r(),
            drift: 0.3 * (r() - 0.5),
            ph: r() * Math.PI * 2,
            wsp: 0.008 + 0.022 * r(),
            al: 0.4 + 0.55 * r(),
          });
        }
        let lw6 = 0,
          lh6 = 0;
        a.ticker.add(() => {
          const n = performance.now(),
            W = gW6(),
            H = gH6(),
            vT = vT6(),
            vH = vH6(),
            vB = vT + vH;
          if (W !== lw6 || H !== lh6) {
            lw6 = W;
            lh6 = H;
            hills6.clear();
            hills6.beginFill(0xdce9ff, 0.07);
            hills6.moveTo(0, vB - vH * 0.04);
            hills6.bezierCurveTo(
              W * 0.22,
              vB - vH * 0.15,
              W * 0.4,
              vB - vH * 0.02,
              W * 0.6,
              vB - vH * 0.09
            );
            hills6.bezierCurveTo(W * 0.8, vB - vH * 0.16, W * 0.9, vB - vH * 0.02, W, vB - vH * 0.07);
            hills6.lineTo(W, H);
            hills6.lineTo(0, H);
            hills6.closePath();
            hills6.endFill();
            hills6.beginFill(0xffffff, 0.06);
            hills6.moveTo(0, vB + vH * 0.02);
            hills6.bezierCurveTo(
              W * 0.3,
              vB - vH * 0.06,
              W * 0.55,
              vB + vH * 0.04,
              W * 0.78,
              vB - vH * 0.03
            );
            hills6.bezierCurveTo(W * 0.9, vB - vH * 0.07, W * 0.96, vB + vH * 0.02, W, vB);
            hills6.lineTo(W, H);
            hills6.lineTo(0, H);
            hills6.closePath();
            hills6.endFill();
          }
          moon6.x = W * 0.78;
          moon6.y = vT + vH * 0.11;
          moon6.width = moon6.height = Math.min(W * 0.36, vH * 0.36);
          stars6.forEach((st) => {
            st.ph += st.sp;
            st.spr.x = st.x * W;
            st.spr.y = vT + st.y * vH;
            st.spr.width = st.spr.height = st.sz * 2.4;
            st.spr.alpha = 0.25 + 0.55 * Math.abs(Math.sin(st.ph));
          });
          const sc6 = Math.min(((W / 1.1) * 0.86) / 780, (vH * 0.3) / 150);
          grp6.scale.set(sc6);
          grp6.x = W / 2 + 30 * sc6;
          grp6.y = vT + vH * 0.3 + Math.sin(n * 0.0011) * vH * 0.022;
          deers6.forEach((d, i) => {
            d.spr.y = Math.sin(n * 0.0042 + d.ph) * 6;
            d.spr.rotation = Math.sin(n * 0.0042 + d.ph) * 0.05;
          });
          sleighSpr6.y = 4 + Math.sin(n * 0.0042 + 3.4) * 4;
          sleighSpr6.rotation = Math.sin(n * 0.0042 + 3.4) * 0.03;
          reins6.clear();
          reins6.lineStyle(3, 0x8b5a2b, 0.85);
          reins6.moveTo(sleighSpr6.x + 78, sleighSpr6.y - 42);
          deers6.forEach((d) => reins6.lineTo(d.bx + 10, d.spr.y - 14));
          flakes6.forEach((f) => {
            f.ph += f.wsp;
            f.y += f.spd / (vH || 1);
            f.x += (f.drift + Math.sin(f.ph) * 0.7) / (W || 1);
            if (f.y > 1.04) {
              f.y = -0.06 * Math.random();
              f.x = r();
            }
            if (f.x < -0.04) f.x = 1.04;
            if (f.x > 1.04) f.x = -0.04;
            f.spr.x = f.x * W;
            f.spr.y = vT + f.y * vH;
            f.spr.width = f.spr.height = f.sz * 2.2;
            f.spr.alpha = f.al;
          });
        });
      }
      if (m === 0 || m === 1) {
        a.ticker.add(() => {
          const n = performance.now(),
            W = a.screen.width,
            H = a.screen.height;
          for (const b of o) {
            if (m === 0) {
              const p = Math.sin((n / b.d) * Math.PI * 2 + b.ph);
              b.spr.x = b.cx * W + b.tx * W * p;
              b.spr.y = b.cy * H + b.ty * H * p;
              if (b.sz) b.spr.width = b.spr.height = (b.sz / 100) * W;
            } else {
              const p = (Math.sin((n / b.d) * Math.PI * 2 + b.ph) + 1) / 2;
              b.spr.x = b.sx * W + b.tx * W * p;
              b.spr.y = b.sy * H + b.ty * H * p;
              if (b.sz) b.spr.width = b.spr.height = (b.sz / 100) * W;
              if (b.r1 !== undefined) b.spr.rotation = b.r0 + (b.r1 - b.r0) * p;
            }
          }
        });
      }
      pixiApp = () => a.destroy(true, { children: true, texture: true, baseTexture: true });
      if (State.cfg.ambStatic)
        setTimeout(() => a.ticker.stop(), m === 2 || m === 3 || m >= 5 ? 350 : 50);
    } else {
      bg.style.background = '#0a1228';
      const PW = 128,
        PH = Math.round(
          (PW * (window.screen.height || window.innerHeight)) /
            (window.screen.width || window.innerWidth)
        );
      const pxCv = C('canvas');
      pxCv.width = PW;
      pxCv.height = PH;
      pxCv.style.cssText = `position:absolute;left:5vw;top:10vh;width:100vw;height:100vh;image-rendering:pixelated;image-rendering:-moz-crisp-edges;pointer-events:none`;
      bg.appendChild(pxCv);
      const pc = pxCv.getContext('2d');
      const SKY = [
          '#0a1228',
          '#101c40',
          '#182860',
          '#243880',
          '#2e4c98',
          '#4868b0',
          '#6888c8',
          '#9ab8d0',
        ],
        MT1 = '#243248',
        MT2 = '#1a2638',
        SN = '#c8d4e0',
        GRAS = '#3a8c2a',
        LGRA = '#58b040',
        EARTH = '#7a5828',
        DEAR = '#4a3010',
        HOUS = '#f4e4c0',
        ROOF = '#c02830',
        DOOR = '#8a5028',
        WIN = '#90c8e0',
        TRNK = '#6a4220',
        LEAF = '#287030',
        CHIM = '#8a4828',
        CLOU = '#ccd8e4',
        WATR = '#182848',
        WSURF = '#224878',
        WSHIM = '#3868a0',
        WF = '#90cef0',
        WF2 = '#d0f0ff',
        WFsp = '#b8eaff',
        STAR = '#fffff0',
        CB = '#3b41d8',
        CG = '#c07010',
        CR = '#b8223b';
      const fp = (x, y, w, h, col) => {
        if (w < 1 || h < 1) return;
        pc.fillStyle = col;
        pc.fillRect(~~x, ~~y, ~~w, ~~h);
      };
      const waterY = Math.round(PH * 0.58),
        wfX = Math.round(PW * 0.68),
        wfSY = Math.round(PH * 0.14);
      const iX = Math.round(PW * 0.42),
        iW = Math.round(PW * 0.36),
        iH = Math.round(iW * 0.27);
      const hbX = iX - 8;
      const mtN = new Int16Array(PW),
        mtF = new Int16Array(PW);
      [
        [PW * 0.14, PH * 0.04, PW * 0.52],
        [PW * 0.68, PH * 0.05, PW * 0.62],
        [PW * 0.96, PH * 0.08, PW * 0.4],
      ].forEach(([px, py, bw]) => {
        for (let x = 0; x < PW; x++) {
          const d = Math.abs(x - px) / (bw / 2);
          if (d < 1) mtN[x] = Math.max(mtN[x], Math.round((waterY - py) * (1 - d)));
        }
      });
      [
        [PW * 0.38, PH * 0.18, PW * 0.72],
        [PW * 0.82, PH * 0.22, PW * 0.5],
      ].forEach(([px, py, bw]) => {
        for (let x = 0; x < PW; x++) {
          const d = Math.abs(x - px) / (bw / 2);
          if (d < 1) mtF[x] = Math.max(mtF[x], Math.round((waterY - py) * (1 - d)));
        }
      });
      const snowThr = Math.round(waterY * 0.36);
      const wfPX = (y) =>
        wfX + Math.round(Math.sin(((y - wfSY) / (waterY - wfSY)) * Math.PI * 0.85) * 3);
      const stars5 = [];
      for (let i = 0; i < 16; i++) {
        stars5.push({
          x: ~~(r() * PW),
          y: ~~(r() * Math.round(waterY * 0.5)),
          on: r() > 0.4,
          t: ~~(r() * 40),
        });
      }
      const clds5 = [
        {
          x: r() * PW,
          y: Math.round(PH * 0.05) + ~~((r() - 0.5) * 4),
          w: 14 + ~~(r() * 8),
          spd: 0.06 + r() * 0.03,
        },
        {
          x: r() * PW + PW * 0.5,
          y: Math.round(PH * 0.08) + ~~((r() - 0.5) * 4),
          w: 11 + ~~(r() * 6),
          spd: 0.03 + r() * 0.02,
        },
        {
          x: r() * PW + PW * 0.8,
          y: Math.round(PH * 0.06) + ~~((r() - 0.5) * 3),
          w: 9 + ~~(r() * 5),
          spd: 0.04 + r() * 0.02,
        },
      ];
      const wfPs = [];
      for (let i = 0; i < 45; i++) {
        wfPs.push({ y: wfSY + r() * (waterY - wfSY), dx: ~~(r() * 3) - 1, spd: 1.4 + r() * 2.0 });
      }
      const splPs = [];
      for (let i = 0; i < 12; i++) {
        splPs.push({ x: wfX, y: waterY, vx: 0, vy: 0, life: 0, maxL: 5 + ~~(r() * 7) });
      }
      const iRows = [
        { dy: -iH - 3, hw: Math.round(iW * 0.24), c: LGRA, rc: '#1e4010' },
        { dy: -iH - 1, hw: Math.round(iW * 0.48), c: LGRA, rc: '#1e4010' },
        { dy: -iH + 1, hw: Math.round(iW * 0.7), c: GRAS, rc: '#183810' },
        { dy: -iH + 3, hw: Math.round(iW * 0.86), c: GRAS, rc: '#183810' },
        { dy: -iH + 5, hw: iW, c: GRAS, rc: '#183810' },
        { dy: -iH + 7, hw: Math.round(iW * 0.94), c: EARTH, rc: '#4a3010' },
        { dy: -iH + 9, hw: Math.round(iW * 0.8), c: EARTH, rc: '#3a2808' },
        { dy: -iH + 11, hw: Math.round(iW * 0.62), c: DEAR, rc: '#281e08' },
        { dy: -iH + 13, hw: Math.round(iW * 0.44), c: DEAR, rc: '#201808' },
        { dy: -iH + 15, hw: Math.round(iW * 0.26), c: DEAR, rc: '#201808' },
        { dy: -iH + 17, hw: Math.round(iW * 0.11), c: DEAR, rc: '#201808' },
      ];
      const drawScene5 = (n) => {
        pc.clearRect(0, 0, PW, PH);
        [
          [0, 0.07, SKY[0]],
          [0.07, 0.15, SKY[1]],
          [0.15, 0.23, SKY[2]],
          [0.23, 0.31, SKY[3]],
          [0.31, 0.39, SKY[4]],
          [0.39, 0.47, SKY[5]],
          [0.47, 0.54, SKY[6]],
          [0.54, waterY / PH, SKY[7]],
        ].forEach(([y0, y1, col]) => fp(0, ~~(y0 * PH), PW, Math.ceil((y1 - y0) * PH) + 1, col));
        stars5.forEach((s) => {
          if (--s.t <= 0) {
            s.on = !s.on;
            s.t = 12 + ~~(Math.random() * 45);
          }
          if (s.on) fp(s.x, s.y, 1, 1, STAR);
        });
        for (let x = 0; x < PW; x++) {
          const h = mtF[x];
          if (h > 0) fp(x, waterY - h, 1, h, MT1);
        }
        for (let x = 0; x < PW; x++) {
          const h = mtN[x];
          if (h > 0) {
            fp(x, waterY - h, 1, h, MT2);
            const sh = h - snowThr;
            if (sh > 0) fp(x, waterY - h, 1, Math.min(sh, 6), SN);
          }
        }
        for (let y = wfSY; y < waterY; y++) {
          const wx = wfPX(y);
          fp(wx - 1, y, 4, 1, WF);
          fp(wx, y, 2, 1, WF2);
        }
        clds5.forEach((cl) => {
          cl.x += cl.spd;
          if (cl.x > PW + cl.w) cl.x = -cl.w;
          const cx = ~~cl.x,
            cy = cl.y,
            cw = cl.w;
          fp(cx + 2, cy, cw - 3, 2, CLOU);
          fp(cx, cy + 2, cw, 3, CLOU);
          fp(cx + 1, cy + 4, cw - 2, 2, CLOU);
        });
        const fY = Math.round(Math.sin(n * 0.00044) * 2);
        const iy = waterY + fY;
        iRows.forEach((row) => fp(iX - row.hw, iy + row.dy, row.hw * 2, 2, row.c));
        const hbY = iy - iH - 2;
        fp(hbX, hbY - 14, 20, 14, HOUS);
        fp(hbX + 4, hbY - 25, 3, 12, CHIM);
        for (let ry = 0; ry < 12; ry++) {
          const rw = 12 - ry;
          fp(hbX + 10 - rw, hbY - 14 - ry, rw * 2, 1, ROOF);
        }
        fp(hbX + 6, hbY - 6, 8, 6, DOOR);
        fp(hbX + 1, hbY - 12, 6, 4, WIN);
        fp(hbX + 13, hbY - 12, 5, 4, WIN);
        const t1x = hbX - 9,
          t1y = hbY - 1;
        fp(t1x + 3, t1y - 9, 2, 9, TRNK);
        fp(t1x, t1y - 17, 9, 8, LEAF);
        fp(t1x + 1, t1y - 22, 7, 6, LEAF);
        fp(t1x + 2, t1y - 27, 5, 5, LEAF);
        const t2x = hbX + 22,
          t2y = hbY - 2;
        fp(t2x + 2, t2y - 7, 2, 7, TRNK);
        fp(t2x, t2y - 14, 8, 7, LEAF);
        fp(t2x + 1, t2y - 18, 6, 5, LEAF);
        fp(hbX + 21, hbY - 4, 5, 3, GRAS);
        wfPs.forEach((p) => {
          p.y += p.spd;
          if (p.y >= waterY) {
            p.y = wfSY + Math.random() * 18;
            const sp = splPs[~~(Math.random() * splPs.length)];
            sp.x = wfPX(waterY) + ~~((Math.random() - 0.5) * 3);
            sp.y = waterY;
            sp.vx = (Math.random() - 0.5) * 2.5;
            sp.vy = -(Math.random() * 1.5 + 0.4);
            sp.life = sp.maxL;
          }
          fp(~~(wfPX(~~p.y) + p.dx), ~~p.y, 1, Math.ceil(p.spd * 0.6), WF2);
        });
        splPs.forEach((sp) => {
          if (sp.life > 0) {
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.vy += 0.35;
            sp.life--;
            if (sp.y >= waterY - 1 && sp.y < waterY + 6) fp(~~sp.x, ~~sp.y, 1, 1, WFsp);
          }
        });
        fp(0, waterY, PW, PH - waterY + 1, WATR);
        fp(0, waterY, PW, 3, WSURF);
        for (let x = 0; x < PW; x += 3)
          fp(x, waterY + (Math.sin(x * 0.25 + n * 0.002) > 0 ? 1 : 0), 2, 1, '#2e5e92');
        [0.09, 0.22, 0.37, 0.53, 0.69, 0.85].forEach((t, i) => {
          const sy = waterY + ~~((PH - waterY) * t) + 4;
          const sw = 3 + ~~(Math.abs(Math.sin(n * 0.001 + i * 1.4)) * 9);
          const sx = ~~(PW * 0.08 + Math.sin(n * 0.0008 + i) * PW * 0.26);
          fp(sx, sy, sw, 1, WSHIM);
          fp(PW - sx - sw, sy + 1, sw, 1, WSHIM);
        });
        const rX = wfPX(waterY);
        [4, 8, 13].forEach((rd, i) => {
          if (Math.sin(n * 0.003 + i * 1.2) > 0.0) {
            fp(rX - rd, waterY + 2, 2, 1, '#58a8c8');
            fp(rX + rd - 1, waterY + 2, 2, 1, '#58a8c8');
          }
        });
        const wvP = n * 0.0018;
        iRows.forEach((row) => {
          const refY = waterY + (waterY - (iy + row.dy));
          if (refY <= waterY || refY >= PH) return;
          const wv = ~~(Math.sin(refY * 0.45 + wvP) * 2);
          fp(iX - row.hw + wv, refY, row.hw * 2, 2, row.rc);
        });
        const rfHY = waterY + (waterY - hbY);
        if (rfHY > waterY && rfHY < PH - 14) {
          const wv = ~~(Math.sin(rfHY * 0.4 + wvP) * 2);
          fp(hbX + wv, rfHY, 20, 7, '#a88850');
          for (let ry = 0; ry < 8; ry++) {
            const rw = 12 - ~~(ry * 0.9);
            fp(
              hbX + 10 - rw + wv + ~~(Math.sin((rfHY + ry) * 0.45 + wvP) * 1.5),
              rfHY + 7 + ry,
              rw * 2,
              1,
              '#801a10'
            );
          }
        }
        const rT1Y = waterY + (waterY - (t1y - 17));
        if (rT1Y > waterY && rT1Y < PH - 7) {
          const wv = ~~(Math.sin(rT1Y * 0.4 + wvP) * 2);
          fp(t1x + wv, rT1Y, 9, 7, '#184018');
          fp(t1x + 1 + wv, rT1Y + 6, 7, 5, '#184018');
        }
        const rT2Y = waterY + (waterY - (t2y - 14));
        if (rT2Y > waterY && rT2Y < PH - 5) {
          const wv = ~~(Math.sin(rT2Y * 0.4 + wvP) * 2);
          fp(t2x + wv, rT2Y, 8, 6, '#184018');
        }
        const cardY = waterY + Math.round((PH - waterY) * 0.38);
        for (let row = 0; row < 14; row++) {
          const wv = ~~(Math.sin((cardY + row) * 0.45 + wvP) * 2);
          fp(iX - 13 + wv + ~~((row / 14) * 3), cardY + row, 10, 1, CB);
        }
        for (let row = 0; row < 16; row++) {
          const wv = ~~(Math.sin((cardY + row) * 0.45 + wvP) * 2);
          fp(iX - 5 + wv, cardY + 2 + row, 12, 1, CG);
        }
        const sWv = ~~(Math.sin((cardY + 10) * 0.45 + wvP) * 2);
        fp(iX - 1 + sWv, cardY + 10, 1, 5, '#ffe060');
        fp(iX - 2 + sWv, cardY + 11, 5, 1, '#ffe060');
        for (let row = 0; row < 14; row++) {
          const wv = ~~(Math.sin((cardY + row) * 0.45 + wvP) * 2);
          fp(iX + 5 + wv - ~~((row / 14) * 3), cardY + row, 10, 1, CR);
        }
        pc.save();
        pc.globalAlpha = 0.15 + 0.06 * Math.sin(n * 0.0006);
        pc.font = 'bold 5px monospace';
        pc.fillStyle = '#c8902a';
        const rT = 'MGO Tracker.',
          rTw = pc.measureText(rT).width;
        pc.translate(~~(PW / 2), cardY - 8);
        pc.scale(1, -1);
        pc.fillText(rT, ~~(-rTw / 2), -4);
        pc.restore();
      };
      let _rafId5 = 0,
        _fc5 = 0;
      const _tick5 = () => {
        _rafId5 = requestAnimationFrame(_tick5);
        if (++_fc5 % 4 !== 0) return;
        drawScene5(performance.now());
      };
      pixiApp = () => cancelAnimationFrame(_rafId5);
      if (State.cfg.ambStatic) drawScene5(performance.now());
      else requestAnimationFrame(_tick5);
    }
  },
  syncUndoBtn() {
    const btn = D.querySelector('[data-action="undo"]');
    if (!btn) return;
    const has = undoStack.length > 0;
    btn.style.color = has ? 'var(--p)' : 'rgba(255,255,255,.4)';
    btn.style.opacity = has ? '1' : '0.5';
  },
  renderAmbiaSel() {
    const c = E('initAmbiance-sel');
    const _fade = () => {
      const _bg = E('ambient-bg');
      if (_bg) {
        _bg.style.opacity = '0';
        setTimeout(() => {
          this.initAmbiance();
          requestAnimationFrame(() => requestAnimationFrame(() => (_bg.style.opacity = '1')));
        }, 450);
      }
    };
    if (!c) return;
    if (!Season.allowed(State.cfg.ambiance)) {
      State.cfg.ambiance = Season.allowed(State.cfg.ambPrev) ? State.cfg.ambPrev : 0;
      State.cfg.ambPrev = null;
      State.saveCfg();
      _fade();
      this.toast(T('cheat_3'));
    }
    c.innerHTML = '';
    const I = [
        `<svg width='22' height='14' viewBox='0 0 22 14' xmlns='http://www.w3.org/2000/svg'><ellipse cx='5' cy='8' rx='4.5' ry='3.5' fill='#818cf8' opacity='.7'/><ellipse cx='12' cy='6' rx='5.5' ry='4.5' fill='#6366f1' opacity='.6'/><ellipse cx='18' cy='9' rx='4' ry='3' fill='#c084fc' opacity='.65'/><circle cx='9' cy='4' r='2' fill='#f472b6' opacity='.5'/><circle cx='4' cy='5' r='1.5' fill='#fbbf24' opacity='.4'/></svg>`,
        `<svg width='20' height='14' viewBox='0 0 20 14' xmlns='http://www.w3.org/2000/svg'><rect x='0' y='2' width='6' height='10' rx='1.5' fill='#3b41d8' transform='rotate(-10,3,7)'/><rect x='7' y='1' width='6' height='12' rx='1.5' fill='#c77b10'/><rect x='14' y='2' width='6' height='10' rx='1.5' fill='#b8223b' transform='rotate(10,17,7)'/></svg>`,
        `<svg width='22' height='14' viewBox='0 0 22 14' xmlns='http://www.w3.org/2000/svg'><path d='M0,5 C3,2 6,8 9,5 C12,2 15,8 18,5 L22,4' stroke='#38bdf8' stroke-width='1.5' fill='none' opacity='.9'/><circle cx='4' cy='11' r='1.5' stroke='#7dd3fc' stroke-width='1' fill='none'/><circle cx='10' cy='12' r='1' stroke='#7dd3fc' stroke-width='.8' fill='none' opacity='.7'/><circle cx='16' cy='10' r='2' stroke='#38bdf8' stroke-width='1' fill='none'/><circle cx='7' cy='9' r='.8' fill='#38bdf8' opacity='.4'/></svg>`,
        `<svg width='22' height='14' viewBox='0 0 22 14' xmlns='http://www.w3.org/2000/svg'><ellipse cx='6' cy='10' rx='4.5' ry='3.5' fill='#6366f1' opacity='.75'/><ellipse cx='13' cy='7' rx='5' ry='4' fill='#c77b10' opacity='.7'/><ellipse cx='18' cy='10' rx='4' ry='3' fill='#b8223b' opacity='.7'/><ellipse cx='10' cy='10' rx='3' ry='2.5' fill='#c084fc' opacity='.55'/></svg>`,
        `<svg width='22' height='14' viewBox='0 0 24 14' xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='11' x2='24' y2='11' stroke='#38bdf8' stroke-width='2' opacity='.7'/><polygon points='12,3 9,8 15,8' fill='#fbbf24'/><rect x='10' y='8' width='4' height='3' fill='#fbbf24'/><rect x='11.5' y='9' width='1' height='2' fill='#0ea5e9'/><text x='0' y='6' font-size='5' fill='#fbbf24' opacity='.9'>✦</text><text x='17' y='7' font-size='4' fill='#fbbf24' opacity='.8'>✦</text><text x='21' y='5' font-size='3.5' fill='#fbbf24' opacity='.7'>✦</text></svg>`,
        `<svg width='22' height='14' viewBox='0 0 22 14' xmlns='http://www.w3.org/2000/svg'><rect x='10.2' y='.8' width='1.7' height='3.2' rx='.8' fill='#4a3a16'/><ellipse cx='11' cy='8.6' rx='8' ry='5.2' fill='#c2410c'/><ellipse cx='11' cy='8.6' rx='4.4' ry='5.2' fill='#f97316'/><polygon points='7.2,6.4 9.6,7.3 7.8,8.5' fill='#fde047'/><polygon points='14.8,6.4 12.4,7.3 14.2,8.5' fill='#fde047'/><path d='M7.8 10.2 L9.4 11.5 L11 10.4 L12.6 11.5 L14.2 10.2' stroke='#fde047' stroke-width='1.3' fill='none' stroke-linejoin='round'/></svg>`,
        `<svg width='22' height='14' viewBox='0 0 22 14' xmlns='http://www.w3.org/2000/svg'><circle cx='3.2' cy='2.6' r='1' fill='#e2e8f0'/><circle cx='9' cy='1.6' r='.7' fill='#cbd5e1'/><circle cx='20' cy='4' r='.8' fill='#e2e8f0'/><path d='M4 11.4h9.2c1.9 0 2.7-1.2 2.2-2.6' stroke='#fbbf24' stroke-width='1.3' fill='none' stroke-linecap='round'/><path d='M5.2 9h7.4l1-3.4H7.4C5.6 5.6 5.2 7.2 5.2 9z' fill='#dc2626'/><circle cx='18.2' cy='7.4' r='1.7' fill='#8b5a2b'/><path d='M17.6 5.6 16.6 3.8M18.8 5.5 20 4.1' stroke='#d9b382' stroke-width='.9' stroke-linecap='round'/><circle cx='19.8' cy='7.6' r='.8' fill='#ef4444'/></svg>`,
      ],
      L = [T('amb_0'), T('amb_1'), T('amb_2'), T('amb_3'), T('amb_4'), T('amb_5'), T('amb_6')],
      avail = Season.list();
    const _sub = () => (State.cfg.ambStatic ? T('amb_stop').replace(/\S+ /, '') : T('amb_ani'));
    const subEl = E('initAmbiance-sub-lbl'),
      togBtn = E('initAmbiance-tog-btn');
    if (subEl) {
      subEl.textContent = `${State.cfg.ambStatic ? '⏸' : '▶'} ${_sub()}`;
      subEl.className = 'initAmbiance-sub ' + (State.cfg.ambStatic ? 'is-static' : 'is-anim');
    }
    if (togBtn)
      togBtn.onclick = () => {
        State.cfg.ambStatic = !State.cfg.ambStatic;
        State.saveCfg();
        _fade();
        this.renderAmbiaSel();
      };
    for (const i of avail) {
      const b = C('button');
      b.className =
        'initAmbiance-pill' +
        (State.cfg.ambiance === i ? ' active' : '') +
        (i >= 5 ? ' is-season' : '');
      b.dataset.v = i;
      b.innerHTML = I[i];
      b.title = L[i];
      b.onclick = () => {
        if (State.cfg.ambiance !== i) {
          State.cfg.ambiance = i;
          State.saveCfg();
          _fade();
          c.querySelectorAll('.initAmbiance-pill').forEach((p) =>
            p.classList.toggle('active', +p.dataset.v === i)
          );
          this.toast(L[i]);
        }
      };
      c.appendChild(b);
    }
  },
  renderMain() {
    const a = E('gen-cards');
    a.innerHTML = '';
    const alb = State.cfg.albums,
      hlf = Math.ceil(alb / 2),
      w = 100 / hlf;
    State.cfg.usersList.forEach((n, i) => {
      const uid = n.replace(/\s/g, ''),
        isp = i === 0;
      const cardClasses = ['glass-card', 'anim-section',
        isp ? 'is-primary' : '',
        (isp && State.cfg.mode === 'number') ? 'mode-num' : '',
      ].filter(Boolean).join(' ');
      const modeBtn = isp
        ? `<button class="mini-btn mode-toggle-btn" data-action="mode-toggle">${State.cfg.mode === 'number' ? '123' : 'XXX'}</button>`
        : '';
      a.insertAdjacentHTML('beforeend', `
        <article class="${cardClasses}" data-sec="${esc(uid)}">
          <header class="card-header">
            <div class="user-info">
              <div class="user-avatar">
                <div class="ua-inner">
                  <span class="ua-name">${esc(n)}</span>
                  <div class="ua-vsep"></div><span class="ua-top">0/0</span>
                  <div class="ua-vsep"></div><span class="ua-bot">★ 0/0</span>
                  <div class="ua-vsep"></div><span class="ua-percent">0%</span>
                </div>
              </div>
              ${modeBtn}
              <p class="user-name">${esc(n)}</p>
            </div>
            <div class="card-tools">
              <button class="mini-btn danger reset-u-btn" data-action="reset-u">↺</button>
            </div>
            <div class="expand-hint">${T('exp_hint') || ''}</div>
          </header>
          <div data-u="${esc(uid)}">
            <div class="grid-scroll">
              <div class="track-row">${this._gr(1, hlf, w)}</div>
              <div class="track-row">${this._gr(hlf + 1, alb - hlf, w)}</div>
            </div>
            <div class="legend-bar">
              <div class="legend-item"><div class="legend-swatch s-have"></div>${T('ocard') || ''}</div>
              <div class="legend-item"><div class="legend-swatch s-dupe"></div>${T('dcard') || ''}</div>
              <div class="legend-item"><div class="legend-swatch s-gold-dot"></div>${T('gcard') || ''}</div>
            </div>
          </div>
        </article>`
      );
    });
    const firstUid = State.cfg.usersList[0]?.replace(/\s/g, '') || '',
      noteEl = E('app-header-note');
    if (noteEl) {
      noteEl.placeholder = T('note_ph');
      noteEl.value = State.usr[firstUid]?.note || '';
      noteEl.dataset.uid = firstUid;
      noteEl.oninput = () => {
        const v = noteEl.value,
          uid = noteEl.dataset.uid;
        if (State.usr[uid]) {
          if (v) State.usr[uid].note = v;
          else delete State.usr[uid].note;
          clearTimeout(noteTimer);
          noteTimer = setTimeout(() => State.saveUser(uid), 400);
        }
      };
    }
    this.rerender();
  },
  _gr(s, c, w) {
    let h = '';
    for (let i = 0; i < c; i++) {
      let g = '';
      for (let k = 0; k < 9; k++)
        g += `<div class="cell-wrap" data-uid="${9 * (s + i - 1) + k}" data-st="0"><div class="i-dot i-dupe"></div><div class="i-dot i-gold"></div><div class="cell-inner"><span class="t-x">X</span><span class="t-num"></span></div></div>`;
      h += `<div class="alb-col" style="width:${w}%;--col-w:${w}%"><div class="alb-head">${T('alb_lbl')} ${s + i}</div><div class="alb-grid">${g}</div></div>`;
    }
    return h;
  },
  rerender() {
    const g = State.getGoldSet(),
      d = State.getDupSet();
    Q('.glass-card[data-sec]').forEach((card) => {
      const u = card.dataset.sec;
      if (!State.usr[u]) return;
      card.querySelectorAll('.cell-wrap').forEach((c) => {
        const id = +c.dataset.uid,
          st = State.usr[u].state?.[id] || 0,
          nm = State.usr[u].nums?.[id] || '';
        this.renderCell(c, st, nm, g.has(id), d.has(id));
      });
    });
    this.updateStats();
    this.updateVis();
  },
  updateCell(u, c, val) {
    const isG = State.getGoldSet().has(+c),
      st = State.usr[u]?.state?.[c] || 0,
      nm = State.usr[u]?.nums?.[c] || '';
    if (val === 2 || st === 2) {
      const isD = State.getDupSet().has(+c);
      Q(`.cell-wrap[data-uid="${c}"]`).forEach((el) => {
        const uid = el.closest('[data-u]')?.dataset.u;
        if (uid)
          this.renderCell(
            el,
            State.usr[uid]?.state?.[c] || 0,
            State.usr[uid]?.nums?.[c] || '',
            isG,
            isD
          );
      });
    } else {
      const el = D.querySelector(
        `.glass-card[data-sec="${u}"] [data-u="${u}"] .cell-wrap[data-uid="${c}"]`
      );
      if (el) this.renderCell(el, st, nm, isG, State.getDupSet().has(+c));
    }
    this.updateStats(u);
  },
  renderCell(c, st, nm, isG, isD) {
    c.dataset.st = st;
    const ns = c.querySelector('.t-num');
    if (ns.textContent !== nm + '') ns.textContent = nm + '';
    isG ? (c.dataset.bg = '1') : delete c.dataset.bg;
    c.classList.remove('show-gold', 'show-dupe');
    if (st === 0) {
      if (isG) c.classList.add('show-gold');
      if (isD) c.classList.add('show-dupe');
    }
  },
  updateStats(sec = null) {
    const tot = State.cfg.albums * 9,
      gSet = State.getGoldSet();
    let gt = 0;
    for (const id of gSet) {
      if (id < tot) gt++;
    }
    const cards = sec
      ? [D.querySelector(`.glass-card[data-sec="${sec}"]`)].filter(Boolean)
      : [...Q('.glass-card[data-sec]')];
    cards.forEach((c) => {
      const u = State.usr[c.dataset.sec];
      if (!u || !u.state) return;
      let n = 0,
        g = 0;
      for (const [sid, st] of Object.entries(u.state)) {
        if (st > 0) {
          const id = +sid;
          if (id < tot) {
            n++;
            if (gSet.has(id)) g++;
          }
        }
      }
      const pct = tot > 0 ? Math.round((n / tot) * 100) : 0,
        pctCol = pct === 100 ? 'var(--gold)' : pct >= 50 ? '#fb923c' : '#f87171';
      const ut = c.querySelector('.ua-top'),
        ub = c.querySelector('.ua-bot'),
        up = c.querySelector('.ua-percent'),
        av = c.querySelector('.user-avatar');
      if (ut) ut.textContent = `${n}/${tot}`;
      if (ub) ub.textContent = `★ ${g}/${gt}`;
      if (up) {
        up.textContent = pct + '%';
        up.style.color = pctCol;
      }
      if (av)
        av.style.background =
          pct === 100
            ? 'var(--gold)'
            : pct >= 50
              ? `conic-gradient(#f97316 ${pct}%,var(--p) 0)`
              : `conic-gradient(var(--ok) ${pct}%,var(--p) 0)`;
    });
    const hc = E('hdr-cards'),
      hg = E('hdr-gold');
    if (hc) hc.textContent = tot;
    if (hg) hg.textContent = gSet.size;
  },
  updateVis() {
    const hs = new Set(State.cfg.hidden);
    Q('.anim-section').forEach((e) => e.classList.toggle('hidden', hs.has(e.dataset.sec)));
  },
  renderGoldEx() {
    const c = E('gold-list');
    c.innerHTML = '';
    let sBox = E('gx-suggest-box');
    if (!sBox) {
      sBox = C('div');
      sBox.id = 'gx-suggest-box';
      sBox.className = 'gx-suggest';
      sBox.style.display = 'none';
      D.body.appendChild(sBox);
      D.addEventListener('pointerdown', (e) => {
        if (!sBox.contains(e.target) && e.target.dataset?.f !== 'card')
          hideSuggest();
      }, true);
    }
    const hideSuggest = () => { sBox.style.display = 'none'; sBox.innerHTML = ''; };
    const showSuggest = (cardInp, alb, query) => {
      hideSuggest();
      if (!query) return;
      const matches = GoldNote.namesForAlbum(alb).filter((n) =>
        n.toLowerCase().startsWith(query.toLowerCase())
      );
      if (!matches.length) return;
      const rect = cardInp.getBoundingClientRect();
      sBox.style.cssText = `display:block;left:${rect.left}px;top:${rect.bottom + 3}px;width:${Math.max(rect.width, 150)}px`;
      matches.forEach((name) => {
        const it = C('div');
        it.className = 'gx-suggest-item';
        it.textContent = name;
        it.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          cardInp.value = name;
          State.cfg.gold_ex[idx].card = name;
          State.saveCfg();
          cardInp._skipNextSuggest = true;
          hideSuggest();
          cardInp.focus();
        });
        sBox.appendChild(it);
      });
    };
    if (State.cfg.gold_ex.length > 0)
      c.insertAdjacentHTML(
        'beforeend',
        `<li class="gold-row-header"><span>${esc(T('alb_lbl'))}</span><span>${esc(T('crd_lbl'))}</span><span>${esc(T('dt_lbl'))}</span><span></span></li>`
      );
    State.cfg.gold_ex.forEach((item, idx) => {
      const r = C('li');
      r.className = 'gold-row';
      r.innerHTML = `<input class="g-inp" data-f="alb" maxlength="2" inputmode="numeric" placeholder="--" value="${esc(item.alb || item.album || '')}"><input class="g-inp" data-f="card" placeholder="${esc(T('crd_lbl'))}" value="${esc(item.card || '')}"><input class="g-inp" data-f="date" maxlength="5" inputmode="numeric" placeholder="${T('date_ph')}" value="${esc(item.date || '')}"><button class="g-del-btn" data-action="del-gold" data-idx="${idx}">${EMOJIS.cls}</button>`;
      const albInp  = r.querySelector('[data-f="alb"]');
      const cardInp = r.querySelector('[data-f="card"]');
      r.addEventListener('input', (ev) => {
        const inp = ev.target, f = inp.dataset.f;
        if (f === 'alb') {
          inp.value = inp.value.replace(/\D/g, '').slice(0, 2);
          State.cfg.gold_ex[idx].alb = inp.value;
          hideSuggest();
        }
        if (f === 'card') {
          State.cfg.gold_ex[idx].card = inp.value;
          if (inp._skipNextSuggest) {
            inp._skipNextSuggest = false;
            hideSuggest();
          } else {
            showSuggest(inp, albInp.value, inp.value);
          }
        }
        if (f === 'date') {
          let raw = inp.value.replace(/\D/g, '').slice(0, 4);
          inp.value = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
          State.cfg.gold_ex[idx].date = inp.value;
        }
        if (f) State.saveCfg();
      });
      r.addEventListener('keydown', (ev) => {
        if (ev.target.dataset.f === 'date' && ev.key === 'Backspace' && ev.target.value.endsWith('/'))
          ev.target.value = ev.target.value.slice(0, -1);
      });
      cardInp.addEventListener('blur', () => setTimeout(hideSuggest, 180));
      c.appendChild(r);
    });
  },
  renderMenu() {
    const v = E('players-list'),
      p = E('sub-print');
    v.innerHTML = '';
    p.innerHTML = '';
    [...State.cfg.usersList, 'Gold'].forEach((s) => {
      const id = s === 'Gold' ? 'Gold' : s.replace(/\s/g, ''),
        h = State.cfg.hidden.includes(id);
      const shareBtn =
        s !== 'Gold'
          ? `<button class="mini-btn pl-share-btn" data-share-name="${esc(s)}" data-share-id="${esc(id)}">${EMOJIS.shr}</button>`
          : ``;
      v.insertAdjacentHTML('beforeend', `
        <div class="menu-item menu-player-row">
          <div class="menu-player-info">${shareBtn}<span>${esc(s)}</span></div>
          <label class="menu-vis-label">
            <input type="checkbox" ${h ? '' : 'checked'} class="vis-toggle" data-vis-id="${esc(id)}">
            <div class="switch"></div>
          </label>
        </div>`
      );
      p.insertAdjacentHTML(
        'beforeend',
        `<div class="menu-item print-item"><span>${esc(s)}</span><label style="cursor:pointer;display:flex;align-items:center"><input type="checkbox" class="print-checkUrl" value="${esc(id)}" checked style="display:none"><div class="switch switch-sm"></div></label></div>`
      );
    });
    p.insertAdjacentHTML(
      'beforeend',
      `<button class="mini-btn print-launch-btn" data-action="do-print">${T('print_btn')}</button>`
    );
  },
  renderGoldGrid(id) {
    const c = E(id);
    if (!c) return;
    c.innerHTML = '';
    const r = C('div');
    r.className = 'g-conf-row';
    const gS = State.getGoldSet();
    for (let i = 1; i <= State.cfg.albums; i++) {
      let cl = '';
      for (let k = 0; k < 9; k++) {
        const u = 9 * (i - 1) + k;
        cl += `<div class="g-cell ${gS.has(u) ? 'active' : ''}" data-uid="${u}"></div>`;
      }
      r.insertAdjacentHTML(
        'beforeend',
        `<div class="g-conf-col"><span style="font-size:9px;font-weight:700;margin-bottom:2px">${T('alb_lbl')} ${i}</span><div class="g-conf-grid">${cl}</div></div>`
      );
    }
    r.onclick = (e) => {
      if (e.target.classList.contains('g-cell')) {
        const uid = +e.target.dataset.uid,
          a = e.target.classList.contains('active');
        State.setGold(uid, !a);
        e.target.classList.toggle('active');
      }
    };
    c.appendChild(r);
  },
};
let lastCell = null,
  lastClickMs = 0;
let dockEl = null;
const Actions = {
  handle(e) {
    const t = e.target,
      a = t.closest('[data-action]'),
      c = t.closest('.cell-wrap'),
      cd = t.closest('.glass-card');
    if (!dockEl) dockEl = Q('.dock')[0];
    if (t.closest('.dock')) {
      clearTimeout(dockTimer);
      if (dockEl) dockEl.classList.add('dock-lit');
      dockTimer = setTimeout(() => {
        if (dockEl) dockEl.classList.remove('dock-lit');
      }, 3e3);
    }
    if (
      D.contains(t) &&
      !t.closest('.popover') &&
      !t.closest('.dock') &&
      !t.closest('.modal-overlay')
    ) {
      closeAllPopovers();
      if (dockEl) dockEl.classList.remove('dock-lit');
      PlayerManager.close();
    }
    if (c && t.tagName !== 'INPUT') {
      if (e.type === 'dblclick') {
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      const nw = Date.now();
      if (lastCell === c && nw - lastClickMs < 300) {
        lastCell = null;
        return;
      }
      lastCell = c;
      lastClickMs = nw;
      const p = cd && cd.classList.contains('is-primary'),
        u = c.closest('[data-u]')?.dataset.u,
        id = +c.dataset.uid;
      if (!u || !State.usr[u]) return;
      if (State.cfg.mode === 'number' && p) {
        e.stopPropagation();
        const i = c.querySelector('.cell-inner');
        i.innerHTML = '';
        const inp = C('input');
        inp.className = 'cell-input';
        inp.type = 'tel';
        inp.value = State.usr[u].nums[id] || '';
        inp.onblur = () => {
          State.updateCard(u, id, inp.value.trim(), true);
          UI.updateCell(u, id, -1);
        };
        inp.onkeydown = (ev) => {
          if (ev.key === 'Enter') inp.blur();
        };
        i.appendChild(inp);
        setTimeout(() => {
          try {
            inp.focus();
          } catch (er) {}
        }, 50);
        return;
      }
      const st = State.usr[u].state[id] || 0,
        nx = (st + 1) % 3;
      undoStack.push({ u, c: id, v: st });
      if (undoStack.length > 50) undoStack.shift();
      State.updateCard(u, id, nx);
      UI.updateCell(u, id, st);
      UI.syncUndoBtn();
      return;
    }
    if (cd && e.type === 'dblclick' && !a && !c) {
      const ch = cd.offsetHeight,
        isExp = cd.classList.contains('expanded');
      const hint = cd.querySelector('.expand-hint');
      if (isExp) {
        cd.classList.remove('blur-active', 'expanded');
        cd.classList.add('blur-out', 'transitioning');
        if (hint) hint.textContent = T('exp_hint');
      } else {
        cd.classList.add('transitioning', 'expanded');
        if (hint) hint.textContent = T('col_hint');
      }
      requestAnimationFrame(() => {
        const ch2 = cd.offsetHeight,
          r = ch / Math.max(ch2, 1);
        cd.style.transformOrigin = 'top center';
        cd.style.transition = 'none';
        cd.style.transform = `scaleY(${r})`;
        requestAnimationFrame(() => {
          cd.style.transition = 'transform 0.42s var(--ease)';
          cd.style.transform = 'scaleY(1)';
          setTimeout(() => {
            cd.style.cssText = '';
            cd.classList.remove('transitioning');
            if (isExp) cd.classList.remove('blur-out');
            else cd.classList.add('blur-active');
          }, 440);
        });
      });
      return;
    }
    if (t.classList.contains('pl-share-btn')) {
      Share.quick(t.dataset.shareName, t.dataset.shareId, t);
      return;
    }
    if (!a) return;
    e.stopPropagation();
    const act = a.dataset.action,
      m = {
        'toggle-menu': () => {
          const [p1, p2] = [E('pop-menu'), E('pop-players')];
          const opening = !p1.classList.contains('show');
          p1.classList.toggle('show', opening);
          a.classList.toggle('active', opening);
          if (opening) {
            p2.classList.remove('show');
            PlayerManager.close();
            D.querySelector('[data-action="toggle-players"]')?.classList.remove('active');
          }
        },
        'toggle-players': () => {
          const [p1, p2] = [E('pop-menu'), E('pop-players')];
          const opening = !p2.classList.contains('show');
          p2.classList.toggle('show', opening);
          a.classList.toggle('active', opening);
          if (opening) {
            p1.classList.remove('show');
            D.querySelector('[data-action="toggle-menu"]')?.classList.remove('active');
          } else {
            PlayerManager.close();
          }
        },
        'open-players': () => PlayerManager.open(),
        'cancel-players': () => {
          const cl = () => {
            if (isSetupOpen()) {
              E('pop-players').classList.remove('show');
              setTimeout(() => PlayerManager.close(), 250);
            } else {
              PlayerManager.close();
            }
          };
          if (JSON.stringify(PlayerManager.tu) !== JSON.stringify(State.cfg.usersList)) {
            UI.dialog({
              keep: true,
              title: T('dlg_ttl'),
              msg: T('edit_q'),
              buttons: [
                { label: T('edit_cont'), cb: null },
                { label: T('btn_cancel'), cls: 'danger', cb: cl },
                { label: T('save_ply'), cls: 'primary', cb: () => PlayerManager.save() },
              ],
            });
          } else {
            cl();
          }
        },
        'add-player': () => PlayerManager.add(),
        'save-players': () => PlayerManager.save(),
        undo: () => {
          const l = undoStack.pop();
          if (l) {
            lastCell = null;
            lastClickMs = 0;
            State.updateCard(l.u, l.c, l.v);
            UI.rerender();
            UI.toast(T('undo_ok'));
            UI.syncUndoBtn();
          }
        },
        'mode-toggle': () => {
          withExpandedState(() => {
            State.cfg.mode = State.cfg.mode === 'number' ? 'cross' : 'number';
            State.saveCfg();
            UI.renderMain();
          });
        },
        'reset-u': () => {
          const card = a.closest('.glass-card');
          const u  = card.dataset.sec;
          const nm = card.querySelector('.ua-name').textContent;
          UI.confirm(T('rst_ply').replace('{name}', nm), () => {
            State.usr[u] = { ...State.usr[u], state: {}, nums: {} };
            State.dupCache = null;
            State.saveUser(u);
            UI.rerender();
            UI.toast(T('rst_done'));
          });
        },
        'reset-all': () => {
          UI.dialog({
            title: T('rst_all'),
            msg: T('rst_warn'),
            checkbox: { label: T('keep_ply'), checked: true },
            buttons: [
              { label: T('btn_cancel'), cls: '', cb: null },
              {
                label: T('btn_rst'),
                cls: 'danger',
                cb: () => {
                  const kp = E('dialog-checkUrl')?.checked !== false;
                  const ul = kp ? [...State.cfg.usersList] : [`${T('ply')} 1`];
                  LS.clear();
                  LS.setItem(
                    STORAGE.CFG,
                    JSON.stringify({
                      albums: 24,
                      mode: 'cross',
                      gold_ids: [],
                      gold_ex: [],
                      hidden: [],
                      setup_done: false,
                      ambiance: 0,
                      ambStatic: false,
                      seed: Date.now(),
                      usersList: ul,
                    })
                  );
                  location.reload();
                },
              },
            ],
          });
        },
        'open-gold-mod': () => {
          Q('.popover').forEach((p) => p.classList.remove('show'));
          PlayerManager.close();
          UI.renderGoldGrid('gold-grid-ctn');
          E('mod-gold').classList.add('open');
        },
        'toggle-gold-note': () => GoldNote.toggle(),
        'close-gold': () => {
          if (GoldNote.panelOpen) GoldNote.close();
          E('mod-gold').classList.remove('open');
          UI.rerender();
        },
        'open-missions': () => {
          Q('.popover').forEach((p) => p.classList.remove('show'));
          PlayerManager.close();
          Missions.open();
        },
        'close-missions': () => E('mod-missions').classList.remove('open'),
        'add-gold-row': () => {
          State.cfg.gold_ex.push({ alb: '', card: '', date: '' });
          State.saveCfg();
          UI.renderGoldEx();
        },
        'del-gold': () => {
          UI.confirm(T('del_q'), () => {
            State.cfg.gold_ex.splice(+a.dataset.idx, 1);
            State.saveCfg();
            UI.renderGoldEx();
          });
        },
        'toggle-print-sub': () => {
          const p = E('sub-print');
          p.style.display = p.style.display === 'flex' ? 'none' : 'flex';
        },
        'do-print': () => {
          const s = new Set(Array.from(Q('.print-checkUrl:checked')).map((el) => el.value));
          Q('.glass-card').forEach((c) =>
            c.classList.toggle('print-hidden', !s.has(c.dataset.sec))
          );
          window.print();
        },
        'save-file': () => {
          const payload = JSON.stringify({ version: APP_VER, config: State.cfg, users: State.usr, note: GoldNote.loadData() });
          const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
          Object.assign(C('a'), { href: url, download: `Mgo_Backup_V${APP_VER}.json` }).click();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
          UI.toast(T('f_dl'));
        },
        load: () => {
          const inp = C('input');
          inp.type = 'file';
          inp.accept = '.json';
          inp.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              try {
                const o = JSON.parse(ev.target.result);
                if (!o?.config || !o?.users) { UI.alert(T('f_inv')); return; }
                const cfg = o.config;
                cfg.usersList  = cfg.usersList || Object.keys(o.users);
                cfg.gold_ids   = cfg.gold_ids  || [];
                cfg.gold_ex    = cfg.gold_ex   || [];
                cfg.hidden     = cfg.hidden    || [];
                cfg.setup_done = true;
                for (const u of Object.values(o.users)) {
                  u.state = u.state || {};
                  u.nums  = u.nums  || {};
                }
                State.cfg = cfg;
                State.usr = o.users;
                State.saveCfg();
                Object.keys(o.users).forEach((u) => State.saveUser(u));
                if (o.note) GoldNote.saveData(o.note);
                location.reload();
              } catch { UI.alert(T('f_err')); }
            };
            reader.readAsText(file);
          };
          inp.click();
        },
      };
    if (m[act]) m[act]();
  },
};
function __applySeason(hold, shown) {
  const ev = Season.event(),
    root = D.documentElement,
    bg = E('ambient-bg');
  root.classList.toggle('is-halloween', ev !== null && ev.amb === 5);
  root.classList.toggle('is-xmas', ev !== null && ev.amb === 6);
  if (State.cfg.ambiance === shown) {
    const keep = hold !== null && ev !== null && ev.amb === hold;
    let amb = keep ? hold : shown;
    if (hold !== null && !keep) State.cfg.ambPrev = null;
    if (ev !== null && State.cfg.ambSeas !== ev.id) {
      if (amb !== ev.amb) State.cfg.ambPrev = amb;
      State.cfg.ambSeas = ev.id;
      amb = ev.amb;
    }
    if (hold !== null || amb !== State.cfg.ambiance) {
      State.cfg.ambiance = amb;
      State.saveCfg();
    }
    if (hold !== null && !keep && ev === null) setTimeout(() => UI.toast(T('cheat_3')), 900);
    if (amb !== shown) UI.initAmbiance();
  }
  if (bg) bg.classList.toggle('hw-tint', State.cfg.ambiance !== 5 && Season.isHalloween());
}
function __initApp(fromHub = false) {
  E('__switch-lbl').textContent = LITE_MODE ? T('sw_full') : T('sw_lite');
  E('btn-version-switch').onclick = () => {
    LS.setItem(VER_KEY, LITE_MODE ? 'full' : 'lite');
    location.reload();
  };
  tr();
  const _amb = State.cfg.ambiance;
  if (!Number.isInteger(_amb) || _amb < 0 || _amb > AMB_MAX) {
    State.cfg.ambiance = 0;
    State.cfg.ambPrev = null;
    State.saveCfg();
    setTimeout(() => UI.toast(T('cheat_2')), 2500);
  } else if (_amb === 4 && !shineyMode) {
    State.cfg.ambiance = 0;
    State.cfg.ambPrev = null;
    State.saveCfg();
    setTimeout(() => UI.toast(T('cheat_1')), 2500);
  }
  const _hold = State.cfg.ambiance >= 5 ? State.cfg.ambiance : null;
  if (_hold !== null)
    State.cfg.ambiance = Season.allowed(State.cfg.ambPrev) ? State.cfg.ambPrev : 0;
  const _shown = State.cfg.ambiance;
  Season.verify().then(() => __applySeason(_hold, _shown));
  Missions.init();
  Share.checkUrl();
  const noteEditor = E('gn-editor');
  if (noteEditor) {
    noteEditor.addEventListener('input', function () {
      GoldNote.onInput();
    });
    noteEditor.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;
        let range = sel.getRangeAt(0);
        range.deleteContents();
        const exited = GoldNote._exitSpan(range);
        if (exited) range = exited;
        const br = D.createElement('br');
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        GoldNote._save();
      }
    });
    noteEditor.addEventListener('beforeinput', function (e) {
      if (e.inputType === 'insertText' || e.inputType === 'insertCompositionText') {
        GoldNote._escapeSpanBeforeInput(e);
      } else if (e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph') {
        e.preventDefault();
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;
        let range = sel.getRangeAt(0);
        range.deleteContents();
        const exited = GoldNote._exitSpan(range);
        if (exited) range = exited;
        const br = D.createElement('br');
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        GoldNote._save();
      }
    });
    noteEditor.addEventListener('paste', function (e) {
      e.preventDefault();
      const txt = (e.clipboardData || window.clipboardData).getData('text/plain');
      if (!txt) return;
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      sel.deleteFromDocument();
      const range = sel.getRangeAt(0);
      const tn = D.createTextNode(txt);
      range.insertNode(tn);
      range.setStartAfter(tn);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      GoldNote._save();
    });
  }
  D.addEventListener('selectionchange', () => {
    if (!GoldNote.panelOpen) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const ed = E('gn-editor');
    if (!ed) return;
    const range = sel.getRangeAt(0);
    if (ed.contains(range.commonAncestorContainer)) {
      GoldNote._savedRange = range.cloneRange();
    }
  });
  E('btn-import-confirm').onclick = () => Share.confirmAdd();
  E('btn-import-quick').onclick = () => Share.quickUpdate();
  E('btn-import-replace').onclick = () => Share.openReplace();
  E('btn-import-replace-back').onclick = () => {
    E('import-step-1').style.display = 'flex';
    E('import-step-2').style.display = 'none';
    Share.replTarget = null;
  };
  E('btn-import-replace-confirm').onclick = () => Share.confirmReplace();
  E('btn-import-cancel').onclick = () => {
    Share.pendImport = null;
    Share.replTarget = null;
    Share.closeModal();
  };
  E('lbl-alb').textContent = State.cfg.albums;
  const albPills = E('alb-pills'),
    updateAlbums = (v) => {
      const exp = [...Q('.glass-card.expanded')].map((c) => ({
        s: c.dataset.sec,
        b: c.classList.contains('blur-active'),
      }));
      State.cfg.albums = v;
      State.goldCache = null;
      State.saveCfg();
      UI.renderMain();
      exp.forEach(({ s, b }) => {
        const c = D.querySelector(`.glass-card[data-sec="${s}"]`);
        if (c) {
          c.classList.add('expanded');
          if (b) c.classList.add('blur-active');
        }
      });
      E('lbl-alb').textContent = v;
      albPills
        .querySelectorAll('.alb-pill')
        .forEach((p) => p.classList.toggle('active', +p.textContent === v));
    };
  for (let v = ALBUM_MIN; v <= ALBUM_MAX; v++) {
    const b = C('button');
    b.className = 'alb-pill' + (State.cfg.albums === v ? ' active' : '');
    b.textContent = v;
    b.onclick = () => updateAlbums(v);
    albPills.appendChild(b);
  }
  UI.syncUndoBtn();
  if (!LITE_MODE) {
    UI.renderAmbiaSel();
  }
  const ah = Actions.handle.bind(Actions);
  D.body.addEventListener('click', ah);
  D.body.addEventListener('dblclick', ah);
  D.body.addEventListener('change', (e) => {
    const t = e.target;
    if (t.classList.contains('vis-toggle')) {
      const id = t.dataset.visId;
      State.cfg.hidden = t.checked
        ? State.cfg.hidden.filter((x) => x !== id)
        : [...State.cfg.hidden, id];
      State.saveCfg();
      UI.updateVis();
    }
  });
  UI.renderGoldGrid('setup-gold-grid');
  buildAlbumPills(E('s-alb-pills'), (v) => {
    State.cfg.albums = v;
    State.saveCfg();
    UI.renderGoldGrid('setup-gold-grid');
  });
  E('btn-start-season').onclick = () => {
    State.cfg.setup_done = true;
    State.saveCfg();
    E('setup-mod').classList.remove('open');
    UI.renderMenu();
    UI.renderMain();
    UI.renderGoldEx();
    UI.toast(T('s_start'));
  };
  const isShiney = shineyMode;
  const delay = isShiney ? (LITE_MODE ? 1000 : 1800) : 500;
  if (!fromHub && isShiney) __playShineySplash(LITE_MODE);
  setTimeout(() => {
    UI.renderMain();
    UI.renderGoldEx();
    UI.renderMenu();
    if (!LITE_MODE) {
      Q('.anim-section').forEach((e) => {
        e.style.opacity = '0';
        e.style.transform = 'translateY(22px)';
        e.style.transition = 'none';
      });
    }
  }, 300);
  const sp = E('splash');
  if (LITE_MODE) {
    requestAnimationFrame(() =>
      setTimeout(() => {
        if (!sp) return;
        E('app-hdr-deck').classList.add('visible');
        sp.style.transition = 'opacity 0.25s ease';
        sp.style.opacity = '0';
        sp.style.pointerEvents = 'none';
        sp.style.visibility = 'hidden';
        const dw = D.querySelector('.dock-wrap');
        if (dw) {
          dw.style.transition = 'transform 0.4s cubic-bezier(0.34,1.42,0.64,1)';
          dw.style.transform = 'translateY(0)';
        }
        setTimeout(() => {
          setTimeout(() => sp.remove(), 3e3);
          if (!State.cfg.setup_done) E('setup-mod').classList.add('open');
          Share.show();
        }, 250);
      }, delay)
    );
  } else {
    const bg = E('ambient-bg');
    setTimeout(() => {
      if (!sp) return;
      const s = [...Q('.anim-section')].filter((e) => !e.classList.contains('hidden'));
      Q('.anim-section').forEach((e) => {
        e.style.opacity = '0';
        e.style.transform = 'translateY(22px)';
        e.style.transition = 'none';
      });
      __flyDeckToHeader(sp);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          s.forEach((e, i) =>
            setTimeout(() => {
              e.style.transition = 'opacity 450ms var(--ease), transform 450ms var(--ease)';
              e.style.opacity = '1';
              e.style.transform = 'translateY(0)';
            }, 75 * i)
          );
        })
      );
      setTimeout(() => {
        sp.style.transition = 'opacity 0.55s ease, visibility 0.55s ease';
        sp.style.opacity = '0';
        sp.style.visibility = 'hidden';
        sp.style.pointerEvents = 'none';
        const dw = D.querySelector('.dock-wrap');
        if (dw) {
          dw.style.transition = 'transform 0.5s cubic-bezier(0.34,1.42,0.64,1)';
          dw.style.transform = 'translateY(0)';
        }
        setTimeout(() => {
          UI.initAmbiance();
          bg.style.opacity = '1';
          setTimeout(
            () => {
              Q('.anim-section').forEach((e) => {
                e.style.cssText = '';
              });
              setTimeout(() => sp.remove(), 3e3);
              if (!State.cfg.setup_done) E('setup-mod').classList.add('open');
              Share.show();
            },
            75 * s.length + 450 + 80
          );
        }, 550);
      }, 200);
    }, delay + 200);
  }
}
const Share = {
  pendImport: null,
  replTarget: null,
  quickTarget: null,
  async quick(n, id, btn) {
    btn.style.pointerEvents = 'none';
    const s = JSON.stringify({ name: n, data: State.usr[id] || { state: {}, nums: {} } });
    let l;
    try {
      const enc = new TextEncoder().encode(s),
        cs = new CompressionStream('gzip'),
        w = cs.writable.getWriter();
      w.write(enc);
      w.close();
      const buf = await new Response(cs.readable).arrayBuffer();
      let str = '';
      new Uint8Array(buf).forEach((c) => (str += String.fromCharCode(c)));
      l = 'z:' + btoa(str);
    } catch (e) {
      l = btoa(unescape(encodeURIComponent(s)));
    }
    const url = 'https://kevinr99089.github.io/Mgo-Tracker/?share=' + encodeURIComponent(l);
    const scc = () => {
      UI.toast(T('shr_ok'));
      const old = btn.innerHTML;
      btn.innerHTML = EMOJIS.ok;
      btn.classList.add('share-ok');
      setTimeout(() => {
        btn.innerHTML = old;
        btn.classList.remove('share-ok');
        btn.style.pointerEvents = 'auto';
      }, 2000);
    };
    const fb = () => {
      const t = C('textarea');
      t.value = url;
      t.style.position = 'fixed';
      t.style.opacity = '0';
      D.body.appendChild(t);
      t.focus();
      t.select();
      try {
        if (D.execCommand('copy')) scc();
        else throw new Error();
      } catch (e) {
        prompt(T('shr_lnk') || '', url);
        btn.style.pointerEvents = 'auto';
      }
      t.remove();
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(scc).catch(fb);
    } else {
      fb();
    }
  },
  async checkUrl() {
    const p = new URLSearchParams(location.search);
    let raw = p.get('share');
    if (!raw && location.hash.startsWith('#share:')) raw = location.hash.slice(7);
    if (!raw) return;
    try {
      let dec;
      if (raw.startsWith('z:')) {
        const b = atob(raw.slice(2)),
          ar = Uint8Array.from(b, (c) => c.charCodeAt(0)),
          ds = new DecompressionStream('gzip'),
          w = ds.writable.getWriter();
        w.write(ar);
        w.close();
        dec = new TextDecoder().decode(await new Response(ds.readable).arrayBuffer());
      } else dec = decodeURIComponent(escape(atob(raw)));
      const o = JSON.parse(dec);
      if (o.name && o.data) this.pendImport = o;
    } catch (e) {
      this.cleanUrl();
    }
  },
  show() {
    const s = this.pendImport;
    if (!s) return;
    E('import-name').textContent = T('usr_pfx') + s.name;
    const c = Object.values(s.data.state || {}).filter((x) => x === 1).length,
      d = Object.values(s.data.state || {}).filter((x) => x === 2).length;
    E('import-stats').textContent = `${c} ${T('shr_crds')} · ${d} ${T('shr_dups')}`;
    const match = State.cfg.usersList.includes(s.name);
    let mem = {};
    try {
      mem = JSON.parse(LS.getItem(STORAGE.SHARE) || '{}');
    } catch {  }
    const rem = mem[s.name],
      valid = rem && State.cfg.usersList.includes(rem);
    const bc = E('btn-import-confirm'),
      br = E('btn-import-replace'),
      bq = E('btn-import-quick');
    if (match) {
      bc.textContent = (T('imp_upd') || '').replace('{name}', s.name);
      br.style.display = 'none';
      bq.style.display = 'none';
      this.quickTarget = null;
    } else {
      bc.textContent = T('imp_add') || '';
      br.style.display = '';
      if (valid) {
        bq.style.display = '';
        bq.textContent = (T('imp_quick') || '').replace('{name}', rem);
        this.quickTarget = rem;
      } else {
        bq.style.display = 'none';
        this.quickTarget = null;
      }
    }
    E('import-step-1').style.display = 'flex';
    E('import-step-2').style.display = 'none';
    E('mod-import').classList.add('open');
  },
  cleanUrl() {
    const u = new URL(location);
    let ch = false;
    if (u.searchParams.has('share')) {
      u.searchParams.delete('share');
      ch = true;
    }
    if (u.hash.startsWith('#share:')) {
      u.hash = '';
      ch = true;
    }
    if (ch) history.replaceState(null, '', u.toString());
  },
  closeModal() {
    this.cleanUrl();
    E('mod-import').classList.remove('open');
    E('import-step-1').style.display = 'flex';
    E('import-step-2').style.display = 'none';
  },
  confirmAdd() {
    if (!this.pendImport) return;
    const t = this.pendImport.name.replace(/\s/g, '');
    if (!State.cfg.usersList.includes(this.pendImport.name)) {
      State.cfg.usersList.push(this.pendImport.name);
      State.saveCfg();
    }
    State.usr[t] = { state: {}, nums: {}, ...this.pendImport.data };
    State.saveUser(t);
    UI.toast((T('t_add') || '').replace('{name}', this.pendImport.name));
    this.pendImport = null;
    this.closeModal();
    setTimeout(() => location.reload(), 900);
  },
  openReplace() {
    const l = E('import-player-select');
    l.innerHTML = '';
    this.replTarget = null;
    E('btn-import-replace-confirm').disabled = true;
    State.cfg.usersList.forEach((n) => {
      const b = C('button');
      b.className = 'mini-btn sb-btn';
      b.textContent = T('usr_pfx') + n;
      b.onclick = () => {
        l.querySelectorAll('.mini-btn').forEach((el) => el.classList.remove('selected'));
        b.classList.add('selected');
        this.replTarget = n;
        E('btn-import-replace-confirm').disabled = false;
      };
      l.appendChild(b);
    });
    E('import-step-1').style.display = 'none';
    E('import-step-2').style.display = 'flex';
  },
  confirmReplace() {
    if (!this.pendImport || !this.replTarget) return;
    UI.confirm((T('conf_rep') || '').replace('{name}', this.replTarget), () => {
      const t = this.replTarget.replace(/\s/g, '');
      State.usr[t] = { state: {}, nums: {}, ...this.pendImport.data };
      State.saveUser(t);
      try {
        const m = JSON.parse(LS.getItem(STORAGE.SHARE) || '{}');
        m[this.pendImport.name] = this.replTarget;
        LS.setItem(STORAGE.SHARE, JSON.stringify(m));
      } catch {  }
      UI.toast((T('t_rep') || '').replace('{name}', this.replTarget));
      this.pendImport = null;
      this.replTarget = null;
      this.closeModal();
      setTimeout(() => location.reload(), 900);
    });
  },
  quickUpdate() {
    if (!this.pendImport || !this.quickTarget) return;
    const t = this.quickTarget.replace(/\s/g, '');
    State.usr[t] = { state: {}, nums: {}, ...this.pendImport.data };
    State.saveUser(t);
    UI.toast((T('t_upd') || '').replace('{name}', this.quickTarget));
    this.pendImport = null;
    this.quickTarget = null;
    this.closeModal();
    setTimeout(() => location.reload(), 900);
  },
};
const Missions = {
  curData: null,
  nextData: null,
  weekOff: 0,
  getWkKey(d) {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    const day = nd.getDay();
    nd.setDate(nd.getDate() + (day === 0 ? -6 : 1 - day));
    return nd.toISOString().slice(0, 10);
  },
  weekDate(off) {
    const d = new Date();
    d.setDate(d.getDate() + (off || 0) * 7);
    return this.getWkKey(d);
  },
  emptyWeek() {
    return Array.from({ length: 7 }, () => ({ texts: ['', '', ''] }));
  },
  load(wk) {
    try {
      return JSON.parse(LS.getItem(STORAGE.MISS_DATA + wk)) || this.emptyWeek();
    } catch (e) {
      return this.emptyWeek();
    }
  },
  init() {
    const ok = LS.getItem(STORAGE.MISS_WEEK),
      od = LS.getItem(STORAGE.MISS_OLD);
    if (ok && od) {
      const ck = this.getWkKey(new Date());
      if (ok === ck) LS.setItem(STORAGE.MISS_DATA + ok, od);
      LS.removeItem(STORAGE.MISS_WEEK);
      LS.removeItem(STORAGE.MISS_OLD);
    }
    this.curData = this.load(this.weekDate(0));
    this.nextData = this.load(this.weekDate(1));
  },
  save() {
    LS.setItem(
      STORAGE.MISS_DATA + this.weekDate(this.weekOff),
      JSON.stringify(this.weekOff === 0 ? this.curData : this.nextData)
    );
  },
  open() {
    if (!this.curData) this.init();
    const tw = E('missions-week-toggle-wrap');
    const _day = new Date().getDay();
    const showWeekBtn = _day === 0 || _day === 6;
    if (tw) {
      tw.innerHTML = '';
      if (showWeekBtn) {
        const tbtn = C('button');
        tbtn.className = 'mini-btn';
        tbtn.style.cssText = 'font-size:.75rem;padding:5px 12px;';
        tbtn.textContent = this.weekOff === 0 ? T('miss_nxt') : T('miss_cur');
        tbtn.onclick = () => {
          this.weekOff = this.weekOff === 0 ? 1 : 0;
          this.open();
        };
        tw.appendChild(tbtn);
      } else {
        this.weekOff = 0;
      }
    }
    const b = E('missions-body');
    b.innerHTML = '';
    const data = this.weekOff === 0 ? this.curData : this.nextData;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const md = new Date(now);
    md.setDate(md.getDate() + (md.getDay() === 0 ? -6 : 1 - md.getDay()) + this.weekOff * 7);
    if (!this._fmt) {
      const loc = navigator.language || 'fr-FR';
      this._fmt = {
        day:   new Intl.DateTimeFormat(loc, { weekday: 'long' }),
        month: new Intl.DateTimeFormat(loc, { month: 'long'   }),
      };
    }
    const { day: fmtDay, month: fmtMonth } = this._fmt;
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    for (let i = 0; i < 7; i++) {
      const d = new Date(md);
      d.setDate(md.getDate() + i);
      const it = d.getTime() === now.getTime() && this.weekOff === 0,
        c = C('div');
      c.className = 'mission-day-card' + (it ? ' today-card' : '');
      c.innerHTML = `<div class="mission-day-label">${cap(fmtDay.format(d))} ${d.getDate()} ${cap(fmtMonth.format(d))} ${d.getFullYear()} ${it ? `<span class="today-badge">${T('today') || ''}</span>` : ''}</div>`;
      for (let m = 0; m < 3; m++) {
        const r = C('div');
        r.className = 'mission-row';
        const ta = C('textarea');
        ta.className = 'mission-input';
        ta.rows = 1;
        ta.placeholder = (T('miss_ph') || '').replace('{n}', m + 1);
        ta.value = data[i].texts[m] || '';
        ta.oninput = () => {
          ta.style.height = 'auto';
          ta.style.height = Math.min(ta.scrollHeight, 80) + 'px';
          data[i].texts[m] = ta.value;
          this.save();
        };
        ta.onfocus = () => ta.oninput();
        r.appendChild(ta);
        c.appendChild(r);
      }
      b.appendChild(c);
    }
    E('mod-missions').classList.add('open');
  },
};
const GoldNote = {
  noteColor: 'g',
  panelOpen: false,
  _savedRange: null,
  loadData() {
    try {
      return Object.assign({ text: '', names: [] }, JSON.parse(LS.getItem(STORAGE.NOTE) || '{}'));
    } catch (e) {
      return { text: '', names: [] };
    }
  },
  saveData(d) {
    try { LS.setItem(STORAGE.NOTE, JSON.stringify(d)); } catch { }
  },
  getGoldList() {
    const G = State.getGoldSet(), a = State.cfg.albums, l = [];
    for (let i = 1; i <= a; i++) for (let k = 0; k < 9; k++) if (G.has(9 * (i - 1) + k)) l.push(i);
    return l;
  },
  namesForAlbum(alb) {
    const num = parseInt(alb);
    if (!num) return [];
    try {
      const gl = this.getGoldList(), d = this.loadData();
      if (!d.names || !d.names.some((n) => n && n.trim())) return [];
      return gl
        .map((a, i) => (a === num && d.names[i] && d.names[i].trim() ? d.names[i].trim() : null))
        .filter(Boolean);
    } catch { return []; }
  },
  rawToHtml(raw) {
    return (raw || '').split('\n').map((line) => {
      let h = '', i = 0;
      while (i < line.length) {
        const r = line.slice(i);
        const em = r.match(/^\(\(([gr]):([^)]*)\)\)/);
        const um = r.match(/^--([gr]):([^-]+)--/);
        const cm = r.match(/^\*\*([gr]):([^*]*)\*\*/);
        if (em) {
          h += `<span class="gn-enc" data-color="${em[1]}">${esc(em[2])}</span>`;
          i += em[0].length;
        } else if (um) {
          h += `<span class="gn-ul" data-color="${um[1]}">${esc(um[2])}</span>`;
          i += um[0].length;
        } else if (cm) {
          h += `<span class="gn-col" data-color="${cm[1]}">${esc(cm[2])}</span>`;
          i += cm[0].length;
        } else {
          h += esc(line[i++]);
        }
      }
      return h;
    }).join('<br>');
  },
  domToRaw(el) {
    let t = '';
    function walk(n) {
      if (n.nodeType === 3) { t += n.nodeValue; return; }
      if (n.nodeType !== 1) return;
      if (n.tagName === 'BR') { t += '\n'; return; }
      const cl = n.classList, col = n.dataset.color || 'g';
      if (cl.contains('gn-enc')) { t += `((${col}:${n.textContent}))`; return; }
      if (cl.contains('gn-ul'))  { t += `--${col}:${n.textContent}--`; return; }
      if (cl.contains('gn-col')) { t += `**${col}:${n.textContent}**`; return; }
      if ((n.tagName === 'DIV' || n.tagName === 'P') && n !== el && t && !t.endsWith('\n')) t += '\n';
      for (const c of n.childNodes) walk(c);
    }
    walk(el);
    return t;
  },
  _save() {
    const ed = E('gn-editor');
    if (!ed) return;
    const d = this.loadData();
    d.text = this.domToRaw(ed).replace(/\n+$/, '');
    this.saveData(d);
  },
  onInput() {
    this._save();
  },
  saveSelection(e) {
    if (e && e.type === 'mousedown') e.preventDefault();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const ed = E('gn-editor');
    if (!ed) return;
    const range = sel.getRangeAt(0);
    if (ed.contains(range.commonAncestorContainer)) {
      this._savedRange = range.cloneRange();
    }
  },
  applyFormat(type) {
    const ed = E('gn-editor');
    if (!ed) return;
    let range = this._savedRange;
    if (!range || range.collapsed) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const r = sel.getRangeAt(0);
        if (ed.contains(r.commonAncestorContainer)) range = r.cloneRange();
      }
    }
    if (!range || range.collapsed) {
      UI.toast(T('gn_no_sel'));
      return;
    }
    const startChar = this._charOffset(ed, range.startContainer, range.startOffset);
    const endChar   = this._charOffset(ed, range.endContainer,   range.endOffset);
    const ancestor  = range.commonAncestorContainer;
    const allSpans  = [...ed.querySelectorAll('.gn-enc,.gn-ul,.gn-col')];
    const intersecting = allSpans.filter((span) => {
      if (span === ancestor || span.contains(ancestor)) return true;
      try { return range.intersectsNode(span); } catch { return false; }
    });
    if (intersecting.length > 0) {
      intersecting.forEach((span) => {
        const parent = span.parentNode;
        if (!parent) return;
        while (span.firstChild) parent.insertBefore(span.firstChild, span);
        parent.removeChild(span);
      });
      ed.normalize();
    } else {
      const text = range.toString();
      if (!text) { UI.toast(T('gn_no_sel')); return; }
      range.deleteContents();
      const span = D.createElement('span');
      span.className = type === 'enc' ? 'gn-enc' : type === 'ul' ? 'gn-ul' : 'gn-col';
      span.dataset.color = this.noteColor;
      span.textContent = text;
      range.insertNode(span);
    }
    try {
      const restored = this._rangeFromCharOffsets(ed, startChar, endChar);
      if (!restored.collapsed) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(restored);
        this._savedRange = restored.cloneRange();
      } else {
        this._savedRange = null;
      }
    } catch { this._savedRange = null; }
    this._save();
  },
  open() {
    this.panelOpen = true;
    const p = E('gold-note-panel'), h = E('gold-click-hint'), g = E('gold-grid-ctn'), b = E('btn-gold-note');
    if (p) {
      p.style.display = 'flex';
      p.className = p.className.replace(/\bcolor-[gr]\b/g, '').trim();
      p.classList.add('color-' + this.noteColor);
    }
    if (h) h.style.display = 'none';
    if (g) g.style.display = 'none';
    if (b) { b.style.background = 'rgba(99,102,241,.25)'; b.style.borderColor = 'var(--p)'; b.style.color = '#fff'; }
    const d = this.loadData(), ed = E('gn-editor');
    if (ed) {
      ed.innerHTML = this.rawToHtml(d.text);
      setTimeout(() => ed.focus(), 80);
    }
    this.rebuildNames();
  },
  close() {
    this.panelOpen = false;
    const p = E('gold-note-panel'), h = E('gold-click-hint'), g = E('gold-grid-ctn'), b = E('btn-gold-note');
    if (p) p.style.display = 'none';
    if (h) h.style.display = '';
    if (g) g.style.display = '';
    if (b) { b.style.background = ''; b.style.borderColor = ''; b.style.color = ''; }
  },
  toggle() { this.panelOpen ? this.close() : this.open(); },
  setColor(col) {
    this.noteColor = col;
    const g = E('btn-gn-green'), r = E('btn-gn-red'), lbl = E('gn-color-lbl');
    if (g) g.classList.toggle('active', col === 'g');
    if (r) r.classList.toggle('active', col === 'r');
    if (lbl) lbl.textContent = T(col === 'g' ? 'gn_col_g' : 'gn_col_r');
    const p = E('gold-note-panel');
    if (p) {
      p.className = p.className.replace(/\bcolor-[gr]\b/g, '').trim();
      p.classList.add('color-' + col);
    }
  },
  rebuildNames() {
    const list = E('gn-names-list'), wrap = E('gn-names-wrap');
    if (!list) return;
    const gl = this.getGoldList(), d = this.loadData();
    if (wrap) wrap.style.display = gl.length ? '' : 'none';
    if (!gl.length) return;
    list.innerHTML = '';
    while (d.names.length < gl.length) d.names.push('');
    gl.forEach((alb, idx) => {
      const row = C('div');
      row.className = 'gn-name-row';
      const lbl = C('span');
      lbl.className = 'gn-alb-badge';
      lbl.textContent = `${T('gn_alb')} ${alb}`;
      const inp = C('input');
      inp.className = 'gn-name-inp';
      inp.type = 'text';
      inp.placeholder = T('gn_name_ph');
      inp.value = d.names[idx] || '';
      inp.oninput = () => {
        const nd = this.loadData();
        while (nd.names.length <= idx) nd.names.push('');
        nd.names[idx] = inp.value;
        this.saveData(nd);
      };
      row.appendChild(lbl);
      row.appendChild(inp);
      list.appendChild(row);
    });
  },
  _exitSpan(range) {
    const ed = E('gn-editor');
    let node = range.startContainer;
    while (node && node !== ed) {
      if (node.nodeType === 1 && node.classList &&
          (node.classList.contains('gn-enc') || node.classList.contains('gn-ul') || node.classList.contains('gn-col'))) {
        const afterR = D.createRange();
        afterR.setStart(range.startContainer, range.startOffset);
        afterR.setEnd(node, node.childNodes.length);
        const afterTxt = afterR.toString();
        afterR.deleteContents();
        if (!node.textContent) node.remove();
        const nr = D.createRange();
        if (node.parentNode) nr.setStartAfter(node); else { nr.setStart(range.startContainer, range.startOffset); }
        nr.collapse(true);
        if (afterTxt) {
          const tn = D.createTextNode(afterTxt);
          nr.insertNode(tn);
          if (node.parentNode) nr.setStartAfter(node); else nr.setStartBefore(tn);
          nr.collapse(true);
        }
        return nr;
      }
      node = node.parentNode;
    }
    return null;
  },
  _escapeSpanBeforeInput(e) {
    const sel = window.getSelection();
    if (!sel || !sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const cont = range.startContainer;
    if (cont.nodeType !== 3) return;
    const par = cont.parentNode;
    if (!par || par === E('gn-editor')) return;
    if (!par.classList || !(par.classList.contains('gn-enc') || par.classList.contains('gn-ul') || par.classList.contains('gn-col'))) return;
    if (cont !== par.lastChild || range.startOffset !== cont.nodeValue.length) return;
    e.preventDefault();
    const nr = D.createRange();
    nr.setStartAfter(par);
    nr.collapse(true);
    sel.removeAllRanges();
    sel.addRange(nr);
    if (e.data) D.execCommand('insertText', false, e.data);
    GoldNote._save();
  },
  _charOffset(ed, container, offset) {
    let total = 0;
    const iter = D.createTreeWalker(ed, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = iter.nextNode())) {
      if (node === container) return total + offset;
      total += node.nodeValue.length;
    }
    return total + offset;
  },
  _rangeFromCharOffsets(ed, start, end) {
    const r = D.createRange();
    let offset = 0, startSet = false, endSet = false;
    const iter = D.createTreeWalker(ed, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = iter.nextNode())) {
      const len = node.nodeValue.length;
      if (!startSet && offset + len >= start) {
        r.setStart(node, start - offset);
        startSet = true;
      }
      if (startSet && !endSet && offset + len >= end) {
        r.setEnd(node, end - offset);
        endSet = true;
        break;
      }
      offset += len;
    }
    if (!startSet || !endSet) r.collapse(true);
    return r;
  },
  toggleDrawer() {
    const drawer = E('gn-drawer'), btn = E('btn-gn-drawer');
    if (!drawer) return;
    const isOpen = drawer.classList.toggle('open');
    if (btn) btn.classList.toggle('open', isOpen);
  },
  genStructure() {
    const gl = this.getGoldList(), d = this.loadData(), ed = E('gn-editor');
    if (!gl.length) { UI.toast(T('gn_no_gold')); return; }
    while (d.names.length < gl.length) d.names.push('');
    const hasNames = d.names.some((n) => n && n.trim());
    const newLines = gl.map((alb, idx) => {
      let l = `${T('gn_alb_full')} ${alb}`;
      if (hasNames && d.names[idx] && d.names[idx].trim()) l += `. ${d.names[idx].trim()}`;
      return l;
    }).join('\n');
    if (!ed) return;
    const existing = this.domToRaw(ed).replace(/\n+$/, '');
    const combined = existing ? existing + '\n' + newLines : newLines;
    ed.innerHTML = this.rawToHtml(combined);
    d.text = combined;
    this.saveData(d);
    ed.scrollTop = ed.scrollHeight;
  },
};
