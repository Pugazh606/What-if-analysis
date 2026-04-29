import { SimulationResult } from "@/lib/calculations";
import { MultiProductResult } from "@/components/MultiProductPanel";
import { Currency, formatCurrency } from "@/lib/currency";

interface Props {
  result: SimulationResult;
  mode: 'startup' | 'established';
  currency: Currency;
  multiProductResult: MultiProductResult | null;
  timeMult: number;
  discount: number;
  segment: string;
}

export function BusinessInsights({ result, mode, currency, multiProductResult, timeMult, discount, segment }: Props) {
  const fmt = (n: number) => formatCurrency(n, currency);
  const margin = result.revenue > 0 ? ((result.profit / result.revenue) * 100).toFixed(1) : '0';
  const insights: string[] = [];

  // Profit analysis
  if (result.profit > 0) {
    insights.push(`✅ The business is profitable with a margin of ${margin}%. Revenue of ${fmt(result.revenue)} exceeds total costs of ${fmt(result.totalCost)}.`);
  } else {
    insights.push(`⚠️ The business is operating at a loss of ${fmt(Math.abs(result.profit))}. Costs (${fmt(result.totalCost)}) exceed revenue (${fmt(result.revenue)}).`);
  }

  // Break-even
  if (isFinite(result.breakEvenUnits)) {
    insights.push(`📊 Break-even point is at ${result.breakEvenUnits.toLocaleString()} units. Selling beyond this point generates pure profit.`);
  } else {
    insights.push(`🚨 Break-even is unattainable at current pricing — cost per unit exceeds selling price.`);
  }

  // Discount impact
  if (discount > 0) {
    insights.push(`🏷️ A ${discount}% discount is active, reducing effective price. This increases volume appeal but compresses margins by approximately ${(discount * 0.8).toFixed(1)}%.`);
  }

  // Segment insight
  if (segment === 'budget') {
    insights.push(`👥 Targeting Budget Customers: Higher price sensitivity means demand responds strongly to price changes. Volume-based strategy recommended.`);
  } else {
    insights.push(`👥 Targeting Premium Customers: Lower price sensitivity allows higher margins. Focus on value differentiation over volume.`);
  }

  // Multi-product insights
  let topProduct = '';
  let lowProduct = '';
  if (multiProductResult && multiProductResult.products.length > 1) {
    const sorted = [...multiProductResult.products].sort((a, b) => b.profit - a.profit);
    topProduct = sorted[0].name;
    lowProduct = sorted[sorted.length - 1].name;
    insights.push(`🏆 Top performer: "${topProduct}" with ${fmt(sorted[0].profit * timeMult)} profit. Lowest: "${lowProduct}" at ${fmt(sorted[sorted.length - 1].profit * timeMult)}.`);

    const lossMakers = sorted.filter(p => p.profit < 0);
    if (lossMakers.length > 0) {
      insights.push(`🔴 ${lossMakers.length} product(s) are unprofitable: ${lossMakers.map(p => p.name).join(', ')}. Consider repricing or discontinuing.`);
    }
  }

  // Health
  const health = result.profit > 0 ? 'Healthy' : result.profit > -(result.totalCost * 0.2) ? 'Stable' : 'At Risk';
  insights.push(`🏥 Overall business health: ${health}. ${health === 'Healthy' ? 'Maintain current strategy while exploring growth.' : health === 'Stable' ? 'Monitor costs closely and optimize pricing.' : 'Immediate action required — reduce costs or increase pricing.'}`);

  return (
    <div className="card-gradient rounded-lg border border-border p-4 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">🧠 Auto-Generated Business Insights</h3>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <p key={i} className="text-xs text-muted-foreground leading-relaxed">{insight}</p>
        ))}
      </div>
    </div>
  );
}
