"""
VS Code / Monaco Editor Integration API Router

Provides code editing capabilities:
- File editing with syntax highlighting
- Project file tree
- Code snippets
- Language server features
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from ..database import get_db
from ..auth import get_current_user
from ..models import User, File, Folder
from ..utils import utc_now
from pydantic import BaseModel

router = APIRouter(prefix="/api/vscode", tags=["vscode"])


class CodeFile(BaseModel):
    name: str
    path: str
    content: str
    language: str = "plaintext"
    folder_id: Optional[int] = None


class CodeSnippet(BaseModel):
    name: str
    language: str
    code: str
    description: Optional[str] = None


@router.get("/files")
async def list_code_files(
    folder_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all code files in the user's workspace"""
    query = select(File).where(File.user_id == current_user.id)

    if folder_id:
        query = query.where(File.folder_id == folder_id)

    result = await db.execute(query)
    files = result.scalars().all()

    return {
        "files": [
            {
                "id": f.id,
                "name": f.name,
                "path": f.path,
                "size": f.size,
                "mime_type": f.file_type or None,
                "folder_id": f.folder_id,
                "created_at": f.created_at.isoformat(),
                "updated_at": f.updated_at.isoformat(),
                "language": detect_language(f.name)
            }
            for f in files
        ],
        "total": len(files)
    }


@router.get("/files/{file_id}/content")
async def get_file_content(
    file_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get file content for editing"""
    result = await db.execute(
        select(File).where(File.id == file_id, File.user_id == current_user.id)
    )
    file = result.scalar_one_or_none()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # In a real implementation, fetch content from S3 or file system
    # For now, return metadata
    return {
        "id": file.id,
        "name": file.name,
        "path": file.path,
        "language": detect_language(file.name),
        "content": "// File content would be loaded here\n// from S3 or file system",
        "metadata": {
            "size": file.size,
            "mime_type": file.file_type or None,
            "created_at": file.created_at.isoformat(),
            "updated_at": file.updated_at.isoformat()
        }
    }


@router.put("/files/{file_id}/content")
async def update_file_content(
    file_id: int,
    content: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update file content"""
    result = await db.execute(
        select(File).where(File.id == file_id, File.user_id == current_user.id)
    )
    file = result.scalar_one_or_none()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # In a real implementation, save to S3 or file system
    file.updated_at = utc_now()
    file.size = len(content.encode('utf-8'))

    await db.commit()

    return {
        "message": "File updated successfully",
        "file_id": file.id,
        "size": file.size
    }


@router.get("/tree")
async def get_file_tree(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get hierarchical file tree for the sidebar"""
    # Get all folders
    folders_result = await db.execute(
        select(Folder).where(Folder.user_id == current_user.id)
    )
    folders = folders_result.scalars().all()

    # Get all files
    files_result = await db.execute(
        select(File).where(File.user_id == current_user.id)
    )
    files = files_result.scalars().all()

    # Build tree structure
    def build_tree():
        tree = []
        folder_map = {}

        # Create folder nodes
        for folder in folders:
            folder_node = {
                "id": f"folder-{folder.id}",
                "name": folder.name,
                "type": "folder",
                "path": folder.path,
                "children": []
            }
            folder_map[folder.id] = folder_node

            if folder.parent_id is None:
                tree.append(folder_node)
            else:
                parent = folder_map.get(folder.parent_id)
                if parent:
                    parent["children"].append(folder_node)

        # Add files to folders
        for file in files:
            file_node = {
                "id": f"file-{file.id}",
                "name": file.name,
                "type": "file",
                "path": file.path,
                "language": detect_language(file.name),
                "size": file.size
            }

            if file.folder_id:
                folder = folder_map.get(file.folder_id)
                if folder:
                    folder["children"].append(file_node)
            else:
                tree.append(file_node)

        return tree

    return {"tree": build_tree()}


@router.get("/languages")
async def list_supported_languages(
    current_user: User = Depends(get_current_user)
):
    """List all supported programming languages"""
    languages = [
        {"id": "javascript", "name": "JavaScript", "extensions": [".js", ".jsx"]},
        {"id": "typescript", "name": "TypeScript", "extensions": [".ts", ".tsx"]},
        {"id": "python", "name": "Python", "extensions": [".py"]},
        {"id": "java", "name": "Java", "extensions": [".java"]},
        {"id": "csharp", "name": "C#", "extensions": [".cs"]},
        {"id": "cpp", "name": "C++", "extensions": [".cpp", ".hpp", ".h"]},
        {"id": "c", "name": "C", "extensions": [".c", ".h"]},
        {"id": "go", "name": "Go", "extensions": [".go"]},
        {"id": "rust", "name": "Rust", "extensions": [".rs"]},
        {"id": "ruby", "name": "Ruby", "extensions": [".rb"]},
        {"id": "php", "name": "PHP", "extensions": [".php"]},
        {"id": "html", "name": "HTML", "extensions": [".html", ".htm"]},
        {"id": "css", "name": "CSS", "extensions": [".css"]},
        {"id": "scss", "name": "SCSS", "extensions": [".scss"]},
        {"id": "json", "name": "JSON", "extensions": [".json"]},
        {"id": "yaml", "name": "YAML", "extensions": [".yaml", ".yml"]},
        {"id": "markdown", "name": "Markdown", "extensions": [".md"]},
        {"id": "sql", "name": "SQL", "extensions": [".sql"]},
        {"id": "shell", "name": "Shell", "extensions": [".sh", ".bash"]},
        {"id": "dockerfile", "name": "Dockerfile", "extensions": ["Dockerfile"]},
    ]

    return {"languages": languages}


@router.get("/snippets")
async def list_snippets(
    language: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get code snippets"""
    # Default snippets for various languages
    snippets = {
        "python": [
            {
                "name": "Function",
                "prefix": "def",
                "code": "def ${1:function_name}(${2:params}):\n    ${3:pass}"
            },
            {
                "name": "Class",
                "prefix": "class",
                "code": "class ${1:ClassName}:\n    def __init__(self, ${2:params}):\n        ${3:pass}"
            },
            {
                "name": "For Loop",
                "prefix": "for",
                "code": "for ${1:item} in ${2:iterable}:\n    ${3:pass}"
            }
        ],
        "javascript": [
            {
                "name": "Function",
                "prefix": "func",
                "code": "function ${1:functionName}(${2:params}) {\n    ${3:// code}\n}"
            },
            {
                "name": "Arrow Function",
                "prefix": "arrow",
                "code": "const ${1:functionName} = (${2:params}) => {\n    ${3:// code}\n}"
            },
            {
                "name": "Class",
                "prefix": "class",
                "code": "class ${1:ClassName} {\n    constructor(${2:params}) {\n        ${3:// code}\n    }\n}"
            }
        ],
        "go": [
            {
                "name": "Function",
                "prefix": "func",
                "code": "func ${1:functionName}(${2:params}) ${3:returnType} {\n    ${4:// code}\n}"
            },
            {
                "name": "Struct",
                "prefix": "struct",
                "code": "type ${1:StructName} struct {\n    ${2:// fields}\n}"
            }
        ]
    }

    if language:
        return {"snippets": snippets.get(language, [])}

    return {"snippets": snippets}


@router.get("/themes")
async def list_themes(
    current_user: User = Depends(get_current_user)
):
    """List available editor themes"""
    themes = [
        {"id": "vs", "name": "Visual Studio Light"},
        {"id": "vs-dark", "name": "Visual Studio Dark"},
        {"id": "hc-black", "name": "High Contrast Dark"},
        {"id": "monokai", "name": "Monokai"},
        {"id": "github", "name": "GitHub"},
        {"id": "solarized-dark", "name": "Solarized Dark"},
        {"id": "solarized-light", "name": "Solarized Light"},
    ]

    return {"themes": themes}


def detect_language(filename: str) -> str:
    """Detect programming language from file extension"""
    extension_map = {
        ".js": "javascript",
        ".jsx": "javascript",
        ".ts": "typescript",
        ".tsx": "typescript",
        ".py": "python",
        ".java": "java",
        ".cs": "csharp",
        ".cpp": "cpp",
        ".hpp": "cpp",
        ".c": "c",
        ".h": "c",
        ".go": "go",
        ".rs": "rust",
        ".rb": "ruby",
        ".php": "php",
        ".html": "html",
        ".htm": "html",
        ".css": "css",
        ".scss": "scss",
        ".json": "json",
        ".yaml": "yaml",
        ".yml": "yaml",
        ".md": "markdown",
        ".sql": "sql",
        ".sh": "shell",
        ".bash": "shell"
    }

    ext = "." + filename.split(".")[-1] if "." in filename else ""
    return extension_map.get(ext.lower(), "plaintext")
