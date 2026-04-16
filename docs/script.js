
const SUPPORTED_LANGUAGES = {
    'fr': 'french.txt',
    'en': 'english.txt'
};
let currentLang = 'en';
let translations = {};
async function loadTranslations() {
    const navLang = (navigator.language || 'en').slice(0, 2);
    currentLang = SUPPORTED_LANGUAGES[navLang] ? navLang : Object.keys(SUPPORTED_LANGUAGES)[0];
    try {
        const response = await fetch(SUPPORTED_LANGUAGES[currentLang]);
        if (!response.ok) throw new Error('Translation file not found');
        const text = await response.text();
        const cleanText = text.replace(/\/g, '');
        translations = JSON.parse(cleanText);
    } catch (error) {
        console.error("Failed to load translation file:", error);
        translations = {};
    }
    document.documentElement.lang = currentLang;
}
function s(key) {
    return translations[key] || key;
}
function a(e) {
    return (e + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function r() {
    const htmlNodes = new Set(["add_upper"]);
    document.querySelectorAll("[data-i18n]").forEach(e => {
        const t = e.dataset.i18n;
        const txt = s(t);
        if (txt) {
            htmlNodes.has(t) ? e.innerHTML = txt : e.textContent = txt;
        }
    });
    document.querySelectorAll("[data-i18n-title]").forEach(e => {
        e.title = s(e.dataset.i18nTitle) || e.title;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(e => {
        e.placeholder = s(e.dataset.i18nPlaceholder) || e.placeholder;
    });
}
const __MGO_PREF = 'mgo_unified_version';
let LITE_MODE = document.documentElement.className === 'lite-mode';
const o = { VERSION: "4.1.5 (Web)" };
let i = [];
function l(e) {
    return function() {
        var t = e += 1831565813;
        t = Math.imul(t ^ t >>> 15, 1 | t);
        return (((t ^= t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t >>> 14) >>> 0) / 4294967296;
    }
}
function c(e) {
    return l(e)() < .01;
}
function d(e) {
    const t = c(e.seed) ? 4 : 3;
    if (e.ambiance == null || typeof e.ambiance !== "number" || e.ambiance < 0 || !Number.isInteger(e.ambiance)) {
        e.ambiance = 0;
        return null;
    }
    if (e.ambiance > t) {
        if (e.ambiance !== 4 || c(e.seed)) {
            e.ambiance = 0;
            return "cheat_easter";
        } else {
            e.ambiance = 0;
            return "cheat_shiny";
        }
    }
    return null;
}
function __pickVersion(v, btn) {
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
                __initApp();
            }, 820);
        });
    } else {
        hub.style.display = 'none';
        __initApp();
    }
}
const u = {
    cfg: { albums: 24, mode: "cross", gold_ids: [], gold_ex: [], hidden: [], printHidden: [], setup_done: !1, ambiance: 0, seed: Date.now(), usersList: [] },
    usr: {}, _dupesCache: null, _goldCache: null, _saveTimers: {},
    getGoldSet() { return this._goldCache || (this._goldCache = new Set(this.cfg.gold_ids)), this._goldCache; },
    invalidateGold() { this._goldCache = null; },
    getDupesSet() {
        if (this._dupesCache) return this._dupesCache;
        const e = new Set;
        Object.values(this.usr).forEach(t => { t && t.state && Object.entries(t.state).forEach(([t, s]) => { 2 === s && e.add(+t) }) });
        return this._dupesCache = e, e;
    },
    invalidateDupes() { this._dupesCache = null; },
    debounceSave(e) { clearTimeout(this._saveTimers[e]), this._saveTimers[e] = setTimeout(() => this.saveU(e), 400); },
    init() {
        const e = localStorage.getItem("mgo_cfg");
        if (e) {
            try {
                const t = JSON.parse(e);
                this.cfg = { ...this.cfg, ...t };
                if (!this.cfg.seed) this.cfg.seed = Date.now();
            } catch (e) { console.error("Config corrupt", e); }
        }
        if (!this.cfg.usersList || this.cfg.usersList.length === 0) {
            this.cfg.usersList = [s("player") + " 1"];
        }
        this.cfg.usersList.forEach(e => {
            const t = e.replace(/\s/g, "");
            const dataStr = localStorage.getItem("mgo_u_" + t);
            if (dataStr) {
                try {
                    const parsed = JSON.parse(dataStr);
                    this.usr[t] = { state: {}, nums: {}, ...parsed };
                    if (!this.usr[t].state) this.usr[t].state = {};
                    if (!this.usr[t].nums) this.usr[t].nums = {};
                } catch (e) {
                    console.error("User data corrupt for", t, e);
                    this.usr[t] = { state: {}, nums: {} };
                }
            } else {
                this.usr[t] = { state: {}, nums: {} };
            }
        });
    },
    saveC() { localStorage.setItem("mgo_cfg", JSON.stringify(this.cfg)); },
    saveU(e) { this.usr[e] && localStorage.setItem("mgo_u_" + e, JSON.stringify(this.usr[e])); },
    setGold(e, t) {
        const s = new Set(this.cfg.gold_ids);
        t ? s.add(e) : s.delete(e);
        this.cfg.gold_ids = Array.from(s);
        this.invalidateGold();
        this.saveC();
    },
    updateCell(e, t, val, isNum = false) {
        if (this.usr[e]) {
            if (!this.usr[e].state) this.usr[e].state = {};
            if (!this.usr[e].nums) this.usr[e].nums = {};
            if (isNum) {
                val ? this.usr[e].nums[t] = val : delete this.usr[e].nums[t];
            } else {
                const a = this.usr[e].state[t] || 0;
                if (val === 0) {
                    delete this.usr[e].state[t];
                } else {
                    this.usr[e].state[t] = val;
                }
                if (a === 2 || val === 2) this.invalidateDupes();
            }
            this.debounceSave(e);
        }
    },
    resetUser(e) {
        if (this.usr[e]) {
            this.usr[e].state = {};
            this.usr[e].nums = {};
            this.invalidateDupes();
            this.saveU(e);
        }
    }
};
window.UserManager = {
    tempUsers: [], _newIndices: new Set(), _dragSrc: null, _touchSrc: null, _touchClone: null, _touchStartY: 0,
    open() {
        this.tempUsers = [...u.cfg.usersList];
        this.render();
        document.getElementById("mod-users").classList.add("open");
    },
    close() {
        this._newIndices.clear();
        document.getElementById("mod-users").classList.remove("open");
    },
    render() {
        const e = document.getElementById("users-edit-list");
        e.innerHTML = "";
        this.tempUsers.forEach((t, index) => {
            const n = document.createElement("div");
            n.className = "um-row" + (this._newIndices.has(index) ? " um-new" : "");
            n.draggable = !0;
            n.dataset.idx = index;
            const r = a(t);
            n.innerHTML = `
                <span class="um-handle" title="${s("drag_reorder")}">⠿</span>
                <input type="text" class="g-inp um-inp" style="flex:1;border:1px solid var(--glass-b);border-radius:6px;padding:8px;color:#fff" value="${r}" data-idx="${index}">
                <button class="mini-btn danger um-del" data-idx="${index}" ${this.tempUsers.length <= 1 ? "disabled" : ""}>×</button>
            `;
            n.addEventListener("dragstart", ev => this._onDragStart(ev, n));
            n.addEventListener("dragover", ev => this._onDragOver(ev, n));
            n.addEventListener("dragleave", ev => n.classList.remove("um-drag-over"));
            n.addEventListener("drop", ev => this._onDrop(ev, n));
            n.addEventListener("dragend", ev => this._onDragEnd());
            const o = n.querySelector(".um-handle");
            o.addEventListener("touchstart", ev => this._onTouchStart(ev, n), { passive: !1 });
            o.addEventListener("touchmove", ev => this._onTouchMove(ev), { passive: !1 });
            o.addEventListener("touchend", ev => this._onTouchEnd(ev), { passive: !1 });
            n.querySelector(".um-inp").addEventListener("change", ev => this.update(+ev.target.dataset.idx, ev.target.value));
            n.querySelector(".um-del").addEventListener("click", ev => this.remove(+ev.target.dataset.idx));
            e.appendChild(n);
        });
    },
    _onDragStart(e, t) { this._dragSrc = t; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", t.dataset.idx); setTimeout(() => t.classList.add("um-dragging"), 0); },
    _onDragOver(e, t) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; t !== this._dragSrc && (document.querySelectorAll(".um-row").forEach(e => e.classList.remove("um-drag-over")), t.classList.add("um-drag-over")); },
    _onDrop(e, t) { e.preventDefault(); if (t === this._dragSrc) return; const idx = +t.dataset.idx; const item = this.tempUsers.splice(+this._dragSrc.dataset.idx, 1)[0]; this.tempUsers.splice(idx, 0, item); this.render(); },
    _onDragEnd() { document.querySelectorAll(".um-row").forEach(e => { e.classList.remove("um-dragging", "um-drag-over") }); this._dragSrc = null; },
    _onTouchStart(e, t) { e.preventDefault(); this._touchSrc = t; this._touchStartY = e.touches[0].clientY; const s = t.cloneNode(!0); s.classList.add("um-touch-clone"); s.style.top = t.getBoundingClientRect().top + "px"; document.body.appendChild(s); this._touchClone = s; t.classList.add("um-dragging"); },
    _onTouchMove(e) { if (!this._touchClone) return; e.preventDefault(); const t = e.touches[0].clientY; this._touchClone.style.top = (t - 22) + "px"; const elem = document.elementsFromPoint(e.touches[0].clientX, t).find(e => e.classList.contains("um-row") && e !== this._touchSrc); document.querySelectorAll(".um-row").forEach(e => e.classList.remove("um-drag-over")); elem && elem.classList.add("um-drag-over"); },
    _onTouchEnd(e) { if (!this._touchClone) return; const t = document.elementsFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY).find(e => e.classList.contains("um-row") && e !== this._touchSrc); if (this._touchClone.remove(), this._touchClone = null, t) { const idx = +t.dataset.idx; const item = this.tempUsers.splice(+this._touchSrc.dataset.idx, 1)[0]; this.tempUsers.splice(idx, 0, item); } this.render(); this._touchSrc = null; },
    update(e, t) { this.tempUsers[e] = t.trim() || `${s("player")} ${e + 1}`; },
    add() {
        const ni = this.tempUsers.length;
        this.tempUsers.push(`${s("player")} ${ni + 1}`);
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
            const oldKey = oldName.replace(/\s/g, ""), newKey = newName.replace(/\s/g, "");
            if (oldKey !== newKey && u.usr[oldKey]) {
                u.usr[newKey] = u.usr[oldKey];
                delete u.usr[oldKey];
                try { localStorage.removeItem("mgo_u_" + oldKey); } catch (e) {}
                u.saveU(newKey);
            }
        });
        const oldFirstKey = originalList[0] ? originalList[0].replace(/\s/g, "") : null;
        const newFirstKey = this.tempUsers[0] ? this.tempUsers[0].replace(/\s/g, "") : null;
        if (oldFirstKey && newFirstKey && oldFirstKey !== newFirstKey && u.usr[oldFirstKey]) {
            u.usr[oldFirstKey].nums = {};
            u.saveU(oldFirstKey);
        }
        this.tempUsers.forEach(e => {
            const t = e.replace(/\s/g, "");
            if (!u.usr[t]) u.usr[t] = { state: {}, nums: {} };
        });
        u.cfg.usersList = [...this.tempUsers];
        u.saveC();
        this.close();
        g.renderMenus();
        g.renderMain();
        g.showToast(s("players_updated"));
    }
};
let m = null, p = null;
function h() { m && (cancelAnimationFrame(m), m = null), p && (p(), p = null); }
const g = {
    els: { app: document.getElementById("gen-cards"), toast: document.getElementById("toast"), bg: document.getElementById("ambient-bg") },
    showToast(e) {
        this.els.toast.textContent = e;
        this.els.toast.classList.add("show");
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => this.els.toast.classList.remove("show"), 2e3);
    },
    renderAmbiance() {
        if (LITE_MODE || !this.els.bg) return;
        h();
        this.els.bg.innerHTML = "";
        const e = l(u.cfg.seed), t = u.cfg.ambiance || 0, colors = ["#4f46e5", "#c026d3", "#06b6d4", "#f472b6", "#fbbf24"];
        if (4 !== t) {
            if (0 === t) {
                const c = 7;
                for (let d = 0; d < c; d++) {
                    const gEl = document.createElement("div");
                    gEl.className = "f-obj f-orb";
                    const v = 45 + 40 * e(), f = colors[Math.floor(e() * colors.length)];
                    gEl.style.cssText = `width:${v}vw; height:${v}vw; top:${90 * e() - 5}%; left:${90 * e() - 5}%; background:radial-gradient(circle at 50% 50%, ${f} 0%, transparent 68%);`;
                    gEl.style.setProperty("--d", 18 + 16 * e() + "s");
                    gEl.style.setProperty("--tx", 18 * e() - 9 + "vw");
                    gEl.style.setProperty("--ty", 18 * e() - 9 + "vh");
                    gEl.style.setProperty("--r0", 30 * e() - 15 + "deg");
                    gEl.style.setProperty("--r1", 30 * e() - 15 + "deg");
                    this.els.bg.appendChild(gEl);
                }
                return;
            }
            if (1 === t) {
                const y = ["linear-gradient(145deg,#3b41d8,#6468f5)", "linear-gradient(145deg,#c77b10,#f0aa22)", "linear-gradient(145deg,#b8233b,#eb3a5f)", "linear-gradient(145deg,#0e766e,#14b8a6)", "linear-gradient(145deg,#7c3aed,#a855f7)", "linear-gradient(145deg,#065f86,#0ea5e9)"];
                const b = 7;
                for (let _ = 0; _ < b; _++) {
                    const E = document.createElement("div");
                    E.className = "f-obj f-card";
                    const L = 18 + 22 * e(), w = .65 + .25 * e(), C = 60 * e() - 30;
                    E.style.cssText = `width:${L}vw; height:${L / w}vw; top:${85 * e() - 5}%; left:${85 * e() - 5}%; background:${y[Math.floor(e() * y.length)]};`;
                    E.style.setProperty("--d", 20 + 18 * e() + "s");
                    E.style.setProperty("--tx", 20 * e() - 10 + "vw");
                    E.style.setProperty("--ty", 20 * e() - 10 + "vh");
                    E.style.setProperty("--r0", C + "deg");
                    E.style.setProperty("--r1", C + 40 * e() - 20 + "deg");
                    this.els.bg.appendChild(E);
                }
                return;
            }
            if (2 === t) {
                const S = 9;
                for (let x = 0; x < S; x++) {
                    const T = document.createElement("div");
                    T.className = "f-obj f-neon";
                    const I = 8 + 18 * e(), $ = e() > .5 ? I : I * (.5 + .8 * e()), M = colors[Math.floor(e() * colors.length)], k = e() > .5 ? 45 : 30 * e() - 15;
                    T.style.cssText = `width:${I}vw; height:${$}vw; top:${88 * e()}%; left:${88 * e()}%; border-color:${M};`;
                    T.style.setProperty("--glow", M);
                    T.style.setProperty("--d", 14 + 18 * e() + "s");
                    T.style.setProperty("--pd", 2.5 + 2 * e() + "s");
                    T.style.setProperty("--tx", 26 * e() - 13 + "vw");
                    T.style.setProperty("--ty", 26 * e() - 13 + "vh");
                    T.style.setProperty("--r0", k + "deg");
                    T.style.setProperty("--r1", k + 60 * e() - 30 + "deg");
                    e() < .3 && (T.classList.add("f-neon-dying"), T.style.setProperty("--fd", 3 + 5 * e() + "s"));
                    this.els.bg.appendChild(T);
                }
                return;
            }
            if (3 === t) {
                const A = document.createElement("div");
                A.className = "lava-wrap";
                const N = document.createElement("canvas");
                N.className = "lava-canvas";
                A.appendChild(N);
                this.els.bg.appendChild(A);
                const R = N.getContext("2d");
                let B, U, O;
                function setupCanvas() {
                    O = Math.min(window.devicePixelRatio || 1, 2);
                    B = A.clientWidth; U = A.clientHeight;
                    N.width = B * O * .5; N.height = U * O * .5;
                    N.style.width = B + "px"; N.style.height = U + "px";
                    R.scale(.5 * O, .5 * O);
                }
                setupCanvas();
                const q = [], P = 2 + Math.floor(2 * e()), D = [...colors].sort(() => e() - .5);
                for (let te = 0; te < P; te++) q.push(D[te % D.length]);
                const G = q.map(function(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; });
                const H = 10, j = [];
                for (let se = 0; se < H; se++) {
                    const ae = 35 + 55 * e(), ne = e() * U;
                    j.push({ x: e() * B, y: ne, vx: 0, vy: 0, r: ae, baseR: ae, col: G[Math.floor(e() * G.length)], phase: e() * Math.PI * 2, freq: .08 + .12 * e(), drift: .06 * (e() - .5), temp: 1 - ne / U, tempInertia: .12 + .18 * e() });
                }
                let F, V = { x: -9999, y: -9999, active: !1 }, z = null;
                function onTouchStart(ev) { const t = ev.touches ? ev.touches[0] : ev; z = A.getBoundingClientRect(); V.x = t.clientX - z.left; V.y = t.clientY - z.top; V.active = !0; }
                function onTouchMove(ev) { if (!V.active || !z) return; const t = ev.touches ? ev.touches[0] : ev; V.x = t.clientX - z.left; V.y = t.clientY - z.top; }
                function onTouchEnd() { V.active = !1; z = null; }
                function onResize() { clearTimeout(F); F = setTimeout(() => { R.setTransform(1, 0, 0, 1, 0, 0); setupCanvas(); J = .5 * O; j.forEach(p => { p.x = Math.min(p.x, B); p.y = Math.min(p.y, U); }); }, 150); }
                const __ac = new AbortController(), __sig = __ac.signal;
                A.style.pointerEvents = "auto";
                A.addEventListener("mousedown", onTouchStart, { signal: __sig });
                A.addEventListener("mousemove", onTouchMove, { signal: __sig });
                A.addEventListener("mouseup", onTouchEnd, { signal: __sig });
                A.addEventListener("mouseleave", onTouchEnd, { signal: __sig });
                A.addEventListener("touchstart", onTouchStart, { passive: !0, signal: __sig });
                A.addEventListener("touchmove", onTouchMove, { passive: !0, signal: __sig });
                A.addEventListener("touchcancel", onTouchEnd, { signal: __sig });
                window.addEventListener("resize", onResize, { signal: __sig });
                let Y = 0, J = .5 * O;
                const W = .994, X = 6.5, K = .42, Z = 1, ee = 200;
                return m = requestAnimationFrame(function anim(time) {
                    m = requestAnimationFrame(anim);
                    const dt = Math.min((time - Y) / 1e3, .05);
                    if (Y = time, dt <= 0) return;
                    for (let e = 0; e < H; e++) {
                        const a = j[e];
                        a.temp += (a.y / U - a.temp) * a.tempInertia * dt;
                        a.vy -= (a.temp - K) * X * dt;
                        a.phase += a.freq * dt;
                        a.vx += Math.sin(a.phase + 1.7 * e) * Z * dt;
                        a.vx += a.drift * dt * 3;
                        if (V.active) {
                            const ox = V.x - a.x, oy = V.y - a.y, od = Math.sqrt(ox * ox + oy * oy) + 1;
                            const onx = ox / od, ony = oy / od, otx = -ony, oty = onx;
                            const oratio = 1 - Math.min(od, ee) / ee;
                            const oradF = oratio * oratio * 65 * dt, oorbF = oratio * 45 * dt;
                            a.vx += onx * oradF + otx * oorbF;
                            a.vy += ony * oradF + oty * oorbF;
                        }
                        for (let t = e + 1; t < H; t++) {
                            const p2 = j[t], dx = p2.x - a.x, dy = p2.y - a.y, dist = Math.sqrt(dx * dx + dy * dy) + 1, minDist = .35 * (a.r + p2.r);
                            if (dist < minDist) {
                                const force = .08 * (minDist - dist) * dt, fx = dx / dist, fy = dy / dist;
                                a.vx -= fx * force; a.vy -= fy * force;
                                p2.vx += fx * force; p2.vy += fy * force;
                            }
                        }
                        a.vx *= W; a.vy *= W; a.x += a.vx; a.y += a.vy;
                        const bound = .3 * a.r;
                        if (a.x < -bound) { a.x = -bound; a.vx = .3 * Math.abs(a.vx); }
                        if (a.x > B + bound) { a.x = B + bound; a.vx = .3 * -Math.abs(a.vx); }
                        if (a.y < -bound) { a.y = -bound; a.vy = .3 * Math.abs(a.vy); }
                        if (a.y > U + bound) { a.y = U + bound; a.vy = .3 * -Math.abs(a.vy); }
                        a.r = a.baseR + Math.sin(6e-4 * time + 2.1 * e) * a.baseR * .06;
                    }
                    R.setTransform(J, 0, 0, J, 0, 0); R.clearRect(0, 0, B, U);
                    for (let e = 0; e < H; e++) {
                        const t = j[e], [sC, aC, nC] = t.col, r = 1.8 * t.r, o = R.createRadialGradient(t.x, t.y, 0, t.x, t.y, r);
                        o.addColorStop(0, `rgba(${sC},${aC},${nC},0.95)`); o.addColorStop(.4, `rgba(${sC},${aC},${nC},0.7)`);
                        o.addColorStop(.7, `rgba(${sC},${aC},${nC},0.3)`); o.addColorStop(1, `rgba(${sC},${aC},${nC},0)`);
                        R.beginPath(); R.arc(t.x, t.y, r, 0, 2 * Math.PI); R.fillStyle = o; R.fill();
                    }
                }), void (p = () => { __ac.abort(); clearTimeout(F); });
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
        this.els.app.innerHTML = "";
        const e = u.cfg.albums, t = Math.ceil(e / 2), n = 100 / t;
        u.cfg.usersList.forEach((r, o) => {
            const i = r.replace(/\s/g, ""), l = 0 === o;
            let c = "";
            l && (c = `<button class="mini-btn" data-action="mode-toggle" style="margin-right:8px;height:24px">${"number" === u.cfg.mode ? "123" : "XXX"}</button>`);
            let d = "";
            if (l) {
                const noteVal = a(u.usr[i].note || "");
                d = `<input type="text" class="user-note" placeholder="${a(s("note_ph"))}" value="${noteVal}" data-uid="${a(i)}" onclick="event.stopPropagation()" ondblclick="event.stopPropagation()">`;
            }
            const m = l ? "is-primary" : "", p = l && "number" === u.cfg.mode ? "mode-num" : "", h = a(r);
            const gHTML = `
                <div class="glass-card anim-section ${m} ${p}" data-sec="${a(i)}">
                    <div class="card-header">
                        <div class="user-info">
                            <div class="user-avatar">
                                <div class="ua-inner">
                                    <div class="ua-left"><div class="ua-name">${h}</div><div class="ua-percent">0%</div></div>
                                    <div class="ua-stats-col"><div class="ua-top"></div><div class="ua-bot"></div></div>
                                </div>
                            </div>
                            <div class="user-name">${h}</div>
                            ${c}
                            ${d}
                        </div>
                        <div class="card-tools"><button class="mini-btn danger reset-u-btn" data-action="reset-u" title="${s("reset_tooltip")}">↺</button></div>
                        <div class="expand-hint">${s("expand_hint")}</div>
                    </div>
                    <div style="padding:0" data-u="${i}">
                        <div class="grid-scroll">
                            <div class="track-row">${this._genRow(1, t, n)}</div>
                            <div class="track-row">${this._genRow(t + 1, e - t, n)}</div>
                        </div>
                        <div class="legend-bar">
                            <div class="legend-item"><div class="legend-swatch s-have"></div>${s("legend_have")}</div>
                            <div class="legend-item"><div class="legend-swatch s-dupe"></div>${s("legend_dupe")}</div>
                            <div class="legend-item"><div class="legend-swatch s-gold-dot"></div>${s("legend_gold")}</div>
                        </div>
                    </div>
                </div>`;
            this.els.app.insertAdjacentHTML("beforeend", gHTML);
        });
        this.hydrate();
    },
    _genRow(e, t, sPct) { let a = ""; for (let n = 0; n < t; n++) a += this._genAlb(e + n, sPct); return a; },
    _genAlb(e, t) {
        let a = "";
        for (let idx = 0; idx < 9; idx++) {
            a += `<div class="cell-wrap" data-uid="${9 * (e - 1) + idx}" data-st="0">
                    <div class="i-dot i-dupe"></div><div class="i-dot i-gold"></div>
                    <div class="cell-inner"><span class="t-x">X</span><span class="t-num"></span></div>
                  </div>`;
        }
        return `<div class="alb-col" style="width:${t}%"><div class="alb-head">${s("album")} ${e}</div><div class="alb-grid">${a}</div></div>`;
    },
    hydrate() {
        const e = u.getGoldSet(), t = u.getDupesSet();
        this.els.app.querySelectorAll(".cell-wrap").forEach(cell => {
            const a = +cell.dataset.uid, n = cell.closest("[data-u]")?.dataset.u;
            if (!n || !u.usr[n]) return;
            const r = u.usr[n].state && u.usr[n].state[a] || 0, o = u.usr[n].nums && u.usr[n].nums[a] || "", i = e.has(a), l = t.has(a);
            this.updateCardVisuals(cell, r, o, i, l);
        });
        this.updateStats();
        this.updateVis();
    },
    updateSingleCell(e, t, val) {
        const a = u.getGoldSet().has(+t), n = u.usr[e]?.state?.[t] || 0, r = u.usr[e]?.nums?.[t] || "";
        if (val === 2 || n === 2) {
            const dupes = u.getDupesSet().has(+t);
            document.querySelectorAll(`.cell-wrap[data-uid="${t}"]`).forEach(s => {
                const nNode = s.closest("[data-u]");
                if (!nNode) return;
                const rKey = nNode.dataset.u;
                this.updateCardVisuals(s, u.usr[rKey]?.state?.[t] || 0, u.usr[rKey]?.nums?.[t] || "", a, dupes);
            });
        } else {
            const sNode = document.querySelector(`.glass-card[data-sec="${e}"] [data-u="${e}"]`);
            if (!sNode) return void this.hydrate();
            const o = sNode.querySelector(`.cell-wrap[data-uid="${t}"]`);
            if (!o) return void this.hydrate();
            const i = u.getDupesSet();
            this.updateCardVisuals(o, n, r, a, i.has(+t));
        }
        this.updateStats();
    },
    updateCardVisuals(e, t, val, isGold, isDupe) {
        e.dataset.st = t;
        const r = e.querySelector(".t-num"), o = val == null ? "" : val + "";
        if (r.textContent !== o) r.textContent = o;
        isGold ? e.dataset.bg = "1" : delete e.dataset.bg;
        e.classList.remove("show-gold", "show-dupe");
        if (t === 0) {
            if (isGold) e.classList.add("show-gold");
            if (isDupe) e.classList.add("show-dupe");
        }
    },
    updateStats() {
        const maxCards = 9 * u.cfg.albums, goldSet = u.getGoldSet();
        this.els.app.querySelectorAll(".glass-card[data-sec]").forEach(sNode => {
            if ("sec-gold" === sNode.id) return;
            const a = u.usr[sNode.dataset.sec];
            if (!a) return;
            const nState = a.state || {};
            let r = 0, o = 0, i = 0;
            for (let sIdx = 0; sIdx < maxCards; sIdx++) {
                const stateVal = nState[sIdx] || 0;
                if (stateVal > 0) r++;
                if (goldSet.has(sIdx)) {
                    i++;
                    if (stateVal > 0) o++;
                }
            }
            const lPct = maxCards > 0 ? Math.round(r / maxCards * 100) : 0;
            const c = sNode.querySelector(".user-avatar"), d = sNode.querySelector(".ua-top"), m = sNode.querySelector(".ua-bot"), p = sNode.querySelector(".ua-percent");
            if (d) d.textContent = `${r}/${maxCards}`;
            if (m) m.textContent = `${o}/${i}`;
            if (p) {
                p.textContent = lPct + "%";
                p.style.color = lPct === 100 ? "var(--gold)" : lPct >= 50 ? "#fb923c" : "#f87171";
            }
            if (c) c.style.background = `conic-gradient(var(--ok) ${lPct}%, var(--p) 0)`;
        });
    },
    renderGoldEx() {
        const e = document.getElementById("gold-list");
        e.innerHTML = "";
        if (u.cfg.gold_ex.length > 0) {
            const h = document.createElement("div");
            h.className = "gold-row-header";
            h.innerHTML = `<span>${a(s("album"))}</span><span>${a(s("card"))}</span><span>${a(s("date"))}</span><span></span>`;
            e.appendChild(h);
        }
        const t = document.createDocumentFragment();
        u.cfg.gold_ex.forEach((item, n) => {
            const r = document.createElement("div");
            r.className = "gold-row";
            r.innerHTML = `<input class="g-inp" data-f="alb" maxlength="2" inputmode="numeric" placeholder="--" value="${a(item.alb || item.album || "")}"><input class="g-inp" data-f="card" placeholder="${a(s("card"))}" value="${a(item.card || "")}"><input class="g-inp" data-f="date" maxlength="5" inputmode="numeric" placeholder="JJ/MM" value="${a(item.date || "")}"><button style="background:0 0;border:none;color:var(--err);font-weight:700;cursor:pointer" data-action="del-gold" data-idx="${n}">×</button>`;
            const albInp = r.querySelector('[data-f="alb"]');
            const cardInp = r.querySelector('[data-f="card"]');
            const dateInp = r.querySelector('[data-f="date"]');
            albInp.oninput = () => { albInp.value = albInp.value.replace(/\D/g, "").slice(0, 2); u.cfg.gold_ex[n].alb = albInp.value; u.saveC(); };
            cardInp.oninput = () => { u.cfg.gold_ex[n].card = cardInp.value; u.saveC(); };
            dateInp.addEventListener("keydown", ev => { if (ev.key === "Backspace" && dateInp.value.endsWith("/")) { dateInp.value = dateInp.value.slice(0, -1); ev.preventDefault(); } });
            dateInp.oninput = () => {
                let raw = dateInp.value.replace(/\D/g, "");
                if (raw.length > 4) raw = raw.slice(0, 4);
                dateInp.value = raw.length > 2 ? raw.slice(0, 2) + "/" + raw.slice(2) : raw;
                u.cfg.gold_ex[n].date = dateInp.value;
                u.saveC();
            };
            t.appendChild(r);
        });
        e.appendChild(t);
    },
    renderMenus() {
        const e = document.getElementById("view-list");
        e.innerHTML = "";
        const t = document.getElementById("sub-print");
        t.innerHTML = "";
        const aDoc = document.createDocumentFragment(), nDoc = document.createDocumentFragment();
        [...u.cfg.usersList, "Gold"].forEach(user => {
            const userKey = user === "Gold" ? "Gold" : user.replace(/\s/g, "");
            const isHidden = u.cfg.hidden.includes(userKey);
            const r = document.createElement("div");
            r.className = "menu-item";
            r.innerHTML = `<span>${user}</span><label style="cursor:pointer;display:flex"><input type="checkbox" ${isHidden ? "" : "checked"} style="display:none"><div class="switch"></div></label>`;
            r.querySelector("input").onchange = ev => {
                u.cfg.hidden = ev.target.checked ? u.cfg.hidden.filter(item => item !== userKey) : [...u.cfg.hidden, userKey];
                u.saveC();
                this.updateVis();
            };
            aDoc.appendChild(r);
            const o = document.createElement("div");
            o.className = "menu-item";
            o.style.cssText = "padding:5px 8px;font-size:0.8rem";
            o.innerHTML = `<span>${user}</span><label style="cursor:pointer;display:flex;align-items:center"><input type="checkbox" class="print-chk" value="${userKey}" checked style="display:none"><div class="switch" style="transform:scale(0.7);transform-origin:right center"></div></label>`;
            nDoc.appendChild(o);
        });
        e.appendChild(aDoc);
        const btnPrint = document.createElement("button");
        btnPrint.className = "mini-btn";
        btnPrint.dataset.action = "do-print";
        btnPrint.style.cssText = "justify-content:center;background:var(--p);color:#fff;margin-top:5px;width:100%";
        btnPrint.textContent = s("print_upper");
        nDoc.appendChild(btnPrint);
        t.appendChild(nDoc);
    },
    updateVis() {
        document.getElementById("main-app").querySelectorAll(".anim-section").forEach(e => {
            e.classList.toggle("hidden", u.cfg.hidden.includes(e.dataset.sec));
        });
    },
    renderGoldGrid(containerId) {
        const t = document.getElementById(containerId);
        if (!t) return;
        t.innerHTML = "";
        const aNum = u.cfg.albums, nSet = u.getGoldSet(), r = document.createElement("div");
        r.className = "g-conf-row";
        for (let e = 1; e <= aNum; e++) {
            let cellsHTML = "";
            for (let sIdx = 0; sIdx < 9; sIdx++) {
                const aIdx = 9 * (e - 1) + sIdx;
                cellsHTML += `<div class="g-cell ${nSet.has(aIdx) ? "active" : ""}" data-uid="${aIdx}"></div>`;
            }
            const colDiv = document.createElement("div");
            colDiv.className = "g-conf-col";
            colDiv.innerHTML = `<span style="font-size:9px;font-weight:700;margin-bottom:2px">${s("album")} ${e}</span><div class="g-conf-grid">${cellsHTML}</div>`;
            r.appendChild(colDiv);
        }
        r.onclick = ev => {
            const target = ev.target;
            if (target.classList.contains("g-cell")) {
                const uid = +target.dataset.uid, isActive = target.classList.contains("active");
                u.setGold(uid, !isActive);
                target.classList.toggle("active");
            }
        };
        t.appendChild(r);
    },
    switchAmbiance() {
        if (LITE_MODE || !this.els.bg) return;
        const bg = this.els.bg;
        bg.style.transition = "opacity 0.4s ease";
        bg.style.opacity = "0";
        setTimeout(() => {
            this.renderAmbiance();
            requestAnimationFrame(() => requestAnimationFrame(() => {
                bg.style.transition = "opacity 0.4s ease";
                bg.style.opacity = "1";
            }));
        }, 450);
    },
    renderAmbianceSelector() {
        const el = document.getElementById("amb-sel");
        if (!el) return;
        el.innerHTML = "";
        const hasSpecial = l(u.cfg.seed)() < .01;
        const count = hasSpecial ? 5 : 4;
        const icons = [
            "<span style='display:inline-block;width:10px;height:10px;background:#fff;border-radius:50%'></span>",
            "<span style='display:inline-block;width:14px;height:9px;background:#fff;border-radius:3px'></span>",
            "<span style='display:inline-block;width:10px;height:10px;border:2.5px solid #fff;border-radius:1px;box-sizing:border-box'></span>",
            "<span style='display:grid;grid-template-columns:1fr 1fr;gap:2px;width:10px;height:10px'><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span></span>",
            "<span style='font-size:0.85em;line-height:1'>✨</span>"
        ];
        const labels = [s("amb_0"), s("amb_1"), s("amb_2"), s("amb_3"), s("amb_4")];
        for (let idx = 0; idx < count; idx++) {
            const btn = document.createElement("button");
            const isActive = u.cfg.ambiance === idx;
            btn.style.cssText = `width:40px;height:36px;border-radius:10px;border:2px solid ${isActive ? "var(--p)" : "rgba(255,255,255,0.15)"};background:${isActive ? "rgba(99,102,241,0.2)" : "rgba(0,0,0,0.3)"};cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border 0.2s,background 0.2s;box-shadow:${isActive ? "0 0 8px rgba(99,102,241,0.4)" : "none"}`;
            btn.innerHTML = icons[idx];
            btn.title = labels[idx];
            btn.onclick = () => {
                if (u.cfg.ambiance === idx) return;
                u.cfg.ambiance = idx;
                u.saveC();
                g.switchAmbiance();
                g.renderAmbianceSelector();
                g.showToast(labels[idx]);
            };
            el.appendChild(btn);
        }
    }
};
const v = {
    _lastClickCell: null, _lastClickTime: 0, _popovers: null,
    _getPopovers() { return this._popovers || (this._popovers = document.querySelectorAll(".popover")), this._popovers; },
    handle(e) {
        const t = e.target, aNode = t.closest("[data-action]"), n = t.closest(".cell-wrap"), r = t.closest(".glass-card");
        if (!document.contains(t) || t.closest(".popover") || t.closest(".dock") || this._getPopovers().forEach(e => e.classList.remove("show")), n && "INPUT" !== t.tagName) {
            if ("dblclick" === e.type) return e.stopPropagation(), void e.preventDefault();
            const now = Date.now();
            if (v._lastClickCell === n && now - (v._lastClickTime || 0) < 300) return void (v._lastClickCell = null);
            v._lastClickCell = n, v._lastClickTime = now;
            const isPrimary = r && r.classList.contains("is-primary"), uKey = n.closest("[data-u]")?.dataset.u, uid = +n.dataset.uid;
            if ("number" === u.cfg.mode && isPrimary) {
                e.stopPropagation();
                const inner = n.querySelector(".cell-inner");
                inner.innerHTML = "";
                const inp = document.createElement("input");
                return inp.className = "cell-input", inp.type = "tel", inp.value = u.usr[uKey].nums[uid] || "", inp.onblur = () => {
                    const val = inp.value.trim();
                    u.updateCell(uKey, uid, val, !0);
                    g.updateSingleCell(uKey, uid, -1);
                }, inp.onkeydown = ev => { "Enter" === ev.key && inp.blur() }, inner.appendChild(inp), void setTimeout(() => { try { inp.focus() } catch (err) {} }, 50);
            }
            const currState = u.usr[uKey].state[uid] || 0, nextState = (currState + 1) % 3;
            return i.push({ u: uKey, c: uid, v: currState }), i.length > 50 && i.shift(), u.updateCell(uKey, uid, nextState), void g.updateSingleCell(uKey, uid, currState);
        }
        if (r && "dblclick" === e.type && !aNode && !n) return void (r.classList.contains("expanded") ? (() => {
            const eh = r.offsetHeight;
            r.classList.remove("blur-active");
            r.classList.add("blur-out", "transitioning");
            r.classList.remove("expanded");
            requestAnimationFrame(() => {
                const ch = r.offsetHeight;
                const ratio = eh / Math.max(ch, 1);
                r.style.transformOrigin = "top center";
                r.style.transition = "none";
                r.style.transform = "scaleY(" + ratio + ")";
                requestAnimationFrame(() => {
                    r.style.transition = "transform 0.42s cubic-bezier(0.25,0.8,0.25,1)";
                    r.style.transform = "scaleY(1)";
                    setTimeout(() => { r.style.transform = ""; r.style.transition = ""; r.style.transformOrigin = ""; r.classList.remove("blur-out", "transitioning") }, 440);
                });
            });
        })() : (() => {
            const ch = r.offsetHeight;
            r.classList.add("transitioning");
            r.classList.add("expanded");
            requestAnimationFrame(() => {
                const eh = r.offsetHeight;
                const ratio = ch / Math.max(eh, 1);
                r.style.transformOrigin = "top center";
                r.style.transition = "none";
                r.style.transform = "scaleY(" + ratio + ")";
                requestAnimationFrame(() => {
                    r.style.transition = "transform 0.42s cubic-bezier(0.25,0.8,0.25,1)";
                    r.style.transform = "scaleY(1)";
                    setTimeout(() => { r.style.transform = ""; r.style.transition = ""; r.style.transformOrigin = ""; r.classList.remove("transitioning"); r.classList.add("blur-active") }, 440);
                });
            });
        })());
        if (!aNode) return;
        e.stopPropagation();
        const actionType = aNode.dataset.action;
        const dActions = {
            "toggle-menu": () => {
                const pm = document.getElementById("pop-menu"), pv = document.getElementById("pop-view");
                const wasOpen = pm.classList.contains("show");
                pv.classList.remove("show");
                if (wasOpen) { pm.classList.remove("show"); } else {
                    const rect = aNode.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const pl = window.innerWidth / 2 - 140;
                    pm.style.setProperty("--arrow-left", Math.max(16, Math.min(264, cx - pl)) + "px");
                    pm.classList.add("show");
                }
            },
            "toggle-view": () => {
                const pm = document.getElementById("pop-menu"), pv = document.getElementById("pop-view");
                const wasOpen = pv.classList.contains("show");
                pm.classList.remove("show");
                if (wasOpen) { pv.classList.remove("show"); } else {
                    const rect = aNode.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const pl = window.innerWidth / 2 - 140;
                    pv.style.setProperty("--arrow-left", Math.max(16, Math.min(264, cx - pl)) + "px");
                    pv.classList.add("show");
                }
            },
            "open-users": () => window.UserManager.open(),
            "close-users": () => window.UserManager.close(),
            "add-user-row": () => window.UserManager.add(),
            "save-users": () => window.UserManager.save(),
            undo: () => {
                const entry = i.pop();
                entry ? (u.updateCell(entry.u, entry.c, entry.v), g.hydrate(), g.showToast(s("undone"))) : g.showToast(s("nothing_to_undo"));
            },
            "mode-toggle": () => { u.cfg.mode = "number" === u.cfg.mode ? "cross" : "number"; u.saveC(); g.renderMain(); },
            "cycle-ambiance": () => {
                if (LITE_MODE) return;
                const spc = l(u.cfg.seed)() < .01;
                u.cfg.ambiance = (u.cfg.ambiance + 1) % (spc ? 5 : 4);
                u.saveC();
                g.renderAmbiance();
                const labels = [s("amb_0"), s("amb_1"), s("amb_2"), s("amb_3"), s("amb_4")];
                g.showToast(labels[u.cfg.ambiance]);
            },
            "reset-u": () => {
                const uKey = aNode.closest(".glass-card").dataset.sec;
                confirm(s("reset_board_q")) && (u.resetUser(uKey), g.hydrate(), g.showToast(s("reset_done")));
            },
            "reset-all": () => {
                if (confirm(s("reset_warn1"))) {
                    let userList = confirm(s("reset_warn2")) ? [...u.cfg.usersList] : [s("player") + " 1"];
                    let currentAmb = u.cfg.ambiance;
                    i.length = 0;
                    localStorage.clear();
                    const now = Date.now();
                    localStorage.setItem("mgo_cfg", JSON.stringify({ albums: 24, mode: "cross", gold_ids: [], gold_ex: [], hidden: [], printHidden: [], setup_done: !1, ambiance: currentAmb, seed: now, usersList: userList }));
                    location.reload();
                }
            },
            "open-gold-mod": () => { g.renderGoldGrid("gold-grid-ctn"); document.getElementById("mod-gold").classList.add("open"); },
            "close-gold": () => { document.getElementById("mod-gold").classList.remove("open"); g.hydrate(); },
            "open-missions": () => MissionManager.open(),
            "close-missions": () => MissionManager.close(),
            "add-gold-row": () => { u.cfg.gold_ex.push({ alb: "", card: "", date: "" }); u.saveC(); g.renderGoldEx(); },
            "del-gold": () => { confirm(s("delete_q")) && (u.cfg.gold_ex.splice(+aNode.dataset.idx, 1), u.saveC(), g.renderGoldEx()); },
            "toggle-print-sub": () => { const sub = document.getElementById("sub-print"); sub.style.display = "none" === sub.style.display ? "flex" : "none"; },
            "do-print": () => {
                const toPrint = new Set(Array.from(document.querySelectorAll(".print-chk:checked")).map(e => e.value));
                document.querySelectorAll(".glass-card").forEach(t => { t.classList.toggle("print-hidden", !toPrint.has(t.dataset.sec)) });
                window.print();
            },
            "save-file": () => {
                const blob = new Blob([JSON.stringify({ version: o.VERSION, config: u.cfg, users: u.usr })], { type: "application/json" });
                const objURL = URL.createObjectURL(blob);
                const aLink = document.createElement("a");
                aLink.href = objURL;
                aLink.download = `Mgo_Backup_V${o.VERSION}.json`;
                document.body.appendChild(aLink);
                aLink.click();
                document.body.removeChild(aLink);
                setTimeout(() => URL.revokeObjectURL(objURL), 5e3);
                g.showToast(s("file_dl"));
            },
            "open-share": () => { document.getElementById("pop-menu").classList.remove("show"); y.openModal(); },
            "close-share": () => { document.getElementById("mod-share").classList.remove("open"); },
            "copy-share-link": () => {
                const fld = document.getElementById("share-url-field");
                navigator.clipboard.writeText(fld.value).then(() => {
                    const btn = document.getElementById("share-copy-btn");
                    const oldHTML = btn.innerHTML;
                    btn.innerHTML = s("share_copied");
                    btn.style.background = "var(--ok)";
                    setTimeout(() => { btn.innerHTML = oldHTML; btn.style.background = "var(--p)"; }, 2e3);
                }).catch(() => { fld.select(); document.execCommand("copy"); g.showToast(s("share_copied")); });
            },
            save: () => dActions["save-file"](),
            load: () => {
                const inpFile = document.createElement("input");
                inpFile.type = "file";
                inpFile.accept = ".json";
                inpFile.onchange = ev => {
                    const rdr = new FileReader;
                    rdr.onload = rev => {
                        try {
                            const parsed = JSON.parse(rev.target.result);
                            if (parsed.config && parsed.users) {
                                u.cfg = parsed.config;
                                if (!u.cfg.usersList) u.cfg.usersList = Object.keys(parsed.users);
                                if (!u.cfg.gold_ids) u.cfg.gold_ids = [];
                                if (!u.cfg.gold_ex) u.cfg.gold_ex = [];
                                if (!u.cfg.hidden) u.cfg.hidden = [];
                                if (!u.cfg.printHidden) u.cfg.printHidden = [];
                                Object.keys(parsed.users).forEach(k => {
                                    if (!parsed.users[k].state) parsed.users[k].state = {};
                                    if (!parsed.users[k].nums) parsed.users[k].nums = {};
                                });
                                u.usr = parsed.users;
                                if (u.cfg.setup_done === undefined) u.cfg.setup_done = !0;
                                i.length = 0;
                                u.saveC();
                                Object.keys(parsed.users).forEach(k => u.saveU(k));
                                location.reload();
                            } else {
                                alert(s("file_invalid"));
                            }
                        } catch (err) { alert(s("file_err")); }
                    };
                    rdr.readAsText(ev.target.files[0]);
                };
                inpFile.click();
            }
        };
        if (dActions[actionType]) dActions[actionType]();
    }
};
const f = {
    init() {
        const rng = document.getElementById("s-alb"), valLbl = document.getElementById("s-alb-val");
        g.renderGoldGrid("setup-gold-grid");
        rng.oninput = e => {
            valLbl.textContent = e.target.value;
            u.cfg.albums = +e.target.value;
            u.saveC();
            g.renderGoldGrid("setup-gold-grid");
        };
        document.getElementById("btn-start-season").onclick = () => {
            u.cfg.setup_done = !0;
            u.saveC();
            document.getElementById("setup-mod").classList.remove("open");
            g.renderMenus();
            g.renderMain();
            g.showToast(s("good_season"));
        };
    }
};
const y = {
    _selected: null,
    openModal() {
        this._selected = null;
        const listEl = document.getElementById("share-player-list");
        listEl.innerHTML = "";
        document.getElementById("share-link-section").style.display = "none";
        u.cfg.usersList.forEach(t => {
            const cleaned = t.replace(/\s/g, "");
            const btn = document.createElement("button");
            btn.className = "mini-btn";
            btn.style.cssText = "width:100%;justify-content:flex-start;padding:12px 16px;font-size:0.95rem;transition:0.2s";
            btn.innerHTML = "👤 " + a(t);
            btn.onclick = () => {
                listEl.querySelectorAll(".mini-btn").forEach(e => { e.style.background = ""; e.style.color = ""; e.style.borderColor = ""; });
                btn.style.background = "var(--p)"; btn.style.color = "#fff"; btn.style.borderColor = "var(--p)";
                this._selected = t;
                this._generateLink(t, cleaned);
            };
            listEl.appendChild(btn);
        });
        document.getElementById("mod-share").classList.add("open");
    },
    async _generateLink(name, uKey) {
        const payload = JSON.stringify({ name: name, data: u.usr[uKey] || { state: {}, nums: {} } });
        let finalStr;
        try {
            const encoder = new TextEncoder().encode(payload);
            const cs = new CompressionStream("gzip");
            const w = cs.writable.getWriter();
            w.write(encoder);
            w.close();
            const arrBuf = await new Response(cs.readable).arrayBuffer();
            let bStr = "";
            new Uint8Array(arrBuf).forEach(byte => bStr += String.fromCharCode(byte));
            finalStr = "z:" + btoa(bStr);
        } catch (err) {
            finalStr = btoa(unescape(encodeURIComponent(payload)));
        }
        const fullUrl = "https://kevinr99089.github.io/Mgo-Tracker/?share=" + encodeURIComponent(finalStr);
        document.getElementById("share-url-field").value = fullUrl;
        document.getElementById("share-link-section").style.display = "flex";
    },
    async checkImport() {
        const params = new URLSearchParams(window.location.search);
        let raw = params.get('share');
        if (!raw && window.location.hash.startsWith("#share:")) { raw = window.location.hash.slice(7); }
        if (!raw) return;
        try {
            let decoded;
            if (raw.startsWith("z:")) {
                const bStr = atob(raw.slice(2));
                const uintArr = Uint8Array.from(bStr, c => c.charCodeAt(0));
                const ds = new DecompressionStream("gzip");
                const w = ds.writable.getWriter();
                w.write(uintArr);
                w.close();
                const outBuf = await new Response(ds.readable).arrayBuffer();
                decoded = new TextDecoder().decode(outBuf);
            } else {
                decoded = decodeURIComponent(escape(atob(raw)));
            }
            const parsed = JSON.parse(decoded);
            if (!parsed.name || !parsed.data) return;
            this._pendingImport = parsed;
        } catch (e) {
            console.error("Share import error", e);
            this._cleanURL();
        }
    },
    showImportIfPending() {
        const pending = this._pendingImport;
        if (!pending) return;
        document.getElementById("import-name").textContent = "👤 " + pending.name;
        const checked = Object.values(pending.data.state || {}).filter(e => 1 === e).length;
        const dupes = Object.values(pending.data.state || {}).filter(e => 2 === e).length;
        document.getElementById("import-stats").textContent = s("import_stats").replace('{c}', checked).replace('{d}', dupes);
        const isMatch = u.cfg.usersList.includes(pending.name);
        let mem = {};
        try { mem = JSON.parse(localStorage.getItem("mgo_share_mem") || "{}"); } catch (e) {}
        const remName = mem[pending.name];
        const remValid = remName && u.cfg.usersList.includes(remName);
        const bConf = document.getElementById("btn-import-confirm");
        const bRep = document.getElementById("btn-import-replace");
        const bQuick = document.getElementById("btn-import-quick");
        bRep.textContent = "🔄 " + s("import_replace_btn");
        if (isMatch) {
            bConf.textContent = s("import_btn_update").replace('{name}', pending.name);
            bRep.style.display = "none";
            bQuick.style.display = "none";
            this._quickTarget = null;
        } else {
            bConf.textContent = "➕ " + s("import_add");
            bRep.style.display = "";
            if (remValid) {
                bQuick.style.display = "";
                bQuick.textContent = s("import_btn_quick").replace('{name}', remName);
                this._quickTarget = remName;
            } else {
                bQuick.style.display = "none";
                this._quickTarget = null;
            }
        }
        document.getElementById("import-step-1").style.display = "flex";
        document.getElementById("import-step-2").style.display = "none";
        document.getElementById("mod-import").classList.add("open");
    },
    confirmImport() {
        const pending = this._pendingImport;
        if (!pending) return;
        const uKey = pending.name.replace(/\s/g, "");
        if (!u.cfg.usersList.includes(pending.name)) {
            u.cfg.usersList.push(pending.name);
            u.saveC();
        }
        u.usr[uKey] = { state: {}, nums: {}, ...pending.data };
        u.saveU(uKey);
        this._pendingImport = null;
        this._replaceTarget = null;
        this._closeImportModal();
        g.showToast(s("imported").replace('{name}', pending.name));
        setTimeout(() => location.reload(), 900);
    },
    _cleanURL() {
        const url = new URL(window.location);
        let changed = !1;
        if (url.searchParams.has('share')) { url.searchParams.delete('share'); changed = !0; }
        if (url.hash.startsWith('#share:')) { url.hash = ''; changed = !0; }
        if (changed) { history.replaceState(null, "", url.toString()); }
    },
    _closeImportModal() {
        this._cleanURL();
        document.getElementById("mod-import").classList.remove("open");
        document.getElementById("import-step-1").style.display = "flex";
        document.getElementById("import-step-2").style.display = "none";
    },
    openReplaceStep() {
        const selList = document.getElementById("import-player-select");
        selList.innerHTML = "";
        this._replaceTarget = null;
        document.getElementById("btn-import-replace-confirm").disabled = !0;
        u.cfg.usersList.forEach(name => {
            const btn = document.createElement("button");
            btn.className = "mini-btn";
            btn.style.cssText = "width:100%;justify-content:flex-start;padding:10px 14px;font-size:0.9rem;transition:0.2s";
            btn.textContent = "👤 " + name;
            btn.onclick = () => {
                selList.querySelectorAll(".mini-btn").forEach(b => { b.style.background = ""; b.style.borderColor = ""; b.style.color = ""; });
                btn.style.background = "var(--p)"; btn.style.borderColor = "var(--p)"; btn.style.color = "#fff";
                this._replaceTarget = name;
                document.getElementById("btn-import-replace-confirm").disabled = !1;
            };
            selList.appendChild(btn);
        });
        document.getElementById("import-step-1").style.display = "none";
        document.getElementById("import-step-2").style.display = "flex";
    },
    confirmReplace() {
        const pending = this._pendingImport;
        if (!pending || !this._replaceTarget) return;
        if (!confirm(s("import_replace_warn").replace('{name}', this._replaceTarget))) return;
        const targetKey = this._replaceTarget.replace(/\s/g, "");
        u.usr[targetKey] = { state: {}, nums: {}, ...pending.data };
        u.saveU(targetKey);
        const replacedName = this._replaceTarget;
        let shareMem = {};
        try { shareMem = JSON.parse(localStorage.getItem("mgo_share_mem") || "{}"); } catch (e) {}
        shareMem[pending.name] = replacedName;
        localStorage.setItem("mgo_share_mem", JSON.stringify(shareMem));
        this._pendingImport = null;
        this._replaceTarget = null;
        this._closeImportModal();
        g.showToast(s("data_replaced").replace('{name}', replacedName));
        setTimeout(() => location.reload(), 900);
    },
    confirmQuickUpdate() {
        const pending = this._pendingImport;
        if (!pending || !this._quickTarget) return;
        const targetKey = this._quickTarget.replace(/\s/g, "");
        u.usr[targetKey] = { state: {}, nums: {}, ...pending.data };
        u.saveU(targetKey);
        const targetName = this._quickTarget;
        this._pendingImport = null;
        this._quickTarget = null;
        this._closeImportModal();
        g.showToast(s("updated").replace('{name}', targetName));
        setTimeout(() => location.reload(), 900);
    }
};
const MissionManager = {
    LS_DATA: 'mgo_missions_data', LS_WEEK: 'mgo_missions_week', _data: null,
    _getMondayDate(from) {
        const d = new Date(from);
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        const diff = (day === 0) ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        return d;
    },
    _weekKey(monday) {
        return monday.getFullYear() + '-' + String(monday.getMonth() + 1).padStart(2, '0') + '-' + String(monday.getDate()).padStart(2, '0');
    },
    _empty() { return Array.from({ length: 7 }, () => ({ texts: ['', '', ''], done: [false, false, false] })); },
    init() {
        const now = new Date();
        const monday = this._getMondayDate(now);
        const currentKey = this._weekKey(monday);
        const storedKey = localStorage.getItem(this.LS_WEEK);
        if (storedKey !== currentKey) {
            localStorage.removeItem(this.LS_DATA);
            localStorage.setItem(this.LS_WEEK, currentKey);
            this._data = this._empty();
        } else {
            try {
                const raw = localStorage.getItem(this.LS_DATA);
                this._data = raw ? JSON.parse(raw) : this._empty();
            } catch (e) { this._data = this._empty(); }
        }
    },
    save() { localStorage.setItem(this.LS_DATA, JSON.stringify(this._data)); },
    open() {
        if (!this._data) this.init();
        this._render();
        document.getElementById('mod-missions').classList.add('open');
    },
    close() { document.getElementById('mod-missions').classList.remove('open'); },
    _render() {
        const body = document.getElementById('missions-body');
        body.innerHTML = '';
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const monday = this._getMondayDate(new Date());
        const frag = document.createDocumentFragment();
        const daysArr = s("days") || [];
        const monthsArr = s("months") || [];
        for (let di = 0; di < 7; di++) {
            const dayDate = new Date(monday);
            dayDate.setDate(monday.getDate() + di);
            const isToday = dayDate.getTime() === now.getTime();
            const dayName = daysArr[di] || '';
            const monthName = monthsArr[dayDate.getMonth()] || '';
            const dayLabel = `${dayName} ${dayDate.getDate()} ${monthName} ${dayDate.getFullYear()}`;
            const card = document.createElement('div');
            card.className = 'mission-day-card' + (isToday ? ' today-card' : '');
            const lbl = document.createElement('div');
            lbl.className = 'mission-day-label';
            lbl.textContent = dayLabel;
            if (isToday) {
                const badge = document.createElement('span');
                badge.className = 'today-badge';
                badge.textContent = s("today");
                lbl.appendChild(badge);
            }
            card.appendChild(lbl);
            for (let mi = 0; mi < 3; mi++) {
                const row = document.createElement('div');
                row.className = 'mission-row';
                const ta = document.createElement('textarea');
                ta.className = 'mission-input';
                ta.rows = 1;
                let ph = s("mission_ph") || "Mission {n}...";
                ta.placeholder = ph.replace('{n}', mi + 1);
                ta.value = this._data[di].texts[mi] || '';
                ta.dataset.di = di;
                ta.dataset.mi = mi;
                ta.addEventListener('input', () => {
                    ta.style.height = 'auto';
                    ta.style.height = Math.min(ta.scrollHeight, 80) + 'px';
                    this._data[di].texts[mi] = ta.value;
                    this.save();
                });
                ta.addEventListener('focus', () => {
                    ta.style.height = 'auto';
                    ta.style.height = Math.min(ta.scrollHeight, 80) + 'px';
                });
                row.appendChild(ta);
                card.appendChild(row);
            }
            frag.appendChild(card);
        }
        body.appendChild(frag);
    }
};
function __initApp() {
    r();
    u.init();
    MissionManager.init();
    y.checkImport();
    document.getElementById("btn-import-confirm").onclick = () => y.confirmImport();
    document.getElementById("btn-import-quick").onclick = () => y.confirmQuickUpdate();
    document.getElementById("btn-import-replace").onclick = () => y.openReplaceStep();
    document.getElementById("btn-import-replace-back").onclick = () => {
        document.getElementById("import-step-1").style.display = "flex";
        document.getElementById("import-step-2").style.display = "none";
        y._replaceTarget = null;
    };
    document.getElementById("btn-import-replace-back").textContent = "← " + s("import_replace_back");
    document.getElementById("btn-import-replace-confirm").textContent = "✅ " + s("import_replace_confirm");
    document.getElementById("btn-import-cancel").textContent = "✖ " + s("import_cancel_btn");
    document.getElementById("btn-import-replace-confirm").onclick = () => y.confirmReplace();
    document.getElementById("btn-import-cancel").onclick = () => { y._pendingImport = null; y._replaceTarget = null; y._closeImportModal(); };
    const e = document.getElementById("sl-alb");
    let tTimer;
    e.value = u.cfg.albums;
    document.getElementById("lbl-alb").textContent = u.cfg.albums;
    e.oninput = ev => {
        document.getElementById("lbl-alb").textContent = ev.target.value;
        clearTimeout(tTimer);
        tTimer = setTimeout(() => {
            u.cfg.albums = +ev.target.value;
            u.invalidateGold();
            u.saveC();
            g.renderMain();
        }, 300);
    };
    g.renderMain();
    g.renderGoldEx();
    g.renderMenus();
    if (!LITE_MODE) {
        const aRes = d(u.cfg);
        if (aRes) u.saveC();
        g.renderAmbianceSelector();
        if (aRes) setTimeout(() => g.showToast(s(aRes)), 500);
        else if (4 === u.cfg.ambiance) g.showToast(s("shiny_season"));
    }
    const n = v.handle.bind(v);
    let oTimer;
    document.body.addEventListener("click", n);
    document.body.addEventListener("dblclick", n);
    document.body.addEventListener("input", ev => {
        if (ev.target.classList.contains("user-note")) {
            const tUid = ev.target.dataset.uid;
            if (u.usr[tUid]) {
                const val = ev.target.value;
                val ? u.usr[tUid].note = val : delete u.usr[tUid].note;
                clearTimeout(oTimer);
                oTimer = setTimeout(() => u.saveU(tUid), 400);
            }
        }
    });
    f.init();
    const __sp = document.getElementById("splash");
    if (LITE_MODE) {
        requestAnimationFrame(() => setTimeout(() => {
            __sp.style.transition = "opacity 0.4s ease";
            __sp.style.opacity = "0";
            setTimeout(() => {
                __sp.remove();
                if (!u.cfg.setup_done) document.getElementById("setup-mod").classList.add("open");
                y.showImportIfPending();
            }, 400);
        }, 500));
    } else {
        const __bg = document.getElementById("ambient-bg");
        setTimeout(() => {
            setTimeout(() => {
                g.renderAmbiance();
                requestAnimationFrame(() => requestAnimationFrame(() => { __bg.style.opacity = "1"; }));
            }, 1200);
            __sp.style.transition = "opacity 0.4s ease, visibility 0.4s ease";
            __sp.style.opacity = "0";
            __sp.style.visibility = "hidden";
            __sp.style.pointerEvents = "none";
            const cards = [...document.querySelectorAll(".anim-section")], visCards = cards.filter(el => !el.classList.contains("hidden"));
            cards.forEach(el => { el.style.opacity = "0"; el.style.transform = "translateY(22px)"; el.style.transition = "none"; });
            const easeCurve = "cubic-bezier(0.22, 1, 0.36, 1)";
            visCards.forEach((el, idx) => {
                setTimeout(() => {
                    el.style.transition = `opacity 480ms ${easeCurve}, transform 480ms ${easeCurve}`;
                    el.style.opacity = "1";
                    el.style.transform = "translateY(0)";
                }, 85 * idx);
            });
            setTimeout(() => {
                cards.forEach(el => { el.style.removeProperty("opacity"); el.style.removeProperty("transform"); el.style.removeProperty("transition"); });
                __sp.remove();
                if (!u.cfg.setup_done) document.getElementById("setup-mod").classList.add("open");
                y.showImportIfPending();
            }, 85 * visCards.length + 480 + 100);
        }, 900);
    }
}
document.addEventListener("DOMContentLoaded", async () => {
    LITE_MODE = document.documentElement.className === "lite-mode";
    await loadTranslations();
    const __sv = localStorage.getItem(__MGO_PREF);
    if (!__sv) {
        r();
        document.getElementById("__hub").style.display = "flex";
        return;
    }
    __initApp();
});