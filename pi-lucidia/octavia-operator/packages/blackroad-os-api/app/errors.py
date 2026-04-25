from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import HTTPException


class UpstreamError(HTTPException):
    def __init__(
        self,
        source: str,
        status_code: int = 502,
        message: str = "Upstream service error",
        details: Optional[Dict[str, Any]] = None,
    ):
        self.source = source
        self.details = details or {}
        super().__init__(status_code=status_code, detail=message)


def build_error_response(code: str, message: str, request_id: Optional[str], details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    response: Dict[str, Any] = {
        "ok": False,
        "error": {
            "code": code,
            "message": message,
        },
    }
    if details:
        response["error"]["details"] = details
    if request_id:
        response["error"]["requestId"] = request_id
    return response
