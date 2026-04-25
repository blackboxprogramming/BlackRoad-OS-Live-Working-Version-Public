"""
PR Action Types

Defines all possible actions that can be taken on GitHub PRs.
These replace manual button clicks with automated queue-based processing.
"""

from enum import Enum
from typing import Dict, Any
from dataclasses import dataclass
from datetime import datetime


class PRActionType(Enum):
    """All supported PR actions"""

    # Comment actions
    RESOLVE_COMMENT = "resolve_comment"
    CREATE_COMMENT = "create_comment"
    EDIT_COMMENT = "edit_comment"
    DELETE_COMMENT = "delete_comment"

    # Code suggestion actions
    APPLY_SUGGESTION = "apply_suggestion"
    COMMIT_SUGGESTION = "commit_suggestion"
    BATCH_SUGGESTIONS = "batch_suggestions"

    # Branch actions
    UPDATE_BRANCH = "update_branch"
    REBASE_BRANCH = "rebase_branch"
    SQUASH_COMMITS = "squash_commits"

    # Check actions
    RERUN_CHECKS = "rerun_checks"
    RERUN_FAILED_CHECKS = "rerun_failed_checks"
    SKIP_CHECKS = "skip_checks"

    # Review actions
    REQUEST_REVIEW = "request_review"
    APPROVE_PR = "approve_pr"
    REQUEST_CHANGES = "request_changes"
    DISMISS_REVIEW = "dismiss_review"

    # Label actions
    ADD_LABEL = "add_label"
    REMOVE_LABEL = "remove_label"
    SYNC_LABELS = "sync_labels"

    # Merge actions
    MERGE_PR = "merge_pr"
    SQUASH_MERGE = "squash_merge"
    REBASE_MERGE = "rebase_merge"
    ADD_TO_MERGE_QUEUE = "add_to_merge_queue"
    REMOVE_FROM_MERGE_QUEUE = "remove_from_merge_queue"

    # Issue actions
    OPEN_ISSUE = "open_issue"
    CLOSE_ISSUE = "close_issue"
    LINK_ISSUE = "link_issue"

    # Assignment actions
    ASSIGN_USER = "assign_user"
    UNASSIGN_USER = "unassign_user"

    # Milestone actions
    ADD_TO_MILESTONE = "add_to_milestone"
    REMOVE_FROM_MILESTONE = "remove_from_milestone"


class PRActionPriority(Enum):
    """Priority levels for PR actions"""
    CRITICAL = 5  # Security fixes, hotfixes
    HIGH = 4      # Breaking changes, major features
    NORMAL = 3    # Regular features, bug fixes
    LOW = 2       # Docs, tests, refactoring
    BACKGROUND = 1  # Automated cleanup, sync


class PRActionStatus(Enum):
    """Status of a PR action in the queue"""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RETRYING = "retrying"


@dataclass
class PRAction:
    """Represents a single PR action to be executed"""

    # Identity
    action_id: str
    action_type: PRActionType

    # Target
    repo_owner: str
    repo_name: str
    pr_number: int

    # Action details
    params: Dict[str, Any]

    # Queue metadata
    priority: PRActionPriority
    status: PRActionStatus
    created_at: datetime
    updated_at: datetime

    # Execution tracking
    attempts: int = 0
    max_attempts: int = 3
    error_message: str = None
    result: Dict[str, Any] = None

    # Context
    triggered_by: str = None  # user, webhook, automation
    parent_action_id: str = None  # for chained actions

    def __post_init__(self):
        """Validate action on creation"""
        if self.attempts > self.max_attempts:
            raise ValueError(f"Action {self.action_id} exceeded max attempts")

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "action_id": self.action_id,
            "action_type": self.action_type.value,
            "repo_owner": self.repo_owner,
            "repo_name": self.repo_name,
            "pr_number": self.pr_number,
            "params": self.params,
            "priority": self.priority.value,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "attempts": self.attempts,
            "max_attempts": self.max_attempts,
            "error_message": self.error_message,
            "result": self.result,
            "triggered_by": self.triggered_by,
            "parent_action_id": self.parent_action_id,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PRAction":
        """Create from dictionary"""
        return cls(
            action_id=data["action_id"],
            action_type=PRActionType(data["action_type"]),
            repo_owner=data["repo_owner"],
            repo_name=data["repo_name"],
            pr_number=data["pr_number"],
            params=data["params"],
            priority=PRActionPriority(data["priority"]),
            status=PRActionStatus(data["status"]),
            created_at=datetime.fromisoformat(data["created_at"]),
            updated_at=datetime.fromisoformat(data["updated_at"]),
            attempts=data.get("attempts", 0),
            max_attempts=data.get("max_attempts", 3),
            error_message=data.get("error_message"),
            result=data.get("result"),
            triggered_by=data.get("triggered_by"),
            parent_action_id=data.get("parent_action_id"),
        )


# Action type to priority mapping (defaults)
ACTION_PRIORITY_MAP = {
    # Critical
    PRActionType.RERUN_FAILED_CHECKS: PRActionPriority.CRITICAL,
    PRActionType.MERGE_PR: PRActionPriority.CRITICAL,

    # High
    PRActionType.APPLY_SUGGESTION: PRActionPriority.HIGH,
    PRActionType.COMMIT_SUGGESTION: PRActionPriority.HIGH,
    PRActionType.UPDATE_BRANCH: PRActionPriority.HIGH,
    PRActionType.REBASE_BRANCH: PRActionPriority.HIGH,

    # Normal
    PRActionType.RESOLVE_COMMENT: PRActionPriority.NORMAL,
    PRActionType.CREATE_COMMENT: PRActionPriority.NORMAL,
    PRActionType.REQUEST_REVIEW: PRActionPriority.NORMAL,
    PRActionType.APPROVE_PR: PRActionPriority.NORMAL,
    PRActionType.RERUN_CHECKS: PRActionPriority.NORMAL,

    # Low
    PRActionType.ADD_LABEL: PRActionPriority.LOW,
    PRActionType.REMOVE_LABEL: PRActionPriority.LOW,
    PRActionType.OPEN_ISSUE: PRActionPriority.LOW,

    # Background
    PRActionType.SYNC_LABELS: PRActionPriority.BACKGROUND,
}


def get_default_priority(action_type: PRActionType) -> PRActionPriority:
    """Get default priority for an action type"""
    return ACTION_PRIORITY_MAP.get(action_type, PRActionPriority.NORMAL)
