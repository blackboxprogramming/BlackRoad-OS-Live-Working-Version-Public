"""File storage (File Explorer) routes"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File as FastAPIFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import secrets

from app.database import get_db
from app.models.user import User
from app.models.file import File, Folder
from app.auth import get_current_active_user
from app.utils import utc_now

router = APIRouter(prefix="/api/files", tags=["Files"])


class FolderCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None


class FolderResponse(BaseModel):
    id: int
    name: str
    parent_id: Optional[int]
    path: str
    is_shared: bool
    created_at: datetime

    class Config:
        from_attributes = True


class FileResponse(BaseModel):
    id: int
    name: str
    original_name: str
    file_type: Optional[str]
    extension: Optional[str]
    size: int
    storage_url: Optional[str]
    is_shared: bool
    is_public: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


@router.get("/folders", response_model=List[FolderResponse])
async def get_folders(
    parent_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get folders"""
    query = select(Folder).where(Folder.user_id == current_user.id)

    if parent_id:
        query = query.where(Folder.parent_id == parent_id)
    else:
        query = query.where(Folder.parent_id.is_(None))

    result = await db.execute(query.order_by(Folder.name))
    folders = result.scalars().all()

    return folders


@router.post("/folders", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder_data: FolderCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a folder"""
    # Build path
    path = f"/{folder_data.name}"
    if folder_data.parent_id:
        result = await db.execute(
            select(Folder).where(
                and_(
                    Folder.id == folder_data.parent_id,
                    Folder.user_id == current_user.id
                )
            )
        )
        parent = result.scalar_one_or_none()

        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent folder not found"
            )

        path = f"{parent.path}/{folder_data.name}"

    folder = Folder(
        user_id=current_user.id,
        name=folder_data.name,
        parent_id=folder_data.parent_id,
        path=path
    )

    db.add(folder)
    await db.commit()
    await db.refresh(folder)

    return folder


@router.get("/", response_model=List[FileResponse])
async def get_files(
    folder_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 100,
    offset: int = 0
):
    """Get files"""
    query = select(File).where(File.user_id == current_user.id)

    if folder_id:
        query = query.where(File.folder_id == folder_id)
    else:
        query = query.where(File.folder_id.is_(None))

    result = await db.execute(
        query.order_by(File.name).limit(limit).offset(offset)
    )
    files = result.scalars().all()

    return files


@router.post("/upload", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    folder_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a file"""
    # Read file content
    content = await file.read()
    file_size = len(content)

    # Generate unique filename
    extension = file.filename.split('.')[-1] if '.' in file.filename else ''
    unique_name = f"{secrets.token_hex(16)}.{extension}" if extension else secrets.token_hex(16)

    # In production, upload to S3 here
    storage_key = f"uploads/{current_user.id}/{unique_name}"
    storage_url = f"https://storage.blackroad.com/{storage_key}"  # Placeholder

    # Get folder path if specified
    path = f"/{file.filename}"
    if folder_id:
        result = await db.execute(
            select(Folder).where(
                and_(
                    Folder.id == folder_id,
                    Folder.user_id == current_user.id
                )
            )
        )
        folder = result.scalar_one_or_none()
        if folder:
            path = f"{folder.path}/{file.filename}"

    file_record = File(
        user_id=current_user.id,
        folder_id=folder_id,
        name=unique_name,
        original_name=file.filename,
        path=path,
        file_type=file.content_type,
        extension=extension,
        size=file_size,
        storage_key=storage_key,
        storage_url=storage_url
    )

    db.add(file_record)
    await db.commit()
    await db.refresh(file_record)

    return file_record


@router.get("/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a file"""
    result = await db.execute(
        select(File).where(
            and_(
                File.id == file_id,
                or_(
                    File.user_id == current_user.id,
                    File.is_public == True
                )
            )
        )
    )
    file = result.scalar_one_or_none()

    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    # Update last accessed
    file.last_accessed = utc_now()
    await db.commit()

    return file


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a file"""
    result = await db.execute(
        select(File).where(
            and_(
                File.id == file_id,
                File.user_id == current_user.id
            )
        )
    )
    file = result.scalar_one_or_none()

    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    # In production, delete from S3 here

    await db.delete(file)
    await db.commit()

    return None


@router.post("/{file_id}/share")
async def share_file(
    file_id: int,
    is_public: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Share a file"""
    result = await db.execute(
        select(File).where(
            and_(
                File.id == file_id,
                File.user_id == current_user.id
            )
        )
    )
    file = result.scalar_one_or_none()

    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    file.is_shared = True
    file.is_public = is_public

    if not file.share_token:
        file.share_token = secrets.token_urlsafe(32)

    await db.commit()

    return {
        "share_token": file.share_token,
        "share_url": f"https://blackroad.com/files/shared/{file.share_token}"
    }
