export interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NormalizedBacktestResult {
  start_time: string;
  end_time: string;
  equity_final: number;
  return_percent: number;
  volatility_percent: number;
  sharpe_ratio: number;
  max_trade_duration: string;
  avg_trade_duration: string;
  no_of_trades: number;
  win_rate_percent: number;
  strategy: string;
  trade_log: Array<{
    date: string;
    type: string;
    price: number;
    pnl: number;
    cumulative_pnl: number;
  }>;
  equity_curve: Array<{ date: string; value: number }>;
}

export interface NormalizedMLResponse {
  rule_based: NormalizedBacktestResult;
  ml_based: NormalizedBacktestResult;
  accuracy: number;
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeBacktestResult(raw: any): NormalizedBacktestResult {
  const trade_log = Array.isArray(raw?.trade_log)
    ? raw.trade_log.map((t: any) => ({
        date: String(t.date ?? ""),
        type: String(t.type ?? "BUY"),
        price: num(t.price),
        pnl: num(t.pnl ?? t["P&L"]),
        cumulative_pnl: num(t.cumulative_pnl ?? t["Cumulative P&L"]),
      }))
    : [];

  const equity_curve = Array.isArray(raw?.equity_curve)
    ? raw.equity_curve.map((p: any) => ({
        date: String(p.date ?? ""),
        value: num(p.value),
      }))
    : [];

  return {
    start_time: String(raw?.start_time ?? "N/A"),
    end_time: String(raw?.end_time ?? "N/A"),
    equity_final: num(raw?.equity_final, 0),
    return_percent: num(raw?.return_percent ?? raw?.["Return(%)"]),
    volatility_percent: num(raw?.volatility_percent ?? raw?.["Volatility(%)"]),
    sharpe_ratio: num(raw?.sharpe_ratio),
    max_trade_duration: String(raw?.max_trade_duration ?? "N/A"),
    avg_trade_duration: String(raw?.avg_trade_duration ?? raw?.["Avg. Trade Duration"] ?? "N/A"),
    no_of_trades: num(raw?.no_of_trades ?? raw?.["No. of trades"]),
    win_rate_percent: num(raw?.win_rate_percent ?? raw?.["Win Rate(%)"]),
    strategy: String(raw?.strategy ?? "Unknown"),
    trade_log,
    equity_curve,
  };
}

export function normalizeApiResponse(json: any): NormalizedBacktestResult | NormalizedMLResponse {
  if (json?.rule_based && json?.ml_based) {
    return {
      rule_based: normalizeBacktestResult(json.rule_based),
      ml_based: normalizeBacktestResult(json.ml_based),
      accuracy: num(json.accuracy),
    };
  }
  return normalizeBacktestResult(json);
}

export function isMLResponse(
  result: NormalizedBacktestResult | NormalizedMLResponse | null
): result is NormalizedMLResponse {
  return !!result && "rule_based" in result && "ml_based" in result;
}

export function parseCsvText(text: string): CandlestickData[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const data: CandlestickData[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(",").map((v) => v.trim());
    if (values.length < 5) continue;

    const open = parseFloat(values[1]);
    const high = parseFloat(values[2]);
    const low = parseFloat(values[3]);
    const close = parseFloat(values[4]);
    if (![open, high, low, close].every(Number.isFinite)) continue;

    data.push({
      date: values[0],
      open,
      high,
      low,
      close,
      volume: values.length >= 6 ? parseInt(values[5], 10) || 0 : 0,
    });
  }
  return data;
}

export function candlestickToCsv(data: CandlestickData[]): string {
  const header = "Date,Open,High,Low,Close\n";
  const rows = data.map((d) => `${d.date},${d.open},${d.high},${d.low},${d.close}`).join("\n");
  return header + rows;
}

export function computeSma(values: number[], period: number): (number | null)[] {
  return values.map((_, i) => {
    if (i + 1 < period) return null;
    const slice = values.slice(i + 1 - period, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

export function apiUrl(path: string, baseUrl?: string): string {
  const base = (baseUrl ?? "").replace(/\/$/, "");
  return base ? `${base}${path}` : `/api${path}`;
}
