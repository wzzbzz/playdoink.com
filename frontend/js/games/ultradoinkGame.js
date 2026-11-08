// ultradoinkGame.js
// ULTRADOINK: a big grid, several hidden reds, and a countdown life bar.
// Hit a red: the board clears (reds stay where they are) and the clock takes a penalty.
// Win by turning every green before time runs out. You re-tap greens from memory, in any order.
//
// Config (via loadGame('ultradoink', {...}) or URL params):
//   cols 5, rows 6, reds 3, time 45 (seconds), lockMs 400 (pause after each tap),
//   penalty "zones" (clock is 3 zones; a red drops you to the top of the next zone down)
//           or a number of seconds to subtract, e.g. ?penalty=5
//   showReds 0 (1 = reds you've hit stay visible after the board clears)
// The clock starts on your first tap.

const ultradoinkGame = {
  name: "ULTRADO!NK",
  defaults: { cols: 5, rows: 6, reds: 3, time: 45, lockMs: 400, penalty: "zones", showReds: 0 },
  config: null,
  state: null,
  raf: null,

  init(args = {}) {
    const q = new URLSearchParams(window.location.search);
    const get = (k) => {
      if (args[k] !== undefined) return args[k];
      if (!q.has(k)) return this.defaults[k];
      const v = q.get(k);
      return isNaN(parseFloat(v)) ? v : parseFloat(v);
    };
    const cols = get("cols"), rows = get("rows");
    this.config = {
      cols, rows,
      reds: Math.max(1, Math.min(get("reds"), cols * rows - 1)),
      time: get("time"),
      lockMs: get("lockMs"),
      penalty: get("penalty"),
      showReds: !!get("showReds"),
    };

    const cells = cols * rows;
    const reds = new Set();
    while (reds.size < this.config.reds) reds.add(Math.floor(Math.random() * cells));

    cancelAnimationFrame(this.raf);
    this.state = {
      reds,
      hitReds: new Set(),
      green: new Set(),      // greens lit in the current run
      clock: this.config.time,
      started: false,
      lastTick: 0,
      locked: false,
      over: false,
      redHits: 0,
      taps: 0,
    };
    this.renderUI();
    this.drawClock();
  },

  greens() { return this.config.cols * this.config.rows - this.config.reds; },
  zone() { return this.config.time / 3; },

  renderUI() {
    let root = document.getElementById("ultradoink");
    if (!root) {
      root = document.createElement("div");
      root.id = "ultradoink";
      (document.getElementById("game-console") || document.body).appendChild(root);
    }
    const c = this.config;
    const best = this.bestTime();
    root.innerHTML = `
      <div class="md-head">
        <div class="md-title">${this.name.replace(/^(MEGA|ULTRA)/, '<span class="md-prefix">$1</span>')}</div>
        <div class="md-score"><span id="ud-found">0</span> / ${this.greens()}
          <span class="md-best">best <span id="ud-best">${best ? best.toFixed(1) + "s" : "-"}</span></span></div>
      </div>
      <div class="ud-board">
        <div class="md-grid" style="grid-template-columns: repeat(${c.cols}, 1fr)">
          ${Array.from({ length: c.cols * c.rows }, (_, i) =>
            `<button class="md-cell" data-i="${i}" aria-label="button ${i + 1}"></button>`).join("")}
        </div>
        <div class="ud-life" aria-label="time left">
          <div class="ud-life-zones"><i></i><i></i><i></i></div>
          <div class="ud-life-fill" id="ud-fill"></div>
          <div class="ud-life-text" id="ud-clock"></div>
        </div>
      </div>
      <div class="ud-hint" id="ud-hint">Clock starts on your first tap.</div>
      <div class="md-result" id="ud-result" hidden>
        <div id="ud-result-text"></div>
        <button id="ud-again">Play again</button>
      </div>`;

    root.querySelectorAll(".md-cell").forEach((el) =>
      el.addEventListener("click", () => this.action(el)));
    root.querySelector("#ud-again").addEventListener("click", () => this.init(this.config));
  },

  cell(i) { return document.querySelector(`#ultradoink .md-cell[data-i="${i}"]`); },

  action(el) {
    const s = this.state;
    if (s.locked || s.over || el.classList.contains("is-green")) return;
    if (el.classList.contains("is-red") && this.config.showReds) return;
    if (!s.started) this.start();
    s.taps++;
    const i = parseInt(el.dataset.i, 10);

    if (s.reds.has(i)) return this.hitRed(el, i);

    el.classList.add("is-green");
    s.green.add(i);
    document.getElementById("ud-found").textContent = s.green.size;
    this.play("doink");

    if (s.green.size === this.greens()) return this.endGame(true);
    this.lock(this.config.lockMs);
  },

  hitRed(el, i) {
    const s = this.state;
    s.redHits++;
    s.hitReds.add(i);
    el.classList.add("is-red");
    this.play("sproing");

    // penalty
    if (this.config.penalty === "zones") {
      const z = this.zone();
      if (s.clock > 2 * z) s.clock = 2 * z;
      else if (s.clock > z) s.clock = z;
      // already in the red zone: no extra loss
    } else {
      s.clock -= Number(this.config.penalty) || 0;
    }
    this.drawClock();
    if (s.clock <= 0) return this.endGame(false);

    // flash, then clear the board
    document.getElementById("ultradoink").classList.add("is-hit");
    this.lock(700, () => {
      document.getElementById("ultradoink").classList.remove("is-hit");
      document.querySelectorAll("#ultradoink .md-cell").forEach((c) => {
        c.classList.remove("is-green");
        if (!(this.config.showReds && s.hitReds.has(parseInt(c.dataset.i, 10)))) c.classList.remove("is-red");
      });
      s.green.clear();
      document.getElementById("ud-found").textContent = 0;
    });
  },

  lock(ms, then) {
    const root = document.getElementById("ultradoink");
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
    const s = this.state, t = this.config.time, z = this.zone();
    const fill = document.getElementById("ud-fill");
    if (!fill) return;
    fill.style.height = Math.max(0, (s.clock / t) * 100) + "%";
    fill.dataset.zone = s.clock > 2 * z ? "green" : s.clock > z ? "yellow" : "red";
    document.getElementById("ud-clock").textContent = Math.ceil(Math.max(0, s.clock));
  },

  bestTime() {
    try { return parseFloat(localStorage.getItem(this.storageKey())) || 0; } catch (e) { return 0; }
  },

  storageKey() {
    const c = this.config;
    return `ultradoink_best_${c.cols}x${c.rows}_${c.reds}_${c.time}_${c.penalty}_${c.lockMs}`;
  },

  endGame(won) {
    const s = this.state;
    s.over = true;
    s.locked = true;
    cancelAnimationFrame(this.raf);

    s.reds.forEach((i) => this.cell(i).classList.add("is-red"));
    document.querySelectorAll("#ultradoink .md-cell:not(.is-green):not(.is-red)")
      .forEach((el) => el.classList.add("is-dim"));

    let text;
    if (won) {
      const used = this.config.time - s.clock;
      const best = this.bestTime();
      const newBest = !best || used < best;
      if (newBest) {
        try { localStorage.setItem(this.storageKey(), String(used)); } catch (e) {}
        document.getElementById("ud-best").textContent = used.toFixed(1) + "s";
      }
      this.play("highscore");
      text = `ULTRADOINK! Cleared with ${s.clock.toFixed(1)}s left.${newBest ? " New best!" : ""}`;
    } else {
      text = `Time's up. ${s.green.size} of ${this.greens()} on the board, ${s.redHits} red${s.redHits === 1 ? "" : "s"} hit.`;
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
