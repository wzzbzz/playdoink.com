#!/bin/bash
# Deploys today's Megado!nk work from Craig's Nov 10 notes (commits e65015b..b440d2a):
# grid options removed, big gold "+N", "ROUND N" graphic, gold hit sound, fanfare only on a new round.
# Run on Jim's Mac:  bash ~/Ampelos/greenhouse/Doink/scripts/deploy-megadoink-craig-nov10.sh
# Site only. Backs up the live files, stops if any differs from 1563c8a (what's live now), uploads, 644.
set -e
HOST=sysop@playdoink.com
LIVE=/var/www/doink.playdoink.com/frontend
cd ~/Ampelos/greenhouse/Doink
BASE=1563c8a
NEW=b440d2a
FILES="megadoink.html css/megadoink.css js/games/megadoinkGame.js js/sounds.js resources/gold.mp3"
B=~/doink-backups/megadoink-nov10-$(date +%Y%m%d-%H%M%S); mkdir -p "$B"
for f in $FILES; do
  mkdir -p "$B/$(dirname $f)"
  if scp -q "$HOST:$LIVE/$f" "$B/$f" 2>/dev/null; then
    if ! git cat-file -p "$BASE:frontend/$f" | cmp -s - "$B/$f"; then
      echo "STOP: live $f differs from commit $BASE. Nothing uploaded. Diff:"
      git cat-file -p "$BASE:frontend/$f" | diff - "$B/$f" | head -40
      exit 1
    fi
  else
    echo "(live $f doesn't exist yet: new file)"; rm -f "$B/$f"
  fi
done
echo "backup of live files: $B"
for f in $FILES; do git cat-file -p "$NEW:frontend/$f" | ssh "$HOST" "cat > $LIVE/$f"; done
ssh "$HOST" "cd $LIVE && chmod 644 $FILES"
echo "deployed. Undo: copy the files in $B back to $HOST:$LIVE/ (and delete resources/gold.mp3 there)."
