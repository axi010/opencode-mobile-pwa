#!/usr/bin/env bash
# Acceso de la PWA al movil por HTTPS (contexto seguro: PIN + SW + notificaciones).
# Version para macOS/Linux. En Windows usa scripts/movil.ps1.
#
# Que hace:
#   1. Comprueba que la PWA esta servida (preview de Vite en :4173). Si no, la arranca.
#   2. Levanta un tunel rapido de Cloudflare -> https://<algo>.trycloudflare.com
#   3. Genera el QR con qr-pairing.mjs apuntando a esa URL.
#
# Uso:
#   bash scripts/movil.sh            # preview + tunel + QR
#   bash scripts/movil.sh --no-tunnel  # reutiliza la ultima URL de tunel guardada
#
# Requisitos: node, npm y cloudflared en el PATH
#   (Cloudflare: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)
set -euo pipefail

PUERTO="${PUERTO:-4173}"
PWA_DIR="$(cd "$(dirname "$0")/.." && pwd)"
URL_GUARDADA="${TMPDIR:-/tmp}/opencode-movil-url.txt"
USAR_TUNEL=1
[ "${1:-}" = "--no-tunnel" ] && USAR_TUNEL=0

echo "== Acceso movil de la PWA =="

# --- PWA servida ---
if ! curl -fsS "http://localhost:$PUERTO/" >/dev/null 2>&1; then
  echo "La PWA no responde en :$PUERTO -> arrancando preview..."
  ( cd "$PWA_DIR" && npm run preview -- --port "$PUERTO" >/dev/null 2>&1 & )
  for _ in $(seq 1 30); do
    curl -fsS "http://localhost:$PUERTO/" >/dev/null 2>&1 && break
    sleep 1
  done
fi
curl -fsS "http://localhost:$PUERTO/" >/dev/null 2>&1 || { echo "ERROR: la preview no arranco"; exit 1; }
echo "PWA OK en http://localhost:$PUERTO"

# --- tunel ---
if [ "$USAR_TUNEL" = "0" ]; then
  [ -f "$URL_GUARDADA" ] || { echo "ERROR: no hay URL guardada. Ejecuta sin --no-tunnel."; exit 1; }
  PWA_URL="$(cat "$URL_GUARDADA")"
  echo "Usando URL guardada: $PWA_URL"
else
  command -v cloudflared >/dev/null 2>&1 || {
    echo "ERROR: cloudflared no esta instalado."
    echo "  macOS:  brew install cloudflared"
    echo "  Linux:  https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
    exit 1
  }
  LOG="$(mktemp)"
  cloudflared tunnel --url "http://localhost:$PUERTO" --no-autoupdate >"$LOG" 2>&1 &
  CF_PID=$!
  echo "Levantando tunel (PID $CF_PID)..."
  PWA_URL=""
  for _ in $(seq 1 40); do
    sleep 1
    PWA_URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG" | head -1 || true)"
    [ -n "$PWA_URL" ] && break
  done
  [ -n "$PWA_URL" ] || { echo "ERROR: no se obtuvo la URL del tunel. Revisa $LOG"; exit 1; }
  echo "$PWA_URL" > "$URL_GUARDADA"
  echo "Tunel PWA: $PWA_URL"
  echo "(para cortarlo: kill $CF_PID)"
fi

# --- QR ---
echo "Generando QR..."
cd "$PWA_DIR"
node scripts/qr-pairing.mjs "$PWA_URL"

echo ""
echo "Escanea el QR desde el movil. El QR abre la PWA por HTTPS:"
echo "PIN, service worker y notificaciones activos."
echo "IMPORTANTE: la URL del tunel cambia en cada arranque -> reescanea el QR."
