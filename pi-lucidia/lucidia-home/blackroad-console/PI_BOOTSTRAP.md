# BlackRoad Pi Bootstrap System

**One-command setup for standardized BlackRoad nodes**

This bootstrap system transforms a fresh Raspberry Pi OS Lite installation into a fully configured BlackRoad node with all standard tools, services, and configurations.

## Quick Start

### Option 1: Remote Bootstrap (Recommended)

After flashing a fresh Pi with Raspberry Pi OS Lite:

```bash
ssh pi@<pi-ip-address>
curl -fsSL https://raw.githubusercontent.com/BlackRoad-OS/blackroad-pi-ops/main/bootstrap.sh | bash
```

### Option 2: Local Bootstrap

Copy `bootstrap.sh` to your Pi and run:

```bash
scp bootstrap.sh pi@<pi-ip-address>:~/
ssh pi@<pi-ip-address>
bash ~/bootstrap.sh
```

## What Gets Installed

The bootstrap script installs:

### Core Infrastructure
- **Docker** + Docker Compose - Container orchestration
- **Tailscale** - Mesh VPN networking
- **System utilities** - curl, wget, git, vim, htop, tmux, jq, net-tools

### BlackRoad Tools
- **br-menu** - Interactive system management menu
- **br-status** - System health display
- **br-send** - Send commands to named tmux panes
- **br-capture-all** - Capture all agent tmux outputs
- **Custom MOTD** - Welcome banner with quick commands

### Role-Specific Configuration
Based on hostname detection:
- **lucidia** → Origin server (console backend)
- **aria** → Worker node (AI agent)
- **alice** → Worker node (AI agent)
- **blackroad-pi** → Worker node (general purpose)

## Commands Reference

### br-menu
Interactive menu system for common tasks:

```bash
br-menu
```

Provides access to:
1. System Status (br-status)
2. Docker Containers
3. Tailscale Status
4. System Resources (htop)
5. Logs (journalctl)
6. Tmux Sessions
7. Network Info
8. Update System
9. Reboot

### br-status
Quick system health check:

```bash
br-status
```

Displays:
- Hostname and uptime
- Load averages
- Memory usage
- Disk usage
- CPU temperature
- Docker containers
- Tailscale status

### br-send
Send commands to named tmux panes:

```bash
# Send command to specific agent pane
br-send lucidia "docker ps"
br-send alice "uptime"
br-send aria "nvidia-smi"

# Start a long-running process
br-send lucidia "cd ~/blackroad-console && docker compose logs -f"
```

**Prerequisites:**
- Tmux session must be running
- Pane must be named (using `tmux select-pane -T <name>`)

### br-capture-all
Capture outputs from all agent panes:

```bash
# Capture last 100 lines from each agent
br-capture-all > context.txt

# Capture last 500 lines
br-capture-all 500 > full-context.txt

# Send to Claude
cat context.txt | pbcopy  # Mac
```

## Pre-Imaging Setup with Raspberry Pi Imager

For the cleanest deployment, use **Raspberry Pi Imager** to configure Pi settings before first boot:

### 1. Download Raspberry Pi Imager
- macOS: https://downloads.raspberrypi.org/imager/imager_latest.dmg
- Or: `brew install --cask raspberry-pi-imager`

### 2. Configure OS Settings

**Choose OS:**
- Raspberry Pi OS Lite (64-bit) - **Recommended**
- No desktop environment needed for headless nodes

**Advanced Settings (⚙️ gear icon):**

```
Hostname: lucidia (or aria, alice, blackroad-pi)
Enable SSH: ✓ Use password authentication
Username: pi
Password: <your-password>

Configure wireless LAN: ✓ (if using Wi-Fi)
  SSID: <your-wifi>
  Password: <wifi-password>
  Country: US

Locale Settings:
  Time zone: America/Chicago (or your timezone)
  Keyboard layout: us
```

**SSH Public Key (Recommended):**
Add your Mac's SSH public key for passwordless login:

```bash
# On your Mac, get your public key:
cat ~/.ssh/id_rsa.pub

# Paste into Raspberry Pi Imager "Set authorized_keys for 'pi'"
```

### 3. Flash SD Card
- Insert SD card
- Click "WRITE"
- Wait for verification

### 4. First Boot
- Insert SD card into Pi
- Power on
- Wait ~30 seconds for boot
- SSH in: `ssh pi@<hostname>.local` or `ssh pi@<ip-address>`

### 5. Run Bootstrap
```bash
curl -fsSL https://raw.githubusercontent.com/BlackRoad-OS/blackroad-pi-ops/main/bootstrap.sh | bash
```

## Tmux Pane Naming (for br-send)

To enable `br-send` and `br-capture-all`, name your tmux panes:

```bash
# Start tmux session
tmux new -s blackroad

# Create split panes (example: 3 panes for 3 agents)
tmux split-window -h
tmux split-window -v

# Name each pane
tmux select-pane -t 0 -T lucidia
tmux select-pane -t 1 -T alice
tmux select-pane -t 2 -T aria

# Verify names
tmux list-panes -a -F '#{pane_id} #{pane_title}'
```

**Persistent Setup:**
Add to `~/.tmux.conf`:

```bash
# Show pane titles in status bar
set -g pane-border-status top
set -g pane-border-format "#{pane_index} #{pane_title}"
```

## Role-Specific Configurations

### Lucidia (Origin Server)

After bootstrap, deploy console:

```bash
# On your Mac:
cd ~/blackroad-console-deploy
./deploy-to-pi.sh

# On Lucidia:
sudo systemctl enable blackroad-console
sudo systemctl start blackroad-console
```

**Services:**
- Docker Compose stack (Caddy, Nginx, Backend API)
- Console accessible at http://192.168.4.38/
- API at http://192.168.4.38/api/

### Aria/Alice (Worker Nodes)

After bootstrap, deploy agent:

```bash
# For Aria (OpenAI agent):
ssh pi@aria
docker run -d --name aria-agent \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -p 5001:5000 \
  blackroad/aria-agent:latest

# For Alice (Claude agent):
ssh pi@alice
docker run -d --name alice-agent \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  -p 5002:5000 \
  blackroad/alice-agent:latest
```

## Backup Before Reimaging

If reimaging an existing Pi, backup important data first:

```bash
ssh pi@<hostname>

# Backup SSH keys and configs
sudo tar czf ~/backup-etc-ssh.tgz /etc/ssh /etc/hostname /etc/hosts /etc/systemd/system 2>/dev/null || true
cp -a ~/.ssh ~/backup-home-ssh 2>/dev/null || true

# Backup application data
tar czf ~/backup-blackroad.tgz ~/blackroad-console ~/blackroad ~/agents 2>/dev/null || true

# Backup Docker volumes
docker compose ls
# Note which projects need data backed up

# Download backups to Mac
scp pi@<hostname>:~/backup-*.tgz ~/blackroad-backup/
```

## Troubleshooting

### Bootstrap fails with "Permission denied"

```bash
# Add sudo before curl
curl -fsSL https://raw.githubusercontent.com/.../bootstrap.sh | sudo bash
```

### Docker group membership not working

```bash
# Logout and login again
exit
ssh pi@<hostname>

# Verify group membership
groups | grep docker
```

### Tailscale not connecting

```bash
# Authenticate Tailscale
sudo tailscale up

# Check status
sudo tailscale status

# Get Tailscale IP
tailscale ip -4
```

### br-send can't find pane

```bash
# List all panes and their titles
tmux list-panes -a -F '#{pane_id} #{pane_title}'

# Name a pane
tmux select-pane -t <pane-id> -T <name>

# Example:
tmux select-pane -t 0 -T lucidia
```

### Custom commands not found after bootstrap

```bash
# Ensure /usr/local/bin is in PATH
echo $PATH | grep /usr/local/bin

# Add to ~/.bashrc if needed
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## Updating Bootstrap Script

To update the bootstrap script on all Pis:

```bash
# Method 1: Re-run bootstrap (idempotent, safe to run multiple times)
curl -fsSL https://raw.githubusercontent.com/.../bootstrap.sh | bash

# Method 2: Update individual tools
sudo curl -fsSL https://raw.githubusercontent.com/.../br-menu -o /usr/local/bin/br-menu
sudo chmod +x /usr/local/bin/br-menu
```

## Complete Fleet Reimage Workflow

**For reimaging all 4 Pis to a clean, identical state:**

### 1. Backup Phase (on Mac)
```bash
mkdir -p ~/blackroad-backup
for pi in lucidia aria alice blackroad-pi; do
  echo "Backing up $pi..."
  ssh pi@$pi 'tar czf ~/backup-data.tgz ~/{blackroad-console,agents,.ssh} 2>/dev/null || true'
  scp pi@$pi:~/backup-data.tgz ~/blackroad-backup/$pi-$(date +%Y%m%d).tgz
done
```

### 2. Image Phase (Raspberry Pi Imager)
For each Pi:
- Insert SD card
- Open Raspberry Pi Imager
- OS: Raspberry Pi OS Lite (64-bit)
- Advanced settings: Set hostname, SSH, user, keys
- Write and verify

### 3. Bootstrap Phase (on Mac)
```bash
# Wait for all Pis to boot (~30 seconds)

# Bootstrap all nodes in parallel
for pi in lucidia aria alice blackroad-pi; do
  echo "Bootstrapping $pi..."
  ssh pi@$pi 'curl -fsSL https://raw.githubusercontent.com/.../bootstrap.sh | bash' &
done
wait

echo "All nodes bootstrapped!"
```

### 4. Deploy Phase
```bash
# Deploy console to Lucidia
cd ~/blackroad-console-deploy
./deploy-to-pi.sh

# Deploy agents to worker nodes
# (Add your agent deployment commands here)
```

### 5. Verify Phase
```bash
for pi in lucidia aria alice blackroad-pi; do
  echo "━━━━━━━━ $pi ━━━━━━━━"
  ssh pi@$pi 'br-status'
done
```

## Infrastructure as Code

The bootstrap script IS your infrastructure. To version control it:

```bash
# Create a BlackRoad Pi ops repo
mkdir -p ~/blackroad-pi-ops
cd ~/blackroad-pi-ops
git init

# Add bootstrap and tools
cp ~/blackroad-console-deploy/bootstrap.sh .
git add bootstrap.sh
git commit -m "Initial bootstrap script"

# Push to GitHub
gh repo create BlackRoad-OS/blackroad-pi-ops --public
git remote add origin git@github.com:BlackRoad-OS/blackroad-pi-ops.git
git push -u origin main
```

Now anyone can bootstrap a BlackRoad node with:
```bash
curl -fsSL https://raw.githubusercontent.com/BlackRoad-OS/blackroad-pi-ops/main/bootstrap.sh | bash
```

---

## Support

- **Email**: blackroad.systems@gmail.com
- **GitHub**: https://github.com/BlackRoad-OS
- **Documentation**: See PI_DEPLOYMENT.md for console deployment details

**Last Updated:** December 21, 2025
