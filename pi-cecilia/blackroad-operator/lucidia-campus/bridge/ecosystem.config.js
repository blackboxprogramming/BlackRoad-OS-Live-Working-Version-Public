/**
 * PM2 ecosystem config for Campus Data Bridge
 * Deploy on: olympia (Pi 4B)
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 reload campus-data-bridge
 *   pm2 logs campus-data-bridge
 */
module.exports = {
  apps: [
    {
      name: "campus-data-bridge",
      script: "campus-data-bridge.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "50M",
      env: {
        NODE_ENV: "production",
        BRIDGE_WS_PORT: "9100",
        BRIDGE_WS_HOST: "0.0.0.0",
        NATS_URL: "nats://localhost:4222",
      },
    },
  ],
};
