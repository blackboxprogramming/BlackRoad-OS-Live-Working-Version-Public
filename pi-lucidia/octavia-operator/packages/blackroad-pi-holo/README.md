# Pi-Holo Renderer

Pi-Holo drives the square holographic display that mirrors a single rendered frame into four quadrants for a Pepper's Ghost projection. This project bundles the renderer, scene definitions, and system service that target a Raspberry Pi 5 connected to the display.

## Repository Layout

```
pi_holo/
├── README.md                # This document
├── holo_renderer.py         # Main renderer entry point
├── pi-holo.service          # systemd service file
├── requirements.txt         # Python dependencies for the renderer
├── run.sh                   # Convenience launcher that manages the virtualenv
└── Scenes/
    └── example.json         # Reference scene configuration
```

## Quick Start

1. **Download the project**
   ```bash
   scp -r pi_holo pi@pi-holo.local:~
   ```
2. **Log in to the Raspberry Pi**
   ```bash
   ssh pi@pi-holo.local
   cd ~/pi_holo
   ```
3. **Run the renderer**
   ```bash
   bash run.sh                         # DISPLAY_MODE=fullscreen by default
   DISPLAY_MODE=windowed bash run.sh   # Use windowed mode when testing with a keyboard
   ```

The renderer defaults to fullscreen on the attached holographic display. When running windowed, press the `Esc` key to exit.

## Scene Control via MQTT

Publish runtime commands from any machine with `mosquitto-clients` installed:

```bash
mosquitto_pub -h pi-ops.local -t holo/cmd \
  -m '{"scene":"text","params":{"text":"Hello Prism","text_color":[0,200,255]}}'
```

Supported command payload keys:

- `scene`: Switches to the named scene if it is defined in the configuration.
- `params`: Merges the provided dictionary into the active scene's parameters.

## Audio Feedback Channel

Pi-Holo can now respond to MQTT audio commands published to `holo/audio` (configurable via `MQTT_AUDIO_TOPIC`). Payloads should
include the audio filename and optional volume:

```bash
mosquitto_pub -h pi-ops.local -t holo/audio \
  -m '{"file":"alert.wav","volume":0.8}'
```

Audio files are resolved either by absolute path or relative to the directory provided through `AUDIO_BASE_PATH` (default:
`pi_holo/Sounds`). Disable playback entirely with the `--disable-audio` flag or `DISABLE_AUDIO=1` when invoking `run.sh`:

```bash
DISABLE_AUDIO=1 bash run.sh
```

The reflex service automatically publishes audio cues for critical alerts so you can hear spikes and outages without looking at
the display.

## Scenes and Configuration

Scene definitions live in `Scenes/*.json`. The included `example.json` file demonstrates the available scene types (`text`, `clock`, and `camera`) along with default parameters such as colors, fonts, and animation options. Each scene definition can be overridden at runtime via MQTT.

## Optional Camera Input

Set `USE_CAMERA=1` when launching the renderer to enable the camera scene. You can select a different camera by exporting `CAMERA_INDEX` (defaults to `0`). When the camera is not available, the renderer will display a placeholder message.

```bash
USE_CAMERA=1 bash run.sh
```

Switch to the camera scene using MQTT:

```bash
mosquitto_pub -h pi-ops.local -t holo/cmd -m '{"scene":"camera"}'
```

## System Service Installation

Install the bundled systemd service if you want the renderer to start on boot:

```bash
sudo cp pi-holo.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable pi-holo.service
sudo systemctl start pi-holo.service
```

The service runs the renderer in fullscreen mode and restarts it automatically if it crashes.

## Troubleshooting

- **Black screen**: Verify that the display resolution configured in `Scenes/*.json` matches your hardware and that the renderer is running fullscreen.
- **MQTT commands not applying**: Confirm MQTT host and topic environment variables (`MQTT_HOST`, `MQTT_PORT`, `MQTT_TOPIC`) and inspect renderer logs.
- **Camera unavailable**: Ensure OpenCV is installed and the `USE_CAMERA` flag is enabled. The renderer will fall back to a placeholder scene if the camera cannot be accessed.

For automated demos without manual MQTT commands, create a simple publisher script that cycles through scenes and emits updates on the `holo/cmd` topic.

---

## 📜 License & Copyright

**Copyright © 2026 BlackRoad OS, Inc. All Rights Reserved.**

**CEO:** Alexa Amundson

**PROPRIETARY AND CONFIDENTIAL**

This software is the proprietary property of BlackRoad OS, Inc. and is **NOT for commercial resale**.

### ⚠️ Usage Restrictions:
- ✅ **Permitted:** Testing, evaluation, and educational purposes
- ❌ **Prohibited:** Commercial use, resale, or redistribution without written permission

### 🏢 Enterprise Scale:
Designed to support:
- 30,000 AI Agents
- 30,000 Human Employees
- One Operator: Alexa Amundson (CEO)

### 📧 Contact:
For commercial licensing inquiries:
- **Email:** blackroad.systems@gmail.com
- **Organization:** BlackRoad OS, Inc.

See [LICENSE](LICENSE) for complete terms.
