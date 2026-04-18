(function () {
    var v = localStorage.getItem('mgo_unified_version');
    if (v === 'lite') document.documentElement.className = 'lite-mode';
    else if (v === 'full') document.documentElement.className = 'full-mode';
})();
const I18N_FILES = { fr: 'french.txt', en: 'english.txt' };
const __MGO_PREF = 'mgo_unified_version';
let LITE_MODE = document.documentElement.className === 'lite-mode';
let currentLang = (navigator.language || 'fr').split('-')[0];
if (!I18N_FILES[currentLang]) currentLang = 'en';
let translations = {};
let _i18nLoaded = false;
async function initI18n() {
    if (_i18nLoaded) return;
    try {
        const response = await fetch(I18N_FILES[currentLang]);
        if (!response.ok) throw new Error('Translation file not found');
        translations = await response.json();
        _i18nLoaded = true;
    } catch (e) {
        console.error('i18n load error', e);
    }
}
function s(key) {
    return translations[key] || key;
}
function a(e) {
    return (e + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
const n = new Set(['add_upper']);
function r() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const val = s(key);
        n.has(key) ? el.innerHTML = val : el.textContent = val;
    });
}
let __hubLocked = false;
function __pickVersion(v, btn) {
    if (__hubLocked) return;
    __hubLocked = true;
    document.querySelectorAll('.hub-btn').forEach(b => { b.disabled = true; b.style.pointerEvents = 'none'; b.style.opacity = '.5'; });
    LITE_MODE = v === 'lite';
    if (document.getElementById('__hub-chk').checked) localStorage.setItem(__MGO_PREF, v);
    else localStorage.removeItem(__MGO_PREF);
    document.documentElement.className = LITE_MODE ? 'lite-mode' : 'full-mode';
    const hub = document.getElementById('__hub');
    const card = document.getElementById('__hub-card');
    const splash = document.getElementById('splash');
    if (btn) {
        const rect = btn.getBoundingClientRect();
        const vw = window.innerWidth, vh = window.innerHeight;
        const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        const scale = Math.ceil(Math.max(
            2 * Math.max(cx, vw - cx) / rect.width,
            2 * Math.max(cy, vh - cy) / rect.height
        )) + 2;
        const bg = v === 'full' ? 'linear-gradient(135deg,#4f52d3,#6366f1)' : 'linear-gradient(135deg,#831843,#be185d)';
        const el = document.createElement('div');
        el.style.cssText = 'position:fixed;top:' + rect.top + 'px;left:' + rect.left + 'px;width:' + rect.width + 'px;height:' + rect.height + 'px;border-radius:16px;z-index:19999;pointer-events:none;background:' + bg + ';transform-origin:center center;will-change:transform;transition:none';
        document.body.appendChild(el);
        card.style.transition = 'opacity 0.3s ease';
        card.style.opacity = '0';
        requestAnimationFrame(() => {
            el.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1),border-radius 0.55s ease';
            el.style.transform = 'scale(' + scale + ')';
            el.style.borderRadius = '0';
            setTimeout(() => {
                splash.style.cssText = 'opacity:0;z-index:10000;display:flex;transition:none';
                requestAnimationFrame(() => {
                    splash.style.transition = 'opacity 0.45s ease';
                    splash.style.opacity = '1';
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
const o = { VERSION: '4.1.6 (Web)' };
let i = [];
function l(e) {
    return function () {
        var t = e += 1831565813;
        t = Math.imul(t ^ t >>> 15, 1 | t);
        return (((t ^= t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t >>> 14) >>> 0) / 4294967296;
    };
}
function c(e) { return l(e)() < .01; }
function d(e) {
    const t = c(e.seed) ? 4 : 3;
    return null == e.ambiance || 'number' != typeof e.ambiance || e.ambiance < 0 || !Number.isInteger(e.ambiance)
        ? (e.ambiance = 0, null)
        : e.ambiance > t
            ? 4 !== e.ambiance || c(e.seed)
                ? (e.ambiance = 0, 'cheat_easter')
                : (e.ambiance = 0, 'cheat_shiny')
            : null;
}
const u = {
    cfg: { albums: 24, mode: 'cross', gold_ids: [], gold_ex: [], hidden: [], printHidden: [], setup_done: false, ambiance: 0, seed: Date.now(), usersList: [] },
    usr: {},
    _dupesCache: null,
    _goldCache: null,
    _saveTimers: {},
    getGoldSet() { return this._goldCache || (this._goldCache = new Set(this.cfg.gold_ids)); },
    invalidateGold() { this._goldCache = null; },
    getDupesSet() {
        if (this._dupesCache) return this._dupesCache;
        const e = new Set();
        Object.values(this.usr).forEach(t => { t && t.state && Object.entries(t.state).forEach(([t, s]) => { 2 === s && e.add(+t); }); });
        return this._dupesCache = e;
    },
    invalidateDupes() { this._dupesCache = null; },
    debounceSave(e) { clearTimeout(this._saveTimers[e]); this._saveTimers[e] = setTimeout(() => this.saveU(e), 400); },
    init() {
        const e = localStorage.getItem('mgo_cfg');
        if (e) try {
            const t = JSON.parse(e);
            this.cfg = { ...this.cfg, ...t };
            this.cfg.seed || (this.cfg.seed = Date.now());
        } catch (e) { console.error('Config corrupt', e); }
        this.cfg.usersList && 0 !== this.cfg.usersList.length || (this.cfg.usersList = [s('player') + ' 1']);
        this.cfg.usersList.forEach(e => {
            const t = e.replace(/\s/g, ''), sv = localStorage.getItem('mgo_u_' + t);
            if (sv) try {
                const e = JSON.parse(sv);
                this.usr[t] = { state: {}, nums: {}, ...e };
                this.usr[t].state || (this.usr[t].state = {});
                this.usr[t].nums || (this.usr[t].nums = {});
            } catch (e) { console.error('User data corrupt for', t, e); this.usr[t] = { state: {}, nums: {} }; }
            else this.usr[t] = { state: {}, nums: {} };
        });
    },
    saveC() { localStorage.setItem('mgo_cfg', JSON.stringify(this.cfg)); },
    saveU(e) { this.usr[e] && localStorage.setItem('mgo_u_' + e, JSON.stringify(this.usr[e])); },
    setGold(e, t) {
        const sv = new Set(this.cfg.gold_ids);
        t ? sv.add(e) : sv.delete(e);
        this.cfg.gold_ids = Array.from(sv);
        this.invalidateGold();
        this.saveC();
    },
    updateCell(e, t, sv, a = false) {
        if (this.usr[e]) {
            this.usr[e].state || (this.usr[e].state = {});
            this.usr[e].nums || (this.usr[e].nums = {});
            if (a) { sv ? this.usr[e].nums[t] = sv : delete this.usr[e].nums[t]; }
            else {
                const a = this.usr[e].state[t] || 0;
                0 === sv ? delete this.usr[e].state[t] : this.usr[e].state[t] = sv;
                2 !== a && 2 !== sv || this.invalidateDupes();
            }
            this.debounceSave(e);
        }
    },
    resetUser(e) {
        this.usr[e] && (this.usr[e].state = {}, this.usr[e].nums = {}, this.invalidateDupes(), this.saveU(e));
    }
};
window.UserManager = {
    tempUsers: [],
    _newIndices: new Set(),
    _dragSrc: null,
    _touchSrc: null,
    _touchClone: null,
    _touchStartY: 0,
    open() { this.tempUsers = [...u.cfg.usersList]; this.render(); document.getElementById('mod-users').classList.add('open'); },
    close() { this._newIndices.clear(); document.getElementById('mod-users').classList.remove('open'); },
    render() {
        const e = document.getElementById('users-edit-list');
        e.innerHTML = '';
        this.tempUsers.forEach((t, sv) => {
            const n = document.createElement('div');
            n.className = 'um-row' + (this._newIndices.has(sv) ? ' um-new' : '');
            n.draggable = true;
            n.dataset.idx = sv;
            const r = a(t);
            n.innerHTML = `
          <span class="um-handle" title="${a(s('drag_reorder'))}">⠿</span>
          <input type="text" class="g-inp um-inp" style="flex:1;border:1px solid var(--glass-b);border-radius:6px;padding:8px;color:#fff" value="${r}" data-idx="${sv}">
          <button class="mini-btn danger um-del" data-idx="${sv}" ${this.tempUsers.length <= 1 ? 'disabled' : ''}>×</button>
      `;
            n.addEventListener('dragstart', e => this._onDragStart(e, n));
            n.addEventListener('dragover', e => this._onDragOver(e, n));
            n.addEventListener('dragleave', e => n.classList.remove('um-drag-over'));
            n.addEventListener('drop', e => this._onDrop(e, n));
            n.addEventListener('dragend', e => this._onDragEnd());
            const o = n.querySelector('.um-handle');
            o.addEventListener('touchstart', e => this._onTouchStart(e, n), { passive: false });
            o.addEventListener('touchmove', e => this._onTouchMove(e), { passive: false });
            o.addEventListener('touchend', e => this._onTouchEnd(e), { passive: false });
            n.querySelector('.um-inp').addEventListener('change', e => this.update(+e.target.dataset.idx, e.target.value));
            n.querySelector('.um-del').addEventListener('click', e => this.remove(+e.target.dataset.idx));
            e.appendChild(n);
        });
    },
    _onDragStart(e, t) {
        this._dragSrc = t;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', t.dataset.idx);
        setTimeout(() => t.classList.add('um-dragging'), 0);
    },
    _onDragOver(e, t) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        t !== this._dragSrc && (document.querySelectorAll('.um-row').forEach(e => e.classList.remove('um-drag-over')), t.classList.add('um-drag-over'));
    },
    _onDrop(e, t) {
        if (e.preventDefault(), t === this._dragSrc) return;
        const sv = +t.dataset.idx, a = this.tempUsers.splice(+this._dragSrc.dataset.idx, 1)[0];
        this.tempUsers.splice(sv, 0, a);
        this.render();
    },
    _onDragEnd() { document.querySelectorAll('.um-row').forEach(e => { e.classList.remove('um-dragging', 'um-drag-over'); }); this._dragSrc = null; },
    _onTouchStart(e, t) {
        e.preventDefault();
        this._touchSrc = t;
        this._touchStartY = e.touches[0].clientY;
        const sv = t.cloneNode(true);
        sv.classList.add('um-touch-clone');
        sv.style.top = t.getBoundingClientRect().top + 'px';
        document.body.appendChild(sv);
        this._touchClone = sv;
        t.classList.add('um-dragging');
    },
    _onTouchMove(e) {
        if (!this._touchClone) return;
        e.preventDefault();
        const t = e.touches[0].clientY;
        this._touchClone.style.top = t - 22 + 'px';
        const sv = document.elementsFromPoint(e.touches[0].clientX, t).find(e => e.classList.contains('um-row') && e !== this._touchSrc);
        document.querySelectorAll('.um-row').forEach(e => e.classList.remove('um-drag-over'));
        sv && sv.classList.add('um-drag-over');
    },
    _onTouchEnd(e) {
        if (!this._touchClone) return;
        const t = document.elementsFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY).find(e => e.classList.contains('um-row') && e !== this._touchSrc);
        this._touchClone.remove();
        this._touchClone = null;
        if (t) { const e = +t.dataset.idx, sv = this.tempUsers.splice(+this._touchSrc.dataset.idx, 1)[0]; this.tempUsers.splice(e, 0, sv); }
        this.render();
        this._touchSrc = null;
    },
    update(e, t) { this.tempUsers[e] = t.trim() || `${s('player')} ${e + 1}`; },
    add() {
        const ni = this.tempUsers.length;
        this.tempUsers.push(`${s('player')} ${ni + 1}`);
        this._newIndices.add(ni);
        this.render();
        requestAnimationFrame(() => {
            const rows = document.querySelectorAll('#users-edit-list .um-row');
            const row = rows[ni];
            if (!row) return;
            row.classList.add('um-flashing');
            setTimeout(() => { row.classList.remove('um-flashing'); row.classList.add('um-new'); }, 950);
        });
    },
    remove(e) { this.tempUsers.length > 1 && (this.tempUsers.splice(e, 1), this.render()); },
    save() {
        this._newIndices.clear();
        const originalList = u.cfg.usersList.slice();
        this.tempUsers.forEach((newName, i) => {
            const oldName = originalList[i];
            if (!oldName) return;
            const oldKey = oldName.replace(/\s/g, ''), newKey = newName.replace(/\s/g, '');
            if (oldKey !== newKey && u.usr[oldKey]) {
                u.usr[newKey] = u.usr[oldKey];
                delete u.usr[oldKey];
                try { localStorage.removeItem('mgo_u_' + oldKey); } catch (e) {}
                u.saveU(newKey);
            }
        });
        const oldFirstKey = originalList[0] ? originalList[0].replace(/\s/g, '') : null;
        const newFirstKey = this.tempUsers[0] ? this.tempUsers[0].replace(/\s/g, '') : null;
        oldFirstKey && newFirstKey && oldFirstKey !== newFirstKey && u.usr[oldFirstKey] && (u.usr[oldFirstKey].nums = {}, u.saveU(oldFirstKey));
        this.tempUsers.forEach(e => { const t = e.replace(/\s/g, ''); u.usr[t] || (u.usr[t] = { state: {}, nums: {} }); });
        u.cfg.usersList = [...this.tempUsers];
        u.saveC();
        this.close();
        g.renderMenus();
        g.renderMain();
        g.showToast(s('players_updated'));
    }
};
let m = null, p = null;
function h() {
    m && (cancelAnimationFrame(m), m = null);
    p && (p(), p = null);
}
const g = {
    els: {
        app: document.getElementById('gen-cards'),
        toast: document.getElementById('toast'),
        bg: document.getElementById('ambient-bg')
    },
    showToast(e) {
        this.els.toast.textContent = e;
        this.els.toast.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => this.els.toast.classList.remove('show'), 2000);
    },
    renderAmbiance() {
        if (LITE_MODE || !this.els.bg) return;
        h();
        this.els.bg.innerHTML = '';
        const e = l(u.cfg.seed), t = u.cfg.ambiance || 0;
        const palette = ['#4f46e5', '#c026d3', '#06b6d4', '#f472b6', '#fbbf24'];
        if (4 !== t) {
            if (0 === t) {
                const _app0 = new PIXI.Application({ resizeTo: this.els.bg, backgroundAlpha: 0, antialias: false, resolution: 1, autoDensity: true });
                _app0.view.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
                this.els.bg.appendChild(_app0.view);
                const _N0 = 7, _hexPal = palette.map(_c => parseInt(_c.replace('#', ''), 16)), _orbs = [];
                for (let _i = 0; _i < _N0; _i++) {
                    const _sz = 45 + 40 * e(), _col = _hexPal[Math.floor(e() * _hexPal.length)];
                    const _sx = (90 * e() - 5) / 100, _sy = (90 * e() - 5) / 100;
                    const _tx = (18 * e() - 9) / 100, _ty = (18 * e() - 9) / 100;
                    const _dur = (18 + 16 * e()) * 1e3, _ph = e() * Math.PI * 2;
                    const _ts = 256, _oc = document.createElement('canvas');
                    _oc.width = _ts; _oc.height = _ts;
                    const _cx = _oc.getContext('2d');
                    const _rr = (_col >> 16) & 0xFF, _rg = (_col >> 8) & 0xFF, _rb = _col & 0xFF;
                    const _grd = _cx.createRadialGradient(_ts / 2, _ts / 2, 0, _ts / 2, _ts / 2, _ts / 2);
                    _grd.addColorStop(0, `rgba(${_rr},${_rg},${_rb},1)`);
                    _grd.addColorStop(.68, `rgba(${_rr},${_rg},${_rb},.15)`);
                    _grd.addColorStop(1, `rgba(${_rr},${_rg},${_rb},0)`);
                    _cx.fillStyle = _grd; _cx.fillRect(0, 0, _ts, _ts);
                    const _bt = new PIXI.BaseTexture(_oc), _tex = new PIXI.Texture(_bt), _spr = new PIXI.Sprite(_tex);
                    _spr.anchor.set(.5); _spr.alpha = .55; _app0.stage.addChild(_spr);
                    _orbs.push({ spr: _spr, sx: _sx, sy: _sy, tx: _tx, ty: _ty, dur: _dur, ph: _ph, sz: _sz });
                }
                _app0.ticker.add(() => {
                    const _now = performance.now(), _W = _app0.screen.width, _H = _app0.screen.height;
                    for (const _o of _orbs) {
                        const _prog = (Math.sin(_now / _o.dur * Math.PI * 2 + _o.ph) + 1) / 2;
                        _o.spr.x = _o.sx * _W + _o.tx * _W * _prog;
                        _o.spr.y = _o.sy * _H + _o.ty * _H * _prog;
                        const _s = _o.sz / 100 * _W; _o.spr.width = _s; _o.spr.height = _s;
                    }
                });
                return void (p = () => { _app0.destroy(true, { children: true, texture: true, baseTexture: true }); });
            }
            if (1 === t) {
                const _app1 = new PIXI.Application({ resizeTo: this.els.bg, backgroundAlpha: 0, antialias: true, resolution: 1, autoDensity: true });
                _app1.view.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
                this.els.bg.appendChild(_app1.view);
                const _grads = [['#3b41d8','#6468f5'],['#c77b10','#f0aa22'],['#b8223b','#eb3a5f'],['#0e766e','#14b8a6'],['#7c3aed','#a855f7'],['#065f86','#0ea5e9']];
                const _N1 = 5, _cards1 = [];
                const _TW = 256, _TH = Math.round(_TW * 1.4);
                for (let _i = 0; _i < _N1; _i++) {
                    const _gc = _grads[Math.floor(e() * _grads.length)];
                    const _oc = document.createElement('canvas');
                    _oc.width = _TW; _oc.height = _TH;
                    const _cx = _oc.getContext('2d');
                    const _r = 16;
                    _cx.beginPath();
                    _cx.moveTo(_r, 0); _cx.lineTo(_TW - _r, 0); _cx.quadraticCurveTo(_TW, 0, _TW, _r);
                    _cx.lineTo(_TW, _TH - _r); _cx.quadraticCurveTo(_TW, _TH, _TW - _r, _TH);
                    _cx.lineTo(_r, _TH); _cx.quadraticCurveTo(0, _TH, 0, _TH - _r);
                    _cx.lineTo(0, _r); _cx.quadraticCurveTo(0, 0, _r, 0);
                    _cx.closePath(); _cx.clip();
                    const _grd = _cx.createLinearGradient(0, 0, _TW, _TH);
                    _grd.addColorStop(0, _gc[0]); _grd.addColorStop(1, _gc[1]);
                    _cx.fillStyle = _grd; _cx.fillRect(0, 0, _TW, _TH);
                    const _sh = _cx.createLinearGradient(0, 0, _TW * .7, _TH * .7);
                    _sh.addColorStop(0, 'rgba(255,255,255,0.18)'); _sh.addColorStop(1, 'rgba(255,255,255,0)');
                    _cx.fillStyle = _sh; _cx.fillRect(0, 0, _TW, _TH);
                    _cx.strokeStyle = 'rgba(255,255,255,0.18)'; _cx.lineWidth = 2; _cx.stroke();
                    const _bt = new PIXI.BaseTexture(_oc), _tex = new PIXI.Texture(_bt), _spr = new PIXI.Sprite(_tex);
                    _spr.anchor.set(.5); _spr.alpha = .45;
                    _app1.stage.addChild(_spr);
                    const _vwPx = window.innerWidth, _sz = (30 + 25 * e()) / 100 * _vwPx;
                    _spr.width = _sz; _spr.height = _sz * 1.4;
                    const _sx = (85 * e() - 10) / 100, _sy = (85 * e() - 10) / 100;
                    const _tx = (20 * e() - 10) / 100, _ty = (20 * e() - 10) / 100;
                    const _r0 = (40 * e() - 20) * Math.PI / 180, _r1 = (40 * e() - 20) * Math.PI / 180;
                    const _dur = (20 + 15 * e()) * 1e3, _ph = e() * Math.PI * 2;
                    _cards1.push({ spr: _spr, sx: _sx, sy: _sy, tx: _tx, ty: _ty, r0: _r0, r1: _r1, dur: _dur, ph: _ph, sz: _sz });
                }
                _app1.ticker.add(() => {
                    const _now = performance.now(), _W = _app1.screen.width, _H = _app1.screen.height;
                    for (const _c of _cards1) {
                        const _p = (Math.sin(_now / _c.dur * Math.PI * 2 + _c.ph) + 1) / 2;
                        _c.spr.x = _c.sx * _W + _c.tx * _W * _p;
                        _c.spr.y = _c.sy * _H + _c.ty * _H * _p;
                        _c.spr.rotation = _c.r0 + (_c.r1 - _c.r0) * _p;
                    }
                });
                return void (p = () => { _app1.destroy(true, { children: true, texture: true, baseTexture: true }); });
            }
            if (2 === t) {
                const S = 6;
                for (let x = 0; x < S; x++) {
                    const T = document.createElement('div');
                    T.className = 'f-obj f-neon';
                    const I = 8 + 18 * e(), $ = e() > .5 ? I : I * (.5 + .8 * e());
                    const M = palette[Math.floor(e() * palette.length)], k = e() > .5 ? 45 : 30 * e() - 15;
                    T.style.cssText = `width:${I}vw;height:${$}vw;top:${88 * e()}%;left:${88 * e()}%;border-color:${M};box-shadow:0 0 6px ${M}`;
                    T.style.setProperty('--glow', M);
                    T.style.setProperty('--d', 14 + 18 * e() + 's');
                    T.style.setProperty('--pd', 2.5 + 2 * e() + 's');
                    T.style.setProperty('--tx', 26 * e() - 13 + 'vw');
                    T.style.setProperty('--ty', 26 * e() - 13 + 'vh');
                    T.style.setProperty('--r0', k + 'deg');
                    T.style.setProperty('--r1', k + 60 * e() - 30 + 'deg');
                    this.els.bg.appendChild(T);
                }
                return;
            }
            if (3 === t) {
                const A = document.createElement('div');
                A.className = 'lava-wrap';
                A.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;background:#020204;overflow:hidden';
                this.els.bg.appendChild(A);
                const _app = new PIXI.Application({ resizeTo: A, backgroundColor: 0x020204, resolution: Math.min(window.devicePixelRatio || 1, 1), autoDensity: true, antialias: false });
                _app.view.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
                A.appendChild(_app.view);
                const _goo = new PIXI.Container();
                const _blur = new PIXI.BlurFilter(14, 4); _blur.padding = 60;
                const _thresh = new PIXI.Filter(null, 'varying vec2 vTextureCoord;uniform sampler2D uSampler;void main(){vec4 c=texture2D(uSampler,vTextureCoord);vec3 rgb=(c.a>0.001)?c.rgb/c.a:vec3(0.0);float a=clamp(c.a*22.0-9.0,0.0,1.0);gl_FragColor=vec4(rgb*a,a);}');
                _thresh.padding = 60;
                _goo.filters = [_blur, _thresh];
                _app.stage.addChild(_goo);
                const _gfx = new PIXI.Graphics(); _goo.addChild(_gfx);
                const _P = 2 + Math.floor(2 * e());
                const _D = [...palette].sort(() => e() - .5);
                const _pal = _D.slice(0, _P).map(c => parseInt(c.replace('#', ''), 16));
                const _H = 10, _blobs = [];
                for (let _i = 0; _i < _H; _i++) {
                    const _r = 35 + 55 * e(), _ny = e();
                    _blobs.push({ x: e() * (_app.screen.width || window.innerWidth), y: _ny * (_app.screen.height || window.innerHeight), vx: 0, vy: 0, r: _r, baseR: _r, col: _pal[Math.floor(e() * _pal.length)], phase: e() * Math.PI * 2, freq: .08 + .12 * e(), drift: .06 * (e() - .5), temp: 1 - _ny, tempInertia: .12 + .18 * e() });
                }
                let _lt = 0;
                const _cW = .994, _cX = 6.5, _cK = .42, _cZ = 1;
                _app.ticker.add(() => {
                    const _now = performance.now(), _ds = Math.min((_now - _lt) / 1e3, .05);
                    if (!_lt) { _lt = _now; return; } _lt = _now;
                    const _W2 = _app.screen.width, _H2 = _app.screen.height;
                    for (let _i = 0; _i < _H; _i++) {
                        const _a = _blobs[_i];
                        _a.temp += (_a.y / _H2 - _a.temp) * _a.tempInertia * _ds;
                        _a.vy -= (_a.temp - _cK) * _cX * _ds;
                        _a.phase += _a.freq * _ds;
                        _a.vx += Math.sin(_a.phase + 1.7 * _i) * _cZ * _ds;
                        _a.vx += _a.drift * _ds * 3;
                        for (let _j = _i + 1; _j < _H; _j++) {
                            const _b = _blobs[_j], _dx = _b.x - _a.x, _dy = _b.y - _a.y;
                            const _d = Math.sqrt(_dx * _dx + _dy * _dy) + 1, _mn = .35 * (_a.r + _b.r);
                            if (_d < _mn) {
                                const _f = .08 * (_mn - _d) * _ds, _nx = _dx / _d, _ny2 = _dy / _d;
                                _a.vx -= _nx * _f; _a.vy -= _ny2 * _f; _b.vx += _nx * _f; _b.vy += _ny2 * _f;
                            }
                        }
                        _a.vx *= _cW; _a.vy *= _cW; _a.x += _a.vx; _a.y += _a.vy;
                        const _pad = .3 * _a.r;
                        if (_a.x < -_pad) { _a.x = -_pad; _a.vx = .3 * Math.abs(_a.vx); }
                        if (_a.x > _W2 + _pad) { _a.x = _W2 + _pad; _a.vx = -.3 * Math.abs(_a.vx); }
                        if (_a.y < -_pad) { _a.y = -_pad; _a.vy = .3 * Math.abs(_a.vy); }
                        if (_a.y > _H2 + _pad) { _a.y = _H2 + _pad; _a.vy = -.3 * Math.abs(_a.vy); }
                        _a.r = _a.baseR + Math.sin(6e-4 * _now + 2.1 * _i) * _a.baseR * .06;
                    }
                    _gfx.clear();
                    for (let _i = 0; _i < _H; _i++) { const _a = _blobs[_i]; _gfx.beginFill(_a.col, .92); _gfx.drawCircle(_a.x, _a.y, _a.r * 1.8); _gfx.endFill(); }
                });
                return void (p = () => { _app.destroy(true, { children: true, texture: true, baseTexture: true }); });
            }
        } else {
            this.els.bg.innerHTML = `
  <div class="shiny-screen">
    <div class="shiny-deck">
      <div class="shiny-c shiny-c1"></div>
      <div class="shiny-c shiny-c2">★</div>
      <div class="shiny-c shiny-c3"></div>
    </div>
    <div class="shiny-logo">MGO <em>Tracker</em><span>.</span></div>
  </div>`;
        }
    },
    renderMain() {
        this.els.app.innerHTML = '';
        const e = u.cfg.albums, t = Math.ceil(e / 2), n = 100 / t;
        u.cfg.usersList.forEach((r, o) => {
            const i = r.replace(/\s/g, ''), lv = 0 === o;
            let c = '';
            lv && (c = `<button class="mini-btn" data-action="mode-toggle" style="margin-right:8px;height:24px">${'number' === u.cfg.mode ? '123' : 'XXX'}</button>`);
            let d = '';
            if (lv) { const e = a(u.usr[i].note || ''); d = `<input type="text" class="user-note" placeholder="${a(s('note_ph'))}" value="${e}" data-uid="${a(i)}" onclick="event.stopPropagation()" ondblclick="event.stopPropagation()">`; }
            const m = lv ? 'is-primary' : '', p = lv && 'number' === u.cfg.mode ? 'mode-num' : '', h = a(r);
            const gv = `
<div class="glass-card anim-section ${m} ${p}" data-sec="${a(i)}">
  <div class="card-header">
      <div class="user-info">
          <div class="user-avatar">
             <div class="ua-inner">
                 <div class="ua-left">
                     <div class="ua-name">${h}</div>
                     <div class="ua-percent">0%</div>
                 </div>
                 <div class="ua-stats-col">
                     <div class="ua-top"></div>
                     <div class="ua-bot"></div>
                 </div>
             </div>
          </div>
          <div class="user-name">${h}</div>
          ${c}
          ${d}
      </div>
      <div class="card-tools"><button class="mini-btn danger reset-u-btn" data-action="reset-u" title="${a(s('reset_tooltip'))}">↺</button></div>
  <div class="expand-hint">${a(s('expand_hint'))}</div>
  </div>
  <div style="padding:0" data-u="${i}">
     <div class="grid-scroll">
        <div class="track-row">${this._genRow(1, t, n)}</div>
        <div class="track-row">${this._genRow(t + 1, e - t, n)}</div>
     </div>
<div class="legend-bar">
  <div class="legend-item"><div class="legend-swatch s-have"></div>${a(s('legend_have'))}</div>
  <div class="legend-item"><div class="legend-swatch s-dupe"></div>${a(s('legend_dupe'))}</div>
  <div class="legend-item"><div class="legend-swatch s-gold-dot"></div>${a(s('legend_gold'))}</div>
</div>
  </div>
</div>`;
            this.els.app.insertAdjacentHTML('beforeend', gv);
        });
        this.hydrate();
    },
    _genRow(e, t, sv) { let a = ''; for (let n = 0; n < t; n++) a += this._genAlb(e + n, sv); return a; },
    _genAlb(e, t) {
        let a = '';
        for (let t = 0; t < 9; t++) a += `<div class="cell-wrap" data-uid="${9 * (e - 1) + t}" data-st="0">
  <div class="i-dot i-dupe"></div><div class="i-dot i-gold"></div>
  <div class="cell-inner"><span class="t-x">X</span><span class="t-num"></span></div>
</div>`;
        return `<div class="alb-col" style="width:${t}%"><div class="alb-head">${s('album')} ${e}</div><div class="alb-grid">${a}</div></div>`;
    },
    hydrate() {
        const e = u.getGoldSet(), t = u.getDupesSet();
        this.els.app.querySelectorAll('.cell-wrap').forEach(sv => {
            const a = +sv.dataset.uid, n = sv.closest('[data-u]')?.dataset.u;
            if (!n || !u.usr[n]) return;
            const r = u.usr[n].state && u.usr[n].state[a] || 0;
            const o = u.usr[n].nums && u.usr[n].nums[a] || '';
            const i = e.has(a), lv = t.has(a);
            this.updateCardVisuals(sv, r, o, i, lv);
        });
        this.updateStats();
        this.updateVis();
    },
    updateSingleCell(e, t, sv) {
        const a = u.getGoldSet().has(+t), n = u.usr[e]?.state?.[t] || 0, r = u.usr[e]?.nums?.[t] || '';
        if (2 === sv || 2 === n) {
            const e = u.getDupesSet().has(+t);
            document.querySelectorAll(`.cell-wrap[data-uid="${t}"]`).forEach(sv => {
                const n = sv.closest('[data-u]'); if (!n) return;
                const r = n.dataset.u;
                this.updateCardVisuals(sv, u.usr[r]?.state?.[t] || 0, u.usr[r]?.nums?.[t] || '', a, e);
            });
        } else {
            const sv2 = document.querySelector(`.glass-card[data-sec="${e}"] [data-u="${e}"]`);
            if (!sv2) return void this.hydrate();
            const o = sv2.querySelector(`.cell-wrap[data-uid="${t}"]`);
            if (!o) return void this.hydrate();
            const i = u.getDupesSet();
            this.updateCardVisuals(o, n, r, a, i.has(+t));
        }
        this.updateStats();
    },
    updateCardVisuals(e, t, sv, a, n) {
        e.dataset.st = t;
        const r = e.querySelector('.t-num'), o = null == sv ? '' : sv + '';
        r.textContent !== o && (r.textContent = o);
        a ? e.dataset.bg = '1' : delete e.dataset.bg;
        e.classList.remove('show-gold', 'show-dupe');
        0 === t && (a && e.classList.add('show-gold'), n && e.classList.add('show-dupe'));
    },
    updateStats() {
        const e = 9 * u.cfg.albums, t = u.getGoldSet();
        this.els.app.querySelectorAll('.glass-card[data-sec]').forEach(sv => {
            if ('sec-gold' === sv.id) return;
            const a = u.usr[sv.dataset.sec]; if (!a) return;
            const n = a.state || {}; let r = 0, o = 0, i = 0;
            for (let sv = 0; sv < e; sv++) { const e = n[sv] || 0; e > 0 && r++; t.has(sv) && (i++, e > 0 && o++); }
            const lv = e > 0 ? Math.round(r / e * 100) : 0;
            const c = sv.querySelector('.user-avatar'), d = sv.querySelector('.ua-top'), m = sv.querySelector('.ua-bot'), p = sv.querySelector('.ua-percent');
            d && (d.textContent = `${r}/${e}`);
            m && (m.textContent = `${o}/${i}`);
            p && (p.textContent = lv + '%', p.style.color = 100 === lv ? 'var(--gold)' : lv >= 50 ? '#fb923c' : '#f87171');
            c && (c.style.background = `conic-gradient(var(--ok) ${lv}%, var(--p) 0)`);
        });
    },
    renderGoldEx() {
        const e = document.getElementById('gold-list');
        e.innerHTML = '';
        if (u.cfg.gold_ex.length > 0) {
            const h = document.createElement('div');
            h.className = 'gold-row-header';
            h.innerHTML = `<span>${a(s('album'))}</span><span>${a(s('card'))}</span><span>${a(s('date'))}</span><span></span>`;
            e.appendChild(h);
        }
        const t = document.createDocumentFragment();
        u.cfg.gold_ex.forEach((e, n) => {
            const r = document.createElement('div');
            r.className = 'gold-row';
            r.innerHTML = `<input class="g-inp" data-f="alb" maxlength="2" inputmode="numeric" placeholder="--" value="${a(e.alb || e.album || '')}"><input class="g-inp" data-f="card" placeholder="${a(s('card'))}" value="${a(e.card || '')}"><input class="g-inp" data-f="date" maxlength="5" inputmode="numeric" placeholder="JJ/MM" value="${a(e.date || '')}"><button style="background:0 0;border:none;color:var(--err);font-weight:700;cursor:pointer" data-action="del-gold" data-idx="${n}">×</button>`;
            const albInp = r.querySelector('[data-f="alb"]'), cardInp = r.querySelector('[data-f="card"]'), dateInp = r.querySelector('[data-f="date"]');
            albInp.oninput = () => { albInp.value = albInp.value.replace(/\D/g, '').slice(0, 2); u.cfg.gold_ex[n].alb = albInp.value; u.saveC(); };
            cardInp.oninput = () => { u.cfg.gold_ex[n].card = cardInp.value; u.saveC(); };
            dateInp.addEventListener('keydown', ev => { if (ev.key === 'Backspace' && dateInp.value.endsWith('/')) { dateInp.value = dateInp.value.slice(0, -1); ev.preventDefault(); } });
            dateInp.oninput = () => { let raw = dateInp.value.replace(/\D/g, ''); if (raw.length > 4) raw = raw.slice(0, 4); dateInp.value = raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw; u.cfg.gold_ex[n].date = dateInp.value; u.saveC(); };
            t.appendChild(r);
        });
        e.appendChild(t);
    },
    renderMenus() {
        const e = document.getElementById('view-list');
        e.innerHTML = '';
        const t = document.getElementById('sub-print');
        t.innerHTML = '';
        const a = document.createDocumentFragment(), n = document.createDocumentFragment();
        [...u.cfg.usersList, 'Gold'].forEach(e => {
            const t = 'Gold' === e ? 'Gold' : e.replace(/\s/g, ''), sv = u.cfg.hidden.includes(t);
            const r = document.createElement('div');
            r.className = 'menu-item';
            r.innerHTML = `<span>${e}</span><label style="cursor:pointer;display:flex"><input type="checkbox" ${sv ? '' : 'checked'} style="display:none"><div class="switch"></div></label>`;
            r.querySelector('input').onchange = e => { u.cfg.hidden = e.target.checked ? u.cfg.hidden.filter(e => e !== t) : [...u.cfg.hidden, t]; u.saveC(); this.updateVis(); };
            a.appendChild(r);
            const o = document.createElement('div');
            o.className = 'menu-item';
            o.style.cssText = 'padding:5px 8px;font-size:0.8rem';
            o.innerHTML = `<span>${e}</span><label style="cursor:pointer;display:flex;align-items:center"><input type="checkbox" class="print-chk" value="${t}" checked style="display:none"><div class="switch" style="transform:scale(0.7);transform-origin:right center"></div></label>`;
            n.appendChild(o);
        });
        e.appendChild(a);
        const r = document.createElement('button');
        r.className = 'mini-btn';
        r.dataset.action = 'do-print';
        r.style.cssText = 'justify-content:center;background:var(--p);color:#fff;margin-top:5px;width:100%';
        r.textContent = s('print_upper');
        n.appendChild(r);
        t.appendChild(n);
    },
    updateVis() {
        document.getElementById('main-app').querySelectorAll('.anim-section').forEach(e => {
            e.classList.toggle('hidden', u.cfg.hidden.includes(e.dataset.sec));
        });
    },
    renderGoldGrid(e) {
        const t = document.getElementById(e); if (!t) return;
        t.innerHTML = '';
        const a = u.cfg.albums, n = u.getGoldSet(), r = document.createElement('div');
        r.className = 'g-conf-row';
        for (let e = 1; e <= a; e++) {
            let t = '';
            for (let sv = 0; sv < 9; sv++) { const a = 9 * (e - 1) + sv; t += `<div class="g-cell ${n.has(a) ? 'active' : ''}" data-uid="${a}"></div>`; }
            const a2 = document.createElement('div');
            a2.className = 'g-conf-col';
            a2.innerHTML = `<span style="font-size:9px;font-weight:700;margin-bottom:2px">${s('album')} ${e}</span><div class="g-conf-grid">${t}</div>`;
            r.appendChild(a2);
        }
        r.onclick = e => { const t = e.target; if (t.classList.contains('g-cell')) { const e = +t.dataset.uid, sv = t.classList.contains('active'); u.setGold(e, !sv); t.classList.toggle('active'); } };
        t.appendChild(r);
    },
    switchAmbiance() {
        if (LITE_MODE || !this.els.bg) return;
        const bg = this.els.bg;
        bg.style.transition = 'opacity 0.4s ease'; bg.style.opacity = '0';
        setTimeout(() => {
            this.renderAmbiance();
            requestAnimationFrame(() => requestAnimationFrame(() => { bg.style.transition = 'opacity 0.4s ease'; bg.style.opacity = '1'; }));
        }, 450);
    },
    renderAmbianceSelector() {
        const el = document.getElementById('amb-sel'); if (!el) return;
        el.innerHTML = '';
        const hasSpecial = l(u.cfg.seed)() < .01, count = hasSpecial ? 5 : 4;
        const icons = [
            "<span style='display:inline-block;width:10px;height:10px;background:#fff;border-radius:50%'></span>",
            "<span style='display:inline-block;width:14px;height:9px;background:#fff;border-radius:3px'></span>",
            "<span style='display:inline-block;width:10px;height:10px;border:2.5px solid #fff;border-radius:1px;box-sizing:border-box'></span>",
            "<span style='display:grid;grid-template-columns:1fr 1fr;gap:2px;width:10px;height:10px'><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span></span>",
            "<span style='font-size:0.85em;line-height:1'>✨</span>"
        ];
        const labels = [s('amb_0'), s('amb_1'), s('amb_2'), s('amb_3'), s('amb_4')];
        for (let i = 0; i < count; i++) {
            const btn = document.createElement('button'), isActive = u.cfg.ambiance === i;
            btn.style.cssText = `width:40px;height:36px;border-radius:10px;border:2px solid ${isActive ? 'var(--p)' : 'rgba(255,255,255,0.15)'};background:${isActive ? 'rgba(99,102,241,0.2)' : 'rgba(0,0,0,0.3)'};cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border 0.2s,background 0.2s;box-shadow:${isActive ? '0 0 8px rgba(99,102,241,0.4)' : 'none'}`;
            btn.innerHTML = icons[i]; btn.title = labels[i];
            btn.onclick = () => { if (u.cfg.ambiance === i) return; u.cfg.ambiance = i; u.saveC(); g.switchAmbiance(); g.renderAmbianceSelector(); g.showToast(labels[i]); };
            el.appendChild(btn);
        }
    }
};
const v = {
    _lastClickCell: null,
    _lastClickTime: 0,
    _popovers: null,
    _getPopovers() { return this._popovers || (this._popovers = document.querySelectorAll('.popover')); },
    handle(e) {
        const t = e.target, a = t.closest('[data-action]'), n = t.closest('.cell-wrap'), r = t.closest('.glass-card');
        if (document.contains(t) && !t.closest('.popover') && !t.closest('.dock')) this._getPopovers().forEach(e => e.classList.remove('show'));
        if (n && 'INPUT' !== t.tagName) {
            if ('dblclick' === e.type) return e.stopPropagation(), void e.preventDefault();
            const t = Date.now();
            if (v._lastClickCell === n && t - (v._lastClickTime || 0) < 300) return void (v._lastClickCell = null);
            v._lastClickCell = n; v._lastClickTime = t;
            const sv = r && r.classList.contains('is-primary'), a = n.closest('[data-u]')?.dataset.u, o = +n.dataset.uid;
            if ('number' === u.cfg.mode && sv) {
                e.stopPropagation();
                const t = n.querySelector('.cell-inner'); t.innerHTML = '';
                const sv2 = document.createElement('input'); sv2.className = 'cell-input'; sv2.type = 'tel'; sv2.value = u.usr[a].nums[o] || '';
                sv2.onblur = () => { const e = sv2.value.trim(); u.updateCell(a, o, e, true); g.updateSingleCell(a, o, -1); };
                sv2.onkeydown = e => { 'Enter' === e.key && sv2.blur(); };
                t.appendChild(sv2);
                return void setTimeout(() => { try { sv2.focus(); } catch (e) {} }, 50);
            }
            const lv = u.usr[a].state[o] || 0, c = (lv + 1) % 3;
            i.push({ u: a, c: o, v: lv }); i.length > 50 && i.shift();
            u.updateCell(a, o, c); return void g.updateSingleCell(a, o, lv);
        }
        if (r && 'dblclick' === e.type && !a && !n) {
            return void (r.classList.contains('expanded')
                ? (() => {
                    const eh = r.offsetHeight; r.classList.remove('blur-active'); r.classList.add('blur-out', 'transitioning'); r.classList.remove('expanded');
                    requestAnimationFrame(() => {
                        const ch = r.offsetHeight, ratio = eh / Math.max(ch, 1);
                        r.style.transformOrigin = 'top center'; r.style.transition = 'none'; r.style.transform = 'scaleY(' + ratio + ')';
                        requestAnimationFrame(() => {
                            r.style.transition = 'transform 0.42s cubic-bezier(0.25,0.8,0.25,1)'; r.style.transform = 'scaleY(1)';
                            setTimeout(() => { r.style.transform = ''; r.style.transition = ''; r.style.transformOrigin = ''; r.classList.remove('blur-out', 'transitioning'); }, 440);
                        });
                    });
                })()
                : (() => {
                    const ch = r.offsetHeight; r.classList.add('transitioning'); r.classList.add('expanded');
                    requestAnimationFrame(() => {
                        const eh = r.offsetHeight, ratio = ch / Math.max(eh, 1);
                        r.style.transformOrigin = 'top center'; r.style.transition = 'none'; r.style.transform = 'scaleY(' + ratio + ')';
                        requestAnimationFrame(() => {
                            r.style.transition = 'transform 0.42s cubic-bezier(0.25,0.8,0.25,1)'; r.style.transform = 'scaleY(1)';
                            setTimeout(() => { r.style.transform = ''; r.style.transition = ''; r.style.transformOrigin = ''; r.classList.remove('transitioning'); r.classList.add('blur-active'); }, 440);
                        });
                    });
                })());
        }
        if (!a) return;
        e.stopPropagation();
        const c = a.dataset.action;
        const dv = {
            'toggle-menu': () => {
                const pm = document.getElementById('pop-menu'), pv = document.getElementById('pop-view'), wasOpen = pm.classList.contains('show');
                pv.classList.remove('show');
                if (wasOpen) { pm.classList.remove('show'); }
                else { const r = a.getBoundingClientRect(), cx = r.left + r.width / 2, pl = window.innerWidth / 2 - 140; pm.style.setProperty('--arrow-left', Math.max(16, Math.min(264, cx - pl)) + 'px'); pm.classList.add('show'); }
            },
            'toggle-view': () => {
                const pm = document.getElementById('pop-menu'), pv = document.getElementById('pop-view'), wasOpen = pv.classList.contains('show');
                pm.classList.remove('show');
                if (wasOpen) { pv.classList.remove('show'); }
                else { const r = a.getBoundingClientRect(), cx = r.left + r.width / 2, pl = window.innerWidth / 2 - 140; pv.style.setProperty('--arrow-left', Math.max(16, Math.min(264, cx - pl)) + 'px'); pv.classList.add('show'); }
            },
            'open-users': () => window.UserManager.open(),
            'close-users': () => window.UserManager.close(),
            'add-user-row': () => window.UserManager.add(),
            'save-users': () => window.UserManager.save(),
            undo: () => { const e = i.pop(); e ? (u.updateCell(e.u, e.c, e.v), g.hydrate(), g.showToast(s('undone'))) : g.showToast(s('nothing_to_undo')); },
            'mode-toggle': () => { u.cfg.mode = 'number' === u.cfg.mode ? 'cross' : 'number'; u.saveC(); g.renderMain(); },
            'cycle-ambiance': () => { if (LITE_MODE) return; const e = l(u.cfg.seed)() < .01; u.cfg.ambiance = (u.cfg.ambiance + 1) % (e ? 5 : 4); u.saveC(); g.renderAmbiance(); const t = [s('amb_0'), s('amb_1'), s('amb_2'), s('amb_3'), s('amb_4')]; g.showToast(t[u.cfg.ambiance]); },
            'reset-u': () => { const e = a.closest('.glass-card').dataset.sec; confirm(s('reset_board_q')) && (u.resetUser(e), g.hydrate(), g.showToast(s('reset_done'))); },
            'reset-all': () => {
                if (confirm(s('reset_warn1'))) {
                    let e = confirm(s('reset_warn2')) ? [...u.cfg.usersList] : [s('player') + ' 1'], t = u.cfg.ambiance;
                    i.length = 0; localStorage.clear();
                    const a = Date.now();
                    localStorage.setItem('mgo_cfg', JSON.stringify({ albums: 24, mode: 'cross', gold_ids: [], gold_ex: [], hidden: [], printHidden: [], setup_done: false, ambiance: t, seed: a, usersList: e }));
                    location.reload();
                }
            },
            'open-gold-mod': () => { g.renderGoldGrid('gold-grid-ctn'); document.getElementById('mod-gold').classList.add('open'); },
            'close-gold': () => { document.getElementById('mod-gold').classList.remove('open'); g.hydrate(); },
            'open-missions': () => MissionManager.open(),
            'close-missions': () => MissionManager.close(),
            'add-gold-row': () => { u.cfg.gold_ex.push({ alb: '', card: '', date: '' }); u.saveC(); g.renderGoldEx(); },
            'del-gold': () => { confirm(s('delete_q')) && (u.cfg.gold_ex.splice(+a.dataset.idx, 1), u.saveC(), g.renderGoldEx()); },
            'toggle-print-sub': () => { const e = document.getElementById('sub-print'); e.style.display = 'none' === e.style.display ? 'flex' : 'none'; },
            'do-print': () => {
                const e = new Set(Array.from(document.querySelectorAll('.print-chk:checked')).map(e => e.value));
                document.querySelectorAll('.glass-card').forEach(t => { t.classList.toggle('print-hidden', !e.has(t.dataset.sec)); });
                window.print();
            },
            'save-file': () => {
                const e = new Blob([JSON.stringify({ version: o.VERSION, config: u.cfg, users: u.usr })], { type: 'application/json' });
                const t = URL.createObjectURL(e), a = document.createElement('a');
                a.href = t; a.download = `Mgo_Backup_V${o.VERSION}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(t), 5000); g.showToast(s('file_dl'));
            },
            'open-share': () => { document.getElementById('pop-menu').classList.remove('show'); y.openModal(); },
            'close-share': () => { document.getElementById('mod-share').classList.remove('open'); },
            'copy-share-link': () => {
                const e = document.getElementById('share-url-field');
                navigator.clipboard.writeText(e.value).then(() => {
                    const e = document.getElementById('share-copy-btn'), t = e.innerHTML;
                    e.innerHTML = s('share_copied'); e.style.background = 'var(--ok)';
                    setTimeout(() => { e.innerHTML = t; e.style.background = 'var(--p)'; }, 2000);
                }).catch(() => { e.select(); document.execCommand('copy'); g.showToast(s('share_copied')); });
            },
            save: () => dv['save-file'](),
            load: () => {
                const e = document.createElement('input'); e.type = 'file'; e.accept = '.json';
                e.onchange = e => {
                    const t = new FileReader();
                    t.onload = e => {
                        try {
                            const t = JSON.parse(e.target.result);
                            if (t.config && t.users) {
                                u.cfg = t.config;
                                u.cfg.usersList || (u.cfg.usersList = Object.keys(t.users));
                                u.cfg.gold_ids || (u.cfg.gold_ids = []);
                                u.cfg.gold_ex || (u.cfg.gold_ex = []);
                                u.cfg.hidden || (u.cfg.hidden = []);
                                u.cfg.printHidden || (u.cfg.printHidden = []);
                                Object.keys(t.users).forEach(e => { t.users[e].state || (t.users[e].state = {}); t.users[e].nums || (t.users[e].nums = {}); });
                                u.usr = t.users;
                                void 0 === u.cfg.setup_done && (u.cfg.setup_done = true);
                                i.length = 0; u.saveC(); Object.keys(t.users).forEach(e => u.saveU(e)); location.reload();
                            } else alert(s('file_invalid'));
                        } catch (e) { alert(s('file_err')); }
                    };
                    t.readAsText(e.target.files[0]);
                };
                e.click();
            }
        };
        dv[c] && dv[c]();
    }
};
const f = {
    init() {
        const e = document.getElementById('s-alb'), t = document.getElementById('s-alb-val');
        g.renderGoldGrid('setup-gold-grid');
        e.oninput = e => { t.textContent = e.target.value; u.cfg.albums = +e.target.value; u.saveC(); g.renderGoldGrid('setup-gold-grid'); };
        document.getElementById('btn-start-season').onclick = () => {
            u.cfg.setup_done = true; u.saveC();
            document.getElementById('setup-mod').classList.remove('open');
            g.renderMenus(); g.renderMain(); g.showToast(s('good_season'));
        };
    }
};
const y = {
    _selected: null,
    openModal() {
        this._selected = null;
        const e = document.getElementById('share-player-list');
        e.innerHTML = '';
        document.getElementById('share-link-section').style.display = 'none';
        u.cfg.usersList.forEach(t => {
            const sv = t.replace(/\s/g, ''), n = document.createElement('button');
            n.className = 'mini-btn'; n.style.cssText = 'width:100%;justify-content:flex-start;padding:12px 16px;font-size:0.95rem;transition:0.2s';
            n.innerHTML = '👤 ' + a(t);
            n.onclick = () => {
                e.querySelectorAll('.mini-btn').forEach(e => { e.style.background = ''; e.style.color = ''; e.style.borderColor = ''; });
                n.style.background = 'var(--p)'; n.style.color = '#fff'; n.style.borderColor = 'var(--p)';
                this._selected = t; this._generateLink(t, sv);
            };
            e.appendChild(n);
        });
        document.getElementById('mod-share').classList.add('open');
    },
    async _generateLink(e, t) {
        const sv = JSON.stringify({ name: e, data: u.usr[t] || { state: {}, nums: {} } });
        let a;
        try {
            const e = (new TextEncoder()).encode(sv), t = new CompressionStream('gzip'), n = t.writable.getWriter();
            n.write(e); n.close();
            const r = await new Response(t.readable).arrayBuffer();
            let o = ''; new Uint8Array(r).forEach(e => o += String.fromCharCode(e));
            a = 'z:' + btoa(o);
        } catch (e) { a = btoa(unescape(encodeURIComponent(sv))); }
        const n = 'https://kevinr99089.github.io/Mgo-Tracker/?share=' + encodeURIComponent(a);
        document.getElementById('share-url-field').value = n;
        document.getElementById('share-link-section').style.display = 'flex';
    },
    async checkImport() {
        const params = new URLSearchParams(window.location.search);
        let raw = params.get('share');
        if (!raw && window.location.hash.startsWith('#share:')) raw = window.location.hash.slice(7);
        if (!raw) return;
        try {
            let decoded;
            if (raw.startsWith('z:')) {
                const b = atob(raw.slice(2)), arr = Uint8Array.from(b, c => c.charCodeAt(0));
                const ds = new DecompressionStream('gzip'), w = ds.writable.getWriter();
                w.write(arr); w.close();
                const buf = await new Response(ds.readable).arrayBuffer();
                decoded = (new TextDecoder()).decode(buf);
            } else { decoded = decodeURIComponent(escape(atob(raw))); }
            const sv = JSON.parse(decoded);
            if (!sv.name || !sv.data) return;
            this._pendingImport = sv;
        } catch (e) { console.error('Share import error', e); this._cleanURL(); }
    },
    showImportIfPending() {
        const sv = this._pendingImport; if (!sv) return;
        document.getElementById('import-name').textContent = '👤 ' + sv.name;
        const checked = Object.values(sv.data.state || {}).filter(e => 1 === e).length;
        const dupes = Object.values(sv.data.state || {}).filter(e => 2 === e).length;
        document.getElementById('import-stats').textContent = s('import_stats').replace('{c}', checked).replace('{d}', dupes);
        const nameMatch = u.cfg.usersList.includes(sv.name);
        let shareMem = {}; try { shareMem = JSON.parse(localStorage.getItem('mgo_share_mem') || '{}'); } catch (memErr) {}
        const remembered = shareMem[sv.name], rememberedValid = remembered && u.cfg.usersList.includes(remembered);
        const btnC = document.getElementById('btn-import-confirm'), btnR = document.getElementById('btn-import-replace'), btnQ = document.getElementById('btn-import-quick');
        if (nameMatch) {
            btnC.textContent = s('import_btn_update').replace('{name}', sv.name);
            btnR.style.display = 'none'; btnQ.style.display = 'none'; this._quickTarget = null;
        } else {
            btnC.textContent = s('share_import_add');
            btnR.style.display = '';
            if (rememberedValid) { btnQ.style.display = ''; btnQ.textContent = s('import_btn_quick').replace('{name}', remembered); this._quickTarget = remembered; }
            else { btnQ.style.display = 'none'; this._quickTarget = null; }
        }
        document.getElementById('import-step-1').style.display = 'flex';
        document.getElementById('import-step-2').style.display = 'none';
        document.getElementById('mod-import').classList.add('open');
    },
    confirmImport() {
        const e = this._pendingImport; if (!e) return;
        const t = e.name.replace(/\s/g, '');
        u.cfg.usersList.includes(e.name) || (u.cfg.usersList.push(e.name), u.saveC());
        u.usr[t] = { state: {}, nums: {}, ...e.data }; u.saveU(t);
        this._pendingImport = null; this._replaceTarget = null; this._closeImportModal();
        g.showToast(s('imported').replace('{name}', e.name));
        setTimeout(() => location.reload(), 900);
    },
    _cleanURL() {
        const url = new URL(window.location); let changed = false;
        if (url.searchParams.has('share')) { url.searchParams.delete('share'); changed = true; }
        if (url.hash.startsWith('#share:')) { url.hash = ''; changed = true; }
        if (changed) history.replaceState(null, '', url.toString());
    },
    _closeImportModal() {
        this._cleanURL();
        document.getElementById('mod-import').classList.remove('open');
        document.getElementById('import-step-1').style.display = 'flex';
        document.getElementById('import-step-2').style.display = 'none';
    },
    openReplaceStep() {
        const list = document.getElementById('import-player-select');
        list.innerHTML = ''; this._replaceTarget = null;
        document.getElementById('btn-import-replace-confirm').disabled = true;
        u.cfg.usersList.forEach(name => {
            const btn = document.createElement('button');
            btn.className = 'mini-btn'; btn.style.cssText = 'width:100%;justify-content:flex-start;padding:10px 14px;font-size:0.9rem;transition:0.2s';
            btn.textContent = '👤 ' + name;
            btn.onclick = () => {
                list.querySelectorAll('.mini-btn').forEach(b => { b.style.background = ''; b.style.borderColor = ''; b.style.color = ''; });
                btn.style.background = 'var(--p)'; btn.style.borderColor = 'var(--p)'; btn.style.color = '#fff';
                this._replaceTarget = name; document.getElementById('btn-import-replace-confirm').disabled = false;
            };
            list.appendChild(btn);
        });
        document.getElementById('import-step-1').style.display = 'none';
        document.getElementById('import-step-2').style.display = 'flex';
    },
    confirmReplace() {
        const e = this._pendingImport; if (!e || !this._replaceTarget) return;
        if (!confirm(s('import_replace_warn').replace('{name}', this._replaceTarget))) return;
        const targetKey = this._replaceTarget.replace(/\s/g, '');
        u.usr[targetKey] = { state: {}, nums: {}, ...e.data }; u.saveU(targetKey);
        const replaced = this._replaceTarget;
        let shareMemR = {}; try { shareMemR = JSON.parse(localStorage.getItem('mgo_share_mem') || '{}'); } catch (memErr) {}
        shareMemR[e.name] = replaced; localStorage.setItem('mgo_share_mem', JSON.stringify(shareMemR));
        this._pendingImport = null; this._replaceTarget = null; this._closeImportModal();
        g.showToast(s('data_replaced').replace('{name}', replaced));
        setTimeout(() => location.reload(), 900);
    },
    confirmQuickUpdate() {
        const e = this._pendingImport; if (!e || !this._quickTarget) return;
        const t = this._quickTarget.replace(/\s/g, '');
        u.usr[t] = { state: {}, nums: {}, ...e.data }; u.saveU(t);
        const target = this._quickTarget; this._pendingImport = null; this._quickTarget = null; this._closeImportModal();
        g.showToast(s('updated').replace('{name}', target));
        setTimeout(() => location.reload(), 900);
    }
};
const MissionManager = {
    LS_DATA: 'mgo_missions_data',
    LS_WEEK: 'mgo_missions_week',
    _data: null,
    _getMondayDate(from) {
        const d = new Date(from); d.setHours(0, 0, 0, 0);
        const day = d.getDay(), diff = (day === 0) ? -6 : 1 - day;
        d.setDate(d.getDate() + diff); return d;
    },
    _weekKey(monday) {
        return monday.getFullYear() + '-' + String(monday.getMonth() + 1).padStart(2, '0') + '-' + String(monday.getDate()).padStart(2, '0');
    },
    _empty() { return Array.from({ length: 7 }, () => ({ texts: ['', '', ''], done: [false, false, false] })); },
    init() {
        const now = new Date(), monday = this._getMondayDate(now), currentKey = this._weekKey(monday);
        const storedKey = localStorage.getItem(this.LS_WEEK);
        if (storedKey !== currentKey) {
            localStorage.removeItem(this.LS_DATA); localStorage.setItem(this.LS_WEEK, currentKey); this._data = this._empty();
        } else {
            try { const raw = localStorage.getItem(this.LS_DATA); this._data = raw ? JSON.parse(raw) : this._empty(); }
            catch (e) { this._data = this._empty(); }
        }
    },
    save() { localStorage.setItem(this.LS_DATA, JSON.stringify(this._data)); },
    open() { if (!this._data) this.init(); this._render(); document.getElementById('mod-missions').classList.add('open'); },
    close() { document.getElementById('mod-missions').classList.remove('open'); },
    _render() {
        const body = document.getElementById('missions-body'); body.innerHTML = '';
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const monday = this._getMondayDate(new Date());
        const days = s('days'), months = s('months');
        const frag = document.createDocumentFragment();
        for (let di = 0; di < 7; di++) {
            const dayDate = new Date(monday); dayDate.setDate(monday.getDate() + di);
            const isToday = dayDate.getTime() === now.getTime();
            const dayName = Array.isArray(days) ? days[di] : di;
            const monthName = Array.isArray(months) ? months[dayDate.getMonth()] : dayDate.getMonth();
            const dayLabel = dayName + ' ' + dayDate.getDate() + ' ' + monthName + ' ' + dayDate.getFullYear();
            const card = document.createElement('div');
            card.className = 'mission-day-card' + (isToday ? ' today-card' : '');
            const lbl = document.createElement('div'); lbl.className = 'mission-day-label'; lbl.textContent = dayLabel;
            if (isToday) { const badge = document.createElement('span'); badge.className = 'today-badge'; badge.textContent = s('today'); lbl.appendChild(badge); }
            card.appendChild(lbl);
            for (let mi = 0; mi < 3; mi++) {
                const row = document.createElement('div'); row.className = 'mission-row';
                const ta = document.createElement('textarea'); ta.className = 'mission-input'; ta.rows = 1;
                ta.placeholder = s('mission_ph').replace('{n}', mi + 1);
                ta.value = this._data[di].texts[mi] || ''; ta.dataset.di = di; ta.dataset.mi = mi;
                ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 80) + 'px'; this._data[di].texts[mi] = ta.value; this.save(); });
                ta.addEventListener('focus', () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 80) + 'px'; });
                row.appendChild(ta); card.appendChild(row);
            }
            frag.appendChild(card);
        }
        body.appendChild(frag);
    }
};
function __initApp(skipSplashDelay = false) {
    r();
    u.init();
    MissionManager.init();
    y.checkImport();
    document.getElementById('btn-import-confirm').onclick = () => y.confirmImport();
    document.getElementById('btn-import-quick').onclick = () => y.confirmQuickUpdate();
    document.getElementById('btn-import-replace').onclick = () => y.openReplaceStep();
    document.getElementById('btn-import-replace-back').onclick = () => {
        document.getElementById('import-step-1').style.display = 'flex';
        document.getElementById('import-step-2').style.display = 'none';
        y._replaceTarget = null;
    };
    document.getElementById('btn-import-replace-confirm').onclick = () => y.confirmReplace();
    document.getElementById('btn-import-cancel').onclick = () => { y._pendingImport = null; y._replaceTarget = null; y._closeImportModal(); };
    const e = document.getElementById('sl-alb');
    let t;
    e.value = u.cfg.albums;
    document.getElementById('lbl-alb').textContent = u.cfg.albums;
    e.oninput = e => {
        document.getElementById('lbl-alb').textContent = e.target.value;
        clearTimeout(t);
        t = setTimeout(() => { u.cfg.albums = +e.target.value; u.invalidateGold(); u.saveC(); g.renderMain(); }, 300);
    };
    g.renderMain();
    g.renderGoldEx();
    g.renderMenus();
    if (!LITE_MODE) {
        const a = d(u.cfg);
        a && u.saveC();
        g.renderAmbianceSelector();
        if (a) setTimeout(() => g.showToast(s(a)), 500);
        else if (4 === u.cfg.ambiance) g.showToast(s('shiny_season'));
    }
    const n = v.handle.bind(v);
    let o2;
    document.body.addEventListener('click', n);
    document.body.addEventListener('dblclick', n);
    document.body.addEventListener('input', e => {
        if (e.target.classList.contains('user-note')) {
            const t = e.target.dataset.uid;
            if (u.usr[t]) {
                const sv = e.target.value;
                sv ? u.usr[t].note = sv : delete u.usr[t].note;
                clearTimeout(o2); o2 = setTimeout(() => u.saveU(t), 400);
            }
        }
    });
    f.init();
    const __sp = document.getElementById('splash');
    if (LITE_MODE) {
        requestAnimationFrame(() => setTimeout(() => {
            __sp.style.transition = 'opacity 0.4s ease'; __sp.style.opacity = '0';
            setTimeout(() => { __sp.remove(); u.cfg.setup_done || document.getElementById('setup-mod').classList.add('open'); y.showImportIfPending(); }, 400);
        }, 500));
    } else {
        const __bg = document.getElementById('ambient-bg');
        setTimeout(() => {
            __sp.style.transition = 'opacity 0.35s ease, visibility 0.35s ease';
            __sp.style.opacity = '0'; __sp.style.visibility = 'hidden'; __sp.style.pointerEvents = 'none';
            setTimeout(() => { g.renderAmbiance(); requestAnimationFrame(() => requestAnimationFrame(() => { __bg.style.opacity = '1'; })); }, 500);
            const e = [...document.querySelectorAll('.anim-section')], t = e.filter(e => !e.classList.contains('hidden'));
            e.forEach(e => { e.style.opacity = '0'; e.style.transform = 'translateY(22px)'; e.style.transition = 'none'; });
            const sv = 'cubic-bezier(0.22, 1, 0.36, 1)';
            t.forEach((e, t) => { setTimeout(() => { e.style.transition = `opacity 450ms ${sv}, transform 450ms ${sv}`; e.style.opacity = '1'; e.style.transform = 'translateY(0)'; }, 75 * t); });
            setTimeout(() => {
                e.forEach(e => { e.style.removeProperty('opacity'); e.style.removeProperty('transform'); e.style.removeProperty('transition'); });
                __sp.remove();
                u.cfg.setup_done || document.getElementById('setup-mod').classList.add('open');
                y.showImportIfPending();
            }, 75 * t.length + 450 + 80);
        }, skipSplashDelay ? 0 : 700);
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    LITE_MODE = document.documentElement.className === 'lite-mode';
    await initI18n();
    r();
    const __sv = localStorage.getItem(__MGO_PREF);
    if (!__sv) {
        document.getElementById('__hub').style.display = 'flex';
        return;
    }
    __initApp();
});
