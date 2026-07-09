import { Link } from "react-router-dom";
import {
  Briefcase,
  TrendingUp,
  BookOpen,
  BarChart3,
  Brain,
  Upload,
  LineChart,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";

const STEPS = [
  {
    step: "01",
    title: "Load historical data",
    description: "Upload a CSV with Date, Open, High, Low, Close — or use the built-in ~5,000-row sample dataset.",
  },
  {
    step: "02",
    title: "Pick a strategy",
    description: "Choose SMA crossover, MACD crossover, or SMA + RSI filter. Tune periods and starting capital.",
  },
  {
    step: "03",
    title: "Review results",
    description: "See equity curve, Sharpe ratio, win rate, and a full trade log. Optionally compare against ML predictions.",
  },
];

const STRATEGIES = [
  { name: "SMA Crossover", detail: "Stay long when the short moving average is above the long moving average." },
  { name: "MACD Crossover", detail: "Enter and exit on MACD line crossing the signal line." },
  { name: "SMA + RSI Filter", detail: "Trend-following with RSI overbought / oversold guards." },
  { name: "ML Comparison", detail: "Logistic regression benchmark on a 70/30 holdout split (optional)." },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">Backtest</span> Your Trading Strategies
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            A full-stack backtesting platform — test rule-based and ML-assisted strategies on real historical
            price data before risking capital.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link to="/trade">
              <Button size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-8">
                <TrendingUp className="w-5 h-5" />
                Start Backtesting
              </Button>
            </Link>
            <Link to="/basics">
              <Button size="lg" variant="outline" className="gap-2 px-8">
                <BookOpen className="w-5 h-5" />
                Learn the Basics
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link to="/portfolio">
              <Button className="w-full h-28 text-lg bg-card hover:bg-card/80 border-2 border-accent/40 hover:border-accent transition-all group">
                <div className="flex flex-col items-center gap-2">
                  <Briefcase className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
                  <span className="font-bold">Portfolio</span>
                  <span className="text-sm text-muted-foreground">Last backtest report</span>
                </div>
              </Button>
            </Link>
            <Link to="/trade">
              <Button className="w-full h-28 text-lg bg-card hover:bg-card/80 border-2 border-accent/40 hover:border-accent transition-all group">
                <div className="flex flex-col items-center gap-2">
                  <LineChart className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
                  <span className="font-bold">Trade</span>
                  <span className="text-sm text-muted-foreground">Run a new backtest</span>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Platform features — replaces fake "trending stocks" */}
      <div className="container mx-auto px-6 py-16">
        <div className="mb-10">
          <h2 className="text-4xl font-bold mb-2">What StockPlay Does</h2>
          <p className="text-muted-foreground text-lg">
            Built for strategy validation — not live trading. Every result comes from your uploaded or sample
            historical data.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <FeatureCard
            icon={Upload}
            title="CSV & Sample Data"
            description="Upload OHLC history or load thousands of sample bars from the API in one click."
            tag="Data"
          />
          <FeatureCard
            icon={BarChart3}
            title="Rule-Based Strategies"
            description="Backtest SMA, MACD, and RSI-filtered signals with configurable periods and capital."
            tag="Core"
          />
          <FeatureCard
            icon={Brain}
            title="ML Benchmark"
            description="Compare rule-based performance against logistic regression on the same out-of-sample window."
            tag="Optional"
          />
          <FeatureCard
            icon={Shield}
            title="Bias-Aware Engine"
            description="Signals are shifted one period before return calculation to reduce lookahead bias."
            tag="Quality"
          />
        </div>

        {/* How it works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold text-accent/20 mb-3">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Supported strategies */}
        <div className="card-glass rounded-xl p-8 mb-12">
          <h2 className="text-3xl font-bold mb-2">Supported Strategies</h2>
          <p className="text-muted-foreground mb-8">
            Pick one on the Trade page, adjust parameters, and run. Metrics include return %, Sharpe ratio,
            volatility, win rate, equity curve, and trade log.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {STRATEGIES.map((s) => (
              <div key={s.name} className="bg-secondary/30 rounded-lg p-4">
                <h3 className="font-bold mb-1">{s.name}</h3>
                <p className="text-sm text-muted-foreground">{s.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link to="/trade">
              <Button className="gap-2">
                Go to Trade page
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
