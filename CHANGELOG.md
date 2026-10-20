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
- Not deployed. The live front page is still Doink!.
