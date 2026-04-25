# Quick Reference

## Installation
```bash
pip install pygame
python src/pixel_city.py
```

## Controls
| Key | Action |
|-----|--------|
| ESC | Exit game |
| F | Toggle FPS counter |
| SPACE | Spawn random Pokemon |

## File Structure
```
src/
├── pixel_city.py      # Main game
├── entities/          # Game objects
│   ├── building.py   # Buildings
│   ├── tree.py       # Trees
│   ├── npc.py        # NPCs
│   └── pokemon.py    # Pokemon
└── utils/            # Utilities
    ├── colors.py     # Colors
    └── config.py     # Settings
```

## Quick Customization

### Change Colors
Edit `src/utils/colors.py`:
```python
GRASS_GREEN = (34, 139, 34)
SKY_BLUE = (135, 206, 250)
```

### Adjust Speed
Edit `src/utils/config.py`:
```python
NPC_SPEED = 1
POKEMON_SPEED = 0.5
```

### Add Pokemon
In `src/pixel_city.py`:
```python
Pokemon(x, y, "pikachu")  # or bulbasaur, charmander, squirtle
```

## Available Pokemon
- pikachu
- bulbasaur
- charmander
- squirtle

## Building Types
- house
- pokecenter
- shop

## Tree Sizes
- small
- medium
- large

## NPC Types
- trainer
- ace_trainer
- npc

## Common Tasks

### Run Game
```bash
./run.sh
# or
python src/pixel_city.py
```

### Install as Package
```bash
pip install -e .
pixel-city
```

### Toggle FPS
Press `F` during gameplay

### Spawn Pokemon
Press `SPACE` during gameplay

## Configuration Options

```python
# In src/utils/config.py
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 60
MAX_NPCS = 8
MAX_POKEMON = 6
ENABLE_SHADOWS = True
SHOW_FPS = False
```

## Troubleshooting

### Game won't start
- Check Python version: `python --version` (need 3.8+)
- Install pygame: `pip install pygame`

### Low FPS
- Reduce MAX_NPCS and MAX_POKEMON
- Set ENABLE_SHADOWS = False

### Import errors
- Run from project root
- Check __init__.py files exist

## Links
- [Full Documentation](docs/DEVELOPMENT.md)
- [Features List](docs/FEATURES.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
