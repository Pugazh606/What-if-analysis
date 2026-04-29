import { InputSlider } from "./InputSlider";
import { EstablishedInputs, ESTABLISHED_PRESETS, CustomerSegment } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Currency } from "@/lib/currency";

interface Props {
  inputs: EstablishedInputs;
  onChange: (inputs: EstablishedInputs) => void;
  currency: Currency;
}

export function EstablishedPanel({ inputs, onChange, currency }: Props) {
  const sym = currency?.symbol ?? '$';
  const set = (key: keyof EstablishedInputs) => (value: number) =>
    onChange({ ...inputs, [key]: value });

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(Object.keys(ESTABLISHED_PRESETS) as Array<keyof typeof ESTABLISHED_PRESETS>).map((preset) => (
          <Button
            key={preset}
            variant="outline"
            size="sm"
            className="text-xs capitalize"
            onClick={() => onChange(ESTABLISHED_PRESETS[preset])}
          >
            {preset}
          </Button>
        ))}
      </div>
      <InputSlider label="Current Price" value={inputs.currentPrice} min={1} max={500} prefix={sym} onChange={set('currentPrice')} />
      <InputSlider label="Discount" value={inputs.discount} min={0} max={80} suffix="%" onChange={set('discount')} />
      <InputSlider label="Base Sales Volume" value={inputs.baseSalesVolume} min={0} max={20000} step={100} onChange={set('baseSalesVolume')} />
      <InputSlider label="Demand" value={inputs.demand} min={0} max={200} suffix="%" onChange={set('demand')} />
      <InputSlider label="Cost per Unit" value={inputs.costPerUnit} min={1} max={400} prefix={sym} onChange={set('costPerUnit')} />
      <InputSlider label="Marketing Budget" value={inputs.marketingBudget} min={0} max={200000} step={1000} prefix={sym} onChange={set('marketingBudget')} />
      <InputSlider label="Price Sensitivity" value={inputs.priceSensitivity} min={0} max={5} step={0.1} onChange={set('priceSensitivity')} />
      <InputSlider label="Marketing Impact Factor" value={inputs.marketingImpactFactor} min={0} max={1} step={0.01} onChange={set('marketingImpactFactor')} />

      {/* Customer Segmentation */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Customer Segment</label>
        <div className="flex gap-2">
          {(['budget', 'premium'] as CustomerSegment[]).map((seg) => (
            <Button
              key={seg}
              variant={inputs.segment === seg ? 'default' : 'outline'}
              size="sm"
              className="flex-1 text-xs capitalize"
              onClick={() => onChange({ ...inputs, segment: seg })}
            >
              {seg === 'budget' ? '💰 Budget' : '✨ Premium'}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
