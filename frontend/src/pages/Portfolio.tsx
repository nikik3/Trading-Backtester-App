import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { useBacktest } from "../context/BacktestContext";
import { isMLResponse, normalizeApiResponse } from "@/utils/backtestApi";

const Portfolio: React.FC = () => {
  const { result } = useBacktest();

  const currentResult = useMemo(() => {
    if (!result) return null;
    const normalized = normalizeApiResponse(result);
    return isMLResponse(normalized) ? normalized.rule_based : normalized;
  }, [result]);

  const performanceData = useMemo(() => {
    if (!currentResult?.equity_curve) return [];
    return currentResult.equity_curve.map((p) => ({ date: p.date, value: p.value }));
  }, [currentResult]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Summary from your most recent backtest</p>
        </div>

        {!currentResult ? (
          <div className="card-glass rounded-xl p-12 text-center">
            <p className="text-muted-foreground mb-6">No backtest results yet.</p>
            <Link to="/trade">
              <Button>Run a Backtest</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="card-glass p-4">
                <p className="text-sm text-muted-foreground">Return</p>
                <p className={`text-2xl font-bold font-mono ${currentResult.return_percent >= 0 ? "text-success" : "text-destructive"}`}>
                  {currentResult.return_percent.toFixed(2)}%
                </p>
              </div>
              <div className="card-glass p-4">
                <p className="text-sm text-muted-foreground">Sharpe</p>
                <p className="text-2xl font-bold font-mono">{currentResult.sharpe_ratio.toFixed(2)}</p>
              </div>
              <div className="card-glass p-4">
                <p className="text-sm text-muted-foreground">Max Drawdown</p>
                <p className="text-2xl font-bold font-mono text-destructive">
                  -{currentResult.max_drawdown_percent.toFixed(2)}%
                </p>
              </div>
              <div className="card-glass p-4">
                <p className="text-sm text-muted-foreground">Final Equity</p>
                <p className="text-2xl font-bold font-mono">
                  ${currentResult.equity_final.toLocaleString()}
                </p>
              </div>
              <div className="card-glass p-4">
                <p className="text-sm text-muted-foreground">Trades / Win%</p>
                <p className="text-2xl font-bold font-mono">
                  {currentResult.no_of_trades} / {currentResult.win_rate_percent.toFixed(0)}%
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {currentResult.strategy} · {currentResult.start_time} → {currentResult.end_time}
            </p>

            <div className="card-glass rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Equity Curve</h2>
              <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip formatter={(value) => (typeof value === "number" ? `$${value.toLocaleString()}` : value)} />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-glass rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Trade Log</h2>
              {currentResult.trade_log.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Type</th>
                        <th className="py-2 pr-4">Price</th>
                        <th className="py-2 pr-4">P&L</th>
                        <th className="py-2">Cum. P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentResult.trade_log.map((t, idx) => (
                        <tr key={idx} className="border-b border-border/50">
                          <td className="py-2 pr-4 font-mono">{t.date}</td>
                          <td className="py-2 pr-4">{t.type}</td>
                          <td className="py-2 pr-4 font-mono">${t.price.toFixed(2)}</td>
                          <td className="py-2 pr-4 font-mono">
                            {t.type === "BUY" ? "—" : `$${t.pnl.toFixed(2)}`}
                          </td>
                          <td className="py-2 font-mono">${t.cumulative_pnl.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No round-trip trades in this run.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
