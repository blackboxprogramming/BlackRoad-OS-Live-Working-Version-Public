"""
BlackRoad Pixel City - Tall Grass for Pokemon encounters
"""
import pygame
import random
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.colors import *


class TallGrass:
    """Tall grass patches where wild Pokemon appear"""
    
    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.rustle_timer = 0
        self.is_rustling = False
        self.grass_blades = []
        
        # Create individual grass blades
        for i in range(width // 8):
            for j in range(height // 8):
                blade_x = x + i * 8 + random.randint(-2, 2)
                blade_y = y + j * 8 + random.randint(-2, 2)
                self.grass_blades.append((blade_x, blade_y, random.random() * 3.14))
    
    def contains_point(self, x, y):
        """Check if a point is inside the grass"""
        return (self.x <= x <= self.x + self.width and 
                self.y <= y <= self.y + self.height)
    
    def rustle(self):
        """Trigger rustling animation"""
        self.is_rustling = True
        self.rustle_timer = 30
    
    def update(self):
        """Update grass animation"""
        if self.is_rustling:
            self.rustle_timer -= 1
            if self.rustle_timer <= 0:
                self.is_rustling = False
    
    def draw(self, surface):
        """Draw the tall grass with enhanced visuals"""
        import math
        
        # Base grass layer (darker)
        base_color = DARK_GRASS if not self.is_rustling else GRASS_GREEN
        pygame.draw.rect(surface, base_color, (self.x, self.y, self.width, self.height))
        pygame.draw.rect(surface, (40, 80, 40), (self.x, self.y, self.width, self.height), 1)
        
        # Frame for animation
        frame = pygame.time.get_ticks() // 50
        
        # Draw individual grass blades with improved animation
        for blade_x, blade_y, offset in self.grass_blades:
            # Calculate sway
            base_sway = math.sin(frame * 0.1 + offset) * 2
            rustle_sway = random.randint(-4, 4) if self.is_rustling else 0
            total_sway = base_sway + rustle_sway
            
            # Blade positions
            blade_height = 15 + random.randint(-2, 2) if self.is_rustling else 15
            base_pos = (blade_x, blade_y)
            mid_pos = (blade_x + total_sway * 0.5, blade_y - blade_height * 0.6)
            tip_pos = (blade_x + total_sway, blade_y - blade_height)
            
            # Draw blade with gradient (dark to light)
            pygame.draw.line(surface, TREE_DARK_GREEN, base_pos, mid_pos, 3)
            pygame.draw.line(surface, GRASS_TALL, mid_pos, tip_pos, 2)
            pygame.draw.line(surface, GRASS_HIGHLIGHT, mid_pos, tip_pos, 1)
        
        # Add sparkle effects when rustling
        if self.is_rustling and self.rustle_timer % 5 == 0:
            sparkle_x = self.x + random.randint(10, self.width - 10)
            sparkle_y = self.y + random.randint(10, self.height - 10)
            pygame.draw.circle(surface, PIKACHU_YELLOW, (sparkle_x, sparkle_y), 3)
            pygame.draw.circle(surface, TEXT_WHITE, (sparkle_x - 1, sparkle_y - 1), 1)


class WildEncounter:
    """Manages wild Pokemon encounters"""
    
    def __init__(self):
        self.encounter_rate = 0.1  # 10% chance per step in grass
        self.wild_pokemon_species = {
            'pikachu': 20,
            'bulbasaur': 15,
            'charmander': 15,
            'squirtle': 15,
            'rattata': 25,
            'pidgey': 10,
        }
    
    def check_encounter(self):
        """Check if a wild Pokemon appears"""
        if random.random() < self.encounter_rate:
            return self.get_random_pokemon()
        return None
    
    def get_random_pokemon(self):
        """Get a random wild Pokemon based on encounter rates"""
        total = sum(self.wild_pokemon_species.values())
        rand = random.randint(1, total)
        
        current = 0
        for species, rate in self.wild_pokemon_species.items():
            current += rate
            if rand <= current:
                return species
        
        return 'pikachu'
