## Quick orientation for AI coding agents

These notes are focused on concrete, discoverable patterns in this repository so you can be productive immediately.

1) Big picture
- This is a two-part app: a Python FastAPI backend (folder `backend/`) and a React + TypeScript frontend (folder `frontend/`).
- Backend responsibilities: accept CSV uploads, run quick backtests / equity-curve calculations, and return JSON results. See `backend/main.py` for the full backtest endpoint (`/backtest`) and `backend/points.py` for a simpler `/equity_curve` endpoint.
- Frontend responsibilities: UI and plotting (Vite + React + TypeScript). Key charting logic lives under `frontend/src/components/` (e.g. `CandlestickChart.tsx`) and CSV parsing under `frontend/src/components/ui/csvParser.ts`.

2) How the pieces communicate
- Frontend fetches sample CSVs and uploads CSVs to the backend endpoints. The backend expects file uploads (multipart form) and form fields like `buy_condition`, `sell_condition`, `period_start`, etc. See the FastAPI route signature in `backend/main.py`.
- `backend/points.py` configures CORS to allow frontend requests (it uses `allow_origins=["*"]`). If you change that, update the frontend dev origin accordingly.

3) Important implementation patterns & conventions
- Backtesting logic is implemented in `backend/main.py` (functions: `execute_strategy`, `calculate_metrics`, `generate_trade_log`, `generate_equity_curve`). These functions operate on a pandas DataFrame with a Date index and columns `Open, High, Low, Close`.
- Strategy signals are parsed by keyword presence in the `buy_condition`/`sell_condition` strings (e.g. the code checks for 'MACD' or 'RSI' in the string and applies different logic). When changing signal logic, update both the indicator calculations and the conditional checks in `execute_strategy`.
- API responses use Pydantic models (`BacktestResult`, `TradeLog`, `EquityPoint`) defined at the top of `backend/main.py`. Keep returned dict keys aligned with those models (aliases used: `P&L`, `Cumulative P&L`, `Return(%)`, etc.).
- Equity curve generation samples points (max default 100) to keep payloads small (`generate_equity_curve`). When adding visual features, respect this sampling to avoid very large JSON payloads.

4) Build / dev / debug workflows (concrete commands)
- Frontend (Windows PowerShell):
  - cd frontend
  - npm install
  - npm run dev   # starts Vite dev server (hot reload)
  - npm run build # production build (runs `tsc -b && vite build`)

- Backend (Windows PowerShell):
  - cd backend
  - python -m venv .venv        # optional, recommended
  - .\.venv\Scripts\Activate  # activate virtualenv
  - pip install -r requirements.txt
  - uvicorn main:app --reload --port 8000    # serve `backend/main.py` app
  - or for the simple equity endpoint: uvicorn points:app --reload

5) Examples (how to call endpoints)
- Upload a CSV to the backtest endpoint (multipart form). The server expects a CSV with a `Date` column and `Close` values; `period_start` and `period_end` are strings (YYYY-MM-DD). See `backend/main.py` for all required form fields.

6) Project-specific quirks to watch
- `frontend/src/components/ui/csvParser.ts` requests `/dummydata.csv` (root-relative). The repo contains `backend/dummy_data.csv` — ensure the sample file is exposed to the frontend (copy to `frontend/public/` or proxy in dev) so `loadSampleData()` works.
- Frontend uses an overridden Vite package (`rolldown-vite`) via `package.json` overrides. Avoid changing Vite unless you understand the override.
- Frontend charts use `recharts` (not candlestick-specific libs). Chart components expect parsed numeric fields (see `parseCSV`) — keep parsing logic in sync with the backend column expectations (case and header names matter).

7) Files to check when making changes
- Back-end: `backend/main.py`, `backend/points.py`, `backend/requirements.txt`
- Front-end: `frontend/package.json`, `frontend/src/components/ui/csvParser.ts`, `frontend/src/components/CandlestickChart.tsx`, `frontend/src/App.tsx`

8) Safety: tests & verification
- There are no automated tests present. For quick verification, run the backend locally and use the frontend dev server to exercise upload and plotting flows. Inspect returned JSON against the Pydantic models in `backend/main.py`.

If any of the locations above are outdated or you want additional examples (sample cURL, unit test scaffolding, or CI wiring), tell me which you want and I'll add them. 
