#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
ORG_ROOT="$ROOT_DIR/orgs"

mkdir -p "$ORG_ROOT"

usage() {
  cat <<'EOF'
Usage:
  sync-all-orgs.sh                  # sync all orgs you belong to
  sync-all-orgs.sh <org> [org...]   # sync only these org(s)

Examples:
  ./scripts/sync-all-orgs.sh BlackRoad-OS BlackRoad-AI
EOF
}

if ! command -v gh >/dev/null 2>&1; then
  echo "Missing 'gh' CLI. Install GitHub CLI first." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Not authenticated with GitHub. Run: gh auth login" >&2
  exit 1
fi

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

ORGS=()
if [[ "$#" -gt 0 ]]; then
  ORGS=("$@")
else
  mapfile -t ORGS < <("$ROOT_DIR/scripts/list-orgs.sh")
fi

for org in "${ORGS[@]}"; do
  echo
  echo "== $org =="
  mkdir -p "$ORG_ROOT/$org"

  # List repos (name + clone url). Includes private repos your token can access.
  gh repo list "$org" --limit 100000 --json name,sshUrl --jq '.[] | "\(.name)\t\(.sshUrl)"' |
  while IFS=$'\t' read -r name sshUrl; do
    dest="$ORG_ROOT/$org/$name"
    if [[ -d "$dest/.git" ]]; then
      echo "update $org/$name"
      git -C "$dest" fetch --prune --tags
    else
      echo "clone  $org/$name"
      git clone --filter=blob:none "$sshUrl" "$dest"
    fi
  done
done

echo
echo "Done. Repos are under: $ORG_ROOT"
