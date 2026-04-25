"""
BlackRoad MinIO - S3-compatible object storage manager
"""
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Union
import sqlite3
import os
import json
import hashlib
import hmac
import base64
from pathlib import Path


@dataclass
class ObjectMeta:
    """Metadata for stored objects"""
    key: str
    bucket: str
    size_bytes: int
    content_type: str
    etag: str
    last_modified: datetime
    metadata: Dict = field(default_factory=dict)


class ObjectStore:
    """S3-compatible object storage manager backed by local filesystem"""
    
    def __init__(self, storage_root: Optional[str] = None):
        if storage_root is None:
            storage_root = os.path.expanduser("~/.blackroad/object-store")
        
        self.storage_root = storage_root
        self.db_path = os.path.expanduser("~/.blackroad/object-store.db")
        
        Path(self.storage_root).mkdir(parents=True, exist_ok=True)
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        
        self._init_db()
        self.secret_key = "blackroad-secret"  # In production, use env var
    
    def _init_db(self):
        """Initialize SQLite index database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS objects (
                bucket TEXT NOT NULL,
                key TEXT NOT NULL,
                size_bytes INTEGER NOT NULL,
                content_type TEXT NOT NULL,
                etag TEXT NOT NULL,
                last_modified TEXT NOT NULL,
                metadata TEXT,
                PRIMARY KEY (bucket, key)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS buckets (
                name TEXT PRIMARY KEY,
                region TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        
        conn.commit()
        conn.close()
    
    def create_bucket(self, name: str, region: str = "us-east-1") -> bool:
        """Create a new bucket"""
        bucket_path = os.path.join(self.storage_root, name)
        
        if os.path.exists(bucket_path):
            return False
        
        Path(bucket_path).mkdir(parents=True, exist_ok=True)
        
        # Index in DB
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO buckets (name, region, created_at)
            VALUES (?, ?, ?)
        """, (name, region, datetime.now().isoformat()))
        conn.commit()
        conn.close()
        
        return True
    
    def delete_bucket(self, name: str, force: bool = False) -> bool:
        """Delete a bucket"""
        bucket_path = os.path.join(self.storage_root, name)
        
        if not os.path.exists(bucket_path):
            return False
        
        # Check if empty
        if not force and os.listdir(bucket_path):
            return False
        
        import shutil
        shutil.rmtree(bucket_path)
        
        # Remove from DB
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM buckets WHERE name = ?", (name,))
        cursor.execute("DELETE FROM objects WHERE bucket = ?", (name,))
        conn.commit()
        conn.close()
        
        return True
    
    def list_buckets(self) -> List[Dict]:
        """List all buckets with their sizes"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name, region, created_at FROM buckets ORDER BY name")
        buckets = cursor.fetchall()
        conn.close()
        
        result = []
        for name, region, created_at in buckets:
            cursor = sqlite3.connect(self.db_path).cursor()
            cursor.execute("SELECT SUM(size_bytes) FROM objects WHERE bucket = ?", (name,))
            size = cursor.fetchone()[0] or 0
            cursor.close()
            
            result.append({
                'name': name,
                'region': region,
                'size_bytes': size,
                'created_at': created_at
            })
        
        return result
    
    def put_object(self, bucket: str, key: str, data_or_path: Union[bytes, str], 
                   content_type: str = "application/octet-stream", metadata: Optional[Dict] = None) -> bool:
        """Store an object"""
        bucket_path = os.path.join(self.storage_root, bucket)
        
        if not os.path.exists(bucket_path):
            return False
        
        # Read data
        if isinstance(data_or_path, str):
            if os.path.exists(data_or_path):
                with open(data_or_path, 'rb') as f:
                    data = f.read()
            else:
                data = data_or_path.encode()
        else:
            data = data_or_path
        
        # Store file
        object_path = os.path.join(bucket_path, key)
        Path(object_path).parent.mkdir(parents=True, exist_ok=True)
        
        with open(object_path, 'wb') as f:
            f.write(data)
        
        # Generate ETag
        etag = hashlib.md5(data).hexdigest()
        size = len(data)
        last_modified = datetime.now()
        
        # Index in DB
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO objects 
            (bucket, key, size_bytes, content_type, etag, last_modified, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (bucket, key, size, content_type, etag, last_modified.isoformat(), 
              json.dumps(metadata or {})))
        conn.commit()
        conn.close()
        
        return True
    
    def get_object(self, bucket: str, key: str) -> Optional[bytes]:
        """Retrieve an object"""
        object_path = os.path.join(self.storage_root, bucket, key)
        
        if not os.path.exists(object_path):
            return None
        
        with open(object_path, 'rb') as f:
            return f.read()
    
    def delete_object(self, bucket: str, key: str) -> bool:
        """Delete an object"""
        object_path = os.path.join(self.storage_root, bucket, key)
        
        if not os.path.exists(object_path):
            return False
        
        os.remove(object_path)
        
        # Remove from DB
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM objects WHERE bucket = ? AND key = ?", (bucket, key))
        conn.commit()
        conn.close()
        
        return True
    
    def list_objects(self, bucket: str, prefix: str = "", max_keys: int = 1000) -> List[ObjectMeta]:
        """List objects in bucket"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT key, bucket, size_bytes, content_type, etag, last_modified, metadata
            FROM objects
            WHERE bucket = ? AND key LIKE ?
            ORDER BY key
            LIMIT ?
        """, (bucket, f"{prefix}%", max_keys))
        
        objects = []
        for row in cursor.fetchall():
            key, bucket, size, content_type, etag, last_modified, meta = row
            objects.append(ObjectMeta(
                key=key,
                bucket=bucket,
                size_bytes=size,
                content_type=content_type,
                etag=etag,
                last_modified=datetime.fromisoformat(last_modified),
                metadata=json.loads(meta)
            ))
        
        conn.close()
        return objects
    
    def head_object(self, bucket: str, key: str) -> Optional[ObjectMeta]:
        """Get object metadata"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT key, bucket, size_bytes, content_type, etag, last_modified, metadata
            FROM objects
            WHERE bucket = ? AND key = ?
        """, (bucket, key))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        key, bucket, size, content_type, etag, last_modified, meta = row
        return ObjectMeta(
            key=key,
            bucket=bucket,
            size_bytes=size,
            content_type=content_type,
            etag=etag,
            last_modified=datetime.fromisoformat(last_modified),
            metadata=json.loads(meta)
        )
    
    def copy_object(self, src_bucket: str, src_key: str, dst_bucket: str, dst_key: str) -> bool:
        """Copy object between buckets or keys"""
        data = self.get_object(src_bucket, src_key)
        if data is None:
            return False
        
        meta = self.head_object(src_bucket, src_key)
        if meta is None:
            return False
        
        return self.put_object(dst_bucket, dst_key, data, meta.content_type, meta.metadata)
    
    def generate_presigned_url(self, bucket: str, key: str, expires_in: int = 3600) -> str:
        """Generate HMAC-signed presigned URL"""
        expires_at = (datetime.now() + timedelta(seconds=expires_in)).isoformat()
        
        # Create signature
        message = f"{bucket}/{key}/{expires_at}".encode()
        signature = hmac.new(
            self.secret_key.encode(),
            message,
            hashlib.sha256
        ).digest()
        sig_b64 = base64.b64encode(signature).decode()
        
        return f"https://s3.blackroad.io/{bucket}/{key}?X-Amz-Expires={expires_in}&X-Amz-Signature={sig_b64}"
    
    def get_bucket_stats(self, bucket: str) -> Optional[Dict]:
        """Get bucket statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT COUNT(*), SUM(size_bytes)
            FROM objects
            WHERE bucket = ?
        """, (bucket,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return None
        
        total_objects, total_size = result
        total_size = total_size or 0
        
        return {
            'total_objects': total_objects or 0,
            'total_size_mb': total_size / (1024 * 1024)
        }


if __name__ == '__main__':
    import sys
    
    store = ObjectStore()
    
    if len(sys.argv) < 2:
        print("Usage: python object_store.py <command> [args]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == 'list-buckets':
        buckets = store.list_buckets()
        for b in buckets:
            print(f"{b['name']} ({b['size_bytes']} bytes)")
    
    elif cmd == 'put':
        bucket = sys.argv[2]
        key = sys.argv[3]
        path = sys.argv[4]
        if store.put_object(bucket, key, path):
            print(f"Object {key} stored in {bucket}")
        else:
            print(f"Failed to store {key}")
    
    elif cmd == 'ls':
        bucket = sys.argv[2]
        objects = store.list_objects(bucket)
        for obj in objects:
            print(f"{obj.key} ({obj.size_bytes} bytes)")
