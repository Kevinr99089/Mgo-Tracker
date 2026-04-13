const __MGO_PREF = 'mgo_unified_version';
let LITE_MODE = false;
let e = { en: {}, fr: {} };
const t = (navigator.language || "en").startsWith("fr") ? "fr" : "en";
const s = k => e[t] && e[t][k] ? e[t][k] : k;
function a(str) {
    return (str + "").replace(/&/g, "&amp;")
                     .replace(/</g, "&lt;")
                     .replace(/>/g, "&gt;")
                     .replace(/"/g, "&quot;")
                     .replace(/'/g, "&#39;");
}
const n = new Set(["add_upper"]);
function r() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        const val = s(key);
        if (n.has(key)) {
            el.innerHTML = val;
        } else {
            el.textContent = val;
        }
    });
}
window.__pickVersion = function(v) {
    LITE_MODE = v === 'lite';
    if (document.getElementById('__hub-chk').checked) {
        localStorage.setItem(__MGO_PREF, v);
    } else {
        localStorage.removeItem(__MGO_PREF);
    }
    document.documentElement.className = LITE_MODE ? 'lite-mode' : 'full-mode';
    document.getElementById('__hub').style.display = 'none';
    __initApp();
};
const o = { VERSION: "4.1.3 (Web)", KEYS: { CFG: "mgo_cfg", USR: "mgo_u_" } };
let i = [];
function l(seed) {
    return function() {
        var t = seed += 1831565813;
        t = Math.imul(t ^ t >>> 15, 1 | t);
        return (((t ^= t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t >>> 14) >>> 0) / 4294967296;
    }
}
function c(seed) {
    return l(seed)() < .01;
}
function d(cfg) {
    const max = c(cfg.seed) ? 4 : 3;
    if (cfg.ambiance == null || typeof cfg.ambiance !== "number" || cfg.ambiance < 0 || !Number.isInteger(cfg.ambiance)) {
        cfg.ambiance = 0;
        return null;
    }
    if (cfg.ambiance > max) {
        if (cfg.ambiance === 4 && !c(cfg.seed)) {
            cfg.ambiance = 0;
            return "cheat_shiny";
        }
        cfg.ambiance = 0;
        return "cheat_easter";
    }
    return null;
}
const u = {
    cfg: { albums: 24, mode: "cross", gold_ids: [], gold_ex: [], hidden: [], printHidden: [], setup_done: false, ambiance: 0, seed: Date.now(), usersList: [] },
    usr: {},
    _dupesCache: null,
    _goldCache: null,
    _saveTimers: {},
    getGoldSet() {
        if (!this._goldCache) {
            this._goldCache = new Set(this.cfg.gold_ids);
        }
        return this._goldCache;
    },
    invalidateGold() {
        this._goldCache = null;
    },
    getDupesSet() {
        if (this._dupesCache) return this._dupesCache;
        const set = new Set();
        Object.values(this.usr).forEach(user => {
            if (user && user.state) {
                Object.entries(user.state).forEach(([cell, val]) => {
                    if (val === 2) set.add(+cell);
                });
            }
        });
        this._dupesCache = set;
        return set;
    },
    invalidateDupes() {
        this._dupesCache = null;
    },
    debounceSave(userKey) {
        clearTimeout(this._saveTimers[userKey]);
        this._saveTimers[userKey] = setTimeout(() => this.saveU(userKey), 400);
    },
    init() {
        const storedCfg = localStorage.getItem("mgo_cfg");
        if (storedCfg) {
            try {
                const parsed = JSON.parse(storedCfg);
                this.cfg = { ...this.cfg, ...parsed };
                if (!this.cfg.seed) this.cfg.seed = Date.now();
            } catch (err) {
                console.error("Config corrupt", err);
            }
        }
        if (!this.cfg.usersList || this.cfg.usersList.length === 0) {
            this.cfg.usersList = [s("player") + " 1"];
        }
        this.cfg.usersList.forEach(name => {
            const key = name.replace(/\s/g, "");
            const storedUsr = localStorage.getItem("mgo_u_" + key);
            if (storedUsr) {
                try {
                    const parsed = JSON.parse(storedUsr);
                    this.usr[key] = { state: {}, nums: {}, ...parsed };
                    if (!this.usr[key].state) this.usr[key].state = {};
                    if (!this.usr[key].nums) this.usr[key].nums = {};
                } catch (err) {
                    console.error("User data corrupt for", key, err);
                    this.usr[key] = { state: {}, nums: {} };
                }
            } else {
                this.usr[key] = { state: {}, nums: {} };
            }
        });
    },
    saveC() {
        localStorage.setItem("mgo_cfg", JSON.stringify(this.cfg));
    },
    saveU(userKey) {
        if (this.usr[userKey]) {
            localStorage.setItem("mgo_u_" + userKey, JSON.stringify(this.usr[userKey]));
        }
    },
    setGold(cell, isGold) {
        const set = new Set(this.cfg.gold_ids);
        if (isGold) set.add(cell);
        else set.delete(cell);
        this.cfg.gold_ids = Array.from(set);
        this.invalidateGold();
        this.saveC();
    },
    updateCell(userKey, cell, val, isNum = false) {
        if (this.usr[userKey]) {
            if (!this.usr[userKey].state) this.usr[userKey].state = {};
            if (!this.usr[userKey].nums) this.usr[userKey].nums = {};
            if (isNum) {
                if (val) this.usr[userKey].nums[cell] = val;
                else delete this.usr[userKey].nums[cell];
            } else {
                const old = this.usr[userKey].state[cell] || 0;
                if (val === 0) delete this.usr[userKey].state[cell];
                else this.usr[userKey].state[cell] = val;
                if (old === 2 || val === 2) {
                    this.invalidateDupes();
                }
            }
            this.debounceSave(userKey);
        }
    },
    resetUser(userKey) {
        if (this.usr[userKey]) {
            this.usr[userKey].state = {};
            this.usr[userKey].nums = {};
            this.invalidateDupes();
            this.saveU(userKey);
        }
    }
};
window.UserManager = {
    tempUsers: [],
    _newIndices: new Set(),
    _dragSrc: null,
    _touchSrc: null,
    _touchClone: null,
    _touchStartY: 0,
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
        const listEl = document.getElementById("users-edit-list");
        listEl.innerHTML = "";
        this.tempUsers.forEach((name, idx) => {
            const row = document.createElement("div");
            row.className = "um-row" + (this._newIndices.has(idx) ? " um-new" : "");
            row.draggable = true;
            row.dataset.idx = idx;
            const safeName = a(name);
            row.innerHTML = `
                <span class="um-handle" title="Glisser pour réordonner">⠿</span>
                <input type="text" class="g-inp um-inp" style="flex:1;border:1px solid var(--glass-b);border-radius:6px;padding:8px;color:#fff" value="${safeName}" data-idx="${idx}">
                <button class="mini-btn danger um-del" data-idx="${idx}" ${this.tempUsers.length <= 1 ? "disabled" : ""}>×</button>
            `;
            row.addEventListener("dragstart", e => this._onDragStart(e, row));
            row.addEventListener("dragover", e => this._onDragOver(e, row));
            row.addEventListener("dragleave", e => row.classList.remove("um-drag-over"));
            row.addEventListener("drop", e => this._onDrop(e, row));
            row.addEventListener("dragend", e => this._onDragEnd());
            const handle = row.querySelector(".um-handle");
            handle.addEventListener("touchstart", e => this._onTouchStart(e, row), { passive: false });
            handle.addEventListener("touchmove", e => this._onTouchMove(e), { passive: false });
            handle.addEventListener("touchend", e => this._onTouchEnd(e), { passive: false });
            row.querySelector(".um-inp").addEventListener("change", e => this.update(+e.target.dataset.idx, e.target.value));
            row.querySelector(".um-del").addEventListener("click", e => this.remove(+e.target.dataset.idx));
            listEl.appendChild(row);
        });
    },
    _onDragStart(e, row) {
        this._dragSrc = row;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", row.dataset.idx);
        setTimeout(() => row.classList.add("um-dragging"), 0);
    },
    _onDragOver(e, row) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (row !== this._dragSrc) {
            document.querySelectorAll(".um-row").forEach(el => el.classList.remove("um-drag-over"));
            row.classList.add("um-drag-over");
        }
    },
    _onDrop(e, row) {
        e.preventDefault();
        if (row === this._dragSrc) return;
        const targetIdx = +row.dataset.idx;
        const draggedItem = this.tempUsers.splice(+this._dragSrc.dataset.idx, 1)[0];
        this.tempUsers.splice(targetIdx, 0, draggedItem);
        this.render();
    },
    _onDragEnd() {
        document.querySelectorAll(".um-row").forEach(el => el.classList.remove("um-dragging", "um-drag-over"));
        this._dragSrc = null;
    },
    _onTouchStart(e, row) {
        e.preventDefault();
        this._touchSrc = row;
        this._touchStartY = e.touches[0].clientY;
        const clone = row.cloneNode(true);
        clone.classList.add("um-touch-clone");
        clone.style.top = row.getBoundingClientRect().top + "px";
        document.body.appendChild(clone);
        this._touchClone = clone;
        row.classList.add("um-dragging");
    },
    _onTouchMove(e) {
        if (!this._touchClone) return;
        e.preventDefault();
        const touchY = e.touches[0].clientY;
        this._touchClone.style.top = (touchY - 22) + "px";
        const overEl = document.elementsFromPoint(e.touches[0].clientX, touchY).find(el => el.classList.contains("um-row") && el !== this._touchSrc);
        document.querySelectorAll(".um-row").forEach(el => el.classList.remove("um-drag-over"));
        if (overEl) overEl.classList.add("um-drag-over");
    },
    _onTouchEnd(e) {
        if (!this._touchClone) return;
        const touch = e.changedTouches[0];
        const overEl = document.elementsFromPoint(touch.clientX, touch.clientY).find(el => el.classList.contains("um-row") && el !== this._touchSrc);
        this._touchClone.remove();
        this._touchClone = null;
        if (overEl) {
            const targetIdx = +overEl.dataset.idx;
            const draggedItem = this.tempUsers.splice(+this._touchSrc.dataset.idx, 1)[0];
            this.tempUsers.splice(targetIdx, 0, draggedItem);
        }
        this.render();
        this._touchSrc = null;
    },
    update(idx, val) {
        this.tempUsers[idx] = val.trim() || `${s("player")} ${idx + 1}`;
    },
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
            setTimeout(() => {
                row.classList.remove('um-flashing');
                row.classList.add('um-new');
            }, 950);
        });
    },
    remove(idx) {
        if (this.tempUsers.length > 1) {
            this.tempUsers.splice(idx, 1);
            this.render();
        }
    },
    save() {
        this._newIndices.clear();
        const originalList = u.cfg.usersList.slice();
        this.tempUsers.forEach((newName, idx) => {
            const oldName = originalList[idx];
            if (!oldName) return;
            const oldKey = oldName.replace(/\s/g, "");
            const newKey = newName.replace(/\s/g, "");
            if (oldKey !== newKey && u.usr[oldKey]) {
                u.usr[newKey] = u.usr[oldKey];
                delete u.usr[oldKey];
                try { localStorage.removeItem("mgo_u_" + oldKey); } catch(err) {}
                u.saveU(newKey);
            }
        });
        const oldFirstKey = originalList[0] ? originalList[0].replace(/\s/g, "") : null;
        const newFirstKey = this.tempUsers[0] ? this.tempUsers[0].replace(/\s/g, "") : null;
        if (oldFirstKey && newFirstKey && oldFirstKey !== newFirstKey && u.usr[oldFirstKey]) {
            u.usr[oldFirstKey].nums = {};
            u.saveU(oldFirstKey);
        }
        this.tempUsers.forEach(name => {
            const key = name.replace(/\s/g, "");
            if (!u.usr[key]) {
                u.usr[key] = { state: {}, nums: {} };
            }
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
function h() {
    if (m) { cancelAnimationFrame(m); m = null; }
    if (p) { p(); p = null; }
}
const g = {
    els: {
        app: document.getElementById("gen-cards"),
        toast: document.getElementById("toast"),
        bg: document.getElementById("ambient-bg")
    },
    showToast(msg) {
        this.els.toast.textContent = msg;
        this.els.toast.classList.add("show");
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => this.els.toast.classList.remove("show"), 2000);
    },
    renderAmbiance() {
        if (LITE_MODE || !this.els.bg) return;
        h();
        this.els.bg.innerHTML = "";
        const seedRandom = l(u.cfg.seed);
        const amb = u.cfg.ambiance || 0;
        const colors = ["#4f46e5", "#c026d3", "#06b6d4", "#f472b6", "#fbbf24"];
        if (amb === 4) {
            this.els.bg.innerHTML = `
                <div class="shiny-screen">
                    <div class="shiny-deck">
                        <div class="shiny-c shiny-c1"></div>
                        <div class="shiny-c shiny-c2">★</div>
                        <div class="shiny-c shiny-c3"></div>
                    </div>
                    <div class="shiny-logo">MGO <em>Tracker</em><span>.</span></div>
                </div>
            `;
            return;
        }
        if (amb === 0) {
            const count = 7;
            for (let i = 0; i < count; i++) {
                const el = document.createElement("div");
                el.className = "f-obj f-orb";
                const size = 45 + 40 * seedRandom();
                const col = colors[Math.floor(seedRandom() * colors.length)];
                el.style.cssText = `width:${size}vw; height:${size}vw; top:${90 * seedRandom() - 5}%; left:${90 * seedRandom() - 5}%; background:radial-gradient(circle at 50% 50%, ${col} 0%, transparent 68%);`;
                el.style.setProperty("--d", 18 + 16 * seedRandom() + "s");
                el.style.setProperty("--tx", 18 * seedRandom() - 9 + "vw");
                el.style.setProperty("--ty", 18 * seedRandom() - 9 + "vh");
                el.style.setProperty("--r0", 30 * seedRandom() - 15 + "deg");
                el.style.setProperty("--r1", 30 * seedRandom() - 15 + "deg");
                this.els.bg.appendChild(el);
            }
            return;
        }
        if (amb === 1) {
            const grads = ["linear-gradient(145deg,#3b41d8,#6468f5)", "linear-gradient(145deg,#c77b10,#f0aa22)", "linear-gradient(145deg,#b8233b,#eb3a5f)", "linear-gradient(145deg,#0e766e,#14b8a6)", "linear-gradient(145deg,#7c3aed,#a855f7)", "linear-gradient(145deg,#065f86,#0ea5e9)"];
            const count = 7;
            for (let i = 0; i < count; i++) {
                const el = document.createElement("div");
                el.className = "f-obj f-card";
                const size = 18 + 22 * seedRandom();
                const ratio = 0.65 + 0.25 * seedRandom();
                const rot = 60 * seedRandom() - 30;
                el.style.cssText = `width:${size}vw; height:${size / ratio}vw; top:${85 * seedRandom() - 5}%; left:${85 * seedRandom() - 5}%; background:${grads[Math.floor(seedRandom() * grads.length)]};`;
                el.style.setProperty("--d", 20 + 18 * seedRandom() + "s");
                el.style.setProperty("--tx", 20 * seedRandom() - 10 + "vw");
                el.style.setProperty("--ty", 20 * seedRandom() - 10 + "vh");
                el.style.setProperty("--r0", rot + "deg");
                el.style.setProperty("--r1", rot + 40 * seedRandom() - 20 + "deg");
                this.els.bg.appendChild(el);
            }
            return;
        }
        if (amb === 2) {
            const count = 9;
            for (let i = 0; i < count; i++) {
                const el = document.createElement("div");
                el.className = "f-obj f-neon";
                const w = 8 + 18 * seedRandom();
                const h2 = seedRandom() > 0.5 ? w : w * (0.5 + 0.8 * seedRandom());
                const col = colors[Math.floor(seedRandom() * colors.length)];
                const rot = seedRandom() > 0.5 ? 45 : 30 * seedRandom() - 15;
                el.style.cssText = `width:${w}vw; height:${h2}vw; top:${88 * seedRandom()}%; left:${88 * seedRandom()}%; border-color:${col};`;
                el.style.setProperty("--glow", col);
                el.style.setProperty("--d", 14 + 18 * seedRandom() + "s");
                el.style.setProperty("--pd", 2.5 + 2 * seedRandom() + "s");
                el.style.setProperty("--tx", 26 * seedRandom() - 13 + "vw");
                el.style.setProperty("--ty", 26 * seedRandom() - 13 + "vh");
                el.style.setProperty("--r0", rot + "deg");
                el.style.setProperty("--r1", rot + 60 * seedRandom() - 30 + "deg");
                if (seedRandom() < 0.3) {
                    el.classList.add("f-neon-dying");
                    el.style.setProperty("--fd", 3 + 5 * seedRandom() + "s");
                }
                this.els.bg.appendChild(el);
            }
            return;
        }
        if (amb === 3) {
            const wrap = document.createElement("div");
            wrap.className = "lava-wrap";
            const canvas = document.createElement("canvas");
            canvas.className = "lava-canvas";
            wrap.appendChild(canvas);
            this.els.bg.appendChild(wrap);
            const ctx = canvas.getContext("2d");
            let W, H, dpr;
            function resize() {
                dpr = Math.min(window.devicePixelRatio || 1, 2);
                W = wrap.clientWidth;
                H = wrap.clientHeight;
                canvas.width = W * dpr * 0.5;
                canvas.height = H * dpr * 0.5;
                canvas.style.width = W + "px";
                canvas.style.height = H + "px";
                ctx.scale(0.5 * dpr, 0.5 * dpr);
            }
            resize();
            const pColors = [];
            const numCols = 2 + Math.floor(2 * seedRandom());
            const shuffled = [...colors].sort(() => seedRandom() - 0.5);
            for (let i = 0; i < numCols; i++) pColors.push(shuffled[i % shuffled.length]);
            const hexToRgb = hex => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
            const rgbColors = pColors.map(hexToRgb);
            const N = 10;
            const pts = [];
            for (let i = 0; i < N; i++) {
                const r = 35 + 55 * seedRandom();
                const y = seedRandom() * H;
                pts.push({
                    x: seedRandom() * W, y: y, vx: 0, vy: 0, r: r, baseR: r,
                    col: rgbColors[Math.floor(seedRandom() * rgbColors.length)],
                    phase: seedRandom() * Math.PI * 2, freq: 0.08 + 0.12 * seedRandom(),
                    drift: 0.06 * (seedRandom() - 0.5), temp: 1 - y / H, tempInertia: 0.12 + 0.18 * seedRandom()
                });
            }
            let resizeTimer;
            const mouse = { x: -9999, y: -9999, active: false };
            let rect = null;
            function onDown(e) { const t = e.touches ? e.touches[0] : e; rect = wrap.getBoundingClientRect(); mouse.x = t.clientX - rect.left; mouse.y = t.clientY - rect.top; mouse.active = true; }
            function onMove(e) { if (!mouse.active || !rect) return; const t = e.touches ? e.touches[0] : e; mouse.x = t.clientX - rect.left; mouse.y = t.clientY - rect.top; }
            function onUp() { mouse.active = false; rect = null; }
            function onResize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { ctx.setTransform(1, 0, 0, 1, 0, 0); resize(); scaleF = 0.5 * dpr; pts.forEach(p => { p.x = Math.min(p.x, W); p.y = Math.min(p.y, H); }); }, 150); }
            const __ac = new AbortController();
            const __sig = __ac.signal;
            wrap.style.pointerEvents = "auto";
            wrap.addEventListener("mousedown", onDown, { signal: __sig });
            wrap.addEventListener("mousemove", onMove, { signal: __sig });
            wrap.addEventListener("mouseup", onUp, { signal: __sig });
            wrap.addEventListener("mouseleave", onUp, { signal: __sig });
            wrap.addEventListener("touchstart", onDown, { passive: true, signal: __sig });
            wrap.addEventListener("touchmove", onMove, { passive: true, signal: __sig });
            wrap.addEventListener("touchcancel", onUp, { signal: __sig });
            window.addEventListener("resize", onResize, { signal: __sig });
            let lastT = 0;
            let scaleF = 0.5 * dpr;
            m = requestAnimationFrame(function loop(time) {
                m = requestAnimationFrame(loop);
                const dt = Math.min((time - lastT) / 1000, 0.05);
                if (dt <= 0) return;
                lastT = time;
                for (let i = 0; i < N; i++) {
                    const p = pts[i];
                    p.temp += (p.y / H - p.temp) * p.tempInertia * dt;
                    p.vy -= (p.temp - 0.42) * 6.5 * dt;
                    p.phase += p.freq * dt;
                    p.vx += Math.sin(p.phase + 1.7 * i) * 1 * dt;
                    p.vx += p.drift * dt * 3;
                    if (mouse.active) {
                        const dx = mouse.x - p.x;
                        const dy = mouse.y - p.y;
                        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
                        const nx = dx / dist, ny = dy / dist;
                        const ratio = 1 - Math.min(dist, 200) / 200;
                        const force = ratio * ratio * 65 * dt;
                        p.vx += nx * force - ny * force;
                        p.vy += ny * force + nx * force;
                    }
                    for (let j = i + 1; j < N; j++) {
                        const p2 = pts[j];
                        const dx = p2.x - p.x;
                        const dy = p2.y - p.y;
                        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
                        const minDist = 0.35 * (p.r + p2.r);
                        if (dist < minDist) {
                            const force = 0.08 * (minDist - dist) * dt;
                            const fx = (dx / dist) * force, fy = (dy / dist) * force;
                            p.vx -= fx; p.vy -= fy; p2.vx += fx; p2.vy += fy;
                        }
                    }
                    p.vx *= 0.994; p.vy *= 0.994;
                    p.x += p.vx; p.y += p.vy;
                    const edge = 0.3 * p.r;
                    if (p.x < -edge) { p.x = -edge; p.vx = 0.3 * Math.abs(p.vx); }
                    if (p.x > W + edge) { p.x = W + edge; p.vx = 0.3 * -Math.abs(p.vx); }
                    if (p.y < -edge) { p.y = -edge; p.vy = 0.3 * Math.abs(p.vy); }
                    if (p.y > H + edge) { p.y = H + edge; p.vy = 0.3 * -Math.abs(p.vy); }
                    p.r = p.baseR + Math.sin(0.0006 * time + 2.1 * i) * p.baseR * 0.06;
                }
                ctx.setTransform(scaleF, 0, 0, scaleF, 0, 0);
                ctx.clearRect(0, 0, W, H);
                for (let i = 0; i < N; i++) {
                    const p = pts[i];
                    const [r, g, b] = p.col;
                    const rad = 1.8 * p.r;
                    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
                    grad.addColorStop(0, `rgba(${r},${g},${b},0.95)`);
                    grad.addColorStop(0.4, `rgba(${r},${g},${b},0.7)`);
                    grad.addColorStop(0.7, `rgba(${r},${g},${b},0.3)`);
                    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
                    ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, 2 * Math.PI);
                    ctx.fillStyle = grad; ctx.fill();
                }
            });
            p = function() {
                __ac.abort();
                clearTimeout(resizeTimer);
            };
        }
    },
    renderMain() {
        this.els.app.innerHTML = "";
        const numAlb = u.cfg.albums;
        const half = Math.ceil(numAlb / 2);
        const percent = 100 / half;
        u.cfg.usersList.forEach((rawName, idx) => {
            const key = rawName.replace(/\s/g, "");
            const isFirst = idx === 0;
            let btnMode = "";
            if (isFirst) {
                btnMode = `<button class="mini-btn" data-action="mode-toggle" style="margin-right:8px;height:24px">${u.cfg.mode === "number" ? "123" : "XXX"}</button>`;
            }
            let noteInp = "";
            if (isFirst) {
                const noteVal = a(u.usr[key].note || "");
                noteInp = `<input type="text" class="user-note" placeholder="${a(s("note_ph"))}" value="${noteVal}" data-uid="${a(key)}" onclick="event.stopPropagation()" ondblclick="event.stopPropagation()">`;
            }
            const clsPrimary = isFirst ? "is-primary" : "";
            const clsNum = isFirst && u.cfg.mode === "number" ? "mode-num" : "";
            const safeName = a(rawName);
            const html = `
            <div class="glass-card anim-section ${clsPrimary} ${clsNum}" data-sec="${a(key)}">
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
                        ${btnMode}
                        ${noteInp}
                    </div>
                    <div class="card-tools"><button class="mini-btn danger reset-u-btn" data-action="reset-u" title="Réinitialiser">↺</button></div>
                    <div class="expand-hint">${a(s("expand_hint"))}</div>
                </div>
                <div style="padding:0" data-u="${key}">
                   <div class="grid-scroll">
                      <div class="track-row">${this._genRow(1, half, percent)}</div>
                      <div class="track-row">${this._genRow(half + 1, numAlb - half, percent)}</div>
                   </div>
                   <div class="legend-bar"><div class="legend-item"><div class="legend-swatch s-have"></div>${a(s("legend_have"))}</div><div class="legend-item"><div class="legend-swatch s-dupe"></div>${a(s("legend_dupe"))}</div><div class="legend-item"><div class="legend-swatch s-gold-dot"></div>${a(s("legend_gold"))}</div></div>
                </div>
            </div>`;
            this.els.app.insertAdjacentHTML("beforeend", html);
        });
        this.hydrate();
    },
    _genRow(start, count, widthPct) {
        let h = "";
        for (let i = 0; i < count; i++) {
            h += this._genAlb(start + i, widthPct);
        }
        return h;
    },
    _genAlb(idx, widthPct) {
        let grid = "";
        for (let j = 0; j < 9; j++) {
            const uid = 9 * (idx - 1) + j;
            grid += `<div class="cell-wrap" data-uid="${uid}" data-st="0">
                <div class="i-dot i-dupe"></div><div class="i-dot i-gold"></div>
                <div class="cell-inner"><span class="t-x">X</span><span class="t-num"></span></div>
            </div>`;
        }
        return `<div class="alb-col" style="width:${widthPct}%"><div class="alb-head">${s("album")} ${idx}</div><div class="alb-grid">${grid}</div></div>`;
    },
    hydrate() {
        const goldSet = u.getGoldSet();
        const dupeSet = u.getDupesSet();
        this.els.app.querySelectorAll(".cell-wrap").forEach(el => {
            const cellId = +el.dataset.uid;
            const block = el.closest("[data-u]");
            if (!block) return;
            const uKey = block.dataset.u;
            if (!u.usr[uKey]) return;
            const stateVal = (u.usr[uKey].state && u.usr[uKey].state[cellId]) || 0;
            const numVal = (u.usr[uKey].nums && u.usr[uKey].nums[cellId]) || "";
            const isG = goldSet.has(cellId);
            const isD = dupeSet.has(cellId);
            this.updateCardVisuals(el, stateVal, numVal, isG, isD);
        });
        this.updateStats();
        this.updateVis();
    },
    updateSingleCell(uKey, cellId, updateContext) {
        const isG = u.getGoldSet().has(+cellId);
        const cState = u.usr[uKey]?.state?.[cellId] || 0;
        const cNum = u.usr[uKey]?.nums?.[cellId] || "";
        if (updateContext === 2 || cState === 2) {
            const isD = u.getDupesSet().has(+cellId);
            document.querySelectorAll(`.cell-wrap[data-uid="${cellId}"]`).forEach(el => {
                const block = el.closest("[data-u]");
                if (!block) return;
                const rKey = block.dataset.u;
                this.updateCardVisuals(el, u.usr[rKey]?.state?.[cellId] || 0, u.usr[rKey]?.nums?.[cellId] || "", isG, isD);
            });
        } else {
            const block = document.querySelector(`.glass-card[data-sec="${uKey}"] [data-u="${uKey}"]`);
            if (!block) return this.hydrate();
            const el = block.querySelector(`.cell-wrap[data-uid="${cellId}"]`);
            if (!el) return this.hydrate();
            const isD = u.getDupesSet().has(+cellId);
            this.updateCardVisuals(el, cState, cNum, isG, isD);
        }
        this.updateStats();
    },
    updateCardVisuals(el, st, num, isG, isD) {
        el.dataset.st = st;
        const span = el.querySelector(".t-num");
        const nStr = num == null ? "" : num + "";
        if (span.textContent !== nStr) span.textContent = nStr;
        if (isG) el.dataset.bg = "1";
        else delete el.dataset.bg;
        el.classList.remove("show-gold", "show-dupe");
        if (st === 0) {
            if (isG) el.classList.add("show-gold");
            if (isD) el.classList.add("show-dupe");
        }
    },
    updateStats() {
        const max = 9 * u.cfg.albums;
        const gSet = u.getGoldSet();
        this.els.app.querySelectorAll(".glass-card[data-sec]").forEach(card => {
            if (card.id === "sec-gold") return;
            const uKey = card.dataset.sec;
            const userData = u.usr[uKey];
            if (!userData) return;
            const stObj = userData.state || {};
            let count = 0, countG = 0, totalG = 0;
            for (let i = 0; i < max; i++) {
                const v = stObj[i] || 0;
                if (v > 0) count++;
                if (gSet.has(i)) {
                    totalG++;
                    if (v > 0) countG++;
                }
            }
            const pct = max > 0 ? Math.round((count / max) * 100) : 0;
            const avatar = card.querySelector(".user-avatar");
            const pTop = card.querySelector(".ua-top");
            const pBot = card.querySelector(".ua-bot");
            const pPct = card.querySelector(".ua-percent");
            if (pTop) pTop.textContent = `${count}/${max}`;
            if (pBot) pBot.textContent = `${countG}/${totalG}`;
            if (pPct) {
                pPct.textContent = pct + "%";
                pPct.style.color = pct === 100 ? "var(--gold)" : (pct >= 50 ? "#fb923c" : "#f87171");
            }
            if (avatar) {
                avatar.style.background = `conic-gradient(var(--ok) ${pct}%, var(--p) 0)`;
            }
        });
    },
    renderGoldEx() {
        const ctn = document.getElementById("gold-list");
        ctn.innerHTML = "";
        if (u.cfg.gold_ex.length > 0) {
            const h = document.createElement("div");
            h.className = "gold-row-header";
            h.innerHTML = `<span>${a(s("album"))}</span><span>${a(s("card"))}</span><span>${a(s("date"))}</span><span></span>`;
            ctn.appendChild(h);
        }
        const frag = document.createDocumentFragment();
        u.cfg.gold_ex.forEach((item, idx) => {
            const div = document.createElement("div");
            div.className = "gold-row";
            div.innerHTML = `
                <input class="g-inp" data-f="alb" maxlength="2" inputmode="numeric" placeholder="--" value="${a(item.alb || item.album || "")}">
                <input class="g-inp" data-f="card" placeholder="${a(s("card"))}" value="${a(item.card || "")}">
                <input class="g-inp" data-f="date" maxlength="5" inputmode="numeric" placeholder="JJ/MM" value="${a(item.date || "")}">
                <button style="background:0 0;border:none;color:var(--err);font-weight:700;cursor:pointer" data-action="del-gold" data-idx="${idx}">×</button>
            `;
            const albInp = div.querySelector('[data-f="alb"]');
            const cardInp = div.querySelector('[data-f="card"]');
            const dateInp = div.querySelector('[data-f="date"]');
            albInp.oninput = () => {
                albInp.value = albInp.value.replace(/\D/g, "").slice(0, 2);
                u.cfg.gold_ex[idx].alb = albInp.value;
                u.saveC();
            };
            cardInp.oninput = () => {
                u.cfg.gold_ex[idx].card = cardInp.value;
                u.saveC();
            };
            dateInp.addEventListener("keydown", ev => {
                if (ev.key === "Backspace" && dateInp.value.endsWith("/")) {
                    dateInp.value = dateInp.value.slice(0, -1);
                    ev.preventDefault();
                }
            });
            dateInp.oninput = () => {
                let raw = dateInp.value.replace(/\D/g, "");
                if (raw.length > 4) raw = raw.slice(0, 4);
                dateInp.value = raw.length > 2 ? raw.slice(0, 2) + "/" + raw.slice(2) : raw;
                u.cfg.gold_ex[idx].date = dateInp.value;
                u.saveC();
            };
            frag.appendChild(div);
        });
        ctn.appendChild(frag);
    },
    renderMenus() {
        const list = document.getElementById("view-list");
        list.innerHTML = "";
        const pList = document.getElementById("sub-print");
        pList.innerHTML = "";
        const fragV = document.createDocumentFragment();
        const fragP = document.createDocumentFragment();
        [...u.cfg.usersList, "Gold"].forEach(name => {
            const key = name === "Gold" ? "Gold" : name.replace(/\s/g, "");
            const isHidden = u.cfg.hidden.includes(key);
            const d1 = document.createElement("div");
            d1.className = "menu-item";
            d1.innerHTML = `<span>${name}</span><label style="cursor:pointer;display:flex"><input type="checkbox" ${isHidden ? "" : "checked"} style="display:none"><div class="switch"></div></label>`;
            d1.querySelector("input").onchange = e => {
                if (e.target.checked) u.cfg.hidden = u.cfg.hidden.filter(k => k !== key);
                else u.cfg.hidden = [...u.cfg.hidden, key];
                u.saveC();
                this.updateVis();
            };
            fragV.appendChild(d1);
            const d2 = document.createElement("div");
            d2.className = "menu-item";
            d2.style.cssText = "padding:5px 8px;font-size:0.8rem";
            d2.innerHTML = `<span>${name}</span><label style="cursor:pointer;display:flex;align-items:center"><input type="checkbox" class="print-chk" value="${key}" checked style="display:none"><div class="switch" style="transform:scale(0.7);transform-origin:right center"></div></label>`;
            fragP.appendChild(d2);
        });
        list.appendChild(fragV);
        const btnP = document.createElement("button");
        btnP.className = "mini-btn";
        btnP.dataset.action = "do-print";
        btnP.style.cssText = "justify-content:center;background:var(--p);color:#fff;margin-top:5px;width:100%";
        btnP.textContent = s("print_upper");
        fragP.appendChild(btnP);
        pList.appendChild(fragP);
    },
    updateVis() {
        document.getElementById("main-app").querySelectorAll(".anim-section").forEach(el => {
            el.classList.toggle("hidden", u.cfg.hidden.includes(el.dataset.sec));
        });
    },
    renderGoldGrid(id) {
        const ctn = document.getElementById(id);
        if (!ctn) return;
        ctn.innerHTML = "";
        const max = u.cfg.albums;
        const gSet = u.getGoldSet();
        const row = document.createElement("div");
        row.className = "g-conf-row";
        for (let a = 1; a <= max; a++) {
            let cells = "";
            for (let j = 0; j < 9; j++) {
                const uid = 9 * (a - 1) + j;
                cells += `<div class="g-cell ${gSet.has(uid) ? "active" : ""}" data-uid="${uid}"></div>`;
            }
            const col = document.createElement("div");
            col.className = "g-conf-col";
            col.innerHTML = `<span style="font-size:9px;font-weight:700;margin-bottom:2px">${s("album")} ${a}</span><div class="g-conf-grid">${cells}</div>`;
            row.appendChild(col);
        }
        row.onclick = e => {
            const t = e.target;
            if (t.classList.contains("g-cell")) {
                const uid = +t.dataset.uid;
                const active = t.classList.contains("active");
                u.setGold(uid, !active);
                t.classList.toggle("active");
            }
        };
        ctn.appendChild(row);
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
                g.showToast(labels[i]);
            };
            el.appendChild(btn);
        }
    }
};
const v = {
    _lastClickCell: null,
    _lastClickTime: 0,
    _popovers: null,
    _getPopovers() {
        return this._popovers || (this._popovers = document.querySelectorAll(".popover")), this._popovers;
    },
    handle(e) {
        const t = e.target;
        const btn = t.closest("[data-action]");
        const cell = t.closest(".cell-wrap");
        const card = t.closest(".glass-card");
        if (!t.closest(".popover") && !t.closest(".dock")) {
            this._getPopovers().forEach(p => p.classList.remove("show"));
        }
        if (cell && t.tagName !== "INPUT") {
            if (e.type === "dblclick") {
                e.stopPropagation();
                e.preventDefault();
                return;
            }
            const now = Date.now();
            if (v._lastClickCell === cell && now - (v._lastClickTime || 0) < 300) {
                v._lastClickCell = null;
                return;
            }
            v._lastClickCell = cell;
            v._lastClickTime = now;
            const isPrim = card && card.classList.contains("is-primary");
            const uKey = cell.closest("[data-u]")?.dataset.u;
            const uid = +cell.dataset.uid;
            if (u.cfg.mode === "number" && isPrim) {
                e.stopPropagation();
                const inner = cell.querySelector(".cell-inner");
                inner.innerHTML = "";
                const inp = document.createElement("input");
                inp.className = "cell-input";
                inp.type = "tel";
                inp.value = u.usr[uKey].nums[uid] || "";
                inp.onblur = () => {
                    const val = inp.value.trim();
                    u.updateCell(uKey, uid, val, true);
                    g.updateSingleCell(uKey, uid, -1);
                };
                inp.onkeydown = ev => {
                    if (ev.key === "Enter") inp.blur();
                };
                inner.appendChild(inp);
                setTimeout(() => { try { inp.focus(); } catch (err) {} }, 50);
                return;
            }
            const old = u.usr[uKey].state[uid] || 0;
            const nVal = (old + 1) % 3;
            i.push({ u: uKey, c: uid, v: old });
            if (i.length > 50) i.shift();
            u.updateCell(uKey, uid, nVal);
            g.updateSingleCell(uKey, uid, old);
            return;
        }
        if (card && e.type === "dblclick" && !btn && !cell) {
            if (card.classList.contains("expanded")) {
                card.classList.remove("blur-active");
                card.classList.add("blur-out");
                setTimeout(() => {
                    card.classList.remove("blur-out");
                    card.classList.add("transitioning");
                    card.classList.remove("expanded");
                    setTimeout(() => card.classList.remove("transitioning"), 420);
                }, 200);
            } else {
                card.classList.add("transitioning");
                card.classList.add("expanded");
                setTimeout(() => {
                    card.classList.remove("transitioning");
                    card.classList.add("blur-active");
                }, 420);
            }
            return;
        }
        if (!btn) return;
        e.stopPropagation();
        const action = btn.dataset.action;
        const map = {
            "toggle-menu": () => {
                const pm = document.getElementById("pop-menu"), pv = document.getElementById("pop-view");
                const wasOpen = pm.classList.contains("show");
                pv.classList.remove("show");
                wasOpen ? pm.classList.remove("show") : pm.classList.add("show");
            },
            "toggle-view": () => {
                const pm = document.getElementById("pop-menu"), pv = document.getElementById("pop-view");
                const wasOpen = pv.classList.contains("show");
                pm.classList.remove("show");
                wasOpen ? pv.classList.remove("show") : pv.classList.add("show");
            },
            "open-users": () => window.UserManager.open(),
            "close-users": () => window.UserManager.close(),
            "add-user-row": () => window.UserManager.add(),
            "save-users": () => window.UserManager.save(),
            "undo": () => {
                const last = i.pop();
                if (last) {
                    u.updateCell(last.u, last.c, last.v);
                    g.hydrate();
                    g.showToast(s("undone"));
                } else {
                    g.showToast(s("nothing_to_undo"));
                }
            },
            "mode-toggle": () => {
                u.cfg.mode = u.cfg.mode === "number" ? "cross" : "number";
                u.saveC();
                g.renderMain();
            },
            "cycle-ambiance": () => {
                if (LITE_MODE) return;
                const isSpecial = l(u.cfg.seed)() < .01;
                u.cfg.ambiance = (u.cfg.ambiance + 1) % (isSpecial ? 5 : 4);
                u.saveC();
                g.renderAmbiance();
                const labels = [s("amb_0"), s("amb_1"), s("amb_2"), s("amb_3"), s("amb_4")];
                g.showToast(labels[u.cfg.ambiance]);
            },
            "reset-u": () => {
                const key = btn.closest(".glass-card").dataset.sec;
                if (confirm(s("reset_board_q"))) {
                    u.resetUser(key);
                    g.hydrate();
                    g.showToast(s("reset_done"));
                }
            },
            "reset-all": () => {
                if (confirm(s("reset_warn1"))) {
                    let list = confirm(s("reset_warn2")) ? [...u.cfg.usersList] : [s("player") + " 1"];
                    let amb = u.cfg.ambiance;
                    i.length = 0;
                    localStorage.clear();
                    const seed = Date.now();
                    localStorage.setItem("mgo_cfg", JSON.stringify({
                        albums: 24, mode: "cross", gold_ids: [], gold_ex: [], hidden: [], printHidden: [],
                        setup_done: false, ambiance: amb, seed: seed, usersList: list
                    }));
                    location.reload();
                }
            },
            "open-gold-mod": () => {
                g.renderGoldGrid("gold-grid-ctn");
                document.getElementById("mod-gold").classList.add("open");
            },
            "close-gold": () => {
                document.getElementById("mod-gold").classList.remove("open");
                g.hydrate();
            },
            "add-gold-row": () => {
                u.cfg.gold_ex.push({ alb: "", card: "", date: "" });
                u.saveC();
                g.renderGoldEx();
            },
            "del-gold": () => {
                if (confirm(s("delete_q"))) {
                    u.cfg.gold_ex.splice(+btn.dataset.idx, 1);
                    u.saveC();
                    g.renderGoldEx();
                }
            },
            "toggle-print-sub": () => {
                const el = document.getElementById("sub-print");
                el.style.display = el.style.display === "none" ? "flex" : "none";
            },
            "do-print": () => {
                const checked = new Set(Array.from(document.querySelectorAll(".print-chk:checked")).map(el => el.value));
                document.querySelectorAll(".glass-card").forEach(c => {
                    c.classList.toggle("print-hidden", !checked.has(c.dataset.sec));
                });
                window.print();
            },
            "save-file": () => {
                const blob = new Blob([JSON.stringify({ version: o.VERSION, config: u.cfg, users: u.usr })], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Mgo_Backup_V${o.VERSION}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 5000);
                g.showToast(s("file_dl"));
            },
            "open-share": () => {
                document.getElementById("pop-menu").classList.remove("show");
                y.openModal();
            },
            "close-share": () => {
                document.getElementById("mod-share").classList.remove("open");
            },
            "copy-share-link": () => {
                const f = document.getElementById("share-url-field");
                navigator.clipboard.writeText(f.value).then(() => {
                    const b = document.getElementById("share-copy-btn");
                    const old = b.innerHTML;
                    b.innerHTML = s("share_copied");
                    b.style.background = "var(--ok)";
                    setTimeout(() => { b.innerHTML = old; b.style.background = "var(--p)"; }, 2000);
                }).catch(() => {
                    f.select();
                    document.execCommand("copy");
                    g.showToast(s("share_copied"));
                });
            },
            "load": () => {
                const inp = document.createElement("input");
                inp.type = "file"; inp.accept = ".json";
                inp.onchange = ev => {
                    const reader = new FileReader();
                    reader.onload = e => {
                        try {
                            const parsed = JSON.parse(e.target.result);
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
                                if (u.cfg.setup_done === undefined) u.cfg.setup_done = true;
                                i.length = 0;
                                u.saveC();
                                Object.keys(parsed.users).forEach(k => u.saveU(k));
                                location.reload();
                            } else {
                                alert(s("file_invalid"));
                            }
                        } catch (err) {
                            alert(s("file_err"));
                        }
                    };
                    reader.readAsText(ev.target.files[0]);
                };
                inp.click();
            }
        };
        if (map[action]) map[action]();
    }
};
const f = {
    init() {
        const inp = document.getElementById("s-alb");
        const val = document.getElementById("s-alb-val");
        g.renderGoldGrid("setup-gold-grid");
        inp.oninput = e => {
            val.textContent = e.target.value;
            u.cfg.albums = +e.target.value;
            u.saveC();
            g.renderGoldGrid("setup-gold-grid");
        };
        document.getElementById("btn-start-season").onclick = () => {
            u.cfg.setup_done = true;
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
    _pendingImport: null,
    _replaceTarget: null,
    _quickTarget: null,
    openModal() {
        this._selected = null;
        const list = document.getElementById("share-player-list");
        list.innerHTML = "";
        document.getElementById("share-link-section").style.display = "none";
        u.cfg.usersList.forEach(name => {
            const key = name.replace(/\s/g, "");
            const btn = document.createElement("button");
            btn.className = "mini-btn";
            btn.style.cssText = "width:100%;justify-content:flex-start;padding:12px 16px;font-size:0.95rem;transition:0.2s";
            btn.innerHTML = "👤 " + a(name);
            btn.onclick = () => {
                list.querySelectorAll(".mini-btn").forEach(b => {
                    b.style.background = ""; b.style.color = ""; b.style.borderColor = "";
                });
                btn.style.background = "var(--p)"; btn.style.color = "#fff"; btn.style.borderColor = "var(--p)";
                this._selected = name;
                this._generateLink(name, key);
            };
            list.appendChild(btn);
        });
        document.getElementById("mod-share").classList.add("open");
    },
    async _generateLink(name, key) {
        const dataStr = JSON.stringify({ name: name, data: u.usr[key] || { state: {}, nums: {} } });
        let param;
        try {
            const buf = new TextEncoder().encode(dataStr);
            const cs = new CompressionStream("gzip");
            const w = cs.writable.getWriter();
            w.write(buf);
            w.close();
            const compressed = await new Response(cs.readable).arrayBuffer();
            let b64 = "";
            new Uint8Array(compressed).forEach(byte => b64 += String.fromCharCode(byte));
            param = "z:" + btoa(b64);
        } catch (err) {
            param = btoa(unescape(encodeURIComponent(dataStr)));
        }
        const url = "https://kevinr99089.github.io/Mgo-Tracker/?share=" + encodeURIComponent(param);
        document.getElementById("share-url-field").value = url;
        document.getElementById("share-link-section").style.display = "flex";
    },
    async checkImport() {
        const params = new URLSearchParams(window.location.search);
        let raw = params.get('share');
        if (!raw && window.location.hash.startsWith("#share:")) {
            raw = window.location.hash.slice(7);
        }
        if (!raw) return;
        try {
            let decoded;
            if (raw.startsWith("z:")) {
                const b = atob(raw.slice(2));
                const arr = Uint8Array.from(b, c => c.charCodeAt(0));
                const ds = new DecompressionStream("gzip");
                const w = ds.writable.getWriter();
                w.write(arr);
                w.close();
                const buf = await new Response(ds.readable).arrayBuffer();
                decoded = new TextDecoder().decode(buf);
            } else {
                decoded = decodeURIComponent(escape(atob(raw)));
            }
            const parsed = JSON.parse(decoded);
            if (!parsed.name || !parsed.data) return;
            this._pendingImport = parsed;
        } catch (err) {
            console.error("Share import error", err);
            this._cleanURL();
        }
    },
    showImportIfPending() {
        const impData = this._pendingImport;
        if (!impData) return;
        document.getElementById("import-name").textContent = "👤 " + impData.name;
        const checked = Object.values(impData.data.state || {}).filter(val => val === 1).length;
        const dupes = Object.values(impData.data.state || {}).filter(val => val === 2).length;
        document.getElementById("import-stats").textContent = s("import_stats").replace("{c}", checked).replace("{d}", dupes);
        const nameMatch = u.cfg.usersList.includes(impData.name);
        let shareMem = {};
        try { shareMem = JSON.parse(localStorage.getItem("mgo_share_mem") || "{}"); } catch (err) {}
        const remembered = shareMem[impData.name];
        const rememberedValid = remembered && u.cfg.usersList.includes(remembered);
        const btnC = document.getElementById("btn-import-confirm");
        const btnR = document.getElementById("btn-import-replace");
        const btnQ = document.getElementById("btn-import-quick");
        if (nameMatch) {
            btnC.textContent = "✅ " + s("import_update") + " (" + impData.name + ")";
            btnR.style.display = "none";
            btnQ.style.display = "none";
            this._quickTarget = null;
        } else {
            btnC.textContent = "➕ " + s("import_add");
            btnR.style.display = "";
            if (rememberedValid) {
                btnQ.style.display = "";
                btnQ.textContent = "⚡ " + s("import_update") + " " + remembered;
                this._quickTarget = remembered;
            } else {
                btnQ.style.display = "none";
                this._quickTarget = null;
            }
        }
        document.getElementById("import-step-1").style.display = "flex";
        document.getElementById("import-step-2").style.display = "none";
        document.getElementById("mod-import").classList.add("open");
    },
    confirmImport() {
        const e = this._pendingImport;
        if (!e) return;
        const targetKey = e.name.replace(/\s/g, "");
        if (!u.cfg.usersList.includes(e.name)) {
            u.cfg.usersList.push(e.name);
            u.saveC();
        }
        u.usr[targetKey] = { state: {}, nums: {}, ...e.data };
        u.saveU(targetKey);
        this._pendingImport = null;
        this._replaceTarget = null;
        this._closeImportModal();
        g.showToast("✅ " + e.name + " " + s("imported"));
        setTimeout(() => location.reload(), 900);
    },
    _cleanURL() {
        const url = new URL(window.location);
        let changed = false;
        if (url.searchParams.has('share')) {
            url.searchParams.delete('share');
            changed = true;
        }
        if (url.hash.startsWith('#share:')) {
            url.hash = '';
            changed = true;
        }
        if (changed) {
            history.replaceState(null, "", url.toString());
        }
    },
    _closeImportModal() {
        this._cleanURL();
        document.getElementById("mod-import").classList.remove("open");
        document.getElementById("import-step-1").style.display = "flex";
        document.getElementById("import-step-2").style.display = "none";
    },
    openReplaceStep() {
        const list = document.getElementById("import-player-select");
        list.innerHTML = "";
        this._replaceTarget = null;
        document.getElementById("btn-import-replace-confirm").disabled = true;
        u.cfg.usersList.forEach(name => {
            const btn = document.createElement("button");
            btn.className = "mini-btn";
            btn.style.cssText = "width:100%;justify-content:flex-start;padding:10px 14px;font-size:0.9rem;transition:0.2s";
            btn.textContent = "👤 " + name;
            btn.onclick = () => {
                list.querySelectorAll(".mini-btn").forEach(b => {
                    b.style.background = ""; b.style.borderColor = ""; b.style.color = "";
                });
                btn.style.background = "var(--p)"; btn.style.borderColor = "var(--p)"; btn.style.color = "#fff";
                this._replaceTarget = name;
                document.getElementById("btn-import-replace-confirm").disabled = false;
            };
            list.appendChild(btn);
        });
        document.getElementById("import-step-1").style.display = "none";
        document.getElementById("import-step-2").style.display = "flex";
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
        try { shareMemR = JSON.parse(localStorage.getItem("mgo_share_mem") || "{}"); } catch (err) {}
        shareMemR[e.name] = replaced;
        localStorage.setItem("mgo_share_mem", JSON.stringify(shareMemR));
        this._pendingImport = null;
        this._replaceTarget = null;
        this._closeImportModal();
        g.showToast("✅ " + s("data_replaced").replace("{name}", replaced));
        setTimeout(() => location.reload(), 900);
    },
    confirmQuickUpdate() {
        const e = this._pendingImport;
        if (!e || !this._quickTarget) return;
        const targetKey = this._quickTarget.replace(/\s/g, "");
        u.usr[targetKey] = { state: {}, nums: {}, ...e.data };
        u.saveU(targetKey);
        const targetName = this._quickTarget;
        this._pendingImport = null;
        this._quickTarget = null;
        this._closeImportModal();
        g.showToast("✅ " + targetName + " " + s("updated"));
        setTimeout(() => location.reload(), 900);
    }
};
function __initApp() {
    u.init();
    y.checkImport();
    document.getElementById("btn-import-confirm").onclick = () => y.confirmImport();
    document.getElementById("btn-import-quick").onclick = () => y.confirmQuickUpdate();
    document.getElementById("btn-import-replace").onclick = () => y.openReplaceStep();
    document.getElementById("btn-import-replace-back").onclick = () => {
        document.getElementById("import-step-1").style.display = "flex";
        document.getElementById("import-step-2").style.display = "none";
        y._replaceTarget = null;
    };
    document.getElementById("btn-import-replace-confirm").onclick = () => y.confirmReplace();
    document.getElementById("btn-import-cancel").onclick = () => {
        y._pendingImport = null;
        y._replaceTarget = null;
        y._closeImportModal();
    };
    const albSlider = document.getElementById("sl-alb");
    let albTimer;
    albSlider.value = u.cfg.albums;
    document.getElementById("lbl-alb").textContent = u.cfg.albums;
    albSlider.oninput = e => {
        document.getElementById("lbl-alb").textContent = e.target.value;
        clearTimeout(albTimer);
        albTimer = setTimeout(() => {
            u.cfg.albums = +e.target.value;
            u.invalidateGold();
            u.saveC();
            g.renderMain();
        }, 300);
    };
    g.renderMain();
    g.renderGoldEx();
    g.renderMenus();
    if (!LITE_MODE) {
        const isCheat = d(u.cfg);
        if (isCheat) u.saveC();
        g.renderAmbianceSelector();
        if (isCheat) {
            setTimeout(() => g.showToast(s(isCheat)), 500);
        } else if (u.cfg.ambiance === 4) {
            g.showToast(s("shiny_season"));
        }
    }
    const clickHandler = v.handle.bind(v);
    let noteTimer;
    document.body.addEventListener("click", clickHandler);
    document.body.addEventListener("dblclick", clickHandler);
    document.body.addEventListener("input", e => {
        if (e.target.classList.contains("user-note")) {
            const uid = e.target.dataset.uid;
            if (u.usr[uid]) {
                const val = e.target.value;
                if (val) u.usr[uid].note = val;
                else delete u.usr[uid].note;
                clearTimeout(noteTimer);
                noteTimer = setTimeout(() => u.saveU(uid), 400);
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
            g.renderAmbiance();
            requestAnimationFrame(() => requestAnimationFrame(() => {
                __bg.style.opacity = "1";
            }));
            __sp.style.transition = "opacity 0.4s ease, visibility 0.4s ease";
            __sp.style.opacity = "0";
            __sp.style.visibility = "hidden";
            __sp.style.pointerEvents = "none";
            const sections = [...document.querySelectorAll(".anim-section")];
            const visible = sections.filter(el => !el.classList.contains("hidden"));
            sections.forEach(el => {
                el.style.opacity = "0";
                el.style.transform = "translateY(22px)";
                el.style.transition = "none";
            });
            const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
            visible.forEach((el, idx) => {
                setTimeout(() => {
                    el.style.transition = `opacity 480ms ${ease}, transform 480ms ${ease}`;
                    el.style.opacity = "1";
                    el.style.transform = "translateY(0)";
                }, 85 * idx);
            });
            setTimeout(() => {
                sections.forEach(el => {
                    el.style.removeProperty("opacity");
                    el.style.removeProperty("transform");
                    el.style.removeProperty("transition");
                });
                __sp.remove();
                if (!u.cfg.setup_done) document.getElementById("setup-mod").classList.add("open");
                y.showImportIfPending();
            }, 85 * visible.length + 480 + 100);
        }, 900);
    }
}
document.addEventListener("DOMContentLoaded", async () => {
    LITE_MODE = document.documentElement.className === "lite-mode";
    try {
        const langFile = t === 'fr' ? 'french.txt' : 'english.txt';
        const res = await fetch(langFile);
        if(res.ok) {
            e[t] = await res.json();
        } else {
            console.warn(`Could not load ${langFile}. Ensure files are hosted or CORS is allowed.`);
        }
    } catch(err) {
        console.warn("Fetch failed, you may be running locally without a server.", err);
    }
    r();
    const __sv = localStorage.getItem(__MGO_PREF);
    if (!__sv) {
        document.getElementById("__hub").style.display = "flex";
        return;
    }
    __initApp();
});