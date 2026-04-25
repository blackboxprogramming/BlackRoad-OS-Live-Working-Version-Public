"""
Simple sprite-based game using real PNG assets
"""
import pygame
import sys

pygame.init()

SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Stardew Valley Style Game")
clock = pygame.time.Clock()

# Load sprites
grass_tile = pygame.image.load("assets/grass.png")
road_tile = pygame.image.load("assets/road.png")
house_sprite = pygame.image.load("assets/house.png")
player_sprite = pygame.image.load("assets/player.png")

# Scale up for visibility
player_sprite = pygame.transform.scale(player_sprite, (32, 32))

# Player position
player_x, player_y = 400, 300
player_speed = 3

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                running = False
    
    # Movement
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT] or keys[pygame.K_a]:
        player_x -= player_speed
    if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
        player_x += player_speed
    if keys[pygame.K_UP] or keys[pygame.K_w]:
        player_y -= player_speed
    if keys[pygame.K_DOWN] or keys[pygame.K_s]:
        player_y += player_speed
    
    # Draw tiles
    for y in range(0, SCREEN_HEIGHT, 16):
        for x in range(0, SCREEN_WIDTH, 16):
            # Road in center
            if 250 <= y <= 350:
                screen.blit(road_tile, (x, y))
            else:
                screen.blit(grass_tile, (x, y))
    
    # Draw houses
    screen.blit(house_sprite, (100, 100))
    screen.blit(house_sprite, (600, 100))
    screen.blit(house_sprite, (100, 400))
    screen.blit(house_sprite, (600, 400))
    
    # Draw player
    screen.blit(player_sprite, (player_x - 16, player_y - 16))
    
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()
