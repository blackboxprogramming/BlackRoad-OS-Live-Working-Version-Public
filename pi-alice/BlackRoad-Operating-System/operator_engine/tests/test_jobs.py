"""Tests for job management"""
import pytest
from operator_engine.jobs import Job, JobStatus, JobRegistry


def test_job_creation():
    """Test creating a job"""
    job = Job(name="Test Job", schedule="*/5 * * * *")

    assert job.name == "Test Job"
    assert job.schedule == "*/5 * * * *"
    assert job.status == JobStatus.PENDING
    assert job.id is not None


def test_job_to_dict():
    """Test job serialization"""
    job = Job(name="Test Job")
    data = job.to_dict()

    assert data["name"] == "Test Job"
    assert data["status"] == "pending"
    assert "id" in data
    assert "created_at" in data


def test_job_registry():
    """Test job registry operations"""
    registry = JobRegistry()

    # Should have example jobs
    jobs = registry.list_jobs()
    assert len(jobs) > 0

    # Add new job
    new_job = Job(name="New Test Job")
    added_job = registry.add_job(new_job)
    assert added_job.id == new_job.id

    # Get job
    retrieved_job = registry.get_job(new_job.id)
    assert retrieved_job is not None
    assert retrieved_job.name == "New Test Job"

    # Update job
    updated_job = registry.update_job(new_job.id, status=JobStatus.RUNNING)
    assert updated_job is not None
    assert updated_job.status == JobStatus.RUNNING

    # Remove job
    removed = registry.remove_job(new_job.id)
    assert removed is True
    assert registry.get_job(new_job.id) is None
