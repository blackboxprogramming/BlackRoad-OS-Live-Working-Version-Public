#!/usr/bin/env python3
"""
Pi Screen Renderer - MQTT Message Visualization

Renders MQTT messages graphically on Pi displays using pygame.
Supports hologram effects, status panels, and agent output visualization.

MQTT Topics:
    system/hologram/text   -> Holographic text display
    system/panel/status    -> Status panel with color indicators
    agent/output           -> Scrolling agent messages
    screen/command         -> Display control commands
"""

import json
import time
import sys
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import threading
import queue

try:
    import pygame
    PYGAME_AVAILABLE = True
except ImportError:
    print("Warning: pygame not installed. Install with: pip install pygame")
    PYGAME_AVAILABLE = False

try:
    import paho.mqtt.client as mqtt
except ImportError:
    print("Warning: paho-mqtt not installed. Install with: pip install paho-mqtt")
    mqtt = None


@dataclass
class Message:
    """Display message"""
    text: str
    color: Tuple[int, int, int] = (255, 255, 255)
    timestamp: float = 0.0
    duration: float = 5.0


class DisplayMode(Enum):
    """Display rendering modes"""
    HOLOGRAM = "hologram"
    STATUS = "status"
    SCROLL = "scroll"
    DASHBOARD = "dashboard"


class ScreenRenderer:
    """MQTT-driven screen renderer for Pi displays"""

    def __init__(
        self,
        width: int = 800,
        height: int = 480,
        mqtt_broker: str = "localhost",
        mqtt_port: int = 1883,
        fullscreen: bool = False
    ):
        self.width = width
        self.height = height
        self.mqtt_broker = mqtt_broker
        self.mqtt_port = mqtt_port
        self.fullscreen = fullscreen

        self.screen = None
        self.clock = None
        self.font = None
        self.font_large = None
        self.running = False

        self.mode = DisplayMode.HOLOGRAM
        self.messages = queue.Queue()
        self.current_message: Optional[Message] = None
        self.scroll_messages: List[Message] = []

        # Colors
        self.BLACK = (0, 0, 0)
        self.WHITE = (255, 255, 255)
        self.GREEN = (0, 255, 136)
        self.BLUE = (0, 170, 255)
        self.RED = (255, 68, 68)
        self.ORANGE = (255, 170, 0)
        self.CYAN = (0, 255, 255)

        # Initialize pygame
        if PYGAME_AVAILABLE:
            self._init_pygame()

        # Initialize MQTT
        if mqtt:
            self.mqtt_client = mqtt.Client("screen-renderer")
            self.mqtt_client.on_connect = self._on_connect
            self.mqtt_client.on_message = self._on_message
        else:
            self.mqtt_client = None

    def _init_pygame(self):
        """Initialize pygame display"""
        pygame.init()

        if self.fullscreen:
            self.screen = pygame.display.set_mode(
                (self.width, self.height),
                pygame.FULLSCREEN
            )
        else:
            self.screen = pygame.display.set_mode((self.width, self.height))

        pygame.display.set_caption("BlackRoad Pi Screen")
        self.clock = pygame.time.Clock()

        # Load fonts
        try:
            self.font = pygame.font.Font(None, 36)
            self.font_large = pygame.font.Font(None, 72)
        except:
            self.font = pygame.font.SysFont('monospace', 24)
            self.font_large = pygame.font.SysFont('monospace', 48)

        # Hide mouse cursor in fullscreen
        if self.fullscreen:
            pygame.mouse.set_visible(False)

    def _on_connect(self, client, userdata, flags, rc):
        """MQTT connection callback"""
        print(f"✅ Connected to MQTT broker at {self.mqtt_broker}:{self.mqtt_port}")

        topics = [
            "system/hologram/text",
            "system/panel/status",
            "agent/output",
            "screen/command"
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
        """Route message to appropriate display mode"""

        if topic == "system/hologram/text":
            self.mode = DisplayMode.HOLOGRAM
            message = Message(
                text=payload,
                color=self.CYAN,
                timestamp=time.time(),
                duration=5.0
            )
            self.messages.put(message)

        elif topic == "system/panel/status":
            self.mode = DisplayMode.STATUS
            try:
                data = json.loads(payload)
                status = data.get("status", "info").lower()
                text = data.get("message", status.upper())

                color_map = {
                    "ok": self.GREEN,
                    "success": self.GREEN,
                    "warning": self.ORANGE,
                    "error": self.RED,
                    "info": self.BLUE,
                }
                color = color_map.get(status, self.WHITE)

                message = Message(
                    text=text,
                    color=color,
                    timestamp=time.time(),
                    duration=10.0
                )
                self.messages.put(message)
            except json.JSONDecodeError:
                pass

        elif topic == "agent/output":
            self.mode = DisplayMode.SCROLL
            message = Message(
                text=payload,
                color=self.GREEN,
                timestamp=time.time(),
                duration=float('inf')  # Stays until replaced
            )
            self.scroll_messages.append(message)
            if len(self.scroll_messages) > 10:  # Keep last 10
                self.scroll_messages.pop(0)

        elif topic == "screen/command":
            try:
                data = json.loads(payload)
                command = data.get("command")
                if command == "clear":
                    self.scroll_messages.clear()
                    self.current_message = None
                elif command == "mode":
                    mode_str = data.get("mode", "hologram")
                    try:
                        self.mode = DisplayMode(mode_str)
                    except ValueError:
                        pass
            except json.JSONDecodeError:
                pass

    def _render_hologram(self):
        """Render holographic text effect"""
        if not self.current_message:
            return

        # Pulsing background
        pulse = abs((time.time() * 2) % 2 - 1)  # 0->1->0
        bg_intensity = int(20 * pulse)
        self.screen.fill((bg_intensity, bg_intensity, bg_intensity))

        # Render text with glow effect
        text = self.current_message.text
        color = self.current_message.color

        # Multiple passes for glow
        for offset in [4, 2, 0]:
            alpha = 255 - (offset * 40)
            glow_color = tuple(int(c * alpha / 255) for c in color)

            text_surface = self.font_large.render(text, True, glow_color)
            text_rect = text_surface.get_rect(
                center=(self.width // 2 + offset, self.height // 2)
            )
            self.screen.blit(text_surface, text_rect)

        # Scanline effect
        for y in range(0, self.height, 4):
            pygame.draw.line(
                self.screen,
                (0, 0, 0),
                (0, y),
                (self.width, y),
                1
            )

    def _render_status(self):
        """Render status panel"""
        if not self.current_message:
            return

        self.screen.fill(self.BLACK)

        # Status bar at top
        bar_height = 100
        pygame.draw.rect(
            self.screen,
            self.current_message.color,
            (0, 0, self.width, bar_height)
        )

        # Status text
        text_surface = self.font_large.render(
            self.current_message.text,
            True,
            self.BLACK
        )
        text_rect = text_surface.get_rect(center=(self.width // 2, bar_height // 2))
        self.screen.blit(text_surface, text_rect)

        # Timestamp
        timestamp_text = time.strftime("%H:%M:%S")
        timestamp_surface = self.font.render(timestamp_text, True, self.WHITE)
        timestamp_rect = timestamp_surface.get_rect(
            center=(self.width // 2, self.height - 50)
        )
        self.screen.blit(timestamp_surface, timestamp_rect)

    def _render_scroll(self):
        """Render scrolling messages"""
        self.screen.fill(self.BLACK)

        # Title
        title_surface = self.font_large.render("Agent Output", True, self.CYAN)
        title_rect = title_surface.get_rect(center=(self.width // 2, 50))
        self.screen.blit(title_surface, title_rect)

        # Messages
        y = 120
        for message in self.scroll_messages[-8:]:  # Last 8 messages
            text_surface = self.font.render(message.text, True, message.color)
            self.screen.blit(text_surface, (20, y))
            y += 40

    def _render_dashboard(self):
        """Render system dashboard"""
        self.screen.fill(self.BLACK)

        # Title
        title_surface = self.font_large.render("BlackRoad Prism", True, self.GREEN)
        title_rect = title_surface.get_rect(center=(self.width // 2, 50))
        self.screen.blit(title_surface, title_rect)

        # Stats (placeholder)
        stats = [
            f"Time: {time.strftime('%H:%M:%S')}",
            f"Mode: {self.mode.value}",
            f"Messages: {self.messages.qsize()}",
        ]

        y = 150
        for stat in stats:
            stat_surface = self.font.render(stat, True, self.WHITE)
            self.screen.blit(stat_surface, (50, y))
            y += 50

    def render(self):
        """Main render loop"""
        if not PYGAME_AVAILABLE:
            print("❌ pygame not available")
            return

        # Update current message
        try:
            new_message = self.messages.get_nowait()
            self.current_message = new_message
        except queue.Empty:
            pass

        # Check if current message expired
        if self.current_message:
            age = time.time() - self.current_message.timestamp
            if age > self.current_message.duration:
                self.current_message = None

        # Render based on mode
        if self.mode == DisplayMode.HOLOGRAM:
            self._render_hologram()
        elif self.mode == DisplayMode.STATUS:
            self._render_status()
        elif self.mode == DisplayMode.SCROLL:
            self._render_scroll()
        elif self.mode == DisplayMode.DASHBOARD:
            self._render_dashboard()

        pygame.display.flip()

    def start(self):
        """Start the screen renderer"""
        print("=" * 60)
        print("🖥️  Pi Screen Renderer - MQTT Message Visualization")
        print("=" * 60)
        print(f"Display: {self.width}x{self.height}")
        print(f"MQTT Broker: {self.mqtt_broker}:{self.mqtt_port}")
        print(f"Fullscreen: {self.fullscreen}")
        print()

        self.running = True

        # Connect to MQTT
        if self.mqtt_client:
            try:
                self.mqtt_client.connect(self.mqtt_broker, self.mqtt_port, 60)
                self.mqtt_client.loop_start()
            except Exception as e:
                print(f"❌ Failed to connect to MQTT broker: {e}")
                print("   Running in standalone mode...")

        if not PYGAME_AVAILABLE:
            print("❌ pygame not available. Cannot render.")
            return

        # Main loop
        print("✅ Screen renderer running. Press ESC or Q to quit.")
        print()

        try:
            while self.running:
                # Handle events
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        self.running = False
                    elif event.type == pygame.KEYDOWN:
                        if event.key in [pygame.K_ESCAPE, pygame.K_q]:
                            self.running = False

                # Render frame
                self.render()

                # Limit framerate
                self.clock.tick(30)

        except KeyboardInterrupt:
            print("\n\n⏸️  Shutting down screen renderer...")

        finally:
            self.stop()

    def stop(self):
        """Stop the screen renderer"""
        self.running = False
        if self.mqtt_client:
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()
        if PYGAME_AVAILABLE:
            pygame.quit()
        print("✅ Screen renderer stopped")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Pi Screen Renderer")
    parser.add_argument("--width", type=int, default=800, help="Screen width")
    parser.add_argument("--height", type=int, default=480, help="Screen height")
    parser.add_argument("--mqtt-broker", default="localhost", help="MQTT broker host")
    parser.add_argument("--mqtt-port", type=int, default=1883, help="MQTT broker port")
    parser.add_argument("--fullscreen", action="store_true", help="Run in fullscreen")
    parser.add_argument("--test", action="store_true", help="Test mode (no MQTT)")

    args = parser.parse_args()

    if args.test:
        print("🧪 Test Mode - Press ESC to exit")
        renderer = ScreenRenderer(
            width=args.width,
            height=args.height,
            mqtt_broker=None,
            fullscreen=args.fullscreen
        )

        # Add test messages
        test_messages = [
            Message("BlackRoad Prism Console", renderer.CYAN, time.time(), 3.0),
            Message("System Online", renderer.GREEN, time.time() + 3, 3.0),
            Message("Agents Ready", renderer.BLUE, time.time() + 6, 3.0),
        ]

        for msg in test_messages:
            renderer.messages.put(msg)

        renderer.start()
    else:
        renderer = ScreenRenderer(
            width=args.width,
            height=args.height,
            mqtt_broker=args.mqtt_broker,
            mqtt_port=args.mqtt_port,
            fullscreen=args.fullscreen
        )
        renderer.start()


if __name__ == "__main__":
    main()
