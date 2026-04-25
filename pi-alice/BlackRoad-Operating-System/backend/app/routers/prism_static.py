"""Prism Console Static File Serving Router"""
from fastapi import APIRouter
from fastapi.responses import FileResponse, HTMLResponse
from pathlib import Path
router = APIRouter(tags=["prism"])

# Get the static prism directory path
STATIC_DIR = Path(__file__).parent.parent.parent / "static"
PRISM_DIR = STATIC_DIR / "prism"


@router.get("/prism", response_class=HTMLResponse)
async def serve_prism_console():
    """
    Serve the Prism Console UI entry point

    Prism Console is the administrative interface for BlackRoad OS,
    providing job queue management, event logging, and system metrics.
    """
    prism_index = PRISM_DIR / "index.html"

    if not prism_index.exists():
        # Fallback: serve a placeholder page
        return HTMLResponse(content="""
<!DOCTYPE html>
<html>
<head>
    <title>Prism Console - Coming Soon</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
        }
        h1 { font-size: 3rem; margin: 0; }
        p { font-size: 1.2rem; margin: 1rem 0; }
        .logo { font-size: 5rem; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🌌</div>
        <h1>Prism Console</h1>
        <p>The Administrative Interface for BlackRoad OS</p>
        <p><em>Coming soon in Phase 2...</em></p>
        <p><a href="/" style="color: white;">← Back to OS</a></p>
    </div>
</body>
</html>
        """, status_code=200)

    # Serve the actual Prism Console index.html
    return FileResponse(prism_index)


@router.get("/prism/health")
async def prism_health():
    """Health endpoint for Prism Console assets."""
    return {
        "service": "prism-console",
        "status": "healthy",
    }


@router.get("/prism/{file_path:path}")
async def serve_prism_static_files(file_path: str):
    """
    Serve static files for Prism Console (JS, CSS, images, etc.)

    This endpoint handles all asset requests for the Prism Console UI.
    """
    # Security: Prevent directory traversal
    requested_file = PRISM_DIR / file_path

    # Ensure the requested file is within the prism directory
    try:
        resolved = requested_file.resolve()
        if not str(resolved).startswith(str(PRISM_DIR.resolve())):
            return HTMLResponse(content="Access denied", status_code=403)
    except Exception:
        return HTMLResponse(content="File not found", status_code=404)

    if not requested_file.exists() or not requested_file.is_file():
        return HTMLResponse(content="File not found", status_code=404)

    # Serve the file with appropriate MIME type
    return FileResponse(requested_file)
