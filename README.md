# StockPlay – Trading Strategy Backtester

A full-stack platform for testing trading strategies on historical market data before putting real capital at risk.

**Live demo:** [stock-play-ashen.vercel.app](https://stock-play-ashen.vercel.app/)

## What it does

- Upload OHLC CSV data or use a built-in sample dataset (~5,000 rows)
- Backtest **SMA crossover**, **EMA crossover**, **MACD crossover**, and **SMA + RSI** strategies
- Configure strategy windows (SMA/EMA periods, MACD settings, RSI lookback) on each run
- Review return %, Sharpe ratio, **max drawdown**, equity curves, win rate, and trade logs
- Optionally compare rule-based signals against a **logistic regression** ML benchmark

## Tech stack

**Backend:** FastAPI · pandas · NumPy · scikit-learn · boto3 (optional S3 export)  
**Frontend:** React · TypeScript · Vite · Tailwind CSS · Recharts

## Local setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the backend on port 8000, so no `.env` file is needed for local development.

For production (Vercel), set `VITE_API_URL` to your deployed backend URL.

### Tests

```bash
cd backend
pip install -r requirements.txt
pytest -q
```

Integration tests cover CSV upload → backtest → metric assertions against the live FastAPI app.

### S3 export (optional)

Set `S3_BUCKET` (and standard AWS credentials) on the backend. Each successful `/backtest` run writes the results JSON to `backtests/<symbol>/<timestamp>.json`. The response includes `s3_key` when export succeeds. See `backend/.env.example`.

## Project structure

```
backend/     FastAPI backtest engine
frontend/    React UI
```

## CSV format

```
Date,Open,High,Low,Close
2017-01-02,1.0450,1.0480,1.0420,1.0465
```

Volume is optional. Dates can be `YYYY-MM-DD` or `DD/MM/YYYY`.

## Limitations

Educational backtesting simulator — not live trading or financial advice. Long-only, no transaction costs or slippage. Signals are shifted one bar to reduce lookahead bias.
