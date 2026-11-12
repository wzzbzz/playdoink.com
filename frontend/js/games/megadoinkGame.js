// megadoinkGame.js
// MEGADOINK: a grid of buttons with hidden red(s), and optionally a Golden Circle. Tap greens until you hit a red.
// Score: each green is worth rules.greenPoints (default 1); the Golden Circle scores by its scoring algorithm.
//
// The rules come from a config file (default js/games/megadoink.config.json), same shape as
// ultradoink.config.json: rules.grid { cols, rows }, rules.cellTypes { trap, golden }, rules.timing { tapPauseMs }.
// Load another one with ?config=path/to/file.json, or loadGame('megadoink', { config: "..." }).
// Replay a specific deal with ?seed=12345 (with rounds on, the same seed replays the same sequence of boards).
//
// These still work as overrides on top of the config (loadGame args win over URL params):
//   cols, rows, reds (trap count), lockMs (tapPauseMs), golden (0 turns the Golden Circle off),
//   goldens (how many Golden Circles), streak (countBy: "rounds" or "taps"),
//   rounds (0 = single board, the old game), progression (a name in progressions below), every, maxTraps
//
// Rounds: rules.rounds { enabled, onClear: "nextRound", progression: { algorithm, ... } }. Clearing a board
// deals a new one and the score carries over; a trap ends the run. Best is the run's total score.
// progression is a name in progressions below:
//   "same":    every round has the same rules, freshly dealt.
//   "addTrap": +1 trap every `every` rounds (default 1), up to `max` traps.
// Whatever the progression says, traps are capped at MAX_TRAP_SHARE of the board (see trapCap()).
//
// Streaks: a cell type with points can have streak: { countBy, bonus: [..] }. When the streak reaches n,
// bonus[n-1] extra points are awarded; past the end of the list the last value repeats. countBy is a
// name in streakCounters below:
//   "rounds": grows when the cell is found on back-to-back rounds, resets on a round where it isn't.
//             The streak lives in this.carry, which init() keeps when called with { keepStreak: true }
//             (for bonus rounds); a fresh game starts it again at 0.
//   "taps":   grows on taps of that cell type with no other tap in between.
//
// Golden Circle scoring: cellTypes.golden.scoring.algorithm is a name in goldScoring below
// (override with ?scoring=streak|tiers):
//   "streak": the gold is a green plus `points`, plus streak bonuses (see Streaks above). The old scoring.
//   "tiers":  Craig's scoring (Nov 9, 2026). base, multiplier, gapBonus, latePoints, gapFrom, tierUpAtLeastGap:
//             - Gold on the first tap of a round pays by tier. tierValue(n) = base * multiplier^(n-1);
//               T is the highest tier reached this run (0 at the start).
//               Previous round also had a first-tap gold: T = T+1, pays tierValue(T)
//               (tierUpAtLeastGap: never less than the last first-tap payout + gapBonus).
//               Otherwise: T = 0 -> T = 1, pays tierValue(1); else T unchanged and pays
//               the last first-tap payout + gapBonus (gapFrom "lastPayout", Craig's Nov 9 10pm answer)
//               or tierValue(T) + gapBonus (gapFrom "tier").
//             - Gold found later in the round pays latePoints and still counts toward clearing.
// golden.firstTap.endsRound: a gold on the first tap ends the round at once (on to the next round).
//
// If ultradoinkGame.js is loaded, its placement registry and seeded RNG are reused, so a placement
// algorithm added there works here too. Without it, only "random" placement is available.
//
// Leaderboard: with rounds on, a run's total score is posted to /api/leaderboard/submit-score with
// game=megadoink when the player is logged in (same token as Classic). Playtests aren't posted: no score
// is sent when any URL param or loadGame arg changes the rules (see isPlaytest()).
//
// The game draws its own grid into #megadoink (created if missing), so it doesn't
// touch the classic two-button console or the global .svgbutton handlers.

const megadoinkGame = {
  name: "MEGADO!NK",
  defaultConfig: "js/games/megadoink.config.json",
  rules: null,      // the config file's rules, as loaded
  configUrl: null,
  args: {},
  config: null,     // rules with the overrides applied: { cols, rows, tapPauseMs, cellTypes }
  state: null,
  baseArgs: {},     // the args the run started with, for "Play again"
  // Survives from one board to the next when init() gets keepStreak (the next round of a run).
  carry: { streaks: {}, round: 1, carried: 0, baseSeed: null, tier: 0, prevFirstGold: false, lastFirstPayout: 0 },

  // Cap on traps, as a share of the board, so a progression can never leave the board without greens.
  MAX_TRAP_SHARE: 0.5,

  // How the rules change from round to round. Each one edits cfg (the overridden rules) for `round`.
  progressions: {
    same() {},
    addTrap(cfg, round, opts) {
      const every = Math.max(1, Number(opts.every) || 1);
      const t = cfg.cellTypes.trap;
      t.count += Math.floor((round - 1) / every);
      if (opts.max != null) t.count = Math.min(t.count, Math.max(Number(opts.max), 1));
    },
  },

  // How a gold (any special cell with a scoring algorithm) scores. Each returns { points, label? }.
  // first = this is the round's first tap. Tier state lives in this.carry so it lasts the whole run.
  goldScoring: {
    streak(t, el) {
      return { points: this.config.greenPoints + (Number(t.points) || 0) };   // streak bonuses come from updateStreaks
    },
    tiers(t, el, first) {
      const o = t.scoring, c = this.carry;
      if (!first) return { points: Number(o.latePoints ?? 5) };
      const value = (n) => Number(o.base ?? 15) * Math.pow(Number(o.multiplier ?? 2), n - 1);
      let points, label;
      const gap = Number(o.gapBonus ?? 5);
      if (c.prevFirstGold) {
        c.tier++;
        points = value(c.tier);
        label = `Tier ${c.tier}`;
        // Craig: if last payout + gap is more than the new tier is worth, pay the higher amount
        if (o.tierUpAtLeastGap && c.lastFirstPayout + gap > points) {
          points = c.lastFirstPayout + gap;
          label += ` (${c.lastFirstPayout} +${gap})`;
        }
      } else if (c.tier === 0) {
        c.tier = 1;
        points = value(1);
        label = "Tier 1";
      } else {
        const last = o.gapFrom === "lastPayout";
        points = (last ? c.lastFirstPayout : value(c.tier)) + gap;
        label = last ? `Tier ${c.tier}: ${c.lastFirstPayout} +${gap}` : `Tier ${c.tier} +${gap}`;
      }
      c.lastFirstPayout = points;
      return { points, label };
    },
  },
  scoringAlgo(t) { return (t && t.scoring && t.scoring.algorithm) || "streak"; },

  // How each streak countBy option counts. tap() runs on a tap of that cell type and returns the new
  // streak length, or null if this tap doesn't move the streak. roundEnd() runs when the board ends.
  streakCounters: {
    rounds: {
      tap(name) {
        const s = this.state;
        if (s.streakRoundCounted[name]) return null;   // only the first find in a round counts
        s.streakRoundCounted[name] = true;
        return (this.carry.streaks[name] = (this.carry.streaks[name] || 0) + 1);
      },
      roundEnd(name) {
        if (!this.state.streakRoundCounted[name]) this.carry.streaks[name] = 0;
      },
    },
    taps: {
      tap(name) {
        const s = this.state;
        s.tapStreaks[name] = s.lastTap === name ? (s.tapStreaks[name] || 0) + 1 : 1;
        return s.tapStreaks[name];
      },
      roundEnd() {},
    },
  },

  // Fallbacks for when ultradoinkGame.js isn't on the page.
  ownPlacements: {
    random(free, count, rng) {
      const pool = free.slice(), out = [];
      while (out.length < count && pool.length) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
      return out;
    },
  },
  ownRng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  ultra() { return typeof ultradoinkGame !== "undefined" ? ultradoinkGame : null; },
  placement(name) {
    const u = this.ultra();
    return (u && u.placements[name]) || this.ownPlacements[name];
  },
  rng(seed) { const u = this.ultra(); return u ? u.rng(seed) : this.ownRng(seed); },

  // ---- Setup ----

  init(args = {}) {
    if (!args.keepStreak) {
      this.carry = { streaks: {}, round: 1, carried: 0, baseSeed: null, tier: 0, prevFirstGold: false, lastFirstPayout: 0 };
      this.baseArgs = args;
    }
    this.args = args;
    const q = new URLSearchParams(window.location.search);
    const url = args.config || q.get("config") || this.defaultConfig;
    if (!this.rules || url !== this.configUrl) {
      fetch(url, { cache: "no-store" })
        .then((r) => { if (!r.ok) throw new Error(r.status + " " + url); return r.json(); })
        .then((json) => { this.rules = json.rules || json; this.configUrl = url; this.init(args); })
        .catch((e) => this.showError("Couldn't load game config: " + e.message));
      return;
    }

    const carry = this.carry;
    this.config = this.applyOverrides(this.rules, args, q, carry.round);
    const c = this.config, cells = c.cols * c.rows;

    if (carry.baseSeed == null)
      carry.baseSeed = args.seed ?? (q.has("seed") ? parseInt(q.get("seed"), 10) : Math.floor(Math.random() * 1e9));
    // Round 1 plays the base seed itself (so old ?seed= links deal the same board); later rounds derive from it.
    const seed = carry.round === 1 ? carry.baseSeed : (carry.baseSeed + Math.imul(carry.round, 0x9e3779b1)) >>> 0;
    const rng = this.rng(seed);

    // Deal the special cells, in the order the config lists them.
    const kind = Array(cells).fill("green");
    for (const [name, t] of Object.entries(c.cellTypes)) {
      if (t.enabled === false || !(t.count > 0)) continue;
      const free = kind.map((k, i) => (k === "green" ? i : -1)).filter((i) => i >= 0);
      const algo = (t.placement && t.placement.algorithm) || "random";
      const place = this.placement(algo);
      if (!place) return this.showError(`Unknown placement "${algo}" for ${name}`);
      place.call(this, free, t.count, rng, t.placement || {}, { cols: c.cols, rows: c.rows, exists: kind.map(() => true) })
        .forEach((i) => { kind[i] = name; });
    }

    this.state = {
      seed, kind,
      found: 0,          // greens found, the Golden Circle included
      points: 0,         // this board's points (greens, gold, bonuses)
      taps: 0,           // taps on this board
      firstTapGold: false,   // this board's first tap was a gold
      goldNote: "",      // what the first-tap gold paid, for the round-end message
      lastTap: null,     // the kind of the previous cell tapped
      tapStreaks: {},    // for countBy "taps"
      streakRoundCounted: {},   // for countBy "rounds": cell types already counted on this board
      locked: false,
      over: false,
      best: 0,
    };
    this.state.best = parseInt(this.storage("get") || "0", 10);
    this.renderUI();
  },

  // Config file + loadGame args + URL params -> the rules this game is played with.
  applyOverrides(rules, args, q, round = 1) {
    const num = (k) => (q.has(k) ? parseInt(q.get(k), 10) : undefined);
    const pick = (k, fallback) => args[k] ?? num(k) ?? fallback;
    const types = JSON.parse(JSON.stringify(rules.cellTypes || {}));
    const grid = rules.grid || {};
    const cols = pick("cols", grid.cols ?? 3);
    const rows = pick("rows", grid.rows ?? 4);
    const cells = cols * rows;

    if (!types.trap) types.trap = { count: 1, placement: { algorithm: "random" } };
    types.trap.count = Math.max(1, Math.min(pick("reds", types.trap.count ?? 1), cells - 1));

    const rr = rules.rounds || {};
    const prog = Object.assign({ algorithm: "same" }, rr.progression);
    const progName = args.progression ?? q.get("progression");
    if (progName && progName !== prog.algorithm) Object.assign(prog, { algorithm: progName });
    if (pick("every", undefined) !== undefined) prog.every = pick("every");
    if (pick("maxTraps", undefined) !== undefined) prog.max = pick("maxTraps");
    const rounds = {
      enabled: pick("rounds", rr.enabled ? 1 : 0) !== 0,
      onClear: rr.onClear || "nextRound",
      progression: prog,
    };
    if (rounds.enabled) {
      const fn = this.progressions[prog.algorithm];
      if (fn) fn.call(this, { cols, rows, cellTypes: types }, round, prog);
      else console.warn(`Unknown progression "${prog.algorithm}"`);
    }
    types.trap.count = Math.max(1, Math.min(types.trap.count, this.trapCap(cells)));

    if (types.golden) {
      const g = pick("golden", undefined);
      if (g !== undefined) types.golden.enabled = g !== 0;
      types.golden.count = Math.max(0, Math.min(pick("goldens", types.golden.count ?? 1), cells - types.trap.count));
      const by = args.streak ?? q.get("streak");
      if (by) types.golden.streak = Object.assign({ bonus: [0] }, types.golden.streak, { countBy: by });
      const algo = args.scoring ?? q.get("scoring");
      if (algo) {
        types.golden.scoring = Object.assign({}, types.golden.scoring, { algorithm: algo });
        if (algo === "streak") delete types.golden.firstTap;   // ?scoring=streak plays the old game
      }
    }
    return {
      cols, rows, cellTypes: types, rounds,
      greenPoints: Number(rules.greenPoints ?? 1),
      tapPauseMs: pick("lockMs", (rules.timing && rules.timing.tapPauseMs) ?? 250),
    };
  },

  // Most traps a board of `cells` may have: MAX_TRAP_SHARE of it, and always at least one green left.
  trapCap(cells) { return Math.max(1, Math.min(Math.floor(cells * this.MAX_TRAP_SHARE), cells - 1)); },

  type(name) { return this.config.cellTypes[name]; },
  isTrap(k) { return k === "trap"; },
  // Greens, plus special cells that play as a green (otherwise: "green"), like the Golden Circle.
  actsGreen(k) { return k === "green" || (this.type(k) && this.type(k).otherwise === "green"); },
  greens() { return this.state.kind.filter((k) => this.actsGreen(k)).length; },
  // The run's total: earlier rounds' scores plus this board's.
  score() { return this.carry.carried + this.state.points; },
  roundsOn() { return this.config.rounds.enabled && this.config.rounds.onClear === "nextRound"; },
  hasBonusCells() { return this.state.kind.some((k) => k !== "green" && !this.isTrap(k) && (this.type(k).points || this.type(k).scoring)); },

  storageKey() {
    const c = this.config, g = c.cellTypes.golden;
    // Same key as before when there's no Golden Circle, so old bests carry over.
    const gold = g && g.enabled !== false && g.count > 0 && g.points ? `_g${g.count}x${g.points}` : "";
    // With rounds on, best is a run total, so it's kept apart from single-board bests (and per progression).
    const r = c.rounds.enabled ? `_r${c.rounds.progression.algorithm}` : "";
    // Uses the round-1 trap count, so the key stays the same for the whole run.
    const traps = c.rounds.enabled ? this.applyOverrides(this.rules, this.args, new URLSearchParams(window.location.search), 1).cellTypes.trap.count : c.cellTypes.trap.count;
    // Each scoring algorithm other than the original streak scoring keeps its own best.
    const sc = g && this.scoringAlgo(g) !== "streak" ? `_${this.scoringAlgo(g)}` : "";
    return `megadoink_best_${c.cols}x${c.rows}_${traps}${gold}${r}${sc}`;
  },

  storage(op, value) {
    try {
      if (op === "get") return localStorage.getItem(this.storageKey());
      localStorage.setItem(this.storageKey(), value);
    } catch (e) { return null; }
  },

  root() {
    let root = document.getElementById("megadoink");
    if (!root) {
      root = document.createElement("div");
      root.id = "megadoink";
      (document.getElementById("game-console") || document.body).appendChild(root);
    }
    return root;
  },

  showError(msg) {
    this.root().innerHTML = `<div class="md-result" style="color:#af1620">${msg}</div>`;
  },

  renderUI() {
    const root = this.root();
    const c = this.config;
    root.classList.remove("is-locked");
    root.innerHTML = `
      <div class="md-head">
        <div class="md-title">${this.name.replace(/^(MEGA|ULTRA)/, '<span class="md-prefix">$1</span>')}</div>
        <div class="md-score"><span class="md-round"${this.roundsOn() ? "" : " hidden"}>Round ${this.carry.round}</span>
          <span id="md-found">0</span> / ${this.greens()}
          <span class="md-points"${this.hasBonusCells() || this.roundsOn() ? "" : " hidden"}>score <span id="md-points">${this.score()}</span></span>
          <span class="md-best">best <span id="md-best">${this.state.best}</span></span></div>
      </div>
      <div class="md-board">
        <div class="md-grid" style="--cols: ${c.cols}; --rows: ${c.rows}; grid-template-columns: repeat(${c.cols}, 1fr)">
          ${Array.from({ length: c.cols * c.rows }, (_, i) =>
            `<button class="md-cell" data-i="${i}" aria-label="button ${i + 1}"></button>`).join("")}
        </div>
        <!-- End of game: a popup over the grid like Do!nk's (Craig, Nov 12). Nothing goes below the grid. -->
        <div class="md-end" id="md-end" hidden>
          <div class="md-end-box" role="dialog" aria-label="Game over">
            <div>YOU GOT: <span id="md-yourscore"></span></div>
            <div>BEST RUN: <span id="md-bestrun"></span></div>
            <button id="md-again" class="md-playagain">PLAY AGAIN</button>
            <div id="share-buttons-container" class="md-share"></div>
            <div class="md-save" id="md-save" hidden></div>
            <a href="#" class="md-lb-link" id="md-lb-link">Leaderboard</a>
            <div class="md-lb" id="md-lb" hidden></div>
          </div>
        </div>
      </div>`;

    root.querySelectorAll(".md-cell").forEach((el) =>
      el.addEventListener("click", () => this.action(el)));
    root.querySelector("#md-again").addEventListener("click", () => this.init(this.baseArgs));
    // Until the menu exists (a later piece), the leaderboard opens from a small link in the end popup.
    root.querySelector("#md-lb-link").addEventListener("click", (e) => { e.preventDefault(); this.showLeaderboard("all-time"); });
  },

  cell(i) { return document.querySelector(`#megadoink .md-cell[data-i="${i}"]`); },

  // checkPick() in gameEngine forwards here too
  action(el) {
    const s = this.state;
    if (!s || s.locked || s.over || el.classList.contains("is-green")) return;
    const i = parseInt(el.dataset.i, 10);
    const k = s.kind[i];

    if (this.isTrap(k)) {
      el.classList.add("is-red");
      this.play("sproing");
      this.endGame(false);
      return;
    }

    el.classList.add("is-green");
    s.found++;
    const first = s.taps === 0;
    s.taps++;
    const t = k !== "green" ? this.type(k) : null;
    let endsRound = false;
    if (t) {
      el.classList.add("is-" + k);
      const fn = this.goldScoring[this.scoringAlgo(t)];
      if (!fn) console.warn(`Unknown scoring "${this.scoringAlgo(t)}"`);
      const r = fn ? fn.call(this, t, el, first) : { points: this.config.greenPoints };
      s.points += r.points;
      if (first) {
        s.firstTapGold = true;
        endsRound = !!(t.firstTap && t.firstTap.endsRound);
      }
      if (r.label) s.goldNote = `+${r.points} (${r.label})`;
      // Craig (Nov 10): every gold hit shows just its points, big and gold, rising and fading.
      this.popup(el, `+${r.points}`, "md-pop-gold");
    } else {
      s.points += this.config.greenPoints;
    }
    this.updateStreaks(k, el);
    s.lastTap = k;
    document.getElementById("md-found").textContent = s.found;
    document.getElementById("md-points").textContent = this.score();
    this.play(t ? "gold" : "doink");   // fanfare is kept for a new round (showRound)

    if (endsRound || s.found === this.greens()) {
      this.endGame(true);
      return;
    }

    // short beat after each tap, like Classic waiting on the DO!NK
    s.locked = true;
    this.root().classList.add("is-locked");
    setTimeout(() => {
      s.locked = false;
      this.root().classList.remove("is-locked");
    }, this.config.tapPauseMs);
  },

  // Run every streak counter for this tap; award the bonus for the streak length it reaches.
  updateStreaks(kind, el) {
    const s = this.state;
    for (const [name, t] of Object.entries(this.config.cellTypes)) {
      if (!t.streak || this.scoringAlgo(t) !== "streak") continue;
      const counter = this.streakCounters[t.streak.countBy];
      if (!counter) { console.warn(`Unknown streak countBy "${t.streak.countBy}"`); continue; }
      if (name !== kind) {
        if (t.streak.countBy === "taps") s.tapStreaks[name] = 0;   // any other tap breaks a taps streak
        continue;
      }
      const n = counter.tap.call(this, name);
      if (!n) continue;
      const list = t.streak.bonus || [];
      const extra = Number(list[Math.min(n, list.length) - 1]) || 0;   // past the end: repeat the last value
      if (extra) {
        s.points += extra;
        this.popup(el, `+${extra} streak!`);
      }
    }
  },

  // A short label that floats up from a cell and fades.
  popup(el, text, extraClass) {
    const root = this.root();
    const pop = document.createElement("div");
    pop.className = "md-pop" + (extraClass ? " " + extraClass : "");
    pop.textContent = text;
    const a = el.getBoundingClientRect(), b = root.getBoundingClientRect();
    pop.style.left = (a.left - b.left + a.width / 2) + "px";
    pop.style.top = (a.top - b.top) + "px";
    root.appendChild(pop);
    setTimeout(() => pop.remove(), 1200);
  },

  endGame(cleared) {
    const s = this.state;
    s.over = true;
    for (const [name, t] of Object.entries(this.config.cellTypes)) {
      const counter = t.streak && this.scoringAlgo(t) === "streak" && this.streakCounters[t.streak.countBy];
      if (counter) counter.roundEnd.call(this, name);
    }
    if (cleared && this.roundsOn()) return this.nextRound();
    const root = this.root();
    // reveal the remaining reds, and where the Golden Circle was if it wasn't found
    s.kind.forEach((k, i) => {
      const el = this.cell(i);
      if (el.classList.contains("is-green")) return;
      if (this.isTrap(k)) el.classList.add("is-red");
      else if (k !== "green") el.classList.add("is-" + k);
    });
    root.querySelectorAll(".md-cell:not(.is-green):not(.is-red):not(.is-golden)").forEach((el) => el.classList.add("is-dim"));

    const score = this.score();
    const newBest = score > s.best;
    if (newBest) {
      s.best = score;
      this.storage("set", String(s.best));
      document.getElementById("md-best").textContent = s.best;
    }
    if (cleared) this.play("highscore");

    // The popup, after a short beat so the revealed red is seen first.
    document.getElementById("md-yourscore").textContent = score;
    document.getElementById("md-bestrun").textContent = s.best;
    setTimeout(() => { document.getElementById("md-end").hidden = false; }, 400);
    if (this.roundsOn()) this.submitScore(score);
    this.shareScore(score);
  },

  // Share, like Do!nk's: save a "can you beat my N on MEGADO!NK?" image, then show the share button(s).
  shareScore(score) {
    if (!(score > 0) || typeof renderShareButtons !== "function") return;
    const image = this.makeShareImage(score);
    $.post("save_score_image.php", { image, score, game: "megadoink" })
      .done(() => renderShareButtons(`${window.location.origin}/share.php?score=${score}&game=megadoink`))
      .fail((err) => console.error("Error saving share image:", err));
  },

  // Same layout as Do!nk's share image (600x315), with MEGA in green and DO!NK in blue (Craig's branding).
  makeShareImage(score) {
    const canvas = document.createElement("canvas");
    canvas.width = 600; canvas.height = 315;
    const ctx = canvas.getContext("2d"), font = (px) => `${px}px 'Luckiest Guy', Arial, sans-serif`;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 600, 315);
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#000"; ctx.font = font(50); ctx.fillText("can you beat my", 300, 80);
    ctx.fillStyle = "#4CAF50"; ctx.font = font(140); ctx.fillText(String(score), 300, 200);

    // "on [MEGADO!NK]?" with a blue box around the name
    ctx.font = font(50); ctx.textAlign = "left";
    const parts = [["on ", "#000"], ["MEGA", "#1a8f1a"], ["DO!NK", "#2b8bf6"], ["?", "#000"]];
    const pad = 10, w = parts.map(([t]) => ctx.measureText(t).width);
    const total = w.reduce((a, b) => a + b, 0) + pad * 4;
    let x = 300 - total / 2;
    const y = 280, m = ctx.measureText("MEGADO!NK");
    parts.forEach(([t, color], i) => {
      if (i === 1) {
        ctx.strokeStyle = "#2b8bf6"; ctx.lineWidth = 2;
        ctx.strokeRect(x, y - m.actualBoundingBoxAscent - pad, w[1] + w[2] + pad * 2, m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + pad * 2);
        x += pad;
      }
      ctx.fillStyle = color; ctx.fillText(t, x, y); x += w[i];
      if (i === 2) x += pad * 2;
    });
    return canvas.toDataURL("image/png");
  },

  // Rule-changing URL params and loadGame args: a game played with any of these is a playtest.
  PLAYTEST_PARAMS: ["config", "seed", "cols", "rows", "reds", "lockMs", "golden", "goldens", "streak",
                    "rounds", "progression", "every", "maxTraps", "scoring"],
  isPlaytest() {
    const q = new URLSearchParams(window.location.search);
    return this.PLAYTEST_PARAMS.some((k) => q.has(k) || this.baseArgs[k] !== undefined);
  },

  apiUrl() { return (typeof CONFIG !== "undefined" ? CONFIG.API_URL : "https://app.playdoink.com"); },

  loggedInUser() {
    try {
      const u = JSON.parse(localStorage.getItem("doink_user")) || {};
      return u.id && u.apiToken ? u : null;
    } catch (e) { return null; }
  },

  // Post the run's total to the Megado!nk leaderboard (logged in, not a playtest, more than 0).
  async submitScore(score) {
    const save = document.getElementById("md-save");
    const say = (html) => { save.innerHTML = html; save.hidden = false; };
    const loginHint = () => say(`<a href="/">Log in</a> to save your score`);
    if (this.isPlaytest()) return say("Playtest: score not saved");
    if (!(score > 0)) return;
    const user = this.loggedInUser();
    if (!user) return loginHint();
    try {
      const r = await fetch(this.apiUrl() + "/api/leaderboard/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + user.apiToken },
        body: JSON.stringify({ score, game: "megadoink" }),
      });
      if (r.status === 401) {
        // token no longer valid: treat as logged out, like Classic does
        try { localStorage.removeItem("doink_user"); } catch (e) {}
        return loginHint();
      }
      if (!r.ok) throw new Error(r.status);
      const data = await r.json();
      say(data.isAllTimeFirst ? "Saved: #1 all-time!" : data.isDailyFirst ? "Saved: #1 today!" : "Score saved");
    } catch (e) {
      console.error("Failed to submit Megado!nk score:", e);
      say("Couldn't save your score");
    }
  },

  // A plain Megado!nk leaderboard under the result (type: "all-time" or "daily").
  async showLeaderboard(type) {
    const box = document.getElementById("md-lb");
    box.hidden = false;
    const tab = (t, label) => `<button data-t="${t}" class="${t === type ? "is-on" : ""}">${label}</button>`;
    box.innerHTML = `<div class="md-lb-tabs">${tab("all-time", "All-time")}${tab("daily", "Today")}</div><div class="md-lb-body">Loading...</div>`;
    box.querySelectorAll(".md-lb-tabs button").forEach((b) =>
      b.addEventListener("click", () => this.showLeaderboard(b.dataset.t)));
    const body = box.querySelector(".md-lb-body");
    try {
      const r = await fetch(`${this.apiUrl()}/api/leaderboard/${type}?game=megadoink`);
      if (!r.ok) throw new Error(r.status);
      const rows = (await r.json()).leaderboard || [];
      if (!rows.length) { body.textContent = type === "daily" ? "No scores yet today." : "No scores yet."; return; }
      const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
      body.innerHTML = `<table class="md-lb-table"><tbody>${rows.slice(0, 20).map((e, i) =>
        `<tr><td>${i + 1}</td><td>${esc(e.username)}</td><td>${esc(e.score)}</td></tr>`).join("")}</tbody></table>`;
    } catch (e) {
      body.textContent = "Couldn't load the leaderboard.";
    }
  },

  // Board cleared with rounds on: a short beat, then a fresh deal that keeps the score and the streak.
  nextRound() {
    const s = this.state, carry = this.carry;
    // No text under the grid any more: the "+N" pop-up and the "ROUND N" graphic carry the news.
    carry.carried += s.points;
    carry.prevFirstGold = s.firstTapGold;   // tiers: a round without a first-tap gold breaks the chain
    carry.round++;
    setTimeout(() => {
      this.init(Object.assign({}, this.baseArgs, { keepStreak: true }));
      this.showRound(carry.round);
    }, 1200);
  },

  // Craig (Nov 10): as the new board appears, the fanfare plays and a big "ROUND N" grows
  // from the centre of the board and fades out over the length of the fanfare.
  showRound(n) {
    this.play("highscore");
    const root = this.root(), grid = root.querySelector(".md-grid");
    if (!grid) return;
    const banner = document.createElement("div");
    banner.className = "md-round-banner";
    banner.innerHTML = `<span class="md-round-word">ROUND</span><span class="md-round-num">${n}</span>`;
    const a = grid.getBoundingClientRect(), b = root.getBoundingClientRect();
    banner.style.left = (a.left - b.left + a.width / 2) + "px";
    banner.style.top = (a.top - b.top + a.height / 2) + "px";
    root.appendChild(banner);
    setTimeout(() => banner.remove(), 2200);
  },

  play(name) {
    if (typeof sounds === "undefined" || !sounds[name]) return;
    try { sounds[name].currentTime = 0; const p = sounds[name].play(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
  },
};

// Register this game type
if (typeof gameTypes !== "undefined") gameTypes.megadoink = megadoinkGame;
