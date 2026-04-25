"""
BlackRoad Pixel City - Player Character
"""
import pygame
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.colors import *
from utils.config import PLAYER_SPEED, SCREEN_WIDTH, SCREEN_HEIGHT


class Player:
    """Player character that can be controlled"""
    
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.direction = 'down'
        self.walk_cycle = 0
        self.speed = PLAYER_SPEED
        self.moving = False
        
        # Player stats
        self.name = "Ash"
        self.pokemon_team = []
        self.pokedex_seen = set()
        self.pokedex_caught = set()
        
    def update(self, keys_pressed):
        """Update player position based on input"""
        self.moving = False
        dx, dy = 0, 0
        
        if keys_pressed[pygame.K_UP] or keys_pressed[pygame.K_w]:
            dy = -self.speed
            self.direction = 'up'
            self.moving = True
        elif keys_pressed[pygame.K_DOWN] or keys_pressed[pygame.K_s]:
            dy = self.speed
            self.direction = 'down'
            self.moving = True
        elif keys_pressed[pygame.K_LEFT] or keys_pressed[pygame.K_a]:
            dx = -self.speed
            self.direction = 'left'
            self.moving = True
        elif keys_pressed[pygame.K_RIGHT] or keys_pressed[pygame.K_d]:
            dx = self.speed
            self.direction = 'right'
            self.moving = True
        
        # Update position
        new_x = self.x + dx
        new_y = self.y + dy
        
        # Keep in bounds
        if 30 <= new_x <= SCREEN_WIDTH - 30:
            self.x = new_x
        if 30 <= new_y <= SCREEN_HEIGHT - 30:
            self.y = new_y
        
        # Update walk cycle
        if self.moving:
            self.walk_cycle = (self.walk_cycle + 0.2) % 4
    
    def draw(self, surface):
        """Draw player using sprite"""
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(__file__)))
        from utils.sprites import get_sprite
        
        sprite = get_sprite("player")
        # Scale up 2x for visibility
        scaled = pygame.transform.scale(sprite, (32, 32))
        surface.blit(scaled, (self.x - 16, self.y - 16))
    
    def add_pokemon(self, pokemon):
        """Add a Pokemon to the team"""
        if len(self.pokemon_team) < 6:
            self.pokemon_team.append(pokemon)
            return True
        return False
    
    def see_pokemon(self, species):
        """Mark a Pokemon as seen in Pokedex"""
        self.pokedex_seen.add(species)
    
    def catch_pokemon(self, species):
        """Mark a Pokemon as caught in Pokedex"""
        self.pokedex_caught.add(species)
        self.pokedex_seen.add(species)
