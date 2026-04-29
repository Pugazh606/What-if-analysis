export type CustomerSegment = 'budget' | 'premium';

export interface StartupInputs {
  pricePerUnit: number;
  salesVolume: number;
  costPerUnit: number;
  fixedCosts: number;
  marketingSpend: number;
  discount: number;
  demand: number;
  segment: CustomerSegment;
}

export interface EstablishedInputs {
  currentPrice: number;
  baseSalesVolume: number;
  costPerUnit: number;
  marketingBudget: number;
  priceSensitivity: number;
  marketingImpactFactor: number;
  basePrice: number;
  baseProfit: number;
  discount: number;
  demand: number;
  segment: CustomerSegment;
}

export interface SimulationResult {
  revenue: number;
  totalCost: number;
  profit: number;
  breakEvenUnits: number;
  growthPercent?: number;
  adjustedSales?: number;
  variableCost: number;
  survivalIndicator: 'healthy' | 'warning' | 'high-risk';
}

const SEGMENT_MODIFIERS: Record<CustomerSegment, { priceSensitivityMult: number; demandMult: number }> = {
  budget: { priceSensitivityMult: 1.5, demandMult: 1.2 },
  premium: { priceSensitivityMult: 0.6, demandMult: 0.8 },
};

export function calculateStartup(inputs: StartupInputs): SimulationResult {
  const { pricePerUnit, salesVolume, costPerUnit, fixedCosts, marketingSpend, discount, demand, segment } = inputs;
  const segMod = SEGMENT_MODIFIERS[segment];
  const effectivePrice = pricePerUnit * (1 - discount / 100);
  const demandAdjustedVolume = Math.round(salesVolume * (demand / 100) * segMod.demandMult);
  const revenue = effectivePrice * demandAdjustedVolume;
  const variableCost = costPerUnit * demandAdjustedVolume;
  const totalCost = variableCost + fixedCosts + marketingSpend;
  const profit = revenue - totalCost;
  const margin = effectivePrice - costPerUnit;
  const breakEvenUnits = margin > 0 ? Math.ceil(fixedCosts / margin) : Infinity;
  const survivalIndicator: SimulationResult['survivalIndicator'] =
    profit >= 0 ? 'healthy' : profit > -fixedCosts * 0.5 ? 'warning' : 'high-risk';

  return { revenue, totalCost, profit, breakEvenUnits, variableCost, survivalIndicator };
}

export function calculateEstablished(inputs: EstablishedInputs): SimulationResult {
  const {
    currentPrice, baseSalesVolume, costPerUnit, marketingBudget,
    priceSensitivity, marketingImpactFactor, basePrice, baseProfit,
    discount, demand, segment,
  } = inputs;

  const segMod = SEGMENT_MODIFIERS[segment];
  const effectivePrice = currentPrice * (1 - discount / 100);
  const priceChangePercent = basePrice > 0 ? (effectivePrice - basePrice) / basePrice : 0;
  const priceImpact = priceChangePercent * priceSensitivity * segMod.priceSensitivityMult;
  const adjustedSales = Math.max(0, Math.round(baseSalesVolume * (demand / 100) * segMod.demandMult * (1 + marketingImpactFactor - priceImpact)));

  const revenue = effectivePrice * adjustedSales;
  const variableCost = costPerUnit * adjustedSales;
  const totalCost = variableCost + marketingBudget;
  const profit = revenue - totalCost;
  const growthPercent = baseProfit !== 0 ? ((profit - baseProfit) / Math.abs(baseProfit)) * 100 : 0;
  const margin = effectivePrice - costPerUnit;
  const breakEvenUnits = margin > 0 ? Math.ceil(marketingBudget / margin) : Infinity;
  const survivalIndicator: SimulationResult['survivalIndicator'] =
    profit >= 0 ? 'healthy' : profit > -marketingBudget * 0.5 ? 'warning' : 'high-risk';

  return { revenue, totalCost, profit, breakEvenUnits, growthPercent, adjustedSales, variableCost, survivalIndicator };
}

export function generateProfitVsPriceData(
  mode: 'startup' | 'established',
  baseInputs: StartupInputs | EstablishedInputs
) {
  const points = [];
  if (mode === 'startup') {
    const inputs = baseInputs as StartupInputs;
    const basePrice = inputs.pricePerUnit;
    for (let i = -50; i <= 100; i += 10) {
      const price = Math.max(1, basePrice + i);
      const result = calculateStartup({ ...inputs, pricePerUnit: price });
      points.push({ price, profit: result.profit, revenue: result.revenue });
    }
  } else {
    const inputs = baseInputs as EstablishedInputs;
    const basePrice = inputs.basePrice;
    for (let i = -50; i <= 100; i += 10) {
      const price = Math.max(1, basePrice + i);
      const result = calculateEstablished({ ...inputs, currentPrice: price });
      points.push({ price, profit: result.profit, revenue: result.revenue });
    }
  }
  return points;
}

export const STARTUP_PRESETS = {
  realistic: { pricePerUnit: 50, salesVolume: 1000, costPerUnit: 30, fixedCosts: 10000, marketingSpend: 5000, discount: 0, demand: 100, segment: 'budget' as CustomerSegment },
  best: { pricePerUnit: 75, salesVolume: 2000, costPerUnit: 25, fixedCosts: 8000, marketingSpend: 10000, discount: 5, demand: 120, segment: 'premium' as CustomerSegment },
  worst: { pricePerUnit: 35, salesVolume: 400, costPerUnit: 28, fixedCosts: 15000, marketingSpend: 3000, discount: 15, demand: 60, segment: 'budget' as CustomerSegment },
};

export const ESTABLISHED_PRESETS = {
  realistic: { currentPrice: 100, baseSalesVolume: 5000, costPerUnit: 60, marketingBudget: 50000, priceSensitivity: 1.2, marketingImpactFactor: 0.15, basePrice: 100, baseProfit: 150000, discount: 0, demand: 100, segment: 'budget' as CustomerSegment },
  best: { currentPrice: 120, baseSalesVolume: 6000, costPerUnit: 50, marketingBudget: 80000, priceSensitivity: 0.8, marketingImpactFactor: 0.25, basePrice: 100, baseProfit: 150000, discount: 5, demand: 120, segment: 'premium' as CustomerSegment },
  worst: { currentPrice: 85, baseSalesVolume: 3500, costPerUnit: 65, marketingBudget: 30000, priceSensitivity: 2.0, marketingImpactFactor: 0.05, basePrice: 100, baseProfit: 150000, discount: 20, demand: 70, segment: 'budget' as CustomerSegment },
};
