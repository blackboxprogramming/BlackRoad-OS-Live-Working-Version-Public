"""
BlackRoad Pixel City - NPC Entity
"""
import pygame
import random
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.colors import *
from utils.config import NPC_SPEED


class NPC:
    """Represents an NPC character"""
    
    def __init__(self, x, y, npc_type="trainer"):
        self.x = x
        self.y = y
        self.type = npc_type
        self.direction = random.choice(['up', 'down', 'left', 'right'])
        self.move_counter = 0
        self.move_delay = random.randint(30, 90)
        self.walk_cycle = 0
        
        # Color customization
        if npc_type == "trainer":
            self.shirt_color = TRAINER_RED
        elif npc_type == "ace_trainer":
            self.shirt_color = TRAINER_BLUE
        else:
            self.shirt_color = NPC_BLUE
    
    def update(self, bounds_width, bounds_height):
        """Update NPC movement"""
        self.move_counter += 1
        self.walk_cycle = (self.walk_cycle + 0.2) % 4
        
        if self.move_counter > self.move_delay:
            self.move_counter = 0
            self.move_delay = random.randint(30, 90)
            
            # Random direction change
            if random.random() < 0.3:
                self.direction = random.choice(['up', 'down', 'left', 'right'])
            
            # Move
            if self.direction == 'up':
                self.y -= NPC_SPEED
            elif self.direction == 'down':
                self.y += NPC_SPEED
            elif self.direction == 'left':
                self.x -= NPC_SPEED
            elif self.direction == 'right':
                self.x += NPC_SPEED
            
            # Keep in bounds
            self.x = max(50, min(bounds_width - 50, self.x))
            self.y = max(50, min(bounds_height - 50, self.y))
    
    def draw(self, surface):
        """Draw the NPC"""
        # Walking animation offset
        walk_offset = int(self.walk_cycle // 2) - 1
        
        # Head
        pygame.draw.circle(surface, NPC_SKIN, (self.x, self.y), 6)
        pygame.draw.circle(surface, (0, 0, 0), (self.x, self.y), 6, 1)
        
        # Eyes
        if self.direction == 'down':
            pygame.draw.circle(surface, (0, 0, 0), (self.x - 2, self.y), 1)
            pygame.draw.circle(surface, (0, 0, 0), (self.x + 2, self.y), 1)
        
        # Body
        pygame.draw.rect(surface, self.shirt_color, 
                        (self.x - 4, self.y + 6, 8, 10))
        pygame.draw.rect(surface, (0, 0, 0), 
                        (self.x - 4, self.y + 6, 8, 10), 1)
        
        # Arms
        arm_angle = walk_offset * 5
        left_arm_end = (self.x - 8, self.y + 12 + walk_offset)
        right_arm_end = (self.x + 8, self.y + 12 - walk_offset)
        
        pygame.draw.line(surface, NPC_SKIN, 
                        (self.x - 4, self.y + 8), left_arm_end, 3)
        pygame.draw.line(surface, NPC_SKIN, 
                        (self.x + 4, self.y + 8), right_arm_end, 3)
        
        # Legs (walking animation)
        left_leg_y = self.y + 22 + walk_offset
        right_leg_y = self.y + 22 - walk_offset
        
        pygame.draw.line(surface, NPC_CLOTHES_DARK, 
                        (self.x - 2, self.y + 16), 
                        (self.x - 3, left_leg_y), 3)
        pygame.draw.line(surface, NPC_CLOTHES_DARK, 
                        (self.x + 2, self.y + 16), 
                        (self.x + 3, right_leg_y), 3)
        
        # Hat for trainers
        if self.type in ["trainer", "ace_trainer"]:
            pygame.draw.rect(surface, TRAINER_RED, 
                            (self.x - 7, self.y - 8, 14, 3))
            pygame.draw.circle(surface, TRAINER_RED, (self.x, self.y - 6), 5)
