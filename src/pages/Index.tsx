import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard } from "@/components/KpiCard";
import { StartupPanel } from "@/components/StartupPanel";
import { EstablishedPanel } from "@/components/EstablishedPanel";
import { SimulatorCharts } from "@/components/SimulatorCharts";
import { CurrencySelector } from "@/components/CurrencySelector";
import { BusinessNameHeader } from "@/components/BusinessNameHeader";
import { BusinessHealthBadge } from "@/components/BusinessHealthBadge";
import { SimulationScore } from "@/components/SimulationScore";
import { MiniTrendChart } from "@/components/MiniTrendChart";
import { MultiProductPanel, ProductEntry, calculateMultiProduct } from "@/components/MultiProductPanel";
import { ProductCharts } from "@/components/ProductCharts";
import { BusinessInsights } from "@/components/BusinessInsights";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CURRENCIES, Currency, formatCurrency } from "@/lib/currency";
import { generatePdfReport } from "@/lib/generateReport";
import {
  StartupInputs, EstablishedInputs,
  calculateStartup, calculateEstablished,
  STARTUP_PRESETS, ESTABLISHED_PRESETS,
} from "@/lib/calculations";

const fmtUnits = (n: number) => {
  if (!isFinite(n)) return '∞';
  return n.toLocaleString();
};

type TimePeriod = 'monthly' | 'quarterly' | 'annually';
const TIME_MULTIPLIERS: Record<TimePeriod, number> = { monthly: 1, quarterly: 3, annually: 12 };
const TIME_LABELS: Record<TimePeriod, string> = { monthly: 'Monthly', quarterly: 'Quarterly', annually: 'Annually' };

export default function Index() {
  const [mode, setMode] = useState<'startup' | 'established'>('startup');
  const [startupInputs, setStartupInputs] = useState<StartupInputs>(STARTUP_PRESETS.realistic);
  const [establishedInputs, setEstablishedInputs] = useState<EstablishedInputs>(ESTABLISHED_PRESETS.realistic);
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [businessName, setBusinessName] = useState("");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [multiProductMode, setMultiProductMode] = useState(false);
  const [products, setProducts] = useState<ProductEntry[]>([]);

  const baseResult = useMemo(() => {
    return mode === 'startup'
      ? calculateStartup(startupInputs)
      : calculateEstablished(establishedInputs);
  }, [mode, startupInputs, establishedInputs]);

  const multiResult = useMemo(() => {
    if (!multiProductMode || products.length === 0) return null;
    return calculateMultiProduct(products);
  }, [multiProductMode, products]);

  const mult = TIME_MULTIPLIERS[timePeriod];

  const result: typeof baseResult = useMemo(() => ({
    ...baseResult,
    revenue: baseResult.revenue * mult,
    totalCost: baseResult.totalCost * mult,
    profit: baseResult.profit * mult,
    variableCost: baseResult.variableCost * mult,
    adjustedSales: baseResult.adjustedSales != null ? baseResult.adjustedSales * mult : undefined,
    breakEvenUnits: baseResult.breakEvenUnits,
    growthPercent: baseResult.growthPercent,
    survivalIndicator: baseResult.survivalIndicator,
  }), [baseResult, mult]);

  const displayRevenue = multiProductMode && multiResult
    ? result.revenue + multiResult.totalRevenue * mult
    : result.revenue;
  const displayCost = multiProductMode && multiResult
    ? result.totalCost + multiResult.totalCost * mult
    : result.totalCost;
  const displayProfit = multiProductMode && multiResult
    ? result.profit + multiResult.totalProfit * mult
    : result.profit;

  const currentInputs = mode === 'startup' ? startupInputs : establishedInputs;
  const fixedCosts = mode === 'startup' ? (currentInputs as StartupInputs).fixedCosts : (currentInputs as EstablishedInputs).marketingBudget;

  const fmt = (n: number) => formatCurrency(n, currency);
  const profitVariant = displayProfit >= 0 ? 'success' : 'danger';

  const simScore = useMemo(() => {
    const marginRatio = result.revenue > 0 ? result.profit / result.revenue : 0;
    const profitScore = Math.min(40, Math.max(0, marginRatio * 100));
    const costRatio = result.revenue > 0 ? 1 - result.totalCost / result.revenue : 0;
    const costScore = Math.min(30, Math.max(0, costRatio * 60));
    const beScore = isFinite(result.breakEvenUnits) && result.breakEvenUnits > 0
      ? Math.min(30, Math.max(0, 30 - (result.breakEvenUnits / 500) * 10))
      : 0;
    return Math.round(Math.max(0, Math.min(100, profitScore + costScore + beScore)));
  }, [result]);

  const scoreLabel = simScore >= 80 ? "Excellent" : simScore >= 60 ? "Strong" : simScore >= 40 ? "Moderate" : simScore >= 20 ? "Weak" : "Critical";
  const healthLabel = displayProfit > fixedCosts * 0.1 ? "Healthy Business" : displayProfit >= 0 ? "Stable" : "At Risk";

  const handleDownloadReport = () => {
    generatePdfReport({
      businessName,
      mode,
      timePeriod: TIME_LABELS[timePeriod],
      currency,
      revenue: displayRevenue,
      totalCost: displayCost,
      profit: displayProfit,
      breakEvenUnits: result.breakEvenUnits,
      growthPercent: result.growthPercent,
      survivalIndicator: result.survivalIndicator,
      score: simScore,
      scoreLabel,
      healthLabel,
      multiProductResult: multiProductMode ? multiResult : null,
      timeMult: mult,
      discount: currentInputs.discount,
      segment: currentInputs.segment,
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-2">
          <BusinessNameHeader value={businessName} onChange={setBusinessName} />
          <BusinessHealthBadge profit={displayProfit} fixedCosts={fixedCosts} />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button size="sm" variant="outline" onClick={handleDownloadReport} className="text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" /> Download Report
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Multi-Product</span>
            <Switch checked={multiProductMode} onCheckedChange={setMultiProductMode} />
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            {(['monthly', 'quarterly', 'annually'] as TimePeriod[]).map((tp) => (
              <button
                key={tp}
                onClick={() => setTimePeriod(tp)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  timePeriod === tp
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {TIME_LABELS[tp]}
              </button>
            ))}
          </div>
          <CurrencySelector value={currency} onChange={setCurrency} />
        </div>
      </div>

      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="startup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            🚀 Startup
          </TabsTrigger>
          <TabsTrigger value="established" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            🏢 Established
          </TabsTrigger>
        </TabsList>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard title="Profit / Loss" value={fmt(displayProfit)} variant={profitVariant}
            trend={displayProfit > 0 ? 'up' : displayProfit < 0 ? 'down' : 'neutral'} />
          <KpiCard title="Revenue" value={fmt(displayRevenue)} variant="default" />
          <KpiCard title="Total Cost" value={fmt(displayCost)} variant="default" />
          <KpiCard title="Break-even" value={fmtUnits(result.breakEvenUnits)} subtitle="units" variant="default" />
          {mode === 'established' && result.growthPercent !== undefined ? (
            <KpiCard title="Growth" value={`${result.growthPercent.toFixed(1)}%`}
              variant={result.growthPercent >= 0 ? 'success' : 'danger'}
              trend={result.growthPercent >= 0 ? 'up' : 'down'} />
          ) : (
            <KpiCard title="Status"
              value={result.survivalIndicator === 'healthy' ? 'Healthy' : result.survivalIndicator === 'warning' ? 'Warning' : 'High Risk'}
              variant={result.survivalIndicator === 'healthy' ? 'success' : result.survivalIndicator === 'warning' ? 'warning' : 'danger'} />
          )}
        </div>

        {/* Simulation Score + Mini Trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SimulationScore result={result} />
          <MiniTrendChart mode={mode} inputs={currentInputs} currency={currency} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="card-gradient rounded-lg border border-border p-5 sticky top-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-info mb-4">
                {mode === 'startup' ? '🟦 Startup Inputs' : '🟦 Business Inputs'}
              </h2>
              <TabsContent value="startup" className="mt-0">
                <StartupPanel inputs={startupInputs} onChange={setStartupInputs} currency={currency} />
              </TabsContent>
              <TabsContent value="established" className="mt-0">
                <EstablishedPanel inputs={establishedInputs} onChange={setEstablishedInputs} currency={currency} />
              </TabsContent>
            </div>

            {multiProductMode && (
              <div className="card-gradient rounded-lg border border-border p-5">
                <MultiProductPanel products={products} onChange={setProducts} currency={currency} />
              </div>
            )}
          </div>

          {/* Charts + Insights */}
          <div className="lg:col-span-8 space-y-4">
            <SimulatorCharts result={result} mode={mode} inputs={currentInputs} currency={currency} />

            {/* Product-level charts */}
            {multiProductMode && multiResult && multiResult.products.length > 0 && (
              <ProductCharts multiResult={multiResult} currency={currency} timeMult={mult} />
            )}

            {/* Product Breakdown Table */}
            {multiProductMode && multiResult && multiResult.products.length > 0 && (
              <div className="card-gradient rounded-lg border border-border p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">📦 Product Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-medium">Product</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Revenue</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Cost</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Profit</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {multiResult.products.map((p, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2 text-foreground">{p.name}</td>
                          <td className="py-2 text-right font-mono">{fmt(p.revenue * mult)}</td>
                          <td className="py-2 text-right font-mono">{fmt(p.cost * mult)}</td>
                          <td className={`py-2 text-right font-mono ${p.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {fmt(p.profit * mult)}
                          </td>
                          <td className="py-2 text-right font-mono">
                            {p.revenue > 0 ? `${((p.profit / p.revenue) * 100).toFixed(1)}%` : '0%'}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold">
                        <td className="py-2 text-foreground">Total</td>
                        <td className="py-2 text-right font-mono">{fmt(multiResult.totalRevenue * mult)}</td>
                        <td className="py-2 text-right font-mono">{fmt(multiResult.totalCost * mult)}</td>
                        <td className={`py-2 text-right font-mono ${multiResult.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {fmt(multiResult.totalProfit * mult)}
                        </td>
                        <td className="py-2 text-right font-mono">
                          {multiResult.totalRevenue > 0 ? `${((multiResult.totalProfit / multiResult.totalRevenue) * 100).toFixed(1)}%` : '0%'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Business Insights */}
            <BusinessInsights
              result={result}
              mode={mode}
              currency={currency}
              multiProductResult={multiProductMode ? multiResult : null}
              timeMult={mult}
              discount={currentInputs.discount}
              segment={currentInputs.segment}
            />
          </div>
        </div>
      </Tabs>
    </div>
  );
}
