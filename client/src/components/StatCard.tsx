import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
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
      "p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-primary/5 rounded-xl">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
            trend.isPositive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
          )}>
            {trend.isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
        <div className="text-2xl font-bold font-display text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
      </div>
    </div>
  );
}
