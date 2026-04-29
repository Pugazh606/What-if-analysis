import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (name: string) => void;
}

export function BusinessNameHeader({ value, onChange }: Props) {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!value) {
      setDisplayName("");
      return;
    }
    let i = 0;
    setDisplayName("");
    const interval = setInterval(() => {
      i++;
      setDisplayName(value.slice(0, i));
      if (i >= value.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="space-y-1">
      <Input
        placeholder="Enter Business Name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-64 bg-secondary border-border text-sm font-medium"
      />
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
        {displayName ? (
          <>{displayName} <span className="text-muted-foreground font-normal">–</span> What-If Analysis Dashboard</>
        ) : (
          <>What-If Business Simulator</>
        )}
      </h1>
      <p className="text-sm text-muted-foreground">
        Simulating your business decisions in real-time
      </p>
    </div>
  );
}
