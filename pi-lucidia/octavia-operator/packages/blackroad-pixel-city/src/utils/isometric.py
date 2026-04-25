"""
Isometric utility functions for BlackRoad Pixel City
"""
import pygame
import math

def cart_to_iso(x, y):
    """Convert cartesian coordinates to isometric"""
    iso_x = (x - y)
    iso_y = (x + y) / 2
    return iso_x, iso_y

def iso_to_cart(iso_x, iso_y):
    """Convert isometric coordinates to cartesian"""
    x = (iso_x / 2 + iso_y)
    y = (iso_y - iso_x / 2)
    return x, y

def draw_iso_tile(surface, x, y, tile_width, tile_height, color, outline_color=None):
    """Draw a single isometric tile (diamond shape)"""
    # Calculate diamond points
    top = (x, y)
    right = (x + tile_width // 2, y + tile_height // 2)
    bottom = (x, y + tile_height)
    left = (x - tile_width // 2, y + tile_height // 2)
    
    points = [top, right, bottom, left]
    pygame.draw.polygon(surface, color, points)
    
    if outline_color:
        pygame.draw.polygon(surface, outline_color, points, 1)

def draw_iso_cube(surface, x, y, width, height, depth, top_color, left_color, right_color):
    """Draw an isometric cube/box"""
    # Top face (diamond)
    top_points = [
        (x, y),
        (x + width // 2, y + width // 4),
        (x, y + width // 2),
        (x - width // 2, y + width // 4)
    ]
    
    # Left face
    left_points = [
        (x - width // 2, y + width // 4),
        (x, y + width // 2),
        (x, y + width // 2 + depth),
        (x - width // 2, y + width // 4 + depth)
    ]
    
    # Right face
    right_points = [
        (x, y + width // 2),
        (x + width // 2, y + width // 4),
        (x + width // 2, y + width // 4 + depth),
        (x, y + width // 2 + depth)
    ]
    
    # Draw faces (back to front for proper occlusion)
    pygame.draw.polygon(surface, left_color, left_points)
    pygame.draw.polygon(surface, right_color, right_points)
    pygame.draw.polygon(surface, top_color, top_points)
    
    # Outlines
    pygame.draw.polygon(surface, (0, 0, 0), top_points, 1)
    pygame.draw.polygon(surface, (0, 0, 0), left_points, 1)
    pygame.draw.polygon(surface, (0, 0, 0), right_points, 1)

def get_render_order(x, y):
    """Get rendering priority for isometric sorting (back to front)"""
    return x + y

def sort_by_depth(entities):
    """Sort entities by their isometric depth (for proper rendering order)"""
    return sorted(entities, key=lambda e: get_render_order(e.x, e.y))
