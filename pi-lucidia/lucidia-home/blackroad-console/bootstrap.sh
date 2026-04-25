#!/usr/bin/env bash
# BlackRoad Pi Bootstrap Script
# Usage: curl -fsSL https://raw.githubusercontent.com/BlackRoad-OS/blackroad-pi-ops/main/bootstrap.sh | bash
#
# This script transforms a fresh Raspberry Pi OS Lite installation into a standardized BlackRoad node

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Detect hostname to determine role
HOSTNAME=$(hostname)
ROLE="unknown"

case "$HOSTNAME" in
    lucidia)
        ROLE="origin"
        echo -e "${CYAN}Detected role: Origin Server (Lucidia)${NC}"
        ;;
    aria)
        ROLE="worker"
        echo -e "${CYAN}Detected role: Worker Node (Aria)${NC}"
        ;;
    alice)
        ROLE="worker"
        echo -e "${CYAN}Detected role: Worker Node (Alice)${NC}"
        ;;
    blackroad-pi)
        ROLE="worker"
        echo -e "${CYAN}Detected role: Worker Node (BlackRoad Pi)${NC}"
        ;;
    *)
        echo -e "${YELLOW}Warning: Unknown hostname '$HOSTNAME', using generic worker role${NC}"
        ROLE="worker"
        ;;
esac

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  BlackRoad Pi Bootstrap${NC}"
echo -e "${GREEN}  Node: $HOSTNAME${NC}"
echo -e "${GREEN}  Role: $ROLE${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

# Step 1: System Updates
echo -e "${CYAN}[1/8] Updating system packages...${NC}"
sudo apt-get update -qq
sudo apt-get upgrade -y -qq
sudo apt-get install -y -qq \
    curl \
    wget \
    git \
    vim \
    htop \
    tmux \
    jq \
    net-tools \
    ca-certificates \
    gnupg \
    lsb-release

# Step 2: Install Docker
echo -e "${CYAN}[2/8] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    sudo usermod -aG docker pi
    sudo systemctl enable docker
    sudo systemctl start docker
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Install Docker Compose (standalone binary)
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

# Step 3: Install Tailscale
echo -e "${CYAN}[3/8] Installing Tailscale...${NC}"
if ! command -v tailscale &> /dev/null; then
    curl -fsSL https://tailscale.com/install.sh | sh
    echo -e "${YELLOW}⚠  Run 'sudo tailscale up' to authenticate${NC}"
else
    echo -e "${GREEN}✓ Tailscale already installed${NC}"
fi

# Step 4: Install br-menu
echo -e "${CYAN}[4/8] Installing br-menu...${NC}"
sudo tee /usr/local/bin/br-menu > /dev/null <<'EOF'
#!/usr/bin/env bash
# BlackRoad Interactive Menu System

while true; do
    clear
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  BlackRoad Node Menu - $(hostname)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    echo "  1) System Status (br-status)"
    echo "  2) Docker Containers"
    echo "  3) Tailscale Status"
    echo "  4) System Resources (htop)"
    echo "  5) Logs (journalctl)"
    echo "  6) Tmux Sessions"
    echo "  7) Network Info"
    echo "  8) Update System"
    echo "  9) Reboot"
    echo "  0) Exit"
    echo
    read -p "Select option: " choice

    case $choice in
        1)
            br-status
            read -p "Press Enter to continue..."
            ;;
        2)
            docker ps -a
            echo
            docker compose ps 2>/dev/null || echo "No compose projects found"
            read -p "Press Enter to continue..."
            ;;
        3)
            tailscale status
            read -p "Press Enter to continue..."
            ;;
        4)
            htop
            ;;
        5)
            sudo journalctl -f
            ;;
        6)
            tmux ls 2>/dev/null || echo "No tmux sessions running"
            read -p "Press Enter to continue..."
            ;;
        7)
            ip addr show
            echo
            ip route show
            read -p "Press Enter to continue..."
            ;;
        8)
            sudo apt-get update && sudo apt-get upgrade -y
            read -p "Press Enter to continue..."
            ;;
        9)
            echo "Rebooting in 5 seconds... (Ctrl+C to cancel)"
            sleep 5
            sudo reboot
            ;;
        0)
            exit 0
            ;;
        *)
            echo "Invalid option"
            sleep 1
            ;;
    esac
done
EOF
sudo chmod +x /usr/local/bin/br-menu
echo -e "${GREEN}✓ br-menu installed${NC}"

# Step 5: Install br-status
echo -e "${CYAN}[5/8] Installing br-status...${NC}"
sudo tee /usr/local/bin/br-status > /dev/null <<'EOF'
#!/usr/bin/env bash
# BlackRoad System Status Display

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  BlackRoad Node Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "Hostname:    $(hostname)"
echo "Uptime:      $(uptime -p)"
echo "Load:        $(uptime | awk -F'load average:' '{print $2}')"
echo
echo "Memory:"
free -h | awk 'NR==2{printf "  Used: %s / %s (%.2f%%)\n", $3,$2,$3*100/$2}'
echo
echo "Disk:"
df -h / | awk 'NR==2{printf "  Used: %s / %s (%s)\n", $3,$2,$5}'
echo
echo "Temperature:"
if [ -f /sys/class/thermal/thermal_zone0/temp ]; then
    temp=$(cat /sys/class/thermal/thermal_zone0/temp)
    echo "  CPU: $((temp/1000))°C"
fi
echo
echo "Docker Containers:"
if command -v docker &> /dev/null; then
    docker ps --format "  {{.Names}}: {{.Status}}" 2>/dev/null || echo "  No containers running"
else
    echo "  Docker not installed"
fi
echo
echo "Tailscale:"
if command -v tailscale &> /dev/null; then
    tailscale status --peers=false 2>/dev/null | head -1 || echo "  Not connected"
else
    echo "  Not installed"
fi
echo
EOF
sudo chmod +x /usr/local/bin/br-status
echo -e "${GREEN}✓ br-status installed${NC}"

# Step 6: Install tmux integration tools
echo -e "${CYAN}[6/8] Installing tmux integration tools...${NC}"
sudo tee /usr/local/bin/br-send > /dev/null <<'EOF'
#!/usr/bin/env bash
# Send command to named tmux pane
# Usage: br-send <pane-name> "<command>"

if [[ $# -lt 2 ]]; then
  echo "Usage: br-send <pane-name> \"<command>\""
  echo "Example: br-send lucidia \"docker ps\""
  exit 1
fi

target="$1"
shift
cmd="$*"

pane="$(tmux list-panes -a -F '#{pane_id} #{pane_title}' 2>/dev/null | awk -v t="$target" '$2==t {print $1; exit}')"

if [[ -z "$pane" ]]; then
  echo "❌ Pane '$target' not found"
  echo "Available panes:"
  tmux list-panes -a -F '  #{pane_title}' 2>/dev/null || echo "  No tmux sessions running"
  exit 1
fi

tmux send-keys -t "$pane" "$cmd" C-m
echo "✅ Sent to $target ($pane): $cmd"
EOF
sudo chmod +x /usr/local/bin/br-send

sudo tee /usr/local/bin/br-capture-all > /dev/null <<'EOF'
#!/usr/bin/env bash
# Capture output from all agent tmux panes
# Usage: br-capture-all > context.txt

LINES="${1:-100}"

for agent in alice lucidia aria; do
  pane="$(tmux list-panes -a -F '#{pane_id} #{pane_title}' 2>/dev/null | awk -v t="$agent" '$2==t {print $1; exit}')"
  if [[ -n "${pane:-}" ]]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $agent (pane $pane)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tmux capture-pane -p -S -"$LINES" -t "$pane" 2>/dev/null || echo "(empty)"
    echo
  fi
done
EOF
sudo chmod +x /usr/local/bin/br-capture-all
echo -e "${GREEN}✓ tmux tools installed (br-send, br-capture-all)${NC}"

# Step 7: Custom MOTD
echo -e "${CYAN}[7/8] Setting up custom MOTD...${NC}"
sudo tee /etc/motd > /dev/null <<'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  BlackRoad OS Node
  Infrastructure as Code, Truth as Origin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Useful commands:
  br-menu        Interactive system menu
  br-status      Show system health
  br-send        Send command to tmux pane
  br-capture-all Capture all agent outputs

Documentation: https://github.com/BlackRoad-OS
Support: blackroad.systems@gmail.com
EOF
echo -e "${GREEN}✓ MOTD configured${NC}"

# Step 8: Role-specific setup
echo -e "${CYAN}[8/8] Configuring role-specific services...${NC}"

if [[ "$ROLE" == "origin" ]]; then
    # Lucidia-specific setup: origin server, console backend
    echo -e "${YELLOW}Setting up origin server configuration...${NC}"

    # Create directory for console deployment
    mkdir -p ~/blackroad-console

    # Create placeholder systemd service for console
    sudo tee /etc/systemd/system/blackroad-console.service > /dev/null <<'SERVICEEOF'
[Unit]
Description=BlackRoad Console (Docker Compose)
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/pi/blackroad-console
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=pi

[Install]
WantedBy=multi-user.target
SERVICEEOF

    # Don't enable yet (needs deployment first)
    echo -e "${GREEN}✓ Origin server configured${NC}"
    echo -e "${YELLOW}  Deploy console with: ./deploy-to-pi.sh${NC}"

else
    # Worker node setup
    echo -e "${YELLOW}Setting up worker node configuration...${NC}"
    echo -e "${GREEN}✓ Worker node configured${NC}"
fi

# Final summary
echo
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Bootstrap Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo
echo -e "${CYAN}Next steps:${NC}"
echo "  1. Logout and login again (for Docker group membership)"
echo "  2. Run: sudo tailscale up"
echo "  3. Run: br-menu (or br-status for quick check)"
echo
if [[ "$ROLE" == "origin" ]]; then
    echo -e "${YELLOW}Origin server (Lucidia):${NC}"
    echo "  • Deploy console: ./deploy-to-pi.sh"
    echo "  • Enable service: sudo systemctl enable blackroad-console"
    echo
fi
echo -e "${GREEN}Your BlackRoad node is ready! 🚀${NC}"
