import { ReactNode } from "react";
import { cn } from "@/components/ui/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

const GlassCard = ({ children, className, hover = false }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "glass-card p-6",
        hover && "transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
