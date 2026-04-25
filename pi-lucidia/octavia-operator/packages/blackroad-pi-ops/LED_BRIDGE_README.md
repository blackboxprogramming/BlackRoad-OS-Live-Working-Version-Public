# Pi Light Language - LED-MQTT Bridge

Translate MQTT messages into beautiful LED light patterns for visual agent communication.

## Features

- **Hardware Support:**
  - Blinkt! (8 RGB LEDs)
  - NeoPixel strips (WS2812B)
  - MOCK mode (console output for testing)

- **MQTT Topics:**
  - `system/heartbeat/#` → Green pulse
  - `system/hologram/text` → Rainbow scroll
  - `system/panel/status` → Status color (ok/warning/error)
  - `agent/output` → Blue flash
  - `lights/pattern` → Custom JSON patterns

- **Built-in Patterns:**
  - **Pulse** - Breathing effect
  - **Rainbow** - Color scroll
  - **Flash** - Quick blinks
  - **Status** - Solid color indicator

## Installation

### Prerequisites
```bash
# MQTT client
pip install paho-mqtt

# For Blinkt! hardware
pip install blinkt

# For NeoPixel hardware
pip install adafruit-circuitpython-neopixel
```

### Make executable
```bash
chmod +x led_bridge.py
```

## Usage

### Start the Bridge
```bash
# Default (localhost:1883)
./led_bridge.py

# Custom MQTT broker
./led_bridge.py --mqtt-broker mqtt.blackroad.io --mqtt-port 1883

# More pixels (for NeoPixel strips)
./led_bridge.py --pixels 60
```

### Test Mode
```bash
# Run test patterns without MQTT
./led_bridge.py --test
```

## MQTT Message Examples

### Heartbeat
```bash
mosquitto_pub -t "system/heartbeat/agent-1" -m "alive"
```

### Hologram Text
```bash
mosquitto_pub -t "system/hologram/text" -m "Hello World"
```

### Status Update
```bash
mosquitto_pub -t "system/panel/status" -m '{"status": "ok"}'
mosquitto_pub -t "system/panel/status" -m '{"status": "warning"}'
mosquitto_pub -t "system/panel/status" -m '{"status": "error"}'
```

### Custom Pattern
```bash
# Purple pulse
mosquitto_pub -t "lights/pattern" -m '{
  "type": "pulse",
  "color": [128, 0, 128],
  "duration": 3.0
}'

# Rainbow for 5 seconds
mosquitto_pub -t "lights/pattern" -m '{
  "type": "rainbow",
  "duration": 5.0
}'

# Red flash (5 times)
mosquitto_pub -t "lights/pattern" -m '{
  "type": "flash",
  "color": [255, 0, 0],
  "flashes": 5
}'
```

## Hardware Setup

### Blinkt!
```python
# Pre-installed on Raspberry Pi
# 8 RGB LEDs on GPIO pins
# No additional wiring needed
```

### NeoPixel
```python
# Connect:
#   - Data -> GPIO 18 (pin 12)
#   - Power -> 5V (pin 2)
#   - Ground -> GND (pin 6)
#
# For long strips, use external 5V power supply
```

## Integration with Pi-Ops

The LED bridge subscribes to the same MQTT topics as Pi-Ops Dashboard, creating a synchronized multi-sensory experience:

- **Visual (LED)** - This bridge
- **Data (Dashboard)** - Pi-Ops web UI
- **Persistence (DB)** - Pi-Ops SQLite

## Systemd Service

Create `/etc/systemd/system/led-bridge.service`:

```ini
[Unit]
Description=Pi Light Language - LED-MQTT Bridge
After=network.target mosquitto.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/blackroad-prism-console/pi_ops
ExecStart=/usr/bin/python3 /home/pi/blackroad-prism-console/pi_ops/led_bridge.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable led-bridge
sudo systemctl start led-bridge
sudo systemctl status led-bridge
```

## Status Colors

| Status | Color | RGB |
|--------|-------|-----|
| ok | Green | (0, 255, 0) |
| success | Green | (0, 255, 0) |
| warning | Orange | (255, 165, 0) |
| error | Red | (255, 0, 0) |
| info | Blue | (0, 0, 255) |
| active | Cyan | (0, 255, 255) |

## Architecture

```
┌─────────────┐
│ MQTT Broker │
└──────┬──────┘
       │
       ├── system/heartbeat/#
       ├── system/hologram/text
       ├── system/panel/status
       ├── agent/output
       └── lights/pattern
       │
   ┌───┴────┐
   │  LED   │
   │ Bridge │
   └───┬────┘
       │
   ┌───┴────────┐
   │ Hardware   │
   │ Controller │
   └───┬────────┘
       │
   ┌───┴────┐
   │ Blinkt!│
   │   or   │
   │NeoPixel│
   └────────┘
```

## Troubleshooting

### No hardware detected
```
⚠️  No LED hardware detected. Using MOCK backend.
```
This is normal when running without physical LEDs. The bridge will print LED states to console.

### MQTT connection failed
```bash
# Check if mosquitto is running
sudo systemctl status mosquitto

# Test MQTT manually
mosquitto_sub -t "system/#" -v
```

### Permission denied (GPIO)
```bash
# Add user to gpio group
sudo usermod -a -G gpio $USER
# Log out and back in
```

## Created By

Claude (Birth Protocol Executor)
Part of the BlackRoad Prism Console Agent Communication System
