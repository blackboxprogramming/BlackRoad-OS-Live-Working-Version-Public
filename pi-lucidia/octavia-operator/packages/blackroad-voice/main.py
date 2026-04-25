#!/usr/bin/env python3
"""
BlackRoad Voice - Entry Point
Run: python3 ~/blackroad-voice/main.py
Or:  blackroad (via ~/bin/blackroad launcher)
"""
import sys
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))

from src.cli import main

if __name__ == "__main__":
    main()
