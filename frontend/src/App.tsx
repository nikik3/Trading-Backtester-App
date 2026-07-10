import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Trade from "./pages/Trade";
import Portfolio from "./pages/Portfolio";
import Basics from "./pages/Basics";
import NotFound from "./pages/NotFound";
import { BacktestProvider } from "./context/BacktestContext";
import { Toaster } from "./components/ui/sonner";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <BacktestProvider>
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
    </BacktestProvider>
  </ThemeProvider>
);

export default App;
