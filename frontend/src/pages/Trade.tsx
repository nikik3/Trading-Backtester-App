import { useState, useRef } from "react";
import { Upload, Play, Trash2, Plus, Database } from "lucide-react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
=======
>>>>>>> f97a3af (Simplify app and improve local setup)
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useTrading, Trade as TradeType } from "@/contexts/TradingContext";
import { useBacktest } from "../context/BacktestContext";

interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StrategyRule {
  id: number;
  name: string;
  indicator1: string;
  condition: string;
  indicator2: string;
  action: "BUY" | "SELL";
}

const Trade = () => {
<<<<<<< HEAD
  const navigate = useNavigate();
  const { addTrades, setPortfolioValue } = useTrading();
  const { result, setResult } = useBacktest();
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<"none" | "upload" | "sample">("none");
=======
  const { addTrades, setPortfolioValue } = useTrading();
  const { result, setResult } = useBacktest();
  const [, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<"none" | "upload" | "sample">("none");
  const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
>>>>>>> f97a3af (Simplify app and improve local setup)
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [fileName, setFileName] = useState("");
  const [backtestRun, setBacktestRun] = useState(false);
  const [strategySymbol, setStrategySymbol] = useState("AAPL");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [indicators, setIndicators] = useState({
    sma: true,
    ema: false,
    rsi: false,
    macd: false,
    bollingerBands: true,
  });
  const [rules, setRules] = useState<StrategyRule[]>([
    { id: 1, name: "Buy Signal", indicator1: "SMA(5)", condition: "crosses-above", indicator2: "SMA(20)", action: "BUY" },
    { id: 2, name: "Sell Signal", indicator1: "SMA(5)", condition: "crosses-below", indicator2: "SMA(20)", action: "SELL" },
  ]);
  const [nextRuleId, setNextRuleId] = useState(3);

  const sampleData: CandlestickData[] = [
    { date: "2023-01-01", open: 100.00, high: 101.00, low: 99.50, close: 100.50, volume: 1200000 },
    { date: "2023-01-02", open: 100.50, high: 101.50, low: 100.00, close: 101.20, volume: 1350000 },
    { date: "2023-01-03", open: 101.20, high: 102.00, low: 101.00, close: 101.80, volume: 1100000 },
    { date: "2023-01-04", open: 101.80, high: 103.00, low: 101.50, close: 102.50, volume: 1250000 },
    { date: "2023-01-05", open: 102.50, high: 103.50, low: 102.00, close: 103.00, volume: 1400000 },
    { date: "2023-01-06", open: 103.00, high: 104.00, low: 102.50, close: 103.50, volume: 1500000 },
    { date: "2023-01-09", open: 103.50, high: 104.50, low: 103.00, close: 104.20, volume: 1300000 },
    { date: "2023-01-10", open: 104.20, high: 105.00, low: 104.00, close: 104.80, volume: 1200000 },
    { date: "2023-01-11", open: 104.80, high: 105.50, low: 104.50, close: 105.10, volume: 1350000 },
    { date: "2023-01-12", open: 105.10, high: 106.00, low: 105.00, close: 105.50, volume: 1600000 },
    { date: "2023-01-13", open: 105.50, high: 106.50, low: 105.50, close: 106.00, volume: 1200000 },
    { date: "2023-01-16", open: 106.00, high: 107.00, low: 106.00, close: 106.50, volume: 1350000 },
    { date: "2023-01-17", open: 106.50, high: 107.50, low: 106.50, close: 107.20, volume: 1100000 },
    { date: "2023-01-18", open: 107.20, high: 108.00, low: 107.00, close: 107.80, volume: 1250000 },
    { date: "2023-01-19", open: 107.80, high: 108.50, low: 107.50, close: 108.30, volume: 1400000 },
    { date: "2023-01-20", open: 108.30, high: 109.00, low: 108.00, close: 108.80, volume: 1500000 },
    { date: "2023-01-23", open: 108.80, high: 109.50, low: 108.50, close: 109.20, volume: 1300000 },
    { date: "2023-01-24", open: 109.20, high: 110.00, low: 109.00, close: 109.80, volume: 1200000 },
    { date: "2023-01-25", open: 109.80, high: 110.50, low: 109.50, close: 110.30, volume: 1350000 },
    { date: "2023-01-26", open: 110.30, high: 111.00, low: 110.00, close: 110.80, volume: 1600000 },
    { date: "2023-01-27", open: 110.80, high: 111.50, low: 110.50, close: 111.20, volume: 1400000 },
  ];

  const equityData = [
    { date: "2020-01", equity: 10000, price: 95 },
    { date: "2020-04", equity: 12000, price: 98 },
    { date: "2020-07", equity: 11500, price: 102 },
    { date: "2020-10", equity: 14000, price: 108 },
    { date: "2021-01", equity: 15500, price: 115 },
    { date: "2021-04", equity: 18000, price: 120 },
    { date: "2021-07", equity: 20000, price: 125 },
    { date: "2023-12", equity: 22500, price: 130 },
  ];

  const trades = [
    { date: "2023-01-15", type: "BUY" as const, price: "105.50", pnl: "-", cumulative: "-", color: "text-muted-foreground" },
    { date: "2023-02-01", type: "SELL" as const, price: "110.25", pnl: "+4.75", cumulative: "+4.75", color: "text-success" },
    { date: "2023-02-15", type: "BUY" as const, price: "108.00", pnl: "-", cumulative: "+4.75", color: "text-muted-foreground" },
    { date: "2023-03-01", type: "SELL" as const, price: "113.50", pnl: "+5.50", cumulative: "+10.25", color: "text-success" },
    { date: "2023-03-20", type: "BUY" as const, price: "115.00", pnl: "-", cumulative: "+10.25", color: "text-muted-foreground" },
    { date: "2023-04-10", type: "SELL" as const, price: "112.00", pnl: "-3.00", cumulative: "+7.25", color: "text-destructive" },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n");
        const data: CandlestickData[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(",");
          if (values.length >= 6) {
            data.push({
              date: values[0],
              open: parseFloat(values[1]),
              high: parseFloat(values[2]),
              low: parseFloat(values[3]),
              close: parseFloat(values[4]),
              volume: parseInt(values[5]),
            });
          }
        }

        setCandlestickData(data);
        setFileName(file.name);
        setDataSource("upload");
        toast.success(`Successfully loaded ${data.length} data points from ${file.name}`);
      } catch (error) {
        toast.error("Error parsing CSV file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  const handleUseSampleData = () => {
    setCandlestickData(sampleData);
    setDataSource("sample");
    toast.success(`Sample data loaded: ${sampleData.length} data points`);
  };

  const handleAddRule = () => {
    const newRule: StrategyRule = {
      id: nextRuleId,
      name: `Rule ${nextRuleId}`,
      indicator1: "SMA(5)",
      condition: "crosses-above",
      indicator2: "SMA(20)",
      action: "BUY",
    };
    setRules([...rules, newRule]);
    setNextRuleId(nextRuleId + 1);
    toast.success("New rule added");
  };

  const handleDeleteRule = (id: number) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast.success("Rule deleted");
  };

  const handleRunBacktest = async () => {
    if (dataSource === "none") {
      toast.error("Please select a data source first");
      return;
    }

    setIsLoading(true);
<<<<<<< HEAD
  toast(`Backtest running — Processing ${candlestickData.length} rows for ${strategySymbol}`);
=======
    toast(`Backtest running — Processing ${candlestickData.length} rows for ${strategySymbol}`);
>>>>>>> f97a3af (Simplify app and improve local setup)

    try {
      const form = new FormData();

      // attach file if uploaded, else create CSV from sample data
      const uploadedFile = fileInputRef.current?.files?.[0];
      if (dataSource === 'upload' && uploadedFile) {
        form.append('file', uploadedFile, uploadedFile.name);
      } else {
        // create a CSV blob from candlestickData
        const header = 'Date,Open,High,Low,Close,Volume\n';
        const rows = candlestickData.map(d => `${d.date},${d.open},${d.high},${d.low},${d.close},${d.volume}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        form.append('file', blob, `${strategySymbol || 'sample'}.csv`);
      }

      // attach strategy as JSON
      const strategyPayload = {
        symbol: strategySymbol,
        rules,
        indicators,
      };
      form.append('strategy', JSON.stringify(strategyPayload));

<<<<<<< HEAD
      const resp = await fetch('http://localhost:8000/backtest', {
=======
      const endpoint = apiBaseUrl ? `${apiBaseUrl}/backtest` : "/api/backtest";
      const resp = await fetch(endpoint, {
>>>>>>> f97a3af (Simplify app and improve local setup)
        method: 'POST',
        body: form,
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Backtest failed: ${resp.status} ${text}`);
      }

      const json = await resp.json();

      // store result in BacktestContext
      setResult(json as any);
      setBacktestRun(true);
      toast.success('Backtest completed successfully');

      // if backend returned trade_log, add trades to TradingContext
      if (Array.isArray((json as any).trade_log)) {
        const mapped: TradeType[] = (json as any).trade_log.map((t: any) => ({
          date: t.date,
          type: (t.type ?? t.side ?? 'BUY').toUpperCase(),
          symbol: strategySymbol,
          price: Number(t.price ?? t.fill_price ?? t['Price'] ?? 0),
          shares: Number(t.shares ?? 100),
          pnl: t['P&L'] ?? t.pnl ?? undefined,
          cumulativePnl: t['Cumulative P&L'] ?? t.cumulative ?? undefined,
        }));
        addTrades(mapped);
      }

      // if backend provided final equity, update portfolio value
      if ((json as any).equity_final) {
        setPortfolioValue(Number((json as any).equity_final));
      }

      // scroll into view for results
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    } catch (err: any) {
      console.error('Backtest error', err);
      toast.error(err?.message ?? 'Backtest failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Strategy Backtester</h1>
          <p className="text-muted-foreground">Test your trading strategies with historical data</p>
        </div>

        <div className="card-glass rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">1. Choose Data Source</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
         
            <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
              dataSource === "upload" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
            }`}>
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
                    <h3 className="font-bold text-lg">Upload Your Data</h3>
                    <p className="text-sm text-muted-foreground">CSV format required</p>
                  </div>
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
                  <p className="text-sm mb-2">Drag & Drop CSV file or click to browse</p>
                  <p className="text-xs text-muted-foreground">Format: Date, Open, High, Low, Close, Volume</p>
                </div>
                {dataSource === "upload" && fileName && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-success text-sm">
                    <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                      <span className="text-success-foreground text-xs">✓</span>
                    </div>
                    <span>{fileName} uploaded successfully</span>
                  </div>
                )}
              </div>
            </div>

            <div 
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                dataSource === "sample" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
              }`}
              onClick={handleUseSampleData}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Database className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Use Sample Data</h3>
                  <p className="text-sm text-muted-foreground">Pre-loaded demo data</p>
                </div>
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
                <p className="text-sm mb-2">Click to load sample stock data</p>
                <p className="text-xs text-muted-foreground">21 days of simulated market data</p>
              </div>
              {dataSource === "sample" && (
                <div className="mt-4 flex items-center justify-center gap-2 text-success text-sm">
                  <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                    <span className="text-success-foreground text-xs">✓</span>
                  </div>
                  <span>Sample data loaded successfully</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {dataSource !== "none" && candlestickData.length > 0 && (
          <div className="card-glass rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Price Chart with Indicators</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={candlestickData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  style={{ fontSize: '12px' }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={false}
                  name="Close Price"
                />
                {indicators.sma && (
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke="hsl(var(--success))"
                    strokeWidth={1}
                    dot={false}
                    name="SMA"
                    strokeDasharray="5 5"
                  />
                )}
                {indicators.bollingerBands && (
                  <Line
                    type="monotone"
                    dataKey="low"
                    stroke="hsl(var(--primary))"
                    strokeWidth={1}
                    dot={false}
                    name="Bollinger Bands"
                    strokeDasharray="3 3"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="card-glass rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">2. Define Entry & Exit Rules</h2>
          
          <Button 
            variant="outline" 
            className="mb-6 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            onClick={handleAddRule}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Rule
          </Button>

          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-secondary/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">{rule.name}</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-muted-foreground">WHEN</span>
                  <Input className="w-32" placeholder="SMA(5)" defaultValue={rule.indicator1} />
                  <Select defaultValue={rule.condition}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crosses-above">crosses above</SelectItem>
                      <SelectItem value="crosses-below">crosses below</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input className="w-32" placeholder="SMA(20)" defaultValue={rule.indicator2} />
                  <span className="text-muted-foreground">THEN</span>
                  <Button className={rule.action === "BUY" ? "btn-trade" : "btn-sell"} size="sm">
                    {rule.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">3. Set Parameters</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Stock Symbol</Label>
                <Input 
                  type="text" 
                  value={strategySymbol}
                  onChange={(e) => setStrategySymbol(e.target.value.toUpperCase())}
                  placeholder="AAPL"
                />
              </div>
              <div>
                <Label>Short SMA Period</Label>
                <Input type="number" defaultValue="5" />
              </div>
              <div>
                <Label>Long SMA Period</Label>
                <Input type="number" defaultValue="20" />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">4. Select Indicators</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <Label htmlFor="sma" className="cursor-pointer">SMA (Simple Moving Average)</Label>
                <Switch
                  id="sma"
                  checked={indicators.sma}
                  onCheckedChange={(checked) => setIndicators({ ...indicators, sma: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <Label htmlFor="ema" className="cursor-pointer">EMA (Exponential Moving Average)</Label>
                <Switch
                  id="ema"
                  checked={indicators.ema}
                  onCheckedChange={(checked) => setIndicators({ ...indicators, ema: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <Label htmlFor="rsi" className="cursor-pointer">RSI (Relative Strength Index)</Label>
                <Switch
                  id="rsi"
                  checked={indicators.rsi}
                  onCheckedChange={(checked) => setIndicators({ ...indicators, rsi: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <Label htmlFor="macd" className="cursor-pointer">MACD</Label>
                <Switch
                  id="macd"
                  checked={indicators.macd}
                  onCheckedChange={(checked) => setIndicators({ ...indicators, macd: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <Label htmlFor="bb" className="cursor-pointer">Bollinger Bands</Label>
                <Switch
                  id="bb"
                  checked={indicators.bollingerBands}
                  onCheckedChange={(checked) => setIndicators({ ...indicators, bollingerBands: checked })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card-glass rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">5. Run Backtest</h2>
              <p className="text-muted-foreground">
                Strategy: SMA Crossover {dataSource !== "none" && `• Data: ${dataSource === "upload" ? fileName : "Sample Data"}`}
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={handleRunBacktest} 
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={dataSource === "none"}
            >
              <Play className="w-5 h-5" />
              Run Strategy Backtest
            </Button>
          </div>
        </div>

        {backtestRun && (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
             
              <div className="card-glass rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final Equity</span>
                    <span className="font-mono font-bold text-success">${result?.equity_final?.toLocaleString() ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Return</span>
                    <span className="font-mono font-bold text-success">{result ? (Number(result['Return(%)']).toFixed(2) + '%') : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Trades</span>
                    <span className="font-mono font-bold text-accent">{result?.['No. of trades'] ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sharpe Ratio</span>
                    <span className="font-mono font-bold text-accent">{result?.sharpe_ratio ? Number(result.sharpe_ratio).toFixed(2) : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Drawdown</span>
                    <span className="font-mono font-bold text-destructive">{(result as any)?.max_drawdown ?? '—'}</span>
                  </div>
                </div>
              </div>

              <div className="card-glass rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6">Equity Curve</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={equityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '10px' }} />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '10px' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '10px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="equity" stroke="hsl(var(--success))" strokeWidth={3} />
                    <Line yAxisId="right" type="monotone" dataKey="price" stroke="hsl(var(--accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-glass rounded-xl p-6">
              <h3 className="text-xl font-bold mb-6">Trade Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">Price</th>
                      <th className="text-left py-3 px-4 font-medium">P&L</th>
                      <th className="text-left py-3 px-4 font-medium">Cumulative P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-3 px-4 font-mono text-sm">{trade.date}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            trade.type === "BUY" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">{trade.price}</td>
                        <td className={`py-3 px-4 font-mono text-sm ${trade.color}`}>{trade.pnl}</td>
                        <td className={`py-3 px-4 font-mono text-sm ${trade.color}`}>{trade.cumulative}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Trade;
