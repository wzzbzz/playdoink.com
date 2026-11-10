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
