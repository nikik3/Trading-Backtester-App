import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useBacktest } from "../context/BacktestContext";
import { isMLResponse, normalizeApiResponse } from "@/utils/backtestApi";

const Portfolio: React.FC = () => {
  const { result } = useBacktest();

  const currentResult = useMemo(() => {
    if (!result) return null;
    const normalized = normalizeApiResponse(result);
    return isMLResponse(normalized) ? normalized.ml_based : normalized;
  }, [result]);

  const performanceData = useMemo(() => {
    if (!currentResult || !currentResult.equity_curve) return [];
    return currentResult.equity_curve.map((p: any) => ({ date: p.date, value: p.value }));
  }, [currentResult]);

  const summary = useMemo(() => {
    if (!currentResult) return null;
    return {
      equity_final: currentResult.equity_final,
      return_pct: currentResult.return_percent,
      sharpe: currentResult.sharpe_ratio,
      trades: currentResult.no_of_trades,
      win_rate: currentResult.win_rate_percent,
    };
  }, [currentResult]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Live report from the last backtest</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card-glass p-4">
            <p className="text-sm text-muted-foreground">Final Equity</p>
            <p className="text-2xl font-bold">{summary ? `$${summary.equity_final.toLocaleString()}` : '—'}</p>
          </div>
          <div className="card-glass p-4">
            <p className="text-sm text-muted-foreground">Return</p>
            <p className="text-2xl font-bold">{summary ? `${summary.return_pct.toFixed(2)}%` : '—'}</p>
          </div>
          <div className="card-glass p-4">
            <p className="text-sm text-muted-foreground">Sharpe</p>
            <p className="text-2xl font-bold">{summary ? `${summary.sharpe.toFixed(2)}` : '—'}</p>
          </div>
          <div className="card-glass p-4">
            <p className="text-sm text-muted-foreground">Trades / Win%</p>
            <p className="text-2xl font-bold">{summary ? `${summary.trades} / ${summary.win_rate}%` : '—'}</p>
          </div>
        </div>

        <div className="card-glass rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Equity Curve</h2>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip formatter={(value: any) => (typeof value === 'number' ? `$${value.toLocaleString()}` : value)} />
                <Line type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glass rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Trades</h2>
          {currentResult && currentResult.trade_log && currentResult.trade_log.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-muted-foreground">
                    <th>Date</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>P&L</th>
                    <th>Cum. P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {currentResult.trade_log.map((t, idx) => (
                    <tr key={idx} className="border-t border-dashed">
                      <td className="py-2">{t.date}</td>
                      <td className="py-2">{t.type}</td>
                      <td className="py-2">${t.price.toFixed(2)}</td>
                      <td className="py-2">{t.type === "BUY" ? "—" : `$${t.pnl.toFixed(2)}`}</td>
                      <td className="py-2">${t.cumulative_pnl.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Run a backtest from the Trade page to populate trades.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
