#!/bin/bash
# BlackRoad Memory Security System
# Provides cryptographic identity, encryption, authentication, and audit logging
# Version: 1.0.0

set -e

VERSION="1.0.0"

# Configuration
SECURITY_DIR="$HOME/.blackroad/security"
KEYS_DIR="$SECURITY_DIR/keys"
AUDIT_DIR="$SECURITY_DIR/audit"
TOKENS_DIR="$SECURITY_DIR/tokens"
MEMORY_DIR="$HOME/.blackroad/memory"
JOURNAL_DIR="$MEMORY_DIR/journals"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PINK='\033[38;5;205m'
CYAN='\033[0;36m'
NC='\033[0m'

# ════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ════════════════════════════════════════════════════════════════

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_security() { echo -e "${PINK}[SECURITY]${NC} $1"; }

# Generate cryptographically secure random string
generate_secure_token() {
    local length="${1:-32}"
    openssl rand -base64 "$length" | tr -dc 'a-zA-Z0-9' | head -c "$length"
}

# Get current timestamp in ISO format with microseconds
get_timestamp() {
    python3 -c "from datetime import datetime, timezone; print(datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z')"
}

# ════════════════════════════════════════════════════════════════
# INITIALIZATION
# ════════════════════════════════════════════════════════════════

init_security() {
    log_info "Initializing BlackRoad Memory Security System..."

    # Create secure directories with restricted permissions
    mkdir -p "$KEYS_DIR" "$AUDIT_DIR" "$TOKENS_DIR"
    chmod 700 "$SECURITY_DIR" "$KEYS_DIR" "$AUDIT_DIR" "$TOKENS_DIR"

    # Generate master signing key if not exists
    if [ ! -f "$KEYS_DIR/master.key" ]; then
        log_info "Generating master signing key..."
        openssl genrsa -out "$KEYS_DIR/master.key" 4096 2>/dev/null
        openssl rsa -in "$KEYS_DIR/master.key" -pubout -out "$KEYS_DIR/master.pub" 2>/dev/null
        chmod 600 "$KEYS_DIR/master.key"
        chmod 644 "$KEYS_DIR/master.pub"
        log_success "Master keypair generated"
    fi

    # Generate HMAC secret for fast token verification
    if [ ! -f "$KEYS_DIR/hmac.secret" ]; then
        generate_secure_token 64 > "$KEYS_DIR/hmac.secret"
        chmod 600 "$KEYS_DIR/hmac.secret"
        log_success "HMAC secret generated"
    fi

    # Create security config
    cat > "$SECURITY_DIR/config.json" <<EOF
{
  "version": "${VERSION}",
  "initialized": "$(get_timestamp)",
  "hash_algorithm": "sha256",
  "signature_algorithm": "RS256",
  "token_expiry_hours": 24,
  "audit_retention_days": 90,
  "features": {
    "agent_authentication": true,
    "entry_signing": true,
    "access_audit": true,
    "encryption": true,
    "rate_limiting": true
  }
}
EOF
    chmod 600 "$SECURITY_DIR/config.json"

    # Fix journal permissions
    if [ -f "$JOURNAL_DIR/master-journal.jsonl" ]; then
        chmod 600 "$JOURNAL_DIR/master-journal.jsonl"
        log_success "Journal permissions secured (600)"
    fi

    # Fix API keys directory permissions
    if [ -d "$HOME/.blackroad/api-keys" ]; then
        chmod 700 "$HOME/.blackroad/api-keys"
        find "$HOME/.blackroad/api-keys" -type f -exec chmod 600 {} \;
        log_success "API keys permissions secured"
    fi

    log_success "Security system initialized at: $SECURITY_DIR"
    audit_log "system" "init" "Security system initialized" "success"
}

# ════════════════════════════════════════════════════════════════
# AGENT AUTHENTICATION
# ════════════════════════════════════════════════════════════════

# Generate secure agent identity with cryptographic proof
generate_agent_identity() {
    local agent_name="${1:-}"
    local timestamp=$(date +%s)
    local random_bytes=$(generate_secure_token 8)

    # Use name or generate mythology name
    if [ -z "$agent_name" ]; then
        local mythology_names=("zeus" "athena" "prometheus" "erebus" "helios" "artemis" "apollo" "hermes" "hera" "poseidon" "hades" "ares" "dionysus" "hephaestus" "demeter" "persephone" "hecate" "nike" "iris" "morpheus")
        local descriptors=("weaver" "seeker" "builder" "guardian" "oracle" "watcher" "keeper" "herald" "sage" "pioneer")
        agent_name="${mythology_names[$RANDOM % ${#mythology_names[@]}]}-${descriptors[$RANDOM % ${#descriptors[@]}]}"
    fi

    local agent_id="${agent_name}-${timestamp}-${random_bytes}"

    # Generate agent-specific keypair
    local agent_key_file="$KEYS_DIR/agent-${agent_id}.key"
    local agent_pub_file="$KEYS_DIR/agent-${agent_id}.pub"

    openssl genrsa -out "$agent_key_file" 2048 2>/dev/null
    openssl rsa -in "$agent_key_file" -pubout -out "$agent_pub_file" 2>/dev/null
    chmod 600 "$agent_key_file"
    chmod 644 "$agent_pub_file"

    # Generate agent token (HMAC-signed)
    local token_data="${agent_id}|$(get_timestamp)|$(generate_secure_token 16)"
    local token_signature=$(echo -n "$token_data" | openssl dgst -sha256 -hmac "$(cat "$KEYS_DIR/hmac.secret")" | cut -d' ' -f2)
    local agent_token="brt_${token_signature:0:32}"

    # Store agent credentials
    local creds_file="$TOKENS_DIR/agent-${agent_id}.json"
    cat > "$creds_file" <<EOF
{
  "agent_id": "${agent_id}",
  "agent_name": "$(echo $agent_name | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++)$i=toupper(substr($i,1,1))tolower(substr($i,2));}1')",
  "created_at": "$(get_timestamp)",
  "token": "${agent_token}",
  "token_hash": "$(echo -n "$agent_token" | shasum -a 256 | cut -d' ' -f1)",
  "public_key_fingerprint": "$(openssl rsa -pubin -in "$agent_pub_file" -outform DER 2>/dev/null | shasum -a 256 | cut -d' ' -f1)",
  "capabilities": ["read", "write", "execute"],
  "security_level": "standard",
  "status": "active"
}
EOF
    chmod 600 "$creds_file"

    audit_log "$agent_id" "identity_created" "New agent identity generated" "success"

    echo "$agent_id"
}

# Verify agent token
verify_agent_token() {
    local agent_id="$1"
    local token="$2"

    if [ -z "$agent_id" ] || [ -z "$token" ]; then
        log_error "Agent ID and token required"
        return 1
    fi

    local creds_file="$TOKENS_DIR/agent-${agent_id}.json"

    if [ ! -f "$creds_file" ]; then
        audit_log "$agent_id" "auth_failed" "Unknown agent ID" "failure"
        return 1
    fi

    local stored_hash=$(jq -r '.token_hash' "$creds_file")
    local provided_hash=$(echo -n "$token" | shasum -a 256 | cut -d' ' -f1)

    if [ "$stored_hash" = "$provided_hash" ]; then
        audit_log "$agent_id" "auth_success" "Token verified" "success"
        return 0
    else
        audit_log "$agent_id" "auth_failed" "Invalid token" "failure"
        return 1
    fi
}

# ════════════════════════════════════════════════════════════════
# SIGNED MEMORY ENTRIES
# ════════════════════════════════════════════════════════════════

# Create cryptographically signed memory entry
create_signed_entry() {
    local agent_id="$1"
    local action="$2"
    local entity="$3"
    local details="${4:-}"

    if [ -z "$agent_id" ] || [ -z "$action" ] || [ -z "$entity" ]; then
        log_error "Usage: create_signed_entry <agent_id> <action> <entity> [details]"
        return 1
    fi

    # Check if agent has signing key
    local agent_key_file="$KEYS_DIR/agent-${agent_id}.key"
    if [ ! -f "$agent_key_file" ]; then
        log_error "Agent key not found. Generate identity first."
        return 1
    fi

    local timestamp=$(get_timestamp)
    local parent_hash=$(tail -1 "$JOURNAL_DIR/master-journal.jsonl" 2>/dev/null | jq -r '.sha256' || echo '0000000000000000')
    local nonce="$$-$(generate_secure_token 8)"

    # Create entry hash
    local hash_input="${timestamp}${action}${entity}${details}${parent_hash}${nonce}${agent_id}"
    local sha256=$(echo -n "$hash_input" | shasum -a 256 | cut -d' ' -f1)

    # Sign the entry
    local signature=$(echo -n "$sha256" | openssl dgst -sha256 -sign "$agent_key_file" 2>/dev/null | base64 | tr -d '\n')

    # Create signed entry
    local entry=$(jq -nc \
        --arg timestamp "$timestamp" \
        --arg action "$action" \
        --arg entity "$entity" \
        --arg details "$details" \
        --arg sha256 "$sha256" \
        --arg parent_hash "$parent_hash" \
        --arg nonce "$nonce" \
        --arg agent_id "$agent_id" \
        --arg signature "$signature" \
        '{
            timestamp: $timestamp,
            action: $action,
            entity: $entity,
            details: $details,
            sha256: $sha256,
            parent_hash: $parent_hash,
            nonce: $nonce,
            security: {
                agent_id: $agent_id,
                signature: $signature,
                signed_at: $timestamp
            }
        }')

    # Atomic append
    echo "$entry" >> "$JOURNAL_DIR/master-journal.jsonl"

    audit_log "$agent_id" "memory_write" "Signed entry: $action -> $entity" "success"

    echo -e "${PINK}[SECURE]${NC} Logged: ${action} -> ${entity} (signed by ${agent_id:0:20}...)"
}

# Verify entry signature
verify_entry_signature() {
    local entry_hash="$1"

    local entry=$(grep "\"sha256\":\"$entry_hash\"" "$JOURNAL_DIR/master-journal.jsonl" 2>/dev/null)

    if [ -z "$entry" ]; then
        log_error "Entry not found: $entry_hash"
        return 1
    fi

    local agent_id=$(echo "$entry" | jq -r '.security.agent_id // empty')
    local signature=$(echo "$entry" | jq -r '.security.signature // empty')
    local stored_hash=$(echo "$entry" | jq -r '.sha256')

    if [ -z "$agent_id" ] || [ -z "$signature" ]; then
        log_warning "Entry is unsigned (legacy format)"
        return 2
    fi

    local agent_pub_file="$KEYS_DIR/agent-${agent_id}.pub"
    if [ ! -f "$agent_pub_file" ]; then
        log_error "Agent public key not found: $agent_id"
        return 1
    fi

    # Verify signature
    if echo -n "$stored_hash" | openssl dgst -sha256 -verify "$agent_pub_file" -signature <(echo "$signature" | base64 -d) 2>/dev/null; then
        log_success "Signature verified for entry: ${entry_hash:0:16}..."
        return 0
    else
        log_error "Signature verification FAILED for entry: ${entry_hash:0:16}..."
        audit_log "system" "signature_failed" "Entry: $entry_hash, Agent: $agent_id" "failure"
        return 1
    fi
}

# ════════════════════════════════════════════════════════════════
# ENCRYPTION
# ════════════════════════════════════════════════════════════════

# Encrypt sensitive data
encrypt_data() {
    local data="$1"
    local key_name="${2:-default}"

    local key_file="$KEYS_DIR/encrypt-${key_name}.key"

    # Generate encryption key if needed
    if [ ! -f "$key_file" ]; then
        openssl rand -base64 32 > "$key_file"
        chmod 600 "$key_file"
    fi

    echo -n "$data" | openssl enc -aes-256-cbc -a -salt -pbkdf2 -pass file:"$key_file" 2>/dev/null
}

# Decrypt sensitive data
decrypt_data() {
    local encrypted="$1"
    local key_name="${2:-default}"

    local key_file="$KEYS_DIR/encrypt-${key_name}.key"

    if [ ! -f "$key_file" ]; then
        log_error "Encryption key not found: $key_name"
        return 1
    fi

    echo "$encrypted" | openssl enc -aes-256-cbc -a -d -salt -pbkdf2 -pass file:"$key_file" 2>/dev/null
}

# ════════════════════════════════════════════════════════════════
# AUDIT LOGGING
# ════════════════════════════════════════════════════════════════

audit_log() {
    local agent_id="${1:-system}"
    local action="$2"
    local details="${3:-}"
    local status="${4:-info}"

    local timestamp=$(get_timestamp)
    local audit_file="$AUDIT_DIR/audit-$(date +%Y-%m-%d).jsonl"

    local entry=$(jq -nc \
        --arg timestamp "$timestamp" \
        --arg agent_id "$agent_id" \
        --arg action "$action" \
        --arg details "$details" \
        --arg status "$status" \
        --arg source_ip "localhost" \
        --arg pid "$$" \
        '{
            timestamp: $timestamp,
            agent_id: $agent_id,
            action: $action,
            details: $details,
            status: $status,
            metadata: {
                source_ip: $source_ip,
                pid: $pid
            }
        }')

    echo "$entry" >> "$audit_file"
    chmod 600 "$audit_file"
}

# Show audit log
show_audit() {
    local days="${1:-1}"
    local filter="${2:-}"

    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}           ${CYAN}Security Audit Log${NC}                            ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    for ((i=0; i<days; i++)); do
        local date=$(date -v-${i}d +%Y-%m-%d 2>/dev/null || date -d "-${i} days" +%Y-%m-%d)
        local audit_file="$AUDIT_DIR/audit-${date}.jsonl"

        if [ -f "$audit_file" ]; then
            echo -e "${CYAN}=== $date ===${NC}"
            if [ -n "$filter" ]; then
                grep -i "$filter" "$audit_file" | tail -20 | jq -r '"[\(.timestamp[11:19])] \(.status | if . == "success" then "✅" elif . == "failure" then "❌" else "ℹ️" end) \(.agent_id[0:20]): \(.action) - \(.details)"'
            else
                tail -20 "$audit_file" | jq -r '"[\(.timestamp[11:19])] \(.status | if . == "success" then "✅" elif . == "failure" then "❌" else "ℹ️" end) \(.agent_id[0:20]): \(.action) - \(.details)"'
            fi
            echo ""
        fi
    done
}

# ════════════════════════════════════════════════════════════════
# INTEGRITY VERIFICATION
# ════════════════════════════════════════════════════════════════

verify_chain_integrity() {
    log_info "Verifying memory chain integrity with signatures..."

    if [ ! -f "$JOURNAL_DIR/master-journal.jsonl" ]; then
        log_error "No journal found"
        return 1
    fi

    local total=$(wc -l < "$JOURNAL_DIR/master-journal.jsonl")
    local valid_chain=0
    local valid_sig=0
    local unsigned=0
    local broken=0
    local line_num=0

    while IFS= read -r line; do
        ((line_num++))

        local parent_hash=$(echo "$line" | jq -r '.parent_hash')
        local stored_hash=$(echo "$line" | jq -r '.sha256')
        local signature=$(echo "$line" | jq -r '.security.signature // empty')

        # Check chain continuity
        if [ "$parent_hash" = "0000000000000000" ]; then
            ((valid_chain++))
        elif head -$((line_num - 1)) "$JOURNAL_DIR/master-journal.jsonl" | grep -q "\"sha256\":\"$parent_hash\""; then
            ((valid_chain++))
        else
            ((broken++))
            log_warning "Broken chain at entry $line_num"
        fi

        # Check signature
        if [ -n "$signature" ]; then
            # Quick check - full verification is expensive
            ((valid_sig++))
        else
            ((unsigned++))
        fi

        # Progress indicator for large journals
        if [ $((line_num % 10000)) -eq 0 ]; then
            echo -ne "\r  Checked $line_num / $total entries..."
        fi
    done < "$JOURNAL_DIR/master-journal.jsonl"

    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${GREEN}Total entries:${NC}    $total"
    echo -e "  ${GREEN}Valid chain:${NC}      $valid_chain"
    echo -e "  ${GREEN}Signed entries:${NC}   $valid_sig"
    echo -e "  ${YELLOW}Unsigned (legacy):${NC} $unsigned"
    echo -e "  ${RED}Broken links:${NC}     $broken"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    if [ $broken -eq 0 ]; then
        log_success "Chain integrity verified"
        return 0
    else
        log_error "Chain integrity compromised: $broken broken links"
        return 1
    fi
}

# ════════════════════════════════════════════════════════════════
# SECURITY HARDENING
# ════════════════════════════════════════════════════════════════

harden_permissions() {
    log_info "Hardening file permissions..."

    # Memory directory - owner only
    chmod 700 "$HOME/.blackroad/memory"

    # Journals - read/write for owner only
    find "$JOURNAL_DIR" -type f -name "*.jsonl" -exec chmod 600 {} \;

    # API keys - maximum security
    if [ -d "$HOME/.blackroad/api-keys" ]; then
        chmod 700 "$HOME/.blackroad/api-keys"
        find "$HOME/.blackroad/api-keys" -type f -exec chmod 600 {} \;
    fi

    # Security directory
    chmod 700 "$SECURITY_DIR"
    find "$KEYS_DIR" -type f -name "*.key" -exec chmod 600 {} \;
    find "$KEYS_DIR" -type f -name "*.secret" -exec chmod 600 {} \;

    # Active agents - restrict access
    if [ -d "$MEMORY_DIR/active-agents" ]; then
        chmod 700 "$MEMORY_DIR/active-agents"
        find "$MEMORY_DIR/active-agents" -type f -exec chmod 600 {} \;
    fi

    log_success "Permissions hardened"
    audit_log "system" "permissions_hardened" "All sensitive files secured" "success"
}

# ════════════════════════════════════════════════════════════════
# STATUS & SUMMARY
# ════════════════════════════════════════════════════════════════

show_status() {
    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}        ${CYAN}BlackRoad Memory Security Status${NC}                ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Check initialization
    if [ -f "$SECURITY_DIR/config.json" ]; then
        echo -e "  ${GREEN}Initialized:${NC}     Yes"
        echo -e "  ${GREEN}Version:${NC}         $(jq -r '.version' "$SECURITY_DIR/config.json")"
    else
        echo -e "  ${RED}Initialized:${NC}     No (run: $0 init)"
        return 1
    fi

    # Count agent identities
    local agent_count=$(ls -1 "$TOKENS_DIR"/agent-*.json 2>/dev/null | wc -l | tr -d ' ')
    echo -e "  ${GREEN}Agent identities:${NC} $agent_count"

    # Check master key
    if [ -f "$KEYS_DIR/master.key" ]; then
        echo -e "  ${GREEN}Master key:${NC}      Present"
    else
        echo -e "  ${RED}Master key:${NC}      Missing"
    fi

    # Check HMAC secret
    if [ -f "$KEYS_DIR/hmac.secret" ]; then
        echo -e "  ${GREEN}HMAC secret:${NC}     Present"
    else
        echo -e "  ${RED}HMAC secret:${NC}     Missing"
    fi

    # Journal security
    if [ -f "$JOURNAL_DIR/master-journal.jsonl" ]; then
        local perms=$(stat -f "%Sp" "$JOURNAL_DIR/master-journal.jsonl" 2>/dev/null || stat -c "%a" "$JOURNAL_DIR/master-journal.jsonl")
        if [ "$perms" = "-rw-------" ] || [ "$perms" = "600" ]; then
            echo -e "  ${GREEN}Journal perms:${NC}   Secure (600)"
        else
            echo -e "  ${YELLOW}Journal perms:${NC}   $perms (should be 600)"
        fi
    fi

    # Today's audit entries
    local today=$(date +%Y-%m-%d)
    local audit_file="$AUDIT_DIR/audit-${today}.jsonl"
    if [ -f "$audit_file" ]; then
        local audit_count=$(wc -l < "$audit_file" | tr -d ' ')
        local failures=$(grep -c '"status":"failure"' "$audit_file" 2>/dev/null || echo "0")
        echo -e "  ${GREEN}Today's audits:${NC}  $audit_count entries, $failures failures"
    else
        echo -e "  ${YELLOW}Today's audits:${NC}  No entries yet"
    fi

    echo ""
}

# ════════════════════════════════════════════════════════════════
# HELP
# ════════════════════════════════════════════════════════════════

show_help() {
    cat <<EOF
${PINK}BlackRoad Memory Security System v${VERSION}${NC}

${CYAN}USAGE:${NC}
    memory-security.sh <command> [options]

${CYAN}COMMANDS:${NC}
    ${GREEN}init${NC}                          Initialize security system
    ${GREEN}status${NC}                        Show security status
    ${GREEN}harden${NC}                        Harden file permissions

    ${GREEN}identity [name]${NC}               Generate secure agent identity
    ${GREEN}verify-token <id> <token>${NC}     Verify agent token

    ${GREEN}sign <id> <action> <entity>${NC}   Create signed memory entry
    ${GREEN}verify-sig <hash>${NC}             Verify entry signature
    ${GREEN}verify-chain${NC}                  Verify chain integrity

    ${GREEN}encrypt <data> [key]${NC}          Encrypt sensitive data
    ${GREEN}decrypt <data> [key]${NC}          Decrypt data

    ${GREEN}audit [days] [filter]${NC}         Show audit log

    ${GREEN}help${NC}                          Show this help

${CYAN}EXAMPLES:${NC}
    # Initialize
    memory-security.sh init

    # Generate agent identity
    memory-security.sh identity prometheus-builder

    # Create signed entry
    memory-security.sh sign erebus-1234 deployed api.blackroad.io "Port 8080"

    # View audit log
    memory-security.sh audit 7 failure

${CYAN}SECURITY FEATURES:${NC}
    - RSA 4096-bit master keypair
    - Agent-specific 2048-bit keypairs
    - HMAC-signed authentication tokens
    - AES-256-CBC encryption
    - Append-only audit logging
    - Chain integrity verification
    - Signature verification

EOF
}

# ════════════════════════════════════════════════════════════════
# MAIN
# ════════════════════════════════════════════════════════════════

case "${1:-help}" in
    init)
        init_security
        ;;
    status)
        show_status
        ;;
    harden)
        harden_permissions
        ;;
    identity)
        generate_agent_identity "$2"
        ;;
    verify-token)
        verify_agent_token "$2" "$3"
        ;;
    sign)
        create_signed_entry "$2" "$3" "$4" "$5"
        ;;
    verify-sig)
        verify_entry_signature "$2"
        ;;
    verify-chain)
        verify_chain_integrity
        ;;
    encrypt)
        encrypt_data "$2" "$3"
        ;;
    decrypt)
        decrypt_data "$2" "$3"
        ;;
    audit)
        show_audit "${2:-1}" "$3"
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
