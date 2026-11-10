# Game landing pages: spec (confirmed by Jim, 2026-11-10)

One landing page per game on playdoink.com, with evergreen content and a big link to the game. Nothing is built yet.

Games: Doink!, Megadoink, Ultradoink, Duck Duck Goose, Quadruplex.

## 1. URLs

Each page is a folder with an `index.html` in the hub (`/var/www/playdoink.com/hub/`, repo `hub/`), so nginx serves it with no config change.

| Page | Landing page | Game it links to |
|---|---|---|
| Doink! | playdoink.com/doink/ | https://doink.playdoink.com |
| Megadoink | playdoink.com/megadoink/ | https://doink.playdoink.com/megadoink.html |
| Ultradoink | playdoink.com/ultradoink/ | https://doink.playdoink.com/ultradoink.html |
| Duck Duck Goose | playdoink.com/duckduckgoose/ | https://duckduckgoose.playdoink.com |
| Quadruplex | playdoink.com/quadruplex/ (coming soon) | none yet: no Play button until the game is back |

Reserved for later: `playdoink.com/blog/` (blog) and the home page carousel at `playdoink.com/`.

## 2. Page sections (same order on every page)

1. **Top bar**: "playdoink" wordmark linking back to the hub, plus "All games".
2. **Hero**: game name, one-line tagline, hero image, big **Play now** button.
3. **What it is**: 2 or 3 sentences.
4. **How to play**: 3 to 5 short steps.
5. **Craig's note**: a few lines in Craig's voice on why he likes it (the "editor in chief" angle).
6. **Tips** (optional): 2 or 3 hints, no spoilers.
7. **Doink! family** (Doink!, Megadoink, Ultradoink pages only): a row linking the three Doink! pages to each other.
8. **More games**: cards for the other games, each linking to its landing page. Later, the latest blog posts about this game go here too.
9. **Footer**: Play now again, the shared sign-up line, About, back to all games.

The Quadruplex page uses the same sections, but the hero says "Coming soon" with the sign-up form in place of Play now, and the page still explains the game (what it is, how to play).

Each page also gets its own `<title>`, description, and og/twitter tags with the hero image, so a shared link previews well.

## 3. Evergreen content needed per game

Craig writes or approves all copy. "Have" means it exists today.

| Game | Have | Need |
|---|---|---|
| Doink! | Tagline "the world's hardest simplest game"; doink-opengraph.png | What it is, how to play, Craig's note |
| Megadoink | Game page; Golden Circle, streaks, bonus rounds | Tagline, image, how to play (incl. Golden Circle and scoring), Craig's note |
| Ultradoink | Game page | Tagline, image, how to play, Craig's note |
| Duck Duck Goose | Hub line ("eight eggs share a hidden rule..."); og image | Short tagline, how to play, Craig's note |
| Quadruplex | Tagline "bust your brain on this word game with a twist" | How to play, image, Craig's note |

## 4. Shared template vs per-game pages

Recommendation: **one shared stylesheet (`hub/css/game-page.css`) plus five hand-written HTML pages** copied from one template file (`hub/_template/game.html`). With five games and plain static HTML, this keeps deploys to "upload files", like the hub today.

Later option, if the carousel and blog want the same data: one `hub/games.json` (name, tagline, image, landing URL, game URL) that the carousel and "More games" read with a few lines of JS. Not needed for the first version.

## 5. Links in and out

- **Landing page to game**: the Play now buttons link to the game URL in the table above.
- **Game back to hub**: each game links back to the hub (playdoink.com). Doink! already has "More games" links there; Megadoink, Ultradoink and Duck Duck Goose get the same small link.
- **Hub to landing pages**: on the home page games list (and later each carousel slide), the game name links to its landing page, with a small "Play" link straight to the game.

## 6. Fit with the carousel and blog

- Each landing page's hero image is 1200x630 so the same image works as its og image and as its carousel slide.
- The blog links to landing pages, and each landing page's "More games" section has room for a "From the blog" list.

## Decisions (Jim, 2026-11-10)

1. Megadoink and Ultradoink get their own pages, and the three Doink! pages link to each other.
2. Quadruplex stays hidden from the games list, but gets a coming-soon page that explains the game.
3. Each game links back to the hub.
