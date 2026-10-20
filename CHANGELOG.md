# Changelog

## 2026-10-20

- **Home page (hub/).** Built the games list into a simple playdoink.com home page:
  Quadruplex, Duck Duck Goose and Doink! one line each, plus one shared
  signup. Doink! now links to doink.playdoink.com.
- **Signup uses Doink!'s login system.** The form posts to the existing
  `app.playdoink.com/api/auth/request-login`, which finds or creates the user
  and emails a magic login link. No new table, no migration. (Replaced an
  earlier `hub/signup.php` that wrote a separate CSV.)
- **Login email reworded.** Subject, heading and link now say Playdoink.com
  instead of DO!NK (api AuthController). Doink! logins get the same email.
- **Doink! moved to doink.playdoink.com.** Share links, og tags, the game URL
  in share images and `FRONTEND_URL` in js/config.js now use
  doink.playdoink.com. CORS also allows doink.playdoink.com. Mercure topic
  names are unchanged (they're identifiers, not links). On the box, the API's
  `FRONTEND_URL` env var must be set to https://doink.playdoink.com so login
  emails link to doink.playdoink.com/verify.php.
- **Doink! line** on the home page now reads "the world's hardest simplest game".
- **Tagline** now reads "Curated and hand-made games by Craig Hillman" (no About
  page for now; Craig's feedback to come).
- **About page draft** (`hub/about.html`), linked from the tagline. Copy is a
  draft for Craig to review; not uploaded.
- **Quadruplex line** now reads "bust your brain on this word game with a twist".
- **Doink! links to the hub, inside the game.** A "More games" button in the
  game menu and a "More games from playdoink" line on the end-of-game screen,
  both linking to playdoink.com (templates/game-menu.php, game-console.php).
  Also a small fixed "More games from playdoink" link at the bottom of every
  page (templates/footer.php). Live 2026-10-20 via doink-more-games.sh.
- **Hub link preview.** `hub/og-image.png` (1200×630: "playdoink / All the best
  games, all in one place" with the three game names, marked DRAFT) and og/twitter tags on
  the home page (title "Do ya doink?", description "Curated games and toys").
- **Doink! link previews fixed.** templates/header.php used `<?php $doink->title();?>`
  (no echo), so the page title and every og: tag were empty. Now echoed. Default
  description is "The world's hardest simplest game." (was "Doink Description."),
  and a twitter:card tag is added.
- **Welcome email for home-page sign-ups.** New `POST /api/signup`
  (api/src/Controller/SignupController.php) creates the same user Doink! login
  uses, but sends a "Thanks for signing up! This is going to be fun." email with
  links to the games instead of a login link. Already-registered addresses get no
  second email. The home page form now posts there. Doink!'s own login email is
  unchanged.
- **Signed-up state on the home page.** After a sign-up (new or repeat), the form
  is replaced by "You're signed up", and the browser remembers it
  (localStorage), so a refresh shows the same. The API now says "You're already
  signed up." for repeat addresses.
- **Sign-up status check.** New `GET /api/signup/status?email=...` returns
  `{"signedUp": true|false}`. The home page now saves the signed-up email in the
  browser (`playdoink_email`) and checks it with the API on load; if the API says
  it isn't signed up, the form comes back.
- Home page is live at playdoink.com (Jim uploaded hub/index.html). Doink! link updates and CORS change not deployed yet.
