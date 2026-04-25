#!/usr/bin/env python3
"""
BlackRoad Pixel City - Enhanced Pokemon Edition
A vibrant pixel-art Pokemon-themed city simulator with RPG mechanics
Version 2.1.0
"""
import pygame
import sys
import random
import math

# Import our modules
from entities.building import Building
from entities.tree import Tree
from entities.npc import NPC
from entities.pokemon import Pokemon
from entities.player import Player
from entities.grass import TallGrass, WildEncounter
from entities.ui import DialogBox, BattleUI
from utils.colors import *
from utils.config import *


class PixelCity:
    """Main game class for Pixel City"""
    
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption(TITLE + " - Pokemon Edition")
        self.clock = pygame.time.Clock()
        self.running = True
        self.frame_count = 0
        self.water_animation = 0
        
        # Game state
        self.game_mode = 'explore'  # explore, battle, dialog
        self.steps_in_grass = 0
        
        # Initialize game elements
        self._init_city()
        
        # Initialize UI
        self.dialog_box = DialogBox(SCREEN_WIDTH, SCREEN_HEIGHT)
        self.battle_ui = BattleUI(SCREEN_WIDTH, SCREEN_HEIGHT)
        
        # Wild encounters
        self.wild_encounter_system = WildEncounter()
        self.last_grass_position = None
        
    def _init_city(self):
        """Initialize all city elements with proper layout"""
        # Player starts on the main road
        self.player = Player(400, 300)
        
        # Give player a starter Pokemon
        starter = Pokemon(0, 0, "pikachu")
        self.player.add_pokemon(starter)
        
        # Buildings - organized in town layout
        # Top row (north side)
        self.buildings = [
            Building(120, 80, 70, 60, POKECENTER_RED, "pokecenter"),  # Pokemon Center
            Building(250, 80, 70, 60, POKEMART_BLUE, "shop"),  # Poke Mart
            Building(380, 80, 60, 55, BUILDING_YELLOW, "house"),
            Building(500, 80, 60, 55, BUILDING_BLUE, "house"),
            Building(620, 80, 70, 60, BUILDING_ORANGE, "house"),
            
            # Bottom row (south side)
            Building(120, 420, 65, 55, BUILDING_RED, "house"),
            Building(250, 420, 60, 50, BUILDING_PURPLE, "house"),
            Building(380, 420, 65, 55, BUILDING_PINK, "house"),
            Building(500, 420, 70, 60, BUILDING_BLUE, "house"),
            Building(620, 420, 60, 55, BUILDING_YELLOW, "shop"),
        ]
        
        # Tall grass patches - on edges and corners (not in town center)
        self.grass_patches = [
            TallGrass(20, 20, 60, 100),       # Top left corner
            TallGrass(720, 20, 60, 120),      # Top right corner
            TallGrass(20, 480, 70, 100),      # Bottom left corner
            TallGrass(720, 460, 60, 120),     # Bottom right corner
        ]
        
        # Trees - lining the roads and between buildings
        self.trees = [
            # Top row trees (between buildings)
            Tree(210, 100, "medium"),
            Tree(340, 100, "small"),
            Tree(460, 100, "medium"),
            Tree(580, 100, "small"),
            
            # Bottom row trees
            Tree(210, 440, "small"),
            Tree(340, 440, "medium"),
            Tree(460, 440, "small"),
            Tree(580, 440, "medium"),
            
            # Side decorations
            Tree(700, 250, "large"),
            Tree(100, 250, "large"),
            Tree(50, 150, "medium"),
            Tree(750, 350, "medium"),
        ]
        
        # NPCs - standing around town
        self.npcs = [
            NPC(300, 180, "trainer"),      # Near Pokemon Center
            NPC(180, 350, "npc"),          # Walking around
            NPC(550, 250, "ace_trainer"),  # On main road
            NPC(400, 360, "npc"),          # Near houses
            NPC(650, 300, "trainer"),      # East side
        ]
        
        # Wild Pokemon - only in grass areas (removed from town)
        self.pokemons = []
    
    def _draw_background(self):
        """Draw tile-based background"""
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(__file__)))
        from utils.sprites import get_sprite
        
        # Get tile sprites
        grass_tile = get_sprite("grass")
        road_tile = get_sprite("road")
        
        # Draw tiles in grid
        for y in range(0, SCREEN_HEIGHT, 16):
            for x in range(0, SCREEN_WIDTH, 16):
                # Road in center
                if 220 <= y <= 380:
                    self.screen.blit(road_tile, (x, y))
                else:
                    self.screen.blit(grass_tile, (x, y))
    
    def _draw_roads(self):
        """Roads already drawn in background tiles"""
        pass
    
    def _draw_water(self):
        """Draw animated water pond"""
        self.water_animation = (self.water_animation + WATER_ANIMATION_SPEED) % 6.28
        
        # Main pond
        pond_rect = pygame.Rect(550, 450, 120, 80)
        pygame.draw.ellipse(self.screen, WATER_BLUE, pond_rect)
        pygame.draw.ellipse(self.screen, WATER_DARK, pond_rect, 3)
        
        # Water ripples (animated)
        ripple_offset = int(math.sin(self.water_animation) * 3)
        for i in range(3):
            ripple_size = 20 + i * 15
            ripple_x = 610 + ripple_offset
            ripple_y = 490
            pygame.draw.ellipse(self.screen, (100, 180, 220), 
                              (ripple_x - ripple_size // 2, ripple_y - ripple_size // 4,
                               ripple_size, ripple_size // 2), 1)
    
    def _draw_ui(self):
        """Draw UI elements - Note: Text rendering disabled due to pygame font module issues"""
        # Draw colored indicators instead of text
        # Top-left: Pokemon/NPC count indicator
        indicator_size = 8
        x_offset = 10
        for i in range(min(len(self.pokemons), 10)):
            pygame.draw.circle(self.screen, PIKACHU_YELLOW, (x_offset + i * 12, 15), indicator_size // 2)
        
        for i in range(min(len(self.npcs), 10)):
            pygame.draw.circle(self.screen, TRAINER_RED, (x_offset + i * 12, 30), indicator_size // 2)
        
        # FPS indicator (if enabled) - visual only
        if SHOW_FPS:
            fps = int(self.clock.get_fps())
            # Draw green/yellow/red bar based on FPS
            fps_color = (0, 255, 0) if fps > 50 else (255, 255, 0) if fps > 30 else (255, 0, 0)
            pygame.draw.rect(self.screen, fps_color, (SCREEN_WIDTH - 60, 15, min(fps, 60), 10))
    
    def update(self):
        """Update all game elements"""
        self.frame_count += 1
        
        if self.game_mode == 'explore':
            # Update player
            keys = pygame.key.get_pressed()
            old_x, old_y = self.player.x, self.player.y
            self.player.update(keys)
            
            # Check for grass encounters
            if self.player.x != old_x or self.player.y != old_y:
                self._check_grass_encounter()
            
            # Update trees (swaying animation)
            for tree in self.trees:
                tree.update(self.frame_count)
            
            # Update NPCs
            for npc in self.npcs:
                npc.update(SCREEN_WIDTH, SCREEN_HEIGHT)
            
            # Update Pokemon
            for pokemon in self.pokemons:
                pokemon.update(SCREEN_WIDTH, SCREEN_HEIGHT)
            
            # Update grass patches
            for grass in self.grass_patches:
                grass.update()
        
        elif self.game_mode == 'dialog':
            self.dialog_box.update()
        
        elif self.game_mode == 'battle':
            # Battle logic handled in handle_events
            pass
    
    def _check_grass_encounter(self):
        """Check if player is in grass and trigger encounters"""
        in_grass = False
        for grass in self.grass_patches:
            if grass.contains_point(self.player.x, self.player.y):
                in_grass = True
                grass.rustle()
                
                # Check for encounter
                if self.last_grass_position != (grass.x, grass.y) or random.random() < 0.05:
                    species = self.wild_encounter_system.check_encounter()
                    if species:
                        self._start_wild_encounter(species)
                        self.last_grass_position = (grass.x, grass.y)
                break
        
        if not in_grass:
            self.last_grass_position = None
    
    def _start_wild_encounter(self, species):
        """Start a wild Pokemon encounter"""
        self.game_mode = 'battle'
        wild_pokemon = Pokemon(0, 0, species)
        self.player.see_pokemon(species)
        self.battle_ui.start_battle(self.player.pokemon_team[0] if self.player.pokemon_team else None, wild_pokemon)
        
        # Show encounter message
        self.dialog_box.show(f"A wild {species.upper()} appeared!")
    
    def draw(self):
        """Draw all game elements with isometric rendering"""
        # Background (sky and ground tiles)
        self._draw_background()
        
        # Roads
        self._draw_roads()
        
        # Water (if any)
        self._draw_water()
        
        # Collect all entities for depth sorting
        from utils.isometric import sort_by_depth
        
        all_entities = []
        
        # Add tall grass patches
        for grass in self.grass_patches:
            all_entities.append(('grass', grass))
        
        # Add trees
        for tree in self.trees:
            all_entities.append(('tree', tree))
        
        # Add buildings
        for building in self.buildings:
            all_entities.append(('building', building))
        
        # Add wild Pokemon
        for pokemon in self.pokemons:
            all_entities.append(('pokemon', pokemon))
        
        # Add NPCs
        for npc in self.npcs:
            all_entities.append(('npc', npc))
        
        # Add player
        all_entities.append(('player', self.player))
        
        # Sort by isometric depth (y + x for proper back-to-front rendering)
        all_entities.sort(key=lambda e: e[1].y + e[1].x)
        
        # Draw in sorted order
        for entity_type, entity in all_entities:
            entity.draw(self.screen)
        
        # UI (always on top)
        self._draw_ui()
        
        # Dialog box
        self.dialog_box.draw(self.screen)
        
        # Battle UI
        if self.game_mode == 'battle':
            self.battle_ui.draw(self.screen)
    
    def handle_events(self):
        """Handle input events"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                elif event.key == pygame.K_f:
                    # Toggle FPS display
                    global SHOW_FPS
                    SHOW_FPS = not SHOW_FPS
                elif event.key == pygame.K_SPACE or event.key == pygame.K_RETURN:
                    self._handle_action_button()
                elif event.key == pygame.K_p:
                    # Show Pokedex
                    seen = len(self.player.pokedex_seen)
                    caught = len(self.player.pokedex_caught)
                    self.dialog_box.show(f"POKEDEX - Seen: {seen} | Caught: {caught}")
                    self.game_mode = 'dialog'
                elif event.key == pygame.K_t:
                    # Show team
                    team_size = len(self.player.pokemon_team)
                    self.dialog_box.show(f"Your team has {team_size} Pokemon!")
                    self.game_mode = 'dialog'
                
                # Battle menu navigation
                if self.game_mode == 'battle':
                    if event.key == pygame.K_LEFT:
                        self.battle_ui.move_selection('left')
                    elif event.key == pygame.K_RIGHT:
                        self.battle_ui.move_selection('right')
                    elif event.key == pygame.K_UP:
                        self.battle_ui.move_selection('up')
                    elif event.key == pygame.K_DOWN:
                        self.battle_ui.move_selection('down')
    
    def _handle_action_button(self):
        """Handle action button (SPACE/ENTER)"""
        if self.game_mode == 'dialog':
            if self.dialog_box.waiting_for_input:
                self.dialog_box.advance()
                if not self.dialog_box.active:
                    self.game_mode = 'explore'
        elif self.game_mode == 'battle':
            # Handle battle menu selection
            selected = self.battle_ui.menu_options[self.battle_ui.menu_selection]
            if selected == 'RUN':
                self.battle_ui.end_battle()
                self.dialog_box.show("Got away safely!")
                self.game_mode = 'dialog'
            elif selected == 'FIGHT':
                self.dialog_box.show("You used TACKLE!")
                # Simplified battle - just end it
                if random.random() < 0.5:
                    species = self.battle_ui.wild_pokemon.species
                    self.player.catch_pokemon(species)
                    self.dialog_box.show(f"Gotcha! {species.upper()} was caught!")
                else:
                    self.dialog_box.show(f"The wild Pokemon escaped!")
                self.battle_ui.end_battle()
                self.game_mode = 'dialog'
        elif self.game_mode == 'explore':
            # Check for interactions with NPCs or buildings
            self._check_interactions()
    
    def _check_interactions(self):
        """Check for nearby NPCs or buildings to interact with"""
        # Check NPCs
        for npc in self.npcs:
            distance = math.sqrt((self.player.x - npc.x)**2 + (self.player.y - npc.y)**2)
            if distance < 30:
                if npc.type == "trainer":
                    self.dialog_box.show("Let's battle! Go, Pokemon!")
                    self.game_mode = 'dialog'
                else:
                    self.dialog_box.show("Welcome to our city! Explore and catch Pokemon!")
                    self.game_mode = 'dialog'
                return
        
        # Check buildings
        for building in self.buildings:
            if (building.x <= self.player.x <= building.x + building.width and
                building.y <= self.player.y <= building.y + building.height):
                if building.type == "pokecenter":
                    self.dialog_box.show("Welcome to the Pokemon Center! Your Pokemon are healed!")
                    self.game_mode = 'dialog'
                elif building.type == "shop":
                    self.dialog_box.show("Welcome to the Poke Mart! Buy items here!")
                    self.game_mode = 'dialog'
                else:
                    self.dialog_box.show("This is someone's house. Let's not intrude!")
                    self.game_mode = 'dialog'
                return
    
    def run(self):
        """Main game loop"""
        while self.running:
            self.handle_events()
            self.update()
            self.draw()
            
            pygame.display.flip()
            self.clock.tick(FPS)
        
        pygame.quit()
        sys.exit()


def main():
    """Entry point for the game"""
    game = PixelCity()
    game.run()


if __name__ == "__main__":
    main()
