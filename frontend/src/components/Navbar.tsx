import { Link } from "react-router-dom";
import { TrendingUp, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-accent" />
            <span className="text-2xl font-bold">StockPlay</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <Link to="/trade" className="hover:text-accent transition-colors">
              Trade
            </Link>
            <Link to="/portfolio" className="hover:text-accent transition-colors">
              Portfolio
            </Link>
            <Link to="/basics" className="hover:text-accent transition-colors">
              Basics
            </Link>
            
            {/* Dark Mode Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-2"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;