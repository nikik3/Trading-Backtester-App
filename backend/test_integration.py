import io

import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def _sample_csv(rows: int = 60) -> bytes:
    dates = pd.date_range("2020-01-01", periods=rows, freq="D")
    prices = 100 + np.cumsum(np.random.default_rng(7).normal(0, 0.4, rows))
    df = pd.DataFrame(
        {
            "Date": dates.strftime("%d/%m/%Y"),
            "Open": prices,
            "High": prices + 0.5,
            "Low": prices - 0.5,
            "Close": prices,
        }
    )
    return df.to_csv(index=False).encode()


def _post_backtest(csv_bytes: bytes, **form_fields):
    data = {
        "strategy_type": "sma_crossover",
        "sma_short_period": "5",
        "sma_long_period": "20",
        "initial_capital": "100000",
        **form_fields,
    }
    return client.post(
        "/backtest",
        files={"file": ("prices.csv", io.BytesIO(csv_bytes), "text/csv")},
        data=data,
    )


def test_backtest_upload_returns_metrics():
    response = _post_backtest(_sample_csv())
    assert response.status_code == 200

    body = response.json()
    assert body["start_time"] != "N/A"
    assert body["end_time"] != "N/A"
    assert body["equity_final"] > 0
    assert "Return(%)" in body
    assert "Max Drawdown(%)" in body
    assert body["Max Drawdown(%)"] >= 0
    assert isinstance(body["sharpe_ratio"], (int, float))
    assert isinstance(body["trade_log"], list)
    assert isinstance(body["equity_curve"], list)
    assert len(body["equity_curve"]) > 0


def test_backtest_sma_windows_change_results():
    csv_bytes = _sample_csv(80)
    fast = _post_backtest(csv_bytes, sma_short_period="3", sma_long_period="10")
    slow = _post_backtest(csv_bytes, sma_short_period="10", sma_long_period="30")

    assert fast.status_code == 200
    assert slow.status_code == 200
    assert fast.json()["Return(%)"] != slow.json()["Return(%)"]


def test_backtest_rejects_bad_parameters():
    response = _post_backtest(_sample_csv(30), sma_short_period="20", sma_long_period="10")
    assert response.status_code == 400
    assert "message" in response.json()
