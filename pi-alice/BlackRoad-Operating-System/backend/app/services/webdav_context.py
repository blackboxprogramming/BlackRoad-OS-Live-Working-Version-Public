"""WebDAV Context Manager - Sync and serve context from WebDAV sources"""
import asyncio
import hashlib
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Set
import httpx
from xml.etree import ElementTree as ET

from app.redis_client import get_redis


class WebDAVContextManager:
    """Manages WebDAV context synchronization and retrieval"""

    def __init__(self):
        self.redis = None
        self.sync_interval = 300  # 5 minutes
        self.cache_ttl = 3600  # 1 hour
        self._sync_task = None

    async def initialize(self):
        """Initialize Redis connection and start background sync"""
        self.redis = await get_redis()

    async def sync_and_get(
        self,
        webdav_url: str,
        username: Optional[str] = None,
        password: Optional[str] = None,
        query: Optional[str] = None,
        file_types: Optional[List[str]] = None,
        max_results: int = 10
    ) -> Dict:
        """
        Sync WebDAV files and return matching context

        Args:
            webdav_url: Base WebDAV URL
            username: WebDAV auth username
            password: WebDAV auth password
            query: Search query for matching files
            file_types: Filter by file extensions (e.g., ['md', 'txt'])
            max_results: Maximum number of results

        Returns:
            {
                "query": str,
                "matched_files": List[Dict],
                "total_matches": int,
                "cached": bool,
                "synced_at": str
            }
        """
        # Check cache first
        cache_key = self._get_cache_key(webdav_url, query, file_types)
        cached = await self._get_cached_context(cache_key)
        if cached:
            return {**cached, "cached": True}

        # Fetch files from WebDAV
        try:
            files = await self._fetch_webdav_files(
                webdav_url, username, password
            )

            # Filter and match files
            matched = self._match_files(files, query, file_types, max_results)

            # Fetch content for matched files
            for file_info in matched:
                content = await self._fetch_file_content(
                    file_info['url'],
                    username,
                    password
                )
                file_info['content'] = content
                file_info['relevance'] = self._calculate_relevance(
                    content, query
                )

            # Sort by relevance
            matched.sort(key=lambda x: x['relevance'], reverse=True)

            result = {
                "query": query or "all",
                "matched_files": matched,
                "total_matches": len(matched),
                "cached": False,
                "synced_at": datetime.utcnow().isoformat()
            }

            # Cache result
            await self._cache_context(cache_key, result)

            return result

        except Exception as e:
            return {
                "error": str(e),
                "matched_files": [],
                "total_matches": 0,
                "cached": False
            }

    async def _fetch_webdav_files(
        self,
        webdav_url: str,
        username: Optional[str],
        password: Optional[str]
    ) -> List[Dict]:
        """Fetch file list from WebDAV using PROPFIND"""
        async with httpx.AsyncClient() as client:
            # PROPFIND request to list files
            headers = {
                'Depth': '1',
                'Content-Type': 'application/xml'
            }

            propfind_body = """<?xml version="1.0" encoding="utf-8" ?>
            <D:propfind xmlns:D="DAV:">
                <D:prop>
                    <D:displayname/>
                    <D:getcontentlength/>
                    <D:getcontenttype/>
                    <D:getlastmodified/>
                </D:prop>
            </D:propfind>
            """

            auth = (username, password) if username and password else None

            response = await client.request(
                'PROPFIND',
                webdav_url,
                headers=headers,
                content=propfind_body,
                auth=auth,
                timeout=30.0
            )

            if response.status_code not in [207, 200]:
                raise Exception(f"WebDAV PROPFIND failed: {response.status_code}")

            # Parse XML response
            files = self._parse_propfind_response(response.text, webdav_url)
            return files

    def _parse_propfind_response(
        self,
        xml_response: str,
        base_url: str
    ) -> List[Dict]:
        """Parse WebDAV PROPFIND XML response"""
        files = []
        root = ET.fromstring(xml_response)

        # XML namespace handling
        ns = {'D': 'DAV:'}

        for response in root.findall('.//D:response', ns):
            href = response.find('D:href', ns)
            if href is None:
                continue

            # Get properties
            propstat = response.find('.//D:propstat', ns)
            if propstat is None:
                continue

            prop = propstat.find('D:prop', ns)
            if prop is None:
                continue

            # Extract file info
            displayname = prop.find('D:displayname', ns)
            contentlength = prop.find('D:getcontentlength', ns)
            contenttype = prop.find('D:getcontenttype', ns)
            lastmodified = prop.find('D:getlastmodified', ns)

            # Skip directories
            if contenttype is not None and 'directory' in contenttype.text:
                continue

            file_path = href.text
            file_name = displayname.text if displayname is not None else file_path.split('/')[-1]

            files.append({
                'name': file_name,
                'path': file_path,
                'url': f"{base_url.rstrip('/')}/{file_path.lstrip('/')}",
                'size': int(contentlength.text) if contentlength is not None else 0,
                'type': contenttype.text if contenttype is not None else 'application/octet-stream',
                'modified': lastmodified.text if lastmodified is not None else None
            })

        return files

    async def _fetch_file_content(
        self,
        file_url: str,
        username: Optional[str],
        password: Optional[str]
    ) -> str:
        """Fetch file content from WebDAV"""
        async with httpx.AsyncClient() as client:
            auth = (username, password) if username and password else None
            response = await client.get(file_url, auth=auth, timeout=30.0)

            if response.status_code == 200:
                # Try to decode as text
                try:
                    return response.text
                except:
                    return f"[Binary file, size: {len(response.content)} bytes]"
            else:
                return f"[Error fetching content: {response.status_code}]"

    def _match_files(
        self,
        files: List[Dict],
        query: Optional[str],
        file_types: Optional[List[str]],
        max_results: int
    ) -> List[Dict]:
        """Match files based on query and file types"""
        matched = []

        for file_info in files:
            # Filter by file type
            if file_types:
                ext = file_info['name'].split('.')[-1].lower()
                if ext not in file_types:
                    continue

            # Simple keyword matching in filename
            if query:
                if query.lower() not in file_info['name'].lower():
                    continue

            matched.append(file_info)

            if len(matched) >= max_results:
                break

        return matched

    def _calculate_relevance(
        self,
        content: str,
        query: Optional[str]
    ) -> float:
        """Calculate relevance score (0.0 to 1.0)"""
        if not query:
            return 0.5

        # Simple keyword frequency
        query_lower = query.lower()
        content_lower = content.lower()

        # Count occurrences
        count = content_lower.count(query_lower)

        # Normalize by content length (prevent bias toward long docs)
        words = len(content.split())
        if words == 0:
            return 0.0

        # Score based on density
        density = count / words
        return min(density * 100, 1.0)  # Cap at 1.0

    def _get_cache_key(
        self,
        webdav_url: str,
        query: Optional[str],
        file_types: Optional[List[str]]
    ) -> str:
        """Generate cache key for context"""
        parts = [
            webdav_url,
            query or "all",
            ",".join(sorted(file_types or []))
        ]
        key_str = "|".join(parts)
        hash_str = hashlib.md5(key_str.encode()).hexdigest()
        return f"leitl:context:{hash_str}"

    async def _get_cached_context(
        self,
        cache_key: str
    ) -> Optional[Dict]:
        """Get cached context from Redis"""
        if not self.redis:
            return None

        cached = await self.redis.get(cache_key)
        if cached:
            return json.loads(cached)
        return None

    async def _cache_context(
        self,
        cache_key: str,
        context: Dict
    ):
        """Cache context in Redis"""
        if not self.redis:
            return

        await self.redis.setex(
            cache_key,
            self.cache_ttl,
            json.dumps(context)
        )


# Singleton instance
webdav_context_manager = WebDAVContextManager()
