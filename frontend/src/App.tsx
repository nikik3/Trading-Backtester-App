import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Trade from "./pages/Trade";
import Portfolio from "./pages/Portfolio";
import Basics from "./pages/Basics";
import NotFound from "./pages/NotFound";
import { BacktestProvider } from "./context/BacktestContext";
import { TradingProvider } from "./contexts/TradingContext";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <BacktestProvider>
        <TradingProvider>
          <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/trade" element={<Trade />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/basics" element={<Basics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </TradingProvider>
      </BacktestProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;