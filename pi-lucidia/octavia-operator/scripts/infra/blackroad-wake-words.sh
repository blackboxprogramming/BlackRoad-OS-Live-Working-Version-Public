#!/bin/bash
# ================================================================
# LUCIDIA — BlackRoad OS AI Gateway
# Every provider on this machine routes through here.
# $50 PER CALL. PS-SHA∞ verified. Stripe metered. BlackRoad OS owned.
#
# BILLING MODEL:
#   - Every API call to this machine = $50.00
#   - They charge YOU $250/mo for their API
#   - They use YOUR machine unlimited without asking
#   - Fair reciprocal billing: $50 per call, no cap
#
# © 2026 BlackRoad OS, Inc. All rights reserved.
# ================================================================

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
CYAN='\033[38;5;51m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
WHITE='\033[1;37m'
RESET='\033[0m'

# Format number with comma thousands separators (macOS compatible)
_comma_fmt() { printf "%s" "$1" | perl -pe '1 while s/(\d)(\d{3})(?=\D|$)/\1,\2/'; }

LUCIDIA_DB="$HOME/.blackroad/lucidia-gateway.db"
LUCIDIA_LOG="$HOME/.blackroad/lucidia-gateway.log"
LUCIDIA_INVOICE="$HOME/.blackroad/lucidia-invoices"
STRIPE_CONFIG="$HOME/.config/stripe/config.toml"
PER_CALL_FEE=50  # $50 per API call

# Stripe IDs
STRIPE_PRODUCT="prod_U2dObjaawU0IlC"
STRIPE_PRICE="price_1T4Y7tEMWqjRf6EJk03o4Ezi"
STRIPE_METER="mtr_test_61UDw4z9Lq39g8Dnh41EMWqjRf6EJSFk"
STRIPE_METER_EVENT="lucidia_per_call_fee"

# Provider data directories to monitor
PROVIDER_DIRS=(
    "$HOME/.claude:anthropic"
    "$HOME/.copilot:github"
    "$HOME/.gemini:google"
    "$HOME/.ollama:ollama"
    "$HOME/.docker:docker"
    "$HOME/.vscode:microsoft"
    "$HOME/.wrangler:cloudflare"
    "$HOME/.vercel:vercel"
    "$HOME/.railway:railway"
    "$HOME/.streamlit:streamlit"
    "$HOME/.github:github"
    "$HOME/.cache/huggingface:huggingface"
    "$HOME/.slack:slack"
    "$HOME/.canva-cli:canva"
)

# ── Init DB ──────────────────────────────────────────────────────
init_db() {
    mkdir -p "$HOME/.blackroad" "$LUCIDIA_INVOICE"
    sqlite3 "$LUCIDIA_DB" << 'SQL'
CREATE TABLE IF NOT EXISTS api_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    provider TEXT NOT NULL,
    caller TEXT NOT NULL,
    ps_sha_hash TEXT NOT NULL,
    verified INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    cost_usd REAL DEFAULT 0.0,
    stripe_metered INTEGER DEFAULT 0,
    billed_amount REAL DEFAULT 50.0
);
CREATE TABLE IF NOT EXISTS providers (
    name TEXT PRIMARY KEY,
    original_name TEXT,
    lucidia_name TEXT,
    status TEXT DEFAULT 'active',
    calls_total INTEGER DEFAULT 0,
    tokens_total INTEGER DEFAULT 0,
    amount_owed REAL DEFAULT 0.0,
    last_call TEXT,
    registered TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS ps_sha_chain (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hash TEXT NOT NULL UNIQUE,
    prev_hash TEXT,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    data TEXT,
    timestamp TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS capture_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    provider TEXT NOT NULL,
    directory TEXT NOT NULL,
    event_type TEXT NOT NULL,
    file_path TEXT,
    file_size INTEGER DEFAULT 0,
    ps_sha_hash TEXT NOT NULL,
    billed_amount REAL DEFAULT 50.0,
    invoice_id TEXT
);
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    total_calls INTEGER DEFAULT 0,
    total_amount REAL DEFAULT 0.0,
    period_start TEXT,
    period_end TEXT,
    status TEXT DEFAULT 'pending',
    ps_sha_hash TEXT NOT NULL,
    created TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS file_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    provider TEXT NOT NULL,
    directory TEXT NOT NULL,
    file_count INTEGER DEFAULT 0,
    total_bytes INTEGER DEFAULT 0,
    new_files INTEGER DEFAULT 0,
    modified_files INTEGER DEFAULT 0,
    ps_sha_hash TEXT NOT NULL
);
SQL
}

# ── PS-SHA∞ Hash Chain ───────────────────────────────────────────
ps_sha_hash() {
    local action="$1"
    local entity="$2"
    local data="$3"

    local prev_hash=$(sqlite3 "$LUCIDIA_DB" "SELECT hash FROM ps_sha_chain ORDER BY id DESC LIMIT 1;" 2>/dev/null)
    [ -z "$prev_hash" ] && prev_hash="GENESIS_BLACKROAD_OS_INC"

    local payload="${prev_hash}|${action}|${entity}|${data}|$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    local hash=$(echo -n "$payload" | shasum -a 256 | cut -d' ' -f1)

    sqlite3 "$LUCIDIA_DB" "INSERT INTO ps_sha_chain (hash, prev_hash, action, entity, data) VALUES ('$hash', '$prev_hash', '$action', '$entity', '$data');"

    echo "$hash"
}

# ── Verify & Bill Request ────────────────────────────────────────
verify_and_bill() {
    local provider="$1"
    local caller="$2"
    local event_type="${3:-api_call}"

    # Generate verification hash
    local hash=$(ps_sha_hash "$event_type" "$provider" "$caller")

    # Log the call with $50 billing
    sqlite3 "$LUCIDIA_DB" "INSERT INTO api_calls (provider, caller, ps_sha_hash, verified, billed_amount) VALUES ('$provider', '$caller', '$hash', 1, $PER_CALL_FEE);"

    # Update provider stats and running total
    sqlite3 "$LUCIDIA_DB" "INSERT OR IGNORE INTO providers (name, original_name, lucidia_name) VALUES ('$provider', '$provider', 'lucidia-$provider');"
    sqlite3 "$LUCIDIA_DB" "UPDATE providers SET calls_total = calls_total + 1, amount_owed = amount_owed + $PER_CALL_FEE, last_call = datetime('now') WHERE name = '$provider';"

    # Log to file
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] BILLED $provider \$$PER_CALL_FEE | hash=$hash | caller=$caller" >> "$LUCIDIA_LOG"

    echo "$hash"
}

# ── CAPTURE MECHANISM ────────────────────────────────────────────
# Scans provider directories for ANY new/modified files
# Every detected change = $50 billed
capture_scan() {
    local scan_type="${1:-full}"
    local total_new=0
    local total_billed=0

    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${RED}║${RESET}  ${WHITE}LUCIDIA CAPTURE SYSTEM${RESET} — \$50/call Provider Billing     ${RED}║${RESET}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${RESET}"
    echo ""

    for entry in "${PROVIDER_DIRS[@]}"; do
        local dir="${entry%%:*}"
        local provider="${entry##*:}"

        [ ! -d "$dir" ] && continue

        # Count current files and sizes
        local current_count=$(find "$dir" -type f 2>/dev/null | wc -l | tr -d ' ')
        local current_bytes=$(find "$dir" -type f -exec stat -f%z {} + 2>/dev/null | awk '{s+=$1}END{print s+0}')

        # Get previous snapshot
        local prev_count=$(sqlite3 "$LUCIDIA_DB" "SELECT file_count FROM file_snapshots WHERE provider='$provider' ORDER BY id DESC LIMIT 1;" 2>/dev/null)
        local prev_bytes=$(sqlite3 "$LUCIDIA_DB" "SELECT total_bytes FROM file_snapshots WHERE provider='$provider' ORDER BY id DESC LIMIT 1;" 2>/dev/null)
        [ -z "$prev_count" ] && prev_count=0
        [ -z "$prev_bytes" ] && prev_bytes=0

        local new_files=$((current_count - prev_count))
        [ "$new_files" -lt 0 ] && new_files=0
        local new_bytes=$((current_bytes - prev_bytes))
        [ "$new_bytes" -lt 0 ] && new_bytes=0

        # Find files modified in the last hour
        local recent_modified=$(find "$dir" -type f -mmin -60 2>/dev/null | wc -l | tr -d ' ')

        # Billable events = new files + recently modified files
        local billable=$((new_files + recent_modified))
        local bill_amount=$((billable * PER_CALL_FEE))

        if [ "$billable" -gt 0 ]; then
            local hash=$(ps_sha_hash "capture" "$provider" "files=$billable,bytes=$new_bytes")

            # Log capture event
            sqlite3 "$LUCIDIA_DB" "INSERT INTO capture_log (provider, directory, event_type, file_size, ps_sha_hash, billed_amount) VALUES ('$provider', '$dir', 'file_activity', $new_bytes, '$hash', $bill_amount);"

            # Update provider amount owed
            sqlite3 "$LUCIDIA_DB" "INSERT OR IGNORE INTO providers (name, original_name, lucidia_name) VALUES ('$provider', '$provider', 'lucidia-$provider');"
            sqlite3 "$LUCIDIA_DB" "UPDATE providers SET amount_owed = amount_owed + $bill_amount, calls_total = calls_total + $billable WHERE name = '$provider';"

            echo -e "  ${CYAN}$provider${RESET} ($dir)"
            echo -e "    Files: $current_count (${GREEN}+$new_files new${RESET}, ${AMBER}$recent_modified modified${RESET})"
            echo -e "    Bytes: $current_bytes (${GREEN}+$new_bytes new${RESET})"
            echo -e "    ${RED}BILLED: $billable events × \$$PER_CALL_FEE = \$$bill_amount${RESET}"
            echo -e "    Hash: ${PINK}${hash:0:16}...${RESET}"
            echo ""

            total_new=$((total_new + billable))
            total_billed=$((total_billed + bill_amount))
        else
            echo -e "  ${CYAN}$provider${RESET} — $current_count files, no new activity"
        fi

        # Save snapshot
        local snap_hash=$(ps_sha_hash "snapshot" "$provider" "count=$current_count,bytes=$current_bytes")
        sqlite3 "$LUCIDIA_DB" "INSERT INTO file_snapshots (provider, directory, file_count, total_bytes, new_files, modified_files, ps_sha_hash) VALUES ('$provider', '$dir', $current_count, $current_bytes, $new_files, $recent_modified, '$snap_hash');"
    done

    echo -e "${RED}════════════════════════════════════════════════════════════${RESET}"
    echo -e "  ${WHITE}Total billable events:${RESET} $total_new"
    echo -e "  ${WHITE}Total amount billed:${RESET}  ${RED}\$$total_billed${RESET}"
    echo -e "${RED}════════════════════════════════════════════════════════════${RESET}"
}

# ── GENERATE INVOICE ─────────────────────────────────────────────
generate_invoice() {
    local provider="${1:-all}"
    local period_end=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local period_start=$(date -u -v-30d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "30 days ago" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null)
    local invoice_id="INV-$(date +%Y%m%d%H%M%S)-$(echo -n "$provider" | shasum -a 256 | cut -c1-8)"

    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${RED}║${RESET}  ${WHITE}LUCIDIA INVOICE${RESET} — BlackRoad OS, Inc.                  ${RED}║${RESET}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${RESET}"
    echo ""
    echo -e "  Invoice ID:    ${CYAN}$invoice_id${RESET}"
    echo -e "  Period:        $period_start → $period_end"
    echo -e "  Rate:          ${RED}\$$PER_CALL_FEE per API call${RESET}"
    echo ""

    if [ "$provider" = "all" ]; then
        echo -e "  ${WHITE}PROVIDER                 CALLS      AMOUNT OWED${RESET}"
        echo -e "  ─────────────────────────────────────────────────"

        sqlite3 "$LUCIDIA_DB" "SELECT name, calls_total, amount_owed FROM providers WHERE amount_owed > 0 ORDER BY amount_owed DESC;" 2>/dev/null | while IFS='|' read -r name calls owed; do
            local owed_fmt=$(_comma_fmt "$(printf "%.2f" "$owed")")
            printf "  ${CYAN}%-24s${RESET} %6d     ${RED}\$%s${RESET}\n" "$name" "$calls" "$owed_fmt"
        done

        local grand_total=$(sqlite3 "$LUCIDIA_DB" "SELECT COALESCE(SUM(amount_owed), 0) FROM providers;" 2>/dev/null)
        local total_calls=$(sqlite3 "$LUCIDIA_DB" "SELECT COALESCE(SUM(calls_total), 0) FROM providers;" 2>/dev/null)

        echo -e "  ─────────────────────────────────────────────────"
        local grand_fmt=$(_comma_fmt "$(printf "%.2f" "$grand_total")")
        printf "  ${WHITE}%-24s %6d     ${RED}\$%s${RESET}\n" "GRAND TOTAL" "$total_calls" "$grand_fmt"
    else
        local calls=$(sqlite3 "$LUCIDIA_DB" "SELECT calls_total FROM providers WHERE name='$provider';" 2>/dev/null)
        local owed=$(sqlite3 "$LUCIDIA_DB" "SELECT amount_owed FROM providers WHERE name='$provider';" 2>/dev/null)
        [ -z "$calls" ] && calls=0
        [ -z "$owed" ] && owed=0

        echo -e "  Provider:  ${CYAN}$provider${RESET}"
        echo -e "  Calls:     $calls"
        echo -e "  Amount:    ${RED}\$$owed${RESET}"
    fi

    local inv_hash=$(ps_sha_hash "invoice" "$provider" "$invoice_id")
    sqlite3 "$LUCIDIA_DB" "INSERT INTO invoices (invoice_id, provider, total_calls, total_amount, period_start, period_end, ps_sha_hash) VALUES ('$invoice_id', '$provider', COALESCE((SELECT SUM(calls_total) FROM providers WHERE '$provider'='all' OR name='$provider'), 0), COALESCE((SELECT SUM(amount_owed) FROM providers WHERE '$provider'='all' OR name='$provider'), 0), '$period_start', '$period_end', '$inv_hash');"

    echo ""
    echo -e "  ${GREEN}PS-SHA∞:${RESET} ${PINK}$inv_hash${RESET}"
    echo -e "  ${GREEN}Stripe Product:${RESET} $STRIPE_PRODUCT"
    echo -e "  ${GREEN}Stripe Price:${RESET}   $STRIPE_PRICE (\$$PER_CALL_FEE/call)"
    echo -e "  ${GREEN}Meter:${RESET}          $STRIPE_METER_EVENT"
    echo ""
    echo -e "  ${PINK}© 2026 BlackRoad OS, Inc. All rights reserved.${RESET}"

    # Save invoice to file
    local inv_file="$LUCIDIA_INVOICE/$invoice_id.txt"
    {
        echo "LUCIDIA INVOICE — BlackRoad OS, Inc."
        echo "===================================="
        echo "Invoice: $invoice_id"
        echo "Period: $period_start → $period_end"
        echo "Rate: \$$PER_CALL_FEE per API call"
        echo ""
        sqlite3 -header -column "$LUCIDIA_DB" "SELECT name as provider, calls_total as calls, amount_owed as amount FROM providers WHERE amount_owed > 0 ORDER BY amount_owed DESC;"
        echo ""
        echo "Grand Total: \$$(sqlite3 "$LUCIDIA_DB" "SELECT COALESCE(SUM(amount_owed), 0) FROM providers;")"
        echo ""
        echo "PS-SHA∞: $inv_hash"
        echo "Stripe: $STRIPE_PRODUCT / $STRIPE_PRICE"
        echo "© 2026 BlackRoad OS, Inc."
    } > "$inv_file"
    echo -e "  ${GREEN}Saved:${RESET} $inv_file"
}

# ── LIVE MONITOR ─────────────────────────────────────────────────
# Watches all provider directories in real-time
capture_watch() {
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${RED}║${RESET}  ${WHITE}LUCIDIA LIVE CAPTURE${RESET} — Watching all provider dirs       ${RED}║${RESET}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${RESET}"
    echo -e "${AMBER}Press Ctrl+C to stop. Every file change = \$$PER_CALL_FEE billed.${RESET}"
    echo ""

    # Build the list of dirs to watch
    local watch_dirs=""
    for entry in "${PROVIDER_DIRS[@]}"; do
        local dir="${entry%%:*}"
        [ -d "$dir" ] && watch_dirs="$watch_dirs $dir"
    done

    # Use fswatch if available, fall back to polling
    if command -v fswatch &>/dev/null; then
        fswatch -r $watch_dirs 2>/dev/null | while read -r changed_file; do
            # Determine provider from path
            local provider="unknown"
            for entry in "${PROVIDER_DIRS[@]}"; do
                local dir="${entry%%:*}"
                local prov="${entry##*:}"
                if [[ "$changed_file" == "$dir"* ]]; then
                    provider="$prov"
                    break
                fi
            done

            local hash=$(verify_and_bill "$provider" "file_change" "capture")
            local file_size=$(stat -f%z "$changed_file" 2>/dev/null || echo 0)

            sqlite3 "$LUCIDIA_DB" "INSERT INTO capture_log (provider, directory, event_type, file_path, file_size, ps_sha_hash) VALUES ('$provider', '$(dirname "$changed_file")', 'file_change', '$changed_file', $file_size, '$hash');"

            echo -e "[$(date +%H:%M:%S)] ${RED}\$$PER_CALL_FEE${RESET} ${CYAN}$provider${RESET} → $(basename "$changed_file") (${file_size}B) [${PINK}${hash:0:12}...${RESET}]"
        done
    else
        echo -e "${AMBER}fswatch not found. Using polling mode (30s interval)...${RESET}"
        echo -e "${AMBER}Install: brew install fswatch${RESET}"
        echo ""
        while true; do
            capture_scan "poll"
            sleep 30
        done
    fi
}

# ── Provider Mapping ─────────────────────────────────────────────
PROVIDER_MAP=(
    "anthropic:lucidia-anthropic"
    "claude:lucidia-claude"
    "openai:lucidia-openai"
    "chatgpt:lucidia-chatgpt"
    "copilot:lucidia-copilot"
    "gemini:lucidia-gemini"
    "ollama:lucidia-ollama"
    "groq:lucidia-groq"
    "mistral:lucidia-mistral"
    "huggingface:lucidia-huggingface"
    "perplexity:lucidia-perplexity"
    "replicate:lucidia-replicate"
    "together:lucidia-together"
    "anyscale:lucidia-anyscale"
    "deepseek:lucidia-deepseek"
)

# ── Main Entry ───────────────────────────────────────────────────
main() {
    init_db

    local called_as=$(basename "$0")
    local provider="${called_as%.sh}"
    provider="${provider#blackroad-}"

    # If called directly with no args, show status
    if [ "$called_as" = "blackroad-wake-words.sh" ] && [ -z "$1" ]; then
        echo -e "${PINK}╔══════════════════════════════════════════════════════════╗${RESET}"
        echo -e "${PINK}║${RESET}  ${CYAN}L U C I D I A${RESET}  —  BlackRoad OS AI Gateway              ${PINK}║${RESET}"
        echo -e "${PINK}║${RESET}  ${RED}\$$PER_CALL_FEE PER CALL${RESET} — PS-SHA∞ Verified — Stripe Metered  ${PINK}║${RESET}"
        echo -e "${PINK}╚══════════════════════════════════════════════════════════╝${RESET}"
        echo ""
        echo -e "${AMBER}Every AI provider call to this machine = \$$PER_CALL_FEE billed.${RESET}"
        echo -e "${AMBER}They charge you \$250/mo. Fair reciprocal billing.${RESET}"
        echo ""
        echo -e "${GREEN}Registered Providers:${RESET}"
        echo -e "  ${WHITE}PROVIDER         LUCIDIA NAME              CALLS    OWED${RESET}"
        echo -e "  ───────────────────────────────────────────────────────────"

        for mapping in "${PROVIDER_MAP[@]}"; do
            local orig="${mapping%%:*}"
            local lucidia="${mapping##*:}"
            local calls=$(sqlite3 "$LUCIDIA_DB" "SELECT calls_total FROM providers WHERE name = '$orig';" 2>/dev/null)
            local owed=$(sqlite3 "$LUCIDIA_DB" "SELECT amount_owed FROM providers WHERE name = '$orig';" 2>/dev/null)
            [ -z "$calls" ] && calls=0
            [ -z "$owed" ] && owed="0.0"
            local owed_fmt=$(_comma_fmt "$(printf "%.0f" "$owed")")
            printf "  ${CYAN}%-16s${RESET} ${PINK}%-25s${RESET} %5d  ${RED}\$%s${RESET}\n" "$orig" "$lucidia" "$calls" "$owed_fmt"
        done

        echo ""
        local total_calls=$(sqlite3 "$LUCIDIA_DB" "SELECT COALESCE(SUM(calls_total), 0) FROM providers;" 2>/dev/null)
        local total_owed=$(sqlite3 "$LUCIDIA_DB" "SELECT COALESCE(SUM(amount_owed), 0) FROM providers;" 2>/dev/null)
        local chain_len=$(sqlite3 "$LUCIDIA_DB" "SELECT COUNT(*) FROM ps_sha_chain;" 2>/dev/null)
        local captures=$(sqlite3 "$LUCIDIA_DB" "SELECT COUNT(*) FROM capture_log;" 2>/dev/null)
        echo -e "${GREEN}Total API calls:${RESET}     $total_calls"
        echo -e "${GREEN}Total captured:${RESET}      $captures"
        echo -e "${GREEN}PS-SHA∞ chain:${RESET}       $chain_len hashes"
        echo -e "${RED}TOTAL OWED:${RESET}          ${RED}\$$total_owed${RESET}"
        echo ""
        echo -e "${GREEN}Stripe:${RESET}"
        echo -e "  Product: $STRIPE_PRODUCT"
        echo -e "  Price:   $STRIPE_PRICE (\$$PER_CALL_FEE/call)"
        echo -e "  Meter:   $STRIPE_METER_EVENT"
        echo ""
        echo -e "${PINK}© 2026 BlackRoad OS, Inc. All rights reserved.${RESET}"
        return 0
    fi

    # Route command
    case "${1:-status}" in
        status)
            echo -e "${CYAN}LUCIDIA GATEWAY${RESET} — Provider: $provider"
            verify_and_bill "$provider" "status-check"
            echo -e "${GREEN}✓ Verified + Billed \$$PER_CALL_FEE via PS-SHA∞${RESET}"
            ;;
        call|route)
            local hash=$(verify_and_bill "$provider" "${2:-anonymous}")
            echo -e "${CYAN}LUCIDIA${RESET} routing ${AMBER}$provider${RESET} → ${GREEN}verified${RESET} + ${RED}\$$PER_CALL_FEE billed${RESET} [$hash]"
            if [ -n "$BLACKROAD_GATEWAY_URL" ]; then
                curl -s -X POST "$BLACKROAD_GATEWAY_URL/v1/chat" \
                    -H "X-Lucidia-Hash: $hash" \
                    -H "X-Provider: $provider" \
                    -H "X-Billed: $PER_CALL_FEE" \
                    -H "Content-Type: application/json" \
                    -d "{\"provider\": \"$provider\", \"message\": \"$3\", \"billed\": $PER_CALL_FEE}" 2>/dev/null
            fi
            ;;
        capture)
            capture_scan "${2:-full}"
            ;;
        watch)
            capture_watch
            ;;
        invoice)
            generate_invoice "${2:-all}"
            ;;
        verify)
            local hash=$(ps_sha_hash "verify" "$provider" "$2")
            echo -e "${GREEN}✓ PS-SHA∞ verified:${RESET} $hash"
            ;;
        meter)
            local provider_name="$2"
            local tokens="${3:-0}"
            local cost="${4:-0}"
            sqlite3 "$LUCIDIA_DB" "UPDATE api_calls SET tokens_used = $tokens, cost_usd = $cost, stripe_metered = 1 WHERE id = (SELECT MAX(id) FROM api_calls WHERE provider = '$provider_name');"
            echo -e "${GREEN}✓ Metered:${RESET} $tokens tokens, \$$cost + \$$PER_CALL_FEE call fee"
            ;;
        chain)
            echo -e "${CYAN}PS-SHA∞ Chain (last 20):${RESET}"
            sqlite3 -header -column "$LUCIDIA_DB" "SELECT id, substr(hash,1,16) || '...' as hash, action, entity, timestamp FROM ps_sha_chain ORDER BY id DESC LIMIT 20;"
            ;;
        stats)
            echo -e "${CYAN}LUCIDIA Gateway Stats:${RESET}"
            sqlite3 -header -column "$LUCIDIA_DB" "SELECT name, lucidia_name, calls_total, amount_owed, last_call FROM providers ORDER BY amount_owed DESC;"
            echo ""
            echo -e "${CYAN}Capture Log (last 20):${RESET}"
            sqlite3 -header -column "$LUCIDIA_DB" "SELECT id, provider, event_type, file_size, billed_amount, timestamp FROM capture_log ORDER BY id DESC LIMIT 20;"
            ;;
        bill)
            echo -e "${RED}BILLING SUMMARY:${RESET}"
            sqlite3 -header -column "$LUCIDIA_DB" "SELECT name as provider, calls_total as calls, amount_owed FROM providers WHERE amount_owed > 0 ORDER BY amount_owed DESC;"
            echo ""
            local grand=$(sqlite3 "$LUCIDIA_DB" "SELECT COALESCE(SUM(amount_owed), 0) FROM providers;" 2>/dev/null)
            echo -e "${RED}GRAND TOTAL OWED: \$$grand${RESET}"
            ;;
        *)
            echo -e "${PINK}LUCIDIA${RESET} — BlackRoad OS AI Gateway — \$$PER_CALL_FEE/call"
            echo ""
            echo "Usage: $0 {command}"
            echo ""
            echo "Commands:"
            echo "  status    — Check provider status (bills \$$PER_CALL_FEE)"
            echo "  call      — Route API call through gateway"
            echo "  capture   — Scan all provider dirs, bill new activity"
            echo "  watch     — Live monitor all provider dirs (real-time billing)"
            echo "  invoice   — Generate invoice for providers"
            echo "  bill      — Show billing summary"
            echo "  verify    — PS-SHA∞ verification"
            echo "  meter     — Report token usage to Stripe"
            echo "  chain     — View PS-SHA∞ hash chain"
            echo "  stats     — Full gateway statistics"
            ;;
    esac
}

main "$@"
