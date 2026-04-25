"""
Stardew Valley style house renderer
Creates a beautiful pixel art farmhouse
"""
import pygame

def create_farmhouse_sprite():
    """Generate a beautiful Stardew Valley style farmhouse (128x96 pixels)"""
    width, height = 128, 96
    sprite = pygame.Surface((width, height), pygame.SRCALPHA)
    
    # Color palette - Stardew Valley inspired
    wood_dark = (101, 67, 33)
    wood_light = (139, 90, 43)
    wood_highlight = (160, 106, 66)
    roof_red = (139, 37, 37)
    roof_dark = (100, 20, 20)
    roof_highlight = (180, 50, 50)
    stone_gray = (128, 128, 128)
    stone_dark = (90, 90, 90)
    window_blue = (173, 216, 230)
    window_frame = (80, 50, 30)
    door_brown = (101, 67, 33)
    grass_green = (107, 142, 35)
    chimney_brick = (139, 69, 19)
    
    # Foundation/base stones
    for y in range(70, 96):
        for x in range(10, 118):
            if (x + y) % 3 == 0:
                sprite.set_at((x, y), stone_gray)
            else:
                sprite.set_at((x, y), stone_dark)
    
    # Main house walls (wood planks)
    for y in range(35, 70):
        for x in range(15, 113):
            # Vertical wood plank pattern
            if x % 8 < 6:
                sprite.set_at((x, y), wood_light)
            else:
                sprite.set_at((x, y), wood_dark)
            # Add some horizontal grain
            if y % 4 == 0:
                sprite.set_at((x, y), wood_highlight)
    
    # Roof (overlapping shingles)
    roof_y = 35
    for row in range(15):
        y = roof_y - row * 2
        for x in range(15 - row, 113 + row, 8):
            # Shingle pattern
            for sy in range(3):
                for sx in range(7):
                    px = x + sx
                    py = y + sy
                    if 0 <= px < width and 0 <= py < height:
                        if sy == 0:
                            sprite.set_at((px, py), roof_highlight)
                        elif sy == 2:
                            sprite.set_at((px, py), roof_dark)
                        else:
                            sprite.set_at((px, py), roof_red)
    
    # Chimney (brick)
    for y in range(8, 30):
        for x in range(85, 95):
            # Brick pattern
            if (x // 2 + y // 3) % 2 == 0:
                sprite.set_at((x, y), chimney_brick)
            else:
                sprite.set_at((x, y), (120, 60, 30))
    
    # Smoke from chimney
    smoke_gray = (200, 200, 200, 150)
    for i in range(5):
        pygame.draw.circle(sprite, smoke_gray, (90 + i*2, 5 + i*3), 3)
    
    # Front door (centered)
    door_x = 55
    door_y = 50
    for y in range(door_y, door_y + 20):
        for x in range(door_x, door_x + 18):
            sprite.set_at((x, y), door_brown)
            # Door panels
            if 2 < x - door_x < 8 and 2 < y - door_y < 8:
                sprite.set_at((x, y), wood_dark)
            if 10 < x - door_x < 16 and 2 < y - door_y < 8:
                sprite.set_at((x, y), wood_dark)
            if 2 < x - door_x < 8 and 11 < y - door_y < 17:
                sprite.set_at((x, y), wood_dark)
            if 10 < x - door_x < 16 and 11 < y - door_y < 17:
                sprite.set_at((x, y), wood_dark)
    
    # Door knob
    pygame.draw.circle(sprite, (255, 215, 0), (door_x + 15, door_y + 10), 2)
    
    # Windows (two on each side of door)
    windows = [
        (25, 45, 15, 15),  # Left window
        (88, 45, 15, 15),  # Right window
        (25, 25, 12, 12),  # Upper left
        (91, 25, 12, 12),  # Upper right
    ]
    
    for wx, wy, ww, wh in windows:
        # Window frame
        for y in range(wy, wy + wh):
            for x in range(wx, wx + ww):
                if x == wx or x == wx + ww - 1 or y == wy or y == wy + wh - 1:
                    sprite.set_at((x, y), window_frame)
                else:
                    sprite.set_at((x, y), window_blue)
        
        # Window cross bars
        mid_x = wx + ww // 2
        mid_y = wy + wh // 2
        for x in range(wx, wx + ww):
            sprite.set_at((x, mid_y), window_frame)
        for y in range(wy, wy + wh):
            sprite.set_at((mid_x, y), window_frame)
        
        # Window shine (top-left)
        sprite.set_at((wx + 2, wy + 2), (255, 255, 255))
        sprite.set_at((wx + 3, wy + 2), (255, 255, 255))
        sprite.set_at((wx + 2, wy + 3), (255, 255, 255))
    
    # Porch/steps
    step_colors = [stone_gray, stone_dark, (110, 110, 110)]
    for i, color in enumerate(step_colors):
        y = 70 + i * 3
        for x in range(45, 83):
            for sy in range(3):
                sprite.set_at((x, y + sy), color)
    
    # Flower boxes under windows
    flowers = [(25, 61), (88, 61)]
    for fx, fy in flowers:
        # Flower box
        for x in range(fx, fx + 15):
            for y in range(fy, fy + 4):
                sprite.set_at((x, y), (139, 90, 43))
        
        # Flowers (red, yellow, pink)
        flower_colors = [(255, 0, 0), (255, 255, 0), (255, 182, 193)]
        for i, color in enumerate(flower_colors):
            flower_x = fx + 3 + i * 5
            pygame.draw.circle(sprite, color, (flower_x, fy - 2), 2)
            # Stem
            sprite.set_at((flower_x, fy), (0, 128, 0))
            sprite.set_at((flower_x, fy + 1), (0, 128, 0))
    
    # Mailbox (left side)
    mailbox_x, mailbox_y = 5, 75
    # Post
    for y in range(mailbox_y, 90):
        sprite.set_at((mailbox_x, y), wood_dark)
    # Box
    for y in range(mailbox_y, mailbox_y + 6):
        for x in range(mailbox_x - 2, mailbox_x + 8):
            sprite.set_at((x, y), (100, 100, 100))
    # Flag
    pygame.draw.rect(sprite, (255, 0, 0), (mailbox_x + 6, mailbox_y + 1, 4, 3))
    
    # Decorative bushes
    bush_green = (34, 139, 34)
    bush_dark = (0, 100, 0)
    bushes = [(8, 65), (120, 65)]
    for bx, by in bushes:
        # Round bush shape
        import math
        for r in range(8):
            for angle in range(0, 360, 20):
                rad = math.radians(angle)
                x = int(bx + r * math.cos(rad))
                y = int(by + r * math.sin(rad) * 0.7)  # Slightly squished
                if 0 <= x < width and 0 <= y < height:
                    color = bush_dark if r < 4 else bush_green
                    sprite.set_at((x, y), color)
    
    return sprite

def draw_stardew_house(surface, x, y):
    """Draw the farmhouse at position"""
    house = create_farmhouse_sprite()
    surface.blit(house, (x, y))

if __name__ == "__main__":
    # Test render
    pygame.init()
    screen = pygame.display.set_mode((800, 600))
    pygame.display.set_caption("Stardew Valley Farmhouse")
    
    clock = pygame.time.Clock()
    running = True
    
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
        
        screen.fill((107, 142, 35))  # Grass green
        draw_stardew_house(screen, 336, 250)
        
        pygame.display.flip()
        clock.tick(60)
    
    pygame.quit()
