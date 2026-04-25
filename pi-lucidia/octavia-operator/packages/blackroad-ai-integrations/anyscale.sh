#!/bin/bash
# Anyscale AI Integration for BlackRoad OS
# Provides model inference using Anyscale endpoints
# Usage: source ~/blackroad-ai-integrations/anyscale.sh

set -e

# BlackRoad Brand Colors
PINK='\033[38;5;205m'   # Hot pink (#FF1D6C)
AMBER='\033[38;5;214m'  # Amber (#F5A623)
BLUE='\033[38;5;69m'    # Electric blue (#2979FF)
VIOLET='\033[38;5;135m' # Violet (#9C27B0)
GREEN='\033[38;5;82m'   # Success
RED='\033[38;5;196m'    # Error
RESET='\033[0m'

# Anyscale Configuration
ANYSCALE_BASE_URL="https://api.endpoints.anyscale.com/v1"
ANYSCALE_DEFAULT_MODEL="meta-llama/Llama-2-70b-chat-hf"

# Available Models
declare -A ANYSCALE_MODELS=(
    ["llama2-70b"]="meta-llama/Llama-2-70b-chat-hf"
    ["llama2-13b"]="meta-llama/Llama-2-13b-chat-hf"
    ["llama2-7b"]="meta-llama/Llama-2-7b-chat-hf"
    ["mistral-7b"]="mistralai/Mistral-7B-Instruct-v0.1"
    ["mixtral-8x7b"]="mistralai/Mixtral-8x7B-Instruct-v0.1"
    ["codellama-34b"]="codellama/CodeLlama-34b-Instruct-hf"
    ["zephyr-7b"]="HuggingFaceH4/zephyr-7b-beta"
)

# Helper function to print colored messages
anyscale_log() {
    local level=$1
    shift
    local message="$@"

    case $level in
        "info")
            echo -e "${BLUE}[ANYSCALE]${RESET} $message"
            ;;
        "success")
            echo -e "${GREEN}[ANYSCALE]${RESET} $message"
            ;;
        "error")
            echo -e "${RED}[ANYSCALE ERROR]${RESET} $message" >&2
            ;;
        "warn")
            echo -e "${AMBER}[ANYSCALE WARNING]${RESET} $message"
            ;;
    esac
}

# Check for API key
anyscale_check_auth() {
    if [[ -z "${ANYSCALE_API_KEY}" ]]; then
        anyscale_log "error" "ANYSCALE_API_KEY environment variable is not set"
        anyscale_log "info" "Get your API key from: https://app.endpoints.anyscale.com/"
        anyscale_log "info" "Set it with: export ANYSCALE_API_KEY='your-key-here'"
        return 1
    fi

    anyscale_log "success" "API key found"
    return 0
}

# List available models
anyscale_list_models() {
    anyscale_log "info" "Available Anyscale models:"
    echo ""
    for key in "${!ANYSCALE_MODELS[@]}"; do
        echo -e "  ${VIOLET}$key${RESET} → ${ANYSCALE_MODELS[$key]}"
    done
    echo ""
}

# Get model ID from short name
anyscale_get_model() {
    local model_key=$1

    if [[ -z "$model_key" ]]; then
        echo "$ANYSCALE_DEFAULT_MODEL"
        return 0
    fi

    if [[ -n "${ANYSCALE_MODELS[$model_key]}" ]]; then
        echo "${ANYSCALE_MODELS[$model_key]}"
    else
        # Assume it's a full model ID
        echo "$model_key"
    fi
}

# Basic chat completion
anyscale_chat() {
    local prompt="$1"
    local model_key="${2:-llama2-70b}"
    local max_tokens="${3:-512}"
    local temperature="${4:-0.7}"

    if ! anyscale_check_auth; then
        return 1
    fi

    local model=$(anyscale_get_model "$model_key")
    anyscale_log "info" "Using model: $model"

    local response=$(curl -s -X POST "$ANYSCALE_BASE_URL/chat/completions" \
        -H "Authorization: Bearer $ANYSCALE_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"$model\",
            \"messages\": [{\"role\": \"user\", \"content\": \"$prompt\"}],
            \"max_tokens\": $max_tokens,
            \"temperature\": $temperature
        }" 2>&1)

    # Check for errors
    if echo "$response" | grep -q '"error"'; then
        anyscale_log "error" "API request failed"
        echo "$response" | jq -r '.error.message // .error' 2>/dev/null || echo "$response"
        return 1
    fi

    # Extract and display response
    local content=$(echo "$response" | jq -r '.choices[0].message.content' 2>/dev/null)
    if [[ -n "$content" && "$content" != "null" ]]; then
        echo "$content"
        return 0
    else
        anyscale_log "error" "Failed to parse response"
        echo "$response"
        return 1
    fi
}

# Streaming chat completion
anyscale_chat_stream() {
    local prompt="$1"
    local model_key="${2:-llama2-70b}"
    local max_tokens="${3:-512}"
    local temperature="${4:-0.7}"

    if ! anyscale_check_auth; then
        return 1
    fi

    local model=$(anyscale_get_model "$model_key")
    anyscale_log "info" "Streaming from model: $model"

    curl -s -N -X POST "$ANYSCALE_BASE_URL/chat/completions" \
        -H "Authorization: Bearer $ANYSCALE_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"$model\",
            \"messages\": [{\"role\": \"user\", \"content\": \"$prompt\"}],
            \"max_tokens\": $max_tokens,
            \"temperature\": $temperature,
            \"stream\": true
        }" | while IFS= read -r line; do
            # Skip empty lines and "data: [DONE]"
            if [[ -z "$line" || "$line" == "data: [DONE]" ]]; then
                continue
            fi

            # Remove "data: " prefix
            json_line="${line#data: }"

            # Extract content delta
            delta=$(echo "$json_line" | jq -r '.choices[0].delta.content // empty' 2>/dev/null)
            if [[ -n "$delta" && "$delta" != "null" ]]; then
                echo -n "$delta"
            fi
        done
    echo ""
}

# Multi-turn conversation
anyscale_conversation() {
    local model_key="${1:-llama2-70b}"
    local model=$(anyscale_get_model "$model_key")

    if ! anyscale_check_auth; then
        return 1
    fi

    anyscale_log "info" "Starting conversation with $model"
    anyscale_log "info" "Type 'exit' or 'quit' to end conversation"
    echo ""

    local messages="[]"

    while true; do
        echo -e -n "${PINK}You:${RESET} "
        read -r user_input

        if [[ "$user_input" == "exit" || "$user_input" == "quit" ]]; then
            anyscale_log "info" "Ending conversation"
            break
        fi

        # Add user message
        messages=$(echo "$messages" | jq --arg content "$user_input" '. += [{"role": "user", "content": $content}]')

        # Get response
        local response=$(curl -s -X POST "$ANYSCALE_BASE_URL/chat/completions" \
            -H "Authorization: Bearer $ANYSCALE_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{
                \"model\": \"$model\",
                \"messages\": $messages,
                \"max_tokens\": 512,
                \"temperature\": 0.7
            }")

        # Check for errors
        if echo "$response" | grep -q '"error"'; then
            anyscale_log "error" "API request failed"
            echo "$response" | jq -r '.error.message // .error' 2>/dev/null || echo "$response"
            continue
        fi

        # Extract assistant response
        local assistant_message=$(echo "$response" | jq -r '.choices[0].message.content' 2>/dev/null)
        if [[ -n "$assistant_message" && "$assistant_message" != "null" ]]; then
            echo -e "${VIOLET}Assistant:${RESET} $assistant_message"
            echo ""

            # Add assistant message to history
            messages=$(echo "$messages" | jq --arg content "$assistant_message" '. += [{"role": "assistant", "content": $content}]')
        else
            anyscale_log "error" "Failed to parse response"
        fi
    done
}

# Code generation helper
anyscale_code() {
    local description="$1"
    local language="${2:-python}"

    local prompt="Write $language code for: $description. Only return the code, no explanations."

    anyscale_chat "$prompt" "codellama-34b" 1024 0.3
}

# Code explanation helper
anyscale_explain_code() {
    local code="$1"

    local prompt="Explain what this code does:\n\n$code"

    anyscale_chat "$prompt" "codellama-34b" 512 0.5
}

# Batch inference
anyscale_batch() {
    local input_file="$1"
    local model_key="${2:-llama2-70b}"
    local output_file="${3:-anyscale_batch_output.jsonl}"

    if [[ ! -f "$input_file" ]]; then
        anyscale_log "error" "Input file not found: $input_file"
        return 1
    fi

    if ! anyscale_check_auth; then
        return 1
    fi

    local model=$(anyscale_get_model "$model_key")
    anyscale_log "info" "Processing batch with model: $model"

    local count=0
    > "$output_file"  # Clear output file

    while IFS= read -r prompt; do
        ((count++))
        anyscale_log "info" "Processing prompt $count..."

        local response=$(curl -s -X POST "$ANYSCALE_BASE_URL/chat/completions" \
            -H "Authorization: Bearer $ANYSCALE_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{
                \"model\": \"$model\",
                \"messages\": [{\"role\": \"user\", \"content\": \"$prompt\"}],
                \"max_tokens\": 512,
                \"temperature\": 0.7
            }")

        # Save full response to JSONL
        echo "$response" >> "$output_file"
    done < "$input_file"

    anyscale_log "success" "Batch processing complete: $count prompts processed"
    anyscale_log "info" "Results saved to: $output_file"
}

# Model comparison
anyscale_compare() {
    local prompt="$1"
    shift
    local models=("$@")

    if [[ ${#models[@]} -eq 0 ]]; then
        models=("llama2-7b" "llama2-13b" "llama2-70b")
    fi

    anyscale_log "info" "Comparing models on prompt: $prompt"
    echo ""

    for model_key in "${models[@]}"; do
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
        echo -e "${VIOLET}Model:${RESET} $model_key"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
        anyscale_chat "$prompt" "$model_key" 256 0.7
        echo ""
    done
}

# Health check
anyscale_health() {
    if ! anyscale_check_auth; then
        return 1
    fi

    anyscale_log "info" "Running health check..."

    # Try a simple completion
    local test_response=$(curl -s -X POST "$ANYSCALE_BASE_URL/chat/completions" \
        -H "Authorization: Bearer $ANYSCALE_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"$ANYSCALE_DEFAULT_MODEL\",
            \"messages\": [{\"role\": \"user\", \"content\": \"Say 'OK' if you can read this.\"}],
            \"max_tokens\": 10
        }" 2>&1)

    if echo "$test_response" | grep -q '"error"'; then
        anyscale_log "error" "Health check failed"
        echo "$test_response" | jq -r '.error.message // .error' 2>/dev/null || echo "$test_response"
        return 1
    fi

    anyscale_log "success" "Health check passed - Anyscale API is accessible"
    return 0
}

# Usage information
anyscale_help() {
    cat << 'EOF'
╔════════════════════════════════════════════════════════════╗
║         🚀 ANYSCALE AI INTEGRATION - BLACKROAD OS         ║
╚════════════════════════════════════════════════════════════╝

SETUP:
  export ANYSCALE_API_KEY='your-api-key-here'
  source ~/blackroad-ai-integrations/anyscale.sh

FUNCTIONS:

  anyscale_help               Show this help message
  anyscale_check_auth         Verify API key is set
  anyscale_health             Run health check
  anyscale_list_models        List available models

  anyscale_chat <prompt> [model] [max_tokens] [temperature]
      Basic chat completion
      Example: anyscale_chat "Explain quantum computing" llama2-70b

  anyscale_chat_stream <prompt> [model] [max_tokens] [temperature]
      Streaming chat completion
      Example: anyscale_chat_stream "Write a story" mistral-7b

  anyscale_conversation [model]
      Interactive multi-turn conversation
      Example: anyscale_conversation llama2-70b

  anyscale_code <description> [language]
      Generate code from description
      Example: anyscale_code "binary search tree" python

  anyscale_explain_code <code>
      Explain what code does
      Example: anyscale_explain_code "$(cat script.py)"

  anyscale_batch <input_file> [model] [output_file]
      Batch process prompts from file
      Example: anyscale_batch prompts.txt llama2-13b results.jsonl

  anyscale_compare <prompt> [model1] [model2] ...
      Compare responses across models
      Example: anyscale_compare "What is AI?" llama2-7b llama2-70b

AVAILABLE MODELS:
  llama2-70b      Meta Llama 2 70B (default)
  llama2-13b      Meta Llama 2 13B
  llama2-7b       Meta Llama 2 7B
  mistral-7b      Mistral 7B Instruct
  mixtral-8x7b    Mixtral 8x7B Instruct
  codellama-34b   CodeLlama 34B Instruct
  zephyr-7b       Zephyr 7B Beta

EXAMPLES:

  # Simple question
  anyscale_chat "What is the capital of France?"

  # Code generation
  anyscale_code "quicksort algorithm" python

  # Interactive conversation
  anyscale_conversation mistral-7b

  # Compare models
  anyscale_compare "Explain machine learning" llama2-7b llama2-70b

  # Streaming response
  anyscale_chat_stream "Tell me a story about AI"

DOCUMENTATION:
  https://docs.anyscale.com/
  https://app.endpoints.anyscale.com/

EOF
}

# Auto-display help on source
anyscale_log "success" "Anyscale integration loaded"
anyscale_log "info" "Run 'anyscale_help' for usage information"

# Check auth status on load
if anyscale_check_auth &>/dev/null; then
    anyscale_log "success" "Authentication configured"
else
    anyscale_log "warn" "ANYSCALE_API_KEY not set - configure before using"
fi
