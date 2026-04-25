"""
Sprite generation system for BlackRoad Pixel City
Creates proper pixel art sprites instead of drawn shapes
"""
import pygame

def create_pikachu_sprite():
    """Generate a proper Pikachu sprite (16x16)"""
    sprite = pygame.Surface((16, 16), pygame.SRCALPHA)
    
    # Pikachu yellow body
    yellow = (255, 220, 0)
    brown = (139, 69, 19)
    black = (0, 0, 0)
    red = (255, 0, 0)
    
    # Body outline
    pixels = [
        (6,2), (7,2), (8,2), (9,2),
        (5,3), (6,3), (7,3), (8,3), (9,3), (10,3),
        (4,4), (5,4), (6,4), (7,4), (8,4), (9,4), (10,4), (11,4),
        (4,5), (5,5), (6,5), (7,5), (8,5), (9,5), (10,5), (11,5),
        (3,6), (4,6), (5,6), (6,6), (7,6), (8,6), (9,6), (10,6), (11,6), (12,6),
        (3,7), (4,7), (5,7), (6,7), (7,7), (8,7), (9,7), (10,7), (11,7), (12,7),
        (3,8), (4,8), (5,8), (6,8), (7,8), (8,8), (9,8), (10,8), (11,8), (12,8),
        (4,9), (5,9), (6,9), (7,9), (8,9), (9,9), (10,9), (11,9),
        (4,10), (5,10), (6,10), (7,10), (8,10), (9,10), (10,10), (11,10),
        (5,11), (6,11), (7,11), (8,11), (9,11), (10,11),
    ]
    
    for x, y in pixels:
        sprite.set_at((x, y), yellow)
    
    # Ears
    sprite.set_at((4, 2), brown)
    sprite.set_at((5, 2), brown)
    sprite.set_at((10, 2), brown)
    sprite.set_at((11, 2), brown)
    sprite.set_at((4, 3), yellow)
    sprite.set_at((11, 3), yellow)
    
    # Eyes
    sprite.set_at((5, 6), black)
    sprite.set_at((10, 6), black)
    
    # Cheeks
    sprite.set_at((3, 7), red)
    sprite.set_at((12, 7), red)
    
    # Mouth
    sprite.set_at((7, 8), black)
    sprite.set_at((8, 8), black)
    
    return sprite

def create_grass_tile():
    """Generate a grass tile sprite (16x16)"""
    sprite = pygame.Surface((16, 16))
    
    # Base grass color
    grass_base = (80, 200, 80)
    grass_dark = (60, 160, 60)
    grass_light = (100, 220, 100)
    
    sprite.fill(grass_base)
    
    # Add texture
    import random
    random.seed(42)
    for _ in range(20):
        x = random.randint(0, 15)
        y = random.randint(0, 15)
        color = grass_dark if random.random() > 0.5 else grass_light
        sprite.set_at((x, y), color)
    
    return sprite

def create_road_tile():
    """Generate a road tile sprite (16x16)"""
    sprite = pygame.Surface((16, 16))
    
    # Road colors
    road_gray = (128, 128, 128)
    road_dark = (100, 100, 100)
    road_line = (255, 255, 255)
    
    sprite.fill(road_gray)
    
    # Add texture
    for y in range(16):
        if y % 4 == 0:
            for x in range(16):
                sprite.set_at((x, y), road_dark)
    
    # Center line
    if True:  # Could make this conditional
        for y in range(16):
            if y % 4 < 2:
                sprite.set_at((7, y), road_line)
                sprite.set_at((8, y), road_line)
    
    return sprite

def create_player_sprite():
    """Generate player sprite (16x16) - Ash style"""
    sprite = pygame.Surface((16, 16), pygame.SRCALPHA)
    
    # Colors
    skin = (255, 220, 177)
    hat_red = (255, 0, 0)
    shirt_blue = (0, 100, 255)
    pants = (0, 50, 150)
    black = (0, 0, 0)
    
    # Hat
    for x in range(4, 12):
        for y in range(2, 5):
            sprite.set_at((x, y), hat_red)
    
    # Face
    for x in range(5, 11):
        for y in range(5, 8):
            sprite.set_at((x, y), skin)
    
    # Eyes
    sprite.set_at((6, 6), black)
    sprite.set_at((9, 6), black)
    
    # Body
    for x in range(5, 11):
        for y in range(8, 12):
            sprite.set_at((x, y), shirt_blue)
    
    # Legs
    for x in range(5, 7):
        for y in range(12, 16):
            sprite.set_at((x, y), pants)
    for x in range(9, 11):
        for y in range(12, 16):
            sprite.set_at((x, y), pants)
    
    return sprite

def create_building_sprite(width_tiles=4, height_tiles=4, color=(200, 100, 100)):
    """Generate a building sprite"""
    w = width_tiles * 16
    h = height_tiles * 16
    sprite = pygame.Surface((w, h), pygame.SRCALPHA)
    
    # Building body
    for x in range(w):
        for y in range(h):
            sprite.set_at((x, y), color)
    
    # Roof
    roof_color = (139, 69, 19)
    for x in range(w):
        for y in range(min(8, h)):
            sprite.set_at((x, y), roof_color)
    
    # Windows
    window_color = (200, 230, 255)
    if w >= 32 and h >= 32:
        # Left window
        for x in range(6, 10):
            for y in range(16, 24):
                sprite.set_at((x, y), window_color)
        # Right window
        for x in range(w - 10, w - 6):
            for y in range(16, 24):
                sprite.set_at((x, y), window_color)
    
    # Door
    door_color = (101, 67, 33)
    door_x = w // 2 - 4
    for x in range(door_x, door_x + 8):
        for y in range(h - 12, h):
            sprite.set_at((x, y), door_color)
    
    return sprite

# Sprite cache
_sprite_cache = {}

def get_sprite(sprite_name, **kwargs):
    """Get or create a sprite"""
    cache_key = (sprite_name, tuple(sorted(kwargs.items())))
    
    if cache_key not in _sprite_cache:
        if sprite_name == "pikachu":
            _sprite_cache[cache_key] = create_pikachu_sprite()
        elif sprite_name == "grass":
            _sprite_cache[cache_key] = create_grass_tile()
        elif sprite_name == "road":
            _sprite_cache[cache_key] = create_road_tile()
        elif sprite_name == "player":
            _sprite_cache[cache_key] = create_player_sprite()
        elif sprite_name == "building":
            _sprite_cache[cache_key] = create_building_sprite(**kwargs)
        else:
            # Default placeholder
            sprite = pygame.Surface((16, 16))
            sprite.fill((255, 0, 255))
            _sprite_cache[cache_key] = sprite
    
    return _sprite_cache[cache_key]
