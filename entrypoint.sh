#!/usr/bin/env sh
set -eu

WEB_ROOT="/usr/share/nginx/html"
ENV_JS="$WEB_ROOT/env.js"

escape_js_string() {
  # Basic escaping for JS string literals.
  # - backslash
  # - double quotes
  # - newlines/carriage returns
  printf '%s' "${1-}" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e ':a;N;$!ba;s/\n/\\n/g' -e 's/\r/\\r/g'
}

API_URL="${EGRC_API_URL_URL:-https://api.egrc.homologacao.com.br/api/v1/}"
COLLABORA_URL="${EGRC_COLLABORA_URL:-https://clbr.egrc.homologacao.com.br}"
MAPBOX_ACCESS_TOKEN="${MAPBOX_ACCESS_TOKEN:-}"
BASE_NAME="${BASE_NAME:-}"
GOOGLE_MAPS_API_KEY="${GOOGLE_MAPS_API_KEY:-}"
LO_BASE_URL="${LO_BASE_URL:-https://collabora.seuservidor.com}"

cat > "$ENV_JS" <<EOF
// Generated at container startup. Do not edit.
window.__ENV__ = {
  EGRC_API_URL_URL: "$(escape_js_string "$API_URL")",
  EGRC_COLLABORA_URL: "$(escape_js_string "$COLLABORA_URL")",
  MAPBOX_ACCESS_TOKEN: "$(escape_js_string "$MAPBOX_ACCESS_TOKEN")",
  BASE_NAME: "$(escape_js_string "$BASE_NAME")",
  GOOGLE_MAPS_API_KEY: "$(escape_js_string "$GOOGLE_MAPS_API_KEY")",
  LO_BASE_URL: "$(escape_js_string "$LO_BASE_URL")"
};
EOF

exec nginx -g 'daemon off;'
