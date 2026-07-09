import { createContext, useContext, useState, ReactNode } from "react";

export interface Trade {
  date: string;
  type: "BUY" | "SELL";
  symbol: string;
  price: number;
  shares: number;
  pnl?: number;
  cumulativePnl?: number;
}

interface TradingContextType {
  trades: Trade[];
  addTrades: (newTrades: Trade[]) => void;
  portfolioValue: number;
  setPortfolioValue: (value: number) => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider = ({ children }: { children: ReactNode }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(100000);

  const addTrades = (newTrades: Trade[]) => {
    setTrades((prev) => [...prev, ...newTrades]);
  };

  return (
    <TradingContext.Provider value={{ trades, addTrades, portfolioValue, setPortfolioValue }}>
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error("useTrading must be used within TradingProvider");
  }
  return context;
};
