import { Link } from "react-router-dom";
import { Briefcase, TrendingUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import StockCard from "@/components/StockCard";

const Home = () => {
  const trendingStocks = [
    { symbol: "AAPL", name: "Apple Inc.", price: 178.42, change: 4.12, changePercent: 2.36 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 242.84, change: -2.98, changePercent: -1.21 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 141.80, change: 1.15, changePercent: 0.82 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 378.91, change: 5.62, changePercent: 1.51 },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 145.32, change: -0.45, changePercent: -0.31 },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 495.22, change: 12.34, changePercent: 2.55 },
  ];

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-6xl font-bold mb-6">
            <span className="text-gradient">Backtest</span> Your Trading Strategies
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Professional-grade backtesting platform for data-driven traders
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            <Link to="/portfolio">
              <Button className="w-full h-32 text-xl bg-card hover:bg-card/80 border-2 border-accent/40 hover:border-accent transition-all group">
                <div className="flex flex-col items-center gap-3">
                  <Briefcase className="w-10 h-10 text-accent group-hover:scale-110 transition-transform" />
                  <span className="font-bold">Portfolio</span>
                  <span className="text-sm text-muted-foreground">View Performance</span>
                </div>
              </Button>
            </Link>

            <Link to="/trade">
              <Button className="w-full h-32 text-xl bg-card hover:bg-card/80 border-2 border-accent/40 hover:border-accent transition-all group">
                <div className="flex flex-col items-center gap-3">
                  <TrendingUp className="w-10 h-10 text-accent group-hover:scale-110 transition-transform" />
                  <span className="font-bold">Trade</span>
                  <span className="text-sm text-muted-foreground">Backtest Strategies</span>
                </div>
              </Button>
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            <Link to="/basics">
              <Button className="w-full h-20 bg-secondary hover:bg-secondary/80 transition-all group">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg">Basics of Backtesting</span>
                  <span className="text-sm text-muted-foreground ml-auto">Learn More →</span>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">Trending Stocks</h2>
          <p className="text-muted-foreground text-lg">Real-time market movers</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingStocks.map((stock) => (
            <StockCard key={stock.symbol} {...stock} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
