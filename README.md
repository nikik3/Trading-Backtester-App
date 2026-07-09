# StockPlay – Trading Strategy Backtester

A full-stack platform for testing trading strategies on historical market data before putting real capital at risk.

**Live demo:** [stock-play-ashen.vercel.app](https://stock-play-ashen.vercel.app/)

## What it does

- Upload OHLC CSV data or use a built-in sample dataset (~5,000 rows)
- Backtest **SMA crossover**, **MACD crossover**, and **SMA + RSI** strategies
- Review equity curves, Sharpe ratio, win rate, and full trade logs
- Optionally compare rule-based signals against a **logistic regression** ML benchmark

## Tech stack

**Backend:** FastAPI · pandas · NumPy · scikit-learn  
**Frontend:** React · TypeScript · Vite · Tailwind CSS · Recharts

## Project structure

```
backend/     FastAPI backtest engine
frontend/    React UI
```
