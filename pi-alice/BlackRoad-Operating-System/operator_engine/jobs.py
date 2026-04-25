"""Job definitions and registry"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any, List
import uuid


class JobStatus(str, Enum):
    """Job execution status"""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class Job:
    """
    Represents a scheduled or ad-hoc job in the Operator Engine

    Attributes:
        id: Unique job identifier
        name: Human-readable job name
        schedule: Cron-style schedule (e.g., "*/5 * * * *") or None for ad-hoc
        status: Current job status
        created_at: Job creation timestamp
        started_at: Job execution start time
        completed_at: Job completion time
        result: Job execution result
        error: Error message if failed
        metadata: Additional job metadata
    """

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    schedule: Optional[str] = None
    status: JobStatus = JobStatus.PENDING
    created_at: datetime = field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert job to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "schedule": self.schedule,
            "status": self.status.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": (
                self.completed_at.isoformat() if self.completed_at else None
            ),
            "result": self.result,
            "error": self.error,
            "metadata": self.metadata,
        }


class JobRegistry:
    """In-memory job registry"""

    def __init__(self):
        self._jobs: Dict[str, Job] = {}
        self._initialize_example_jobs()

    def _initialize_example_jobs(self):
        """Initialize with example jobs"""
        example_jobs = [
            Job(
                name="Health Check Monitor",
                schedule="*/5 * * * *",  # Every 5 minutes
                metadata={
                    "description": "Monitors system health and sends alerts",
                    "category": "monitoring",
                },
            ),
            Job(
                name="Agent Sync",
                schedule="0 * * * *",  # Every hour
                metadata={
                    "description": "Synchronizes agent library with remote registry",
                    "category": "maintenance",
                },
            ),
            Job(
                name="Blockchain Ledger Sync",
                schedule="0 0 * * *",  # Daily at midnight
                metadata={
                    "description": "Syncs RoadChain ledger with distributed nodes",
                    "category": "blockchain",
                },
            ),
        ]

        for job in example_jobs:
            self._jobs[job.id] = job

    def list_jobs(self) -> List[Job]:
        """Get all jobs"""
        return list(self._jobs.values())

    def get_job(self, job_id: str) -> Optional[Job]:
        """Get job by ID"""
        return self._jobs.get(job_id)

    def add_job(self, job: Job) -> Job:
        """Add new job to registry"""
        self._jobs[job.id] = job
        return job

    def update_job(self, job_id: str, **updates) -> Optional[Job]:
        """Update job attributes"""
        job = self._jobs.get(job_id)
        if not job:
            return None

        for key, value in updates.items():
            if hasattr(job, key):
                setattr(job, key, value)

        return job

    def remove_job(self, job_id: str) -> bool:
        """Remove job from registry"""
        if job_id in self._jobs:
            del self._jobs[job_id]
            return True
        return False


# Global registry instance
job_registry = JobRegistry()
