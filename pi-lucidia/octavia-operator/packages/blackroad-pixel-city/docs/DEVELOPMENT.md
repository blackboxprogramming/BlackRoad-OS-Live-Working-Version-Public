# Development Guide

## Architecture

BlackRoad Pixel City follows a modular, object-oriented design:

```
src/
├── pixel_city.py          # Main game loop and orchestration
├── entities/              # Game entities (sprites/objects)
│   ├── building.py       # Building structures
│   ├── tree.py          # Trees and vegetation
│   ├── npc.py           # Non-player characters
│   └── pokemon.py       # Pokemon sprites
└── utils/                # Utilities and configuration
    ├── colors.py        # Color palette definitions
    └── config.py        # Game settings
```

## Adding New Features

### Adding a New Pokemon Species

1. Open `src/entities/pokemon.py`
2. Add color constants to `src/utils/colors.py`:
   ```python
   EEVEE_BROWN = (205, 133, 63)
   ```
3. Create a new drawing method in the `Pokemon` class:
   ```python
   def _draw_eevee(self, surface, hop_offset):
       # Your drawing code here
       pass
   ```
4. Add to the species check in `draw()` method
5. Spawn in `src/pixel_city.py`:
   ```python
   Pokemon(x, y, "eevee")
   ```

### Adding New Building Types

1. Open `src/entities/building.py`
2. Add a new building type method:
   ```python
   def _draw_gym_details(self, surface):
       # Draw gym-specific features
       pass
   ```
3. Add case to the `draw()` method
4. Instantiate in `pixel_city.py`:
   ```python
   Building(x, y, width, height, color, "gym")
   ```

### Customizing Colors

Edit `src/utils/colors.py` to change the color scheme:

```python
GRASS_GREEN = (34, 139, 34)  # Change to your preference
SKY_BLUE = (135, 206, 250)
```

## Configuration

All game settings are in `src/utils/config.py`:

- `FPS`: Frame rate (default: 60)
- `SCREEN_WIDTH/HEIGHT`: Window dimensions
- `MAX_NPCS/MAX_POKEMON`: Entity limits
- `NPC_SPEED/POKEMON_SPEED`: Movement speeds
- `ENABLE_SHADOWS`: Toggle shadow rendering
- `SHOW_FPS`: Display FPS counter

## Testing

### Manual Testing
```bash
python src/pixel_city.py
```

### Performance Testing
Press `F` during gameplay to toggle FPS counter.

### Adding Entities
Press `SPACE` to spawn random Pokemon while running.

## Code Style

- Follow PEP 8 guidelines
- Use descriptive variable names
- Document classes and complex methods
- Keep methods focused and small
- Use type hints where helpful

## Common Tasks

### Adjusting Animation Speed
```python
# In config.py
POKEMON_HOP_SPEED = 0.3  # Lower = slower
WATER_ANIMATION_SPEED = 0.1
```

### Changing Movement Patterns
```python
# In npc.py or pokemon.py, adjust:
self.move_delay = random.randint(30, 90)  # Frames between moves
```

### Adding Weather Effects
Create a new module `src/effects/weather.py`:
```python
class Rain:
    def __init__(self):
        self.drops = []
    
    def update(self):
        # Add raindrop logic
        pass
    
    def draw(self, surface):
        # Draw raindrops
        pass
```

## Debugging

- Enable FPS counter with `F` key
- Check console for Python errors
- Use print statements in update loops (sparingly)
- Verify pygame version: `python -c "import pygame; print(pygame.version.ver)"`

## Performance Tips

- Limit the number of entities (see MAX_* in config.py)
- Use dirty rect updating for large scenes
- Profile with cProfile if needed
- Reduce shadow rendering if slow (ENABLE_SHADOWS = False)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation
5. Submit PR with clear description

## Resources

- [Pygame Documentation](https://www.pygame.org/docs/)
- [Python Tutorial](https://docs.python.org/3/tutorial/)
- [Pixel Art Tutorials](https://www.pixilart.com/tutorials)
