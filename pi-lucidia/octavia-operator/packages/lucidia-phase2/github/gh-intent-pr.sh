#!/usr/bin/env bash
set -e

INTENT_FILE="$1"
[[ -z "$INTENT_FILE" ]] && { echo "Usage: gh-intent-pr.sh <intent.md>"; exit 1; }

BRANCH="lucidia-intent-$(date +%Y%m%d-%H%M%S)"
API="https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO"

BASE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API" | jq -r .default_branch)

SHA=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "$API/git/ref/heads/$BASE" | jq -r .object.sha)

TREE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "$API/git/trees/$SHA" | jq -r .sha)

BLOB=$(curl -i -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "$API/git/blobs" \
  -d "$(jq -n --arg c "$(cat "$INTENT_FILE")" '{content:$c,encoding:"utf-8"}')" \
  | jq -r .sha)

NEWTREE=$(curl -i -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  "$API/git/trees" \
  -d "$(jq -n --arg base "$TREE" --arg blob "$BLOB" \
  '{base_tree:$base, tree:[{path:"LUCIDIA_INTENT.md", mode:"100644", type:"blob", sha:$blob}]}')" \
  | jq -r .sha)

COMMIT=$(curl -i -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  "$API/git/commits" \
  -d "$(jq -n --arg tree "$NEWTREE" --arg parent "$SHA" \
  '{message:"Lucidia intent proposal", tree:$tree, parents:[$parent]}')" \
  | jq -r .sha)

curl -i -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  "$API/git/refs" \
  -d "$(jq -n --arg ref "refs/heads/$BRANCH" --arg sha "$COMMIT" \
  '{ref:$ref, sha:$sha}')" >/dev/null

curl -i -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  "$API/pulls" \
  -d "$(jq -n --arg head "$BRANCH" --arg base "$BASE" \
  '{title:"Lucidia Intent","head":$head,"base":$base}')" \
  | jq '{html_url}'
