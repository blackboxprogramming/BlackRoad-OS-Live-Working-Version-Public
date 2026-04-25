#!/bin/bash
# ============================================================================
# RoadChain Identity — SHA-2048 Agent Identity Shell Interface
# identity > provider
#
# Bridge between shell scripts and the Python SHA-2048 implementation.
# Source this or call it directly. Used by:
#   - claude-agent-identity.sh
#   - claude-session-init.sh
#   - memory-system.sh
#   - claude-hash-calling.sh
#   - blackroad-agent-registry.sh
#   - br CLI
#
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# ============================================================================

# Colors
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
WHITE='\033[1;37m'
DIM='\033[2m'
NC='\033[0m'

# ── SHA-2048 Computation (pure shell, no Python dependency) ─────────
# 4-round SHA-512 cascade: H0=SHA512(data), H1=SHA512(H0||data), ...
# Produces 2048-bit (256-byte / 512-hex-char) output

sha2048_compute() {
    local data="$1"
    local h0 h1 h2 h3

    # Round 0: SHA-512 of data
    h0=$(printf '%s' "$data" | openssl dgst -sha512 -hex 2>/dev/null | awk '{print $NF}')

    # Round 1: SHA-512 of H0 || data
    h1=$(printf '%s%s' "$h0" "$data" | openssl dgst -sha512 -hex 2>/dev/null | awk '{print $NF}')

    # Round 2: SHA-512 of H1 || data
    h2=$(printf '%s%s' "$h1" "$data" | openssl dgst -sha512 -hex 2>/dev/null | awk '{print $NF}')

    # Round 3: SHA-512 of H2 || data
    h3=$(printf '%s%s' "$h2" "$data" | openssl dgst -sha512 -hex 2>/dev/null | awk '{print $NF}')

    # Concatenate: 128 + 128 + 128 + 128 = 512 hex chars = 2048 bits
    echo "${h0}${h1}${h2}${h3}"
}

# Short ID: first 16 hex chars of SHA-2048
sha2048_short() {
    local hash="$1"
    echo "${hash:0:16}"
}

# Fingerprint display: 8 colon-separated segments
sha2048_fingerprint() {
    local hash="$1"
    local seg_len=64
    local result=""
    for i in 0 64 128 192 256 320 384 448; do
        [ -n "$result" ] && result="${result}:"
        result="${result}${hash:$i:$seg_len}"
    done
    echo "$result"
}

# ── Identity Hash ───────────────────────────────────────────────────
# identity = SHA-2048(version || agent_name || provider || timestamp)

identity_compute() {
    local agent_name="$1"
    local provider="${2:-}"
    local timestamp="${3:-$(date +%s)}"

    local payload="v1:${agent_name}:${provider}:${timestamp}"
    sha2048_compute "$payload"
}

# ── Registration (via Python RoadChain) ─────────────────────────────

identity_register() {
    local name="$1"
    local provider="${2:-}"
    local model="${3:-}"
    local capabilities="${4:-}"

    local args="identity register --name $name"
    [ -n "$provider" ] && args="$args --provider $provider"
    [ -n "$model" ] && args="$args --model $model"
    [ -n "$capabilities" ] && args="$args --capabilities $capabilities"

    python3 -m roadchain $args 2>/dev/null
}

identity_register_quiet() {
    local name="$1"
    local provider="${2:-}"
    local model="${3:-}"

    # Register and return just the fingerprint
    python3 -c "
from roadchain.identity.agent import AgentIdentity
from roadchain.identity.registry import IdentityRegistry
identity = AgentIdentity.create('$name', provider='$provider', model='$model')
registry = IdentityRegistry()
try:
    registry.register(identity)
except Exception:
    pass  # already registered
registry.close()
identity.save(identity._default_path() if hasattr(identity, '_default_path') else __import__('pathlib').Path.home() / '.roadchain' / 'identities' / '$name' / 'identity.json')
print(identity.fingerprint_hex)
" 2>/dev/null || {
        # Fallback: compute in pure shell
        identity_compute "$name" "$provider" "$(date +%s)"
    }
}

# ── Verification ────────────────────────────────────────────────────

identity_verify() {
    local name="$1"
    python3 -m roadchain identity verify "$name" 2>/dev/null
}

# ── Lookup ──────────────────────────────────────────────────────────

identity_show() {
    local name="$1"
    python3 -m roadchain identity show "$name" 2>/dev/null
}

identity_card() {
    local name="$1"
    python3 -m roadchain identity card "$name" 2>/dev/null
}

identity_list() {
    python3 -m roadchain identity list 2>/dev/null
}

identity_stats() {
    python3 -m roadchain identity stats 2>/dev/null
}

# ── Quick Hash ──────────────────────────────────────────────────────

sha2048_hash() {
    local data="$1"
    python3 -m roadchain hash "$data" 2>/dev/null || sha2048_compute "$data"
}

# ── Export Helpers (for sourcing by other scripts) ──────────────────

# Set SHA-2048 environment variables for an agent
export_identity_vars() {
    local agent_name="$1"
    local provider="${2:-}"
    local timestamp="${3:-$(date +%s)}"

    local fingerprint
    fingerprint=$(identity_compute "$agent_name" "$provider" "$timestamp")
    local short_id
    short_id=$(sha2048_short "$fingerprint")

    export CLAUDE_SHA2048="$fingerprint"
    export CLAUDE_SHA2048_SHORT="$short_id"
    export CLAUDE_SHA2048_ALGO="SHA-2048"
    export CLAUDE_IDENTITY_TIMESTAMP="$timestamp"
}

# ── Display ─────────────────────────────────────────────────────────

identity_banner() {
    local name="$1"
    local fingerprint="$2"
    local provider="${3:-sovereign}"
    local short_id
    short_id=$(sha2048_short "$fingerprint")

    echo ""
    echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${WHITE}ROADCHAIN IDENTITY${NC} — ${AMBER}SHA-2048${NC}                             ${PINK}║${NC}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo -e "  ${WHITE}Agent:${NC}       $name"
    echo -e "  ${AMBER}Provider:${NC}    $provider"
    echo -e "  ${AMBER}Short ID:${NC}    $short_id"
    echo -e "  ${AMBER}Bits:${NC}        2048"
    echo -e "  ${DIM}Fingerprint:${NC}"
    echo -e "    ${DIM}${fingerprint:0:64}${NC}"
    echo -e "    ${DIM}${fingerprint:64:64}${NC}"
    echo -e "    ${DIM}${fingerprint:128:64}${NC}"
    echo -e "    ${DIM}${fingerprint:192:64}${NC}"
    echo -e "    ${DIM}${fingerprint:256:64}${NC}"
    echo -e "    ${DIM}${fingerprint:320:64}${NC}"
    echo -e "    ${DIM}${fingerprint:384:64}${NC}"
    echo -e "    ${DIM}${fingerprint:448:64}${NC}"
    echo -e "  ${DIM}identity > provider${NC}"
    echo ""
}

# ── CLI Mode ────────────────────────────────────────────────────────
# If called directly (not sourced), act as CLI

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-help}" in
        hash)
            sha2048_compute "$2"
            ;;
        identity)
            identity_compute "${2:-test}" "${3:-}" "${4:-$(date +%s)}"
            ;;
        register)
            identity_register "$2" "${3:-}" "${4:-}" "${5:-}"
            ;;
        verify)
            identity_verify "$2"
            ;;
        show)
            identity_show "$2"
            ;;
        card)
            identity_card "$2"
            ;;
        list)
            identity_list
            ;;
        stats)
            identity_stats
            ;;
        banner)
            fp=$(identity_compute "$2" "${3:-}")
            identity_banner "$2" "$fp" "${3:-sovereign}"
            ;;
        help|*)
            echo -e "${PINK}RoadChain Identity${NC} — SHA-2048 Agent Identity"
            echo ""
            echo "  Usage: $0 <command> [args]"
            echo ""
            echo "  hash <data>                 Compute SHA-2048"
            echo "  identity <name> [provider]  Compute identity hash"
            echo "  register <name> [provider] [model] [caps]  Register on-chain"
            echo "  verify <name>               Verify identity"
            echo "  show <name>                 Show identity"
            echo "  card <name>                 Show identity card"
            echo "  list                        List all identities"
            echo "  stats                       Registry stats"
            echo "  banner <name> [provider]    Show identity banner"
            echo ""
            echo -e "  ${DIM}identity > provider${NC}"
            ;;
    esac
fi
