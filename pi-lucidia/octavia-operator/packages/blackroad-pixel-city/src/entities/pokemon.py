"""
BlackRoad Pixel City - Pokemon Entity
"""
import pygame
import random
import math
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.colors import *
from utils.config import POKEMON_SPEED, POKEMON_HOP_SPEED


class Pokemon:
    """Represents a Pokemon in the city"""
    
    def __init__(self, x, y, species="pikachu"):
        self.x = x
        self.y = y
        self.species = species
        self.direction = random.choice(['up', 'down', 'left', 'right'])
        self.move_counter = 0
        self.move_delay = random.randint(20, 60)
        self.hop = 0
        self.sparkle_timer = random.randint(0, 60)
        
    def update(self, bounds_width, bounds_height):
        """Update Pokemon movement"""
        self.move_counter += 1
        self.hop = (self.hop + POKEMON_HOP_SPEED) % 6.28
        self.sparkle_timer = (self.sparkle_timer + 1) % 120
        
        if self.move_counter > self.move_delay:
            self.move_counter = 0
            self.move_delay = random.randint(20, 60)
            
            # Random direction change
            if random.random() < 0.4:
                self.direction = random.choice(['up', 'down', 'left', 'right'])
            
            # Move
            if self.direction == 'up':
                self.y -= POKEMON_SPEED
            elif self.direction == 'down':
                self.y += POKEMON_SPEED
            elif self.direction == 'left':
                self.x -= POKEMON_SPEED
            elif self.direction == 'right':
                self.x += POKEMON_SPEED
            
            # Keep in bounds (prefer grass areas)
            self.x = max(30, min(bounds_width - 30, self.x))
            self.y = max(30, min(bounds_height - 30, self.y))
    
    def draw(self, surface):
        """Draw Pokemon using sprite"""
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(__file__)))
        from utils.sprites import get_sprite
        
        sprite = get_sprite("pikachu")
        scaled = pygame.transform.scale(sprite, (32, 32))
        
        hop_offset = int(abs(math.sin(self.hop)) * 4)
        surface.blit(scaled, (self.x - 16, self.y - 16 - hop_offset))
    
    def _draw_pikachu(self, surface, hop_offset):
        """Draw Pikachu with enhanced visuals"""
        y = self.y - hop_offset
        
        # Shadow
        shadow = pygame.Surface((20, 8), pygame.SRCALPHA)
        pygame.draw.ellipse(shadow, (0, 0, 0, 60), (0, 0, 20, 8))
        surface.blit(shadow, (self.x - 10, self.y + 8))
        
        # Body (rounder)
        pygame.draw.circle(surface, PIKACHU_YELLOW, (self.x, y), 9)
        pygame.draw.circle(surface, PIKACHU_YELLOW_LIGHT, (self.x - 2, y - 2), 5)
        pygame.draw.circle(surface, PIKACHU_BLACK, (self.x, y), 9, 1)
        
        # Ears (pointy triangles)
        left_ear = [(self.x - 7, y - 7), (self.x - 5, y - 16), (self.x - 3, y - 7)]
        right_ear = [(self.x + 3, y - 7), (self.x + 5, y - 16), (self.x + 7, y - 7)]
        pygame.draw.polygon(surface, PIKACHU_YELLOW, left_ear)
        pygame.draw.polygon(surface, PIKACHU_YELLOW, right_ear)
        pygame.draw.polygon(surface, PIKACHU_BLACK, left_ear, 1)
        pygame.draw.polygon(surface, PIKACHU_BLACK, right_ear, 1)
        
        # Ear tips (black)
        pygame.draw.circle(surface, PIKACHU_BLACK, (self.x - 5, y - 16), 3)
        pygame.draw.circle(surface, PIKACHU_BLACK, (self.x + 5, y - 16), 3)
        
        # Eyes (cute and shiny)
        pygame.draw.circle(surface, PIKACHU_BLACK, (self.x - 3, y - 2), 3)
        pygame.draw.circle(surface, PIKACHU_BLACK, (self.x + 3, y - 2), 3)
        pygame.draw.circle(surface, TEXT_WHITE, (self.x - 2, y - 3), 1)  # Shine
        pygame.draw.circle(surface, TEXT_WHITE, (self.x + 4, y - 3), 1)  # Shine
        
        # Nose (tiny)
        pygame.draw.circle(surface, PIKACHU_BLACK, (self.x, y + 1), 1)
        
        # Cheeks (rosy)
        pygame.draw.circle(surface, PIKACHU_CHEEKS, (self.x - 9, y), 4)
        pygame.draw.circle(surface, PIKACHU_CHEEKS, (self.x + 9, y), 4)
        pygame.draw.circle(surface, (255, 120, 120), (self.x - 9, y), 4, 1)
        pygame.draw.circle(surface, (255, 120, 120), (self.x + 9, y), 4, 1)
        
        # Tail (lightning bolt shape)
        tail_points = [
            (self.x + 7, y + 2),
            (self.x + 11, y - 2),
            (self.x + 9, y + 1),
            (self.x + 13, y - 4),
            (self.x + 10, y),
            (self.x + 9, y + 5)
        ]
        pygame.draw.polygon(surface, PIKACHU_YELLOW, tail_points)
        pygame.draw.polygon(surface, PIKACHU_YELLOW_LIGHT, [(self.x + 9, y - 2), (self.x + 12, y - 4), (self.x + 10, y)])
        pygame.draw.polygon(surface, PIKACHU_BLACK, tail_points, 1)
        
        # Arms (tiny)
        pygame.draw.circle(surface, PIKACHU_YELLOW, (self.x - 8, y + 5), 3)
        pygame.draw.circle(surface, PIKACHU_YELLOW, (self.x + 8, y + 5), 3)
    
    def _draw_bulbasaur(self, surface, hop_offset):
        """Draw Bulbasaur with enhanced visuals"""
        y = self.y - hop_offset
        
        # Shadow
        shadow = pygame.Surface((18, 8), pygame.SRCALPHA)
        pygame.draw.ellipse(shadow, (0, 0, 0, 60), (0, 0, 18, 8))
        surface.blit(shadow, (self.x - 9, self.y + 7))
        
        # Body (lighter belly)
        pygame.draw.circle(surface, BULBASAUR_GREEN, (self.x, y), 8)
        pygame.draw.circle(surface, (120, 220, 150), (self.x, y + 2), 5)  # Lighter belly
        pygame.draw.circle(surface, PIKACHU_BLACK, (self.x, y), 8, 1)
        
        # Bulb on back (detailed)
        bulb_center = (self.x + 2, y - 7)
        pygame.draw.circle(surface, BULBASAUR_DARK, bulb_center, 6)
        pygame.draw.circle(surface, BULBASAUR_GREEN, bulb_center, 6, 1)
        
        # Spots on bulb (dark green triangular pattern)
        pygame.draw.circle(surface, BULBASAUR_SPOTS, (bulb_center[0] - 2, bulb_center[1]), 2)
        pygame.draw.circle(surface, BULBASAUR_SPOTS, (bulb_center[0] + 2, bulb_center[1] - 2), 2)
        pygame.draw.circle(surface, BULBASAUR_SPOTS, (bulb_center[0] + 3, bulb_center[1] + 1), 2)
        pygame.draw.circle(surface, BULBASAUR_SPOTS, (bulb_center[0], bulb_center[1] + 3), 2)
        
        # Eyes (cute and red)
        pygame.draw.circle(surface, (255, 100, 100), (self.x - 3, y - 2), 3)
        pygame.draw.circle(surface, (255, 100, 100), (self.x + 3, y - 2), 3)
        pygame.draw.circle(surface, PIKACHU_BLACK, (self.x - 3, y - 2), 2)
        pygame.draw.circle(surface, PIKACHU_BLACK, (self.x + 3, y - 2), 2)
        pygame.draw.circle(surface, TEXT_WHITE, (self.x - 2, y - 3), 1)  # Shine
        pygame.draw.circle(surface, TEXT_WHITE, (self.x + 4, y - 3), 1)  # Shine
        
        # Mouth (little smile)
        pygame.draw.line(surface, PIKACHU_BLACK, (self.x - 2, y + 2), (self.x + 2, y + 2), 1)
        
        # Legs (stubby)
        pygame.draw.circle(surface, BULBASAUR_DARK, (self.x - 6, y + 7), 3)
        pygame.draw.circle(surface, BULBASAUR_DARK, (self.x + 6, y + 7), 3)
    
    def _draw_charmander(self, surface, hop_offset):
        """Draw Charmander with enhanced visuals"""
        y = self.y - hop_offset
        
        # Shadow
        shadow = pygame.Surface((18, 8), pygame.SRCALPHA)
        pygame.draw.ellipse(shadow, (0, 0, 0, 60), (0, 0, 18, 8))
        surface.blit(shadow, (self.x - 9, self.y + 8))
        
        # Body (orange)
        pygame.draw.circle(surface, CHARMANDER_ORANGE, (self.x, y), 8)
        pygame.draw.circle(surface, CHARMANDER_LIGHT, (self.x - 2, y - 2), 4)  # Highlight
        pygame.draw.circle(surface, PIKACHU_BLACK, (self.x, y), 8, 1)
        
        # Belly (cream colored)
        pygame.draw.circle(surface, CHARMANDER_BELLY, (self.x, y + 2), 6)
        pygame.draw.circle(surface, (240, 200, 140), (self.x, y + 2), 6, 1)
        
        # Eyes (big and cute)
        pygame.draw.circle(surface, TEXT_WHITE, (self.x - 3, y - 2), 3)
        pygame.draw.circle(surface, TEXT_WHITE, (self.x + 3, y - 2), 3)
        pygame.draw.circle(surface, PIKACHU_BLACK, (self.x - 3, y - 1), 2)
        pygame.draw.circle(surface, PIKACHU_BLACK, (self.x + 3, y - 1), 2)
        pygame.draw.circle(surface, TEXT_WHITE, (self.x - 2, y - 3), 1)  # Shine
        pygame.draw.circle(surface, TEXT_WHITE, (self.x + 4, y - 3), 1)
        
        # Snout
        pygame.draw.circle(surface, CHARMANDER_LIGHT, (self.x, y + 2), 3)
        
        # Tail with flame (animated)
        tail_base = (self.x + 9, y + 2)
        pygame.draw.circle(surface, CHARMANDER_ORANGE, tail_base, 3)
        
        # Flame on tail (layered)
        flame_y = y - 2 + int(math.sin(self.hop) * 2)
        pygame.draw.circle(surface, CHARMANDER_FLAME, (self.x + 11, flame_y), 4)
        pygame.draw.circle(surface, (255, 180, 80), (self.x + 11, flame_y - 1), 3)
        pygame.draw.circle(surface, (255, 240, 120), (self.x + 11, flame_y - 2), 2)
        
        # Arms
        pygame.draw.circle(surface, CHARMANDER_ORANGE, (self.x - 7, y + 5), 3)
        pygame.draw.circle(surface, CHARMANDER_ORANGE, (self.x + 7, y + 5), 3)
    
    def _draw_squirtle(self, surface, hop_offset):
        """Draw Squirtle with enhanced visuals"""
        y = self.y - hop_offset
        
        # Shadow
        shadow = pygame.Surface((18, 8), pygame.SRCALPHA)
        pygame.draw.ellipse(shadow, (0, 0, 0, 60), (0, 0, 18, 8))
        surface.blit(shadow, (self.x - 9, self.y + 8))
        
        # Body (blue)
        pygame.draw.circle(surface, SQUIRTLE_BLUE, (self.x, y), 8)
        pygame.draw.circle(surface, SQUIRTLE_LIGHT, (self.x - 2, y - 2), 4)  # Highlight
        pygame.draw.circle(surface, PIKACHU_BLACK, (self.x, y), 8, 1)
        
        # Belly (light)
        pygame.draw.circle(surface, (232, 232, 168), (self.x, y + 2), 6)
        pygame.draw.circle(surface, (216, 216, 152), (self.x, y + 2), 6, 1)
        
        # Shell on back (brown with pattern)
        shell_center = (self.x + 1, y - 6)
        pygame.draw.circle(surface, SQUIRTLE_SHELL, shell_center, 6)
        pygame.draw.circle(surface, SQUIRTLE_SHELL_DARK, shell_center, 5)
        pygame.draw.circle(surface, PIKACHU_BLACK, shell_center, 6, 1)
        
        # Shell pattern (hexagons)
        pygame.draw.circle(surface, (248, 200, 120), shell_center, 3)
        pygame.draw.circle(surface, SQUIRTLE_SHELL_DARK, shell_center, 3, 1)
        
        # Shell edges
        for angle in range(0, 360, 60):
            rad = math.radians(angle)
            px = shell_center[0] + int(math.cos(rad) * 4)
            py = shell_center[1] + int(math.sin(rad) * 4)
            pygame.draw.circle(surface, (200, 152, 88), (px, py), 2)
        
        # Eyes (big and brown)
        pygame.draw.circle(surface, TEXT_WHITE, (self.x - 3, y - 1), 3)
        pygame.draw.circle(surface, TEXT_WHITE, (self.x + 3, y - 1), 3)
        pygame.draw.circle(surface, (120, 72, 40), (self.x - 3, y - 1), 2)
        pygame.draw.circle(surface, (120, 72, 40), (self.x + 3, y - 1), 2)
        pygame.draw.circle(surface, TEXT_WHITE, (self.x - 2, y - 2), 1)  # Shine
        pygame.draw.circle(surface, TEXT_WHITE, (self.x + 4, y - 2), 1)
        
        # Mouth
        pygame.draw.line(surface, PIKACHU_BLACK, (self.x - 2, y + 2), (self.x + 2, y + 2), 1)
        
        # Tail (curly)
        tail_points = [(self.x + 9, y + 3), (self.x + 12, y + 1), (self.x + 13, y + 4)]
        pygame.draw.lines(surface, SQUIRTLE_BLUE, False, tail_points, 3)
        pygame.draw.circle(surface, SQUIRTLE_LIGHT, (self.x + 13, y + 4), 3)
