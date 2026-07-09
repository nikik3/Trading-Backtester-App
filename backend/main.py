import io
import json
import os
from typing import Annotated, Any, Dict, List

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, ConfigDict, Field
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# ----------------------------------------------------------------------
# 1. Pydantic Models for Input and Output
# ----------------------------------------------------------------------

class TradeLog(BaseModel):
    """Defines the structure for individual trade entries."""
    model_config = ConfigDict(populate_by_name=True)

    date: str = Field(..., description="Date of the trade")
    type: str = Field(..., description="Trade type: BUY or SELL")
    price: float = Field(..., description="Trade price")
    pnl: float = Field(..., alias="P&L", description="Profit/Loss for the trade (0 for BUY)")
    cumulative_pnl: float = Field(..., alias="Cumulative P&L", description="Cumulative P&L up to this trade")


class EquityPoint(BaseModel):
    """Defines the structure for a single point on the equity curve graph."""
    date: str = Field(..., description="Date of the equity point")
    value: float = Field(..., description="Equity value at this point")


class BacktestResult(BaseModel):
    """Defines the structure for the backtesting output (JSON response)."""
    model_config = ConfigDict(populate_by_name=True)

    start_time: str = Field(..., description="Start date of the backtest.")
    end_time: str = Field(..., description="End date of the backtest.")
    equity_final: float = Field(..., description="Final equity value.")
    return_percent: float = Field(..., alias="Return(%)", description="Total percentage return over the period.")
    volatility_percent: float = Field(..., alias="Volatility(%)", description="Annualized volatility of returns.")
    sharpe_ratio: float = Field(..., description="Sharpe Ratio (using risk-free rate of 0).")
    max_trade_duration: str = Field(..., description="Maximum duration of a single trade.")
    avg_trade_duration: str = Field(..., alias="Avg. Trade Duration", description="Average duration of all trades.")
    no_of_trades: int = Field(..., alias="No. of trades", description="Total number of executed trades.")
    win_rate_percent: float = Field(..., alias="Win Rate(%)", description="Percentage of trades that were profitable.")
    strategy: str = Field(..., description="A summary of the strategy used.")
    trade_log: List[TradeLog] = Field(..., description="Detailed log of all trades executed.")
    equity_curve: List[EquityPoint] = Field(..., description="Array of equity curve points for graphing.")


# ----------------------------------------------------------------------
# 2. Backtesting Core Logic (Enhanced to support multiple indicators)
# ----------------------------------------------------------------------

def calculate_rsi(df: pd.DataFrame, window: int = 14) -> pd.Series:
    """Calculates the Relative Strength Index (RSI)."""
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    # Using the formula: RSI = 100 - (100 / (1 + RS))
    return 100 - (100 / (1 + rs))

def calculate_ema(df: pd.DataFrame, window: int) -> pd.Series:
    """Calculates the Exponential Moving Average (EMA)."""
    # Uses Pandas EWM (Exponential Weighted Moving) window for calculation
    return df['Close'].ewm(span=window, adjust=False).mean()

def calculate_macd(df: pd.DataFrame, fast_period: int, slow_period: int, signal_period: int) -> pd.DataFrame:
    """Calculates the Moving Average Convergence Divergence (MACD)."""
    ema_fast = df['Close'].ewm(span=fast_period, adjust=False).mean()
    ema_slow = df['Close'].ewm(span=slow_period, adjust=False).mean()

    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()
    macd_histogram = macd_line - signal_line

    df['MACD'] = macd_line
    df['MACD_Signal'] = signal_line
    df['MACD_Hist'] = macd_histogram
    return df

def execute_strategy(
    df: pd.DataFrame,
    strategy_type: str,
    sma_short_period: int,
    sma_long_period: int,
    rsi_window: int,
    macd_fast_period: int,
    macd_slow_period: int,
    macd_signal_period: int,
) -> pd.DataFrame:
    """
    Simulates a strategy and calculates daily portfolio returns.
    Only computes indicators required for the selected strategy type.
    """
    strategy_type = (strategy_type or "sma_crossover").lower()
    required_cols: list[str] = []

    if strategy_type == "macd_crossover":
        df = calculate_macd(df, macd_fast_period, macd_slow_period, macd_signal_period)
        required_cols = ["MACD", "MACD_Signal"]
        strategy_summary = "MACD Crossover"
    elif strategy_type == "sma_rsi":
        df[f"SMA_{sma_short_period}"] = df["Close"].rolling(window=sma_short_period).mean()
        df[f"SMA_{sma_long_period}"] = df["Close"].rolling(window=sma_long_period).mean()
        df["RSI"] = calculate_rsi(df, window=rsi_window)
        required_cols = [f"SMA_{sma_short_period}", f"SMA_{sma_long_period}", "RSI"]
        strategy_summary = "SMA Crossover with RSI Filter"
    else:
        df[f"SMA_{sma_short_period}"] = df["Close"].rolling(window=sma_short_period).mean()
        df[f"SMA_{sma_long_period}"] = df["Close"].rolling(window=sma_long_period).mean()
        required_cols = [f"SMA_{sma_short_period}", f"SMA_{sma_long_period}"]
        strategy_summary = f"SMA Crossover ({sma_short_period}/{sma_long_period})"

    df["Signal"] = 0.0

    if strategy_type == "macd_crossover":
        macd_buy_cross = (df["MACD"] > df["MACD_Signal"]) & (df["MACD"].shift(1) <= df["MACD_Signal"].shift(1))
        macd_sell_cross = (df["MACD"] < df["MACD_Signal"]) & (df["MACD"].shift(1) >= df["MACD_Signal"].shift(1))
        df.loc[macd_buy_cross, "Signal"] = 1.0
        df.loc[macd_sell_cross, "Signal"] = 0.0
        # Hold position between crossover events
        df["Signal"] = df["Signal"].replace(0, np.nan).ffill().fillna(0.0)
    elif strategy_type == "sma_rsi":
        sma_short = df[f"SMA_{sma_short_period}"]
        sma_long = df[f"SMA_{sma_long_period}"]
        buy_signal = (sma_short > sma_long) & (df["RSI"] < 70)
        sell_signal = (sma_short < sma_long) | (df["RSI"] > 80)
        df.loc[buy_signal, "Signal"] = 1.0
        df.loc[sell_signal, "Signal"] = 0.0
        df["Signal"] = df["Signal"].replace(0, np.nan).ffill().fillna(0.0)
    else:
        sma_short = df[f"SMA_{sma_short_period}"]
        sma_long = df[f"SMA_{sma_long_period}"]
        # Trend-following: long while short SMA is above long SMA
        df["Signal"] = np.where(sma_short > sma_long, 1.0, 0.0)

    df["Daily_Return"] = np.log(df["Close"] / df["Close"].shift(1))
    df["Strategy_Return"] = df["Daily_Return"] * df["Signal"].shift(1)
    df["Equity_Curve"] = np.exp(df["Strategy_Return"].fillna(0).cumsum())

    df.dropna(subset=required_cols, inplace=True)
    df.attrs["strategy_summary"] = strategy_summary

    return df

def _pair_trades(df: pd.DataFrame) -> tuple[list, list]:
    """Align entry/exit timestamps when the backtest starts mid-position."""
    df = df.copy()
    df["Position"] = df["Signal"].apply(lambda x: 1 if x > 0 else 0)
    entries = df[df["Position"].diff() == 1].index.tolist()
    exits = df[df["Position"].diff() == -1].index.tolist()

    while len(exits) > len(entries) and exits:
        exits = exits[1:]
    while len(entries) > len(exits) and entries:
        entries = entries[:-1]

    return entries, exits


def generate_trade_log(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Generates a detailed trade log with BUY/SELL entries, prices, P&L, and cumulative P&L.
    """
    entries, exits = _pair_trades(df)

    trade_log = []
    cumulative_pnl = 0.0

    for entry_date, exit_date in zip(entries, exits):
        entry_price = df.loc[entry_date, 'Close']
        exit_price = df.loc[exit_date, 'Close']
        pnl = exit_price - entry_price

        trade_log.append({
            'date': entry_date.strftime('%Y-%m-%d'),
            'type': 'BUY',
            'price': round(entry_price, 2),
            'P&L': 0.0,
            'Cumulative P&L': round(cumulative_pnl, 2)
        })

        cumulative_pnl += pnl
        trade_log.append({
            'date': exit_date.strftime('%Y-%m-%d'),
            'type': 'SELL',
            'price': round(exit_price, 2),
            'P&L': round(pnl, 2),
            'Cumulative P&L': round(cumulative_pnl, 2)
        })

    return trade_log

def generate_equity_curve(df: pd.DataFrame, initial_capital: float = 100000, max_points: int = 100) -> List[Dict[str, Any]]:
    """
    Generates equity curve points for graphing the strategy performance over time.
    Intelligently samples the data to return a maximum of max_points for efficient plotting.
    """
    total_rows = len(df)

    # If data is already small enough, return all points
    if total_rows <= max_points:
        equity_points = []
        for index, row in df.iterrows():
            equity_value = initial_capital * row['Equity_Curve']
            equity_points.append({
                'date': index.strftime('%Y-%m-%d'),
                'value': round(equity_value, 2)
            })
        return equity_points

    # Calculate sampling interval to get approximately max_points
    sample_interval = total_rows // max_points

    equity_points = []
    df_reset = df.reset_index()

    # Sample at regular intervals
    for i in range(0, total_rows, sample_interval):
        row = df_reset.iloc[i]
        equity_value = initial_capital * row['Equity_Curve']
        equity_points.append({
            'date': row['Date'].strftime('%Y-%m-%d'),
            'value': round(equity_value, 2)
        })

    # Always include the last point to show final equity
    if equity_points[-1]['date'] != df.index[-1].strftime('%Y-%m-%d'):
        last_row = df.iloc[-1]
        equity_value = initial_capital * last_row['Equity_Curve']
        equity_points.append({
            'date': df.index[-1].strftime('%Y-%m-%d'),
            'value': round(equity_value, 2)
        })

    return equity_points

def calculate_metrics(df: pd.DataFrame, initial_capital: float = 100000, max_equity_points: int = 100) -> Dict[str, Any]:
    """
    Calculates the required performance metrics from the strategy returns.
    Includes a check for an empty DataFrame to prevent NaTType errors.
    """

    # CRITICAL CHECK: If the DataFrame is empty after drops, return safe defaults.
    if df.empty:
        return {
            'start_time': 'N/A',
            'end_time': 'N/A',
            'equity_final': initial_capital,
            'Return(%)': 0.0,
            'Volatility(%)': 0.0,
            'sharpe_ratio': 0.0,
            'max_trade_duration': 'N/A',
            'Avg. Trade Duration': 'N/A', 
            'No. of trades': 0, 
            'Win Rate(%)': 0.0, 
            'strategy': 'No Trades Executed - Insufficient Data or Signal',
            'trade_log': [],
            'equity_curve': []
        }


    # 1. Basic Metrics
    start_time = df.index.min().strftime('%Y-%m-%d')
    end_time = df.index.max().strftime('%Y-%m-%d')
    equity_final = initial_capital * df['Equity_Curve'].iloc[-1]
    total_return = (df['Equity_Curve'].iloc[-1] - 1) * 100
    daily_returns = df['Strategy_Return']
    annual_volatility = daily_returns.std() * np.sqrt(252) * 100

    # Avoid division by zero if daily_returns.std() is 0 (i.e., flat price data)
    annual_return = np.exp(daily_returns.mean() * 252) - 1
    std_dev_annualized = daily_returns.std() * np.sqrt(252)
    sharpe_ratio = annual_return / std_dev_annualized if std_dev_annualized else 0.0


    # 2. Trade Analysis
    entries, exits = _pair_trades(df)

    trades = []
    trade_durations = []

    for entry_date, exit_date in zip(entries, exits):
        entry_price = df.loc[entry_date, 'Close']
        exit_price = df.loc[exit_date, 'Close']
        pnl = exit_price - entry_price
        trades.append(pnl)

        duration = exit_date - entry_date
        trade_durations.append(duration.total_seconds() / (60 * 60 * 24))

    no_of_trades = len(trades)
    winning_trades = sum(1 for pnl in trades if pnl > 0)

    win_rate_percent = (winning_trades / no_of_trades) * 100 if no_of_trades > 0 else 0.0

    # 3. Trade Duration Metrics
    if trade_durations:
        max_duration_days = np.max(trade_durations)
        avg_duration_days = np.mean(trade_durations)

        # Format duration for output (Days if >= 1, Hours if < 1)
        max_trade_duration = f"{int(max_duration_days)} Days" if max_duration_days >= 1 else f"{round(max_duration_days*24, 2)} Hours"
        avg_trade_duration = f"{int(avg_duration_days)} Days" if avg_duration_days >= 1 else f"{round(avg_duration_days*24, 2)} Hours"
    else:
        max_trade_duration = 'N/A'
        avg_trade_duration = 'N/A'

    # Get strategy summary from DataFrame attributes
    strategy_summary = df.attrs.get('strategy_summary', 'Crossover (Default)')

    # 4. Generate Trade Log
    trade_log = generate_trade_log(df)

    # 5. Generate Equity Curve Points
    equity_curve = generate_equity_curve(df, initial_capital, max_equity_points)

    return {
        'start_time': start_time,
        'end_time': end_time,
        'equity_final': round(equity_final, 2),
        'Return(%)': round(total_return, 2),
        'Volatility(%)': round(annual_volatility, 2),
        'sharpe_ratio': round(sharpe_ratio, 3),
        'max_trade_duration': max_trade_duration,
        'Avg. Trade Duration': avg_trade_duration,
        'No. of trades': no_of_trades,
        'Win Rate(%)': round(win_rate_percent, 2),
        'strategy': strategy_summary,
        'trade_log': trade_log,
        'equity_curve': equity_curve
    }

# ----------------------------------------------------------------------
# 3. FastAPI Setup and Endpoint
# ----------------------------------------------------------------------

app = FastAPI(title="Quick Backtesting API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/sample_data", response_class=PlainTextResponse)
async def get_sample_data():
    file_path = os.path.join(os.path.dirname(__file__), "FILL.csv")
    if not os.path.exists(file_path):
        return PlainTextResponse("Date,Open,High,Low,Close\n2023-01-01,100,101,99,100", status_code=404)
    with open(file_path, "r") as f:
        return f.read()

class MLBacktestResponse(BaseModel):
    rule_based: BacktestResult
    ml_based: BacktestResult
    accuracy: float


@app.post("/backtest", response_model=BacktestResult, response_model_by_alias=True)
async def run_strategy_backtest(
    file: Annotated[UploadFile, File(description="CSV file with Date, Open, High, Low, Close.")],
    buy_condition: Annotated[str, Form(description="Legacy field — use strategy_type in strategy JSON")] = "",
    sell_condition: Annotated[str, Form(description="Legacy field — use strategy_type in strategy JSON")] = "",
    stock_symbol: Annotated[str, Form(description="e.g., AAPL")] = "",
    period_start: Annotated[str, Form(description="e.g., 2020-01-01")] = "1970-01-01",
    period_end: Annotated[str, Form(description="e.g., 2023-12-31")] = "2100-01-01",
    strategy: Annotated[str | None, Form(description="Optional strategy JSON from frontend")] = None,
    strategy_type: Annotated[str, Form(description="sma_crossover | macd_crossover | sma_rsi")] = "sma_crossover",
    sma_short_period: Annotated[int, Form(description="Short MA period (e.g., 5)")] = 5,
    sma_long_period: Annotated[int, Form(description="Long MA period (e.g., 20)")] = 20,
    rsi_window: Annotated[int, Form(description="RSI lookback period (e.g., 14)")] = 14,
    macd_fast_period: Annotated[int, Form(description="MACD fast EMA (e.g., 12)")] = 12,
    macd_slow_period: Annotated[int, Form(description="MACD slow EMA (e.g., 26)")] = 26,
    macd_signal_period: Annotated[int, Form(description="MACD signal line EMA (e.g., 9)")] = 9,
    initial_capital: Annotated[float, Form(description="Initial investment capital (e.g., 100000)")] = 100000,
    max_equity_points: Annotated[int, Form(description="Maximum number of equity curve points to return (e.g., 100)")] = 100,
):
    """
    Receives CSV data and strategy conditions, executes the backtest, and returns
    key performance metrics in JSON format with detailed trade log and equity curve points.
    """
    try:
        # Read the uploaded CSV file content
        contents = await file.read()
        csv_data = io.StringIO(contents.decode('utf-8'))

        # Load data into DataFrame
        df = pd.read_csv(csv_data)
        df['Date'] = pd.to_datetime(df['Date'], dayfirst=True, errors='coerce')
        df = df.dropna(subset=['Date'])
        df.set_index('Date', inplace=True)

        # Apply filtering for time period (if necessary)
        df_filtered = df[(df.index >= period_start) & (df.index <= period_end)].copy()

        if df_filtered.empty:
            raise ValueError("No data found for the specified period.")

        # If a strategy JSON was provided by the frontend, try to parse and override parameters
        if strategy:
            try:
                parsed = json.loads(strategy)
                strategy_type = parsed.get("strategy_type", strategy_type) or strategy_type
                stock_symbol = parsed.get("symbol", stock_symbol) or stock_symbol
                sma_short_period = int(parsed.get("sma_short_period", sma_short_period))
                sma_long_period = int(parsed.get("sma_long_period", sma_long_period))
                rsi_window = int(parsed.get("rsi_window", rsi_window))
                macd_fast_period = int(parsed.get("macd_fast_period", macd_fast_period))
                macd_slow_period = int(parsed.get("macd_slow_period", macd_slow_period))
                macd_signal_period = int(parsed.get("macd_signal_period", macd_signal_period))
            except Exception:
                pass

        if sma_short_period >= sma_long_period:
            raise ValueError("Short SMA period must be smaller than long SMA period.")

        min_rows = sma_long_period + 5
        if len(df_filtered) < min_rows:
            raise ValueError(
                f"Need at least {min_rows} data points for SMA({sma_short_period}/{sma_long_period}). "
                f"You provided {len(df_filtered)}."
            )

        df_results = execute_strategy(
            df_filtered,
            strategy_type,
            sma_short_period,
            sma_long_period,
            rsi_window,
            macd_fast_period,
            macd_slow_period,
            macd_signal_period,
        )

        # 2. Calculate final metrics (including trade log and equity curve)
        metrics = calculate_metrics(df_results, initial_capital, max_equity_points)

        # 3. Package results for response
        return BacktestResult(**metrics)

    except ValueError as e:
        # Handle data/period errors
        return JSONResponse(
            status_code=400,
            content={"message": f"Data processing error: {e}"}
        )
    except Exception as e:
        # Handle unexpected errors
        print(f"An unexpected error occurred: {e}")
        return JSONResponse(
            status_code=500,
            content={"message": f"Internal server error during backtest: {e}"}
        )

@app.post("/ml_backtest", response_model=MLBacktestResponse, response_model_by_alias=True)
async def run_ml_backtest(
    file: Annotated[UploadFile, File(...)],
    strategy: Annotated[str | None, Form(description="Optional strategy JSON from frontend")] = None,
    sma_short_period: int = Form(5),
    sma_long_period: int = Form(20),
    rsi_window: int = Form(14),
    macd_fast_period: int = Form(12),
    macd_slow_period: int = Form(26),
    macd_signal_period: int = Form(9),
    initial_capital: float = Form(100000),
    max_equity_points: int = Form(100),
):
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        df['Date'] = pd.to_datetime(df['Date'], dayfirst=True, errors='coerce')
        df = df.dropna(subset=['Date'])
        df.set_index('Date', inplace=True)
        
        if df.empty:
            raise ValueError("No data found.")

        if strategy:
            try:
                parsed = json.loads(strategy)
                sma_short_period = int(parsed.get("sma_short_period", sma_short_period))
                sma_long_period = int(parsed.get("sma_long_period", sma_long_period))
                rsi_window = int(parsed.get("rsi_window", rsi_window))
                macd_fast_period = int(parsed.get("macd_fast_period", macd_fast_period))
                macd_slow_period = int(parsed.get("macd_slow_period", macd_slow_period))
                macd_signal_period = int(parsed.get("macd_signal_period", macd_signal_period))
            except Exception:
                pass

        warmup = max(sma_long_period, rsi_window, macd_slow_period + macd_signal_period) + 5
        if len(df) < warmup + 30:
            raise ValueError(
                f"ML backtest needs at least {warmup + 30} data points after loading CSV. "
                f"You provided {len(df)}. Use the full sample dataset or upload more history."
            )

        # 1. Generate Indicators for Features
        df[f'SMA_{sma_short_period}'] = df['Close'].rolling(window=sma_short_period).mean()
        df[f'SMA_{sma_long_period}'] = df['Close'].rolling(window=sma_long_period).mean()
        df['RSI'] = calculate_rsi(df, window=rsi_window)
        df[f'EMA_{sma_short_period}'] = calculate_ema(df, sma_short_period)
        df[f'EMA_{sma_long_period}'] = calculate_ema(df, sma_long_period)
        df = calculate_macd(df, macd_fast_period, macd_slow_period, macd_signal_period)

        df.dropna(inplace=True)
        if len(df) < 30:
            raise ValueError("Not enough data for ML backtest after indicator warmup.")

        # 2. Setup Features and Target
        features = [
            f'SMA_{sma_short_period}', f'SMA_{sma_long_period}',
            f'EMA_{sma_short_period}', f'EMA_{sma_long_period}',
            'RSI', 'MACD', 'MACD_Signal', 'MACD_Hist'
        ]
        
        X = df[features]
        # Target: 1 if next day close is strictly greater than today's close
        y = (df['Close'].shift(-1) > df['Close']).astype(int)
        
        # Drop last row since target is NaN
        X = X.iloc[:-1]
        y = y.iloc[:-1]
        df_ml = df.iloc[:-1].copy()

        # 3. Train/Test Split (Walk-forward: 70% train, 30% test)
        split_idx = int(len(X) * 0.7)
        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
        
        # 4. Train Model
        model = LogisticRegression(max_iter=1000)
        model.fit(X_train, y_train)
        
        # 5. Predict
        preds = model.predict(X_test)
        accuracy = float(accuracy_score(y_test, preds))
        
        # 6. Build Rule-Based result on the test set for comparison
        df_rule = df_ml.iloc[split_idx:].copy()
        df_rule['Signal'] = np.where(df_rule[f'SMA_{sma_short_period}'] > df_rule[f'SMA_{sma_long_period}'], 1.0, 0.0)
        df_rule['Daily_Return'] = np.log(df_rule['Close'] / df_rule['Close'].shift(1))
        df_rule['Strategy_Return'] = df_rule['Daily_Return'] * df_rule['Signal'].shift(1)
        df_rule['Strategy_Return'].fillna(0, inplace=True)
        df_rule['Equity_Curve'] = np.exp(df_rule['Strategy_Return'].cumsum())
        df_rule.attrs['strategy_summary'] = 'Rule-based: SMA Crossover'
        rule_metrics = calculate_metrics(df_rule, initial_capital, max_equity_points)
        
        # 7. Build ML result on the test set
        df_ml_test = df_ml.iloc[split_idx:].copy()
        df_ml_test['Signal'] = preds
        df_ml_test['Daily_Return'] = np.log(df_ml_test['Close'] / df_ml_test['Close'].shift(1))
        df_ml_test['Strategy_Return'] = df_ml_test['Daily_Return'] * df_ml_test['Signal'].shift(1)
        df_ml_test['Strategy_Return'].fillna(0, inplace=True)
        df_ml_test['Equity_Curve'] = np.exp(df_ml_test['Strategy_Return'].cumsum())
        df_ml_test.attrs['strategy_summary'] = 'ML: Logistic Regression'
        ml_metrics = calculate_metrics(df_ml_test, initial_capital, max_equity_points)

        return MLBacktestResponse(
            rule_based=BacktestResult(**rule_metrics),
            ml_based=BacktestResult(**ml_metrics),
            accuracy=accuracy
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"message": str(e)})