#!/bin/bash
# Deploy CECE CLI and services to Cecilia
# Run from Mac: ./deploy-to-cecilia.sh

set -e

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

TARGET="cecilia"
REMOTE_HOME="/home/cecilia"

echo -e "${PINK}═══════════════════════════════════════════════════════${NC}"
echo -e "${PINK}      🌌 Deploying CECE to Cecilia                     ${NC}"
echo -e "${PINK}═══════════════════════════════════════════════════════${NC}"
echo ""

# Create directories on Cecilia
echo -e "${CYAN}Creating directories...${NC}"
ssh $TARGET "bash --norc -c 'mkdir -p ~/cece/{api,heart,data,memory,config}'"
ssh $TARGET "bash --norc -c 'mkdir -p ~/blackroad-os/bin'"

# Copy CECE CLI
echo -e "${CYAN}Deploying CECE CLI...${NC}"
scp cece $TARGET:~/blackroad-os/bin/cece
ssh $TARGET "bash --norc -c 'chmod +x ~/blackroad-os/bin/cece'"
ssh $TARGET "bash --norc -c 'sudo ln -sf ~/blackroad-os/bin/cece /usr/local/bin/cece 2>/dev/null || true'"

# Copy API server
echo -e "${CYAN}Deploying API server...${NC}"
scp api/server.js $TARGET:~/cece/api/server.js

# Copy heartbeat
echo -e "${CYAN}Deploying heartbeat service...${NC}"
scp heart/heartbeat.sh $TARGET:~/cece/heart/heartbeat.sh
ssh $TARGET "bash --norc -c 'chmod +x ~/cece/heart/heartbeat.sh'"

# Copy and install systemd services
echo -e "${CYAN}Installing systemd services...${NC}"
for svc in services/*.service; do
    if [ -f "$svc" ]; then
        name=$(basename "$svc")
        echo "  Installing $name..."
        scp "$svc" $TARGET:/tmp/$name
        ssh $TARGET "bash --norc -c 'sudo mv /tmp/$name /etc/systemd/system/$name && sudo systemctl daemon-reload'"
    fi
done

# Enable and start services
echo -e "${CYAN}Enabling services...${NC}"
ssh $TARGET "bash --norc -c 'sudo systemctl enable cece-heartbeat 2>/dev/null || true'"
ssh $TARGET "bash --norc -c 'sudo systemctl enable cece-api 2>/dev/null || true'"
ssh $TARGET "bash --norc -c 'sudo systemctl restart cece-heartbeat 2>/dev/null || true'"
ssh $TARGET "bash --norc -c 'sudo systemctl restart cece-api 2>/dev/null || true'"

# Test CECE CLI
echo ""
echo -e "${CYAN}Testing CECE CLI...${NC}"
ssh $TARGET "bash --norc -c 'export PATH=~/blackroad-os/bin:\$PATH && cece whoami'" | tail -30

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}      ✅ CECE deployed successfully!                   ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Commands:"
echo "  ssh cecilia 'cece help'        # Show all commands"
echo "  ssh cecilia 'cece status'      # System status"
echo "  ssh cecilia 'cece whoami'      # CECE identity"
echo "  curl cecilia:3000/status       # API health"
