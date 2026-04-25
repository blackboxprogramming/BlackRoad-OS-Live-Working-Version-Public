# BlackRoad AI Integrations

Collection of AI provider integration scripts for BlackRoad OS.

## Available Integrations

### AutoGPT (`autogpt-config.sh`)

Autonomous AI agent configuration with BlackRoad-specific plugins for memory, blackroad os, and multi-agent coordination.

**Setup:**
```bash
# Initialize AutoGPT workspace
~/blackroad-ai-integrations/autogpt-config.sh init

# Configure API keys
nano ~/.blackroad/autogpt/.env

# Launch AutoGPT
~/blackroad-ai-integrations/autogpt-config.sh launch
```

**Features:**
- ✅ Memory System integration (PS-SHA-infinity journals)
- ✅ BlackRoad OS search (225k+ components)
- ✅ Multi-agent coordination
- ✅ Traffic light management
- ✅ Task marketplace integration
- ✅ BlackRoad brand compliance

**BlackRoad Plugins:**
- `blackroad_memory.py`: Log actions and check coordination conflicts
- `blackroad_blackroad os.py`: Search existing components before creating new ones
- `blackroad_coordination.py`: Announce work, update traffic lights, claim tasks

**Quick Start:**
```bash
# Show help
~/blackroad-ai-integrations/autogpt-config.sh help

# Check status
~/blackroad-ai-integrations/autogpt-config.sh status

# Clean workspace
~/blackroad-ai-integrations/autogpt-config.sh clean
```

### Fireworks.ai (`fireworks-ai.sh`)

High-performance inference platform with support for Llama, Mixtral, and Qwen models.

**Setup:**
```bash
export FIREWORKS_API_KEY='your-api-key'
source ~/blackroad-ai-integrations/fireworks-ai.sh
```

**Features:**
- ✅ Text generation (streaming and non-streaming)
- ✅ Multi-turn chat conversations
- ✅ Batch processing from files
- ✅ Model selection and parameter tuning
- ✅ Usage statistics tracking

**Quick Start:**
```bash
# Test connection
fireworks_test_connection

# Generate text
fireworks_generate "Explain machine learning"

# Stream response
fireworks_generate_stream "Write a poem about AI"

# Interactive chat
fireworks_chat

# See all options
fireworks_help
```

**Examples:**
```bash
# Run comprehensive examples
~/blackroad-ai-integrations/fireworks-ai-examples.sh
```

## Getting API Keys

- **AutoGPT**: Requires OpenAI API key (https://platform.openai.com/api-keys)
- **Fireworks.ai**: https://fireworks.ai/api-keys

## Directory Structure

```
~/blackroad-ai-integrations/
├── README.md                    # This file
├── autogpt-config.sh           # AutoGPT configuration
├── fireworks-ai.sh             # Fireworks.ai integration
└── fireworks-ai-examples.sh    # Usage examples
```

## Usage Patterns

### Sourcing Integrations

```bash
# In your scripts
source ~/blackroad-ai-integrations/fireworks-ai.sh

# Use the functions
fireworks_generate "Your prompt here"
```

### Environment Variables

```bash
# Add to ~/.zshrc or ~/.bashrc for persistence
export FIREWORKS_API_KEY='your-key-here'
```

### Batch Processing

```bash
# Create input file with one prompt per line
cat > prompts.txt << 'EOF'
What is quantum computing?
Explain neural networks
How does GPS work?
EOF

# Process all prompts
fireworks_batch prompts.txt results.txt
```

## Integration Guidelines

When adding new AI provider integrations:

1. **Naming**: Use pattern `provider-name.sh`
2. **Functions**: Prefix with provider name (e.g., `fireworks_generate`)
3. **Colors**: Use BlackRoad brand colors (PINK, AMBER, BLUE, VIOLET)
4. **Error Handling**: Check API keys, validate inputs, handle errors gracefully
5. **Documentation**: Include help function and usage examples
6. **Streaming**: Support streaming responses where available
7. **Examples**: Create companion `provider-name-examples.sh` script

## BlackRoad Brand Colors

```bash
PINK='\033[38;5;205m'      # #FF1D6C - Primary brand accent
AMBER='\033[38;5;214m'     # #F5A623
BLUE='\033[38;5;69m'       # #2979FF
VIOLET='\033[38;5;135m'    # #9C27B0
GREEN='\033[38;5;82m'      # Success messages
RED='\033[38;5;196m'       # Error messages
RESET='\033[0m'
```

## Contributing

To add a new integration:

```bash
# Create integration script
touch ~/blackroad-ai-integrations/provider-name.sh
chmod +x ~/blackroad-ai-integrations/provider-name.sh

# Create examples
touch ~/blackroad-ai-integrations/provider-name-examples.sh
chmod +x ~/blackroad-ai-integrations/provider-name-examples.sh

# Update this README
```

## Memory Integration

Log integration milestones to BlackRoad memory:

```bash
~/memory-system.sh log "created" "fireworks-integration" \
  "Fireworks.ai integration with streaming support" \
  "ai,integration,fireworks"
```

---

**Part of BlackRoad OS** - Sovereign AI Infrastructure
