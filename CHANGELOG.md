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
- Not deployed. The live front page is still Doink!.
