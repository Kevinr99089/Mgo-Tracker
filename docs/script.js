
const I18N_FILES = {
    'fr': 'french.txt',
    'en': 'english.txt',
};
const __MGO_PREF = 'mgo_unified_version';
let LITE_MODE = document.documentElement.className === 'lite-mode';
let currentLang = (navigator.language || 'fr').split('-')[0];
if (!I18N_FILES[currentLang]) currentLang = 'en';
let translations = {};
async function initI18n() {
    try {
        const response = await fetch(I18N_FILES[currentLang]);
        if (!response.ok) throw new Error("Translation file not found");
        translations = await response.json();
    } catch (err) {
        console.error("Failed to load translations, falling back to empty object", err);
        translations = {};
    }
    r();
}
function s(key) {
    return translations[key] || key;
}
function a(e) {
    return (e + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
const n_noHTML = new Set(["add_upper"]);
function r() {
    document.querySelectorAll("[data-i18n]").forEach(e => {
        const t = e.dataset.i18n;
        const val = s(t);
        n_noHTML.has(t) ? e.innerHTML = val : e.textContent = val;
    });
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
const o = { VERSION: "4.1.5 (Web)" };
let i = [];
function l(e) {
    return function() {
        var t = e += 1831565813;
        return t = Math.imul(t ^ t >>> 15, 1 | t), (((t ^= t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t >>> 14) >>> 0) / 4294967296
    }
}
function c(e) {
    return l(e)() < .01
}
function d(e) {
    const t = c(e.seed) ? 4 : 3;
    return null == e.ambiance || "number" != typeof e.ambiance || e.ambiance < 0 || !Number.isInteger(e.ambiance) ? (e.ambiance = 0, null) : e.ambiance > t ? 4 !== e.ambiance || c(e.seed) ? (e.ambiance = 0, "cheat_easter") : (e.ambiance = 0, "cheat_shiny") : null
}
const u = {
    cfg: { albums: 24, mode: "cross", gold_ids: [], gold_ex: [], hidden: [], printHidden: [], setup_done: !1, ambiance: 0, seed: Date.now(), usersList: [] },
    usr: {},
    _dupesCache: null,
    _goldCache: null,
    _saveTimers: {},
    getGoldSet() { return this._goldCache || (this._goldCache = new Set(this.cfg.gold_ids)), this._goldCache },
    invalidateGold() { this._goldCache = null },
    getDupesSet() {
        if (this._dupesCache) return this._dupesCache;
        const e = new Set;
        return Object.values(this.usr).forEach(t => { t && t.state && Object.entries(t.state).forEach(([t, s]) => { 2 === s && e.add(+t) }) }), this._dupesCache = e, e
    },
    invalidateDupes() { this._dupesCache = null },
    debounceSave(e) { clearTimeout(this._saveTimers[e]), this._saveTimers[e] = setTimeout(() => this.saveU(e), 400) },
    init() {
        const e = localStorage.getItem("mgo_cfg");
        if (e) try {
            const t = JSON.parse(e);
            this.cfg = { ...this.cfg, ...t }, this.cfg.seed || (this.cfg.seed = Date.now())
        } catch (e) { console.error("Config corrupt", e) }
        this.cfg.usersList && 0 !== this.cfg.usersList.length || (this.cfg.usersList = [s("player") + " 1"]), this.cfg.usersList.forEach(e => {
            const t = e.replace(/\s/g, ""),
                s = localStorage.getItem("mgo_u_" + t);
            if (s) try {
                const e = JSON.parse(s);
                this.usr[t] = { state: {}, nums: {}, ...e }, this.usr[t].state || (this.usr[t].state = {}), this.usr[t].nums || (this.usr[t].nums = {})
            } catch (e) { console.error("User data corrupt for", t, e), this.usr[t] = { state: {}, nums: {} } }
            else this.usr[t] = { state: {}, nums: {} }
        })
    },
    saveC() { localStorage.setItem("mgo_cfg", JSON.stringify(this.cfg)) },
    saveU(e) { this.usr[e] && localStorage.setItem("mgo_u_" + e, JSON.stringify(this.usr[e])) },
    setGold(e, t) {
        const s = new Set(this.cfg.gold_ids);
        t ? s.add(e) : s.delete(e), this.cfg.gold_ids = Array.from(s), this.invalidateGold(), this.saveC()
    },
    updateCell(e, t, s, a = !1) {
        if (this.usr[e]) {
            if (this.usr[e].state || (this.usr[e].state = {}), this.usr[e].nums || (this.usr[e].nums = {}), a) s ? this.usr[e].nums[t] = s : delete this.usr[e].nums[t];
            else {
                const a = this.usr[e].state[t] || 0;
                0 === s ? delete this.usr[e].state[t] : this.usr[e].state[t] = s, 2 !== a && 2 !== s || this.invalidateDupes()
            }
            this.debounceSave(e)
        }
    },
    resetUser(e) { this.usr[e] && (this.usr[e].state = {}, this.usr[e].nums = {}, this.invalidateDupes(), this.saveU(e)) }
};
window.UserManager = {
    tempUsers: [],
    _newIndices: new Set(),
    _dragSrc: null,
    _touchSrc: null,
    _touchClone: null,
    _touchStartY: 0,
    open() { this.tempUsers = [...u.cfg.usersList], this.render(), document.getElementById("mod-users").classList.add("open") },
    close() { this._newIndices.clear(), document.getElementById("mod-users").classList.remove("open") },
    render() {
        const e = document.getElementById("users-edit-list");
        e.innerHTML = "", this.tempUsers.forEach((t, n_idx) => {
            const n = document.createElement("div");
            n.className = "um-row" + (this._newIndices.has(n_idx) ? " um-new" : ""), n.draggable = !0, n.dataset.idx = n_idx;
            const r_val = a(t);
            n.innerHTML = `
          <span class="um-handle" title="${a(s('drag_reorder'))}">⠿</span>
          <input type="text" class="g-inp um-inp" style="flex:1;border:1px solid var(--glass-b);border-radius:6px;padding:8px;color:#fff" value="${r_val}" data-idx="${n_idx}">
          <button class="mini-btn danger um-del" data-idx="${n_idx}" ${this.tempUsers.length <= 1 ? "disabled" : ""}>×</button>
      `, n.addEventListener("dragstart", e => this._onDragStart(e, n)), n.addEventListener("dragover", e => this._onDragOver(e, n)), n.addEventListener("dragleave", e => n.classList.remove("um-drag-over")), n.addEventListener("drop", e => this._onDrop(e, n)), n.addEventListener("dragend", e => this._onDragEnd());
            const o = n.querySelector(".um-handle");
            o.addEventListener("touchstart", e => this._onTouchStart(e, n), { passive: !1 }), o.addEventListener("touchmove", e => this._onTouchMove(e), { passive: !1 }), o.addEventListener("touchend", e => this._onTouchEnd(e), { passive: !1 }), n.querySelector(".um-inp").addEventListener("change", e => this.update(+e.target.dataset.idx, e.target.value)), n.querySelector(".um-del").addEventListener("click", e => this.remove(+e.target.dataset.idx)), e.appendChild(n)
        })
    },
    _onDragStart(e, t) { this._dragSrc = t, e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", t.dataset.idx), setTimeout(() => t.classList.add("um-dragging"), 0) },
    _onDragOver(e, t) { e.preventDefault(), e.dataTransfer.dropEffect = "move", t !== this._dragSrc && (document.querySelectorAll(".um-row").forEach(e => e.classList.remove("um-drag-over")), t.classList.add("um-drag-over")) },
    _onDrop(e, t) {
        if (e.preventDefault(), t === this._dragSrc) return;
        const s_idx = +t.dataset.idx,
            a_val = this.tempUsers.splice(+this._dragSrc.dataset.idx, 1)[0];
        this.tempUsers.splice(s_idx, 0, a_val), this.render()
    },
    _onDragEnd() { document.querySelectorAll(".um-row").forEach(e => { e.classList.remove("um-dragging", "um-drag-over") }), this._dragSrc = null },
    _onTouchStart(e, t) {
        e.preventDefault(), this._touchSrc = t, this._touchStartY = e.touches[0].clientY;
        const s_clone = t.cloneNode(!0);
        s_clone.classList.add("um-touch-clone"), s_clone.style.top = t.getBoundingClientRect().top + "px", document.body.appendChild(s_clone), this._touchClone = s_clone, t.classList.add("um-dragging")
    },
    _onTouchMove(e) {
        if (!this._touchClone) return;
        e.preventDefault();
        const t = e.touches[0].clientY;
        this._touchClone.style.top = t - 22 + "px";
        const s_el = document.elementsFromPoint(e.touches[0].clientX, t).find(e => e.classList.contains("um-row") && e !== this._touchSrc);
        document.querySelectorAll(".um-row").forEach(e => e.classList.remove("um-drag-over")), s_el && s_el.classList.add("um-drag-over")
    },
    _onTouchEnd(e) {
        if (!this._touchClone) return;
        const t = document.elementsFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY).find(e => e.classList.contains("um-row") && e !== this._touchSrc);
        if (this._touchClone.remove(), this._touchClone = null, t) {
            const e_idx = +t.dataset.idx,
                s_val = this.tempUsers.splice(+this._touchSrc.dataset.idx, 1)[0];
            this.tempUsers.splice(e_idx, 0, s_val)
        }
        this.render(), this._touchSrc = null
    },
    update(e, t) { this.tempUsers[e] = t.trim() || `${s("player")} ${e + 1}` },
    add() {
        const ni = this.tempUsers.length;
        this.tempUsers.push(`${s("player")} ${ni + 1}`), this._newIndices.add(ni), this.render(), requestAnimationFrame(() => {
            const rows = document.querySelectorAll('#users-edit-list .um-row');
            const row = rows[ni];
            if (!row) return;
            row.classList.add('um-flashing');
            setTimeout(() => {
                row.classList.remove('um-flashing');
                row.classList.add('um-new');
            }, 950);
        })
    },
    remove(e) { this.tempUsers.length > 1 && (this.tempUsers.splice(e, 1), this.render()) },
    save() {
        this._newIndices.clear();
        const originalList = u.cfg.usersList.slice();
        this.tempUsers.forEach((newName, i) => {
            const oldName = originalList[i];
            if (!oldName) return;
            const oldKey = oldName.replace(/\s/g, ""),
                newKey = newName.replace(/\s/g, "");
            if (oldKey !== newKey && u.usr[oldKey]) {
                u.usr[newKey] = u.usr[oldKey];
                delete u.usr[oldKey];
                try { localStorage.removeItem("mgo_u_" + oldKey) } catch (e) {}
                u.saveU(newKey)
            }
        });
        const oldFirstKey = originalList[0] ? originalList[0].replace(/\s/g, "") : null,
            newFirstKey = this.tempUsers[0] ? this.tempUsers[0].replace(/\s/g, "") : null;
        oldFirstKey && newFirstKey && oldFirstKey !== newFirstKey && u.usr[oldFirstKey] && (u.usr[oldFirstKey].nums = {}, u.saveU(oldFirstKey));
        this.tempUsers.forEach(e => {
            const t = e.replace(/\s/g, "");
            u.usr[t] || (u.usr[t] = { state: {}, nums: {} })
        });
        u.cfg.usersList = [...this.tempUsers];
        u.saveC();
        this.close();
        g.renderMenus();
        g.renderMain();
        g.showToast(s("players_updated"))
    }
};
let m = null,
    p = null;
function h() { m && (cancelAnimationFrame(m), m = null), p && (p(), p = null) }
const g = {
    els: { app: document.getElementById("gen-cards"), toast: document.getElementById("toast"), bg: document.getElementById("ambient-bg") },
    showToast(e) { this.els.toast.textContent = e, this.els.toast.classList.add("show"), clearTimeout(this._toastTimer), this._toastTimer = setTimeout(() => this.els.toast.classList.remove("show"), 2e3) },
    renderAmbiance() {
        if (LITE_MODE || !this.els.bg) return;
        h(), this.els.bg.innerHTML = "";
        const e = l(u.cfg.seed),
            t = u.cfg.ambiance || 0,
            s_colors = ["#4f46e5", "#c026d3", "#06b6d4", "#f472b6", "#fbbf24"];
        if (4 !== t) {
            if (0 === t) {
                const c = 7;
                for (let d = 0; d < c; d++) {
                    const el = document.createElement("div");
                    el.className = "f-obj f-orb";
                    const v = 45 + 40 * e(),
                        f = s_colors[Math.floor(e() * s_colors.length)];
                    el.style.cssText = `
      width:${v}vw; height:${v}vw;
      top:${90 * e() - 5}%;
      left:${90 * e() - 5}%;
      background:radial-gradient(circle at 50% 50%, ${f} 0%, transparent 68%);
    `, el.style.setProperty("--d", 18 + 16 * e() + "s"), el.style.setProperty("--tx", 18 * e() - 9 + "vw"), el.style.setProperty("--ty", 18 * e() - 9 + "vh"), el.style.setProperty("--r0", 30 * e() - 15 + "deg"), el.style.setProperty("--r1", 30 * e() - 15 + "deg"), this.els.bg.appendChild(el)
                }
                return
            }
            if (1 === t) {
                const y = ["linear-gradient(145deg,#3b41d8,#6468f5)", "linear-gradient(145deg,#c77b10,#f0aa22)", "linear-gradient(145deg,#b8233b,#eb3a5f)", "linear-gradient(145deg,#0e766e,#14b8a6)", "linear-gradient(145deg,#7c3aed,#a855f7)", "linear-gradient(145deg,#065f86,#0ea5e9)"],
                    b = 7;
                for (let _ = 0; _ < b; _++) {
                    const E = document.createElement("div");
                    E.className = "f-obj f-card";
                    const L = 18 + 22 * e(),
                        w = .65 + .25 * e(),
                        C = 60 * e() - 30;
                    E.style.cssText = `
      width:${L}vw; height:${L / w}vw;
      top:${85 * e() - 5}%;
      left:${85 * e() - 5}%;
      background:${y[Math.floor(e() * y.length)]};
    `, E.style.setProperty("--d", 20 + 18 * e() + "s"), E.style.setProperty("--tx", 20 * e() - 10 + "vw"), E.style.setProperty("--ty", 20 * e() - 10 + "vh"), E.style.setProperty("--r0", C + "deg"), E.style.setProperty("--r1", C + 40 * e() - 20 + "deg"), this.els.bg.appendChild(E)
                }
                return
            }
            if (2 === t) {
                const S = 9;
                for (let x = 0; x < S; x++) {
                    const T = document.createElement("div");
                    T.className = "f-obj f-neon";
                    const I = 8 + 18 * e(),
                        $ = e() > .5 ? I : I * (.5 + .8 * e()),
                        M = s_colors[Math.floor(e() * s_colors.length)],
                        k = e() > .5 ? 45 : 30 * e() - 15;
                    T.style.cssText = `
      width:${I}vw; height:${$}vw;
      top:${88 * e()}%;
      left:${88 * e()}%;
      border-color:${M};
    `, T.style.setProperty("--glow", M), T.style.setProperty("--d", 14 + 18 * e() + "s"), T.style.setProperty("--pd", 2.5 + 2 * e() + "s"), T.style.setProperty("--tx", 26 * e() - 13 + "vw"), T.style.setProperty("--ty", 26 * e() - 13 + "vh"), T.style.setProperty("--r0", k + "deg"), T.style.setProperty("--r1", k + 60 * e() - 30 + "deg"), e() < .3 && (T.classList.add("f-neon-dying"), T.style.setProperty("--fd", 3 + 5 * e() + "s")), this.els.bg.appendChild(T)
                }
                return
            }
            if (3 === t) {
                const A = document.createElement("div");
                A.className = "lava-wrap";
                const N = document.createElement("canvas");
                N.className = "lava-canvas", A.appendChild(N), this.els.bg.appendChild(A);
                const R = N.getContext("2d");
                let B, U, O;
                function a_resize() {
                    O = Math.min(window.devicePixelRatio || 1, 2), B = A.clientWidth, U = A.clientHeight, N.width = B * O * .5, N.height = U * O * .5, N.style.width = B + "px", N.style.height = U + "px", R.scale(.5 * O, .5 * O)
                }
                a_resize();
                const q = [],
                    P = 2 + Math.floor(2 * e()),
                    D = [...s_colors].sort(() => e() - .5);
                for (let te = 0; te < P; te++) q.push(D[te % D.length]);
                const G = q.map(function(e) { return [parseInt(e.slice(1, 3), 16), parseInt(e.slice(3, 5), 16), parseInt(e.slice(5, 7), 16)] }),
                    H = 10,
                    j = [];
                for (let se = 0; se < H; se++) {
                    const ae = 35 + 55 * e(),
                        ne = e() * U;
                    j.push({ x: e() * B, y: ne, vx: 0, vy: 0, r: ae, baseR: ae, col: G[Math.floor(e() * G.length)], phase: e() * Math.PI * 2, freq: .08 + .12 * e(), drift: .06 * (e() - .5), temp: 1 - ne / U, tempInertia: .12 + .18 * e() })
                }
                let F, V = { x: -9999, y: -9999, active: !1 },
                    z = null;
                function n_down(e) {
                    const t = e.touches ? e.touches[0] : e;
                    z = A.getBoundingClientRect(), V.x = t.clientX - z.left, V.y = t.clientY - z.top, V.active = !0
                }
                function r_move(e) {
                    if (!V.active || !z) return;
                    const t = e.touches ? e.touches[0] : e;
                    V.x = t.clientX - z.left, V.y = t.clientY - z.top
                }
                function o_up() { V.active = !1, z = null }
                function i_resize() {
                    clearTimeout(F), F = setTimeout(() => {
                        R.setTransform(1, 0, 0, 1, 0, 0), a_resize(), J = .5 * O, j.forEach(e => { e.x = Math.min(e.x, B), e.y = Math.min(e.y, U) })
                    }, 150)
                }
                const __ac = new AbortController(),
                    __sig = __ac.signal;
                A.style.pointerEvents = "auto";
                A.addEventListener("mousedown", n_down, { signal: __sig });
                A.addEventListener("mousemove", r_move, { signal: __sig });
                A.addEventListener("mouseup", o_up, { signal: __sig });
                A.addEventListener("mouseleave", o_up, { signal: __sig });
                A.addEventListener("touchstart", n_down, { passive: !0, signal: __sig });
                A.addEventListener("touchmove", r_move, { passive: !0, signal: __sig });
                A.addEventListener("touchcancel", o_up, { signal: __sig });
                window.addEventListener("resize", i_resize, { signal: __sig });
                let Y = 0,
                    J = .5 * O;
                const W = .994,
                    X = 6.5,
                    K = .42,
                    Z = 1,
                    Q = 25,
                    ee = 200;
                return m = requestAnimationFrame(function e_anim(t) {
                    m = requestAnimationFrame(e_anim);
                    const s = Math.min((t - Y) / 1e3, .05);
                    if (Y = t, !(s <= 0)) {
                        for (let e = 0; e < H; e++) {
                            const a = j[e];
                            if (a.temp += (a.y / U - a.temp) * a.tempInertia * s, a.vy -= (a.temp - K) * X * s, a.phase += a.freq * s, a.vx += Math.sin(a.phase + 1.7 * e) * Z * s, a.vx += a.drift * s * 3, V.active) {
                                const ox = V.x - a.x,
                                    oy = V.y - a.y,
                                    od = Math.sqrt(ox * ox + oy * oy) + 1,
                                    onx = ox / od,
                                    ony = oy / od,
                                    otx = -ony,
                                    oty = onx,
                                    oratio = 1 - Math.min(od, ee) / ee,
                                    oradF = oratio * oratio * 65 * s,
                                    oorbF = oratio * 45 * s;
                                a.vx += onx * oradF + otx * oorbF;
                                a.vy += ony * oradF + oty * oorbF
                            }
                            for (let t = e + 1; t < H; t++) {
                                const e = j[t],
                                    n = e.x - a.x,
                                    r = e.y - a.y,
                                    o = Math.sqrt(n * n + r * r) + 1,
                                    i = .35 * (a.r + e.r);
                                if (o < i) {
                                    const t = .08 * (i - o) * s,
                                        l = n / o,
                                        c = r / o;
                                    a.vx -= l * t, a.vy -= c * t, e.vx += l * t, e.vy += c * t
                                }
                            }
                            a.vx *= W, a.vy *= W, a.x += a.vx, a.y += a.vy;
                            const n = .3 * a.r;
                            a.x < -n && (a.x = -n, a.vx = .3 * Math.abs(a.vx)), a.x > B + n && (a.x = B + n, a.vx = .3 * -Math.abs(a.vx)), a.y < -n && (a.y = -n, a.vy = .3 * Math.abs(a.vy)), a.y > U + n && (a.y = U + n, a.vy = .3 * -Math.abs(a.vy)), a.r = a.baseR + Math.sin(6e-4 * t + 2.1 * e) * a.baseR * .06
                        }
                        R.setTransform(J, 0, 0, J, 0, 0), R.clearRect(0, 0, B, U);
                        for (let e = 0; e < H; e++) {
                            const t = j[e],
                                [s_c, a_c, n_c] = t.col,
                                r_c = 1.8 * t.r,
                                o_c = R.createRadialGradient(t.x, t.y, 0, t.x, t.y, r_c);
                            o_c.addColorStop(0, `rgba(${s_c},${a_c},${n_c},0.95)`), o_c.addColorStop(.4, `rgba(${s_c},${a_c},${n_c},0.7)`), o_c.addColorStop(.7, `rgba(${s_c},${a_c},${n_c},0.3)`), o_c.addColorStop(1, `rgba(${s_c},${a_c},${n_c},0)`), R.beginPath(), R.arc(t.x, t.y, r_c, 0, 2 * Math.PI), R.fillStyle = o_c, R.fill()
                        }
                    }
                }), void(p = () => { __ac.abort(); clearTimeout(F) })
            }
        } else this.els.bg.innerHTML = '\n  <div class="shiny-screen">\n    <div class="shiny-deck">\n      <div class="shiny-c shiny-c1"></div>\n      <div class="shiny-c shiny-c2">★</div>\n      <div class="shiny-c shiny-c3"></div>\n    </div>\n    <div class="shiny-logo">MGO <em>Tracker</em><span>.</span></div>\n  </div>'
    },
    renderMain() {
        this.els.app.innerHTML = "";
        const e = u.cfg.albums,
            t = Math.ceil(e / 2),
            n = 100 / t;
        u.cfg.usersList.forEach((r, o) => {
            const i = r.replace(/\s/g, ""),
                l = 0 === o;
            let c = "";
            l && (c = `<button class="mini-btn" data-action="mode-toggle" style="margin-right:8px;height:24px">${"number" === u.cfg.mode ? "123" : "XXX"}</button>`);
            let d = "";
            if (l) {
                const e = a(u.usr[i].note || "");
                d = `<input type="text" class="user-note" placeholder="${a(s("note_ph"))}" value="${e}" data-uid="${a(i)}" onclick="event.stopPropagation()" ondblclick="event.stopPropagation()">`
            }
            const m = l ? "is-primary" : "",
                p = l && "number" === u.cfg.mode ? "mode-num" : "",
                h = a(r),
                html_g = `
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
  <div class="expand-hint" data-i18n="expand_hint">${s('expand_hint')}</div>
  </div>
  <div style="padding:0" data-u="${i}">
     <div class="grid-scroll">
        <div class="track-row">${this._genRow(1, t, n)}</div>
        <div class="track-row">${this._genRow(t + 1, e - t, n)}</div>
     </div>
<div class="legend-bar">
    <div class="legend-item"><div class="legend-swatch s-have"></div><span data-i18n="legend_have">${s('legend_have')}</span></div>
    <div class="legend-item"><div class="legend-swatch s-dupe"></div><span data-i18n="legend_dupe">${s('legend_dupe')}</span></div>
    <div class="legend-item"><div class="legend-swatch s-gold-dot"></div><span data-i18n="legend_gold">${s('legend_gold')}</span></div>
</div>
  </div>
</div>`;
            this.els.app.insertAdjacentHTML("beforeend", html_g)
        }), this.hydrate()
    },
    _genRow(e, t, s_val) {
        let a = "";
        for (let n = 0; n < t; n++) a += this._genAlb(e + n, s_val);
        return a
    },
    _genAlb(e, t) {
        let a = "";
        for (let t = 0; t < 9; t++) a += `<div class="cell-wrap" data-uid="${9 * (e - 1) + t}" data-st="0">
  <div class="i-dot i-dupe"></div><div class="i-dot i-gold"></div>
  <div class="cell-inner"><span class="t-x">X</span><span class="t-num"></span></div>
</div>`;
        return `<div class="alb-col" style="width:${t}%"><div class="alb-head">${s("album")} ${e}</div><div class="alb-grid">${a}</div></div>`
    },
    hydrate() {
        const e = u.getGoldSet(),
            t = u.getDupesSet();
        this.els.app.querySelectorAll(".cell-wrap").forEach(s => {
            const a = +s.dataset.uid,
                n = s.closest("[data-u]")?.dataset.u;
            if (!n || !u.usr[n]) return;
            const r = u.usr[n].state && u.usr[n].state[a] || 0,
                o = u.usr[n].nums && u.usr[n].nums[a] || "",
                i = e.has(a),
                l = t.has(a);
            this.updateCardVisuals(s, r, o, i, l)
        }), this.updateStats(), this.updateVis()
    },
    updateSingleCell(e, t, s_val) {
        const a = u.getGoldSet().has(+t),
            n = u.usr[e]?.state?.[t] || 0,
            r = u.usr[e]?.nums?.[t] || "";
        if (2 === s_val || 2 === n) {
            const e_dupe = u.getDupesSet().has(+t);
            document.querySelectorAll(`.cell-wrap[data-uid="${t}"]`).forEach(s => {
                const n_card = s.closest("[data-u]");
                if (!n_card) return;
                const r_card = n_card.dataset.u;
                this.updateCardVisuals(s, u.usr[r_card]?.state?.[t] || 0, u.usr[r_card]?.nums?.[t] || "", a, e_dupe)
            })
        } else {
            const s_el = document.querySelector(`.glass-card[data-sec="${e}"] [data-u="${e}"]`);
            if (!s_el) return void this.hydrate();
            const o = s_el.querySelector(`.cell-wrap[data-uid="${t}"]`);
            if (!o) return void this.hydrate();
            const i = u.getDupesSet();
            this.updateCardVisuals(o, n, r, a, i.has(+t))
        }
        this.updateStats()
    },
    updateCardVisuals(e, t, s_val, a, n) {
        e.dataset.st = t;
        const r = e.querySelector(".t-num"),
            o = null == s_val ? "" : s_val + "";
        r.textContent !== o && (r.textContent = o), a ? e.dataset.bg = "1" : delete e.dataset.bg, e.classList.remove("show-gold", "show-dupe"), 0 === t && (a && e.classList.add("show-gold"), n && e.classList.add("show-dupe"))
    },
    updateStats() {
        const e = 9 * u.cfg.albums,
            t = u.getGoldSet();
        this.els.app.querySelectorAll(".glass-card[data-sec]").forEach(s => {
            if ("sec-gold" === s.id) return;
            const a = u.usr[s.dataset.sec];
            if (!a) return;
            const n = a.state || {};
            let r = 0,
                o = 0,
                i = 0;
            for (let s = 0; s < e; s++) {
                const e = n[s] || 0;
                e > 0 && r++, t.has(s) && (i++, e > 0 && o++)
            }
            const l = e > 0 ? Math.round(r / e * 100) : 0,
                c = s.querySelector(".user-avatar"),
                d = s.querySelector(".ua-top"),
                m = s.querySelector(".ua-bot"),
                p = s.querySelector(".ua-percent");
            d && (d.textContent = `${r}/${e}`), m && (m.textContent = `${o}/${i}`), p && (p.textContent = l + "%", p.style.color = 100 === l ? "var(--gold)" : l >= 50 ? "#fb923c" : "#f87171"), c && (c.style.background = `conic-gradient(var(--ok) ${l}%, var(--p) 0)`)
        })
    },
    renderGoldEx() {
        const e = document.getElementById("gold-list");
        e.innerHTML = "";
        if (u.cfg.gold_ex.length > 0) {
            const h = document.createElement("div");
            h.className = "gold-row-header";
            h.innerHTML = `<span>${a(s("album"))}</span><span>${a(s("card"))}</span><span>${a(s("date"))}</span><span></span>`;
            e.appendChild(h)
        }
        const t = document.createDocumentFragment();
        u.cfg.gold_ex.forEach((e, n) => {
            const r = document.createElement("div");
            r.className = "gold-row";
            r.innerHTML = `<input class="g-inp" data-f="alb" maxlength="2" inputmode="numeric" placeholder="--" value="${a(e.alb || e.album || "")}"><input class="g-inp" data-f="card" placeholder="${a(s("card"))}" value="${a(e.card || "")}"><input class="g-inp" data-f="date" maxlength="5" inputmode="numeric" placeholder="JJ/MM" value="${a(e.date || "")}"><button style="background:0 0;border:none;color:var(--err);font-weight:700;cursor:pointer" data-action="del-gold" data-idx="${n}">×</button>`;
            const albInp = r.querySelector('[data-f="alb"]');
            const cardInp = r.querySelector('[data-f="card"]');
            const dateInp = r.querySelector('[data-f="date"]');
            albInp.oninput = () => { albInp.value = albInp.value.replace(/\D/g, "").slice(0, 2); u.cfg.gold_ex[n].alb = albInp.value; u.saveC() };
            cardInp.oninput = () => { u.cfg.gold_ex[n].card = cardInp.value; u.saveC() };
            dateInp.addEventListener("keydown", ev => { if (ev.key === "Backspace" && dateInp.value.endsWith("/")) { dateInp.value = dateInp.value.slice(0, -1); ev.preventDefault() } });
            dateInp.oninput = () => {
                let raw = dateInp.value.replace(/\D/g, "");
                if (raw.length > 4) raw = raw.slice(0, 4);
                dateInp.value = raw.length > 2 ? raw.slice(0, 2) + "/" + raw.slice(2) : raw;
                u.cfg.gold_ex[n].date = dateInp.value;
                u.saveC()
            };
            t.appendChild(r)
        }), e.appendChild(t)
    },
    renderMenus() {
        const e = document.getElementById("view-list");
        e.innerHTML = "";
        const t = document.getElementById("sub-print");
        t.innerHTML = "";
        const a_frag = document.createDocumentFragment(),
            n = document.createDocumentFragment();
        [...u.cfg.usersList, "Gold"].forEach(e => {
            const t = "Gold" === e ? "Gold" : e.replace(/\s/g, ""),
                s_check = u.cfg.hidden.includes(t),
                r = document.createElement("div");
            r.className = "menu-item", r.innerHTML = `<span>${e}</span><label style="cursor:pointer;display:flex"><input type="checkbox" ${s_check ? "" : "checked"} style="display:none"><div class="switch"></div></label>`, r.querySelector("input").onchange = e => { u.cfg.hidden = e.target.checked ? u.cfg.hidden.filter(e => e !== t) : [...u.cfg.hidden, t], u.saveC(), this.updateVis() }, a_frag.appendChild(r);
            const o = document.createElement("div");
            o.className = "menu-item", o.style.cssText = "padding:5px 8px;font-size:0.8rem", o.innerHTML = `<span>${e}</span><label style="cursor:pointer;display:flex;align-items:center"><input type="checkbox" class="print-chk" value="${t}" checked style="display:none"><div class="switch" style="transform:scale(0.7);transform-origin:right center"></div></label>`, n.appendChild(o)
        }), e.appendChild(a_frag);
        const r_btn = document.createElement("button");
        r_btn.className = "mini-btn", r_btn.dataset.action = "do-print", r_btn.style.cssText = "justify-content:center;background:var(--p);color:#fff;margin-top:5px;width:100%", r_btn.textContent = s("print_upper"), n.appendChild(r_btn), t.appendChild(n)
    },
    updateVis() {
        document.getElementById("main-app").querySelectorAll(".anim-section").forEach(e => { e.classList.toggle("hidden", u.cfg.hidden.includes(e.dataset.sec)) })
    },
    renderGoldGrid(e) {
        const t = document.getElementById(e);
        if (!t) return;
        t.innerHTML = "";
        const a_num = u.cfg.albums,
            n_set = u.getGoldSet(),
            r_row = document.createElement("div");
        r_row.className = "g-conf-row";
        for (let e = 1; e <= a_num; e++) {
            let t = "";
            for (let s = 0; s < 9; s++) {
                const a_idx = 9 * (e - 1) + s;
                t += `<div class="g-cell ${n_set.has(a_idx) ? "active" : ""}" data-uid="${a_idx}"></div>`
            }
            const a_col = document.createElement("div");
            a_col.className = "g-conf-col", a_col.innerHTML = `<span style="font-size:9px;font-weight:700;margin-bottom:2px">${s("album")} ${e}</span><div class="g-conf-grid">${t}</div>`, r_row.appendChild(a_col)
        }
        r_row.onclick = e => {
            const t = e.target;
            if (t.classList.contains("g-cell")) {
                const e = +t.dataset.uid,
                    s = t.classList.contains("active");
                u.setGold(e, !s), t.classList.toggle("active")
            }
        }, t.appendChild(r_row)
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
                bg.style.opacity = "1"
            }))
        }, 450)
    },
    renderAmbianceSelector() {
        const el = document.getElementById("amb-sel");
        if (!el) return;
        el.innerHTML = "";
        const hasSpecial = l(u.cfg.seed)() < .01;
        const count = hasSpecial ? 5 : 4;
        const icons = ["<span style='display:inline-block;width:10px;height:10px;background:#fff;border-radius:50%'></span>", "<span style='display:inline-block;width:14px;height:9px;background:#fff;border-radius:3px'></span>", "<span style='display:inline-block;width:10px;height:10px;border:2.5px solid #fff;border-radius:1px;box-sizing:border-box'></span>", "<span style='display:grid;grid-template-columns:1fr 1fr;gap:2px;width:10px;height:10px'><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span><span style='background:#fff;border-radius:50%'></span></span>", "<span style='font-size:0.85em;line-height:1'>✨</span>"];
        const labels = [s("amb_0"), s("amb_1"), s("amb_2"), s("amb_3"), s("amb_4")];
        for (let i = 0; i < count; i++) {
            const btn = document.createElement("button");
            const isActive = u.cfg.ambiance === i;
            btn.style.cssText = `width:40px;height:36px;border-radius:10px;border:2px solid ${isActive ? "var(--p)" : "rgba(255,255,255,0.15)"};background:${isActive ? "rgba(99,102,241,0.2)" : "rgba(0,0,0,0.3)"};cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border 0.2s,background 0.2s;box-shadow:${isActive ? "0 0 8px rgba(99,102,241,0.4)" : "none"}`;
            btn.innerHTML = icons[i];
            btn.title = labels[i];
            btn.onclick = () => {
                if (u.cfg.ambiance === i) return;
                u.cfg.ambiance = i;
                u.saveC();
                g.switchAmbiance();
                g.renderAmbianceSelector();
                g.showToast(labels[i])
            };
            el.appendChild(btn)
        }
    }
};
const v = {
    _lastClickCell: null,
    _lastClickTime: 0,
    _popovers: null,
    _getPopovers() { return this._popovers || (this._popovers = document.querySelectorAll(".popover")), this._popovers },
    handle(e) {
        const t = e.target,
            a_action = t.closest("[data-action]"),
            n = t.closest(".cell-wrap"),
            r = t.closest(".glass-card");
        if (!document.contains(t) || t.closest(".popover") || t.closest(".dock") || this._getPopovers().forEach(e => e.classList.remove("show")), n && "INPUT" !== t.tagName) {
            if ("dblclick" === e.type) return e.stopPropagation(), void e.preventDefault();
            const t_time = Date.now();
            if (v._lastClickCell === n && t_time - (v._lastClickTime || 0) < 300) return void(v._lastClickCell = null);
            v._lastClickCell = n, v._lastClickTime = t_time;
            const s_prim = r && r.classList.contains("is-primary"),
                a_user = n.closest("[data-u]")?.dataset.u,
                o_id = +n.dataset.uid;
            if ("number" === u.cfg.mode && s_prim) {
                e.stopPropagation();
                const t_inner = n.querySelector(".cell-inner");
                t_inner.innerHTML = "";
                const s_inp = document.createElement("input");
                return s_inp.className = "cell-input", s_inp.type = "tel", s_inp.value = u.usr[a_user].nums[o_id] || "", s_inp.onblur = () => {
                    const e = s_inp.value.trim();
                    u.updateCell(a_user, o_id, e, !0), g.updateSingleCell(a_user, o_id, -1)
                }, s_inp.onkeydown = e => { "Enter" === e.key && s_inp.blur() }, t_inner.appendChild(s_inp), void setTimeout(() => { try { s_inp.focus() } catch (e) {} }, 50)
            }
            const l = u.usr[a_user].state[o_id] || 0,
                c = (l + 1) % 3;
            return i.push({ u: a_user, c: o_id, v: l }), i.length > 50 && i.shift(), u.updateCell(a_user, o_id, c), void g.updateSingleCell(a_user, o_id, l)
        }
        if (r && "dblclick" === e.type && !a_action && !n) return void(r.classList.contains("expanded") ? ((() => {
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
                    setTimeout(() => {
                        r.style.transform = "";
                        r.style.transition = "";
                        r.style.transformOrigin = "";
                        r.classList.remove("blur-out", "transitioning")
                    }, 440)
                })
            })
        })()) : (() => {
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
                    setTimeout(() => {
                        r.style.transform = "";
                        r.style.transition = "";
                        r.style.transformOrigin = "";
                        r.classList.remove("transitioning");
                        r.classList.add("blur-active")
                    }, 440)
                })
            })
        })());
        if (!a_action) return;
        e.stopPropagation();
        const c_action = a_action.dataset.action,
            d = {
                "toggle-menu": () => {
                    const pm = document.getElementById("pop-menu"),
                        pv = document.getElementById("pop-view");
                    const wasOpen = pm.classList.contains("show");
                    pv.classList.remove("show");
                    if (wasOpen) { pm.classList.remove("show") } else {
                        const r = a_action.getBoundingClientRect();
                        const cx = r.left + r.width / 2;
                        const pl = window.innerWidth / 2 - 140;
                        pm.style.setProperty("--arrow-left", Math.max(16, Math.min(264, cx - pl)) + "px");
                        pm.classList.add("show")
                    };
                },
                "toggle-view": () => {
                    const pm = document.getElementById("pop-menu"),
                        pv = document.getElementById("pop-view");
                    const wasOpen = pv.classList.contains("show");
                    pm.classList.remove("show");
                    if (wasOpen) { pv.classList.remove("show") } else {
                        const r = a_action.getBoundingClientRect();
                        const cx = r.left + r.width / 2;
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
                    const e = i.pop();
                    e ? (u.updateCell(e.u, e.c, e.v), g.hydrate(), g.showToast(s("undone"))) : g.showToast(s("nothing_to_undo"));
                },
                "mode-toggle": () => { u.cfg.mode = "number" === u.cfg.mode ? "cross" : "number", u.saveC(), g.renderMain() },
                "cycle-ambiance": () => {
                    if (LITE_MODE) return;
                    const e = l(u.cfg.seed)() < .01;
                    u.cfg.ambiance = (u.cfg.ambiance + 1) % (e ? 5 : 4), u.saveC(), g.renderAmbiance();
                    const t = [s("amb_0"), s("amb_1"), s("amb_2"), s("amb_3"), s("amb_4")];
                    g.showToast(t[u.cfg.ambiance])
                },
                "reset-u": () => {
                    const e = a_action.closest(".glass-card").dataset.sec;
                    confirm(s("reset_board_q")) && (u.resetUser(e), g.hydrate(), g.showToast(s("reset_done")))
                },
                "reset-all": () => {
                    if (confirm(s("reset_warn1"))) {
                        let e = confirm(s("reset_warn2")) ? [...u.cfg.usersList] : [s("player") + " 1"],
                            t = u.cfg.ambiance;
                        i.length = 0, localStorage.clear();
                        const a = Date.now();
                        localStorage.setItem("mgo_cfg", JSON.stringify({ albums: 24, mode: "cross", gold_ids: [], gold_ex: [], hidden: [], printHidden: [], setup_done: !1, ambiance: t, seed: a, usersList: e })), location.reload()
                    }
                },
                "open-gold-mod": () => { g.renderGoldGrid("gold-grid-ctn"), document.getElementById("mod-gold").classList.add("open") },
                "close-gold": () => { document.getElementById("mod-gold").classList.remove("open"), g.hydrate() },
                "open-missions": () => MissionManager.open(),
                "close-missions": () => MissionManager.close(),
                "add-gold-row": () => { u.cfg.gold_ex.push({ alb: "", card: "", date: "" }), u.saveC(), g.renderGoldEx() },
                "del-gold": () => { confirm(s("delete_q")) && (u.cfg.gold_ex.splice(+a_action.dataset.idx, 1), u.saveC(), g.renderGoldEx()) },
                "toggle-print-sub": () => {
                    const e = document.getElementById("sub-print");
                    e.style.display = "none" === e.style.display ? "flex" : "none"
                },
                "do-print": () => {
                    const e = new Set(Array.from(document.querySelectorAll(".print-chk:checked")).map(e => e.value));
                    document.querySelectorAll(".glass-card").forEach(t => { t.classList.toggle("print-hidden", !e.has(t.dataset.sec)) }), window.print()
                },
                "save-file": () => {
                    const e = new Blob([JSON.stringify({ version: o.VERSION, config: u.cfg, users: u.usr })], { type: "application/json" }),
                        t = URL.createObjectURL(e),
                        a_download = document.createElement("a");
                    a_download.href = t, a_download.download = `Mgo_Backup_V${o.VERSION}.json`, document.body.appendChild(a_download), a_download.click(), document.body.removeChild(a_download), setTimeout(() => URL.revokeObjectURL(t), 5e3), g.showToast(s("file_dl"))
                },
                "open-share": () => { document.getElementById("pop-menu").classList.remove("show"), y.openModal() },
                "close-share": () => { document.getElementById("mod-share").classList.remove("open") },
                "copy-share-link": () => {
                    const e = document.getElementById("share-url-field");
                    navigator.clipboard.writeText(e.value).then(() => {
                        const e = document.getElementById("share-copy-btn"),
                            t = e.innerHTML;
                        e.innerHTML = s("share_copied"), e.style.background = "var(--ok)", setTimeout(() => { e.innerHTML = t, e.style.background = "var(--p)" }, 2e3)
                    }).catch(() => { e.select(), document.execCommand("copy"), g.showToast(s("share_copied")) })
                },
                save: () => d["save-file"](),
                load: () => {
                    const e = document.createElement("input");
                    e.type = "file", e.accept = ".json", e.onchange = e => {
                        const t = new FileReader;
                        t.onload = e => {
                            try {
                                const t = JSON.parse(e.target.result);
                                t.config && t.users ? (u.cfg = t.config, u.cfg.usersList || (u.cfg.usersList = Object.keys(t.users)), u.cfg.gold_ids || (u.cfg.gold_ids = []), u.cfg.gold_ex || (u.cfg.gold_ex = []), u.cfg.hidden || (u.cfg.hidden = []), u.cfg.printHidden || (u.cfg.printHidden = []), Object.keys(t.users).forEach(e => { t.users[e].state || (t.users[e].state = {}), t.users[e].nums || (t.users[e].nums = {}) }), u.usr = t.users, void 0 === u.cfg.setup_done && (u.cfg.setup_done = !0), i.length = 0, u.saveC(), Object.keys(t.users).forEach(e => u.saveU(e)), location.reload()) : alert(s("file_invalid"))
                            } catch (e) { alert(s("file_err")) }
                        }, t.readAsText(e.target.files[0])
                    }, e.click()
                }
            };
        d[c_action] && d[c_action]()
    }
};
const f = {
    init() {
        const e = document.getElementById("s-alb"),
            t = document.getElementById("s-alb-val");
        g.renderGoldGrid("setup-gold-grid"), e.oninput = e => { t.textContent = e.target.value, u.cfg.albums = +e.target.value, u.saveC(), g.renderGoldGrid("setup-gold-grid") }, document.getElementById("btn-start-season").onclick = () => { u.cfg.setup_done = !0, u.saveC(), document.getElementById("setup-mod").classList.remove("open"), g.renderMenus(), g.renderMain(), g.showToast(s("good_season")) }
    }
};
const y = {
    _selected: null,
    openModal() {
        this._selected = null;
        const e = document.getElementById("share-player-list");
        e.innerHTML = "";
        document.getElementById("share-link-section").style.display = "none";
        u.cfg.usersList.forEach(t => {
            const s_key = t.replace(/\s/g, ""),
                n = document.createElement("button");
            n.className = "mini-btn";
            n.style.cssText = "width:100%;justify-content:flex-start;padding:12px 16px;font-size:0.95rem;transition:0.2s";
            n.innerHTML = "👤 " + a(t);
            n.onclick = () => {
                e.querySelectorAll(".mini-btn").forEach(e => { e.style.background = ""; e.style.color = ""; e.style.borderColor = "" });
                n.style.background = "var(--p)";
                n.style.color = "#fff";
                n.style.borderColor = "var(--p)";
                this._selected = t;
                this._generateLink(t, s_key)
            };
            e.appendChild(n)
        });
        document.getElementById("mod-share").classList.add("open")
    },
    async _generateLink(e, t) {
        const s_json = JSON.stringify({ name: e, data: u.usr[t] || { state: {}, nums: {} } });
        let a_link;
        try {
            const e_enc = (new TextEncoder).encode(s_json),
                t_comp = new CompressionStream("gzip"),
                n = t_comp.writable.getWriter();
            n.write(e_enc);
            n.close();
            const r = await new Response(t_comp.readable).arrayBuffer();
            let o = "";
            new Uint8Array(r).forEach(e => o += String.fromCharCode(e));
            a_link = "z:" + btoa(o)
        } catch (e) { a_link = btoa(unescape(encodeURIComponent(s_json))) }
        const n_url = "https://kevinr99089.github.io/Mgo-Tracker/?share=" + encodeURIComponent(a_link);
        document.getElementById("share-url-field").value = n_url;
        document.getElementById("share-link-section").style.display = "flex"
    },
    async checkImport() {
        const params = new URLSearchParams(window.location.search);
        let raw = params.get('share');
        if (!raw && window.location.hash.startsWith("#share:")) { raw = window.location.hash.slice(7) }
        if (!raw) return;
        try {
            let decoded;
            if (raw.startsWith("z:")) {
                const b = atob(raw.slice(2)),
                    arr = Uint8Array.from(b, c => c.charCodeAt(0)),
                    ds = new DecompressionStream("gzip"),
                    w = ds.writable.getWriter();
                w.write(arr);
                w.close();
                const buf = await new Response(ds.readable).arrayBuffer();
                decoded = (new TextDecoder).decode(buf)
            } else { decoded = decodeURIComponent(escape(atob(raw))) }
            const s_obj = JSON.parse(decoded);
            if (!s_obj.name || !s_obj.data) return;
            this._pendingImport = s_obj;
        } catch (e) { console.error("Share import error", e); this._cleanURL() }
    },
    showImportIfPending() {
        const s_obj = this._pendingImport;
        if (!s_obj) return;
        document.getElementById("import-name").textContent = "👤 " + s_obj.name;
        const checked = Object.values(s_obj.data.state || {}).filter(e => 1 === e).length,
            dupes = Object.values(s_obj.data.state || {}).filter(e => 2 === e).length;
        document.getElementById("import-stats").textContent = s("import_stats").replace("{c}", checked).replace("{d}", dupes);
        const nameMatch = u.cfg.usersList.includes(s_obj.name);
        let shareMem = {};
        try { shareMem = JSON.parse(localStorage.getItem("mgo_share_mem") || "{}") } catch (memErr) {}
        const remembered = shareMem[s_obj.name];
        const rememberedValid = remembered && u.cfg.usersList.includes(remembered);
        const btnC = document.getElementById("btn-import-confirm");
        const btnR = document.getElementById("btn-import-replace");
        const btnQ = document.getElementById("btn-import-quick");
        if (nameMatch) {
            btnC.textContent = s("import_btn_update").replace("{name}", s_obj.name);
            btnR.style.display = "none";
            btnQ.style.display = "none";
            this._quickTarget = null;
        } else {
            btnC.textContent = "➕ " + s("import_add");
            btnR.style.display = "";
            btnR.textContent = "🔄 " + s("import_replace_btn");
            if (rememberedValid) {
                btnQ.style.display = "";
                btnQ.textContent = s("import_btn_quick").replace("{name}", remembered);
                this._quickTarget = remembered;
            } else {
                btnQ.style.display = "none";
                this._quickTarget = null;
            }
        }
        document.getElementById("import-step-1").style.display = "flex";
        document.getElementById("import-step-2").style.display = "none";
        document.getElementById("btn-import-cancel").textContent = "✖ " + s("import_cancel_btn");
        document.getElementById("btn-import-replace-back").textContent = "← " + s("import_replace_back");
        document.getElementById("btn-import-replace-confirm").textContent = "✅ " + s("import_replace_confirm");
        document.getElementById("mod-import").classList.add("open");
    },
    confirmImport() {
        const e = this._pendingImport;
        if (!e) return;
        const t = e.name.replace(/\s/g, "");
        u.cfg.usersList.includes(e.name) || (u.cfg.usersList.push(e.name), u.saveC());
        u.usr[t] = { state: {}, nums: {}, ...e.data };
        u.saveU(t);
        this._pendingImport = null;
        this._replaceTarget = null;
        this._closeImportModal();
        g.showToast(s("imported").replace("{name}", e.name));
        setTimeout(() => location.reload(), 900)
    },
    _cleanURL() {
        const url = new URL(window.location);
        let changed = !1;
        if (url.searchParams.has('share')) { url.searchParams.delete('share'); changed = !0 }
        if (url.hash.startsWith('#share:')) { url.hash = ''; changed = !0 }
        if (changed) { history.replaceState(null, "", url.toString()) }
    },
    _closeImportModal() {
        this._cleanURL();
        document.getElementById("mod-import").classList.remove("open");
        document.getElementById("import-step-1").style.display = "flex";
        document.getElementById("import-step-2").style.display = "none"
    },
    openReplaceStep() {
        const list = document.getElementById("import-player-select");
        list.innerHTML = "";
        this._replaceTarget = null;
        document.getElementById("btn-import-replace-confirm").disabled = !0;
        u.cfg.usersList.forEach(name => {
            const btn = document.createElement("button");
            btn.className = "mini-btn";
            btn.style.cssText = "width:100%;justify-content:flex-start;padding:10px 14px;font-size:0.9rem;transition:0.2s";
            btn.textContent = "👤 " + name;
            btn.onclick = () => {
                list.querySelectorAll(".mini-btn").forEach(b => { b.style.background = ""; b.style.borderColor = ""; b.style.color = "" });
                btn.style.background = "var(--p)";
                btn.style.borderColor = "var(--p)";
                btn.style.color = "#fff";
                this._replaceTarget = name;
                document.getElementById("btn-import-replace-confirm").disabled = !1
            };
            list.appendChild(btn)
        });
        document.getElementById("import-step-1").style.display = "none";
        document.getElementById("import-step-2").style.display = "flex"
    },
    confirmReplace() {
        const e = this._pendingImport;
        if (!e || !this._replaceTarget) return;
        if (!confirm(s("import_replace_warn").replace("{name}", this._replaceTarget))) return;
        const targetKey = this._replaceTarget.replace(/\s/g, "");
        u.usr[targetKey] = { state: {}, nums: {}, ...e.data };
        u.saveU(targetKey);
        const replaced = this._replaceTarget;
        let shareMemR = {};
        try { shareMemR = JSON.parse(localStorage.getItem("mgo_share_mem") || "{}") } catch (memErr) {}
        shareMemR[e.name] = replaced;
        localStorage.setItem("mgo_share_mem", JSON.stringify(shareMemR));
        this._pendingImport = null;
        this._replaceTarget = null;
        this._closeImportModal();
        g.showToast(s("data_replaced").replace("{name}", replaced));
        setTimeout(() => location.reload(), 900)
    },
    confirmQuickUpdate() {
        const e = this._pendingImport;
        if (!e || !this._quickTarget) return;
        const t = this._quickTarget.replace(/\s/g, "");
        u.usr[t] = { state: {}, nums: {}, ...e.data };
        u.saveU(t);
        const target = this._quickTarget;
        this._pendingImport = null;
        this._quickTarget = null;
        this._closeImportModal();
        g.showToast(s("updated").replace("{name}", target));
        setTimeout(() => location.reload(), 900)
    }
};
const MissionManager = {
    LS_DATA: 'mgo_missions_data',
    LS_WEEK: 'mgo_missions_week',
    _data: null,
    _getMondayDate(from) {
        const d = new Date(from);
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        const diff = (day === 0) ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        return d;
    },
    _weekKey(monday) { return monday.getFullYear() + '-' + String(monday.getMonth() + 1).padStart(2, '0') + '-' + String(monday.getDate()).padStart(2, '0'); },
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
        const tr_days = translations.days || ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const tr_months = translations.months || ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        for (let di = 0; di < 7; di++) {
            const dayDate = new Date(monday);
            dayDate.setDate(monday.getDate() + di);
            const isToday = dayDate.getTime() === now.getTime();
            const dayLabel = tr_days[di] + ' ' + dayDate.getDate() + ' ' + tr_months[dayDate.getMonth()] + ' ' + dayDate.getFullYear();
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
                ta.placeholder = s("mission_ph").replace("{n}", mi + 1);
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
    u.init(), MissionManager.init(), y.checkImport(), document.getElementById("btn-import-confirm").onclick = () => y.confirmImport();
    document.getElementById("btn-import-quick").onclick = () => y.confirmQuickUpdate();
    document.getElementById("btn-import-replace").onclick = () => y.openReplaceStep();
    document.getElementById("btn-import-replace-back").onclick = () => {
        document.getElementById("import-step-1").style.display = "flex";
        document.getElementById("import-step-2").style.display = "none";
        y._replaceTarget = null
    };
    document.getElementById("btn-import-replace-confirm").onclick = () => y.confirmReplace();
    document.getElementById("btn-import-cancel").onclick = () => { y._pendingImport = null; y._replaceTarget = null; y._closeImportModal() };
    const e = document.getElementById("sl-alb");
    let t;
    e.value = u.cfg.albums, document.getElementById("lbl-alb").textContent = u.cfg.albums, e.oninput = e => { document.getElementById("lbl-alb").textContent = e.target.value, clearTimeout(t), t = setTimeout(() => { u.cfg.albums = +e.target.value, u.invalidateGold(), u.saveC(), g.renderMain() }, 300) }, g.renderMain(), g.renderGoldEx(), g.renderMenus();
    if (!LITE_MODE) {
        const a = d(u.cfg);
        a && u.saveC();
        g.renderAmbianceSelector();
        if (a) setTimeout(() => g.showToast(s(a)), 500);
        else if (4 === u.cfg.ambiance) g.showToast(s("shiny_season"))
    }
    const n_evt = v.handle.bind(v);
    let o_timer;
    document.body.addEventListener("click", n_evt), document.body.addEventListener("dblclick", n_evt), document.body.addEventListener("input", e => {
        if (e.target.classList.contains("user-note")) {
            const t = e.target.dataset.uid;
            if (u.usr[t]) {
                const s_val = e.target.value;
                s_val ? u.usr[t].note = s_val : delete u.usr[t].note, clearTimeout(o_timer), o_timer = setTimeout(() => u.saveU(t), 400)
            }
        }
    }), f.init();
    const __sp = document.getElementById("splash");
    if (LITE_MODE) {
        requestAnimationFrame(() => setTimeout(() => {
            __sp.style.transition = "opacity 0.4s ease";
            __sp.style.opacity = "0";
            setTimeout(() => { __sp.remove(); u.cfg.setup_done || document.getElementById("setup-mod").classList.add("open"); y.showImportIfPending() }, 400)
        }, 500));
    } else {
        const __bg = document.getElementById("ambient-bg");
        setTimeout(() => {
            setTimeout(() => {
                g.renderAmbiance();
                requestAnimationFrame(() => requestAnimationFrame(() => { __bg.style.opacity = "1" }))
            }, 1200);
            __sp.style.transition = "opacity 0.4s ease, visibility 0.4s ease", __sp.style.opacity = "0", __sp.style.visibility = "hidden", __sp.style.pointerEvents = "none";
            const e = [...document.querySelectorAll(".anim-section")],
                t = e.filter(e => !e.classList.contains("hidden"));
            e.forEach(e => { e.style.opacity = "0", e.style.transform = "translateY(22px)", e.style.transition = "none" });
            const s_bez = "cubic-bezier(0.22, 1, 0.36, 1)";
            t.forEach((e, t) => { setTimeout(() => { e.style.transition = `opacity 480ms ${s_bez}, transform 480ms ${s_bez}`, e.style.opacity = "1", e.style.transform = "translateY(0)" }, 85 * t) }), setTimeout(() => { e.forEach(e => { e.style.removeProperty("opacity"), e.style.removeProperty("transform"), e.style.removeProperty("transition") }), __sp.remove(), u.cfg.setup_done || document.getElementById("setup-mod").classList.add("open"); y.showImportIfPending() }, 85 * t.length + 480 + 100)
        }, 900)
    }
}
document.addEventListener("DOMContentLoaded", async () => {
    LITE_MODE = document.documentElement.className === "lite-mode";
    await initI18n();
    const __sv = localStorage.getItem(__MGO_PREF);
    if (!__sv) {
        document.getElementById("__hub").style.display = "flex";
        return;
    }
    __initApp();
});