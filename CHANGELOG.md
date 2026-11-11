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

## 2026-11-10 — Megado!nk share (Jim)

- At game over Megado!nk now saves a "can you beat my N on MEGADO!NK?" image (Do!nk's layout, MEGA in green, DO!NK in blue) and shows Do!nk's share buttons: one Share button on phones/iPads, five buttons on desktop. The shared link previews with that image and opens megadoink.html.
- `share.php` and `save_score_image.php` take an optional `game` (only `doink` or `megadoink`; anything else means Do!nk). Do!nk's share is unchanged. Megado!nk images are saved as `scores/megadoink-score-N.png`.
- `megadoink.html` now loads `js/utils.js` and `css/share.css`.
- Deploy with `scripts/deploy-megadoink-share.sh` (also carries the Nov 7 share-link fix if that isn't live yet).

## 2026-11-10 — save_score_image.php tightened

- Before: anyone could POST any bytes and they were saved as `scores/score-N.png` (overwriting existing images).
- Now: POST only; score must be 0–99999; the image must be a real 600x315 PNG under 100 KB (what Do!nk and Megado!nk send); an existing score image is never overwritten. Tested against good, junk, wrong-size, negative/huge-score and GET requests.
- Ships with `scripts/deploy-megadoink-share.sh`.

## 2026-11-11 — Share images drawn on the server

- New `frontend/src/ScoreImage.php` draws the 600x315 "can you beat my N on DO!NK?" / "...MEGADO!NK?" image with PHP GD, same layout as the browser canvas. Font `frontend/resources/fonts/LuckiestGuy-Regular.ttf` (Luckiest Guy, Apache 2.0, from Google Fonts).
- `save_score_image.php` now ignores the uploaded picture and draws its own (and redraws, which also replaces any old junk). If the server has no GD/FreeType it falls back to the checked-upload rules from 2026-11-10.
- `share.php` draws the image if it's missing, so old share links get a preview too.
- Tested: a fake red 600x315 upload and a junk upload both came out as the proper drawn image; bad scores refused.
