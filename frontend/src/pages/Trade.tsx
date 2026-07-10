import { useState, useRef, useMemo } from "react";
import { Upload, Play, Database, Brain, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";
import { useTrading, Trade as TradeType } from "@/contexts/TradingContext";
import { useBacktest } from "../context/BacktestContext";
import {
  apiUrl,
  candlestickToCsv,
  computeSma,
  fetchWithTimeout,
  isMLResponse,
  normalizeApiResponse,
  parseCsvText,
  type CandlestickData,
  type NormalizedBacktestResult,
} from "@/utils/backtestApi";

type StrategyType = "sma_crossover" | "macd_crossover" | "sma_rsi";

const STRATEGY_LABELS: Record<StrategyType, string> = {
  sma_crossover: "SMA Crossover — buy when short MA is above long MA",
  macd_crossover: "MACD Crossover — buy/sell on MACD line crossing signal line",
  sma_rsi: "SMA + RSI — SMA trend with RSI overbought filter",
};

const Trade = () => {
  const { addTrades, setPortfolioValue } = useTrading();
  const { result, setResult } = useBacktest();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [dataSource, setDataSource] = useState<"none" | "upload" | "sample">("none");
  const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  const [useML, setUseML] = useState(false);
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [fileName, setFileName] = useState("");
  const [backtestRun, setBacktestRun] = useState(false);
  const [strategySymbol, setStrategySymbol] = useState("AAPL");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [strategyType, setStrategyType] = useState<StrategyType>("sma_crossover");
  const [smaShortPeriod, setSmaShortPeriod] = useState(5);
  const [smaLongPeriod, setSmaLongPeriod] = useState(20);
  const [rsiWindow, setRsiWindow] = useState(14);
  const [initialCapital, setInitialCapital] = useState(100000);

  const normalized = useMemo(() => {
    if (!result) return null;
    return normalizeApiResponse(result);
  }, [result]);

  const mlResult = normalized && isMLResponse(normalized) ? normalized : null;
  const activeResult: NormalizedBacktestResult | null = mlResult
    ? (useML ? mlResult.ml_based : mlResult.rule_based)
    : (normalized as NormalizedBacktestResult | null);

  const priceChartData = useMemo(() => {
    if (!candlestickData.length) return [];
    const closes = candlestickData.map((d) => d.close);
    const smaShort = computeSma(closes, smaShortPeriod);
    const smaLong = computeSma(closes, smaLongPeriod);
    return candlestickData.map((d, i) => ({
      date: d.date,
      close: d.close,
      smaShort: smaShort[i],
      smaLong: smaLong[i],
    }));
  }, [candlestickData, smaShortPeriod, smaLongPeriod]);

  const equityChartData = useMemo(() => {
    if (!mlResult) {
      return (activeResult?.equity_curve ?? []).map((pt) => ({
        date: pt.date,
        equity: pt.value,
      }));
    }
    const rule = mlResult.rule_based.equity_curve;
    const ml = mlResult.ml_based.equity_curve;
    return rule.map((pt, i) => ({
      date: pt.date,
      equity: pt.value,
      ml_equity: ml[i]?.value,
    }));
  }, [activeResult, mlResult]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCsvText(text);
        if (!data.length) {
          toast.error("No valid rows found. CSV needs: Date, Open, High, Low, Close (Volume optional).");
          return;
        }
        setCandlestickData(data);
        setFileName(file.name);
        setDataSource("upload");
        toast.success(`Loaded ${data.length} data points from ${file.name}`);
      } catch {
        toast.error("Error parsing CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const handleUseSampleData = async () => {
    setIsLoadingSample(true);
    toast.info("Loading sample data…");

    try {
      // Bundled CSV — works instantly on Vercel without waiting for Render
      const resp = await fetch("/sample_data.csv");
      if (!resp.ok) throw new Error("Could not load sample data file");
      const text = await resp.text();
      const data = parseCsvText(text);
      if (!data.length) throw new Error("Sample file was empty or invalid");
      setCandlestickData(data);
      setDataSource("sample");
      toast.success(`Sample data loaded: ${data.length} data points`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load sample data";
      toast.error(message);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const appendStrategyFields = (form: FormData) => {
    const strategyPayload = {
      symbol: strategySymbol,
      strategy_type: strategyType,
      sma_short_period: smaShortPeriod,
      sma_long_period: smaLongPeriod,
      rsi_window: rsiWindow,
    };
    form.append("strategy", JSON.stringify(strategyPayload));
    form.append("strategy_type", strategyType);
    form.append("stock_symbol", strategySymbol);
    form.append("sma_short_period", String(smaShortPeriod));
    form.append("sma_long_period", String(smaLongPeriod));
    form.append("rsi_window", String(rsiWindow));
    form.append("initial_capital", String(initialCapital));
  };

  const handleRunBacktest = async () => {
    if (dataSource === "none" || !candlestickData.length) {
      toast.error("Please load data first (sample or CSV upload)");
      return;
    }

    if (smaShortPeriod >= smaLongPeriod) {
      toast.error("Short SMA period must be less than long SMA period");
      return;
    }

    if (useML && candlestickData.length < 80) {
      toast.error("ML mode needs at least ~80 data points. Use the full sample dataset.");
      return;
    }

    setIsLoading(true);
    toast(`Running backtest on ${candlestickData.length} rows…`);

    try {
      const form = new FormData();
      const uploadedFile = fileInputRef.current?.files?.[0];

      if (dataSource === "upload" && uploadedFile) {
        form.append("file", uploadedFile, uploadedFile.name);
      } else {
        const blob = new Blob([candlestickToCsv(candlestickData)], { type: "text/csv" });
        form.append("file", blob, `${strategySymbol || "sample"}.csv`);
      }

      appendStrategyFields(form);

      const path = useML ? "/ml_backtest" : "/backtest";
      if (!apiBaseUrl) {
        throw new Error(
          "Backend URL not configured. Set VITE_API_URL in Vercel to your Render URL (e.g. https://trading-backtester-app.onrender.com)."
        );
      }

      toast.info("Connecting to backend… (Render free tier may take up to 60s to wake up)");
      const resp = await fetchWithTimeout(apiUrl(path, apiBaseUrl), { method: "POST", body: form });

      if (!resp.ok) {
        let message = `Backtest failed (${resp.status})`;
        try {
          const errJson = await resp.json();
          message = errJson.message ?? message;
        } catch {
          message = await resp.text();
        }
        throw new Error(message);
      }

      const json = await resp.json();
      const parsed = normalizeApiResponse(json);
      setResult(json);
      setBacktestRun(true);

      const metrics: NormalizedBacktestResult =
        isMLResponse(parsed) && useML ? parsed.ml_based : isMLResponse(parsed) ? parsed.rule_based : parsed;

      toast.success(
        isMLResponse(parsed)
          ? `Backtest complete — ML accuracy ${(parsed.accuracy * 100).toFixed(1)}%`
          : "Backtest completed successfully"
      );

      if (metrics.trade_log.length) {
        const mapped: TradeType[] = metrics.trade_log.map((t) => ({
          date: t.date,
          type: t.type.toUpperCase() as "BUY" | "SELL",
          symbol: strategySymbol,
          price: t.price,
          shares: 100,
          pnl: t.pnl,
          cumulativePnl: t.cumulative_pnl,
        }));
        addTrades(mapped);
      }

      if (metrics.equity_final) {
        setPortfolioValue(metrics.equity_final);
      }

      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Backtest failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Strategy Backtester</h1>
          <p className="text-muted-foreground max-w-2xl">
            Load historical OHLC data, pick a strategy, and simulate how it would have performed.
            The optional ML mode trains a logistic regression model on indicators and compares it to the rule-based strategy.
          </p>
        </div>

        {/* 1. Data */}
        <div className="card-glass rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-2">1. Load Price Data</h2>
          <p className="text-sm text-muted-foreground mb-6">
            CSV format: <code className="text-xs">Date, Open, High, Low, Close</code> (Volume optional).
            Sample data is ~5,000 hourly bars — enough for both rule-based and ML backtests.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                dataSource === "upload" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv"
                className="hidden"
              />
              <div onClick={() => fileInputRef.current?.click()}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Upload CSV</h3>
                    <p className="text-sm text-muted-foreground">Your own historical data</p>
                  </div>
                </div>
                {dataSource === "upload" && fileName && (
                  <p className="text-success text-sm">✓ {fileName} — {candlestickData.length} rows</p>
                )}
              </div>
            </div>

            <div
              className={`border-2 rounded-xl p-6 transition-all ${
                isLoadingSample ? "opacity-70 pointer-events-none" : "cursor-pointer"
              } ${
                dataSource === "sample" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
              }`}
              onClick={handleUseSampleData}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  {isLoadingSample ? (
                    <Loader2 className="w-6 h-6 text-accent animate-spin" />
                  ) : (
                    <Database className="w-6 h-6 text-accent" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {isLoadingSample ? "Loading sample data…" : "Use Sample Data"}
                  </h3>
                  <p className="text-sm text-muted-foreground">~5,000 rows bundled with the app</p>
                </div>
              </div>
              {dataSource === "sample" && !isLoadingSample && (
                <p className="text-success text-sm">✓ {candlestickData.length} rows loaded</p>
              )}
            </div>
          </div>
        </div>

        {/* Price preview */}
        {candlestickData.length > 0 && (
          <div className="card-glass rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-2">Price Preview</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Close price with SMA({smaShortPeriod}) and SMA({smaLongPeriod}) overlays
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={priceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value) =>
                    typeof value === "number" ? `$${value.toFixed(2)}` : String(value ?? "")
                  }
                />
                <Legend />
                <Line type="monotone" dataKey="close" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="Close" />
                <Line type="monotone" dataKey="smaShort" stroke="hsl(var(--success))" strokeWidth={1.5} dot={false} name={`SMA ${smaShortPeriod}`} />
                <Line type="monotone" dataKey="smaLong" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} name={`SMA ${smaLongPeriod}`} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 2. Strategy */}
        <div className="card-glass rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">2. Choose Strategy & Parameters</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label>Strategy</Label>
              <Select value={strategyType} onValueChange={(v) => setStrategyType(v as StrategyType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STRATEGY_LABELS) as StrategyType[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {STRATEGY_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Stock Symbol</Label>
              <Input
                className="mt-1"
                value={strategySymbol}
                onChange={(e) => setStrategySymbol(e.target.value.toUpperCase())}
                placeholder="AAPL"
              />
            </div>

            <div>
              <Label>Initial Capital ($)</Label>
              <Input
                className="mt-1"
                type="number"
                min={1000}
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value) || 100000)}
              />
            </div>

            <div>
              <Label>Short SMA Period</Label>
              <Input
                className="mt-1"
                type="number"
                min={2}
                value={smaShortPeriod}
                onChange={(e) => setSmaShortPeriod(Number(e.target.value) || 5)}
              />
            </div>

            <div>
              <Label>Long SMA Period</Label>
              <Input
                className="mt-1"
                type="number"
                min={3}
                value={smaLongPeriod}
                onChange={(e) => setSmaLongPeriod(Number(e.target.value) || 20)}
              />
            </div>

            {strategyType === "sma_rsi" && (
              <div>
                <Label>RSI Window</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min={2}
                  value={rsiWindow}
                  onChange={(e) => setRsiWindow(Number(e.target.value) || 14)}
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. Run */}
        <div className="card-glass rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">3. Run Backtest</h2>
              <p className="text-muted-foreground text-sm mb-4">
                {STRATEGY_LABELS[strategyType]}
                {dataSource !== "none" && ` • ${candlestickData.length} bars loaded`}
              </p>

              <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg max-w-lg">
                <Brain className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Switch id="use-ml" checked={useML} onCheckedChange={setUseML} />
                    <Label htmlFor="use-ml" className="cursor-pointer font-medium">
                      Compare with ML (Logistic Regression)
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trains on 70% of data using SMA, EMA, RSI, MACD features. Tests on remaining 30%
                    and overlays ML equity vs rule-based SMA crossover. Needs ~80+ data points.
                  </p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleRunBacktest}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
              disabled={dataSource === "none" || isLoading}
            >
              <Play className="w-5 h-5" />
              {isLoading ? "Running…" : "Run Backtest"}
            </Button>
          </div>
        </div>

        {/* Results */}
        {backtestRun && activeResult && (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="card-glass rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6">Key Metrics</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period</span>
                    <span className="font-mono">{activeResult.start_time} → {activeResult.end_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final Equity</span>
                    <span className="font-mono font-bold text-success">
                      ${activeResult.equity_final.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Return</span>
                    <span className="font-mono font-bold">{activeResult.return_percent.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trades</span>
                    <span className="font-mono font-bold">{activeResult.no_of_trades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Win Rate</span>
                    <span className="font-mono font-bold">{activeResult.win_rate_percent.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sharpe Ratio</span>
                    <span className="font-mono font-bold">{activeResult.sharpe_ratio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strategy</span>
                    <span className="font-mono text-right max-w-[55%]">{activeResult.strategy}</span>
                  </div>
                  {mlResult && (
                    <div className="flex justify-between border-t border-border pt-3">
                      <span className="text-muted-foreground">ML Direction Accuracy</span>
                      <span className="font-mono font-bold text-primary">
                        {(mlResult.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-glass rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6">Equity Curve</h3>
                {equityChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={equityChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 9 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(v) => (typeof v === "number" ? `$${v.toLocaleString()}` : String(v ?? ""))}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="equity"
                        stroke="hsl(var(--success))"
                        strokeWidth={2}
                        dot={false}
                        name={mlResult ? "Rule-Based" : "Equity"}
                      />
                      {mlResult && (
                        <Line
                          type="monotone"
                          dataKey="ml_equity"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                          name="ML Model"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-sm">No equity data returned.</p>
                )}
              </div>
            </div>

            <div className="card-glass rounded-xl p-6">
              <h3 className="text-xl font-bold mb-6">Trade Log</h3>
              {activeResult.trade_log.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-sm">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Price</th>
                        <th className="text-left py-3 px-4">P&L</th>
                        <th className="text-left py-3 px-4">Cumulative P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeResult.trade_log.map((trade, i) => (
                        <tr key={i} className="border-b border-border/50 text-sm">
                          <td className="py-3 px-4 font-mono">{trade.date}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                trade.type === "BUY"
                                  ? "bg-success/20 text-success"
                                  : "bg-destructive/20 text-destructive"
                              }`}
                            >
                              {trade.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono">${trade.price.toFixed(2)}</td>
                          <td
                            className={`py-3 px-4 font-mono ${
                              trade.pnl > 0 ? "text-success" : trade.pnl < 0 ? "text-destructive" : ""
                            }`}
                          >
                            {trade.type === "BUY" ? "—" : `$${trade.pnl.toFixed(2)}`}
                          </td>
                          <td className="py-3 px-4 font-mono">${trade.cumulative_pnl.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No completed round-trip trades. The strategy may have stayed in one position for the whole period
                  (common on strongly trending data with SMA crossover).
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Trade;
