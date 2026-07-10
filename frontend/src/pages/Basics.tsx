import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Basics = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">Backtesting basics</h1>
        <p className="text-muted-foreground mb-10">
          A quick reference for how this app works and what the numbers mean.
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mb-2">What backtesting is</h2>
            <p className="text-muted-foreground">
              You apply a trading rule to historical price data and measure how the account
              would have moved. It is a sanity check, not a forecast.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Indicators used here</h2>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li><strong>SMA / EMA</strong> — moving averages; crossover strategies go long when the short average is above the long one.</li>
              <li><strong>MACD</strong> — difference between two EMAs plus a signal line; trades fire on line crossovers.</li>
              <li><strong>RSI</strong> — momentum oscillator; the SMA+RSI strategy skips entries when RSI is already stretched.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Metrics to watch</h2>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li><strong>Return %</strong> — total gain or loss over the test period.</li>
              <li><strong>Sharpe ratio</strong> — return per unit of risk (higher is better; assumes zero risk-free rate).</li>
              <li><strong>Max drawdown</strong> — worst peak-to-trough drop in equity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Caveats</h2>
            <p className="text-muted-foreground">
              This simulator is long-only, ignores fees and slippage, and shifts signals one bar
              to reduce lookahead bias. Past performance does not guarantee future results.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link to="/trade">
            <Button>Go to backtester</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Basics;
