# Contributing to BlackRoad Pixel City

Thank you for your interest in contributing! 🎮

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Python version, Pygame version)
- Screenshots if applicable

### Suggesting Features

We love new ideas! Please create an issue with:
- Clear description of the feature
- Use case / why it's needed
- Possible implementation approach
- Mockups or examples if applicable

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/blackroad-os/blackroad-pixel-city.git
   cd blackroad-pixel-city
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed
   - Test your changes thoroughly

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```
   
   Commit message format:
   - `feat: Add new Pokemon species`
   - `fix: Correct collision detection`
   - `docs: Update README`
   - `refactor: Improve building rendering`
   - `perf: Optimize animation loop`

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide clear description
   - Reference related issues
   - Include screenshots/GIFs for visual changes

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/blackroad-pixel-city.git
cd blackroad-pixel-city

# Install dependencies
pip install -r requirements.txt

# Run the game
python src/pixel_city.py
```

## Code Style

- Follow PEP 8
- Use meaningful variable names
- Add docstrings to classes and functions
- Keep functions focused and small
- Use type hints where helpful

Example:
```python
def calculate_position(x: int, y: int, speed: float) -> tuple[int, int]:
    """
    Calculate new position based on speed.
    
    Args:
        x: Current x coordinate
        y: Current y coordinate
        speed: Movement speed
        
    Returns:
        Tuple of new (x, y) coordinates
    """
    return x + speed, y + speed
```

## Adding New Content

### New Pokemon
1. Add colors to `src/utils/colors.py`
2. Create drawing method in `src/entities/pokemon.py`
3. Update species list in `src/pixel_city.py`

### New Buildings
1. Add type to `src/entities/building.py`
2. Create detail method
3. Instantiate in city initialization

### New Features
1. Discuss in an issue first for major features
2. Keep changes focused
3. Update documentation
4. Add configuration options if needed

## Testing

Before submitting:
- [ ] Game runs without errors
- [ ] No performance regressions
- [ ] New features work as expected
- [ ] Existing features still work
- [ ] Documentation updated
- [ ] Code follows style guide

## Questions?

Feel free to:
- Open an issue for discussion
- Join our community chat
- Email: contact@blackroad.io

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Recognition

Contributors will be added to:
- CONTRIBUTORS.md file
- Release notes
- Project credits

Thank you for making BlackRoad Pixel City better! 🌟
