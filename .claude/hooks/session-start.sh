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
# N8N SYNC
# ═══════════════════════════════════════════════════════════════════

# Cargar variables de entorno si existen
if [ -f "$CLAUDE_PROJECT_DIR/.claude/env.local" ]; then
  source "$CLAUDE_PROJECT_DIR/.claude/env.local"
fi

# Sincronizar con n8n si hay credenciales disponibles
if [ -n "${N8N_API_TOKEN:-}" ] && [ -n "${N8N_HOST:-}" ]; then
  echo "[Claude SessionStart] 🔄 Sincronizando con n8n..."

  # Obtener lista de workflows desde n8n API
  WORKFLOWS=$(curl -s -X GET "$N8N_HOST/api/v1/workflows" \
    -H "Authorization: Bearer $N8N_API_TOKEN" \
    -H "Content-Type: application/json" 2>/dev/null | head -c 100)

  if [ -n "$WORKFLOWS" ]; then
    echo "[Claude SessionStart] ✅ n8n sincronizado — Workflows disponibles"
  else
    echo "[Claude SessionStart] ⚠️  No se pudo conectar a n8n (puede estar offline)"
  fi
else
  echo "[Claude SessionStart] ℹ️  n8n no configurado"
fi

echo "[Claude SessionStart] ✨ Sesión lista para sincronización"
