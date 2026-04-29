import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { generateProfitVsPriceData, StartupInputs, EstablishedInputs } from "@/lib/calculations";
import { Currency } from "@/lib/currency";

interface Props {
  mode: 'startup' | 'established';
  inputs: StartupInputs | EstablishedInputs;
  currency: Currency;
}

export function MiniTrendChart({ mode, inputs, currency }: Props) {
  const sym = currency?.symbol ?? '$';
  const rate = currency?.rate ?? 1;
  const data = generateProfitVsPriceData(mode, inputs);

  return (
    <div className="card-gradient rounded-lg border border-border p-4">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">📉 Demand vs Price Trend</h3>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data}>
          <XAxis dataKey="price" hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: 'hsl(220,18%,13%)', border: '1px solid hsl(220,14%,20%)', borderRadius: 8, fontSize: 11, color: '#e2e8f0' }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#e2e8f0' }}
            formatter={(v: number) => [`${sym}${(v * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Profit']}
            labelFormatter={(v) => `Price: ${sym}${(Number(v) * rate).toFixed(0)}`}
          />
          <Line type="monotone" dataKey="profit" stroke="#2dd4bf" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
