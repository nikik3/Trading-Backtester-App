import React, { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'stockplay_backtest_result';

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
  "Max Drawdown(%)": number;
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

function loadStoredResult(): any | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const BacktestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [result, setResultState] = useState<any | null>(loadStoredResult);

  const setResult = (r: any | null) => {
    setResultState(r);
    if (r) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

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
