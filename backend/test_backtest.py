import numpy as np
import pandas as pd
import pytest

from main import calculate_metrics, execute_strategy


def _make_price_series(n: int = 120) -> pd.DataFrame:
  dates = pd.date_range("2020-01-01", periods=n, freq="D")
  prices = 100 + np.cumsum(np.random.default_rng(42).normal(0, 0.5, n))
  return pd.DataFrame(
    {"Open": prices, "High": prices + 1, "Low": prices - 1, "Close": prices},
    index=dates,
  )


def test_sma_crossover_runs():
  df = _make_price_series()
  result = execute_strategy(df, "sma_crossover", 5, 20, 14, 12, 26, 9)
  assert not result.empty
  assert "Equity_Curve" in result.columns
  assert result["Signal"].isin([0.0, 1.0]).all()


def test_ema_crossover_runs():
  df = _make_price_series()
  result = execute_strategy(df, "ema_crossover", 8, 21, 14, 12, 26, 9)
  assert not result.empty
  assert "EMA_8" in result.columns


def test_max_drawdown_in_metrics():
  df = _make_price_series(200)
  df = execute_strategy(df, "sma_crossover", 5, 20, 14, 12, 26, 9)
  metrics = calculate_metrics(df, initial_capital=100_000)
  assert "Max Drawdown(%)" in metrics
  assert metrics["Max Drawdown(%)"] >= 0
  assert metrics["sharpe_ratio"] == pytest.approx(metrics["sharpe_ratio"])
  assert metrics["Return(%)"] == pytest.approx(
    (df["Equity_Curve"].iloc[-1] - 1) * 100, rel=1e-3
  )


def test_configurable_sma_windows():
  df_short = _make_price_series(150)
  df_long = _make_price_series(150)
  short_run = execute_strategy(df_short, "sma_crossover", 3, 10, 14, 12, 26, 9)
  long_run = execute_strategy(df_long, "sma_crossover", 10, 50, 14, 12, 26, 9)
  assert len(short_run) > len(long_run)
