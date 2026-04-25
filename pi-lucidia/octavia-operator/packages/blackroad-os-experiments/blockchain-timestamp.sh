#!/bin/bash
#
# BLACKROAD OS BLOCKCHAIN TIMESTAMPING SCRIPT
# Generates cryptographic hashes and prepares blockchain transactions
# for Bitcoin, Litecoin, and RoadChain
#
# © 2026 BlackRoad OS, Inc. All Rights Reserved.
#

set -e

echo "=============================================================================="
echo "🔒 BLACKROAD OS INTELLECTUAL PROPERTY PROTECTION"
echo "=============================================================================="
echo ""
echo "Company: BlackRoad OS, Inc."
echo "Date: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "Method: Blockchain Timestamping (Bitcoin, Litecoin, RoadChain)"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Output file
OUTPUT_FILE="BLOCKCHAIN_HASHES.txt"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

echo "📝 Generating cryptographic hashes..."
echo ""

# Create output file with header
cat > "$OUTPUT_FILE" << EOF
==============================================================================
BLACKROAD OS BLOCKCHAIN TIMESTAMP MANIFEST
==============================================================================

Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')
Purpose: Intellectual Property Protection via Blockchain
Blockchains: Bitcoin, Litecoin, RoadChain

© 2026 BlackRoad OS, Inc. All Rights Reserved.
PROPRIETARY AND CONFIDENTIAL

==============================================================================

EOF

# Function to hash a file
hash_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo -n "  Hashing: $file ... "
        sha256=$(sha256sum "$file" | awk '{print $1}')
        echo -e "${GREEN}✓${NC}"
        echo "$file|$sha256" >> "$OUTPUT_FILE"
    fi
}

# Function to hash directory contents
hash_directory() {
    local dir=$1
    local pattern=$2

    echo -e "\n${CYAN}📁 $dir/${NC}"
    echo "" >> "$OUTPUT_FILE"
    echo "Directory: $dir/" >> "$OUTPUT_FILE"
    echo "----------------------------------------" >> "$OUTPUT_FILE"

    find "$dir" -name "$pattern" -type f 2>/dev/null | sort | while read -r file; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            sha256=$(sha256sum "$file" | awk '{print $1}')
            echo "  ${filename}: ${sha256}"
            echo "  $filename: $sha256" >> "$OUTPUT_FILE"
        fi
    done
}

# Hash all code directories
echo -e "${BLUE}🔐 HASHING ALL BLACKROAD OS CODE...${NC}\n"

# Quantum Computing
if [ -d "quantum-computing" ]; then
    hash_directory "quantum-computing" "*.py"
fi

# Quantum Photonics
if [ -d "quantum-photonics" ]; then
    hash_directory "quantum-photonics" "*.py"
fi

# Security
if [ -d "security" ]; then
    hash_directory "security" "*.py"
fi

# Supercomputing
if [ -d "supercomputing" ]; then
    hash_directory "supercomputing" "*.py"
fi

# Language Processing
if [ -d "language-processing" ]; then
    hash_directory "language-processing" "*.py"
fi

# AI Accelerator
if [ -d "ai-accelerator" ]; then
    hash_directory "ai-accelerator" "*.py"
fi

# Mathematics
if [ -d "mathematics" ]; then
    hash_directory "mathematics" "*.py"
fi

# Cluster Computing
if [ -d "cluster-computing" ]; then
    hash_directory "cluster-computing" "*.py"
fi

# Benchmarks
if [ -d "benchmarks" ]; then
    hash_directory "benchmarks" "*.py"
fi

# Documentation
echo -e "\n${CYAN}📚 DOCUMENTATION${NC}"
echo "" >> "$OUTPUT_FILE"
echo "Documentation Files:" >> "$OUTPUT_FILE"
echo "----------------------------------------" >> "$OUTPUT_FILE"

find . -maxdepth 1 -name "*.md" -type f | sort | while read -r file; do
    filename=$(basename "$file")
    sha256=$(sha256sum "$file" | awk '{print $1}')
    echo "  ${filename}: ${sha256}"
    echo "  $filename: $sha256" >> "$OUTPUT_FILE"
done

# Generate master repository hash
echo ""
echo -e "${MAGENTA}🎯 GENERATING MASTER REPOSITORY HASH...${NC}"
echo ""

# Create a combined hash of all files
MASTER_HASH=$(find . -type f \( -name "*.py" -o -name "*.md" \) -exec sha256sum {} \; | sort | sha256sum | awk '{print $1}')

echo -e "${GREEN}Master SHA-256: ${MASTER_HASH}${NC}"

# Also generate SHA-512 for Litecoin
MASTER_HASH_512=$(find . -type f \( -name "*.py" -o -name "*.md" \) -exec sha512sum {} \; | sort | sha512sum | awk '{print $1}')

echo -e "${GREEN}Master SHA-512: ${MASTER_HASH_512}${NC}"

# Add to output file
cat >> "$OUTPUT_FILE" << EOF

==============================================================================
MASTER REPOSITORY HASHES
==============================================================================

Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "N/A")
Git Branch: $(git branch --show-current 2>/dev/null || echo "N/A")

Master SHA-256: $MASTER_HASH
Master SHA-512: $MASTER_HASH_512

Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')

==============================================================================

EOF

# Blockchain transaction preparation
echo ""
echo "=============================================================================="
echo -e "${BLUE}⛓️  BLOCKCHAIN TRANSACTION PREPARATION${NC}"
echo "=============================================================================="
echo ""

# Bitcoin
echo -e "${YELLOW}[BITCOIN]${NC}"
echo "  Network: Bitcoin Mainnet"
echo "  Address: 1Ak2fc5N2q4imYxqVMqBNEQDFq8J2Zs9TZ"
echo "  OP_RETURN: $(echo $MASTER_HASH | cut -c1-80)"
echo "  Estimated Fee: ~0.00001 BTC"
echo ""

# Litecoin
echo -e "${YELLOW}[LITECOIN]${NC}"
echo "  Network: Litecoin Mainnet"
echo "  OP_RETURN: $(echo $MASTER_HASH_512 | cut -c1-80)"
echo "  Estimated Fee: ~0.001 LTC"
echo ""

# RoadChain
echo -e "${YELLOW}[ROADCHAIN]${NC}"
echo "  Network: RoadChain Mainnet"
echo "  Full Manifest: BLACKROAD_IP_PROTECTION.md"
echo "  Hash: $MASTER_HASH"
echo ""

# Save blockchain data
cat >> "$OUTPUT_FILE" << EOF
==============================================================================
BLOCKCHAIN TRANSACTION DATA
==============================================================================

BITCOIN:
  Hash (SHA-256): $MASTER_HASH
  OP_RETURN Data: BLACKROAD-OS-$(date +%Y)-$MASTER_HASH
  From Address: 1Ak2fc5N2q4imYxqVMqBNEQDFq8J2Zs9TZ
  Transaction ID: [PENDING]
  Block Height: [PENDING]
  Explorer: https://blockchair.com/bitcoin/transaction/[TXID]

LITECOIN:
  Hash (SHA-512): $MASTER_HASH_512
  OP_RETURN Data: BLACKROAD-IP-$(date +%Y)-$MASTER_HASH_512
  Transaction ID: [PENDING]
  Block Height: [PENDING]
  Explorer: https://blockchair.com/litecoin/transaction/[TXID]

ROADCHAIN:
  Hash (SHA-256): $MASTER_HASH
  Metadata: Full IP Protection Manifest
  Transaction ID: [PENDING]
  Block Height: [PENDING]
  Explorer: [RoadChain Explorer URL]

==============================================================================

EOF

# Generate OP_RETURN hex data
echo "🔧 Generating OP_RETURN transaction data..."
echo ""

# Bitcoin OP_RETURN (80 bytes max)
BTC_OPRETURN="BLACKROAD-OS-2026-${MASTER_HASH:0:40}"
BTC_HEX=$(echo -n "$BTC_OPRETURN" | xxd -p | tr -d '\n')

echo "Bitcoin OP_RETURN (hex): $BTC_HEX"
echo ""

# Litecoin OP_RETURN (80 bytes max)
LTC_OPRETURN="BLACKROAD-IP-2026-${MASTER_HASH:0:40}"
LTC_HEX=$(echo -n "$LTC_OPRETURN" | xxd -p | tr -d '\n')

echo "Litecoin OP_RETURN (hex): $LTC_HEX"
echo ""

# Add to output file
cat >> "$OUTPUT_FILE" << EOF
TRANSACTION HEX DATA:
  Bitcoin OP_RETURN:  $BTC_HEX
  Litecoin OP_RETURN: $LTC_HEX

==============================================================================
VERIFICATION INSTRUCTIONS
==============================================================================

To verify this timestamp in the future:

1. Clone repository:
   git clone https://github.com/BlackRoad-OS/blackroad-os-experiments
   cd blackroad-os-experiments
   git checkout $(git rev-parse HEAD 2>/dev/null || echo "[COMMIT]")

2. Regenerate hash:
   find . -type f \( -name "*.py" -o -name "*.md" \) -exec sha256sum {} \; | sort | sha256sum

3. Compare with blockchain:
   curl https://blockchair.com/bitcoin/transaction/[TXID]
   # Verify OP_RETURN contains: $MASTER_HASH

4. Verify timestamp:
   # Block timestamp proves creation date
   # Hash proves exact content at that date

==============================================================================

© 2026 BlackRoad OS, Inc. All Rights Reserved.
Blockchain timestamp provides immutable proof of creation and ownership.

Contact: blackroad.systems@gmail.com

==============================================================================
EOF

echo "=============================================================================="
echo -e "${GREEN}✅ HASH GENERATION COMPLETE!${NC}"
echo "=============================================================================="
echo ""
echo "📄 Output saved to: $OUTPUT_FILE"
echo ""
echo "🔐 Master Hashes:"
echo "  SHA-256: $MASTER_HASH"
echo "  SHA-512: $MASTER_HASH_512"
echo ""
echo "⛓️  Ready for blockchain timestamp!"
echo ""
echo "Next steps:"
echo "  1. Review $OUTPUT_FILE"
echo "  2. Create Bitcoin transaction with OP_RETURN: $BTC_OPRETURN"
echo "  3. Create Litecoin transaction with OP_RETURN: $LTC_OPRETURN"
echo "  4. Create RoadChain transaction with full manifest"
echo "  5. Update BLACKROAD_IP_PROTECTION.md with transaction IDs"
echo ""
echo "=============================================================================="
echo -e "${MAGENTA}🔒 BLACKROAD OS - PROTECTED VIA BLOCKCHAIN${NC}"
echo "=============================================================================="
echo ""
