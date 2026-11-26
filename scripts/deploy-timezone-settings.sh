#!/bin/bash
# Deploys the Settings screen (c9f49ea, 511fe15) and the Megado!nk round-end fade + new-board pause (68f9321).
# (The "today" timezone fix, 6974136/2f07aad, is already live: deployed by Jim on 2026-11-20.)
# Run on Jim's Mac:  bash ~/Ampelos/greenhouse/Doink/scripts/deploy-timezone-settings.sh
# (add --check to only back up and check the live files, without uploading anything)
#
# 1. Downloads the live copies of every file it will change into ~/doink-backups/tz-settings-<time>/.
# 2. Stops (uploads nothing) if any live file doesn't match a version committed in git,
#    i.e. it was edited on the server.
# 3. API first: uploads the 68f9321 versions, runs the migration (adds app_user.timezone), clears the prod cache.
# 4. Site: uploads the 68f9321 versions at 644.
# No worker restart needed.
set -e
HOST=sysop@playdoink.com
API=/var/www/playdoink.com/api
SITE=/var/www/doink.playdoink.com/frontend
REV=68f9321
cd ~/Ampelos/greenhouse/Doink

API_FILES="src/Repository/ScoreRepository.php src/Controller/LeaderboardController.php src/Controller/AuthController.php src/Entity/User.php migrations/Version20261118180000.php"
SITE_FILES="js/utils.js js/main.js js/games/classicGame.js js/games/megadoinkGame.js js/games/megadoink.config.json index.php templates/game-menu.php templates/settings.php megadoink.html css/megadoink.css"

B=~/doink-backups/tz-settings-$(date +%Y%m%d-%H%M%S)
mkdir -p "${B:?}/api" "${B:?}/site"

# check <dir prefix in repo> <live root> <backup dir> <file>
check() {
  local repo=$1 live=$2 bk=$3 f=$4
  mkdir -p "$bk/$(dirname "$f")"
  if ! scp -q "$HOST:$live/$f" "$bk/$f" 2>/dev/null; then
    echo "  $repo/$f: not on the server yet (new file)"
    rm -f "${bk:?}/${f:?}"
    return 0
  fi
  for c in $(git log --format=%h "$REV" -- "$repo/$f"); do
    if git cat-file -p "$c:$repo/$f" 2>/dev/null | cmp -s - "$bk/$f"; then echo "  $repo/$f: live is $c"; return 0; fi
  done
  echo "STOP: live $repo/$f matches no committed version (edited on the server). Nothing uploaded."
  git cat-file -p "$REV:$repo/$f" | diff - "$bk/$f" | head -30
  exit 1
}

echo "Checking live files..."
for f in $API_FILES; do check api "$API" "$B/api" "$f"; done
for f in $SITE_FILES; do check frontend "$SITE" "$B/site" "$f"; done
echo "Backup: $B"
if [ "$1" = "--check" ]; then echo "--check: live files are fine; nothing uploaded."; exit 0; fi

echo "Deploying API ($REV)..."
for f in $API_FILES; do
  git cat-file -p "$REV:api/$f" | ssh "$HOST" "mkdir -p $API/$(dirname "$f") && cat > $API/$f && chmod 644 $API/$f"
done
ssh "$HOST" "cd $API && php bin/console doctrine:migrations:migrate --no-interaction --env=prod 2>&1 | grep -E 'OK|ERROR|Migrating' ; php bin/console cache:clear --env=prod 2>&1 | grep -E 'OK|ERROR'"

echo "Deploying site ($REV)..."
for f in $SITE_FILES; do
  git cat-file -p "$REV:frontend/$f" | ssh "$HOST" "mkdir -p $SITE/$(dirname "$f") && cat > $SITE/$f && chmod 644 $SITE/$f"
done

echo
echo "Checks:"
echo -n "  daily?tz=Asia/Tokyo: ";  curl -s -o /dev/null -w "%{http_code}\n" "https://app.playdoink.com/api/leaderboard/daily?tz=Asia/Tokyo"
echo -n "  update-settings without login (expect 401): "; curl -s -o /dev/null -w "%{http_code}\n" -X POST https://app.playdoink.com/api/auth/update-settings -H 'Content-Type: application/json' -d '{"timezone":"UTC"}'
echo -n "  home page: ";      curl -s -o /dev/null -w "%{http_code}\n" https://doink.playdoink.com/
echo -n "  megadoink.html: "; curl -s -o /dev/null -w "%{http_code}\n" https://doink.playdoink.com/megadoink.html
echo
echo "Deployed $REV. Then push: git push origin main"
echo "Undo site: for f in $SITE_FILES; do [ -f $B/site/\$f ] && scp $B/site/\$f $HOST:$SITE/\$f; done   (delete templates/settings.php if it was new)"
echo "Undo API:  ssh $HOST 'cd $API && php bin/console doctrine:migrations:migrate prev --no-interaction --env=prod'; then copy $B/api/* back and cache:clear --env=prod"
