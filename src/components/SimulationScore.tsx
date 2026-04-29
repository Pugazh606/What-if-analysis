import { SimulationResult } from "@/lib/calculations";
import { cn } from "@/lib/utils";

interface Props {
  result: SimulationResult;
}

function calcScore(result: SimulationResult): number {
  // Profitability: 0-40 pts
  const marginRatio = result.revenue > 0 ? result.profit / result.revenue : 0;
  const profitScore = Math.min(40, Math.max(0, marginRatio * 100));

  // Cost efficiency: 0-30 pts
  const costRatio = result.revenue > 0 ? 1 - result.totalCost / result.revenue : 0;
  const costScore = Math.min(30, Math.max(0, costRatio * 60));

  // Demand strength: 0-30 pts based on break-even
  const beScore = isFinite(result.breakEvenUnits) && result.breakEvenUnits > 0
    ? Math.min(30, Math.max(0, 30 - (result.breakEvenUnits / 500) * 10))
    : 0;

  return Math.round(Math.max(0, Math.min(100, profitScore + costScore + beScore)));
}

function getLabel(score: number) {
  if (score >= 80) return "Excellent Business Model";
  if (score >= 60) return "Strong Business Model";
  if (score >= 40) return "Moderate – Needs Optimization";
  if (score >= 20) return "Weak – High Risk";
  return "Critical – Rethink Strategy";
}

export function SimulationScore({ result }: Props) {
  const score = calcScore(result);
  const label = getLabel(score);
  const color = score >= 60 ? "text-success" : score >= 40 ? "text-warning" : "text-destructive";

  return (
    <div className="card-gradient rounded-lg border border-border p-4 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Simulation Score</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
      <div className={cn("text-3xl font-bold font-mono", color)}>
        {score}<span className="text-lg text-muted-foreground">/100</span>
      </div>
    </div>
  );
}
