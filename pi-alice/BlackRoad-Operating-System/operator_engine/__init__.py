"""
BlackRoad Operator Engine

Workflow orchestration, job scheduling, and autonomous agent execution.
The operator engine handles all GitHub PR interactions, merge queue management,
and automated workflows for the BlackRoad OS ecosystem.
"""

__version__ = "0.1.0"
__author__ = "BlackRoad OS Team"

from operator_engine.jobs import Job, JobStatus
from operator_engine.scheduler import Scheduler

__all__ = ["Job", "JobStatus", "Scheduler"]
