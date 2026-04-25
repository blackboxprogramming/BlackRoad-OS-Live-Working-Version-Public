#!/bin/bash

set -e

echo "🚀 Deploying BlackRoad Console Backend to Raspberry Pi"

PI_USER="pi"
PI_HOST="192.168.4.38"
DEPLOY_DIR="/home/pi/blackroad-console-backend"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Step 1: Copying backend files to Pi...${NC}"
ssh $PI_USER@$PI_HOST "mkdir -p $DEPLOY_DIR"
rsync -avz --exclude 'node_modules' --exclude 'data' --exclude '.env' \
  . $PI_USER@$PI_HOST:$DEPLOY_DIR/

echo -e "${YELLOW}Step 2: Installing dependencies on Pi...${NC}"
ssh $PI_USER@$PI_HOST "cd $DEPLOY_DIR && npm install --production"

echo -e "${YELLOW}Step 3: Setting up environment...${NC}"
ssh $PI_USER@$PI_HOST "cd $DEPLOY_DIR && if [ ! -f .env ]; then cp .env.example .env; fi"

echo -e "${YELLOW}Step 4: Initializing database...${NC}"
ssh $PI_USER@$PI_HOST "cd $DEPLOY_DIR && npm run init-db"

echo -e "${YELLOW}Step 5: Creating systemd service...${NC}"
ssh $PI_USER@$PI_HOST "sudo tee /etc/systemd/system/blackroad-api.service > /dev/null << 'EOF'
[Unit]
Description=BlackRoad Console API
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=$DEPLOY_DIR
Environment=\"NODE_ENV=production\"
Environment=\"PORT=3000\"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF"

echo -e "${YELLOW}Step 6: Configuring nginx reverse proxy...${NC}"
ssh $PI_USER@$PI_HOST "sudo tee /tmp/api-proxy.conf > /dev/null << 'EOF'
    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \"Upgrade\";
        proxy_set_header Host \$host;
    }
EOF"

# Add API proxy config to nginx
ssh $PI_USER@$PI_HOST "sudo sed -i '/location = \/vault {/r /tmp/api-proxy.conf' /etc/nginx/sites-available/blackroad-console"

echo -e "${YELLOW}Step 7: Starting services...${NC}"
ssh $PI_USER@$PI_HOST "sudo systemctl daemon-reload && \
  sudo systemctl enable blackroad-api && \
  sudo systemctl restart blackroad-api && \
  sudo systemctl reload nginx"

echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo "Backend API is now running at:"
echo "  - https://console.blackroad.systems/api"
echo "  - https://os.blackroad.me/api"
echo "  - https://desktop.lucidia.earth/api"
echo ""
echo "Check status with:"
echo "  ssh $PI_USER@$PI_HOST 'sudo systemctl status blackroad-api'"
echo ""
echo "View logs with:"
echo "  ssh $PI_USER@$PI_HOST 'sudo journalctl -u blackroad-api -f'"
