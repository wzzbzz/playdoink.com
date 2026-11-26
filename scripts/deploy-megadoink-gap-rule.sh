#!/bin/bash
# Deploys Megado!nk gap-round scoring (commit 1563c8a, Craig's Nov 9 10pm reply) — 2026-11-10.
# Run on Jim's Mac:  bash ~/Ampelos/greenhouse/Doink/scripts/deploy-megadoink-gap-rule.sh
# Site only, 2 files. Downloads the live copies as a backup, stops if either differs from
# commit 163ecd4 (the tier scoring that went live Nov 9), then uploads and sets 644.
set -e
HOST=sysop@playdoink.com
LIVE=/var/www/doink.playdoink.com/frontend
cd ~/Ampelos/greenhouse/Doink
BASE=163ecd4
FILES="js/games/megadoinkGame.js js/games/megadoink.config.json"
B=~/doink-backups/megadoink-gap-$(date +%Y%m%d-%H%M%S); mkdir -p "$B"
for f in $FILES; do
  mkdir -p "$B/$(dirname $f)"
  scp -q "$HOST:$LIVE/$f" "$B/$f"
  if ! git cat-file -p "$BASE:frontend/$f" | cmp -s - "$B/$f"; then
    echo "STOP: live $f differs from commit $BASE. Nothing uploaded. Diff:"
    git cat-file -p "$BASE:frontend/$f" | diff - "$B/$f" | head -40
    exit 1
  fi
done
echo "backup of live files: $B"
for f in $FILES; do git cat-file -p "1563c8a:frontend/$f" | ssh "$HOST" "cat > $LIVE/$f"; done
ssh "$HOST" "cd $LIVE && chmod 644 $FILES"
echo "deployed. Undo: for f in $FILES; do scp \"$B/\$f\" $HOST:$LIVE/\$f; done"
