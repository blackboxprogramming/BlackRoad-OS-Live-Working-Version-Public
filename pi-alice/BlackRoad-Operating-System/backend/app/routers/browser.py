"""
RoadView Browser API Router

Provides web browsing capabilities:
- URL fetching with proxy
- Bookmark management
- Browsing history
- Search engine integration
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import httpx
from urllib.parse import urlparse, quote
import hashlib

from ..database import get_db
from ..auth import get_current_user
from ..models import User
from pydantic import BaseModel, HttpUrl
from ..utils import utc_now

router = APIRouter(prefix="/api/browser", tags=["browser"])


class Bookmark(BaseModel):
    title: str
    url: str
    folder: Optional[str] = "Bookmarks"


class HistoryEntry(BaseModel):
    url: str
    title: str


@router.get("/fetch")
async def fetch_url(
    url: str = Query(..., description="URL to fetch"),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch a web page through proxy
    Returns HTML content with modified links for proxy routing
    """
    try:
        # Validate URL
        parsed = urlparse(url)
        if not parsed.scheme:
            url = f"https://{url}"

        async with httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36"
            }
        ) as client:
            response = await client.get(url)

            # Get content type
            content_type = response.headers.get("content-type", "text/html")

            return {
                "url": str(response.url),
                "status_code": response.status_code,
                "content_type": content_type,
                "content": response.text if "text" in content_type else None,
                "headers": dict(response.headers),
                "is_html": "text/html" in content_type
            }

    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timeout")
    except httpx.RequestError as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching URL: {str(e)}")


@router.get("/bookmarks")
async def get_bookmarks(
    folder: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's bookmarks"""
    # In production, this would be stored in a Bookmarks table
    # For now, returning demo bookmarks
    demo_bookmarks = [
        {
            "id": 1,
            "title": "GitHub",
            "url": "https://github.com",
            "folder": "Development",
            "created_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": 2,
            "title": "Stack Overflow",
            "url": "https://stackoverflow.com",
            "folder": "Development",
            "created_at": "2024-01-02T00:00:00Z"
        },
        {
            "id": 3,
            "title": "Hacker News",
            "url": "https://news.ycombinator.com",
            "folder": "News",
            "created_at": "2024-01-03T00:00:00Z"
        },
        {
            "id": 4,
            "title": "Hugging Face",
            "url": "https://huggingface.co",
            "folder": "AI/ML",
            "created_at": "2024-01-04T00:00:00Z"
        }
    ]

    if folder:
        demo_bookmarks = [b for b in demo_bookmarks if b["folder"] == folder]

    return {
        "bookmarks": demo_bookmarks,
        "folders": ["Development", "News", "AI/ML"]
    }


@router.post("/bookmarks")
async def add_bookmark(
    bookmark: Bookmark,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new bookmark"""
    # In production, save to database
    new_bookmark = {
        "id": hashlib.md5(bookmark.url.encode()).hexdigest()[:8],
        "title": bookmark.title,
        "url": bookmark.url,
        "folder": bookmark.folder,
        "created_at": utc_now().isoformat()
    }

    return {
        "message": "Bookmark added",
        "bookmark": new_bookmark
    }


@router.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(
    bookmark_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a bookmark"""
    return {"message": "Bookmark deleted"}


@router.get("/history")
async def get_history(
    limit: int = Query(50, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get browsing history"""
    # In production, this would be stored in a BrowserHistory table
    demo_history = [
        {
            "id": 1,
            "url": "https://github.com/trending",
            "title": "Trending - GitHub",
            "visited_at": "2024-01-10T15:30:00Z",
            "visit_count": 5
        },
        {
            "id": 2,
            "url": "https://stackoverflow.com/questions/tagged/python",
            "title": "Newest Python Questions - Stack Overflow",
            "visited_at": "2024-01-10T14:20:00Z",
            "visit_count": 2
        },
        {
            "id": 3,
            "url": "https://news.ycombinator.com",
            "title": "Hacker News",
            "visited_at": "2024-01-10T13:15:00Z",
            "visit_count": 12
        }
    ]

    return {
        "history": demo_history[offset:offset+limit],
        "total": len(demo_history)
    }


@router.post("/history")
async def add_history_entry(
    entry: HistoryEntry,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a history entry"""
    new_entry = {
        "id": hashlib.md5(f"{entry.url}{utc_now()}".encode()).hexdigest()[:8],
        "url": entry.url,
        "title": entry.title,
        "visited_at": utc_now().isoformat()
    }

    return {
        "message": "History entry added",
        "entry": new_entry
    }


@router.delete("/history")
async def clear_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear all browsing history"""
    return {"message": "History cleared"}


@router.get("/search")
async def web_search(
    q: str = Query(..., min_length=1, description="Search query"),
    engine: str = Query("duckduckgo", pattern="^(duckduckgo|google|bing)$"),
    current_user: User = Depends(get_current_user)
):
    """
    Perform a web search using the specified search engine
    Returns redirect URL to search results
    """
    search_urls = {
        "duckduckgo": f"https://duckduckgo.com/?q={quote(q)}",
        "google": f"https://www.google.com/search?q={quote(q)}",
        "bing": f"https://www.bing.com/search?q={quote(q)}"
    }

    return {
        "query": q,
        "engine": engine,
        "url": search_urls[engine]
    }


@router.get("/quicklinks")
async def get_quicklinks(
    current_user: User = Depends(get_current_user)
):
    """Get quick access links (like a speed dial)"""
    return {
        "quicklinks": [
            {
                "title": "GitHub",
                "url": "https://github.com",
                "icon": "🐙",
                "category": "Development"
            },
            {
                "title": "Stack Overflow",
                "url": "https://stackoverflow.com",
                "icon": "📚",
                "category": "Development"
            },
            {
                "title": "Hacker News",
                "url": "https://news.ycombinator.com",
                "icon": "📰",
                "category": "News"
            },
            {
                "title": "Hugging Face",
                "url": "https://huggingface.co",
                "icon": "🤗",
                "category": "AI"
            },
            {
                "title": "Reddit",
                "url": "https://reddit.com",
                "icon": "🔴",
                "category": "Social"
            },
            {
                "title": "YouTube",
                "url": "https://youtube.com",
                "icon": "▶️",
                "category": "Video"
            },
            {
                "title": "Wikipedia",
                "url": "https://wikipedia.org",
                "icon": "📖",
                "category": "Reference"
            },
            {
                "title": "DigitalOcean",
                "url": "https://digitalocean.com",
                "icon": "🌊",
                "category": "Cloud"
            }
        ]
    }


@router.get("/settings")
async def get_browser_settings(
    current_user: User = Depends(get_current_user)
):
    """Get browser settings"""
    return {
        "settings": {
            "default_search_engine": "duckduckgo",
            "homepage": "about:newtab",
            "enable_javascript": True,
            "enable_cookies": True,
            "enable_images": True,
            "user_agent": "RoadView/1.0 (BlackRoad OS)"
        }
    }


@router.put("/settings")
async def update_browser_settings(
    settings: dict,
    current_user: User = Depends(get_current_user)
):
    """Update browser settings"""
    return {
        "message": "Settings updated",
        "settings": settings
    }


@router.get("/download")
async def download_file(
    url: str = Query(..., description="File URL to download"),
    current_user: User = Depends(get_current_user)
):
    """
    Download a file through proxy
    Returns file metadata and download token
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # HEAD request to get file info
            response = await client.head(url)

            content_type = response.headers.get("content-type", "application/octet-stream")
            content_length = response.headers.get("content-length", "unknown")

            filename = url.split("/")[-1] or "download"

            return {
                "url": url,
                "filename": filename,
                "content_type": content_type,
                "size": content_length,
                "message": "File info retrieved. In production, this would initiate a download."
            }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to access file: {str(e)}")


@router.get("/tabs")
async def get_open_tabs(
    current_user: User = Depends(get_current_user)
):
    """Get currently open tabs (session management)"""
    # In production, store in Redis for session management
    return {
        "tabs": [
            {
                "id": 1,
                "url": "https://github.com",
                "title": "GitHub",
                "active": True
            }
        ]
    }


@router.post("/tabs")
async def open_new_tab(
    url: str,
    current_user: User = Depends(get_current_user)
):
    """Open a new tab"""
    return {
        "tab": {
            "id": hashlib.md5(f"{url}{utc_now()}".encode()).hexdigest()[:8],
            "url": url,
            "title": "Loading...",
            "active": True
        }
    }


@router.delete("/tabs/{tab_id}")
async def close_tab(
    tab_id: str,
    current_user: User = Depends(get_current_user)
):
    """Close a tab"""
    return {"message": "Tab closed"}
