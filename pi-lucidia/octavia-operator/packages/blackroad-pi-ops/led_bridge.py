#!/usr/bin/env python3
"""
Pi Light Language - LED-MQTT Bridge

Translates MQTT messages into LED patterns for visual agent communication.
Supports Blinkt! (8 LEDs) and NeoPixel strips.

MQTT Topics:
    system/heartbeat/#     -> Pulse pattern
    system/hologram/text   -> Rainbow scroll
    system/panel/status    -> Status color
    agent/output           -> Flash pattern
    lights/pattern         -> Custom patterns
"""

import json
import time
import sys
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import threading
import queue

try:
    import paho.mqtt.client as mqtt
except ImportError:
    print("Warning: paho-mqtt not installed. Install with: pip install paho-mqtt")
    mqtt = None


# LED Hardware Abstraction Layer
class LEDBackend(Enum):
    """Supported LED hardware backends"""
    BLINKT = "blinkt"
    NEOPIXEL = "neopixel"
    MOCK = "mock"  # For testing without hardware


@dataclass
class LEDState:
    """RGB LED state"""
    r: int  # 0-255
    g: int  # 0-255
    b: int  # 0-255
    brightness: float = 1.0  # 0.0-1.0


class LEDController:
    """Abstract LED controller with hardware detection"""

    def __init__(self, num_pixels: int = 8, backend: Optional[LEDBackend] = None):
        self.num_pixels = num_pixels
        self.backend = backend or self._detect_backend()
        self.pixels: List[LEDState] = [LEDState(0, 0, 0) for _ in range(num_pixels)]
        self._lock = threading.Lock()

        # Initialize hardware
        self._init_hardware()

    def _detect_backend(self) -> LEDBackend:
        """Auto-detect available LED hardware"""
        try:
            import blinkt
            return LEDBackend.BLINKT
        except ImportError:
            pass

        try:
            import board
            import neopixel
            return LEDBackend.NEOPIXEL
        except ImportError:
            pass

        print("⚠️  No LED hardware detected. Using MOCK backend.")
        return LEDBackend.MOCK

    def _init_hardware(self):
        """Initialize hardware-specific backend"""
        if self.backend == LEDBackend.BLINKT:
            try:
                import blinkt
                self.hw = blinkt
                blinkt.set_clear_on_exit()
                blinkt.clear()
                print(f"✅ Blinkt! initialized ({self.num_pixels} pixels)")
            except Exception as e:
                print(f"❌ Failed to initialize Blinkt!: {e}")
                self.backend = LEDBackend.MOCK

        elif self.backend == LEDBackend.NEOPIXEL:
            try:
                import board
                import neopixel
                self.hw = neopixel.NeoPixel(
                    board.D18, self.num_pixels, auto_write=False
                )
                self.hw.fill((0, 0, 0))
                self.hw.show()
                print(f"✅ NeoPixel initialized ({self.num_pixels} pixels)")
            except Exception as e:
                print(f"❌ Failed to initialize NeoPixel: {e}")
                self.backend = LEDBackend.MOCK

        else:
            print(f"✅ MOCK LED backend initialized ({self.num_pixels} pixels)")

    def set_pixel(self, index: int, r: int, g: int, b: int, brightness: float = 1.0):
        """Set a single pixel color"""
        if 0 <= index < self.num_pixels:
            with self._lock:
                self.pixels[index] = LEDState(r, g, b, brightness)

    def set_all(self, r: int, g: int, b: int, brightness: float = 1.0):
        """Set all pixels to the same color"""
        for i in range(self.num_pixels):
            self.set_pixel(i, r, g, b, brightness)

    def show(self):
        """Update hardware display"""
        with self._lock:
            if self.backend == LEDBackend.BLINKT:
                for i, pixel in enumerate(self.pixels):
                    self.hw.set_pixel(
                        i,
                        pixel.r,
                        pixel.g,
                        pixel.b,
                        pixel.brightness
                    )
                self.hw.show()

            elif self.backend == LEDBackend.NEOPIXEL:
                for i, pixel in enumerate(self.pixels):
                    self.hw[i] = (
                        int(pixel.r * pixel.brightness),
                        int(pixel.g * pixel.brightness),
                        int(pixel.b * pixel.brightness)
                    )
                self.hw.show()

            elif self.backend == LEDBackend.MOCK:
                # Print to console for testing
                bar = "["
                for pixel in self.pixels:
                    if pixel.r > 200:
                        bar += "🔴"
                    elif pixel.g > 200:
                        bar += "🟢"
                    elif pixel.b > 200:
                        bar += "🔵"
                    elif pixel.r > 100 and pixel.g > 100:
                        bar += "🟡"
                    elif pixel.r > 50 or pixel.g > 50 or pixel.b > 50:
                        bar += "⚪"
                    else:
                        bar += "⚫"
                bar += "]"
                print(f"\r{bar}", end="", flush=True)

    def clear(self):
        """Turn off all LEDs"""
        self.set_all(0, 0, 0, 0.0)
        self.show()


# LED Patterns
class LEDPattern:
    """Base class for LED animation patterns"""

    def __init__(self, controller: LEDController, duration: float = 1.0):
        self.controller = controller
        self.duration = duration
        self.start_time = time.time()

    def update(self) -> bool:
        """Update pattern. Returns True if pattern is complete."""
        elapsed = time.time() - self.start_time
        if elapsed >= self.duration:
            return True
        self._update_leds(elapsed / self.duration)
        self.controller.show()
        return False

    def _update_leds(self, progress: float):
        """Override this to implement pattern logic. progress is 0.0-1.0"""
        raise NotImplementedError


class PulsePattern(LEDPattern):
    """Breathing pulse effect"""

    def __init__(self, controller: LEDController, color: Tuple[int, int, int], duration: float = 2.0):
        super().__init__(controller, duration)
        self.color = color

    def _update_leds(self, progress: float):
        # Sine wave for smooth pulse
        import math
        brightness = (math.sin(progress * math.pi * 2) + 1) / 2
        self.controller.set_all(*self.color, brightness)


class RainbowPattern(LEDPattern):
    """Rainbow scroll effect"""

    def _update_leds(self, progress: float):
        import colorsys
        for i in range(self.controller.num_pixels):
            hue = (progress + i / self.controller.num_pixels) % 1.0
            r, g, b = colorsys.hsv_to_rgb(hue, 1.0, 1.0)
            self.controller.set_pixel(i, int(r * 255), int(g * 255), int(b * 255), 0.5)


class FlashPattern(LEDPattern):
    """Quick flash effect"""

    def __init__(self, controller: LEDController, color: Tuple[int, int, int], flashes: int = 3):
        super().__init__(controller, duration=flashes * 0.2)
        self.color = color
        self.flashes = flashes

    def _update_leds(self, progress: float):
        flash_index = int(progress * self.flashes)
        flash_progress = (progress * self.flashes) % 1.0
        brightness = 1.0 if flash_progress < 0.5 else 0.0
        self.controller.set_all(*self.color, brightness)


class StatusPattern(LEDPattern):
    """Solid color status indicator"""

    def __init__(self, controller: LEDController, color: Tuple[int, int, int], duration: float = 5.0):
        super().__init__(controller, duration)
        self.color = color

    def _update_leds(self, progress: float):
        self.controller.set_all(*self.color, 0.3)


# MQTT Bridge
class LEDBridge:
    """MQTT to LED bridge"""

    def __init__(
        self,
        mqtt_broker: str = "localhost",
        mqtt_port: int = 1883,
        num_pixels: int = 8
    ):
        self.mqtt_broker = mqtt_broker
        self.mqtt_port = mqtt_port
        self.controller = LEDController(num_pixels=num_pixels)
        self.pattern_queue = queue.Queue()
        self.current_pattern: Optional[LEDPattern] = None
        self.running = False

        # Color mappings
        self.STATUS_COLORS = {
            "ok": (0, 255, 0),       # Green
            "warning": (255, 165, 0), # Orange
            "error": (255, 0, 0),     # Red
            "info": (0, 0, 255),      # Blue
            "success": (0, 255, 0),   # Green
            "active": (0, 255, 255),  # Cyan
        }

        # Setup MQTT client
        if mqtt:
            self.mqtt_client = mqtt.Client("led-bridge")
            self.mqtt_client.on_connect = self._on_connect
            self.mqtt_client.on_message = self._on_message
        else:
            self.mqtt_client = None
            print("⚠️  MQTT client not available")

    def _on_connect(self, client, userdata, flags, rc):
        """MQTT connection callback"""
        print(f"✅ Connected to MQTT broker at {self.mqtt_broker}:{self.mqtt_port}")

        # Subscribe to topics
        topics = [
            "system/heartbeat/#",
            "system/hologram/text",
            "system/panel/status",
            "agent/output",
            "lights/pattern"
        ]
        for topic in topics:
            client.subscribe(topic)
            print(f"   📡 Subscribed to {topic}")

    def _on_message(self, client, userdata, msg):
        """MQTT message callback"""
        topic = msg.topic
        try:
            payload = msg.payload.decode('utf-8')
            self._handle_message(topic, payload)
        except Exception as e:
            print(f"❌ Error handling message on {topic}: {e}")

    def _handle_message(self, topic: str, payload: str):
        """Route message to appropriate pattern"""

        # Heartbeat -> Pulse
        if topic.startswith("system/heartbeat/"):
            color = (0, 255, 0)  # Green pulse
            pattern = PulsePattern(self.controller, color, duration=1.0)
            self.pattern_queue.put(pattern)

        # Hologram -> Rainbow
        elif topic == "system/hologram/text":
            pattern = RainbowPattern(self.controller, duration=3.0)
            self.pattern_queue.put(pattern)

        # Status -> Solid color
        elif topic == "system/panel/status":
            try:
                data = json.loads(payload)
                status = data.get("status", "info").lower()
                color = self.STATUS_COLORS.get(status, (255, 255, 255))
                pattern = StatusPattern(self.controller, color, duration=5.0)
                self.pattern_queue.put(pattern)
            except json.JSONDecodeError:
                pass

        # Agent output -> Flash
        elif topic == "agent/output":
            color = (0, 0, 255)  # Blue flash
            pattern = FlashPattern(self.controller, color, flashes=2)
            self.pattern_queue.put(pattern)

        # Custom patterns
        elif topic == "lights/pattern":
            try:
                data = json.loads(payload)
                self._create_custom_pattern(data)
            except json.JSONDecodeError:
                pass

    def _create_custom_pattern(self, data: Dict):
        """Create pattern from JSON specification"""
        pattern_type = data.get("type", "pulse")
        color = tuple(data.get("color", [255, 255, 255]))
        duration = data.get("duration", 2.0)

        if pattern_type == "pulse":
            pattern = PulsePattern(self.controller, color, duration)
        elif pattern_type == "rainbow":
            pattern = RainbowPattern(self.controller, duration)
        elif pattern_type == "flash":
            flashes = data.get("flashes", 3)
            pattern = FlashPattern(self.controller, color, flashes)
        elif pattern_type == "status":
            pattern = StatusPattern(self.controller, color, duration)
        else:
            return

        self.pattern_queue.put(pattern)

    def _pattern_loop(self):
        """Main pattern update loop"""
        while self.running:
            # Get next pattern if current is done
            if self.current_pattern is None or self.current_pattern.update():
                try:
                    self.current_pattern = self.pattern_queue.get_nowait()
                except queue.Empty:
                    self.current_pattern = None
                    self.controller.clear()

            time.sleep(0.033)  # ~30 FPS

    def start(self):
        """Start the LED bridge"""
        print("=" * 60)
        print("🌈 Pi Light Language - LED-MQTT Bridge")
        print("=" * 60)
        print(f"MQTT Broker: {self.mqtt_broker}:{self.mqtt_port}")
        print(f"LED Backend: {self.controller.backend.value}")
        print(f"Pixels: {self.controller.num_pixels}")
        print()

        self.running = True

        # Start pattern loop thread
        pattern_thread = threading.Thread(target=self._pattern_loop, daemon=True)
        pattern_thread.start()

        # Connect to MQTT
        if self.mqtt_client:
            try:
                self.mqtt_client.connect(self.mqtt_broker, self.mqtt_port, 60)
                self.mqtt_client.loop_start()
            except Exception as e:
                print(f"❌ Failed to connect to MQTT broker: {e}")
                print("   Running in standalone mode...")

        # Keep alive
        try:
            print("✅ LED Bridge running. Press Ctrl+C to stop.")
            print()
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n⏸️  Shutting down LED Bridge...")
            self.stop()

    def stop(self):
        """Stop the LED bridge"""
        self.running = False
        if self.mqtt_client:
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()
        self.controller.clear()
        print("✅ LED Bridge stopped")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Pi Light Language - LED-MQTT Bridge")
    parser.add_argument("--mqtt-broker", default="localhost", help="MQTT broker host")
    parser.add_argument("--mqtt-port", type=int, default=1883, help="MQTT broker port")
    parser.add_argument("--pixels", type=int, default=8, help="Number of LED pixels")
    parser.add_argument("--test", action="store_true", help="Run test patterns")

    args = parser.parse_args()

    if args.test:
        # Test mode - cycle through patterns
        print("🧪 Test Mode - Cycling through patterns...")
        controller = LEDController(num_pixels=args.pixels)

        patterns = [
            ("Pulse (Green)", PulsePattern(controller, (0, 255, 0), 3.0)),
            ("Rainbow", RainbowPattern(controller, 3.0)),
            ("Flash (Red)", FlashPattern(controller, (255, 0, 0), 5)),
            ("Status (Blue)", StatusPattern(controller, (0, 0, 255), 3.0)),
        ]

        for name, pattern in patterns:
            print(f"\n▶️  {name}")
            while not pattern.update():
                time.sleep(0.033)

        controller.clear()
        print("\n✅ Test complete")
    else:
        # Normal bridge mode
        bridge = LEDBridge(
            mqtt_broker=args.mqtt_broker,
            mqtt_port=args.mqtt_port,
            num_pixels=args.pixels
        )
        bridge.start()


if __name__ == "__main__":
    main()
