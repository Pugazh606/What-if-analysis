import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { SimulationResult, StartupInputs, EstablishedInputs, generateProfitVsPriceData } from "@/lib/calculations";
import { Currency, convertFromUSD } from "@/lib/currency";

interface Props {
  result: SimulationResult;
  mode: 'startup' | 'established';
  inputs: StartupInputs | EstablishedInputs;
  currency: Currency;
}

const COLORS = {
  profit: '#2dd4bf',
  revenue: '#3b82f6',
  cost: '#ef4444',
  marketing: '#a855f7',
  fixed: '#eab308',
};

const RADIAN = Math.PI / 180;

function renderCustomLabel({ cx, cy, midAngle, outerRadius, name, percent }: any) {
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="hsl(215,12%,70%)"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={500}
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function SimulatorCharts({ result, mode, inputs, currency }: Props) {
  const sym = currency?.symbol ?? '$';
  const rate = currency?.rate ?? 1;
  const fmtAxis = (v: number) => `${sym}${Math.round(v * rate).toLocaleString()}`;
  const fmtTooltip = (v: number) => `${sym}${Math.round(v * rate).toLocaleString()}`;

  const profitVsPrice = generateProfitVsPriceData(mode, inputs);

  const costBreakdown = mode === 'startup'
    ? [
        { name: 'Variable', value: result.variableCost },
        { name: 'Fixed', value: (inputs as StartupInputs).fixedCosts },
        { name: 'Marketing', value: (inputs as StartupInputs).marketingSpend },
      ]
    : [
        { name: 'Variable', value: result.variableCost },
        { name: 'Marketing', value: (inputs as EstablishedInputs).marketingBudget },
      ];

  const pieColors = [COLORS.cost, COLORS.fixed, COLORS.marketing];

  const revenueData = profitVsPrice.map(p => ({
    price: `${sym}${(p.price * rate).toFixed(0)}`,
    revenue: p.revenue,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Profit vs Price */}
      <div className="card-gradient rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">📈 Profit vs Price</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={profitVsPrice}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,20%)" />
            <XAxis dataKey="price" tick={{ fontSize: 11, fill: 'hsl(215,12%,55%)' }} tickFormatter={v => `${sym}${(v * rate).toFixed(0)}`} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(215,12%,55%)' }} tickFormatter={fmtAxis} />
            <Tooltip
              contentStyle={{ background: 'hsl(220,18%,13%)', border: '1px solid hsl(220,14%,20%)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(v: number) => [fmtTooltip(v), 'Profit']}
            />
            <Line type="monotone" dataKey="profit" stroke={COLORS.profit} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue vs Price */}
      <div className="card-gradient rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">📊 Revenue vs Price</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueData.filter((_, i) => i % 2 === 0)}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,20%)" />
            <XAxis dataKey="price" tick={{ fontSize: 11, fill: 'hsl(215,12%,55%)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(215,12%,55%)' }} tickFormatter={fmtAxis} />
            <Tooltip
              contentStyle={{ background: 'hsl(220,18%,13%)', border: '1px solid hsl(220,14%,20%)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(v: number) => [fmtTooltip(v), 'Revenue']}
            />
            <Bar dataKey="revenue" fill={COLORS.revenue} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost Breakdown */}
      <div className="card-gradient rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">📉 Cost Breakdown</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={costBreakdown}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
            >
              {costBreakdown.map((_, i) => (
                <Cell key={i} fill={pieColors[i]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'hsl(220,18%,13%)', border: '1px solid hsl(220,14%,20%)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(v: number) => [fmtTooltip(v)]}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: 'hsl(215,12%,70%)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
