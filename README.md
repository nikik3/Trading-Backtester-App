# StockPlay – Trading Strategy Backtester

Full-stack backtesting platform: upload historical OHLC data, run SMA / MACD / RSI strategies, and optionally compare against a logistic-regression ML benchmark.

**Live demo:** [stock-play-ashen.vercel.app](https://stock-play-ashen.vercel.app/)  
**Repo:** [github.com/nikik3/Trading-Backtester-App](https://github.com/nikik3/Trading-Backtester-App)

## Tech stack

| Layer | Stack |
|-------|--------|
| Backend | FastAPI, pandas, NumPy, scikit-learn, Pydantic |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Recharts |

## Run locally

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:5173 → **Trade** → **Use Sample Data** → **Run Backtest**.

If the backend uses a different port:

```bash
# frontend/.env.local
VITE_API_URL=http://localhost:8001
```

---

## Deploy step by step

You need **two** deployments: backend (Render) + frontend (Vercel). The Vercel site calls the Render API via `VITE_API_URL`.

### Part A — Push latest code to GitHub

```bash
git add .
git commit -m "Update home page and deployment config"
git push origin main
```

Repo: https://github.com/nikik3/Trading-Backtester-App

---

### Part B — Deploy backend on Render (free tier)

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Connect **nikik3/Trading-Backtester-App**.
4. Configure:

   | Setting | Value |
   |---------|--------|
   | **Name** | `stockplay-api` (or any name) |
   | **Root Directory** | `backend` |
   | **Runtime** | Python 3 |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

5. Choose **Free** instance type → **Create Web Service**.
6. Wait for the deploy to finish. Copy your URL, e.g.  
   `https://stockplay-api.onrender.com`
7. Verify:
   - `https://YOUR-RENDER-URL.onrender.com/health` → `{"status":"ok"}`
   - `https://YOUR-RENDER-URL.onrender.com/docs` → Swagger UI

> **Note:** Render free tier sleeps after ~15 min idle. The first request after sleep can take 30–60 seconds (cold start).

---

### Part C — Deploy frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New…** → **Project** → import **nikik3/Trading-Backtester-App**.
3. Configure:

   | Setting | Value |
   |---------|--------|
   | **Root Directory** | `frontend` (click Edit) |
   | **Framework Preset** | Vite |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

4. **Environment Variables** — add:

   | Name | Value |
   |------|--------|
   | `VITE_API_URL` | `https://YOUR-RENDER-URL.onrender.com` |

   No trailing slash. Example: `https://stockplay-api.onrender.com`

5. Click **Deploy**.
6. Your site will be at something like `https://stock-play-ashen.vercel.app`.

---

### Part D — Test the live app

1. Open your Vercel URL.
2. Go to **Trade** → **Use Sample Data** (loads ~5,000 rows from the backend).
3. Click **Run Backtest** — you should see equity curve + metrics.

If backtests fail:

| Symptom | Fix |
|---------|-----|
| Network error / failed fetch | Check `VITE_API_URL` in Vercel → Settings → Environment Variables, then **Redeploy**. |
| Slow first request | Render cold start — wait ~60s and retry. |
| CORS error | Backend already allows `*` origins; redeploy backend if you changed `main.py`. |

---

### Part E — Redeploy after code changes

| What changed | Action |
|--------------|--------|
| Frontend only | Push to `main` — Vercel auto-redeploys |
| Backend only | Push to `main` — Render auto-redeploys |
| Changed `VITE_API_URL` | Vercel → Settings → Env Vars → **Redeploy** |

---

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| GET | `/sample_data` | Sample OHLC CSV (~5K rows) |
| POST | `/backtest` | Rule-based strategy backtest |
| POST | `/ml_backtest` | Rule vs ML comparison |

## Project structure

```
backend/          FastAPI app (main.py)
frontend/         React + Vite UI
  vercel.json     SPA routing for Vercel
```

## License

MIT (or your chosen license)
