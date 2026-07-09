import { TrendingUp, TrendingDown } from "lucide-react";

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const StockCard = ({ symbol, name, price, change, changePercent }: StockCardProps) => {
  const isPositive = change >= 0;

  return (
    <div className="card-glass rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xl font-bold font-mono">{symbol}</div>
          <div className="text-sm text-muted-foreground">{name}</div>
        </div>
        {isPositive ? (
          <TrendingUp className="w-8 h-8 text-success" />
        ) : (
          <TrendingDown className="w-8 h-8 text-destructive" />
        )}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold font-mono">${price.toFixed(2)}</div>
        <div
          className={`text-lg font-bold font-mono ${
            isPositive ? "text-success" : "text-destructive"
          }`}
        >
          {isPositive ? "+" : ""}
          {changePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

export default StockCard;
