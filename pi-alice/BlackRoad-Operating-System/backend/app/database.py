"""Database configuration and session management"""
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Sync engine for migrations
sync_engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG
)

# Async engine for application
async_engine = create_async_engine(
    settings.DATABASE_ASYNC_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG,
    future=True
)

# Session makers
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()


# Dependency for getting DB session
async def get_db():
    """Get async database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_sync_db():
    """Get sync database session (for migrations)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
