"""Tests for scheduler"""
import pytest
from operator_engine.scheduler import Scheduler
from operator_engine.jobs import Job, JobStatus, job_registry


@pytest.mark.asyncio
async def test_scheduler_status():
    """Test getting scheduler status"""
    scheduler = Scheduler()
    status = scheduler.get_status()

    assert "running" in status
    assert "total_jobs" in status
    assert "pending_jobs" in status


@pytest.mark.asyncio
async def test_execute_job():
    """Test executing a single job"""
    scheduler = Scheduler()

    # Add a test job
    test_job = Job(name="Test Execution Job")
    job_registry.add_job(test_job)

    # Execute the job
    result = await scheduler.execute_job(test_job.id)

    assert result is not None
    # After execution, job should be completed (in stub mode)
    assert result.status == JobStatus.COMPLETED
    assert result.started_at is not None
    assert result.completed_at is not None

    # Clean up
    job_registry.remove_job(test_job.id)


@pytest.mark.asyncio
async def test_execute_nonexistent_job():
    """Test executing a job that doesn't exist"""
    scheduler = Scheduler()
    result = await scheduler.execute_job("nonexistent-id")
    assert result is None
