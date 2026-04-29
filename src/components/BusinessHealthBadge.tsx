import { cn } from "@/lib/utils";

interface Props {
  profit: number;
  fixedCosts: number;
}

export function BusinessHealthBadge({ profit, fixedCosts }: Props) {
  const status =
    profit > fixedCosts * 0.1
      ? { emoji: "🟢", label: "Healthy Business", color: "text-success bg-success/10 border-success/30" }
      : profit >= 0
      ? { emoji: "🟡", label: "Stable", color: "text-warning bg-warning/10 border-warning/30" }
      : { emoji: "🔴", label: "At Risk", color: "text-destructive bg-destructive/10 border-destructive/30" };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold", status.color)}>
      {status.emoji} {status.label}
    </span>
  );
}
