# Changelog

## 2026-10-20

- **Home page (hub/).** Built the games list into a simple playdoink.com home page:
  Quadruplex, Duck Duck Goose and Doink! one line each, plus one shared
  "Hear about new games" email signup. Doink! now links to doink.playdoink.com.
- **hub/signup.php.** Saves signups to a CSV outside the web root
  (`/var/www/playdoink.com/data/signups.csv` when the hub sits in
  `/var/www/playdoink.com/frontend/hub`; override with `PLAYDOINK_SIGNUPS_FILE`).
  Lowercases and de-duplicates addresses, has a hidden honeypot field for bots.
- Not deployed. The live front page is still Doink!.
