"""Job scheduler implementation"""
import asyncio
import logging
from datetime import datetime
from typing import List, Optional

from operator_engine.jobs import Job, JobStatus, job_registry
from operator_engine.config import settings

logger = logging.getLogger(__name__)


class Scheduler:
    """
    Job scheduler that manages execution of scheduled and ad-hoc jobs

    This is a simple in-memory scheduler. In production, this would
    integrate with a proper job queue like Celery, RQ, or APScheduler.
    """

    def __init__(self):
        self.running = False
        self.interval = settings.SCHEDULER_INTERVAL_SECONDS

    async def run_due_jobs(self) -> List[Job]:
        """
        Check for jobs that are due and execute them

        Returns:
            List of jobs that were executed
        """
        executed_jobs = []

        for job in job_registry.list_jobs():
            # Skip jobs that are already running or completed
            if job.status in [JobStatus.RUNNING, JobStatus.COMPLETED]:
                continue

            # For now, we don't actually execute jobs - just log
            logger.info(f"Job '{job.name}' would run here (schedule: {job.schedule})")
            executed_jobs.append(job)

        return executed_jobs

    async def execute_job(self, job_id: str) -> Optional[Job]:
        """
        Execute a specific job by ID

        Args:
            job_id: Job identifier

        Returns:
            Updated job object or None if not found
        """
        job = job_registry.get_job(job_id)
        if not job:
            logger.error(f"Job {job_id} not found")
            return None

        logger.info(f"Executing job: {job.name} ({job.id})")

        # Update job status
        job_registry.update_job(
            job_id, status=JobStatus.RUNNING, started_at=datetime.utcnow()
        )

        try:
            # TODO: Actual job execution logic goes here
            # For now, just simulate success
            await asyncio.sleep(0.1)

            result = {
                "status": "success",
                "message": f"Job {job.name} executed successfully (stub)",
            }

            job_registry.update_job(
                job_id,
                status=JobStatus.COMPLETED,
                completed_at=datetime.utcnow(),
                result=result,
            )

            logger.info(f"Job {job.name} completed successfully")

        except Exception as e:
            logger.error(f"Job {job.name} failed: {str(e)}")
            job_registry.update_job(
                job_id,
                status=JobStatus.FAILED,
                completed_at=datetime.utcnow(),
                error=str(e),
            )

        return job_registry.get_job(job_id)

    async def start(self):
        """Start the scheduler loop"""
        self.running = True
        logger.info(f"Scheduler started (interval: {self.interval}s)")

        while self.running:
            try:
                await self.run_due_jobs()
                await asyncio.sleep(self.interval)
            except Exception as e:
                logger.error(f"Scheduler error: {str(e)}")
                await asyncio.sleep(self.interval)

    def stop(self):
        """Stop the scheduler"""
        self.running = False
        logger.info("Scheduler stopped")

    def get_status(self) -> dict:
        """Get scheduler status"""
        jobs = job_registry.list_jobs()
        return {
            "running": self.running,
            "interval_seconds": self.interval,
            "total_jobs": len(jobs),
            "pending_jobs": len([j for j in jobs if j.status == JobStatus.PENDING]),
            "running_jobs": len([j for j in jobs if j.status == JobStatus.RUNNING]),
            "completed_jobs": len([j for j in jobs if j.status == JobStatus.COMPLETED]),
            "failed_jobs": len([j for j in jobs if j.status == JobStatus.FAILED]),
        }


# Global scheduler instance
scheduler = Scheduler()
