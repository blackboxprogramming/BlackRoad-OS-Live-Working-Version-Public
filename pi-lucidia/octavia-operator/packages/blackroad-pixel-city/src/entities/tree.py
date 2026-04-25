"""
BlackRoad Pixel City - Tree Entity
"""
import pygame
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.colors import *


class Tree:
    """Represents a tree in the pixel city"""
    
    def __init__(self, x, y, size="medium"):
        self.x = x
        self.y = y
        self.size = size
        self.sway = 0
        
    def update(self, frame_count):
        """Gentle swaying animation"""
        import math
        self.sway = math.sin(frame_count * 0.02 + self.x * 0.01) * 2
    
    def draw(self, surface):
        """Draw the tree"""
        sway_x = int(self.sway)
        
        if self.size == "small":
            trunk_width, trunk_height = 6, 12
            leaf_radius = 6
        elif self.size == "large":
            trunk_width, trunk_height = 10, 20
            leaf_radius = 10
        else:  # medium
            trunk_width, trunk_height = 8, 16
            leaf_radius = 8
        
        # Trunk
        pygame.draw.rect(surface, TREE_TRUNK, 
                        (self.x + sway_x, self.y, trunk_width, trunk_height))
        pygame.draw.rect(surface, (0, 0, 0), 
                        (self.x + sway_x, self.y, trunk_width, trunk_height), 1)
        
        # Leaves (3 circles for fullness)
        center_x = self.x + trunk_width // 2
        pygame.draw.circle(surface, TREE_GREEN, 
                          (center_x + sway_x, self.y - 4), leaf_radius)
        pygame.draw.circle(surface, TREE_DARK_GREEN, 
                          (center_x - 3 + sway_x, self.y + 2), leaf_radius - 1)
        pygame.draw.circle(surface, TREE_GREEN, 
                          (center_x + 3 + sway_x, self.y + 2), leaf_radius - 1)
        
        # Outline on main leaves
        pygame.draw.circle(surface, (0, 100, 0), 
                          (center_x + sway_x, self.y - 4), leaf_radius, 1)
