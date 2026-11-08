// ultradoinkGame.js
// ULTRADO!NK: a big grid with hidden special cells (traps, optionally a Golden Circle) and a countdown life bar.
//
// Everything about a game comes from a config file (default js/games/ultradoink.config.json).
// Load another one with ?config=path/to/file.json, or loadGame('ultradoink', { config: "..." }).
// Replay a specific deal with ?seed=12345.
//
// Config shape (see ultradoink.config.json):
//   rules.grid       { cols, rows, mask? }   mask = one string per row, "O" = cell, "." = no cell
//   rules.cellTypes  { name: { enabled?, count, placement: { algorithm, ... }, stayVisible?, onTap: [effects], otherwise? } }
//                    Cells that aren't a special type are greens. otherwise: "green" means the cell
//                    acts as a green when none of its onTap effects fire.
//   rules.clock      { seconds, startsOn: "firstTap" | "load", penalty: { type: "zone", zones } | { type: "seconds", amount } | { type: "none" } }
//   rules.timing     { tapPauseMs, trapPauseMs }
//   rules.win        { condition: "allGreens" }
//
// New behaviours are added by registering a name in placements / effects / greenModes / penalties / winConditions below.

const ultradoinkGame = {
  name: "ULTRADO!NK",
  defaultConfig: "js/games/ultradoink.config.json",
  customKey: "ultradoink_custom_config",
  rules: null,
  configUrl: null,
  state: null,
  raf: null,

  // ---- Registries: add a name here to give the config a new option ----

  // Each returns `count` cell indexes chosen from `free` (cells that exist and aren't taken yet).
  placements: {
    random(free, count, rng) {
      const pool = free.slice(), out = [];
      while (out.length < count && pool.length) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
      return out;
    },
  },

  // Each runs when a special cell is tapped. Return true if the effect "fired".
  // ctx: { game, i, type, opts, after(fn) }; after() queues work for when the trap pause ends.
  effects: {
    penalty(ctx) {
      ctx.game.applyPenalty();
      return true;
    },
    greens(ctx) {
      const mode = ctx.opts.mode || "reset";
      const fn = ctx.game.greenModes[mode];
      if (!fn) { console.warn(`Unknown greens mode "${mode}"`); return true; }
      ctx.after(() => fn.call(ctx.game));
      return true;
    },
    win(ctx) {
      if (ctx.opts.if === "firstTap" && ctx.game.state.taps !== 1) return false;
      ctx.game.endGame(true, ctx.type);
      return true;
    },
  },

  // What happens to the greens on the board after a trap.
  greenModes: {
    reset() {
      const s = this.state;
      s.green.forEach((i) => this.cell(i).classList.remove("is-green", "is-set"));
      s.green.clear();
      this.updateFound();
    },
    lockIn() {
      this.state.green.forEach((i) => this.cell(i).classList.add("is-set"));
    },
  },

  penalties: {
    zone() {
      // drop to the top of the next zone down; already in the last zone: no extra loss
      const s = this.state, k = this.zoneIndex();
      if (k > 1) s.clock = Math.min(s.clock, (k - 1) * this.zoneSize());
    },
    seconds(p) { this.state.clock -= Number(p.amount) || 0; },
    none() {},
  },

  winConditions: {
    allGreens() { return this.state.green.size === this.greenCount(); },
  },

  // ---- Setup ----

  init(args = {}) {
    const q = new URLSearchParams(window.location.search);
    const url = args.config || q.get("config") || this.defaultConfig;
    if (!this.rules || url !== this.configUrl) {
      const api = (typeof CONFIG !== "undefined" ? CONFIG.API_URL : "https://app.playdoink.com") + "/api/game-configs";
      const getJson = (u) => fetch(u, { cache: "no-store" })
        .then((r) => { if (!r.ok) throw new Error(r.status + " " + u); return r.json(); });
      let load;
      if (url === "custom") {
        // the config the config tool (ultradoink-config.html) saved in this browser
        load = Promise.resolve().then(() => {
          const saved = localStorage.getItem(this.customKey);
          if (!saved) throw new Error("no custom config saved in this browser");
          return JSON.parse(saved);
        });
      } else if (url.startsWith("saved:")) {
        // a game saved in the Do!nk database
        load = getJson(api + "/" + encodeURIComponent(url.slice(6)));
      } else if (url === this.defaultConfig && !args.config && !q.get("config")) {
        // the public game: play whatever config is live in the database, else the default file
        load = getJson(api + "/live?game=ultradoink").catch(() => getJson(url));
      } else {
        load = getJson(url);
      }
      load
        .then((json) => { this.rules = json.rules || json; this.configUrl = url; this.init(args); })
        .catch((e) => this.showError("Couldn't load game config: " + e.message));
      return;
    }

    const r = this.rules;
    const cols = r.grid.cols, rows = r.grid.rows;
    const exists = this.readMask(cols, rows, r.grid.mask);

    const seed = args.seed ?? (q.has("seed") ? parseInt(q.get("seed"), 10) : Math.floor(Math.random() * 1e9));
    const rng = this.rng(seed);

    // Deal the special cells, in the order the config lists them.
    const kind = exists.map((ok) => (ok ? "green" : null));   // null = no cell, "green", or a cellType name
    const board = {};
    for (const [name, t] of Object.entries(r.cellTypes || {})) {
      if (t.enabled === false) continue;
      const free = kind.map((k, i) => (k === "green" ? i : -1)).filter((i) => i >= 0);
      const algo = (t.placement && t.placement.algorithm) || "random";
      if (!this.placements[algo]) return this.showError(`Unknown placement "${algo}" for ${name}`);
      const cells = this.placements[algo].call(this, free, t.count, rng, t.placement || {}, { cols, rows, exists });
      cells.forEach((i) => { kind[i] = name; });
      board[name] = cells;
    }

    cancelAnimationFrame(this.raf);
    this.state = {
      seed, board, kind,
      hit: new Set(),        // special cells that went off and are showing
      green: new Set(),      // greens lit right now
      clock: r.clock.seconds,
      started: false,
      lastTick: 0,
      locked: false,
      over: false,
      trapHits: 0,
      taps: 0,
    };
    this.renderUI();
    this.drawClock();
    if (r.clock.startsOn === "load") this.start();
  },

  readMask(cols, rows, mask) {
    const out = [];
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++)
        out.push(!mask || (mask[y] || "").charAt(x).toUpperCase() === "O");
    return out;
  },

  // Small seeded random number generator (mulberry32) so a deal can be replayed from its seed.
  rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  greenCount() {
    const types = this.rules.cellTypes || {};
    return this.state.kind.filter((k) => k === "green" || (k && types[k] && types[k].otherwise === "green")).length;
  },
  zoneCount() { const p = this.rules.clock.penalty || {}; return p.type === "zone" ? (p.zones || 3) : 3; },
  zoneSize() { return this.rules.clock.seconds / this.zoneCount(); },
  zoneIndex() { return Math.max(1, Math.ceil(this.state.clock / this.zoneSize() - 1e-9)); },

  showError(msg) {
    this.root().innerHTML = `<div class="ud-hint" style="opacity:1;color:#af1620">${msg}</div>`;
  },

  root() {
    let root = document.getElementById("ultradoink");
    if (!root) {
      root = document.createElement("div");
      root.id = "ultradoink";
      (document.getElementById("game-console") || document.body).appendChild(root);
    }
    return root;
  },

  renderUI() {
    const root = this.root();
    const r = this.rules, s = this.state;
    const best = this.bestTime();
    root.classList.remove("is-locked", "is-hit");
    root.innerHTML = `
      <div class="md-head">
        <div class="md-title">${this.name.replace(/^(MEGA|ULTRA)/, '<span class="md-prefix">$1</span>')}</div>
        <div class="md-score"><span id="ud-found">0</span> / ${this.greenCount()}
          <span class="md-best">best <span id="ud-best">${best ? best.toFixed(1) + "s" : "-"}</span></span></div>
      </div>
      <div class="ud-board">
        <div class="md-grid" style="grid-template-columns: repeat(${r.grid.cols}, minmax(0, 1fr))">
          ${s.kind.map((k, i) => k === null
            ? `<span class="md-cell is-void" aria-hidden="true"></span>`
            : `<button class="md-cell" data-i="${i}" aria-label="button ${i + 1}"></button>`).join("")}
        </div>
        <div class="ud-life" aria-label="time left">
          <div class="ud-life-zones">${"<i></i>".repeat(this.zoneCount())}</div>
          <div class="ud-life-fill" id="ud-fill"></div>
          <div class="ud-life-text" id="ud-clock"></div>
        </div>
      </div>
      <div class="ud-hint" id="ud-hint">Clock starts on your first tap.</div>
      <div class="md-result" id="ud-result" hidden>
        <div id="ud-result-text"></div>
        <button id="ud-again">Play again</button>
      </div>`;

    root.querySelectorAll("button.md-cell").forEach((el) =>
      el.addEventListener("click", () => this.action(el)));
    root.querySelector("#ud-again").addEventListener("click", () => this.init());
  },

  cell(i) { return document.querySelector(`#ultradoink .md-cell[data-i="${i}"]`); },
  updateFound() { document.getElementById("ud-found").textContent = this.state.green.size; },

  // ---- Play ----

  action(el) {
    const s = this.state;
    const i = parseInt(el.dataset.i, 10);
    if (s.locked || s.over || s.green.has(i) || s.hit.has(i)) return;
    if (!s.started) this.start();
    s.taps++;
    const k = s.kind[i];
    return k === "green" ? this.tapGreen(i) : this.tapSpecial(i, k);
  },

  tapGreen(i) {
    const s = this.state;
    this.cell(i).classList.add("is-green");
    s.green.add(i);
    this.updateFound();
    this.play("doink");
    if (this.isWon()) return this.endGame(true);
    this.lock(this.rules.timing.tapPauseMs);
  },

  tapSpecial(i, name) {
    const s = this.state, t = this.rules.cellTypes[name];
    const queued = [];
    const ctx = { game: this, i, type: name, opts: {}, after: (fn) => queued.push(fn) };

    let fired = false;
    for (const eff of t.onTap || []) {
      if (!this.effects[eff.do]) { console.warn(`Unknown effect "${eff.do}"`); continue; }
      ctx.opts = eff;
      if (this.effects[eff.do](ctx)) fired = true;
      if (s.over) return;
    }
    if (!fired && t.otherwise === "green") return this.tapGreen(i);

    // The cell went off: show it, then (after the pause) hide it again unless it stays visible.
    s.trapHits++;
    s.hit.add(i);
    const el = this.cell(i);
    el.classList.add("is-" + name);
    this.play("sproing");
    this.drawClock();
    if (s.clock <= 0) return this.endGame(false);

    const root = this.root();
    root.classList.add("is-hit");
    this.lock(this.rules.timing.trapPauseMs, () => {
      root.classList.remove("is-hit");
      if (!t.stayVisible) { el.classList.remove("is-" + name); s.hit.delete(i); }
      queued.forEach((fn) => fn());
    });
  },

  applyPenalty() {
    const p = this.rules.clock.penalty || { type: "none" };
    const fn = this.penalties[p.type];
    if (!fn) return console.warn(`Unknown penalty "${p.type}"`);
    fn.call(this, p);
  },

  isWon() {
    const c = (this.rules.win && this.rules.win.condition) || "allGreens";
    return this.winConditions[c].call(this);
  },

  // Stop the current game without a result (used by the Config button).
  abort() {
    const s = this.state;
    if (!s) return;
    s.over = true;
    s.locked = true;
    cancelAnimationFrame(this.raf);
  },

  lock(ms, then) {
    const root = this.root();
    this.state.locked = true;
    root.classList.add("is-locked");
    setTimeout(() => {
      if (then) then();
      if (this.state.over) return;
      this.state.locked = false;
      root.classList.remove("is-locked");
    }, ms);
  },

  start() {
    this.state.started = true;
    this.state.lastTick = performance.now();
    document.getElementById("ud-hint").style.visibility = "hidden";
    const tick = (now) => {
      const s = this.state;
      if (s.over) return;
      s.clock -= (now - s.lastTick) / 1000;
      s.lastTick = now;
      if (s.clock <= 0) { s.clock = 0; this.drawClock(); return this.endGame(false); }
      this.drawClock();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  },

  drawClock() {
    const s = this.state, t = this.rules.clock.seconds;
    const fill = document.getElementById("ud-fill");
    if (!fill) return;
    fill.style.height = Math.max(0, (s.clock / t) * 100) + "%";
    const k = this.zoneIndex(), n = this.zoneCount();
    fill.dataset.zone = k === 1 ? "red" : k === n ? "green" : "yellow";
    document.getElementById("ud-clock").textContent = Math.ceil(Math.max(0, s.clock));
  },

  bestTime() {
    try { return parseFloat(localStorage.getItem(this.storageKey())) || 0; } catch (e) { return 0; }
  },

  // Best times are kept per rule set, so different configs don't share a record.
  storageKey() {
    const str = JSON.stringify(this.rules);
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return "ultradoink_best_" + (h >>> 0).toString(36);
  },

  endGame(won, how) {
    const s = this.state;
    s.over = true;
    s.locked = true;
    cancelAnimationFrame(this.raf);

    Object.entries(s.board).forEach(([name, cells]) =>
      cells.forEach((i) => { if (!s.green.has(i)) this.cell(i).classList.add("is-" + name); }));
    document.querySelectorAll("#ultradoink button.md-cell")
      .forEach((el) => { if (el.classList.length === 1) el.classList.add("is-dim"); });

    let text;
    if (won && how === "golden") {
      this.play("highscore");
      text = "GOLDEN CIRCLE! Instant win.";
    } else if (won) {
      const used = this.rules.clock.seconds - s.clock;
      const best = this.bestTime();
      const newBest = !best || used < best;
      if (newBest) {
        try { localStorage.setItem(this.storageKey(), String(used)); } catch (e) {}
        document.getElementById("ud-best").textContent = used.toFixed(1) + "s";
      }
      this.play("highscore");
      text = `ULTRADOINK! Cleared with ${s.clock.toFixed(1)}s left.${newBest ? " New best!" : ""}`;
    } else {
      text = `Time's up. ${s.green.size} of ${this.greenCount()} on the board, ${s.trapHits} red${s.trapHits === 1 ? "" : "s"} hit.`;
    }
    document.getElementById("ud-result-text").textContent = text;
    setTimeout(() => { document.getElementById("ud-result").hidden = false; }, 400);
  },

  play(name) {
    if (typeof sounds === "undefined" || !sounds[name]) return;
    try { sounds[name].currentTime = 0; const p = sounds[name].play(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
  },
};

// Register this game type
if (typeof gameTypes !== "undefined") gameTypes.ultradoink = ultradoinkGame;
