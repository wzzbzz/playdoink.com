#!/bin/bash
# Deploys Megado!nk steps 1-4 (config, Golden Circle, streaks, bonus rounds, leaderboard) — 2026-11-09.
# Run on Jim's Mac:  bash ~/Ampelos/greenhouse/Doink/scripts/deploy-megadoink.sh
#
# API (sysop@playdoink.com:/var/www/playdoink.com/api):
#   1. Dry-run rsync of api/ (no --delete; skips vendor/, var/, .env*) and shows what would change.
#      You type "yes" to go on; anything else stops with nothing changed.
#   2. Backs up the live API (without vendor/ and var/) to ~/doink-backups on the server.
#   3. rsync for real (files 644, folders 755), runs the migration (adds score.game), clears the prod cache.
#   The worker restart needs sudo: do that yourself afterwards.
# Site (/var/www/doink.playdoink.com/frontend): ONLY the 4 Megado!nk files, never all of frontend/.
#   4. Downloads the live copies as a backup and stops if any differs from commit f86512b
#      (last commit before this work), i.e. someone changed it on the server.
#   5. Uploads the 4 files and sets them to 644.
set -e
HOST=sysop@playdoink.com
API=/var/www/playdoink.com/api
LIVE=/var/www/doink.playdoink.com/frontend
cd ~/Ampelos/greenhouse/Doink
BASE=f86512b
FILES="megadoink.html css/megadoink.css js/games/megadoinkGame.js js/games/megadoink.config.json"
STAMP=$(date +%Y%m%d-%H%M%S)
# macOS rsync 2.6.9 has no D755,F644 form; this gives files 644 and folders 755.
RSYNC_OPTS=(-rlti --checksum --chmod=u=rwX,go=rX --exclude=vendor/ --exclude=var/ --exclude='.env*' --exclude=.DS_Store)

# Frontend checks first, so nothing is changed anywhere if the live site has surprises.
B=~/doink-backups/megadoink-$STAMP; mkdir -p "$B"
for f in $FILES; do
  mkdir -p "$B/$(dirname $f)"
  if scp -q "$HOST:$LIVE/$f" "$B/$f" 2>/dev/null; then
    # git cat-file, not git show: on this Mac git show can write to stderr when piped
    if ! git cat-file -p "$BASE:frontend/$f" | cmp -s - "$B/$f"; then
      echo "STOP: live $f differs from commit $BASE. Nothing uploaded. Diff:"
      git cat-file -p "$BASE:frontend/$f" | diff - "$B/$f" | head -40
      exit 1
    fi
  else
    echo "(live $f doesn't exist yet: new file)"
    rm -f "$B/$f"
  fi
done
echo "backup of live frontend files: $B"

echo
echo "== API dry run: files that would change on $API =="
rsync -n "${RSYNC_OPTS[@]}" api/ "$HOST:$API/" | grep -v '/$' || true
echo
echo "Expected: src/Controller/LeaderboardController.php, src/Entity/Score.php,"
echo "src/Repository/ScoreRepository.php, migrations/Version20261109160000.php (plus maybe permission-only changes)."
read -r -p "Deploy the API with exactly these changes? Type yes: " OK
[ "$OK" = "yes" ] || { echo "Stopped. Nothing changed."; exit 1; }

ssh "$HOST" "mkdir -p ~/doink-backups && tar czf ~/doink-backups/api-$STAMP.tgz --exclude=api/vendor --exclude=api/var -C $(dirname $API) api"
echo "backup of live API: $HOST:~/doink-backups/api-$STAMP.tgz"
rsync "${RSYNC_OPTS[@]}" api/ "$HOST:$API/"
ssh "$HOST" "cd $API && php bin/console doctrine:migrations:migrate --no-interaction --env=prod && php bin/console cache:clear --env=prod"
echo "API deployed and migrated."

for f in $FILES; do scp -q "frontend/$f" "$HOST:$LIVE/$f"; done
ssh "$HOST" "cd $LIVE && chmod 644 $FILES"
echo "Site files deployed."
echo
echo "Checks:"
echo -n "  Classic all-time rows: "; curl -s https://app.playdoink.com/api/leaderboard/all-time | python3 -c 'import sys,json; print(len(json.load(sys.stdin)["leaderboard"]))'
echo -n "  Megado!nk all-time:    "; curl -s "https://app.playdoink.com/api/leaderboard/all-time?game=megadoink" | head -c 300; echo
echo -n "  megadoink.html:        "; curl -s -o /dev/null -w "%{http_code}\n" https://doink.playdoink.com/megadoink.html
echo
echo "Still to do: restart the worker (sudo)."
echo "Undo site files: for f in $FILES; do scp \"$B/\$f\" $HOST:$LIVE/\$f; done   (delete megadoink.config.json if it was new)"
echo "Undo API: ssh $HOST 'cd $API && php bin/console doctrine:migrations:migrate prev --no-interaction --env=prod', then restore ~/doink-backups/api-$STAMP.tgz"
