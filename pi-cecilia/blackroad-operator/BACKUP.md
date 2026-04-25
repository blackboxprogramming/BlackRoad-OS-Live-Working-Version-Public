# BACKUP.md - Disaster Recovery Guide

> **BlackRoad OS** - Your AI. Your Hardware. Your Rules.
>
> Comprehensive backup and disaster recovery for 30K agent systems.

---

## Table of Contents

1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [Data Categories](#data-categories)
4. [Backup Methods](#backup-methods)
5. [Storage Backends](#storage-backends)
6. [Recovery Procedures](#recovery-procedures)
7. [Point-in-Time Recovery](#point-in-time-recovery)
8. [Testing](#testing)
9. [Automation](#automation)
10. [Monitoring](#monitoring)

---

## Overview

### Disaster Recovery Objectives

| Metric | Target | Description |
|--------|--------|-------------|
| **RPO** | 15 minutes | Maximum data loss |
| **RTO** | 1 hour | Time to restore service |
| **Backup Frequency** | Continuous | Stream + periodic snapshots |
| **Retention** | 90 days | How long backups kept |
| **Geo-redundancy** | 3 regions | Copies across locations |

### Recovery Tiers

```
┌─────────────────────────────────────────────────────────────────┐
│                    Recovery Tier System                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Tier 1: HOT STANDBY (RTO < 5 min)                     │     │
│  │  • Active-passive database replication                  │     │
│  │  • Pre-provisioned failover infrastructure             │     │
│  │  • Automatic DNS failover                               │     │
│  └────────────────────────────────────────────────────────┘     │
│                           │                                      │
│  ┌────────────────────────▼───────────────────────────────┐     │
│  │  Tier 2: WARM RECOVERY (RTO < 30 min)                  │     │
│  │  • Hourly snapshots with WAL shipping                  │     │
│  │  • Infrastructure-as-code deployment                   │     │
│  │  • Semi-automated recovery                             │     │
│  └────────────────────────────────────────────────────────┘     │
│                           │                                      │
│  ┌────────────────────────▼───────────────────────────────┐     │
│  │  Tier 3: COLD RECOVERY (RTO < 4 hrs)                   │     │
│  │  • Daily full backups                                   │     │
│  │  • Manual infrastructure setup                          │     │
│  │  • Full system restore                                  │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backup Strategy

### 3-2-1 Rule

```yaml
backup_strategy:
  rule_3_2_1:
    copies: 3           # At least 3 copies of data
    media_types: 2      # On 2 different storage types
    offsite: 1          # 1 copy offsite/cloud

  implementation:
    copy_1:
      type: primary
      location: PostgreSQL primary
      media: SSD

    copy_2:
      type: replica
      location: PostgreSQL replica
      media: SSD (different server)

    copy_3:
      type: cloud_backup
      location: AWS S3 / Cloudflare R2
      media: Object storage
      region: Different continent
```

### Backup Schedule

```yaml
schedule:
  continuous:
    type: WAL streaming
    target: replica + S3
    lag: < 1 second

  incremental:
    frequency: every 15 minutes
    type: pg_basebackup delta
    retention: 24 hours

  snapshot:
    frequency: hourly
    type: full snapshot
    retention: 7 days

  full_backup:
    frequency: daily at 02:00 UTC
    type: complete system backup
    retention: 90 days

  archive:
    frequency: weekly
    type: compressed archive
    retention: 1 year
    storage: glacier/cold
```

---

## Data Categories

### Critical Data (RPO: 0)

```yaml
critical_data:
  databases:
    - name: PostgreSQL (primary)
      contains:
        - Agent state
        - Task history
        - User data
        - Memory episodic layer
      backup_method: streaming_replication + WAL
      priority: 1

    - name: Redis
      contains:
        - Working memory
        - Session data
        - Real-time state
      backup_method: RDB + AOF
      priority: 1

  secrets:
    - name: Vault
      contains:
        - API keys
        - Encryption keys
        - Certificates
      backup_method: encrypted_snapshot
      priority: 1
```

### Important Data (RPO: 15 min)

```yaml
important_data:
  vector_stores:
    - name: Pinecone/Qdrant
      contains:
        - Semantic memory
        - Embeddings
      backup_method: snapshot + export
      priority: 2

  object_storage:
    - name: R2/S3
      contains:
        - Archival memory
        - Uploaded files
        - Model weights
      backup_method: cross_region_replication
      priority: 2
```

### Operational Data (RPO: 1 hour)

```yaml
operational_data:
  logs:
    - name: Application logs
      backup_method: ship_to_s3
      retention: 30 days

  metrics:
    - name: Prometheus
      backup_method: snapshot
      retention: 90 days

  configs:
    - name: System configuration
      backup_method: git + snapshot
      retention: forever
```

---

## Backup Methods

### PostgreSQL Backup

```python
# blackroad/backup/postgres.py
import subprocess
import os
from datetime import datetime
from pathlib import Path
import boto3

class PostgresBackup:
    """PostgreSQL backup manager."""

    def __init__(self, config: dict):
        self.config = config
        self.s3 = boto3.client('s3')

    def create_base_backup(self, label: str = None) -> str:
        """Create full base backup."""
        label = label or f"base_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        backup_dir = Path(self.config["backup_dir"]) / label

        cmd = [
            "pg_basebackup",
            "-h", self.config["host"],
            "-p", str(self.config["port"]),
            "-U", self.config["user"],
            "-D", str(backup_dir),
            "-Ft",  # tar format
            "-z",   # gzip compression
            "-P",   # progress
            "--wal-method=stream",
            "--label", label
        ]

        subprocess.run(cmd, check=True, env={
            "PGPASSWORD": self.config["password"]
        })

        return str(backup_dir)

    def upload_to_s3(self, backup_path: str) -> str:
        """Upload backup to S3."""
        backup_name = Path(backup_path).name
        s3_key = f"postgres/{datetime.utcnow().strftime('%Y/%m/%d')}/{backup_name}"

        # Upload with server-side encryption
        for file in Path(backup_path).iterdir():
            self.s3.upload_file(
                str(file),
                self.config["s3_bucket"],
                f"{s3_key}/{file.name}",
                ExtraArgs={
                    "ServerSideEncryption": "aws:kms",
                    "StorageClass": "STANDARD_IA"
                }
            )

        return s3_key

    def enable_wal_archiving(self):
        """Enable continuous WAL archiving."""
        archive_cmd = f"archive_command = 'aws s3 cp %p s3://{self.config['s3_bucket']}/wal/%f'"

        # This would be added to postgresql.conf
        return {
            "wal_level": "replica",
            "archive_mode": "on",
            "archive_command": archive_cmd,
            "archive_timeout": "60"  # seconds
        }

    def restore_from_backup(
        self,
        backup_path: str,
        target_time: str = None
    ):
        """Restore database from backup."""
        # Stop PostgreSQL
        subprocess.run(["pg_ctl", "stop", "-D", self.config["data_dir"]])

        # Clear data directory
        data_dir = Path(self.config["data_dir"])
        for item in data_dir.iterdir():
            if item.is_dir():
                shutil.rmtree(item)
            else:
                item.unlink()

        # Extract backup
        subprocess.run([
            "tar", "-xzf",
            f"{backup_path}/base.tar.gz",
            "-C", str(data_dir)
        ])

        # Create recovery configuration
        recovery_conf = data_dir / "recovery.signal"
        recovery_conf.touch()

        postgres_conf = data_dir / "postgresql.auto.conf"
        with open(postgres_conf, "a") as f:
            f.write(f"\nrestore_command = 'aws s3 cp s3://{self.config['s3_bucket']}/wal/%f %p'\n")
            if target_time:
                f.write(f"recovery_target_time = '{target_time}'\n")
                f.write("recovery_target_action = 'promote'\n")

        # Start PostgreSQL
        subprocess.run(["pg_ctl", "start", "-D", self.config["data_dir"]])
```

### Redis Backup

```python
# blackroad/backup/redis.py
import redis
import os
from datetime import datetime

class RedisBackup:
    """Redis backup manager."""

    def __init__(self, config: dict):
        self.config = config
        self.client = redis.Redis(
            host=config["host"],
            port=config["port"],
            password=config.get("password")
        )

    def create_rdb_snapshot(self) -> str:
        """Trigger RDB snapshot."""
        # BGSAVE creates snapshot in background
        self.client.bgsave()

        # Wait for completion
        while self.client.lastsave() == self.last_save:
            time.sleep(0.1)

        rdb_path = self.config.get("rdb_path", "/var/lib/redis/dump.rdb")
        return rdb_path

    def backup_to_s3(self):
        """Backup RDB to S3."""
        rdb_path = self.create_rdb_snapshot()
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')

        # Upload to S3
        s3_key = f"redis/{timestamp}/dump.rdb"
        self.s3.upload_file(
            rdb_path,
            self.config["s3_bucket"],
            s3_key
        )

        return s3_key

    def enable_aof(self):
        """Enable AOF for point-in-time recovery."""
        self.client.config_set("appendonly", "yes")
        self.client.config_set("appendfsync", "everysec")

    def restore_from_rdb(self, rdb_path: str):
        """Restore from RDB file."""
        # Stop Redis
        subprocess.run(["redis-cli", "SHUTDOWN", "NOSAVE"])

        # Copy RDB file
        shutil.copy(rdb_path, self.config.get("rdb_path"))

        # Start Redis
        subprocess.run(["redis-server", self.config["config_file"]])
```

### Vault Backup

```bash
#!/bin/bash
# scripts/backup-vault.sh

set -e

BACKUP_DIR="/backups/vault"
S3_BUCKET="blackroad-backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/vault_$DATE.snap"

echo "Creating Vault snapshot..."

# Create Raft snapshot
vault operator raft snapshot save "$BACKUP_FILE"

# Encrypt with GPG
gpg --encrypt \
    --recipient "backup@blackroad.io" \
    --output "$BACKUP_FILE.gpg" \
    "$BACKUP_FILE"

# Upload to S3
aws s3 cp "$BACKUP_FILE.gpg" \
    "s3://$S3_BUCKET/vault/$DATE/snapshot.gpg" \
    --sse aws:kms

# Cleanup local unencrypted
rm "$BACKUP_FILE"

# Keep last 7 local backups
find "$BACKUP_DIR" -name "*.gpg" -mtime +7 -delete

echo "Vault backup complete: $BACKUP_FILE.gpg"
```

---

## Storage Backends

### Multi-Cloud Storage

```yaml
storage_backends:
  primary:
    provider: cloudflare_r2
    bucket: blackroad-backups
    region: auto
    encryption: AES-256
    features:
      - zero_egress_fees
      - s3_compatible

  secondary:
    provider: aws_s3
    bucket: blackroad-backups-dr
    region: us-west-2
    encryption: aws:kms
    storage_class: STANDARD_IA
    features:
      - cross_region_replication
      - versioning

  archive:
    provider: aws_glacier
    vault: blackroad-archive
    region: eu-west-1
    retrieval_tier: bulk
    features:
      - lowest_cost
      - long_term
```

### Storage Configuration

```python
# blackroad/backup/storage.py
from abc import ABC, abstractmethod
import boto3
from typing import BinaryIO

class BackupStorage(ABC):
    """Abstract backup storage backend."""

    @abstractmethod
    async def upload(self, key: str, data: BinaryIO) -> str:
        pass

    @abstractmethod
    async def download(self, key: str) -> BinaryIO:
        pass

    @abstractmethod
    async def list_backups(self, prefix: str) -> list:
        pass


class R2Storage(BackupStorage):
    """Cloudflare R2 storage backend."""

    def __init__(self, config: dict):
        self.client = boto3.client(
            's3',
            endpoint_url=config["endpoint"],
            aws_access_key_id=config["access_key"],
            aws_secret_access_key=config["secret_key"]
        )
        self.bucket = config["bucket"]

    async def upload(self, key: str, data: BinaryIO) -> str:
        self.client.upload_fileobj(data, self.bucket, key)
        return f"r2://{self.bucket}/{key}"

    async def download(self, key: str) -> BinaryIO:
        import io
        buffer = io.BytesIO()
        self.client.download_fileobj(self.bucket, key, buffer)
        buffer.seek(0)
        return buffer


class MultiBackendStorage(BackupStorage):
    """Write to multiple backends for redundancy."""

    def __init__(self, backends: list[BackupStorage]):
        self.backends = backends

    async def upload(self, key: str, data: BinaryIO) -> list[str]:
        """Upload to all backends."""
        results = []
        for backend in self.backends:
            data.seek(0)  # Reset stream position
            result = await backend.upload(key, data)
            results.append(result)
        return results
```

---

## Recovery Procedures

### Full System Recovery

```bash
#!/bin/bash
# scripts/full-recovery.sh

set -e

echo "=== BlackRoad Full System Recovery ==="
echo "Starting at $(date)"

# 1. Restore infrastructure
echo "Step 1: Provisioning infrastructure..."
cd /opt/blackroad/terraform
terraform init
terraform apply -auto-approve

# 2. Restore Vault (secrets first)
echo "Step 2: Restoring Vault..."
VAULT_BACKUP=$(aws s3 ls s3://blackroad-backups/vault/ | sort | tail -1 | awk '{print $4}')
aws s3 cp "s3://blackroad-backups/vault/$VAULT_BACKUP" /tmp/vault_restore.gpg
gpg --decrypt /tmp/vault_restore.gpg > /tmp/vault_restore.snap
vault operator raft snapshot restore /tmp/vault_restore.snap
vault operator unseal  # Requires key shares

# 3. Restore PostgreSQL
echo "Step 3: Restoring PostgreSQL..."
PG_BACKUP=$(aws s3 ls s3://blackroad-backups/postgres/ | sort | tail -1 | awk '{print $4}')
aws s3 cp "s3://blackroad-backups/postgres/$PG_BACKUP" /tmp/pg_restore/ --recursive
/opt/blackroad/scripts/restore-postgres.sh /tmp/pg_restore/

# 4. Restore Redis
echo "Step 4: Restoring Redis..."
REDIS_BACKUP=$(aws s3 ls s3://blackroad-backups/redis/ | sort | tail -1 | awk '{print $4}')
aws s3 cp "s3://blackroad-backups/redis/$REDIS_BACKUP/dump.rdb" /var/lib/redis/dump.rdb
systemctl restart redis

# 5. Restore vector store
echo "Step 5: Restoring vector store..."
/opt/blackroad/scripts/restore-vectors.sh

# 6. Start services
echo "Step 6: Starting services..."
systemctl start blackroad-api
systemctl start blackroad-agents
systemctl start blackroad-workers

# 7. Verify
echo "Step 7: Running health checks..."
/opt/blackroad/scripts/health-check.sh

echo "=== Recovery Complete ==="
echo "Finished at $(date)"
```

### Database Recovery

```python
# blackroad/backup/recovery.py
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
import subprocess

@dataclass
class RecoveryPlan:
    """Recovery execution plan."""
    target_time: Optional[datetime]
    backup_source: str
    wal_source: str
    estimated_time: int  # minutes
    data_loss: int  # minutes

class DatabaseRecovery:
    """Database recovery manager."""

    def __init__(self, config: dict):
        self.config = config

    def find_best_backup(
        self,
        target_time: datetime = None
    ) -> RecoveryPlan:
        """Find optimal backup for recovery."""
        backups = self.list_available_backups()

        if target_time:
            # Find backup just before target time
            valid_backups = [
                b for b in backups
                if b["timestamp"] < target_time
            ]
            if not valid_backups:
                raise ValueError("No backup available before target time")

            best = max(valid_backups, key=lambda b: b["timestamp"])
        else:
            # Use most recent backup
            best = max(backups, key=lambda b: b["timestamp"])

        # Calculate recovery metrics
        wal_available = self.check_wal_availability(
            best["timestamp"],
            target_time or datetime.utcnow()
        )

        return RecoveryPlan(
            target_time=target_time,
            backup_source=best["path"],
            wal_source=self.config["wal_archive"],
            estimated_time=self._estimate_recovery_time(best),
            data_loss=self._calculate_data_loss(best, wal_available)
        )

    def execute_recovery(self, plan: RecoveryPlan):
        """Execute recovery plan."""
        print(f"Starting recovery from {plan.backup_source}")
        print(f"Target time: {plan.target_time or 'latest'}")
        print(f"Estimated time: {plan.estimated_time} minutes")
        print(f"Expected data loss: {plan.data_loss} minutes")

        # Stop database
        subprocess.run(["pg_ctl", "stop", "-D", self.config["data_dir"]])

        # Clear and restore
        self._clear_data_directory()
        self._restore_base_backup(plan.backup_source)
        self._configure_recovery(plan)

        # Start and wait for recovery
        subprocess.run(["pg_ctl", "start", "-D", self.config["data_dir"]])
        self._wait_for_recovery()

        print("Recovery complete!")
```

### Agent State Recovery

```python
# blackroad/backup/agent_recovery.py
from typing import List, Dict
import json

class AgentStateRecovery:
    """Recover agent state from backups."""

    def __init__(self, db, redis, storage):
        self.db = db
        self.redis = redis
        self.storage = storage

    async def recover_agent(
        self,
        agent_id: str,
        target_time: datetime = None
    ) -> dict:
        """Recover specific agent state."""

        # Get agent checkpoint
        checkpoint = await self._find_checkpoint(agent_id, target_time)

        if not checkpoint:
            raise ValueError(f"No checkpoint found for agent {agent_id}")

        # Restore state to Redis (working memory)
        await self.redis.hmset(
            f"agent:{agent_id}:state",
            checkpoint["working_memory"]
        )

        # Restore episodic memory to PostgreSQL
        await self._restore_episodic_memory(
            agent_id,
            checkpoint["episodic_memory"]
        )

        # Restore agent configuration
        await self.db.execute("""
            UPDATE agents
            SET config = $1, status = 'recovered'
            WHERE id = $2
        """, checkpoint["config"], agent_id)

        return {
            "agent_id": agent_id,
            "recovered_from": checkpoint["timestamp"],
            "state_size": len(json.dumps(checkpoint))
        }

    async def recover_all_agents(
        self,
        target_time: datetime = None
    ) -> List[dict]:
        """Recover all agents from checkpoint."""
        agents = await self.db.fetch("SELECT id FROM agents")

        results = []
        for agent in agents:
            try:
                result = await self.recover_agent(
                    agent["id"],
                    target_time
                )
                results.append(result)
            except Exception as e:
                results.append({
                    "agent_id": agent["id"],
                    "error": str(e)
                })

        return results
```

---

## Point-in-Time Recovery

### PITR Configuration

```yaml
pitr:
  enabled: true

  postgres:
    wal_level: replica
    archive_mode: on
    archive_command: "aws s3 cp %p s3://blackroad-backups/wal/%f"
    archive_timeout: 60

  redis:
    appendonly: yes
    appendfsync: everysec
    aof_rewrite_incremental_fsync: yes

  retention:
    wal_files: 7 days
    checkpoints: 24 hours
    recovery_window: 7 days
```

### PITR Recovery

```python
# blackroad/backup/pitr.py
from datetime import datetime, timedelta

class PointInTimeRecovery:
    """Point-in-time recovery manager."""

    def __init__(self, config: dict):
        self.config = config

    def get_recovery_window(self) -> tuple[datetime, datetime]:
        """Get available recovery time window."""
        oldest_wal = self._find_oldest_wal()
        latest_wal = self._find_latest_wal()

        return (oldest_wal, latest_wal)

    def validate_target_time(self, target: datetime) -> bool:
        """Check if target time is recoverable."""
        window_start, window_end = self.get_recovery_window()
        return window_start <= target <= window_end

    def recover_to_time(self, target: datetime) -> dict:
        """Recover database to specific point in time."""
        if not self.validate_target_time(target):
            raise ValueError(f"Target time {target} outside recovery window")

        # Find base backup before target time
        base_backup = self._find_base_backup_before(target)

        # Create recovery configuration
        recovery_config = {
            "restore_command": f"aws s3 cp s3://{self.config['wal_bucket']}/wal/%f %p",
            "recovery_target_time": target.isoformat(),
            "recovery_target_action": "promote",
            "recovery_target_inclusive": True
        }

        # Execute recovery
        self._execute_pitr_recovery(base_backup, recovery_config)

        return {
            "target_time": target.isoformat(),
            "base_backup": base_backup,
            "status": "recovered"
        }

    def recover_to_transaction(self, xid: int) -> dict:
        """Recover to specific transaction ID."""
        recovery_config = {
            "recovery_target_xid": str(xid),
            "recovery_target_action": "promote"
        }

        base_backup = self._find_latest_base_backup()
        self._execute_pitr_recovery(base_backup, recovery_config)

        return {"target_xid": xid, "status": "recovered"}
```

---

## Testing

### Backup Verification

```python
# blackroad/backup/verification.py
import hashlib
from dataclasses import dataclass
from typing import List

@dataclass
class VerificationResult:
    backup_path: str
    checksum_valid: bool
    restorable: bool
    data_integrity: bool
    errors: List[str]

class BackupVerifier:
    """Verify backup integrity."""

    async def verify_backup(self, backup_path: str) -> VerificationResult:
        """Full backup verification."""
        errors = []

        # 1. Checksum verification
        checksum_valid = await self._verify_checksum(backup_path)
        if not checksum_valid:
            errors.append("Checksum mismatch")

        # 2. Restore test (to temp database)
        restorable = await self._test_restore(backup_path)
        if not restorable:
            errors.append("Restore failed")

        # 3. Data integrity check
        data_integrity = await self._verify_data_integrity(backup_path)
        if not data_integrity:
            errors.append("Data integrity check failed")

        return VerificationResult(
            backup_path=backup_path,
            checksum_valid=checksum_valid,
            restorable=restorable,
            data_integrity=data_integrity,
            errors=errors
        )

    async def _test_restore(self, backup_path: str) -> bool:
        """Test restore to temporary database."""
        try:
            # Create temp database
            temp_db = f"verify_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

            # Restore backup
            await self.pg_backup.restore_to_database(
                backup_path,
                temp_db
            )

            # Run integrity checks
            await self._run_integrity_queries(temp_db)

            # Cleanup
            await self.db.execute(f"DROP DATABASE {temp_db}")

            return True

        except Exception as e:
            logger.error(f"Restore test failed: {e}")
            return False
```

### Disaster Recovery Drills

```bash
#!/bin/bash
# scripts/dr-drill.sh

echo "=== Disaster Recovery Drill ==="
echo "Starting at $(date)"

# Create isolated environment
DRILL_ENV="dr-drill-$(date +%Y%m%d)"

echo "1. Setting up isolated environment..."
terraform workspace new $DRILL_ENV
terraform apply -var="environment=$DRILL_ENV"

echo "2. Simulating disaster..."
# Simulate by using backup from production

echo "3. Executing recovery..."
./scripts/full-recovery.sh --environment=$DRILL_ENV

echo "4. Running validation tests..."
./scripts/validate-recovery.sh --environment=$DRILL_ENV

echo "5. Measuring metrics..."
# Record RTO, RPO, etc.

echo "6. Cleanup..."
terraform destroy -var="environment=$DRILL_ENV" -auto-approve
terraform workspace delete $DRILL_ENV

echo "=== Drill Complete ==="
```

---

## Automation

### Backup Orchestrator

```python
# blackroad/backup/orchestrator.py
import asyncio
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler

class BackupOrchestrator:
    """Automated backup orchestration."""

    def __init__(self, config: dict):
        self.config = config
        self.scheduler = AsyncIOScheduler()
        self.postgres = PostgresBackup(config["postgres"])
        self.redis = RedisBackup(config["redis"])
        self.vault = VaultBackup(config["vault"])

    def start(self):
        """Start backup scheduler."""

        # Continuous WAL archiving (PostgreSQL handles this)

        # Incremental backups every 15 minutes
        self.scheduler.add_job(
            self.incremental_backup,
            'interval',
            minutes=15,
            id='incremental'
        )

        # Hourly snapshots
        self.scheduler.add_job(
            self.hourly_snapshot,
            'cron',
            minute=0,
            id='hourly'
        )

        # Daily full backup at 2 AM UTC
        self.scheduler.add_job(
            self.daily_backup,
            'cron',
            hour=2,
            minute=0,
            id='daily'
        )

        # Weekly verification
        self.scheduler.add_job(
            self.weekly_verification,
            'cron',
            day_of_week='sun',
            hour=4,
            id='verify'
        )

        self.scheduler.start()

    async def incremental_backup(self):
        """Incremental backup job."""
        logger.info("Starting incremental backup")

        try:
            # Redis RDB snapshot
            await self.redis.create_rdb_snapshot()

            # PostgreSQL incremental (if supported)
            await self.postgres.create_incremental()

            logger.info("Incremental backup complete")

        except Exception as e:
            logger.error(f"Incremental backup failed: {e}")
            await self.alert("Incremental backup failed", str(e))

    async def daily_backup(self):
        """Daily full backup job."""
        logger.info("Starting daily backup")

        try:
            # Full PostgreSQL backup
            pg_backup = await self.postgres.create_base_backup()
            await self.postgres.upload_to_s3(pg_backup)

            # Full Redis backup
            redis_backup = await self.redis.backup_to_s3()

            # Vault snapshot
            vault_backup = await self.vault.create_snapshot()

            # Record backup metadata
            await self.record_backup({
                "type": "daily",
                "timestamp": datetime.utcnow().isoformat(),
                "postgres": pg_backup,
                "redis": redis_backup,
                "vault": vault_backup
            })

            logger.info("Daily backup complete")

        except Exception as e:
            logger.error(f"Daily backup failed: {e}")
            await self.alert("Daily backup failed", str(e), severity="critical")
```

---

## Monitoring

### Backup Metrics

```python
# blackroad/backup/metrics.py
from prometheus_client import Counter, Gauge, Histogram

# Backup metrics
backup_success = Counter(
    "blackroad_backup_success_total",
    "Successful backups",
    ["type", "target"]
)

backup_failure = Counter(
    "blackroad_backup_failure_total",
    "Failed backups",
    ["type", "target", "error"]
)

backup_duration = Histogram(
    "blackroad_backup_duration_seconds",
    "Backup duration",
    ["type"],
    buckets=[60, 300, 600, 1800, 3600, 7200]
)

backup_size = Gauge(
    "blackroad_backup_size_bytes",
    "Backup size",
    ["type", "target"]
)

last_backup_time = Gauge(
    "blackroad_last_backup_timestamp",
    "Last successful backup time",
    ["type"]
)

recovery_point_age = Gauge(
    "blackroad_recovery_point_age_seconds",
    "Age of oldest recovery point"
)
```

### Alerting Rules

```yaml
# alerts/backup.yaml
groups:
  - name: backup_alerts
    rules:
      - alert: BackupFailed
        expr: increase(blackroad_backup_failure_total[1h]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Backup failed"
          description: "Backup {{ $labels.type }} failed"

      - alert: BackupOverdue
        expr: time() - blackroad_last_backup_timestamp > 7200
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Backup overdue"
          description: "No backup in last 2 hours"

      - alert: RecoveryPointStale
        expr: blackroad_recovery_point_age_seconds > 900
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Recovery point stale"
          description: "RPO exceeded 15 minutes"

      - alert: BackupStorageLow
        expr: blackroad_backup_storage_available_bytes < 10737418240
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Backup storage low"
          description: "Less than 10GB available"
```

---

## Quick Reference

### Backup Commands

```bash
# Manual backups
./backup.sh postgres full       # Full PostgreSQL backup
./backup.sh postgres incremental # Incremental backup
./backup.sh redis snapshot       # Redis RDB snapshot
./backup.sh vault snapshot       # Vault Raft snapshot
./backup.sh all                  # Everything

# Recovery
./recover.sh postgres <backup>   # Restore PostgreSQL
./recover.sh redis <backup>      # Restore Redis
./recover.sh vault <backup>      # Restore Vault
./recover.sh full                # Full system recovery

# PITR
./recover.sh pitr "2024-01-15 10:30:00"  # Point-in-time

# Verification
./verify-backup.sh <backup>      # Verify single backup
./verify-backup.sh --all         # Verify all recent
```

### Recovery Runbook

```
1. Assess the situation
   - What failed? (database, storage, entire region)
   - What's the acceptable data loss?
   - What's the target recovery time?

2. Choose recovery strategy
   - Hot standby: Failover to replica (< 5 min)
   - Warm recovery: Restore from recent backup (< 30 min)
   - Cold recovery: Full restore from archive (< 4 hrs)

3. Execute recovery
   - Stop affected services
   - Restore data
   - Verify integrity
   - Start services
   - Test functionality

4. Post-recovery
   - Verify all agents online
   - Check data consistency
   - Document incident
   - Update runbooks
```

---

## Related Documentation

- [SECRETS.md](SECRETS.md) - Vault backup details
- [INFRASTRUCTURE.md](INFRASTRUCTURE.md) - Infrastructure setup
- [MONITORING.md](MONITORING.md) - Observability
- [FEDERATION.md](FEDERATION.md) - Multi-cluster recovery
- [SCALING.md](SCALING.md) - Scaling considerations

---

*Your AI. Your Hardware. Your Rules.*
