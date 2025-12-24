import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  delay?: number;
}

const StatCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  gradient,
  iconColor,
  delay = 0,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-card hover:shadow-soft transition-all duration-300 animate-fade-in group",
        gradient
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-50 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-current to-transparent" 
           style={{ color: iconColor }} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "p-3 rounded-xl transition-transform group-hover:scale-110 duration-300",
            )}
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon className="h-5 w-5" style={{ color: iconColor }} />
          </div>
          <div
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
              trend === "up"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {change}
          </div>
        </div>

        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-display font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
