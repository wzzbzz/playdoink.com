#!/bin/bash
# Deploys Megado!nk share (2026-11-10). Also carries the Nov 7 Do!nk share-link + iPad fix (d63f152)
# in case that isn't live yet, since both touch the same files.
# Run on Jim's Mac:  bash ~/Ampelos/greenhouse/Doink/scripts/deploy-megadoink-share.sh
# Site only. Backs up the live files. Each live file must match one of the known versions below
# (before or after earlier deploys), otherwise it stops and uploads nothing. Then uploads, 644.
set -e
HOST=sysop@playdoink.com
LIVE=/var/www/doink.playdoink.com/frontend
cd ~/Ampelos/greenhouse/Doink
KNOWN="2b182ef d63f152 1563c8a b440d2a"
NEW=617a010
FILES="share.php save_score_image.php js/utils.js js/games/classicGame.js megadoink.html js/games/megadoinkGame.js"
B=~/doink-backups/megadoink-share-$(date +%Y%m%d-%H%M%S); mkdir -p "$B"
for f in $FILES; do
  mkdir -p "$B/$(dirname $f)"
  scp -q "$HOST:$LIVE/$f" "$B/$f"
  ok=""
  for c in $KNOWN $NEW; do git cat-file -p "$c:frontend/$f" 2>/dev/null | cmp -s - "$B/$f" && { ok=$c; break; }; done
  if [ -z "$ok" ]; then
    echo "STOP: live $f matches none of $KNOWN $NEW. Nothing uploaded. Diff against $NEW:"
    git cat-file -p "$NEW:frontend/$f" | diff - "$B/$f" | head -40
    exit 1
  fi
  echo "  $f: live is $ok"
done
echo "backup of live files: $B"
for f in $FILES; do git cat-file -p "$NEW:frontend/$f" | ssh "$HOST" "cat > $LIVE/$f"; done
ssh "$HOST" "cd $LIVE && chmod 644 $FILES"
echo "deployed $NEW. Undo: copy the files in $B back to $HOST:$LIVE/"
