#!/bin/bash
# BlackRoad Pi Agent Installer
# One-line install: curl -sSL https://raw.githubusercontent.com/BlackRoad-OS/blackroad-pi-ops/main/install-pi-agent.sh | bash
#
# Environment variables:
#   BLACKROAD_OPERATOR_URL - WebSocket URL of the operator (required for production)
#   BLACKROAD_AGENT_ID     - Override auto-generated agent ID
#   BLACKROAD_BRANCH       - Git branch to install from (default: main)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
INSTALL_DIR="/opt/blackroad/pi-agent"
CONFIG_DIR="/etc/blackroad"
LOG_DIR="/var/log/blackroad"
REPO_URL="https://github.com/BlackRoad-OS/blackroad-pi-ops.git"
BRANCH="${BLACKROAD_BRANCH:-main}"
SERVICE_NAME="blackroad-agent"

# Logging functions
log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Banner
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}     ${GREEN}BlackRoad Pi Agent Installer${NC}                            ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}     Edge Device Runtime for BlackRoad OS                     ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root (use sudo)"
    exit 1
fi

# Detect platform
detect_platform() {
    if [[ -f /proc/cpuinfo ]] && grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
        PLATFORM="raspberry-pi"
    elif [[ -f /etc/nv_tegra_release ]]; then
        PLATFORM="jetson"
    elif [[ "$(uname -s)" == "Linux" ]]; then
        PLATFORM="linux"
    else
        PLATFORM="unknown"
    fi
    log_info "Detected platform: $PLATFORM"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Python version
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is required but not installed"
        exit 1
    fi

    PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
    log_info "Python version: $PYTHON_VERSION"

    # Ensure Python 3.8+
    MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
    MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)
    if [[ $MAJOR -lt 3 ]] || [[ $MAJOR -eq 3 && $MINOR -lt 8 ]]; then
        log_error "Python 3.8+ is required (found $PYTHON_VERSION)"
        exit 1
    fi

    # Check for git
    if ! command -v git &> /dev/null; then
        log_warn "Git not found, installing..."
        apt-get update && apt-get install -y git
    fi

    # Check for pip
    if ! python3 -m pip --version &> /dev/null; then
        log_warn "pip not found, installing..."
        apt-get update && apt-get install -y python3-pip python3-venv
    fi

    log_success "Prerequisites satisfied"
}

# Install system dependencies
install_dependencies() {
    log_info "Installing system dependencies..."

    apt-get update
    apt-get install -y \
        python3-venv \
        python3-dev \
        build-essential \
        libffi-dev \
        libssl-dev

    log_success "System dependencies installed"
}

# Create directories
setup_directories() {
    log_info "Creating directories..."

    mkdir -p "$INSTALL_DIR"
    mkdir -p "$CONFIG_DIR"
    mkdir -p "$LOG_DIR"

    # Set permissions - CONFIG_DIR needs 755 so pi user can read config
    chown -R pi:pi "$INSTALL_DIR" 2>/dev/null || true
    chown -R pi:pi "$LOG_DIR" 2>/dev/null || true
    chmod 755 "$CONFIG_DIR"

    log_success "Directories created"
}

# Clone or update repository
clone_repository() {
    log_info "Fetching BlackRoad Pi Agent..."

    if [[ -d "$INSTALL_DIR/.git" ]]; then
        log_info "Updating existing installation..."
        cd "$INSTALL_DIR"
        git fetch origin
        git checkout "$BRANCH"
        git pull origin "$BRANCH"
    else
        log_info "Cloning repository..."
        rm -rf "$INSTALL_DIR"
        git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$INSTALL_DIR"
    fi

    log_success "Repository ready"
}

# Setup Python virtual environment
setup_venv() {
    log_info "Setting up Python virtual environment..."

    cd "$INSTALL_DIR"

    # Create venv
    python3 -m venv venv

    # Upgrade pip
    venv/bin/pip install --upgrade pip wheel setuptools

    # Install dependencies
    if [[ -f requirements-agent.txt ]]; then
        venv/bin/pip install -r requirements-agent.txt
    else
        # Install minimal dependencies
        venv/bin/pip install websockets psutil
    fi

    log_success "Virtual environment ready"
}

# Generate configuration
generate_config() {
    log_info "Generating configuration..."

    CONFIG_FILE="$CONFIG_DIR/pi-agent.config.json"

    if [[ -f "$CONFIG_FILE" ]]; then
        log_warn "Config file already exists, backing up..."
        cp "$CONFIG_FILE" "$CONFIG_FILE.bak.$(date +%s)"
    fi

    # Detect hostname
    HOSTNAME=$(hostname)

    # Generate agent ID from hardware
    if [[ -f /proc/cpuinfo ]]; then
        SERIAL=$(grep -Po '(?<=Serial\s:\s)[0-9a-f]+' /proc/cpuinfo 2>/dev/null || echo "")
        if [[ -n "$SERIAL" ]]; then
            AUTO_AGENT_ID="pi-${SERIAL: -8}"
        fi
    fi

    if [[ -z "$AUTO_AGENT_ID" ]]; then
        AUTO_AGENT_ID="agent-$(cat /etc/machine-id | head -c 8)"
    fi

    AGENT_ID="${BLACKROAD_AGENT_ID:-$AUTO_AGENT_ID}"
    OPERATOR_URL="${BLACKROAD_OPERATOR_URL:-ws://operator.blackroad.local:8080/ws/agent}"

    # Write config
    cat > "$CONFIG_FILE" << EOF
{
  "operator": {
    "url": "$OPERATOR_URL",
    "reconnect_interval": 5.0,
    "reconnect_max_attempts": 0,
    "ping_interval": 30.0,
    "ping_timeout": 10.0
  },
  "agent": {
    "agent_id": "$AGENT_ID",
    "agent_type": "pi-node",
    "capabilities": ["shell", "telemetry", "file_read", "file_write", "service"],
    "hostname": "$HOSTNAME",
    "tags": {
      "platform": "$PLATFORM",
      "location": "TODO",
      "role": "edge"
    }
  },
  "telemetry": {
    "heartbeat_interval": 15.0,
    "metrics_interval": 60.0,
    "report_system_metrics": true
  },
  "executor": {
    "max_concurrent_tasks": 4,
    "task_timeout": 300.0,
    "allowed_commands": [],
    "blocked_commands": ["rm -rf /", "mkfs", "dd if=", "shutdown", "reboot"]
  },
  "logging": {
    "level": "INFO",
    "file": "$LOG_DIR/blackroad-agent.log",
    "format": "[%(asctime)s] %(levelname)s %(name)s: %(message)s"
  }
}
EOF

    chmod 644 "$CONFIG_FILE"
    chown root:pi "$CONFIG_FILE"
    log_success "Configuration generated: $CONFIG_FILE"
    log_info "Agent ID: $AGENT_ID"
}

# Install systemd service
install_service() {
    log_info "Installing systemd service..."

    SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

    cp "$INSTALL_DIR/blackroad-agent.service" "$SERVICE_FILE"

    # Reload systemd
    systemctl daemon-reload

    # Enable service
    systemctl enable "$SERVICE_NAME"

    log_success "Systemd service installed"
}

# Start the agent
start_agent() {
    log_info "Starting BlackRoad Pi Agent..."

    systemctl start "$SERVICE_NAME"
    sleep 2

    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_success "Agent started successfully!"
    else
        log_error "Failed to start agent. Check: journalctl -u $SERVICE_NAME"
        exit 1
    fi
}

# Print summary
print_summary() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}     ${CYAN}Installation Complete!${NC}                                   ${GREEN}║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${CYAN}Install directory:${NC}  $INSTALL_DIR"
    echo -e "  ${CYAN}Config file:${NC}        $CONFIG_DIR/pi-agent.config.json"
    echo -e "  ${CYAN}Log file:${NC}           $LOG_DIR/blackroad-agent.log"
    echo -e "  ${CYAN}Service name:${NC}       $SERVICE_NAME"
    echo ""
    echo -e "  ${YELLOW}Useful commands:${NC}"
    echo -e "    Check status:   ${CYAN}sudo systemctl status $SERVICE_NAME${NC}"
    echo -e "    View logs:      ${CYAN}sudo journalctl -u $SERVICE_NAME -f${NC}"
    echo -e "    Restart:        ${CYAN}sudo systemctl restart $SERVICE_NAME${NC}"
    echo -e "    Stop:           ${CYAN}sudo systemctl stop $SERVICE_NAME${NC}"
    echo ""
    echo -e "  ${YELLOW}Next steps:${NC}"
    echo -e "    1. Edit config: ${CYAN}sudo nano $CONFIG_DIR/pi-agent.config.json${NC}"
    echo -e "    2. Set operator URL to your BlackRoad OS operator"
    echo -e "    3. Restart:     ${CYAN}sudo systemctl restart $SERVICE_NAME${NC}"
    echo ""
}

# Main installation flow
main() {
    detect_platform
    check_prerequisites
    install_dependencies
    setup_directories
    clone_repository
    setup_venv
    generate_config
    install_service
    start_agent
    print_summary
}

# Run main
main "$@"
