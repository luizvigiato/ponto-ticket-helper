#!/bin/bash

set -euo pipefail

# Usage:
#   ./deploy.sh              # deploy current branch
#   ./deploy.sh main         # force deploy from main branch
#
# Adjust these paths to your server layout.
APP_ROOT="/home/vigiatoc/repositories/ponto_app"
PUBLIC_SRC="$APP_ROOT/public"
PUBLIC_DST="/home/vigiatoc/public_html/ponto"
BRANCH="${1:-$(git -C "$APP_ROOT" rev-parse --abbrev-ref HEAD)}"

cd "$APP_ROOT"

echo "[deploy] branch: $BRANCH"
git fetch --all --prune
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "[deploy] laravel optimize + migrate"
php artisan optimize:clear
php artisan migrate --force
php artisan storage:link || true
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "[deploy] clean hot file"
rm -f "$PUBLIC_DST/hot"
rm -f "$PUBLIC_SRC/hot"

echo "[deploy] publish build files"
rm -rf "$PUBLIC_DST/build"
cp -r "$PUBLIC_SRC/build" "$PUBLIC_DST/"

APP_VERSION="$(git rev-parse --short HEAD)"
echo "[deploy] app version: $APP_VERSION"
sed "s/__APP_VERSION__/${APP_VERSION}/g" "$PUBLIC_SRC/sw.js" > "$PUBLIC_DST/sw.js"

cp "$PUBLIC_SRC"/{manifest.webmanifest,icon-192.png,icon-512.png,apple-touch-icon.png,favicon.ico,favicon.svg,robots.txt} "$PUBLIC_DST/"

echo "[deploy] permissions + storage symlink"
chmod -R 775 storage bootstrap/cache
ln -sfn "$APP_ROOT/storage/app/public" "$PUBLIC_DST/storage"

echo "[deploy] done"
