# Trading Backtester App

A simple trading backtester with a FastAPI backend and a React frontend.

## What it does

- Upload CSV data with OHLC prices
- Run a basic strategy backtest
- View equity and trade results in the UI

## Tech stack

- Backend: FastAPI, pandas, numpy
- Frontend: React, TypeScript, Vite, Tailwind

## Run locally

### 1. Start the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at http://localhost:8000/docs.

If port 8000 is already in use, run the backend on a different port:

```bash
uvicorn main:app --reload --port 8001
```

Then set the frontend environment variable before starting Vite:

```bash
cd frontend
cp .env.example .env.local
# edit .env.local if needed
npm install
VITE_API_URL=http://localhost:8001 npm run dev
```

Then open http://localhost:5173.

### 3. Sample data

A sample CSV is included and should load automatically in the app.
