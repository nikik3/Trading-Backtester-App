import json
import os
from datetime import datetime, timezone
from typing import Any


def export_backtest_result(payload: dict[str, Any], symbol: str = "backtest") -> str | None:
    """Upload backtest JSON to S3 when S3_BUCKET is set. Returns the object key."""
    bucket = os.environ.get("S3_BUCKET", "").strip()
    if not bucket:
        return None

    import boto3

    safe_symbol = "".join(c if c.isalnum() or c in "-_" else "_" for c in symbol) or "backtest"
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    key = f"backtests/{safe_symbol}/{timestamp}.json"

    client = boto3.client("s3", region_name=os.environ.get("AWS_REGION"))
    client.put_object(
        Bucket=bucket,
        Key=key,
        Body=json.dumps(payload, default=str),
        ContentType="application/json",
    )
    return key
