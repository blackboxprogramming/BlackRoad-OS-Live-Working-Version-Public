#!/bin/bash
# Fireworks.ai Integration Script
# Usage: source ~/blackroad-ai-integrations/fireworks-ai.sh
# Provides functions for Fireworks.ai API interactions

set -e

# BlackRoad Brand Colors
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

# Fireworks API Configuration
FIREWORKS_API_BASE="https://api.fireworks.ai/inference/v1"
FIREWORKS_DEFAULT_MODEL="accounts/fireworks/models/llama-v3p1-70b-instruct"

# Check for API key
fireworks_check_api_key() {
    if [ -z "$FIREWORKS_API_KEY" ]; then
        echo -e "${RED}ERROR: FIREWORKS_API_KEY environment variable not set${RESET}" >&2
        echo -e "${AMBER}Please set it with: export FIREWORKS_API_KEY='your-api-key'${RESET}" >&2
        echo -e "${BLUE}Get your API key from: https://fireworks.ai/api-keys${RESET}" >&2
        return 1
    fi
    return 0
}

# Test API connection
fireworks_test_connection() {
    echo -e "${BLUE}Testing Fireworks.ai API connection...${RESET}"

    if ! fireworks_check_api_key; then
        return 1
    fi

    local response
    response=$(curl -s -w "\n%{http_code}" \
        -X POST "${FIREWORKS_API_BASE}/chat/completions" \
        -H "Authorization: Bearer ${FIREWORKS_API_KEY}" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "'"${FIREWORKS_DEFAULT_MODEL}"'",
            "messages": [{"role": "user", "content": "Say hello"}],
            "max_tokens": 10
        }')

    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ API connection successful${RESET}"
        return 0
    else
        echo -e "${RED}✗ API connection failed (HTTP $http_code)${RESET}"
        echo -e "${AMBER}Response: $body${RESET}"
        return 1
    fi
}

# List available models
fireworks_list_models() {
    if ! fireworks_check_api_key; then
        return 1
    fi

    echo -e "${BLUE}Fetching available Fireworks.ai models...${RESET}"

    curl -s -X GET "${FIREWORKS_API_BASE}/models" \
        -H "Authorization: Bearer ${FIREWORKS_API_KEY}" \
        | jq -r '.data[] | "\(.id) - \(.owned_by)"' 2>/dev/null \
        || echo -e "${RED}Failed to fetch models. Is jq installed?${RESET}"
}

# Text generation (non-streaming)
fireworks_generate() {
    local prompt="$1"
    local model="${2:-$FIREWORKS_DEFAULT_MODEL}"
    local max_tokens="${3:-1024}"
    local temperature="${4:-0.7}"

    if ! fireworks_check_api_key; then
        return 1
    fi

    if [ -z "$prompt" ]; then
        echo -e "${RED}ERROR: Prompt required${RESET}" >&2
        echo -e "${AMBER}Usage: fireworks_generate \"your prompt\" [model] [max_tokens] [temperature]${RESET}" >&2
        return 1
    fi

    echo -e "${BLUE}Generating response with Fireworks.ai...${RESET}" >&2

    local response
    response=$(curl -s -X POST "${FIREWORKS_API_BASE}/chat/completions" \
        -H "Authorization: Bearer ${FIREWORKS_API_KEY}" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "'"${model}"'",
            "messages": [{"role": "user", "content": "'"$(echo "$prompt" | sed 's/"/\\"/g')"'"}],
            "max_tokens": '"${max_tokens}"',
            "temperature": '"${temperature}"'
        }')

    # Extract and display the response
    local content
    content=$(echo "$response" | jq -r '.choices[0].message.content' 2>/dev/null)

    if [ "$content" != "null" ] && [ -n "$content" ]; then
        echo -e "${GREEN}Response:${RESET}" >&2
        echo "$content"

        # Display usage stats
        local usage
        usage=$(echo "$response" | jq -r '.usage' 2>/dev/null)
        if [ "$usage" != "null" ]; then
            echo -e "\n${VIOLET}Usage: $(echo "$usage" | jq -c .)${RESET}" >&2
        fi
    else
        echo -e "${RED}Failed to get response${RESET}" >&2
        echo -e "${AMBER}Raw response: $response${RESET}" >&2
        return 1
    fi
}

# Streaming text generation
fireworks_generate_stream() {
    local prompt="$1"
    local model="${2:-$FIREWORKS_DEFAULT_MODEL}"
    local max_tokens="${3:-1024}"
    local temperature="${4:-0.7}"

    if ! fireworks_check_api_key; then
        return 1
    fi

    if [ -z "$prompt" ]; then
        echo -e "${RED}ERROR: Prompt required${RESET}" >&2
        echo -e "${AMBER}Usage: fireworks_generate_stream \"your prompt\" [model] [max_tokens] [temperature]${RESET}" >&2
        return 1
    fi

    echo -e "${BLUE}Streaming response from Fireworks.ai...${RESET}" >&2
    echo -e "${GREEN}Response:${RESET}" >&2

    curl -s -N -X POST "${FIREWORKS_API_BASE}/chat/completions" \
        -H "Authorization: Bearer ${FIREWORKS_API_KEY}" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "'"${model}"'",
            "messages": [{"role": "user", "content": "'"$(echo "$prompt" | sed 's/"/\\"/g')"'"}],
            "max_tokens": '"${max_tokens}"',
            "temperature": '"${temperature}"',
            "stream": true
        }' | while IFS= read -r line; do
            # Parse SSE format (data: {json})
            if [[ "$line" == data:* ]]; then
                local data="${line#data: }"
                if [ "$data" != "[DONE]" ]; then
                    # Extract delta content
                    local delta
                    delta=$(echo "$data" | jq -r '.choices[0].delta.content // empty' 2>/dev/null)
                    if [ -n "$delta" ] && [ "$delta" != "null" ]; then
                        printf "%s" "$delta"
                    fi
                fi
            fi
        done

    echo -e "\n${VIOLET}Stream complete${RESET}" >&2
}

# Multi-turn conversation
fireworks_chat() {
    local model="${1:-$FIREWORKS_DEFAULT_MODEL}"

    if ! fireworks_check_api_key; then
        return 1
    fi

    echo -e "${PINK}=== Fireworks.ai Chat ===${RESET}"
    echo -e "${AMBER}Model: $model${RESET}"
    echo -e "${BLUE}Type 'exit' or 'quit' to end conversation${RESET}"
    echo ""

    local messages='[]'

    while true; do
        echo -ne "${GREEN}You: ${RESET}"
        read -r user_input

        if [ "$user_input" = "exit" ] || [ "$user_input" = "quit" ]; then
            echo -e "${VIOLET}Goodbye!${RESET}"
            break
        fi

        if [ -z "$user_input" ]; then
            continue
        fi

        # Add user message to history
        messages=$(echo "$messages" | jq --arg content "$user_input" '. + [{"role": "user", "content": $content}]')

        # Get response
        echo -ne "${BLUE}Assistant: ${RESET}"

        local response
        response=$(curl -s -X POST "${FIREWORKS_API_BASE}/chat/completions" \
            -H "Authorization: Bearer ${FIREWORKS_API_KEY}" \
            -H "Content-Type: application/json" \
            -d '{
                "model": "'"${model}"'",
                "messages": '"${messages}"',
                "max_tokens": 1024,
                "temperature": 0.7
            }')

        local assistant_msg
        assistant_msg=$(echo "$response" | jq -r '.choices[0].message.content' 2>/dev/null)

        if [ "$assistant_msg" != "null" ] && [ -n "$assistant_msg" ]; then
            echo "$assistant_msg"
            echo ""

            # Add assistant message to history
            messages=$(echo "$messages" | jq --arg content "$assistant_msg" '. + [{"role": "assistant", "content": $content}]')
        else
            echo -e "${RED}Error getting response${RESET}"
            echo -e "${AMBER}$response${RESET}"
        fi
    done
}

# Batch processing from file
fireworks_batch() {
    local input_file="$1"
    local output_file="$2"
    local model="${3:-$FIREWORKS_DEFAULT_MODEL}"

    if ! fireworks_check_api_key; then
        return 1
    fi

    if [ ! -f "$input_file" ]; then
        echo -e "${RED}ERROR: Input file not found: $input_file${RESET}" >&2
        return 1
    fi

    echo -e "${BLUE}Processing batch from $input_file...${RESET}"

    > "$output_file"  # Clear output file

    local count=0
    while IFS= read -r prompt; do
        if [ -z "$prompt" ]; then
            continue
        fi

        count=$((count + 1))
        echo -e "${VIOLET}Processing prompt $count...${RESET}"

        echo "=== Prompt $count ===" >> "$output_file"
        echo "$prompt" >> "$output_file"
        echo "" >> "$output_file"
        echo "=== Response ===" >> "$output_file"

        fireworks_generate "$prompt" "$model" 512 0.7 2>/dev/null >> "$output_file"

        echo -e "\n---\n" >> "$output_file"
    done < "$input_file"

    echo -e "${GREEN}✓ Processed $count prompts, results saved to $output_file${RESET}"
}

# Function to display help
fireworks_help() {
    cat << 'EOF'
Fireworks.ai Integration Functions
====================================

Setup:
  export FIREWORKS_API_KEY='your-api-key'
  source ~/blackroad-ai-integrations/fireworks-ai.sh

Functions:
  fireworks_check_api_key              - Verify API key is set
  fireworks_test_connection            - Test API connectivity
  fireworks_list_models                - List available models

  fireworks_generate <prompt> [model] [max_tokens] [temperature]
    - Generate text (non-streaming)
    - Example: fireworks_generate "Explain quantum computing"

  fireworks_generate_stream <prompt> [model] [max_tokens] [temperature]
    - Generate text with streaming
    - Example: fireworks_generate_stream "Write a poem about AI"

  fireworks_chat [model]
    - Interactive chat session
    - Example: fireworks_chat

  fireworks_batch <input_file> <output_file> [model]
    - Process multiple prompts from file
    - Example: fireworks_batch prompts.txt results.txt

  fireworks_help                       - Show this help message

Popular Models:
  - accounts/fireworks/models/llama-v3p1-70b-instruct (default)
  - accounts/fireworks/models/llama-v3p1-8b-instruct
  - accounts/fireworks/models/mixtral-8x7b-instruct
  - accounts/fireworks/models/qwen2p5-72b-instruct

Environment Variables:
  FIREWORKS_API_KEY                    - Your Fireworks.ai API key (required)
  FIREWORKS_DEFAULT_MODEL              - Override default model

Examples:
  # Basic generation
  fireworks_generate "What is the capital of France?"

  # Streaming response
  fireworks_generate_stream "Write a short story"

  # Use specific model
  fireworks_generate "Explain AI" "accounts/fireworks/models/llama-v3p1-8b-instruct"

  # Interactive chat
  fireworks_chat

  # Batch processing
  echo -e "What is 2+2?\nWhat is the speed of light?" > prompts.txt
  fireworks_batch prompts.txt results.txt

Get API Key:
  https://fireworks.ai/api-keys

EOF
}

# Auto-display help if sourced directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    echo -e "${PINK}Fireworks.ai Integration${RESET}"
    echo -e "${AMBER}This script should be sourced, not executed directly${RESET}"
    echo -e "${BLUE}Usage: source ~/blackroad-ai-integrations/fireworks-ai.sh${RESET}"
    echo ""
    fireworks_help
else
    echo -e "${GREEN}✓ Fireworks.ai integration loaded${RESET}"
    echo -e "${BLUE}Run 'fireworks_help' for usage information${RESET}"
fi
