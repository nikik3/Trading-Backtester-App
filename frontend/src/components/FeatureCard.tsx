import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tag?: string;
}

const FeatureCard = ({ icon: Icon, title, description, tag }: FeatureCardProps) => (
  <div className="card-glass rounded-xl p-6 h-full hover:shadow-lg transition-all hover:-translate-y-0.5">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-lg bg-accent/15 flex items-center justify-center">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      {tag && (
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-muted-foreground">
          {tag}
        </span>
      )}
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export default FeatureCard;
