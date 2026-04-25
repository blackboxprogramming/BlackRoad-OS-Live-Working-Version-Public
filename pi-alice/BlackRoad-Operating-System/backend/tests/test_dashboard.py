"""Tests for dashboard overview statistics"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.social import Post
from app.models.video import Video
from app.models.device import Device


@pytest.mark.asyncio
async def test_dashboard_overview_reflects_user_content(
    client: AsyncClient,
    auth_headers,
    db_session: AsyncSession,
    test_user,
):
    """Ensure the dashboard aggregates posts, videos, and devices correctly."""

    user_id = test_user["id"]

    posts = [
        Post(user_id=user_id, content="Post A"),
        Post(user_id=user_id, content="Post B"),
    ]

    videos = [
        Video(user_id=user_id, title="Video 1", video_url="http://example.com/1", views_count=10),
        Video(user_id=user_id, title="Video 2", video_url="http://example.com/2", views_count=25),
    ]

    devices = [
        Device(
            device_id="dev-1",
            name="Living Room Pi",
            device_type="pi4",
            owner_id=user_id,
            is_online=True,
        ),
        Device(
            device_id="dev-2",
            name="Bedroom Pi",
            device_type="pi4",
            owner_id=user_id,
            is_online=False,
        ),
    ]

    db_session.add_all(posts + videos + devices)
    await db_session.commit()

    response = await client.get("/api/dashboard/overview", headers=auth_headers)
    assert response.status_code == 200
    payload = response.json()

    def get_service(name: str):
        return next(service for service in payload["services"] if service["name"] == name)

    social_stats = get_service("Social Media")["stats"]
    assert social_stats["posts"] == len(posts)

    video_stats = get_service("Video Platform")["stats"]
    assert video_stats["videos"] == len(videos)
    assert video_stats["views"] == sum(video.views_count for video in videos)

    device_stats = get_service("Devices (IoT/Pi)")["stats"]
    assert device_stats["total"] == len(devices)
    assert device_stats["online"] == sum(1 for device in devices if device.is_online)
