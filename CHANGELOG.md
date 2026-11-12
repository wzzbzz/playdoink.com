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

## 2026-11-12 — Megado!nk: fits a phone screen, end-of-game popup (Craig, "MEGADO!NK notes")

- The page is exactly the visible screen height (`100dvh`, safe-area insets) and the grid sizes itself to the space under the header, so nothing scrolls in portrait. Checked at 320x480, 375x548/667, 390x664/844, 430x746/932 and desktop.
- Everything under the grid is gone. A trap now opens a popup over the grid styled like Do!nk's: YOU GOT / BEST RUN, PLAY AGAIN, the Share button(s), "Log in to save your score" when logged out, and (until the menu exists) a small Leaderboard link.
- Score submit is unchanged. Files: `frontend/megadoink.html`, `frontend/css/megadoink.css`, `frontend/js/games/megadoinkGame.js`. Not deployed yet.

## 2026-11-12 — Megado!nk: new header and menu (Craig, "MEGADO!NK notes")

- Top bar in quiet grey: ← Home, then "Log in" (to the home page's Login/Register) or the player's name, then Do!nk's sound toggle (same id/icons, driven by `js/sounds.js`, with the iOS blank-icon fix) and a hamburger menu.
- Menu, styled like Do!nk's: MEGADO?NK (short how-to-play), Leaderboard (Megado!nk, All-time/Today), More games (https://playdoink.com, as on live Do!nk), Home. No My Stats yet: there are no Megado!nk stats.
- Logo row: MEGADO!NK in Luckiest Guy with MEGA in Do!nk blue and DO!NK in black, about 2/3 of the grid's width, lined up with the grid's left edge; a gold-framed black score box with white numbers on the right. Round / found / score / best labels are gone, and so is the temporary Leaderboard link in the end popup.
- Files: `frontend/megadoink.html`, `frontend/css/megadoink.css`, `frontend/js/games/megadoinkGame.js`. Not deployed yet.

## 2026-11-12 — Megado!nk: log in without leaving the game

- "Log in" (top bar, and "Log in to save your score" in the end popup) opens a login panel in Megado!nk's menu: the same magic-link form and wording as Do!nk's Login/Register.
- The magic link now brings the player back to the page they logged in from. `request-login` takes an optional `next`; only a plain same-site path gets into the link (`AuthController::safeReturnPath`: starts with one "/", URL-safe path characters and a simple query only, no "//", no backslashes, no scheme, max 200 characters), and `verify.php` checks it again before redirecting. Anything else means "/". Players without a nickname still go to the home page's nickname prompt.
- Do!nk Classic is unchanged: its form sends no `next`, so its link and redirect are exactly as before (`js/main.js` not touched).
- A run that ended before logging in isn't saved afterwards.
- Files: `api/src/Controller/AuthController.php`, `frontend/verify.php`, `frontend/js/utils.js` (new `requestMagicLink()`), `frontend/megadoink.html`, `frontend/css/megadoink.css`, `frontend/js/games/megadoinkGame.js`. No migration. Not deployed yet.

## 2026-11-12 — Megado!nk: #1 / personal-best banners (Craig, "MEGADO!NK notes")

- When a run ends, the popup waits (like Do!nk's) for the score submit, then shows one banner with the fanfare, in Do!nk's purple style and motion: "👑 #1 ALL-TIME! 👑" or "🏆 #1 TODAY! 🏆" (3s), else "🎉 NEW PERSONAL BEST! 🎉" (1.5s). Personal best = beats the player's best before the run: their server best if logged in, else this browser's.
- Logged out: personal best only (and the "Log in to save your score" line). Playtests: no #1 banners (they aren't submitted).
- API: `submit-score` now treats an empty Megado!nk board (all-time or today) as #1; Classic unchanged. `my-stats/{id}` takes `?game=` (default classic, unknown = 400) for the best score and rank. No migration.
- Files: `api/src/Repository/ScoreRepository.php`, `api/src/Controller/LeaderboardController.php`, `frontend/js/games/megadoinkGame.js`, `frontend/css/megadoink.css`. Not deployed yet.

## 2026-11-12 — New players get the nickname prompt in Megado!nk too

- A brand-new player who logs in from Megado!nk comes back to Megado!nk (not Do!nk's home) and gets the nickname prompt there: same wording, same `/api/auth/update-username` call with the login token, same API validation messages.
- `verify.php` carries the safe `next` through the nickname step (`next` + `show-nickname=1`); with no `next` it still goes to `/?show-nickname=1`, so Do!nk Classic is unchanged.
- Until a nickname is set, Megado!nk's top bar says "Set nickname"; tapping it reopens the prompt.
- Files: `frontend/verify.php`, `frontend/megadoink.html`, `frontend/css/megadoink.css`, `frontend/js/games/megadoinkGame.js`. No API change. Not deployed yet.

## 2026-11-12 — Do!nk: "Set nickname" reminder until a nickname is set

- On Do!nk's home, a logged-in player with no nickname (who skipped the prompt after logging in) sees a small "Set nickname" link under "Logged in as …" on every visit; it opens Do!nk's existing nickname prompt. Saving redraws the line with the new name and no link. The prompt right after the magic link is unchanged, and it doesn't open by itself on other visits.
- File: `frontend/js/main.js`. Not deployed yet.
