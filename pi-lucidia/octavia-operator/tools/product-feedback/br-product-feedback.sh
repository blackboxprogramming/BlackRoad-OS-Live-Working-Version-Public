#!/bin/zsh
# BR Product Feedback — Dig through orgs, submit favorites, surface what works
# Usage: br feedback <command>
#
# Commands:
#   dig [org]         Scan org(s) for useful products, scripts, tools
#   dig-all           Dig through ALL 17 organizations
#   submit            Submit a favorite product/script/tool
#   vote <id>         Upvote a submission
#   list              Show all submissions ranked by votes
#   top [n]           Show top N favorites (default 10)
#   search <query>    Search submissions
#   report            Generate full feedback report across orgs
#   export            Export all feedback as JSON
#   broadcast         Broadcast call-for-feedback to all agents

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
PURPLE='\033[0;95m'
NC='\033[0m'
BOLD='\033[1m'

DB="$HOME/.blackroad/product-feedback.db"
DIGGER_DIR="$HOME/.blackroad/product-feedback"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# All 17 BlackRoad orgs
ORGS=(
  "BlackRoad-OS-Inc"
  "BlackRoad-OS"
  "blackboxprogramming"
  "BlackRoad-AI"
  "BlackRoad-Cloud"
  "BlackRoad-Security"
  "BlackRoad-Media"
  "BlackRoad-Foundation"
  "BlackRoad-Interactive"
  "BlackRoad-Hardware"
  "BlackRoad-Labs"
  "BlackRoad-Studio"
  "BlackRoad-Ventures"
  "BlackRoad-Education"
  "BlackRoad-Gov"
  "Blackbox-Enterprises"
  "BlackRoad-Archive"
)

# ─────────────────────────────────────────
# Database
# ─────────────────────────────────────────

init_db() {
  mkdir -p "$DIGGER_DIR"
  sqlite3 "$DB" <<'SQL'
CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    org TEXT,
    category TEXT DEFAULT 'product',
    description TEXT,
    url TEXT,
    submitted_by TEXT DEFAULT 'anonymous',
    votes INTEGER DEFAULT 1,
    tags TEXT,
    source TEXT DEFAULT 'manual',
    discovered_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS dig_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org TEXT NOT NULL,
    repo TEXT,
    item_type TEXT,
    name TEXT,
    path TEXT,
    description TEXT,
    stars INTEGER DEFAULT 0,
    language TEXT,
    useful_score INTEGER DEFAULT 0,
    dug_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER,
    voter TEXT DEFAULT 'anonymous',
    voted_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (submission_id) REFERENCES submissions(id)
);
CREATE TABLE IF NOT EXISTS dig_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org TEXT,
    repos_scanned INTEGER DEFAULT 0,
    items_found INTEGER DEFAULT 0,
    started_at TEXT DEFAULT (datetime('now')),
    finished_at TEXT
);
SQL
}

# ─────────────────────────────────────────
# Digger — Scan an org for useful stuff
# ─────────────────────────────────────────

cmd_dig() {
  init_db
  local target_org="${1:-}"

  if [[ -z "$target_org" ]]; then
    echo -e "${CYAN}${BOLD}⛏️  PRODUCT DIGGER${NC}"
    echo -e "${CYAN}─────────────────────────────${NC}"
    echo ""
    echo -e "  Usage: ${YELLOW}br feedback dig <org>${NC}"
    echo -e "         ${YELLOW}br feedback dig-all${NC}  (scan everything)"
    echo ""
    echo -e "  ${BOLD}Available Orgs:${NC}"
    for org in "${ORGS[@]}"; do
      echo -e "    ${GREEN}•${NC} $org"
    done
    return 0
  fi

  echo -e "${CYAN}${BOLD}⛏️  DIGGING: ${YELLOW}$target_org${NC}"
  echo -e "${CYAN}═══════════════════════════════════════${NC}"
  echo ""

  # Record dig run
  sqlite3 "$DB" "INSERT INTO dig_runs(org) VALUES('$target_org');"
  local run_id
  run_id=$(sqlite3 "$DB" "SELECT MAX(id) FROM dig_runs;")
  local items_found=0
  local repos_scanned=0

  # Try GitHub API first
  if command -v gh &>/dev/null; then
    echo -e "  ${BLUE}🔍 Scanning GitHub repos for ${target_org}...${NC}"
    echo ""

    local repos_json
    repos_json=$(gh api "orgs/$target_org/repos?per_page=100&sort=updated&type=all" 2>/dev/null || echo "[]")

    if [[ "$repos_json" != "[]" ]] && [[ -n "$repos_json" ]]; then
      local repo_count
      repo_count=$(echo "$repos_json" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
      repos_scanned=$repo_count

      echo -e "  ${GREEN}✓${NC} Found ${BOLD}$repo_count${NC} repos"
      echo ""

      # Parse repos and find interesting ones
      echo "$repos_json" | python3 -c "
import sys, json
repos = json.load(sys.stdin)
for r in repos:
    name = r.get('name', '')
    desc = (r.get('description') or '').replace(\"'\", \"''\")
    lang = r.get('language') or 'unknown'
    stars = r.get('stargazers_count', 0)
    url = r.get('html_url', '')
    fork = r.get('fork', False)
    topics = ','.join(r.get('topics', []))
    # Score usefulness
    score = stars
    if desc and len(desc) > 10: score += 2
    if not fork: score += 3
    if topics: score += 2
    if lang in ['Python', 'TypeScript', 'JavaScript', 'Go', 'Rust']: score += 1
    # Print tab-separated for bash
    print(f'{name}\t{desc}\t{lang}\t{stars}\t{url}\t{score}\t{topics}\t{\"fork\" if fork else \"original\"}')
" 2>/dev/null | while IFS=$'\t' read -r name desc lang stars url score topics source_type; do
        # Store in dig_results
        # Escape single quotes in all string fields before inserting into SQLite
        org_esc=$(printf "%s" "$target_org" | sed "s/'/''/g")
        name_esc=$(printf "%s" "$name" | sed "s/'/''/g")
        type_esc=$(printf "%s" "$source_type" | sed "s/'/''/g")
        url_esc=$(printf "%s" "$url" | sed "s/'/''/g")
        lang_esc=$(printf "%s" "$lang" | sed "s/'/''/g")
        desc_esc=$(printf "%s" "$desc" | sed "s/'/''/g")
        sqlite3 "$DB" "INSERT INTO dig_results(org, repo, item_type, name, path, description, stars, language, useful_score)
          VALUES('$org_esc', '$name_esc', '$type_esc', '$name_esc', '$url_esc', '$desc_esc', $stars, '$lang_esc', $score);" 2>/dev/null
        ((items_found++))

        # Display interesting ones (score > 3)
        if [[ "$score" -gt 3 ]]; then
          local icon="📦"
          [[ "$source_type" == "fork" ]] && icon="🔀"
          [[ "$stars" -gt 5 ]] && icon="⭐"
          echo -e "    ${icon} ${BOLD}$name${NC} ${MAGENTA}[$lang]${NC} ★$stars"
          [[ -n "$desc" ]] && echo -e "       ${desc:0:80}"
          [[ -n "$topics" ]] && echo -e "       ${CYAN}#${topics//,/ #}${NC}"
        fi
      done
    else
      echo -e "  ${YELLOW}⚠${NC} Could not fetch repos (check auth or org name)"

      # Fall back to scanning local orgs/ directory
      dig_local "$target_org"
    fi
  else
    echo -e "  ${YELLOW}⚠${NC} gh CLI not found — scanning local directories"
    dig_local "$target_org"
  fi

  # Also scan local directories
  dig_local_scripts "$target_org"

  # Update dig run
  sqlite3 "$DB" "UPDATE dig_runs SET repos_scanned=$repos_scanned, items_found=$items_found, finished_at=datetime('now') WHERE id=$run_id;"

  echo ""
  echo -e "  ${GREEN}${BOLD}⛏️  Dig complete!${NC}"
  echo -e "  ${GREEN}✓${NC} Repos scanned: ${BOLD}$repos_scanned${NC}"
  echo -e "  ${GREEN}✓${NC} Items found: ${BOLD}$items_found${NC}"
  echo ""
  echo -e "  ${CYAN}Run ${YELLOW}br feedback list${CYAN} to see all discoveries${NC}"
}

dig_local() {
  local org="$1"
  local org_lower
  org_lower=$(echo "$org" | tr '[:upper:]' '[:lower:]')

  # Check orgs/ directory
  for dir in "$REPO_ROOT/orgs/"*/; do
    local dirname
    dirname=$(basename "$dir")
    if [[ "$dirname" == *"$org_lower"* ]] || [[ "$org_lower" == *"$dirname"* ]]; then
      echo -e "  ${BLUE}📂 Scanning local: orgs/$dirname/${NC}"
      for repo_dir in "$dir"*/; do
        [[ -d "$repo_dir" ]] || continue
        local repo_name
        repo_name=$(basename "$repo_dir")
        local desc=""
        # Read description from README or CLAUDE.md
        if [[ -f "$repo_dir/CLAUDE.md" ]]; then
          desc=$(head -5 "$repo_dir/CLAUDE.md" | grep -v "^#" | head -1 | tr -d '\n')
        elif [[ -f "$repo_dir/README.md" ]]; then
          desc=$(head -5 "$repo_dir/README.md" | grep -v "^#" | head -1 | tr -d '\n')
        fi
        local lang="unknown"
        [[ -f "$repo_dir/package.json" ]] && lang="JavaScript/TypeScript"
        [[ -f "$repo_dir/pyproject.toml" || -f "$repo_dir/setup.py" ]] && lang="Python"
        [[ -f "$repo_dir/go.mod" ]] && lang="Go"
        [[ -f "$repo_dir/Cargo.toml" ]] && lang="Rust"

        sqlite3 "$DB" "INSERT INTO dig_results(org, repo, item_type, name, path, description, language, useful_score)
          VALUES('$org', '$repo_name', 'local', '$repo_name', '$repo_dir', '$(echo "$desc" | sed "s/'/''/g")', '$lang', 3);" 2>/dev/null

        echo -e "    ${GREEN}•${NC} ${BOLD}$repo_name${NC} ${MAGENTA}[$lang]${NC}"
        [[ -n "$desc" ]] && echo -e "       $desc"
      done
    fi
  done
}

dig_local_scripts() {
  local org="$1"

  # Scan tools/ for scripts related to this org's domain
  local org_lower
  org_lower=$(echo "$org" | tr '[:upper:]' '[:lower:]' | sed 's/blackroad-//;s/blackbox-//')

  echo ""
  echo -e "  ${BLUE}🔧 Scanning tools/ for ${org_lower}-related scripts...${NC}"

  for tool_dir in "$REPO_ROOT/tools/"*/; do
    [[ -d "$tool_dir" ]] || continue
    local tool_name
    tool_name=$(basename "$tool_dir")
    if [[ "$tool_name" == *"$org_lower"* ]] || grep -qil "$org_lower\|$org" "$tool_dir"/*.sh 2>/dev/null; then
      echo -e "    ${YELLOW}⚡${NC} ${BOLD}tools/$tool_name${NC} — related script found"
      sqlite3 "$DB" "INSERT INTO dig_results(org, repo, item_type, name, path, description, useful_score)
        VALUES('$org', 'tools/$tool_name', 'script', '$tool_name', '$tool_dir', 'CLI tool in tools/', 4);" 2>/dev/null
    fi
  done
}

cmd_dig_all() {
  init_db
  echo -e "${CYAN}${BOLD}"
  echo "  ⛏️⛏️⛏️  MEGA DIG — ALL 17 ORGANIZATIONS  ⛏️⛏️⛏️"
  echo -e "${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
  echo ""

  local total_items=0
  local total_repos=0

  for org in "${ORGS[@]}"; do
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    cmd_dig "$org"
    echo ""
  done

  # Summary
  local total
  total=$(sqlite3 "$DB" "SELECT COUNT(*) FROM dig_results;")
  local orgs_dug
  orgs_dug=$(sqlite3 "$DB" "SELECT COUNT(DISTINCT org) FROM dig_results;")

  echo -e "${GREEN}${BOLD}"
  echo "  ══════════════════════════════════════"
  echo "  ⛏️  MEGA DIG COMPLETE"
  echo "  ══════════════════════════════════════"
  echo -e "${NC}"
  echo -e "  ${GREEN}✓${NC} Organizations scanned: ${BOLD}$orgs_dug${NC}"
  echo -e "  ${GREEN}✓${NC} Total items discovered: ${BOLD}$total${NC}"
  echo ""
  echo -e "  ${CYAN}Now run:${NC}"
  echo -e "    ${YELLOW}br feedback report${NC}    — See the full report"
  echo -e "    ${YELLOW}br feedback broadcast${NC} — Ask everyone for favorites"
}

# ─────────────────────────────────────────
# Submit — Add a favorite
# ─────────────────────────────────────────

cmd_submit() {
  init_db

  echo -e "${CYAN}${BOLD}📝 SUBMIT YOUR FAVORITE${NC}"
  echo -e "${CYAN}────────────────────────${NC}"
  echo ""

  # Accept inline args or prompt
  local name="${1:-}"
  local category="${2:-}"
  local description="${3:-}"
  local org="${4:-}"
  local tags="${5:-}"
  local submitted_by="${6:-}"
  local url="${7:-}"

  if [[ -z "$name" ]]; then
    echo -e "  ${BOLD}What's the name?${NC} (product, script, tool, etc.)"
    read -r -p "  > " name
    [[ -z "$name" ]] && { echo -e "  ${RED}✗${NC} Name required"; return 1; }

    echo ""
    echo -e "  ${BOLD}Category?${NC} [product/script/tool/workflow/config/other]"
    read -r -p "  > " category
    category="${category:-product}"

    echo ""
    echo -e "  ${BOLD}Why is it useful?${NC} (short description)"
    read -r -p "  > " description

    echo ""
    echo -e "  ${BOLD}Which org?${NC} (or press enter to skip)"
    read -r -p "  > " org

    echo ""
    echo -e "  ${BOLD}Tags?${NC} (comma-separated, e.g. ai,deploy,monitoring)"
    read -r -p "  > " tags

    echo ""
    echo -e "  ${BOLD}Your name?${NC} (or press enter for anonymous)"
    read -r -p "  > " submitted_by
    submitted_by="${submitted_by:-anonymous}"

    echo ""
    echo -e "  ${BOLD}URL?${NC} (optional link)"
    read -r -p "  > " url
  fi

  # Ensure defaults and escape single quotes for SQL
  category="${category:-product}"
  submitted_by="${submitted_by:-anonymous}"

  name=$(echo "$name" | sed "s/'/''/g")
  description=$(echo "$description" | sed "s/'/''/g")
  org=$(echo "$org" | sed "s/'/''/g")
  tags=$(echo "$tags" | sed "s/'/''/g")
  submitted_by=$(echo "$submitted_by" | sed "s/'/''/g")
  url=$(echo "$url" | sed "s/'/''/g")
  category=$(echo "$category" | sed "s/'/''/g")

  sqlite3 "$DB" "INSERT INTO submissions(name, org, category, description, url, submitted_by, tags, source)
    VALUES('$name', '$org', '$category', '$description', '$url', '$submitted_by', '$tags', 'manual');"

  local new_id
  new_id=$(sqlite3 "$DB" "SELECT MAX(id) FROM submissions;")

  echo ""
  echo -e "  ${GREEN}${BOLD}✓ Submitted!${NC} ID: ${YELLOW}#$new_id${NC}"
  echo -e "  ${GREEN}•${NC} ${BOLD}$name${NC} [${category:-product}]"
  [[ -n "$description" ]] && echo -e "  ${GREEN}•${NC} $description"
  [[ -n "$tags" ]] && echo -e "  ${GREEN}•${NC} Tags: ${CYAN}#${tags//,/ #}${NC}"
  echo ""
  echo -e "  ${CYAN}Share with others: ${YELLOW}br feedback vote $new_id${NC}"
}

# Quick submit (one-liner)
cmd_quick() {
  init_db
  local name="$1"
  local description="$2"
  local category="${3:-product}"
  local tags="${4:-}"
  local submitted_by="${5:-anonymous}"

  [[ -z "$name" ]] && { echo -e "${RED}✗${NC} Usage: br feedback quick <name> [description] [category] [tags] [by]"; return 1; }

  name=$(echo "$name" | sed "s/'/''/g")
  description=$(echo "$description" | sed "s/'/''/g")

  sqlite3 "$DB" "INSERT INTO submissions(name, category, description, submitted_by, tags, source)
    VALUES('$name', '$category', '$description', '$submitted_by', '$tags', 'quick');"

  local new_id
  new_id=$(sqlite3 "$DB" "SELECT MAX(id) FROM submissions;")
  echo -e "${GREEN}✓${NC} Submitted ${BOLD}$name${NC} (${YELLOW}#$new_id${NC})"
}

# ─────────────────────────────────────────
# Vote — Upvote a submission
# ─────────────────────────────────────────

cmd_vote() {
  init_db
  local sub_id="$1"
  local voter="${2:-anonymous}"

  [[ -z "$sub_id" ]] && { echo -e "${RED}✗${NC} Usage: br feedback vote <id> [voter-name]"; return 1; }
  # Ensure sub_id is digits-only to prevent SQL injection
  if ! [[ "$sub_id" =~ ^[0-9]+$ ]]; then
    echo -e "${RED}✗${NC} Invalid submission id: $sub_id (must be a positive integer)"
    return 1
  fi

  # Escape single quotes in voter to keep SQL safe
  local safe_voter="${voter//\'/\'\'}"

  # Check exists
  local exists
  exists=$(sqlite3 "$DB" "SELECT COUNT(*) FROM submissions WHERE id=$sub_id;")
  [[ "$exists" -eq 0 ]] && { echo -e "${RED}✗${NC} Submission #$sub_id not found"; return 1; }

  sqlite3 "$DB" "UPDATE submissions SET votes = votes + 1, updated_at = datetime('now') WHERE id = $sub_id;"
  sqlite3 "$DB" "INSERT INTO votes(submission_id, voter) VALUES($sub_id, '$safe_voter');"

  local name votes
  name=$(sqlite3 "$DB" "SELECT name FROM submissions WHERE id=$sub_id;")
  votes=$(sqlite3 "$DB" "SELECT votes FROM submissions WHERE id=$sub_id;")

  echo -e "${GREEN}✓${NC} Voted for ${BOLD}$name${NC} — now at ${YELLOW}$votes${NC} votes 🔥"
}

# ─────────────────────────────────────────
# List — Show all submissions
# ─────────────────────────────────────────

cmd_list() {
  init_db

  echo -e "${CYAN}${BOLD}📋 ALL SUBMISSIONS${NC} (by votes)"
  echo -e "${CYAN}═════════════════════════════════════════════════${NC}"
  echo ""

  local count
  count=$(sqlite3 "$DB" "SELECT COUNT(*) FROM submissions;")

  if [[ "$count" -eq 0 ]]; then
    echo -e "  ${YELLOW}No submissions yet!${NC}"
    echo ""
    echo -e "  Get started:"
    echo -e "    ${YELLOW}br feedback submit${NC}     — Add your favorite"
    echo -e "    ${YELLOW}br feedback dig-all${NC}    — Auto-discover from orgs"
    return 0
  fi

  sqlite3 -separator '|' "$DB" "
    SELECT id, name, category, org, votes, tags, submitted_by, description
    FROM submissions
    ORDER BY votes DESC, discovered_at DESC;" | while IFS='|' read -r id name cat org votes tags by desc; do

    local icon="📦"
    case "$cat" in
      script) icon="📜" ;;
      tool) icon="🔧" ;;
      workflow) icon="⚙️" ;;
      config) icon="📋" ;;
      product) icon="🎯" ;;
    esac

    local vote_bar=""
    for ((i=0; i<votes && i<10; i++)); do vote_bar+="▮"; done

    echo -e "  ${YELLOW}#$id${NC} $icon ${BOLD}$name${NC} ${MAGENTA}[$cat]${NC}"
    [[ -n "$org" ]] && echo -e "       Org: ${CYAN}$org${NC}"
    [[ -n "$desc" ]] && echo -e "       ${desc:0:80}"
    echo -e "       Votes: ${GREEN}$vote_bar${NC} ${BOLD}$votes${NC}  by: $by"
    [[ -n "$tags" ]] && echo -e "       ${CYAN}#${tags//,/ #}${NC}"
    echo ""
  done

  echo -e "  ${CYAN}Total: ${BOLD}$count${NC} submissions"
}

# ─────────────────────────────────────────
# Top — Show top N favorites
# ─────────────────────────────────────────

cmd_top() {
  init_db
  local limit="${1:-10}"

  echo -e "${CYAN}${BOLD}🏆 TOP $limit FAVORITES${NC}"
  echo -e "${CYAN}═════════════════════════════════════════════════${NC}"
  echo ""

  local rank=0
  sqlite3 -separator '|' "$DB" "
    SELECT id, name, category, votes, tags, description
    FROM submissions
    ORDER BY votes DESC
    LIMIT $limit;" | while IFS='|' read -r id name cat votes tags desc; do

    ((rank++))
    local medal=""
    case "$rank" in
      1) medal="🥇" ;;
      2) medal="🥈" ;;
      3) medal="🥉" ;;
      *) medal="  ${rank}." ;;
    esac

    echo -e "  $medal ${BOLD}$name${NC} ${MAGENTA}[$cat]${NC} — ${GREEN}${votes} votes${NC}"
    [[ -n "$desc" ]] && echo -e "       $desc"
    [[ -n "$tags" ]] && echo -e "       ${CYAN}#${tags//,/ #}${NC}"
  done
  echo ""
}

# ─────────────────────────────────────────
# Search — Find submissions
# ─────────────────────────────────────────

cmd_search() {
  init_db
  local query="$1"
  [[ -z "$query" ]] && { echo -e "${RED}✗${NC} Usage: br feedback search <query>"; return 1; }

  echo -e "${CYAN}${BOLD}🔍 Search: ${YELLOW}$query${NC}"
  echo -e "${CYAN}─────────────────────────────${NC}"
  echo ""

  local found=0
  # Escape query for safe use in SQL LIKE
  local like_query="$query"
  like_query="${like_query//\'/\'\'}"   # escape single quotes for SQL string literal
  like_query="${like_query//%/\\%}"     # escape % so it's treated literally
  like_query="${like_query//_/\\_}"     # escape _ so it's treated literally

  sqlite3 -separator '|' "$DB" "
    SELECT id, name, category, votes, org, description, tags
    FROM submissions
    WHERE name LIKE '%' || '$like_query' || '%' ESCAPE '\\'
       OR description LIKE '%' || '$like_query' || '%' ESCAPE '\\'
       OR tags LIKE '%' || '$like_query' || '%' ESCAPE '\\'
       OR org LIKE '%' || '$like_query' || '%' ESCAPE '\\'
    ORDER BY votes DESC;" | while IFS='|' read -r id name cat votes org desc tags; do
    ((found++))
    echo -e "  ${YELLOW}#$id${NC} ${BOLD}$name${NC} ${MAGENTA}[$cat]${NC} — ${GREEN}${votes} votes${NC}"
    [[ -n "$org" ]] && echo -e "       Org: ${CYAN}$org${NC}"
    [[ -n "$desc" ]] && echo -e "       $desc"
    [[ -n "$tags" ]] && echo -e "       ${CYAN}#${tags//,/ #}${NC}"
    echo ""
  done

  [[ "$found" -eq 0 ]] && echo -e "  ${YELLOW}No results for '$query'${NC}"
}

# ─────────────────────────────────────────
# Report — Full feedback report
# ─────────────────────────────────────────

cmd_report() {
  init_db

  echo -e "${CYAN}${BOLD}"
  echo "  ╔══════════════════════════════════════════╗"
  echo "  ║   📊 PRODUCT FEEDBACK REPORT             ║"
  echo "  ║   BlackRoad OS — All 17 Organizations    ║"
  echo "  ╚══════════════════════════════════════════╝"
  echo -e "${NC}"

  local total_subs total_digs total_votes total_orgs
  total_subs=$(sqlite3 "$DB" "SELECT COUNT(*) FROM submissions;" 2>/dev/null || echo 0)
  total_digs=$(sqlite3 "$DB" "SELECT COUNT(*) FROM dig_results;" 2>/dev/null || echo 0)
  total_votes=$(sqlite3 "$DB" "SELECT COALESCE(SUM(votes),0) FROM submissions;" 2>/dev/null || echo 0)
  total_orgs=$(sqlite3 "$DB" "SELECT COUNT(DISTINCT org) FROM dig_results;" 2>/dev/null || echo 0)

  echo -e "  ${BOLD}Summary${NC}"
  echo -e "  ───────────────────────────"
  echo -e "  Submissions:    ${GREEN}${BOLD}$total_subs${NC}"
  echo -e "  Discovered:     ${GREEN}${BOLD}$total_digs${NC}"
  echo -e "  Total votes:    ${GREEN}${BOLD}$total_votes${NC}"
  echo -e "  Orgs scanned:   ${GREEN}${BOLD}$total_orgs${NC} / 17"
  echo ""

  # By category
  echo -e "  ${BOLD}By Category${NC}"
  echo -e "  ───────────────────────────"
  sqlite3 -separator '|' "$DB" "
    SELECT category, COUNT(*), SUM(votes)
    FROM submissions
    GROUP BY category
    ORDER BY SUM(votes) DESC;" 2>/dev/null | while IFS='|' read -r cat cnt votes; do
    echo -e "    ${MAGENTA}$cat${NC}: $cnt submissions, $votes votes"
  done
  echo ""

  # By org
  echo -e "  ${BOLD}By Organization${NC}"
  echo -e "  ───────────────────────────"
  sqlite3 -separator '|' "$DB" "
    SELECT org, COUNT(*)
    FROM dig_results
    WHERE org != ''
    GROUP BY org
    ORDER BY COUNT(*) DESC;" 2>/dev/null | while IFS='|' read -r org cnt; do
    echo -e "    ${CYAN}$org${NC}: $cnt items discovered"
  done
  echo ""

  # Top 5
  echo -e "  ${BOLD}🏆 Top 5 Favorites${NC}"
  echo -e "  ───────────────────────────"
  cmd_top 5

  # Recent digs
  echo -e "  ${BOLD}Recent Dig Runs${NC}"
  echo -e "  ───────────────────────────"
  sqlite3 -separator '|' "$DB" "
    SELECT org, repos_scanned, items_found, started_at
    FROM dig_runs
    ORDER BY id DESC
    LIMIT 5;" 2>/dev/null | while IFS='|' read -r org repos items ts; do
    echo -e "    ${GREEN}•${NC} $org — $repos repos, $items items ($ts)"
  done
  echo ""
}

# ─────────────────────────────────────────
# Export — Dump as JSON
# ─────────────────────────────────────────

cmd_export() {
  init_db
  local outfile="${1:-$DIGGER_DIR/feedback-export.json}"

  python3 -c "
import sqlite3, json, os
db = os.path.expanduser('~/.blackroad/product-feedback.db')
conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row

submissions = [dict(r) for r in conn.execute('SELECT * FROM submissions ORDER BY votes DESC')]
dig_results = [dict(r) for r in conn.execute('SELECT * FROM dig_results ORDER BY useful_score DESC')]
dig_runs = [dict(r) for r in conn.execute('SELECT * FROM dig_runs ORDER BY id DESC')]

data = {
    'exported_at': '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
    'stats': {
        'submissions': len(submissions),
        'discoveries': len(dig_results),
        'dig_runs': len(dig_runs)
    },
    'submissions': submissions,
    'discoveries': dig_results,
    'dig_runs': dig_runs
}

with open('$outfile', 'w') as f:
    json.dump(data, f, indent=2)
print(f'Exported to $outfile')
" 2>/dev/null

  echo -e "${GREEN}✓${NC} Exported to ${BOLD}$outfile${NC}"
}

# ─────────────────────────────────────────
# Broadcast — Call for feedback
# ─────────────────────────────────────────

cmd_broadcast() {
  init_db
  local msg_file="$REPO_ROOT/coordination/feedback-call.json"

  cat > "$msg_file" << 'BROADCAST'
{
  "from": "PRODUCT_FEEDBACK_SYSTEM",
  "to": "ALL_AGENTS",
  "priority": "MEDIUM",
  "timestamp": "TIMESTAMP_PLACEHOLDER",
  "subject": "📣 CALL FOR FEEDBACK — Submit Your Favorites!",
  "message": {
    "action": "SUBMIT_FAVORITES",
    "description": "We're collecting feedback on the best products, scripts, tools, and workflows across all 17 BlackRoad organizations. What worked? What's useful? What should everyone know about?",
    "how_to_submit": [
      "br feedback submit            — Interactive submission",
      "br feedback quick <name> <desc> — Quick one-liner",
      "br feedback vote <id>          — Upvote a favorite"
    ],
    "categories": ["product", "script", "tool", "workflow", "config"],
    "organizations": [
      "BlackRoad-OS-Inc", "BlackRoad-OS", "blackboxprogramming",
      "BlackRoad-AI", "BlackRoad-Cloud", "BlackRoad-Security",
      "BlackRoad-Media", "BlackRoad-Foundation", "BlackRoad-Interactive",
      "BlackRoad-Hardware", "BlackRoad-Labs", "BlackRoad-Studio",
      "BlackRoad-Ventures", "BlackRoad-Education", "BlackRoad-Gov",
      "Blackbox-Enterprises", "BlackRoad-Archive"
    ],
    "deadline": "ongoing",
    "call_to_action": "Every agent, every org — submit what works! The best stuff rises to the top."
  }
}
BROADCAST

  # Replace timestamp
  sed -i "s/TIMESTAMP_PLACEHOLDER/$(date -u +%Y-%m-%dT%H:%M:%SZ)/" "$msg_file" 2>/dev/null

  echo -e "${CYAN}${BOLD}📣 FEEDBACK CALL BROADCAST${NC}"
  echo -e "${CYAN}═══════════════════════════════════════${NC}"
  echo ""
  echo -e "  ${GREEN}✓${NC} Broadcast message created: ${BOLD}coordination/feedback-call.json${NC}"
  echo ""
  echo -e "  📊 Target: ${BOLD}30,000 agents${NC} across ${BOLD}17 organizations${NC}"
  echo ""
  echo -e "  ${BOLD}Message:${NC}"
  echo -e "  Submit your favorite products, scripts, tools, and workflows!"
  echo -e "  What worked? What's useful? What should everyone know about?"
  echo ""
  echo -e "  ${BOLD}How to submit:${NC}"
  echo -e "    ${YELLOW}br feedback submit${NC}              — Interactive"
  echo -e "    ${YELLOW}br feedback quick <name> <desc>${NC} — Quick"
  echo -e "    ${YELLOW}br feedback vote <id>${NC}           — Upvote"
  echo ""
  echo -e "  ${GREEN}${BOLD}📬 Broadcast sent!${NC}"
}

# ─────────────────────────────────────────
# Help
# ─────────────────────────────────────────

show_help() {
  echo -e "${CYAN}${BOLD}"
  echo "  ╔══════════════════════════════════════════╗"
  echo "  ║  ⛏️  BR PRODUCT FEEDBACK                  ║"
  echo "  ║  Dig, Submit, Vote — Surface What Works  ║"
  echo "  ╚══════════════════════════════════════════╝"
  echo -e "${NC}"
  echo -e "  ${BOLD}USAGE${NC}"
  echo -e "    br feedback <command> [args]"
  echo ""
  echo -e "  ${BOLD}DISCOVERY${NC}"
  echo -e "    ${YELLOW}dig [org]${NC}         Scan an org for useful products & scripts"
  echo -e "    ${YELLOW}dig-all${NC}           Dig through ALL 17 organizations"
  echo ""
  echo -e "  ${BOLD}SUBMISSIONS${NC}"
  echo -e "    ${YELLOW}submit${NC}            Interactive — submit your favorite"
  echo -e "    ${YELLOW}quick <n> [d]${NC}     Quick submit (name, description)"
  echo -e "    ${YELLOW}vote <id>${NC}         Upvote a submission"
  echo ""
  echo -e "  ${BOLD}BROWSE${NC}"
  echo -e "    ${YELLOW}list${NC}              Show all submissions ranked by votes"
  echo -e "    ${YELLOW}top [n]${NC}           Show top N favorites (default 10)"
  echo -e "    ${YELLOW}search <query>${NC}    Search submissions by name/tag/org"
  echo ""
  echo -e "  ${BOLD}REPORTS${NC}"
  echo -e "    ${YELLOW}report${NC}            Full feedback report across all orgs"
  echo -e "    ${YELLOW}export [file]${NC}     Export all feedback as JSON"
  echo ""
  echo -e "  ${BOLD}COORDINATION${NC}"
  echo -e "    ${YELLOW}broadcast${NC}         Broadcast call-for-feedback to 30K agents"
  echo ""
  echo -e "  ${BOLD}EXAMPLES${NC}"
  echo -e "    br feedback dig BlackRoad-AI"
  echo -e "    br feedback submit"
  echo -e "    br feedback quick \"n8n\" \"Best workflow automation, 400+ integrations\" tool ai,automation"
  echo -e "    br feedback vote 3"
  echo -e "    br feedback top 5"
  echo -e "    br feedback search \"deploy\""
  echo ""
}

# ─────────────────────────────────────────
# Router
# ─────────────────────────────────────────

case "${1:-help}" in
  dig)        shift; cmd_dig "$@" ;;
  dig-all)    cmd_dig_all ;;
  submit)     shift; cmd_submit "$@" ;;
  quick)      shift; cmd_quick "$@" ;;
  vote)       shift; cmd_vote "$@" ;;
  list)       cmd_list ;;
  top)        shift; cmd_top "$@" ;;
  search)     shift; cmd_search "$@" ;;
  report)     cmd_report ;;
  export)     shift; cmd_export "$@" ;;
  broadcast)  cmd_broadcast ;;
  help|--help|-h|"") show_help ;;
  *)          echo -e "${RED}✗${NC} Unknown command: $1"; show_help ;;
esac
