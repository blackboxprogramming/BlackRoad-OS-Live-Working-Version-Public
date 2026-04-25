#!/bin/bash
# Fireworks.ai Integration Examples
# Demonstrates various use cases for the Fireworks.ai integration

# Source the integration script
source ~/blackroad-ai-integrations/fireworks-ai.sh

echo "=== Fireworks.ai Integration Examples ==="
echo ""

# Example 1: Test connection
echo "Example 1: Testing API connection"
echo "-----------------------------------"
fireworks_test_connection
echo ""

# Example 2: List available models
echo "Example 2: Listing available models"
echo "------------------------------------"
fireworks_list_models | head -10
echo "... (showing first 10 models)"
echo ""

# Example 3: Simple text generation
echo "Example 3: Simple text generation"
echo "----------------------------------"
fireworks_generate "What are the three laws of robotics?"
echo ""

# Example 4: Streaming response
echo "Example 4: Streaming text generation"
echo "-------------------------------------"
fireworks_generate_stream "Write a haiku about artificial intelligence"
echo ""

# Example 5: Custom parameters
echo "Example 5: Custom model and parameters"
echo "---------------------------------------"
fireworks_generate \
    "Explain quantum entanglement in one sentence" \
    "accounts/fireworks/models/llama-v3p1-70b-instruct" \
    100 \
    0.3
echo ""

# Example 6: Batch processing
echo "Example 6: Batch processing multiple prompts"
echo "---------------------------------------------"
cat > /tmp/fireworks-batch-test.txt << 'EOF'
What is the meaning of life?
Calculate 15 * 23
Name three programming languages
EOF

fireworks_batch \
    /tmp/fireworks-batch-test.txt \
    /tmp/fireworks-batch-output.txt

echo "Results saved to /tmp/fireworks-batch-output.txt"
echo ""

# Example 7: Code generation
echo "Example 7: Code generation"
echo "--------------------------"
fireworks_generate "Write a Python function to calculate fibonacci numbers"
echo ""

# Example 8: Creative writing
echo "Example 8: Creative writing with higher temperature"
echo "----------------------------------------------------"
fireworks_generate \
    "Write a creative tagline for a quantum computing startup" \
    "accounts/fireworks/models/llama-v3p1-70b-instruct" \
    50 \
    0.9
echo ""

echo "=== Examples Complete ==="
echo ""
echo "To start an interactive chat session, run:"
echo "  fireworks_chat"
echo ""
echo "For more information, run:"
echo "  fireworks_help"
