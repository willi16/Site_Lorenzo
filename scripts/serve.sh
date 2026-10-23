#!/usr/bin/env bash
# Redémarre le serveur compilé en arrière-plan
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="${TMPDIR:-/tmp}/ba-construction-server.pid"
LOG_FILE="${TMPDIR:-/tmp}/ba-construction-server.log"

if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  kill "$(cat "$PID_FILE")" 2>/dev/null || true
  sleep 2
fi

cd "$ROOT"
setsid nohup node server/dist/index.js > "$LOG_FILE" 2>&1 < /dev/null &
echo $! > "$PID_FILE"
sleep 5

if kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Serveur démarré (PID $(cat "$PID_FILE")) — journal : $LOG_FILE"
else
  echo "Échec du démarrage — journal :"
  tail -20 "$LOG_FILE"
  exit 1
fi
