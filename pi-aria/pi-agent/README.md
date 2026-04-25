# BlackRoad Pi Ops

**Edge device management for Raspberry Pi and Jetson - LED control, screen rendering, and hardware interfaces.**

```bash
pip install blackroad-pi-ops
```

## What is this?

Pi Ops provides the edge computing layer for BlackRoad's agent infrastructure:

| Component | Description |
|-----------|-------------|
| **app.py** | Main Flask API for device management (871 lines) |
| **led_bridge.py** | WS281x LED strip control and animations (462 lines) |
| **screen_renderer.py** | Display output for attached screens (465 lines) |

## Quick Start

### On Raspberry Pi

```bash
# Install with Pi-specific dependencies
pip install blackroad-pi-ops[rpi]

# Run the service
pi-ops

# Or as a systemd service
sudo cp pi-ops.service /etc/systemd/system/
sudo systemctl enable pi-ops
sudo systemctl start pi-ops
```

### LED Bridge

```bash
# Run standalone LED controller
led-bridge

# Control via API
curl -X POST http://localhost:5000/led/color \
  -H "Content-Type: application/json" \
  -d '{"r": 255, "g": 0, "b": 128}'

curl -X POST http://localhost:5000/led/pattern \
  -H "Content-Type: application/json" \
  -d '{"pattern": "rainbow", "speed": 50}'
```

### Screen Renderer

```python
from screen_renderer import ScreenRenderer

renderer = ScreenRenderer(width=320, height=240)
renderer.draw_text("Agent Status: Online", x=10, y=10)
renderer.draw_chart(metrics)
renderer.update()
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/status` | GET | Device status and metrics |
| `/led/color` | POST | Set LED strip color |
| `/led/pattern` | POST | Run LED animation pattern |
| `/led/off` | POST | Turn off LEDs |
| `/screen/text` | POST | Display text on screen |
| `/screen/image` | POST | Display image on screen |
| `/screen/clear` | POST | Clear screen |

## Hardware Support

### Raspberry Pi
- Pi 4, Pi 3, Pi Zero 2 W
- WS281x LED strips (via GPIO18)
- SPI displays (ILI9341, ST7789, etc.)
- I2C OLED displays

### Jetson
- Jetson Nano, Xavier NX
- PWM LED control
- HDMI/DisplayPort output

## Wiring

### LED Strip (WS281x)
```
Pi GPIO18 (Pin 12) --> LED DIN
Pi 5V (Pin 2)      --> LED VCC
Pi GND (Pin 6)     --> LED GND
```

### SPI Display
```
Pi GPIO10 (MOSI)   --> Display SDA
Pi GPIO11 (SCLK)   --> Display SCL
Pi GPIO8 (CE0)     --> Display CS
Pi GPIO25          --> Display DC
Pi GPIO24          --> Display RST
```

## Configuration

Environment variables:

```bash
# LED settings
LED_COUNT=60
LED_PIN=18
LED_BRIGHTNESS=128

# Display settings
DISPLAY_TYPE=ili9341
DISPLAY_WIDTH=320
DISPLAY_HEIGHT=240

# API settings
FLASK_PORT=5000
```

## Systemd Service

The included `pi-ops.service` file:

```ini
[Unit]
Description=BlackRoad Pi Ops
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/opt/blackroad-pi-ops
ExecStart=/usr/bin/python3 app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

## License

MIT - See [LICENSE](LICENSE) for details.

---

Built by [BlackRoad OS](https://blackroad.io)
