# Changelog

## 2026-11-07 — Share link fix (Craig's email "Doink: layout on a tablet, issues with share", Nov 4)

- Share links pointed at `https://playdoink.com/share.php`, which is now the hub and has no share page, so previews came up as a bare gray "playdoink.com" link. The share page and the saved score image now use the game's own site (doink.playdoink.com).
- `share.php`: dropped an undefined `$img` in `og:url`; added "Can you beat my N?" description and Twitter large-image card tags.
- Files: `frontend/share.php`, `frontend/save_score_image.php`, `frontend/js/games/classicGame.js`.
- Not deployed yet.

## 2026-11-07 — iPad shows the phone-style Share button

- iPad Safari reports itself as a Mac, so the end-of-game popup showed five share buttons (Twitter, Facebook, WhatsApp, Reddit, Copy Link). A touch-screen "Mac" now counts as mobile, so iPads get the single Share bar like phones. File: `frontend/js/utils.js`.
- Deploy both fixes with `scripts/deploy-share-fix.sh` (backs up live files first).

## 2026-11-10 — Megado!nk: grid locked to 3x4

- Craig wants the 3x4 grid locked in (Nov 9 email). Removed the "Try: 3x4 / 3x5 / 4x4 / 4x5 / no gold" links from the top of `frontend/megadoink.html`; only "← Home" remains. URL params like `?cols=` still work for playtesting and those games stay off the leaderboard.

## 2026-11-10 — Megado!nk: big "+N" on every gold hit (Craig, "Megado!nk notes for Claude")

- Every gold hit (first tap or later) now shows just its points ("+5", "+15", "+30"…) in big gold-orange Luckiest Guy, rising and fading over ~0.7s. Replaces the small "Gold! +15 (Tier 1)" text, which was too much to read. Files: `frontend/js/games/megadoinkGame.js`, `frontend/css/megadoink.css`.

## 2026-11-10 — Megado!nk: "ROUND N" graphic on each new round (Craig, "Megado!nk notes for Claude")

- When a round is won (gold first or board cleared), the new board appears with a big "ROUND N" (small "ROUND" over a large numeral, Do!nk popup blue #2b8bf6, Luckiest Guy). It grows from small to full size in the centre of the board and fades out over ~2.1s, the length of the fanfare.
- The fanfare now plays as the new board appears (with the graphic) instead of when the old board ends. (Gold hits still play the fanfare too, until Craig's gold sound is added.)
- Files: `frontend/js/games/megadoinkGame.js` (new `showRound`), `frontend/css/megadoink.css`.

## 2026-11-10 — Megado!nk: gold has its own hit sound; fanfare only for a new round

- New `frontend/resources/gold.mp3`: Craig's Pixabay clip (from his screen recording), trimmed to the 1.4s hit with a short fade, converted with ffmpeg (44.1kHz, 128k), level left as-is (close to doink/sproing).
- Every gold hit plays `gold` (like green's doink and red's sproing). The fanfare now plays only when a new round starts, with the "ROUND N" graphic.
- Files: `frontend/js/sounds.js` (adds `gold`), `frontend/js/games/megadoinkGame.js`, `frontend/resources/gold.mp3`.
