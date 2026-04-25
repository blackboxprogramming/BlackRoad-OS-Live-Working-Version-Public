# BlackRoad OS Raspberry Pi Guide

> Edge computing with Raspberry Pi devices

---

## Table of Contents

- [Overview](#overview)
- [Hardware Setup](#hardware-setup)
- [Software Installation](#software-installation)
- [Fleet Management](#fleet-management)
- [LED Matrix Display](#led-matrix-display)
- [Local Inference](#local-inference)
- [Sensor Integration](#sensor-integration)
- [Networking](#networking)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Overview

BlackRoad OS supports **Raspberry Pi devices** as edge computing nodes. These devices provide local inference, LED displays, sensor data collection, and distributed processing.

### Current Fleet

| Name | IP | Model | RAM | Role |
|------|-----|-------|-----|------|
| `lucidia` | 192.168.4.38 | Pi 4B | 8GB | Primary edge |
| `blackroad-pi` | 192.168.4.64 | Pi 4B | 4GB | Secondary |
| `lucidia-alt` | 192.168.4.99 | Pi 4B | 8GB | Backup |

### Capabilities

```
┌─────────────────────────────────────────────────────────────────┐
│                   RASPBERRY PI CAPABILITIES                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Inference  │  │  LED Matrix  │  │   Sensors    │         │
│  │              │  │              │  │              │         │
│  │  • Ollama    │  │  • Status    │  │  • Temp      │         │
│  │  • llama3.2  │  │  • Alerts    │  │  • Humidity  │         │
│  │  • 1B model  │  │  • Messages  │  │  • Motion    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Edge API    │  │   Storage    │  │  Networking  │         │
│  │              │  │              │  │              │         │
│  │  • FastAPI   │  │  • SD Card   │  │  • WiFi      │         │
│  │  • Local     │  │  • USB SSD   │  │  • Tailscale │         │
│  │  • Mesh      │  │  • NFS       │  │  • Tunnel    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Hardware Setup

### Recommended Hardware

**Essential:**
- Raspberry Pi 4 Model B (4GB or 8GB)
- 64GB+ microSD card (Class 10 or better)
- Official power supply (5V 3A USB-C)
- Heatsinks + fan (active cooling recommended)
- Case with ventilation

**Optional:**
- LED Matrix (32x64 RGB)
- USB SSD for storage
- Temperature/humidity sensor (DHT22)
- Motion sensor (PIR)
- Camera module

### Wiring Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    RASPBERRY PI WIRING                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     GPIO Pins                                                   │
│     ┌─────┐                                                    │
│  3V3│ 1  2│5V  ──── LED Matrix Power                           │
│  SDA│ 3  4│5V                                                  │
│  SCL│ 5  6│GND ──── Common Ground                              │
│  GP4│ 7  8│TX                                                  │
│  GND│ 9 10│RX                                                  │
│ GP17│11 12│GP18 ──── LED Matrix Data                           │
│ GP27│13 14│GND                                                 │
│ GP22│15 16│GP23 ──── DHT22 Data                                │
│  3V3│17 18│GP24 ──── PIR Sensor                                │
│MOSI │19 20│GND                                                 │
│MISO │21 22│GP25                                                │
│SCLK │23 24│CE0                                                 │
│  GND│25 26│CE1                                                 │
│     └─────┘                                                    │
│                                                                 │
│  USB Ports:                                                    │
│  ├── USB 3.0: SSD Storage                                     │
│  └── USB 2.0: Available                                       │
│                                                                 │
│  Network:                                                      │
│  ├── Ethernet: 192.168.4.x                                    │
│  └── WiFi: Backup connection                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### LED Matrix Connection

```
LED Matrix Hub75 -> Pi GPIO
==========================
R1  -> GPIO 17
G1  -> GPIO 18
B1  -> GPIO 22
R2  -> GPIO 23
G2  -> GPIO 24
B2  -> GPIO 25
A   -> GPIO 5
B   -> GPIO 6
C   -> GPIO 13
D   -> GPIO 19
E   -> GPIO 26
CLK -> GPIO 11
LAT -> GPIO 8
OE  -> GPIO 4
GND -> GND
```

---

## Software Installation

### Base OS Setup

```bash
# Flash Raspberry Pi OS Lite (64-bit) to SD card
# Enable SSH before first boot

# First boot configuration
sudo raspi-config
# - Set hostname
# - Configure WiFi
# - Enable I2C, SPI
# - Expand filesystem
# - Set locale/timezone
```

### Install BlackRoad

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y \
    python3-pip \
    python3-venv \
    git \
    curl \
    build-essential

# Clone BlackRoad
git clone https://github.com/blackboxprogramming/blackroad.git
cd blackroad

# Install BlackRoad
./install.sh --pi

# Configure for Pi
./configure.sh --device pi
```

### Install Ollama

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull small model for Pi
ollama pull llama3.2:1b

# Start Ollama service
sudo systemctl enable ollama
sudo systemctl start ollama

# Test
curl http://localhost:11434/api/tags
```

### Configure Systemd Services

```bash
# /etc/systemd/system/blackroad-pi.service
[Unit]
Description=BlackRoad Pi Edge Service
After=network.target ollama.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/blackroad
ExecStart=/home/pi/blackroad/pi-edge.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl enable blackroad-pi
sudo systemctl start blackroad-pi
```

---

## Fleet Management

### Fleet Overview

```bash
# Check all Pi devices
./pi-fleet.sh status

# Output:
# PI FLEET STATUS
# ===============
#
# Device          IP              Status    CPU    Mem    Disk
# ------          --              ------    ---    ---    ----
# lucidia         192.168.4.38    ONLINE    23%    42%    34%
# blackroad-pi    192.168.4.64    ONLINE    15%    38%    28%
# lucidia-alt     192.168.4.99    OFFLINE   -      -      -
#
# Services:
# ├── lucidia:       ollama ✓  led ✓  api ✓
# ├── blackroad-pi:  ollama ✓  led ✗  api ✓
# └── lucidia-alt:   [offline]
```

### Fleet Commands

```bash
# Deploy to all Pis
./pi-fleet.sh deploy

# Update all Pis
./pi-fleet.sh update

# Restart service on all
./pi-fleet.sh restart blackroad-pi

# SSH to specific Pi
./pi-fleet.sh ssh lucidia

# Run command on all Pis
./pi-fleet.sh exec "df -h"

# Sync configuration
./pi-fleet.sh sync-config
```

### Fleet Configuration

```yaml
# config/pi-fleet.yaml
fleet:
  devices:
    lucidia:
      ip: 192.168.4.38
      user: pi
      role: primary
      features:
        - ollama
        - led_matrix
        - sensors
        - api

    blackroad-pi:
      ip: 192.168.4.64
      user: pi
      role: secondary
      features:
        - ollama
        - api

    lucidia-alt:
      ip: 192.168.4.99
      user: pi
      role: backup
      features:
        - ollama
        - led_matrix

  sync:
    config_paths:
      - /home/pi/blackroad/config/
      - /home/pi/blackroad/scripts/
    exclude:
      - "*.log"
      - "__pycache__"

  monitoring:
    interval: 60
    alerts:
      cpu_threshold: 80
      memory_threshold: 85
      disk_threshold: 90
```

---

## LED Matrix Display

### LED Controller

```python
# pi/led_controller.py
from rgbmatrix import RGBMatrix, RGBMatrixOptions, graphics
from PIL import Image
import time

class LEDController:
    def __init__(self, rows=32, cols=64):
        options = RGBMatrixOptions()
        options.rows = rows
        options.cols = cols
        options.chain_length = 1
        options.parallel = 1
        options.hardware_mapping = 'regular'
        options.gpio_slowdown = 4

        self.matrix = RGBMatrix(options=options)
        self.canvas = self.matrix.CreateFrameCanvas()
        self.font = graphics.Font()
        self.font.LoadFont("/home/pi/fonts/5x7.bdf")

    def clear(self):
        """Clear the display."""
        self.canvas.Clear()
        self.canvas = self.matrix.SwapOnVSync(self.canvas)

    def show_text(self, text: str, color=(255, 255, 255), x=0, y=10):
        """Display text on matrix."""
        self.canvas.Clear()
        graphics.DrawText(
            self.canvas, self.font, x, y,
            graphics.Color(*color), text
        )
        self.canvas = self.matrix.SwapOnVSync(self.canvas)

    def show_status(self, agent: str, status: str):
        """Display agent status."""
        colors = {
            "online": (0, 255, 0),
            "busy": (255, 255, 0),
            "offline": (255, 0, 0)
        }
        color = colors.get(status, (255, 255, 255))
        self.show_text(f"{agent}: {status}", color)

    def show_metrics(self, cpu: int, mem: int, tasks: int):
        """Display system metrics."""
        self.canvas.Clear()
        graphics.DrawText(
            self.canvas, self.font, 0, 8,
            graphics.Color(255, 255, 255), f"CPU:{cpu}%"
        )
        graphics.DrawText(
            self.canvas, self.font, 0, 16,
            graphics.Color(255, 255, 255), f"MEM:{mem}%"
        )
        graphics.DrawText(
            self.canvas, self.font, 0, 24,
            graphics.Color(255, 255, 255), f"TASKS:{tasks}"
        )
        self.canvas = self.matrix.SwapOnVSync(self.canvas)

    def show_image(self, image_path: str):
        """Display image on matrix."""
        image = Image.open(image_path)
        image = image.resize((self.matrix.width, self.matrix.height))
        self.matrix.SetImage(image.convert('RGB'))
```

### LED Modes

```python
# pi/led_modes.py
class LEDModes:
    """Different display modes for LED matrix."""

    def __init__(self, controller: LEDController):
        self.led = controller
        self.current_mode = None

    async def status_mode(self):
        """Display agent status in rotation."""
        while self.current_mode == "status":
            agents = await get_agent_status()
            for agent in agents:
                self.led.show_status(agent.name, agent.status)
                await asyncio.sleep(3)

    async def metrics_mode(self):
        """Display system metrics."""
        while self.current_mode == "metrics":
            metrics = await get_system_metrics()
            self.led.show_metrics(
                metrics.cpu,
                metrics.memory,
                metrics.tasks
            )
            await asyncio.sleep(5)

    async def alert_mode(self, message: str, duration: int = 10):
        """Display alert message."""
        for _ in range(duration):
            self.led.show_text(message, color=(255, 0, 0))
            await asyncio.sleep(0.5)
            self.led.clear()
            await asyncio.sleep(0.5)

    async def clock_mode(self):
        """Display current time."""
        while self.current_mode == "clock":
            now = datetime.now()
            self.led.show_text(now.strftime("%H:%M:%S"))
            await asyncio.sleep(1)

    async def matrix_rain(self):
        """Matrix rain effect."""
        # Implementation of matrix rain animation
        pass
```

### LED CLI Commands

```bash
# Control LED display
./led.sh mode status          # Show agent status
./led.sh mode metrics         # Show metrics
./led.sh mode clock           # Show clock
./led.sh mode matrix          # Matrix rain effect
./led.sh mode off             # Turn off

# Display message
./led.sh message "Hello World" --color green --scroll

# Show alert
./led.sh alert "System Alert" --duration 30

# Set brightness
./led.sh brightness 50        # 0-100
```

---

## Local Inference

### Ollama on Pi

```python
# pi/inference.py
import aiohttp

class PiInference:
    """Local inference using Ollama on Pi."""

    def __init__(self, host: str = "localhost", port: int = 11434):
        self.base_url = f"http://{host}:{port}"
        self.model = "llama3.2:1b"  # Small model for Pi

    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate response from local model."""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    **kwargs
                }
            ) as response:
                data = await response.json()
                return data["response"]

    async def chat(self, messages: list, **kwargs) -> str:
        """Chat with local model."""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": messages,
                    "stream": False,
                    **kwargs
                }
            ) as response:
                data = await response.json()
                return data["message"]["content"]

    async def embed(self, text: str) -> list:
        """Generate embeddings locally."""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/api/embeddings",
                json={
                    "model": self.model,
                    "prompt": text
                }
            ) as response:
                data = await response.json()
                return data["embedding"]
```

### Model Selection for Pi

| Model | Size | RAM | Speed | Quality |
|-------|------|-----|-------|---------|
| `llama3.2:1b` | 1.3GB | 2GB | Fast | Good |
| `phi3:mini` | 2.3GB | 4GB | Medium | Better |
| `qwen2:0.5b` | 0.5GB | 1GB | Very Fast | Basic |
| `tinyllama` | 0.6GB | 1GB | Very Fast | Basic |

### Optimizing Inference

```python
# Optimize for Pi's limited resources
inference_config = {
    "num_ctx": 2048,        # Smaller context window
    "num_batch": 128,       # Smaller batch size
    "num_thread": 4,        # Match Pi's cores
    "num_gpu": 0,           # CPU only
    "low_vram": True,       # Memory optimization
}

# Rate limiting for thermal management
class ThrottledInference:
    def __init__(self, inference: PiInference):
        self.inference = inference
        self.last_request = 0
        self.min_interval = 2  # seconds between requests

    async def generate(self, prompt: str, **kwargs):
        # Wait if needed
        elapsed = time.time() - self.last_request
        if elapsed < self.min_interval:
            await asyncio.sleep(self.min_interval - elapsed)

        result = await self.inference.generate(prompt, **kwargs)
        self.last_request = time.time()
        return result
```

---

## Sensor Integration

### Temperature & Humidity (DHT22)

```python
# pi/sensors/dht22.py
import Adafruit_DHT

class DHT22Sensor:
    def __init__(self, pin: int = 23):
        self.sensor = Adafruit_DHT.DHT22
        self.pin = pin

    def read(self) -> dict:
        """Read temperature and humidity."""
        humidity, temperature = Adafruit_DHT.read_retry(
            self.sensor, self.pin
        )

        if humidity is not None and temperature is not None:
            return {
                "temperature_c": round(temperature, 1),
                "temperature_f": round(temperature * 9/5 + 32, 1),
                "humidity": round(humidity, 1)
            }
        return None

    async def monitor(self, interval: int = 60):
        """Continuously monitor and report."""
        while True:
            data = self.read()
            if data:
                await self.report(data)
            await asyncio.sleep(interval)

    async def report(self, data: dict):
        """Report to central system."""
        await memory.store(
            f"sensor:temp:{self.device_id}",
            data,
            tier="working"
        )
```

### Motion Sensor (PIR)

```python
# pi/sensors/pir.py
import RPi.GPIO as GPIO

class PIRSensor:
    def __init__(self, pin: int = 24):
        self.pin = pin
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.pin, GPIO.IN)

    def detect_motion(self) -> bool:
        """Check if motion detected."""
        return GPIO.input(self.pin) == 1

    async def monitor(self, callback):
        """Monitor for motion with callback."""
        last_state = False

        while True:
            current_state = self.detect_motion()

            if current_state and not last_state:
                await callback("motion_detected")
            elif not current_state and last_state:
                await callback("motion_stopped")

            last_state = current_state
            await asyncio.sleep(0.1)

    def cleanup(self):
        GPIO.cleanup()
```

### CPU Temperature

```python
# pi/sensors/cpu_temp.py
class CPUTemperature:
    def read(self) -> float:
        """Read Pi CPU temperature."""
        with open('/sys/class/thermal/thermal_zone0/temp', 'r') as f:
            temp = int(f.read()) / 1000
        return round(temp, 1)

    async def monitor_and_throttle(self, threshold: float = 70):
        """Throttle inference if CPU too hot."""
        while True:
            temp = self.read()

            if temp > threshold:
                # Pause intensive operations
                await self.pause_inference()
                await self.alert(f"CPU temp: {temp}°C - throttling")

            await asyncio.sleep(10)
```

---

## Networking

### Static IP Configuration

```bash
# /etc/dhcpcd.conf
interface eth0
static ip_address=192.168.4.38/24
static routers=192.168.4.1
static domain_name_servers=192.168.4.1 8.8.8.8
```

### Tailscale VPN

```bash
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Connect
sudo tailscale up --authkey $TAILSCALE_KEY

# Check status
tailscale status
```

### mDNS Setup

```bash
# Install Avahi
sudo apt install avahi-daemon

# Configure
# /etc/avahi/avahi-daemon.conf
[server]
host-name=lucidia
domain-name=local

# Now accessible as lucidia.local
```

### Cloudflare Tunnel

```bash
# Install cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared.deb

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create pi-tunnel

# Configure
# ~/.cloudflared/config.yml
tunnel: pi-tunnel
credentials-file: /home/pi/.cloudflared/credentials.json

ingress:
  - hostname: pi.blackroad.io
    service: http://localhost:8000
  - service: http_status:404

# Run as service
sudo cloudflared service install
```

---

## Security

### SSH Hardening

```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
AllowUsers pi

# Restart SSH
sudo systemctl restart sshd
```

### Firewall Setup

```bash
# Install UFW
sudo apt install ufw

# Configure
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 192.168.4.0/24  # Local network
sudo ufw allow 22/tcp               # SSH
sudo ufw allow 8000/tcp             # API
sudo ufw enable
```

### Automatic Updates

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades

# Configure
# /etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Pi won't boot | Corrupt SD | Reflash OS |
| High CPU temp | Poor cooling | Add heatsink/fan |
| Ollama OOM | Model too large | Use smaller model |
| LED not working | Wiring issue | Check GPIO connections |
| Network drops | WiFi interference | Use Ethernet |

### Diagnostic Commands

```bash
# System info
./pi-diag.sh

# Output:
# PI DIAGNOSTICS
# ==============
#
# Hardware:
#   Model: Raspberry Pi 4 Model B Rev 1.4
#   CPU: ARM Cortex-A72 (4 cores @ 1.5GHz)
#   RAM: 8GB
#   Temp: 45.2°C
#
# Storage:
#   SD Card: 64GB (34% used)
#   USB SSD: 256GB (12% used)
#
# Network:
#   eth0: 192.168.4.38 (1000Mbps)
#   wlan0: 192.168.4.138 (WiFi backup)
#
# Services:
#   ollama: running (pid 1234)
#   blackroad-pi: running (pid 5678)
#   led-controller: running (pid 9012)
#
# Recent Errors:
#   [none]

# Check logs
journalctl -u blackroad-pi -f

# Test Ollama
curl http://localhost:11434/api/tags

# Test LED
./led.sh test
```

### Recovery Mode

```bash
# If Pi is unresponsive:
# 1. Remove SD card
# 2. Mount on another computer
# 3. Edit /boot/config.txt if needed
# 4. Check /var/log/syslog

# Remote recovery via Tailscale
ssh pi@100.x.x.x  # Tailscale IP

# Factory reset
./pi-fleet.sh reset lucidia --factory
```

---

*Last updated: 2026-02-05*
