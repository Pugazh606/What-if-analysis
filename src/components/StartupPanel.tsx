import { InputSlider } from "./InputSlider";
import { StartupInputs, STARTUP_PRESETS, CustomerSegment } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Currency } from "@/lib/currency";

interface Props {
  inputs: StartupInputs;
  onChange: (inputs: StartupInputs) => void;
  currency: Currency;
}

export function StartupPanel({ inputs, onChange, currency }: Props) {
  const sym = currency?.symbol ?? '$';
  const set = (key: keyof StartupInputs) => (value: number) =>
    onChange({ ...inputs, [key]: value });

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(Object.keys(STARTUP_PRESETS) as Array<keyof typeof STARTUP_PRESETS>).map((preset) => (
          <Button
            key={preset}
            variant="outline"
            size="sm"
            className="text-xs capitalize"
            onClick={() => onChange(STARTUP_PRESETS[preset])}
          >
            {preset}
          </Button>
        ))}
      </div>
      <InputSlider label="Price per Unit" value={inputs.pricePerUnit} min={1} max={500} prefix={sym} onChange={set('pricePerUnit')} />
      <InputSlider label="Discount" value={inputs.discount} min={0} max={80} suffix="%" onChange={set('discount')} />
      <InputSlider label="Expected Sales Volume" value={inputs.salesVolume} min={0} max={10000} step={50} onChange={set('salesVolume')} />
      <InputSlider label="Demand" value={inputs.demand} min={0} max={200} suffix="%" onChange={set('demand')} />
      <InputSlider label="Cost per Unit" value={inputs.costPerUnit} min={1} max={400} prefix={sym} onChange={set('costPerUnit')} />
      <InputSlider label="Fixed Costs" value={inputs.fixedCosts} min={0} max={100000} step={500} prefix={sym} onChange={set('fixedCosts')} />
      <InputSlider label="Marketing Spend" value={inputs.marketingSpend} min={0} max={50000} step={500} prefix={sym} onChange={set('marketingSpend')} />

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
