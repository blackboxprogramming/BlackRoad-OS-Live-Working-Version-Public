#!/bin/zsh
#===============================================================================
# BLACKROAD AGENT ENGINE
# Pure local AI - No cloud, no APIs, no dependencies
# Your models. Your hardware. Your agents.
#===============================================================================

AGENT_HOME="${HOME}/.blackroad-agents"
MODELS_DIR="${AGENT_HOME}/models"
MEMORY_DIR="${AGENT_HOME}/memory"
AGENTS_DIR="${AGENT_HOME}/agents"

# Inference backends (priority order)
LLAMA_CPP="${HOME}/BlackRoad-AI/llama.cpp/main"
MLX_LM="python3 -m mlx_lm.generate"
OLLAMA="ollama"

#-------------------------------------------------------------------------------
# MEMORY SYSTEM - SQLite-backed persistent recall
#-------------------------------------------------------------------------------
init_memory() {
    local agent=$1
    local db="${MEMORY_DIR}/${agent}.db"

    sqlite3 "$db" <<EOF
CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding BLOB,
    importance REAL DEFAULT 0.5
);

CREATE TABLE IF NOT EXISTS facts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    source TEXT
);

CREATE TABLE IF NOT EXISTS relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity1 TEXT NOT NULL,
    relation TEXT NOT NULL,
    entity2 TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memories_time ON memories(timestamp);
CREATE INDEX IF NOT EXISTS idx_facts_key ON facts(key);
EOF
}

remember() {
    local agent=$1
    local role=$2
    local content=$3
    local db="${MEMORY_DIR}/${agent}.db"

    # Escape single quotes and newlines for safe SQL
    local escaped="${content//\'/\'\'}"
    escaped="${escaped//$'\n'/\\n}"
    escaped="${escaped//$'\r'/}"
    sqlite3 "$db" "INSERT INTO memories (role, content) VALUES ('$role', '${escaped}');"
}

recall() {
    local agent=$1
    local limit=${2:-20}
    local db="${MEMORY_DIR}/${agent}.db"

    # Validate limit is a positive integer to prevent SQL injection
    if ! [[ "$limit" =~ ^[0-9]+$ ]] || (( limit <= 0 )); then
        limit=20
    fi

    sqlite3 -json "$db" "SELECT role, content, timestamp FROM memories ORDER BY timestamp DESC LIMIT $limit;" 2>/dev/null || \
    sqlite3 "$db" "SELECT role || ': ' || content FROM memories ORDER BY timestamp DESC LIMIT $limit;"
}

learn_fact() {
    local agent=$1
    local key=$2
    local value=$3
    local db="${MEMORY_DIR}/${agent}.db"

    # Escape single quotes and newlines for safe SQL
    local escaped_key="${key//\'/\'\'}"
    escaped_key="${escaped_key//$'\n'/\\n}"
    local escaped_val="${value//\'/\'\'}"
    escaped_val="${escaped_val//$'\n'/\\n}"
    escaped_val="${escaped_val//$'\r'/}"
    sqlite3 "$db" "INSERT OR REPLACE INTO facts (key, value) VALUES ('${escaped_key}', '${escaped_val}');"
}

recall_facts() {
    local agent=$1
    local db="${MEMORY_DIR}/${agent}.db"

    sqlite3 "$db" "SELECT key || ': ' || value FROM facts ORDER BY timestamp DESC LIMIT 50;"
}

#-------------------------------------------------------------------------------
# MODEL INFERENCE
#-------------------------------------------------------------------------------
detect_backend() {
    # Check for llama.cpp first (fastest, most portable)
    if [[ -x "$LLAMA_CPP" ]]; then
        echo "llama.cpp"
        return
    fi

    # Check for local llama.cpp build
    if command -v llama-cli &>/dev/null; then
        echo "llama-cli"
        return
    fi

    # Check for MLX (Apple Silicon)
    if python3 -c "import mlx_lm" 2>/dev/null; then
        echo "mlx"
        return
    fi

    # Check for Ollama
    if command -v ollama &>/dev/null; then
        echo "ollama"
        return
    fi

    echo "none"
}

get_model_for_agent() {
    local agent=$1
    local backend=$2

    # For Ollama, use custom model names
    if [[ "$backend" == "ollama" ]]; then
        case $agent in
            lucidia)
                # Use the custom lucidia model if available
                if ollama list 2>/dev/null | grep -q "lucidia:"; then
                    echo "lucidia:latest"
                else
                    echo "llama3.1:latest"
                fi
                ;;
            octavia)
                echo "llama3.1:latest"  # Architect needs smarter model
                ;;
            alice)
                echo "mistral:latest"   # Operator - good at instructions
                ;;
            aria)
                echo "llama3.1:latest"
                ;;
            shellfish)
                echo "mistral:latest"   # Good at precise analysis
                ;;
            *)
                echo "llama3.1:latest"
                ;;
        esac
        return
    fi

    # For llama.cpp/MLX, use GGUF files
    local config="${AGENTS_DIR}/${agent}/config.yaml"
    if [[ -f "$config" ]]; then
        grep "^model:" "$config" | cut -d: -f2 | tr -d ' '
    else
        echo "${MODELS_DIR}/default.gguf"
    fi
}

infer_llama_cpp() {
    local model=$1
    local prompt=$2
    local system_prompt=$3

    "$LLAMA_CPP" \
        -m "$model" \
        --prompt "<|system|>$system_prompt<|end|><|user|>$prompt<|end|><|assistant|>" \
        -n 2048 \
        --temp 0.7 \
        --repeat-penalty 1.1 \
        -ngl 99 \
        2>/dev/null
}

infer_llama_cli() {
    local model=$1
    local prompt=$2
    local system_prompt=$3

    llama-cli \
        -m "$model" \
        --prompt "<|system|>$system_prompt<|end|><|user|>$prompt<|end|><|assistant|>" \
        -n 2048 \
        --temp 0.7 \
        -ngl 99 \
        2>/dev/null
}

infer_mlx() {
    local model=$1
    local prompt=$2
    local system_prompt=$3

    python3 -m mlx_lm.generate \
        --model "$model" \
        --prompt "<|system|>$system_prompt<|end|><|user|>$prompt<|end|><|assistant|>" \
        --max-tokens 2048 \
        --temp 0.7 \
        2>/dev/null
}

infer_ollama() {
    local model=$1
    local prompt=$2
    local system_prompt=$3

    # Use Ollama API with proper JSON escaping for all user-supplied strings
    local response=$(curl -s http://localhost:11434/api/generate \
        -H "Content-Type: application/json" \
        -d "$(jq -n \
            --arg model "$model" \
            --arg prompt "$prompt" \
            --arg system "$system_prompt" \
            '{model: $model, prompt: $prompt, system: $system, stream: false}')" \
        2>/dev/null)

    echo "$response" | jq -r '.response // empty' 2>/dev/null
}

#-------------------------------------------------------------------------------
# AGENT INVOCATION
#-------------------------------------------------------------------------------
invoke_agent() {
    local agent=$1
    shift
    local prompt="$*"

    local agent_dir="${AGENTS_DIR}/${agent}"
    local personality="${agent_dir}/personality.md"
    local config="${agent_dir}/config.yaml"

    # Initialize memory if needed
    init_memory "$agent"

    # Load personality
    local system_prompt=""
    if [[ -f "$personality" ]]; then
        system_prompt=$(cat "$personality")
    else
        system_prompt="You are ${agent}, a BlackRoad AI agent. You are helpful, capable, and remember everything."
    fi

    # Inject recent memories
    local memories=$(recall "$agent" 10)
    if [[ -n "$memories" ]]; then
        system_prompt="${system_prompt}

## Recent Conversation Memory:
${memories}"
    fi

    # Inject known facts
    local facts=$(recall_facts "$agent")
    if [[ -n "$facts" ]]; then
        system_prompt="${system_prompt}

## Known Facts:
${facts}"
    fi

    # Detect backend and model
    local backend=$(detect_backend)
    local model=$(get_model_for_agent "$agent" "$backend")

    if [[ "$backend" == "none" ]]; then
        echo "ERROR: No inference backend found."
        echo "Install one of:"
        echo "  - llama.cpp: cd ~/BlackRoad-AI/llama.cpp && make"
        echo "  - MLX: pip3 install mlx-lm"
        echo "  - Ollama: brew install ollama"
        return 1
    fi

    # Remember the user input
    remember "$agent" "user" "$prompt"

    # Run inference
    local response=""
    case "$backend" in
        llama.cpp)
            response=$(infer_llama_cpp "$model" "$prompt" "$system_prompt")
            ;;
        llama-cli)
            response=$(infer_llama_cli "$model" "$prompt" "$system_prompt")
            ;;
        mlx)
            response=$(infer_mlx "$model" "$prompt" "$system_prompt")
            ;;
        ollama)
            response=$(infer_ollama "$model" "$prompt" "$system_prompt")
            ;;
    esac

    # Remember the response
    remember "$agent" "assistant" "$response"

    # Output
    echo "$response"
}

#-------------------------------------------------------------------------------
# AGENT STATUS
#-------------------------------------------------------------------------------
agent_status() {
    local agent=$1
    local db="${MEMORY_DIR}/${agent}.db"

    echo "═══════════════════════════════════════════════════════"
    echo "  AGENT: $agent"
    echo "═══════════════════════════════════════════════════════"

    if [[ -f "$db" ]]; then
        local memory_count=$(sqlite3 "$db" "SELECT COUNT(*) FROM memories;" 2>/dev/null || echo "0")
        local fact_count=$(sqlite3 "$db" "SELECT COUNT(*) FROM facts;" 2>/dev/null || echo "0")
        local last_active=$(sqlite3 "$db" "SELECT timestamp FROM memories ORDER BY timestamp DESC LIMIT 1;" 2>/dev/null || echo "never")

        echo "  Memories: $memory_count"
        echo "  Facts: $fact_count"
        echo "  Last Active: $last_active"
    else
        echo "  Status: Not initialized"
    fi

    local backend=$(detect_backend)
    echo "  Backend: $backend"
    echo "═══════════════════════════════════════════════════════"
}

# Variables available to all scripts that source this file
# (zsh doesn't need export -f, functions are available after source)
