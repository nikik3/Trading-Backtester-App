# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a trading backtester MVP with a FastAPI backend and React/TypeScript frontend. The application allows users to upload CSV market data and run backtests using a simple SMA crossover strategy.

## Architecture

### Backend (FastAPI + Python)
- **Location**: `backend/` directory
- **Framework**: FastAPI with Uvicorn server
- **Data Processing**: Pandas for CSV parsing and strategy calculations
- **Storage**: In-memory data storage using a global dictionary (`data_storage`)
- **CORS**: Configured to allow frontend at `http://localhost:3000`

**Key Components**:
- `main.py`: Single-file API with two endpoints:
  - `/upload_csv` (POST): Accepts CSV with OHLC data, validates columns (Date, Open, High, Low, Close), stores in memory
  - `/run_backtest` (GET): Runs SMA crossover strategy (5 vs 20 period), returns equity curve and metrics (total return, Sharpe ratio, trade count)
- Strategy: Long-only SMA crossover (buy when 5-period SMA crosses above 20-period SMA)
- Initial capital: $1000

### Frontend (React + TypeScript + Vite)
- **Location**: `frontend/` directory
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite (using rolldown-vite variant)
- **Current State**: Boilerplate Vite + React template (App.tsx is still the default counter example)
- **Note**: Frontend UI for backtesting functionality not yet implemented

## Common Commands

### Backend Development

**Install dependencies**:
```powershell
pip install -r backend/requirements.txt
```

**Run backend server**:
```powershell
cd backend
uvicorn main:app --reload
```
Server runs at `http://127.0.0.1:8000`

**API Documentation**: Visit `http://127.0.0.1:8000/docs` (Swagger UI)

### Frontend Development

**Install dependencies**:
```powershell
cd frontend
npm install
```

**Run development server**:
```powershell
cd frontend
npm run dev
```
Server runs at `http://localhost:3000`

**Build for production**:
```powershell
cd frontend
npm run build
```

**Lint code**:
```powershell
cd frontend
npm run lint
```

**Type check**: TypeScript compilation is part of the build process (`tsc -b && vite build`)

## Development Workflow

### Testing the Backend
1. Start backend server: `cd backend && uvicorn main:app --reload`
2. Use the test data: `backend/dummy_data.csv` contains sample OHLC data starting from 2023-01-01
3. Test via Swagger UI at `/docs` or use curl/Postman to hit endpoints

### CSV Data Format
The backend expects CSV files with these exact columns:
- `Date`: Date in any parseable format (e.g., YYYY-MM-DD)
- `Open`: Opening price
- `High`: High price
- `Low`: Low price
- `Close`: Closing price

### Strategy Parameters
The backtesting strategy is currently hardcoded in `backend/main.py`:
- Short SMA: 5-period rolling window
- Long SMA: 20-period rolling window
- Position sizing: All-in (100% capital when signal is active)
- Initial capital: $1000

To modify strategy parameters, edit the `run_backtest()` function in `backend/main.py`.

## Project-Specific Notes

### Data Persistence
- **Important**: Data is stored in-memory only. Restarting the backend server clears all uploaded data.
- If implementing persistent storage, consider adding a database (SQLite for MVP, PostgreSQL for production).

### Frontend Integration
- The frontend is still using Vite's default template
- To integrate with backend, you'll need to:
  - Add file upload component for CSV
  - Make API calls to `http://localhost:8000/upload_csv` and `http://localhost:8000/run_backtest`
  - Display equity curve (consider using a charting library like Chart.js or Recharts)
  - Display backtest metrics

### Known Limitations
- Single strategy only (SMA crossover)
- Long-only trading (no short positions)
- No parameter optimization or walk-forward testing
- No transaction costs or slippage modeling
- Sharpe ratio calculation uses simplified daily returns * sqrt(252) formula

### Windows Development Notes
- Backend uses Python with FastAPI (cross-platform)
- Frontend uses Node.js/npm (cross-platform)
- When running commands, use PowerShell syntax as shown above
- File paths use backslashes on Windows but are handled automatically by the frameworks
