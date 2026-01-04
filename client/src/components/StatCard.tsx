import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ElementType;
  description?: string;
  className?: string;
}

export function StatCard({ title, value, trend, icon: Icon, description, className }: StatCardProps) {
  return (
    <div className={cn(
      "group relative p-5 sm:p-6 rounded-2xl bg-card border border-border/50 shadow-sm",
      "hover:shadow-xl hover:border-primary/20 transition-all duration-300",
      "overflow-hidden",
      className
    )}>
      {/* Gradient accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 sm:p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-full",
              trend.isPositive
                ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "text-rose-700 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400"
            )}>
              {trend.isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
          <div className="text-2xl sm:text-3xl font-bold font-display text-foreground tracking-tight">{value}</div>
          {description && (
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
