"""
BlackRoad Pixel City - Building Entity
"""
import pygame
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.colors import *


class Building:
    """Represents a building in the pixel city"""
    
    def __init__(self, x, y, width, height, color, building_type="house"):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.color = color
        self.type = building_type
        self.roof_style = "triangle"
        
    def draw(self, surface):
        """Draw building using sprite"""
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(__file__)))
        from utils.sprites import get_sprite
        
        sprite = get_sprite("building", width_tiles=self.width//16, height_tiles=self.height//16, color=self.color)
        surface.blit(sprite, (self.x, self.y))
    
    def _draw_house_windows(self, surface):
        window_size = 8
        pygame.draw.rect(surface, WINDOW_BLUE, 
                        (self.x + 10, self.y + 15, window_size, window_size))
        pygame.draw.rect(surface, (0, 0, 0), 
                        (self.x + 10, self.y + 15, window_size, window_size), 1)
        
        pygame.draw.rect(surface, WINDOW_BLUE, 
                        (self.x + self.width - 18, self.y + 15, window_size, window_size))
        pygame.draw.rect(surface, (0, 0, 0), 
                        (self.x + self.width - 18, self.y + 15, window_size, window_size), 1)
    
    def _draw_pokecenter_details(self, surface):
        # Large windows
        pygame.draw.rect(surface, WINDOW_BLUE, (self.x + 8, self.y + 12, 12, 16))
        pygame.draw.rect(surface, WINDOW_BLUE, (self.x + self.width - 20, self.y + 12, 12, 16))
        
        # Red cross emblem
        cross_size = 14
        center_x = self.x + self.width // 2
        center_y = self.y + 20
        
        pygame.draw.circle(surface, POKEBALL_WHITE, (center_x, center_y), cross_size // 2 + 2)
        pygame.draw.rect(surface, POKEBALL_RED, 
                        (center_x - 2, center_y - cross_size // 2, 4, cross_size))
        pygame.draw.rect(surface, POKEBALL_RED, 
                        (center_x - cross_size // 2, center_y - 2, cross_size, 4))
    
    def _draw_shop_windows(self, surface):
        window_height = 16
        window_width = self.width - 24
        pygame.draw.rect(surface, WINDOW_BLUE, (self.x + 12, self.y + 15, window_width, window_height))
        pygame.draw.rect(surface, (0, 0, 0), (self.x + 12, self.y + 15, window_width, window_height), 2)
    
    def _draw_door(self, surface):
        door_width = 14
        door_height = 20
        door_x = self.x + self.width // 2 - door_width // 2
        door_y = self.y + self.height - door_height
        
        pygame.draw.rect(surface, DOOR_BROWN, (door_x, door_y, door_width, door_height))
        pygame.draw.rect(surface, (0, 0, 0), (door_x, door_y, door_width, door_height), 1)
        pygame.draw.circle(surface, (200, 180, 0), (door_x + door_width - 4, door_y + door_height // 2), 2)
