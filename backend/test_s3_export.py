import os
from unittest.mock import MagicMock, patch

from s3_export import export_backtest_result


@patch.dict(os.environ, {"S3_BUCKET": "my-backtest-bucket", "AWS_REGION": "us-east-1"})
@patch("boto3.client")
def test_export_writes_json_to_s3(mock_boto_client):
    mock_client = MagicMock()
    mock_boto_client.return_value = mock_client

    key = export_backtest_result({"Return(%)": 5.2, "sharpe_ratio": 1.1}, "EURUSD")

    assert key is not None
    assert key.startswith("backtests/EURUSD/")
    mock_client.put_object.assert_called_once()
    call = mock_client.put_object.call_args.kwargs
    assert call["Bucket"] == "my-backtest-bucket"
    assert call["ContentType"] == "application/json"
    assert "5.2" in call["Body"]


def test_export_skipped_without_bucket():
    with patch.dict(os.environ, {}, clear=True):
        assert export_backtest_result({"Return(%)": 1.0}) is None
