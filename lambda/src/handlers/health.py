"""GET /health — public service health."""

import sys
import time

from shared import http


def lambda_handler(event, context):
    return http.ok(
        {
            "status": "ok",
            "service": "accra-spaces-api",
            "python": f"{sys.version_info.major}.{sys.version_info.minor}",
            "epoch": int(time.time()),
        }
    )
