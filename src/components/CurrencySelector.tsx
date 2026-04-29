import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES, Currency } from "@/lib/currency";

interface Props {
  value: Currency;
  onChange: (currency: Currency) => void;
}

export function CurrencySelector({ value, onChange }: Props) {
  return (
    <Select value={value.code} onValueChange={(code) => {
      const c = CURRENCIES.find(c => c.code === code);
      if (c) onChange(c);
    }}>
      <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary border-border">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map(c => (
          <SelectItem key={c.code} value={c.code} className="text-xs">
            {c.symbol} {c.code} — {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
