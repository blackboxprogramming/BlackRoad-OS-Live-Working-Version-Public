# Changelog

All notable changes to BlackRoad Pixel City will be documented in this file.

## [2.2.0] - 2026-02-03 🎨✨

### ✨ VISUAL ENHANCEMENT UPDATE - "From Bad to Great"

#### Major Visual Overhaul
- 🎨 Complete Pokemon sprite redesign with professional pixel art quality
- 🎨 Enhanced player character with Ash-style trainer design  
- 🎨 Improved grass rendering with individual blade animation
- 🎨 Expanded color palette to 60+ Pokemon Gen 1 accurate colors
- 🎨 Added shadows to all sprites with alpha blending
- 🎨 Added highlights and shine effects throughout

#### Pokemon Sprites - Professional Quality
- **Pikachu**: Gradient shading, rosy cheeks, lightning tail, expressive eyes with shine
- **Bulbasaur**: Multiple green shades, detailed bulb spots, red eyes, proper proportions
- **Charmander**: Animated 3-layer tail flame, cream belly, orange gradient
- **Squirtle**: Hexagonal shell pattern, curly tail, brown eyes, blue gradient

#### Player Character - Ash Style
- Detailed red cap with Pokeball logo
- Walking animation with proper arm/leg movement
- Directional eyes, blue shirt, black shoes
- Gray backpack, proper shadows

#### Environment Polish
- Individual grass blades with sway animation
- Sparkle particles when rustling grass
- Soft shadows under all characters
- 3-layer grass rendering for depth

### Changed
- `pokemon.py` - Completely redesigned all 4 Pokemon sprites (250+ lines)
- `player.py` - Enhanced trainer sprite (120+ lines)
- `grass.py` - Improved rendering (80+ lines)
- `colors.py` - Expanded to 60+ colors

## [2.1.0] - 2026-02-03 🎮⚡

### Added - POKEMON RPG MECHANICS!
- **Player Character**: Controllable trainer with WASD/Arrow keys
- **Tall Grass System**: 4 grass patches that rustle when walked through
- **Wild Pokemon Encounters**: Random encounters in tall grass
- **Battle System**: Full battle UI with menu (FIGHT, BAG, POKEMON, RUN)
- **Pokedex**: Tracks seen and caught Pokemon
- **Pokemon Team**: Start with Pikachu, catch up to 6 Pokemon
- **Dialog System**: Pokemon-style text boxes with character-by-character reveal
- **Interactive Buildings**: Pokemon Center (healing), Poke Mart (shopping), Houses
- **NPC Interactions**: Talk to trainers and citizens
- **6 Pokemon Species**: Pikachu, Bulbasaur, Charmander, Squirtle, Rattata, Pidgey
- **Catch Mechanics**: 50% catch rate when using FIGHT
- **Keyboard Controls**: P for Pokedex, T for Team, SPACE/ENTER for interactions

### Changed
- Game mode system (explore, battle, dialog)
- Reduced roaming wild Pokemon (now found in grass)
- Updated controls for RPG gameplay
- Enhanced player sprite with Ash's cap

### Technical
- Added player.py module
- Added grass.py for encounters
- Added ui.py for dialog and battles
- Implemented game state management

## [2.0.0] - 2026-02-03

### Added
- Complete project restructuring with modular architecture
- New Pokemon species: Charmander and Squirtle
- Enhanced building types (shops, improved Pokemon Center)
- Tree swaying animation
- Animated water with ripples
- Walking animation for NPCs
- Sparkle effects for Pokemon
- Building shadows
- Configurable game settings via config.py
- Color palette system
- FPS toggle (press F)
- Spawn Pokemon on demand (press SPACE)
- Crosswalk at road intersection
- Multiple building styles
- Varied tree sizes
- Enhanced NPC types (trainers, ace trainers)
- Comprehensive documentation
- Setup.py for easy installation
- Development guide
- MIT License

### Changed
- Refactored code into entities and utils modules
- Improved hop animation for Pokemon
- Enhanced building details (windows, doors, roofs)
- Better color scheme with more variety
- Optimized rendering pipeline
- More natural movement patterns

### Fixed
- Collision bounds for NPCs and Pokemon
- Animation timing consistency
- Performance optimization

## [1.0.0] - 2025-12-01

### Added
- Initial release
- Basic city layout
- Pikachu and Bulbasaur
- Simple buildings
- NPC movement
- Basic roads
