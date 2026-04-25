"""
BlackRoad Pixel City - Dialog System
"""
import pygame
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.colors import *


class DialogBox:
    """Pokemon-style dialog box"""
    
    def __init__(self, screen_width, screen_height):
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.active = False
        self.text = ""
        self.visible_chars = 0
        self.text_speed = 2  # Characters per frame
        self.box_height = 100
        self.padding = 20
        self.waiting_for_input = False
        
    def show(self, text):
        """Show dialog with text"""
        self.text = text
        self.visible_chars = 0
        self.active = True
        self.waiting_for_input = False
    
    def update(self):
        """Update dialog animation"""
        if self.active and not self.waiting_for_input:
            self.visible_chars += self.text_speed
            if self.visible_chars >= len(self.text):
                self.visible_chars = len(self.text)
                self.waiting_for_input = True
    
    def advance(self):
        """Advance or close dialog"""
        if self.waiting_for_input:
            self.active = False
        else:
            self.visible_chars = len(self.text)
            self.waiting_for_input = True
    
    def draw(self, surface):
        """Draw the dialog box"""
        if not self.active:
            return
        
        box_y = self.screen_height - self.box_height - 10
        
        # Outer box (dark)
        outer_rect = pygame.Rect(10, box_y, self.screen_width - 20, self.box_height)
        pygame.draw.rect(surface, (0, 0, 0), outer_rect)
        pygame.draw.rect(surface, (255, 255, 255), outer_rect, 3)
        
        # Inner box (white)
        inner_rect = pygame.Rect(15, box_y + 5, self.screen_width - 30, self.box_height - 10)
        pygame.draw.rect(surface, (240, 240, 240), inner_rect)
        
        # Draw text (pixel by pixel reveal)
        visible_text = self.text[:int(self.visible_chars)]
        self._draw_text(surface, visible_text, self.padding + 10, box_y + self.padding)
        
        # Arrow indicator when waiting
        if self.waiting_for_input:
            arrow_x = self.screen_width - 30
            arrow_y = box_y + self.box_height - 20
            pygame.draw.polygon(surface, (0, 0, 0), [
                (arrow_x, arrow_y),
                (arrow_x + 10, arrow_y),
                (arrow_x + 5, arrow_y + 8)
            ])
    
    def _draw_text(self, surface, text, x, y):
        """Draw text character by character (simplified without font)"""
        # For now, just show colored blocks representing text
        # This will be replaced when font works
        char_width = 8
        char_height = 12
        max_chars_per_line = (self.screen_width - self.padding * 2 - 20) // char_width
        
        lines = []
        current_line = ""
        for word in text.split():
            if len(current_line) + len(word) + 1 <= max_chars_per_line:
                current_line += word + " "
            else:
                lines.append(current_line)
                current_line = word + " "
        if current_line:
            lines.append(current_line)
        
        for i, line in enumerate(lines[:3]):  # Max 3 lines
            for j, char in enumerate(line):
                if char != ' ':
                    char_x = x + j * char_width
                    char_y = y + i * (char_height + 4)
                    pygame.draw.rect(surface, (50, 50, 50), 
                                   (char_x, char_y, char_width - 2, char_height))


class BattleUI:
    """Pokemon battle UI"""
    
    def __init__(self, screen_width, screen_height):
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.active = False
        self.player_pokemon = None
        self.wild_pokemon = None
        self.menu_selection = 0
        self.menu_options = ['FIGHT', 'BAG', 'POKEMON', 'RUN']
        
    def start_battle(self, player_pokemon, wild_pokemon):
        """Start a battle"""
        self.active = True
        self.player_pokemon = player_pokemon
        self.wild_pokemon = wild_pokemon
        self.menu_selection = 0
    
    def end_battle(self):
        """End the battle"""
        self.active = False
    
    def move_selection(self, direction):
        """Move menu selection"""
        if direction == 'right':
            self.menu_selection = (self.menu_selection + 1) % 4
        elif direction == 'left':
            self.menu_selection = (self.menu_selection - 1) % 4
        elif direction == 'down':
            self.menu_selection = (self.menu_selection + 2) % 4
        elif direction == 'up':
            self.menu_selection = (self.menu_selection - 2) % 4
    
    def draw(self, surface):
        """Draw battle UI"""
        if not self.active:
            return
        
        # Background (darker for battle)
        overlay = pygame.Surface((self.screen_width, self.screen_height))
        overlay.fill((0, 0, 0))
        overlay.set_alpha(100)
        surface.blit(overlay, (0, 0))
        
        # Wild Pokemon area (top)
        wild_box = pygame.Rect(self.screen_width - 200, 50, 180, 60)
        pygame.draw.rect(surface, (240, 240, 240), wild_box)
        pygame.draw.rect(surface, (0, 0, 0), wild_box, 2)
        
        # Player Pokemon area (bottom left)
        player_box = pygame.Rect(20, self.screen_height - 150, 180, 60)
        pygame.draw.rect(surface, (240, 240, 240), player_box)
        pygame.draw.rect(surface, (0, 0, 0), player_box, 2)
        
        # Menu box (bottom right)
        menu_box = pygame.Rect(self.screen_width - 250, self.screen_height - 120, 230, 100)
        pygame.draw.rect(surface, (255, 255, 255), menu_box)
        pygame.draw.rect(surface, (0, 0, 0), menu_box, 3)
        
        # Draw menu options in 2x2 grid
        option_width = 100
        option_height = 35
        for i, option in enumerate(self.menu_options):
            row = i // 2
            col = i % 2
            x = self.screen_width - 240 + col * (option_width + 10)
            y = self.screen_height - 110 + row * (option_height + 5)
            
            # Highlight selected option
            color = (255, 200, 0) if i == self.menu_selection else (200, 200, 200)
            option_rect = pygame.Rect(x, y, option_width, option_height)
            pygame.draw.rect(surface, color, option_rect)
            pygame.draw.rect(surface, (0, 0, 0), option_rect, 2)
            
            # Draw option text as colored bar (simplified)
            text_color = (0, 0, 0) if i == self.menu_selection else (100, 100, 100)
            pygame.draw.rect(surface, text_color, (x + 10, y + 12, 80, 12))
