import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line
} from "recharts";
import { MultiProductResult } from "@/components/MultiProductPanel";
import { Currency, convertFromUSD } from "@/lib/currency";

interface Props {
  multiResult: MultiProductResult;
  currency: Currency;
  timeMult: number;
}

export function ProductCharts({ multiResult, currency, timeMult }: Props) {
  const sym = currency?.symbol ?? '$';
  const rate = currency?.rate ?? 1;
  const fmtAxis = (v: number) => `${sym}${Math.round(v * rate).toLocaleString()}`;
  const fmtTooltip = (v: number) => `${sym}${Math.round(v * rate).toLocaleString()}`;

  const profitData = multiResult.products.map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    profit: p.profit * timeMult,
    revenue: p.revenue * timeMult,
    cost: p.cost * timeMult,
  }));

  const demandVsPrice = multiResult.products.map((p, i) => ({
    name: p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name,
    // We don't have raw price/demand here so derive from revenue/cost
    revenue: p.revenue * timeMult,
    profit: p.profit * timeMult,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Product Profit Comparison */}
      <div className="card-gradient rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">📊 Product Profit Comparison</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={profitData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,20%)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215,12%,55%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215,12%,55%)' }} tickFormatter={fmtAxis} />
            <Tooltip
              contentStyle={{ background: 'hsl(220,18%,13%)', border: '1px solid hsl(220,14%,20%)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(v: number, name: string) => [fmtTooltip(v), name === 'profit' ? 'Profit' : name === 'revenue' ? 'Revenue' : 'Cost']}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
            <Bar dataKey="cost" fill="#ef4444" radius={[4, 4, 0, 0]} name="Cost" />
            <Bar dataKey="profit" fill="#2dd4bf" radius={[4, 4, 0, 0]} name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue vs Profit per Product */}
      <div className="card-gradient rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">📈 Revenue vs Profit by Product</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={demandVsPrice}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,20%)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215,12%,55%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215,12%,55%)' }} tickFormatter={fmtAxis} />
            <Tooltip
              contentStyle={{ background: 'hsl(220,18%,13%)', border: '1px solid hsl(220,14%,20%)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(v: number, name: string) => [fmtTooltip(v), name === 'revenue' ? 'Revenue' : 'Profit']}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="revenue" fill="#a855f7" radius={[4, 4, 0, 0]} name="Revenue" />
            <Bar dataKey="profit" fill="#eab308" radius={[4, 4, 0, 0]} name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
