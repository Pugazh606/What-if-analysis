import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

const variantStyles = {
  default: 'border-border',
  success: 'border-success/30 glow-primary',
  danger: 'border-destructive/30',
  warning: 'border-warning/30',
};

const valueStyles = {
  default: 'text-foreground',
  success: 'text-success',
  danger: 'text-destructive',
  warning: 'text-warning',
};

export function KpiCard({ title, value, subtitle, trend, variant = 'default' }: KpiCardProps) {
  return (
    <div className={cn(
      "card-gradient rounded-lg border p-4 transition-all duration-300 hover:scale-[1.02]",
      variantStyles[variant]
    )}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
      <p className={cn("text-2xl font-bold font-mono mt-1", valueStyles[variant])}>
        {value}
        {trend && (
          <span className={cn("text-sm ml-2", trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground')}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'}
          </span>
        )}
      </p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
