#!/bin/bash
# Deploys the 2026-11-07 share-link + iPad share-button fix to doink.playdoink.com.
# Run on Jim's Mac:  bash ~/Ampelos/greenhouse/Doink/scripts/deploy-share-fix.sh
# 1. Downloads the live copies into a local backup folder.
# 2. Stops if any live file differs from the committed version (someone changed it on the server).
# 3. Uploads the 4 files, sets them readable (chmod 644).
set -e
HOST=sysop@playdoink.com
LIVE=/var/www/doink.playdoink.com/frontend
cd ~/Ampelos/greenhouse/Doink
BASE=2b182ef  # last commit before this fix; live files should match it
FILES="share.php save_score_image.php js/utils.js js/games/classicGame.js"
B=~/doink-backups/share-fix-$(date +%Y%m%d-%H%M%S); mkdir -p "$B"

for f in $FILES; do
  mkdir -p "$B/$(dirname $f)"
  scp -q "$HOST:$LIVE/$f" "$B/$f"
done
echo "backup of live files: $B"

for f in $FILES; do
  if ! git show "$BASE:frontend/$f" | cmp -s - "$B/$f"; then
    echo "STOP: live $f differs from commit $BASE. Nothing uploaded. Diff:"
    git show "$BASE:frontend/$f" | diff - "$B/$f" | head -40
    exit 1
  fi
done

for f in $FILES; do scp -q "frontend/$f" "$HOST:$LIVE/$f"; done
ssh "$HOST" "cd $LIVE && chmod 644 $FILES"
echo "deployed. To undo: for f in $FILES; do scp \"$B/\$f\" $HOST:$LIVE/\$f; done"
