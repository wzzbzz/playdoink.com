#!/bin/bash
# Deploys Megado!nk share (2026-11-10). Also carries the Nov 7 Do!nk share-link + iPad fix (d63f152)
# in case that isn't live yet, since both touch the same files.
# Run on Jim's Mac:  bash ~/Ampelos/greenhouse/Doink/scripts/deploy-megadoink-share.sh
# Site only. Backs up the live files. Each live file must match some committed version of itself
# (i.e. something already deployed), otherwise it stops and uploads nothing. Then uploads, 644.
set -e
HOST=sysop@playdoink.com
LIVE=/var/www/doink.playdoink.com/frontend
cd ~/Ampelos/greenhouse/Doink
NEW=9bb24b0
FILES="share.php save_score_image.php js/utils.js js/games/classicGame.js megadoink.html js/games/megadoinkGame.js css/megadoink.css src/ScoreImage.php resources/fonts/LuckiestGuy-Regular.ttf"
B=~/doink-backups/megadoink-share-$(date +%Y%m%d-%H%M%S); mkdir -p "$B"
for f in $FILES; do
  mkdir -p "$B/$(dirname $f)"
  if ! scp -q "$HOST:$LIVE/$f" "$B/$f" 2>/dev/null; then
    git cat-file -e "2b182ef:frontend/$f" 2>/dev/null && { echo "STOP: live $f is missing. Nothing uploaded."; exit 1; }
    echo "  $f: new file"; rm -f "$B/$f"; continue
  fi
  ok=""
  # Accept any version of this file that was ever committed (i.e. something we deployed); stop on anything else.
  for c in $NEW $(git log --format=%h "$NEW" -- "frontend/$f"); do git cat-file -p "$c:frontend/$f" 2>/dev/null | cmp -s - "$B/$f" && { ok=$c; break; }; done
  if [ -z "$ok" ]; then
    echo "STOP: live $f matches no committed version. Nothing uploaded. Diff against $NEW:"
    git cat-file -p "$NEW:frontend/$f" | diff - "$B/$f" | head -40
    exit 1
  fi
  echo "  $f: live is $ok"
done
echo "backup of live files: $B"
ssh "$HOST" "mkdir -p $LIVE/src $LIVE/resources/fonts"
for f in $FILES; do git cat-file -p "$NEW:frontend/$f" | ssh "$HOST" "cat > $LIVE/$f"; done
ssh "$HOST" "cd $LIVE && chmod 644 $FILES"
echo "deployed $NEW. Undo: copy the files in $B back to $HOST:$LIVE/"
echo -n "Server can draw share images (GD + FreeType): "
ssh "$HOST" "php -r 'echo function_exists(\"imagettftext\") ? \"yes\" : \"NO (falls back to checked uploads)\";'"; echo
