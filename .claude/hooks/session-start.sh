#!/bin/bash
set -euo pipefail

# SessionStart Hook: Sincronización automática GitHub + n8n
# Se ejecuta cada vez que se inicia una sesión en Claude Code web

echo '{"async": false}'

# ═══════════════════════════════════════════════════════════════════
# GITHUB SYNC
# ═══════════════════════════════════════════════════════════════════

if [ -d "$CLAUDE_PROJECT_DIR/.git" ]; then
  echo "[Claude SessionStart] 🔄 Sincronizando con GitHub..."

  cd "$CLAUDE_PROJECT_DIR"

  # Obtener rama actual sin fallar si está en detached state
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "HEAD")

  # Fetch de remoto
  git fetch origin "$CURRENT_BRANCH" 2>/dev/null || true

  # Pull si hay cambios y estamos en una rama (no en detached)
  if [ "$CURRENT_BRANCH" != "HEAD" ]; then
    git pull origin "$CURRENT_BRANCH" --ff-only 2>/dev/null || {
      # Si --ff-only falla (hay conflictos), avisa pero continúa
      echo "[Claude SessionStart] ⚠️  No se pudo hacer pull automático (conflictos o cambios locales)"
    }
  fi

  echo "[Claude SessionStart] ✅ GitHub sincronizado"
else
  echo "[Claude SessionStart] ℹ️  No es un repositorio git"
fi

# ═══════════════════════════════════════════════════════════════════
# N8N SYNC (placeholder para después)
# ═══════════════════════════════════════════════════════════════════

# TODO: Agregar sincronización con n8n cuando tengas:
# - N8N_WEBHOOK_URL o N8N_API_KEY + N8N_HOST
#
# Ejemplo webhook:
# if [ -n "${N8N_WEBHOOK_URL:-}" ]; then
#   curl -X POST "$N8N_WEBHOOK_URL" -H "Content-Type: application/json" \
#     -d '{"action":"sync","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' || true
# fi

echo "[Claude SessionStart] ✨ Sesión lista para sincronización"
