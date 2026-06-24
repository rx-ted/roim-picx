#!/bin/bash
set -euo pipefail

target="${1:---remote}"

case "$target" in
  --local|--remote) ;;
  *) echo "Usage: $0 [--local|--remote]"; exit 1 ;;
esac

for file in migrations/*.sql; do
  echo "执行 $file ($target) ..."
  npx wrangler d1 execute picx-db "$target" --file="$file"
done
