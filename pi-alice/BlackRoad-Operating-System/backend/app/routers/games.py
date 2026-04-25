"""
Games API Router

Provides game state management for:
- Road City (SimCity-style city builder)
- Road Life (Sims-style life simulator)
- RoadCraft (Voxel world builder)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
import json
import random

from ..database import get_db
from ..auth import get_current_user
from ..models import User
from ..utils import utc_now

router = APIRouter(prefix="/api/games", tags=["games"])


# ============================================================================
# ROAD CITY - SimCity-style city builder
# ============================================================================

class CityData(BaseModel):
    name: str
    population: int = 0
    money: int = 10000
    buildings: List[Dict[str, Any]] = []
    resources: Dict[str, int] = {
        "power": 0,
        "water": 0,
        "happiness": 50
    }


class BuildingPlace(BaseModel):
    type: str
    x: int
    y: int


@router.get("/road-city/cities")
async def list_cities(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all cities for the current user"""
    # In production, this would be stored in a GameSave table
    # For now, returning a demo city
    return {
        "cities": [
            {
                "id": 1,
                "name": "Road City",
                "population": 1250,
                "money": 45000,
                "level": 5,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": utc_now().isoformat()
            }
        ]
    }


@router.get("/road-city/{city_id}")
async def get_city(
    city_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get city details and game state"""
    # Demo city data
    city = {
        "id": city_id,
        "name": "Road City",
        "population": 1250,
        "money": 45000,
        "happiness": 75,
        "buildings": [
            {"id": 1, "type": "residential", "x": 2, "y": 2, "level": 2},
            {"id": 2, "type": "commercial", "x": 5, "y": 2, "level": 1},
            {"id": 3, "type": "industrial", "x": 8, "y": 2, "level": 1},
            {"id": 4, "type": "power_plant", "x": 1, "y": 5, "level": 1},
            {"id": 5, "type": "water_tower", "x": 9, "y": 5, "level": 1},
            {"id": 6, "type": "park", "x": 5, "y": 5, "level": 1},
            {"id": 7, "type": "police", "x": 3, "y": 8, "level": 1},
            {"id": 8, "type": "hospital", "x": 7, "y": 8, "level": 1},
        ],
        "resources": {
            "power": 80,
            "water": 90,
            "safety": 85,
            "health": 88
        },
        "stats": {
            "residential_zones": 3,
            "commercial_zones": 2,
            "industrial_zones": 1,
            "total_buildings": 8
        }
    }
    return city


@router.post("/road-city/{city_id}/build")
async def place_building(
    city_id: int,
    building: BuildingPlace,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Place a building in the city"""
    building_costs = {
        "residential": 500,
        "commercial": 1000,
        "industrial": 1500,
        "power_plant": 3000,
        "water_tower": 2000,
        "park": 300,
        "police": 2500,
        "hospital": 3500,
        "school": 2000,
        "fire_station": 2500,
        "road": 50
    }

    cost = building_costs.get(building.type, 0)

    # In production, update database
    new_building = {
        "id": random.randint(100, 999),
        "type": building.type,
        "x": building.x,
        "y": building.y,
        "level": 1,
        "cost": cost
    }

    return {
        "message": f"{building.type} built successfully",
        "building": new_building,
        "remaining_money": 45000 - cost
    }


@router.get("/road-city/building-types")
async def get_building_types(
    current_user: User = Depends(get_current_user)
):
    """Get all available building types with costs"""
    return {
        "categories": {
            "zones": [
                {"type": "residential", "name": "Residential Zone", "cost": 500, "icon": "🏠"},
                {"type": "commercial", "name": "Commercial Zone", "cost": 1000, "icon": "🏪"},
                {"type": "industrial", "name": "Industrial Zone", "cost": 1500, "icon": "🏭"}
            ],
            "utilities": [
                {"type": "power_plant", "name": "Power Plant", "cost": 3000, "icon": "⚡"},
                {"type": "water_tower", "name": "Water Tower", "cost": 2000, "icon": "💧"}
            ],
            "services": [
                {"type": "police", "name": "Police Station", "cost": 2500, "icon": "👮"},
                {"type": "hospital", "name": "Hospital", "cost": 3500, "icon": "🏥"},
                {"type": "school", "name": "School", "cost": 2000, "icon": "🏫"},
                {"type": "fire_station", "name": "Fire Station", "cost": 2500, "icon": "🚒"}
            ],
            "recreation": [
                {"type": "park", "name": "Park", "cost": 300, "icon": "🌳"}
            ],
            "infrastructure": [
                {"type": "road", "name": "Road", "cost": 50, "icon": "🛣️"}
            ]
        }
    }


# ============================================================================
# ROAD LIFE - Sims-style life simulator
# ============================================================================

class CharacterCreate(BaseModel):
    name: str
    traits: List[str] = []


@router.get("/road-life/characters")
async def list_characters(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all characters for the current user"""
    return {
        "characters": [
            {
                "id": 1,
                "name": "John Roadman",
                "age": 25,
                "occupation": "Software Developer",
                "mood": "happy",
                "needs": {
                    "hunger": 75,
                    "energy": 60,
                    "social": 80,
                    "fun": 70,
                    "hygiene": 85
                },
                "money": 5000,
                "level": 3
            }
        ]
    }


@router.get("/road-life/{character_id}")
async def get_character(
    character_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get character details and current state"""
    character = {
        "id": character_id,
        "name": "John Roadman",
        "age": 25,
        "occupation": "Software Developer",
        "mood": "happy",
        "traits": ["Creative", "Bookworm", "Ambitious"],
        "skills": {
            "programming": 7,
            "cooking": 3,
            "fitness": 5,
            "charisma": 4,
            "creativity": 6
        },
        "needs": {
            "hunger": 75,
            "energy": 60,
            "social": 80,
            "fun": 70,
            "hygiene": 85,
            "bladder": 90
        },
        "relationships": [
            {"name": "Sarah", "type": "Friend", "level": 65},
            {"name": "Mike", "type": "Colleague", "level": 45}
        ],
        "inventory": [
            {"item": "Laptop", "type": "electronics"},
            {"item": "Coffee", "type": "food", "quantity": 3}
        ],
        "location": {
            "type": "home",
            "room": "living_room"
        },
        "money": 5000,
        "job": {
            "title": "Junior Developer",
            "salary": 3000,
            "performance": 85
        }
    }
    return character


@router.post("/road-life/{character_id}/action")
async def perform_action(
    character_id: int,
    action: str,
    target: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Perform an action with the character"""
    actions = {
        "eat": {"hunger": 20, "time": 30},
        "sleep": {"energy": 40, "time": 120},
        "shower": {"hygiene": 30, "time": 15},
        "work": {"money": 100, "energy": -20, "time": 240},
        "socialize": {"social": 25, "fun": 15, "time": 60},
        "exercise": {"fitness": 5, "energy": -15, "time": 60},
        "code": {"programming": 2, "fun": 10, "time": 120},
        "watch_tv": {"fun": 20, "energy": 5, "time": 60}
    }

    if action not in actions:
        raise HTTPException(status_code=400, detail="Invalid action")

    effects = actions[action]

    return {
        "message": f"Character performed action: {action}",
        "effects": effects,
        "time_elapsed": effects.get("time", 0),
        "new_needs": {
            "hunger": 75 + effects.get("hunger", 0),
            "energy": 60 + effects.get("energy", 0),
            "social": 80 + effects.get("social", 0),
            "fun": 70 + effects.get("fun", 0),
            "hygiene": 85 + effects.get("hygiene", 0)
        }
    }


@router.get("/road-life/actions")
async def get_available_actions(
    current_user: User = Depends(get_current_user)
):
    """Get all available actions"""
    return {
        "categories": {
            "basic_needs": [
                {"action": "eat", "name": "Eat", "icon": "🍽️", "time": 30},
                {"action": "sleep", "name": "Sleep", "icon": "😴", "time": 120},
                {"action": "shower", "name": "Shower", "icon": "🚿", "time": 15},
                {"action": "use_toilet", "name": "Use Toilet", "icon": "🚽", "time": 5}
            ],
            "work": [
                {"action": "work", "name": "Go to Work", "icon": "💼", "time": 240},
                {"action": "study", "name": "Study", "icon": "📚", "time": 120}
            ],
            "social": [
                {"action": "socialize", "name": "Chat", "icon": "💬", "time": 60},
                {"action": "call_friend", "name": "Call Friend", "icon": "📞", "time": 30}
            ],
            "recreation": [
                {"action": "watch_tv", "name": "Watch TV", "icon": "📺", "time": 60},
                {"action": "play_games", "name": "Play Video Games", "icon": "🎮", "time": 90},
                {"action": "exercise", "name": "Exercise", "icon": "🏋️", "time": 60}
            ],
            "skills": [
                {"action": "code", "name": "Practice Coding", "icon": "💻", "time": 120},
                {"action": "cook", "name": "Cook", "icon": "👨‍🍳", "time": 45},
                {"action": "paint", "name": "Paint", "icon": "🎨", "time": 90}
            ]
        }
    }


# ============================================================================
# ROADCRAFT - Voxel world builder
# ============================================================================

@router.get("/roadcraft/worlds")
async def list_worlds(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all RoadCraft worlds"""
    return {
        "worlds": [
            {
                "id": 1,
                "name": "My First World",
                "seed": "roadcraft-2024",
                "mode": "creative",
                "size": {"x": 256, "y": 128, "z": 256},
                "created_at": "2024-01-01T00:00:00Z"
            }
        ]
    }


@router.get("/roadcraft/{world_id}")
async def get_world(
    world_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get world data"""
    return {
        "id": world_id,
        "name": "My First World",
        "seed": "roadcraft-2024",
        "mode": "creative",
        "size": {"x": 256, "y": 128, "z": 256},
        "player": {
            "position": {"x": 128, "y": 64, "z": 128},
            "inventory": [
                {"block": "dirt", "quantity": 64},
                {"block": "stone", "quantity": 64},
                {"block": "wood", "quantity": 32}
            ]
        }
    }


@router.post("/roadcraft/{world_id}/block")
async def place_block(
    world_id: int,
    x: int,
    y: int,
    z: int,
    block_type: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Place a block in the world"""
    return {
        "message": "Block placed",
        "position": {"x": x, "y": y, "z": z},
        "block": block_type
    }


@router.get("/roadcraft/blocks")
async def get_block_types(
    current_user: User = Depends(get_current_user)
):
    """Get all available block types"""
    return {
        "blocks": [
            {"type": "grass", "name": "Grass Block", "category": "natural"},
            {"type": "dirt", "name": "Dirt", "category": "natural"},
            {"type": "stone", "name": "Stone", "category": "natural"},
            {"type": "wood", "name": "Wood Planks", "category": "building"},
            {"type": "glass", "name": "Glass", "category": "building"},
            {"type": "brick", "name": "Brick", "category": "building"},
            {"type": "water", "name": "Water", "category": "liquid"},
            {"type": "lava", "name": "Lava", "category": "liquid"}
        ]
    }


# ============================================================================
# GAME STATS & LEADERBOARDS
# ============================================================================

@router.get("/stats")
async def get_game_stats(
    current_user: User = Depends(get_current_user)
):
    """Get overall game statistics for the user"""
    return {
        "road_city": {
            "total_cities": 1,
            "largest_population": 1250,
            "total_money_earned": 125000
        },
        "road_life": {
            "total_characters": 1,
            "highest_level": 3,
            "total_actions": 547
        },
        "roadcraft": {
            "total_worlds": 1,
            "blocks_placed": 1892,
            "hours_played": 12.5
        }
    }


@router.get("/leaderboard/{game}")
async def get_leaderboard(
    game: str,
    current_user: User = Depends(get_current_user)
):
    """Get leaderboard for a specific game"""
    if game not in ["road-city", "road-life", "roadcraft"]:
        raise HTTPException(status_code=400, detail="Invalid game")

    # Demo leaderboard
    leaderboards = {
        "road-city": [
            {"rank": 1, "username": "CityBuilder99", "score": 50000, "population": 10000},
            {"rank": 2, "username": "UrbanPlanner", "score": 45000, "population": 8500},
            {"rank": 3, "username": current_user.username, "score": 45000, "population": 1250}
        ],
        "road-life": [
            {"rank": 1, "username": "LifeMaster", "score": 10000, "level": 15},
            {"rank": 2, "username": "SimGuru", "score": 8500, "level": 12},
            {"rank": 3, "username": current_user.username, "score": 2500, "level": 3}
        ],
        "roadcraft": [
            {"rank": 1, "username": "BuilderPro", "score": 100000, "blocks": 50000},
            {"rank": 2, "username": "VoxelMaster", "score": 85000, "blocks": 35000},
            {"rank": 3, "username": current_user.username, "score": 15000, "blocks": 1892}
        ]
    }

    return {
        "game": game,
        "leaderboard": leaderboards[game]
    }
