// megadoinkGame.js
// MEGADOINK: a grid of buttons with hidden red(s). Tap greens until you hit a red.
// Score = greens found before the red. Pure luck: with one red, every tap order has the same odds.
//
// Config (all optional, via loadGame('megadoink', {...}) or URL ?cols=&rows=&reds=):
//   cols  (default 3), rows (default 4), reds (default 1), lockMs (default 250: pause after each tap)
//
// The game draws its own grid into #megadoink (created if missing), so it doesn't
// touch the classic two-button console or the global .svgbutton handlers.

const megadoinkGame = {
  name: "MEGADOINK",
  config: { cols: 3, rows: 4, reds: 1, lockMs: 250 },
  state: { reds: new Set(), found: 0, locked: false, over: false, best: 0 },

  init(args = {}) {
    const q = new URLSearchParams(window.location.search);
    const num = (k) => (q.has(k) ? parseInt(q.get(k), 10) : undefined);
    const pick = (k) => args[k] ?? num(k) ?? this.config[k];
    this.config = {
      cols: pick("cols"),
      rows: pick("rows"),
      reds: Math.max(1, Math.min(pick("reds"), pick("cols") * pick("rows") - 1)),
      lockMs: pick("lockMs"),
    };

    const cells = this.config.cols * this.config.rows;
    this.state.reds = new Set();
    while (this.state.reds.size < this.config.reds) {
      this.state.reds.add(Math.floor(Math.random() * cells));
    }
    this.state.found = 0;
    this.state.locked = false;
    this.state.over = false;
    this.state.best = parseInt(this.storage("get") || "0", 10);

    this.renderUI();
  },

  storageKey() {
    const c = this.config;
    return `megadoink_best_${c.cols}x${c.rows}_${c.reds}`;
  },

  storage(op, value) {
    try {
      if (op === "get") return localStorage.getItem(this.storageKey());
      localStorage.setItem(this.storageKey(), value);
    } catch (e) { return null; }
  },

  greens() {
    return this.config.cols * this.config.rows - this.config.reds;
  },

  renderUI() {
    let root = document.getElementById("megadoink");
    if (!root) {
      root = document.createElement("div");
      root.id = "megadoink";
      (document.getElementById("game-console") || document.body).appendChild(root);
    }
    const c = this.config;
    root.innerHTML = `
      <div class="md-head">
        <div class="md-title">${this.name}</div>
        <div class="md-score"><span id="md-found">0</span> / ${this.greens()}
          <span class="md-best">best <span id="md-best">${this.state.best}</span></span></div>
      </div>
      <div class="md-grid" style="grid-template-columns: repeat(${c.cols}, 1fr)">
        ${Array.from({ length: c.cols * c.rows }, (_, i) =>
          `<button class="md-cell" data-i="${i}" aria-label="button ${i + 1}"></button>`).join("")}
      </div>
      <div class="md-result" id="md-result" hidden>
        <div id="md-result-text"></div>
        <button id="md-again">Play again</button>
      </div>`;

    root.querySelectorAll(".md-cell").forEach((el) =>
      el.addEventListener("click", () => this.action(el)));
    root.querySelector("#md-again").addEventListener("click", () => this.init(c));
  },

  // checkPick() in gameEngine forwards here too
  action(el) {
    if (this.state.locked || this.state.over || el.classList.contains("is-green")) return;
    const i = parseInt(el.dataset.i, 10);

    if (this.state.reds.has(i)) {
      el.classList.add("is-red");
      this.play("sproing");
      this.endGame(false);
      return;
    }

    el.classList.add("is-green");
    this.state.found++;
    document.getElementById("md-found").textContent = this.state.found;
    this.play("doink");

    if (this.state.found === this.greens()) {
      this.endGame(true);
      return;
    }

    // short beat after each tap, like Classic waiting on the DO!NK
    this.state.locked = true;
    document.getElementById("megadoink").classList.add("is-locked");
    setTimeout(() => {
      this.state.locked = false;
      document.getElementById("megadoink").classList.remove("is-locked");
    }, this.config.lockMs);
  },

  endGame(cleared) {
    this.state.over = true;
    const root = document.getElementById("megadoink");
    // reveal the remaining reds
    this.state.reds.forEach((i) => root.querySelector(`.md-cell[data-i="${i}"]`).classList.add("is-red"));
    root.querySelectorAll(".md-cell:not(.is-green):not(.is-red)").forEach((el) => el.classList.add("is-dim"));

    const newBest = this.state.found > this.state.best;
    if (newBest) {
      this.state.best = this.state.found;
      this.storage("set", String(this.state.best));
      document.getElementById("md-best").textContent = this.state.best;
    }
    if (cleared) this.play("highscore");

    const text = cleared
      ? `MEGADOINK! You cleared all ${this.greens()}.`
      : `You got ${this.state.found}.${newBest ? " New best!" : ""}`;
    document.getElementById("md-result-text").textContent = text;
    setTimeout(() => { document.getElementById("md-result").hidden = false; }, 400);
    // Not wired to the leaderboard or tracking yet: those are Classic-only for now.
  },

  play(name) {
    if (typeof sounds === "undefined" || !sounds[name]) return;
    try { sounds[name].currentTime = 0; const p = sounds[name].play(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
  },
};

// Register this game type
if (typeof gameTypes !== "undefined") gameTypes.megadoink = megadoinkGame;
