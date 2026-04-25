"""
Cognition Database Models

Models for storing:
- Workflows and their execution history
- Reasoning traces from agents
- Agent memory/context
- Prompt registry

Tables:
- workflows: Workflow definitions and execution status
- workflow_executions: History of workflow runs
- reasoning_traces: Agent reasoning step records
- agent_memory: Shared memory/context across workflow
- prompt_registry: Registered agent prompts
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.types import TypeDecorator, CHAR
import uuid
import enum

from ..database import Base


class GUID(TypeDecorator):
    """Platform-independent GUID/UUID type.

    Stores UUIDs as native UUID type on PostgreSQL and as 36-character
    strings on other databases (e.g., SQLite used in tests).
    """

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PGGUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value if dialect.name == "postgresql" else str(value)
        return str(uuid.UUID(value))

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return uuid.UUID(value)


class JSONBCompat(TypeDecorator):
    """JSONB that falls back to generic JSON on non-Postgres engines."""

    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(JSONB)
        return dialect.type_descriptor(JSON())


class WorkflowStatus(str, enum.Enum):
    """Workflow execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ExecutionMode(str, enum.Enum):
    """Workflow execution mode"""
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    RECURSIVE = "recursive"


class Workflow(Base):
    """
    Workflow Definition

    Stores multi-agent workflow definitions.
    """
    __tablename__ = "workflows"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text)

    # Workflow configuration
    mode = Column(Enum(ExecutionMode), default=ExecutionMode.SEQUENTIAL, nullable=False)
    steps = Column(JSONBCompat(), nullable=False)  # List of workflow steps
    timeout_seconds = Column(Integer, default=600)

    # Metadata
    created_by = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    is_template = Column(Boolean, default=False)

    # Tags for categorization
    tags = Column(JSONBCompat(), default=list)

    # Relationships
    executions = relationship("WorkflowExecution", back_populates="workflow", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Workflow(id={self.id}, name={self.name}, mode={self.mode})>"


class WorkflowExecution(Base):
    """
    Workflow Execution Record

    Stores history of workflow executions with results.
    """
    __tablename__ = "workflow_executions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(GUID(), ForeignKey("workflows.id"), nullable=False, index=True)

    # Execution details
    status = Column(Enum(WorkflowStatus), default=WorkflowStatus.PENDING, nullable=False, index=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    completed_at = Column(DateTime)
    duration_seconds = Column(Float)

    # Results
    step_results = Column(JSONBCompat())  # Results from each step
    error_message = Column(Text)
    error_details = Column(JSONBCompat())

    # Metrics
    overall_confidence = Column(Float)
    total_agents_used = Column(Integer)

    # Context
    initial_context = Column(JSONBCompat())
    final_memory = Column(JSONBCompat())

    # Relationships
    workflow = relationship("Workflow", back_populates="executions")
    reasoning_traces = relationship("ReasoningTrace", back_populates="execution", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<WorkflowExecution(id={self.id}, workflow_id={self.workflow_id}, status={self.status})>"


class ReasoningTrace(Base):
    """
    Reasoning Trace Step

    Stores individual reasoning steps from agent execution.
    Provides transparency into how agents arrived at decisions.
    """
    __tablename__ = "reasoning_traces"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    execution_id = Column(GUID(), ForeignKey("workflow_executions.id"), nullable=False, index=True)

    # Step identification
    workflow_step_name = Column(String(100), nullable=False)
    agent_name = Column(String(50), nullable=False, index=True)
    step_number = Column(Integer, nullable=False)
    step_name = Column(String(100), nullable=False)
    step_emoji = Column(String(10))

    # Reasoning data
    input_context = Column(Text)
    output = Column(Text)
    confidence_score = Column(Float)

    # Additional metadata
    trace_metadata = Column("metadata", JSONBCompat())
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    execution = relationship("WorkflowExecution", back_populates="reasoning_traces")

    def __repr__(self):
        return f"<ReasoningTrace(id={self.id}, agent={self.agent_name}, step={self.step_name})>"


class AgentMemory(Base):
    """
    Agent Memory/Context

    Stores shared context and memory across workflow execution.
    Enables agents to build upon each other's work.
    """
    __tablename__ = "agent_memory"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    execution_id = Column(GUID(), ForeignKey("workflow_executions.id"), index=True)

    # Memory data
    context = Column(JSONBCompat(), nullable=False)  # Shared context dictionary
    confidence_scores = Column(JSONBCompat())  # Confidence per step

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Memory can be associated with user sessions
    session_id = Column(String(100), index=True)
    user_id = Column(String(100), index=True)

    # TTL for memory expiration
    expires_at = Column(DateTime)

    def __repr__(self):
        return f"<AgentMemory(id={self.id}, execution_id={self.execution_id})>"


class PromptRegistry(Base):
    """
    Prompt Registry

    Stores registered agent prompts (summon spells).
    Enables versioning and management of agent invocation prompts.
    """
    __tablename__ = "prompt_registry"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    # Prompt identification
    agent_name = Column(String(50), nullable=False, index=True)
    prompt_name = Column(String(100))
    prompt_text = Column(Text, nullable=False)

    # Versioning
    version = Column(String(20), nullable=False)
    is_active = Column(Boolean, default=True, index=True)

    # Metadata
    description = Column(Text)
    prompt_metadata = Column("metadata", JSONBCompat())  # Author, purpose, etc.
    tags = Column(JSONBCompat(), default=list)

    # Usage stats
    usage_count = Column(Integer, default=0)
    last_used_at = Column(DateTime)
    average_confidence = Column(Float)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(100))

    def __repr__(self):
        return f"<PromptRegistry(id={self.id}, agent={self.agent_name}, version={self.version})>"


class AgentPerformanceMetric(Base):
    """
    Agent Performance Metrics

    Tracks performance metrics for agents over time.
    Enables monitoring and optimization.
    """
    __tablename__ = "agent_performance_metrics"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    # Agent identification
    agent_name = Column(String(50), nullable=False, index=True)
    execution_id = Column(GUID(), ForeignKey("workflow_executions.id"), index=True)

    # Performance metrics
    execution_time_seconds = Column(Float)
    confidence_score = Column(Float)
    success = Column(Boolean, default=True)

    # Resource usage (if available)
    memory_usage_mb = Column(Float)
    api_calls_made = Column(Integer)

    # Quality metrics
    reasoning_steps_count = Column(Integer)
    complexity_score = Column(Float)

    # Timestamps
    measured_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self):
        return f"<AgentPerformanceMetric(agent={self.agent_name}, confidence={self.confidence_score})>"
