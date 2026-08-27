#!/usr/bin/env bash
# =============================================================================
# Build statique pour GitHub Pages
#
# Next.js `output: "export"` ne supporte pas :
# - les API routes dynamiques
# - le middleware
# - certaines server actions
#
# Ce script déplace temporairement ces fichiers, lance le build, puis restaure.
# Le résultat (out/) contient uniquement les pages publiques ; les pages privées
# affichent un placeholder <PreviewNotice /> (cf. docs/AUDIT.md §9).
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Préparation du build statique (STATIC_EXPORT=1)"

BACKUP_DIR="$(mktemp -d)"
trap 'restore' EXIT

restore() {
  echo "→ Restauration des fichiers dynamiques"
  [ -d "$BACKUP_DIR/api" ] && mv "$BACKUP_DIR/api" src/app/api || true
  [ -f "$BACKUP_DIR/middleware.ts" ] && mv "$BACKUP_DIR/middleware.ts" src/middleware.ts || true
  rm -rf "$BACKUP_DIR"
}

# 1. Écarter API routes + middleware
if [ -d "src/app/api" ]; then
  mv src/app/api "$BACKUP_DIR/api"
fi
if [ -f "src/middleware.ts" ]; then
  mv src/middleware.ts "$BACKUP_DIR/middleware.ts"
fi

# 2. Build
export STATIC_EXPORT=1
export NEXT_PUBLIC_BASE_PATH="${NEXT_PUBLIC_BASE_PATH:-/danse-2-vivre}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://philthestyle.github.io/danse-2-vivre}"

echo "→ next build (STATIC_EXPORT=1, basePath=$NEXT_PUBLIC_BASE_PATH)"
npx next build

# 3. Fichier .nojekyll pour éviter que GH Pages ignore _next/
touch out/.nojekyll

echo "✓ Build statique terminé — sortie dans ./out"
