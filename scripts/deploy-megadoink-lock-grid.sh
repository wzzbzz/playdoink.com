#!/bin/bash
# Deploys commit e65015b: removes the grid-size links from the top of megadoink.html — 2026-11-10.
# Run on Jim's Mac:  bash ~/Ampelos/greenhouse/Doink/scripts/deploy-megadoink-lock-grid.sh
# Backs up the live file, stops if it differs from the version before this change, then uploads it (644).
set -e
HOST=sysop@playdoink.com
LIVE=/var/www/doink.playdoink.com/frontend
cd ~/Ampelos/greenhouse/Doink
f=megadoink.html
B=~/doink-backups/megadoink-lock-grid-$(date +%Y%m%d-%H%M%S); mkdir -p "$B"
scp -q "$HOST:$LIVE/$f" "$B/$f"
if ! git cat-file -p "e65015b~1:frontend/$f" | cmp -s - "$B/$f"; then
  echo "STOP: live $f differs from the version before this change. Nothing uploaded. Diff:"
  git cat-file -p "e65015b~1:frontend/$f" | diff - "$B/$f" | head -40
  exit 1
fi
echo "backup: $B/$f"
git cat-file -p "e65015b:frontend/$f" | ssh "$HOST" "cat > $LIVE/$f && chmod 644 $LIVE/$f"
echo "deployed. Undo: scp \"$B/$f\" $HOST:$LIVE/$f"
