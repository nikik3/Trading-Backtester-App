import React, { createContext, useContext, useState } from 'react';

export interface TradeLogEntry {
  date: string;
  type: string;
  price: number;
  "P&L": number;
  "Cumulative P&L": number;
}

export interface EquityPoint {
  date: string;
  value: number;
}

export interface BacktestResult {
  start_time: string;
  end_time: string;
  equity_final: number;
  "Return(%)": number;
  "Volatility(%)": number;
  sharpe_ratio: number;
  max_trade_duration: string;
  "Avg. Trade Duration": string;
  "No. of trades": number;
  "Win Rate(%)": number;
  strategy: string;
  trade_log: TradeLogEntry[];
  equity_curve: EquityPoint[];
}

export interface MLBacktestResponse {
  rule_based: BacktestResult;
  ml_based: BacktestResult;
  accuracy: number;
}

type BacktestContextShape = {
  result: any | null;
  setResult: (r: any | null) => void;
};

const BacktestContext = createContext<BacktestContextShape | undefined>(undefined);

export const BacktestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [result, setResult] = useState<any | null>(null);
  return (
    <BacktestContext.Provider value={{ result, setResult }}>
      {children}
    </BacktestContext.Provider>
  );
};

export function useBacktest() {
  const ctx = useContext(BacktestContext);
  if (!ctx) throw new Error('useBacktest must be used within BacktestProvider');
  return ctx;
}

export default BacktestProvider;
