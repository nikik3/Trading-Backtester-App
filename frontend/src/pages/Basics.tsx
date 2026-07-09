import { Link } from "react-router-dom";
import { BookOpen, TrendingUp, Target, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Basics = () => {
  const sections = [
    {
      icon: BookOpen,
      title: "What is Backtesting?",
      content: "Backtesting is a method of evaluating a trading strategy by applying it to historical data to see how it would have performed. It's an essential tool for traders to validate their strategies before risking real capital in the market. By simulating trades on past market data, you can assess the viability of your strategy and make data-driven decisions."
    },
    {
      icon: TrendingUp,
      title: "Understanding the Stock Market",
      content: "The stock market is a platform where shares of publicly traded companies are bought and sold. Prices fluctuate based on supply and demand, influenced by company performance, economic indicators, and market sentiment. Understanding market dynamics, including trends, volatility, and liquidity, is crucial for developing effective trading strategies."
    },
    {
      icon: Target,
      title: "Key Technical Indicators",
      content: "Technical indicators are mathematical calculations based on price, volume, or open interest. Common indicators include:\n\n• SMA (Simple Moving Average): Average price over a specific period\n• EMA (Exponential Moving Average): Weighted average giving more importance to recent prices\n• RSI (Relative Strength Index): Momentum oscillator measuring speed and magnitude of price changes\n• MACD (Moving Average Convergence Divergence): Trend-following momentum indicator\n• Bollinger Bands: Volatility indicator showing price range relative to moving average"
    },
    {
      icon: Zap,
      title: "Common Backtesting Pitfalls",
      content: "Avoid these common mistakes:\n\n• Over-optimization: Curve-fitting to historical data\n• Look-ahead bias: Using information not available at the time\n• Survivorship bias: Only testing on stocks that still exist\n• Ignoring transaction costs: Forgetting commissions and slippage\n• Unrealistic assumptions: Assuming perfect execution\n• Small sample size: Drawing conclusions from too few trades"
    },
    {
      icon: Shield,
      title: "How StockPlay Helps",
      content: "StockPlay provides a backtesting platform designed to help you:\n\n• Upload and analyze historical OHLC market data\n• Run SMA, MACD, and RSI-filtered strategies with tunable parameters\n• Visualize equity curves and key performance metrics\n• Compare rule-based signals against an optional ML benchmark\n• Review detailed trade logs for every round-trip\n• Reduce lookahead bias with one-period signal shifting\n• Make informed decisions based on historical simulation — not live quotes"
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
       
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Basics of Backtesting</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn the fundamentals of backtesting and how to validate your trading strategies with historical data
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="card-glass rounded-xl p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold mt-2">{section.title}</h2>
                </div>
                <div className="pl-16">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-w-4xl mx-auto mt-12 card-glass rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Backtesting?</h2>
          <p className="text-muted-foreground mb-6">
            Put your knowledge into practice with our professional backtesting tools
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/trade">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Start Backtesting
              </Button>
            </Link>
            <Link to="/portfolio">
              <Button size="lg" variant="outline">
                View Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Basics;
