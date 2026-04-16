# BlackRoad OS Hardware Inventory

> Last updated: 2026-04-10
> Total devices: 35+

---

## COMPUTE NODES (Active Fleet)

### Alexandria (Mac)
- **Role**: Command center, dev machine
- **Type**: Mac (Apple Silicon)
- **IP**: 192.168.4.28
- **Status**: ACTIVE
- **SSH**: N/A (local)

### Alice (Raspberry Pi)
- **Role**: Edge router, nginx, 20 domains
- **SSH**: ssh pi@alice
- **Architecture**: armhf (32-bit)
- **Status**: ACTIVE

### Cecilia (Raspberry Pi)
- **Role**: MinIO CDN/S3
- **SSH**: ssh blackroad@cecilia
- **Status**: ACTIVE

### Lucidia (Raspberry Pi)
- **Role**: PowerDNS, NATS
- **SSH**: ssh blackroad@lucidia
- **Status**: ACTIVE

### Octavia (Raspberry Pi)
- **Role**: Gitea primary, workerd
- **SSH**: ssh blackroad@octavia (also pi@octavia)
- **IP**: .101
- **Status**: ACTIVE

### Aria (Raspberry Pi)
- **Role**: TBD
- **SSH**: ssh blackroad@aria
- **Status**: OFFLINE

### Gematria
- **Role**: Self-hosted runner
- **Architecture**: x64
- **SSH**: ssh blackroad@gematria
- **Status**: ACTIVE

### Anastasia
- **Role**: Self-hosted runner
- **Architecture**: x64
- **SSH**: ssh blackroad@anastasia
- **Status**: ACTIVE

---

## COMPUTE NODES (To Activate)

### 2014 MacBook Pro
- **Role**: Heavy compute backup node
- **CPU**: Intel i5/i7
- **RAM**: 8-16GB
- **Status**: NOT ACTIVATED
- **Hackability**: Install Linux alongside macOS
- **Priority**: HIGH -- more powerful than all Pis combined

### Nintendo Switch v1 (Unpatched)
- **Role**: Portable Linux tablet
- **CPU**: Nvidia Tegra X1
- **RAM**: 4GB
- **Status**: NOT ACTIVATED
- **Hackability**: PERMANENT hardware exploit (RCM mode), runs full Ubuntu/Android
- **Priority**: HIGH -- most powerful portable device owned

---

## MESH / RADIO / IoT

### Heltec WiFi LoRa 32 V3 (BlackRoad)
- **Role**: LoRa Meshtastic node #1
- **Chip**: ESP32-S3, 8MB flash, 240MHz dual core
- **MAC**: 9c:13:9e:9b:60:9c
- **Meshtastic ID**: !9e9b609c
- **Node Name**: BlackRoad (BKRD)
- **Firmware**: Meshtastic 2.7.15
- **LoRa Region**: US, LONG_FAST, 30dBm
- **Port**: /dev/cu.SLAB_USBtoUART
- **Status**: ACTIVE -- flashed 2026-04-10
- **Neighbors**: 1 detected (!6a8d36f1 at 44.69N, 93.29W)

### ESP32 (CH340 board)
- **Role**: Meshtastic node #2 or WiFi sensor
- **Chip**: ESP32-D0WD-V3 (rev 3.1), dual core 240MHz
- **MAC**: 20:e7:c8:ba:1b:94
- **Port**: /dev/cu.usbserial-110
- **Status**: IDENTIFIED -- awaiting flash
- **Note**: Original ESP32 (not S3). If it has LoRa, can be Meshtastic #2

### M5Stack Atom Lite
- **Role**: Tiny sensor/trigger node
- **Chip**: ESP32 (PICO-D4)
- **Features**: WiFi, BT, 1 button, 1 RGB LED, Grove port, USB-C
- **Size**: 24x24mm (smallest possible Roadie)
- **Status**: NOT ACTIVATED
- **Flash with**: Arduino, MicroPython, ESPHome, UIFlow

### 2x Raspberry Pi Pico
- **Role**: Custom USB devices, sensors, controllers
- **Chip**: RP2040, dual-core ARM Cortex-M0+, 133MHz
- **RAM**: 264KB SRAM
- **Flash**: 2MB
- **Status**: NOT ACTIVATED
- **Flash with**: MicroPython, CircuitPython, Arduino, C/C++

---

## AI ACCELERATORS

### Hailo-8 M.2 Module
- **Role**: AI inference accelerator
- **Performance**: 26 TOPS (trillion operations per second)
- **Interface**: M.2 (for Raspberry Pi 5)
- **Supports**: Linux, Windows
- **Capabilities**: Real-time object detection (YOLOv8), face recognition, LLM acceleration, voice processing
- **Status**: NOT INSTALLED
- **Priority**: CRITICAL -- turns a Pi 5 into an AI powerhouse
- **Target**: Plug into Pi 5 with M.2 HAT

### Sipeed Maix M1s Dock
- **Role**: Edge AI + vision node
- **Architecture**: RISC-V
- **NPU**: 100 GOPS (BLAI)
- **Features**: Touchscreen, shell, camera support
- **OS**: FreeRTOS, Linux
- **Capabilities**: TinyML, vision, voice, edge inference
- **Status**: NOT ACTIVATED
- **Priority**: HIGH -- standalone edge AI computer

---

## DISPLAYS / DASHBOARDS

### Kindle (E-Ink)
- **Role**: SSH terminal, offline knowledge base, e-ink dashboard
- **Firmware**: 5.18.6 (458618 041)
- **Storage**: 14.6GB (96.6% free)
- **Filesystem**: FAT32, read/write
- **OS**: Embedded Linux (BusyBox, Lab126 daemons, Java CVM UI)
- **Data**: 543 highlights, 274 vocab lookups, 8 SQLite databases
- **Jailbreak**: Nosebleed method (awaiting nosebleed.zip download)
- **OTA Updates**: BLOCKED (update.bin.tmp.partial created)
- **Status**: IDENTIFIED -- jailbreak pending
- **Priority**: HIGH

### Kindle Fire
- **Role**: Android tablet dashboard
- **Hackability**: Fire Toolbox strips Amazon bloat, install LineageOS/full Android
- **Status**: NOT ACTIVATED
- **Priority**: MEDIUM

### ESP32 Touchscreen 2.8" (ILI9341)
- **Role**: Mini wall display / dashboard
- **Chip**: ESP32
- **Display**: 2.8" TFT 240x320, resistive touch
- **Model**: ESP32-2432S028R
- **Features**: WiFi, BT, dual core
- **Status**: NOT ACTIVATED
- **Flash with**: Arduino, LVGL for UI, ESPHome

### ELEGOO UNO R3 + 2.8" TFT
- **Role**: Display node, data logger
- **Display**: 2.8" TFT touch + SD card slot
- **Platform**: Arduino
- **Status**: NOT ACTIVATED

### Meta Quest 2
- **Role**: VR command center / dashboard
- **Serial**: 1WMHH869MH1283
- **CPU**: Qualcomm Snapdragon XR2
- **RAM**: 6GB
- **OS**: Android (Linux kernel 4.19)
- **Features**: WiFi 6, hand tracking, 6DOF, passthrough cameras
- **Hackability**: Developer mode + ADB + sideloading + Oculess (strip Meta telemetry)
- **Status**: DETECTED via USB -- dev mode TBD
- **Priority**: MEDIUM -- most powerful device besides Mac

---

## REMOTE MANAGEMENT

### PiKVM (Remote Control Server)
- **Role**: KVM-over-IP for any machine
- **Features**: HDMI capture, ATX control, PoE, OLED display, metal enclosure
- **Capabilities**: Remote screen, keyboard, mouse injection over network
- **Compatibility**: Raspberry Pi 4B
- **Status**: NOT ACTIVATED
- **Priority**: HIGH -- enables remote management of entire fleet

---

## INDUSTRIAL / PROTOCOL

### RS485 CAN HAT
- **Role**: Industrial bus communication bridge
- **Compatibility**: Pi 5/4B/3B+/3B/2B/B+/Zero
- **CAN Controller**: MCP2515 (SPI interface)
- **Transceiver**: SIT65HVD230DR
- **Capabilities**: RS485 + CAN bus -- talk to PLCs, motors, vehicles, industrial equipment
- **Status**: NOT INSTALLED

---

## DEV TOOLS

### WCH Linke CH32V003 EVT
- **Role**: RISC-V programmer/debugger
- **Interface**: SWD + 1 serial-to-USB channel
- **Architecture**: RISC-V
- **Use**: Flash and debug RISC-V chips (Sipeed, CH32V series)
- **Status**: NOT ACTIVATED

---

## POWER

### MARBERO 88.8Wh Solar Generator
- **Role**: Off-grid power hub
- **Capacity**: 88.8Wh / 24,000mAh
- **Output**: 110V AC (80W, 120W peak) + USB-C PD 30W + USB-A QC3.0
- **Solar Panel**: 21W (included)
- **Weight**: 3.2 lbs
- **Runtime**: Pi 4 @ 5W = ~17 hours; Pi Zero = ~80+ hours
- **Status**: TO PURCHASE
- **Priority**: HIGH -- only off-grid power source with AC outlet

### Raynic Emergency Radio
- **Role**: Emergency power + radio reception
- **Capacity**: 5,000mAh / 18,500mWh
- **Charging**: Solar + hand crank + micro USB
- **Radio**: AM/FM/SW/NOAA weather alerts
- **Features**: Flashlight, SOS siren, headphone jack, USB phone charger
- **Status**: OWNED

---

## NOVELTY / PERIPHERALS

### Wonderboy MacLock
- **Role**: Retro desk mascot (potential WonderMac Pi Zero mod)
- **Features**: LCD clock, alarm, temperature
- **Hack Potential**: Gut and insert Pi Zero W for tiny working Mac
- **Status**: OWNED -- stock

### AeroBand PocketDrum Sticks
- **Role**: Bluetooth MIDI drum input
- **Connection**: Bluetooth 4.0 (BLE) + USB MIDI via adapter
- **Latency**: <6ms
- **Status**: OWNED -- pairs via phone app

---

## RETRO / TO EVALUATE

### eMac
- **CPU**: PowerPC G4 ~1GHz
- **RAM**: ~1GB
- **Hackability**: Runs Debian PPC, MorphOS
- **Potential**: Retro server (DNS, static files, git daemon)
- **Status**: NOT EVALUATED

### Mac G3
- **CPU**: PowerPC G3 ~300-400MHz
- **Hackability**: Linux (Yellow Dog, Debian PPC)
- **Potential**: Art piece + minimal server
- **Status**: NOT EVALUATED

### iPad Pro (1st or 2nd gen)
- **Hackability**: checkra1n permanent jailbreak if A9X/A10X
- **Potential**: Dashboard king, best screen in fleet
- **Status**: NOT EVALUATED

### Old iPad
- **Hackability**: checkra1n if iPad 2/3/4
- **Potential**: Web kiosk, dashboard display
- **Status**: NOT EVALUATED

### Newer iPad
- **Hackability**: Depends on chip (checkm8 for A11+)
- **Status**: NOT EVALUATED

### iPod Touch 4G
- **OS**: iOS 6.x max (32-bit)
- **Hackability**: Jailbreakable forever (redsn0w/p0sixspwn)
- **Potential**: Tiny notification receiver, pocket dashboard
- **Status**: NOT EVALUATED

### PSP (PlayStation Portable)
- **CPU**: MIPS R4000 333MHz
- **Hackability**: LEGENDARY. CFW in 10 minutes
- **Potential**: Pocket terminal, emulators, SSH client, IR remote
- **Status**: NOT EVALUATED

### Wii
- **Hackability**: Homebrew Channel via LetterBomb
- **Potential**: Media center, emulation, runs Wii Linux
- **Status**: NOT EVALUATED

### Xbox 360 (x2)
- **CPU**: PowerPC Xenon triple-core
- **Hackability**: RGH/JTAG if old dashboard
- **Potential**: Custom dashboard, FTP server, media streaming
- **Status**: NOT EVALUATED

### Nintendo DS
- **Hackability**: Flashcart (R4) for homebrew
- **Potential**: Limited -- no networking
- **Status**: NOT EVALUATED

### Gameboy
- **CPU**: 8-bit Z80
- **Hackability**: Flashcart
- **Potential**: Nostalgia only. Custom BlackRoad ROM would be fun
- **Status**: NOT EVALUATED

---

## FLEET SUMMARY

| Category | Active | Pending | Total |
|----------|--------|---------|-------|
| Compute Nodes | 8 | 2 | 10 |
| Mesh/Radio/IoT | 1 | 4 | 5 |
| AI Accelerators | 0 | 2 | 2 |
| Displays | 0 | 5 | 5 |
| Remote Mgmt | 0 | 1 | 1 |
| Industrial | 0 | 1 | 1 |
| Dev Tools | 0 | 1 | 1 |
| Power | 1 | 1 | 2 |
| Peripherals | 2 | 0 | 2 |
| Retro/Evaluate | 0 | 10 | 10 |
| **TOTAL** | **12** | **27** | **39** |

## ACTIVATION PRIORITY

1. **Kindle** -- jailbreak via Nosebleed (awaiting download)
2. **Hailo-8** -- install in Pi 5 for 26 TOPS AI
3. **Nintendo Switch v1** -- RCM jailbreak, run Linux
4. **PiKVM** -- remote management of fleet
5. **2014 MacBook Pro** -- Linux install, heavy compute
6. **ESP32 Touchscreen** -- flash as mini dashboard
7. **Sipeed Maix M1s** -- edge AI node
8. **Kindle Fire** -- strip Amazon, full Android
9. **M5Stack Atom Lite** -- tiny sensor trigger
10. **ESP32 CH340** -- Meshtastic node #2 or sensor
