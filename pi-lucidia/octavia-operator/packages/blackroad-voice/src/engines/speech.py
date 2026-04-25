"""
BlackRoad Voice - Speech Recognition & TTS
"""
import sys
import re
import subprocess
from typing import Optional

import speech_recognition as sr
from rich.console import Console

console = Console()


class VoiceRecognizer:
    """Voice recognition with Whisper + Google fallback."""

    def __init__(self, whisper_model: str = "base"):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.whisper_model = whisper_model

        with self.microphone as source:
            console.print("[dim]Calibrating mic...[/dim]")
            self.recognizer.adjust_for_ambient_noise(source, duration=1)
            self.recognizer.energy_threshold = max(100, self.recognizer.energy_threshold * 0.5)
            self.recognizer.dynamic_energy_threshold = True
            self.recognizer.pause_threshold = 0.8

    def listen(self) -> Optional[str]:
        """Listen for speech, return text."""
        with self.microphone as source:
            try:
                console.print("[cyan]🎤 Listening...[/cyan]", end="\r")
                audio = self.recognizer.listen(source, timeout=10, phrase_time_limit=30)
                console.print("[yellow]🔄 Processing...[/yellow]", end="\r")

                try:
                    text = self.recognizer.recognize_whisper(audio, model=self.whisper_model)
                except:
                    text = self.recognizer.recognize_google(audio)

                console.print(" " * 40, end="\r")
                return text.strip()
            except (sr.WaitTimeoutError, sr.UnknownValueError):
                console.print(" " * 40, end="\r")
                return None
            except Exception as e:
                console.print(f"[red]Audio error: {e}[/red]")
                return None


class TextToSpeech:
    """TTS using macOS say or espeak."""

    def __init__(self, voice: str = "Samantha", rate: int = 210, enabled: bool = True):
        self.voice = voice
        self.rate = rate
        self.enabled = enabled
        self.process = None
        self.is_macos = sys.platform == "darwin"

    def speak(self, text: str, blocking: bool = False):
        if not self.enabled:
            return

        text = self._clean(text)
        if not text:
            return

        self.stop()

        if self.is_macos:
            self.process = subprocess.Popen(
                ["say", "-v", self.voice, "-r", str(self.rate), text],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
            )
        else:
            self.process = subprocess.Popen(
                ["espeak", "-s", "180", text],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
            )

        if blocking and self.process:
            self.process.wait()

    def stop(self):
        if self.process:
            self.process.terminate()
            self.process = None

    def toggle(self) -> bool:
        self.enabled = not self.enabled
        return self.enabled

    def _clean(self, text: str) -> str:
        text = re.sub(r'```[\s\S]*?```', ' code block ', text)
        text = re.sub(r'`[^`]+`', '', text)
        text = re.sub(r'[*_#]', '', text)
        text = re.sub(r'<tool[^>]*>[\s\S]*?</tool>', '', text)
        text = re.sub(r'https?://\S+', 'link', text)
        text = re.sub(r'[─═╔╗╚╝║┌┐└┘├┤┬┴┼━]', '', text)
        return ' '.join(text.split())[:600]
