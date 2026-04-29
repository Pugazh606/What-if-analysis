import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Currency } from "@/lib/currency";
import { Plus, Trash2, Upload, Download, X } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export interface ProductEntry {
  id: string;
  name: string;
  price: number;
  costPerUnit: number;
  demand: number;
}

export interface MultiProductResult {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  products: { name: string; revenue: number; cost: number; profit: number }[];
}

export function calculateMultiProduct(products: ProductEntry[]): MultiProductResult {
  const calculated = products.map((p) => {
    const revenue = p.price * p.demand;
    const cost = p.costPerUnit * p.demand;
    return { name: p.name || 'Unnamed', revenue, cost, profit: revenue - cost };
  });
  return {
    totalRevenue: calculated.reduce((s, p) => s + p.revenue, 0),
    totalCost: calculated.reduce((s, p) => s + p.cost, 0),
    totalProfit: calculated.reduce((s, p) => s + p.profit, 0),
    products: calculated,
  };
}

interface Props {
  products: ProductEntry[];
  onChange: (products: ProductEntry[]) => void;
  currency: Currency;
}

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

function parseRows(header: string[], rows: any[][]): ProductEntry[] | null {
  const h = header.map((s) => String(s).toLowerCase().trim());
  const nameIdx = h.findIndex((x) => x.includes('product') || x.includes('name'));
  const priceIdx = h.findIndex((x) => x.includes('price'));
  const costIdx = h.findIndex((x) => x.includes('cost'));
  const demandIdx = h.findIndex((x) => x.includes('demand'));

  if (priceIdx === -1 || costIdx === -1) return null;

  const parsed: ProductEntry[] = [];
  for (const r of rows) {
    if (!r || r.length < 2) continue;
    const price = Math.max(0, Number(r[priceIdx]) || 0);
    const cost = Math.max(0, Number(r[costIdx]) || 0);
    if (price === 0 && cost === 0) continue;
    parsed.push({
      id: genId(),
      name: nameIdx >= 0 ? String(r[nameIdx] ?? '') : '',
      price,
      costPerUnit: cost,
      demand: demandIdx >= 0 ? Math.max(0, Number(r[demandIdx]) || 0) : 0,
    });
  }
  return parsed;
}

function downloadSampleCSV() {
  const csv = "Product,Price,Cost,Demand\nWidget A,50,30,500\nWidget B,75,40,300\nWidget C,120,80,150\n";
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_products.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function MultiProductPanel({ products, onChange, currency }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addProduct = () => {
    onChange([...products, { id: genId(), name: '', price: 0, costPerUnit: 0, demand: 0 }]);
  };

  const removeProduct = (id: string) => {
    onChange(products.filter((p) => p.id !== id));
  };

  const updateProduct = (id: string, field: keyof ProductEntry, value: string) => {
    onChange(
      products.map((p) =>
        p.id === id
          ? { ...p, [field]: field === 'name' ? value : Math.max(0, Number(value) || 0) }
          : p
      )
    );
  };

  const processFile = useCallback((file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const rows = text.split('\n').map((r) => r.split(',').map((c) => c.trim()));
        const header = rows[0];
        if (!header) { toast.error("Empty CSV file"); return; }
        const parsed = parseRows(header, rows.slice(1));
        if (!parsed) { toast.error("Missing required columns: Price, Cost"); return; }
        if (parsed.length === 0) { toast.error("No valid product rows found"); return; }
        onChange([...products, ...parsed]);
        toast.success(`${parsed.length} product(s) loaded successfully`);
      };
      reader.readAsText(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const wb = XLSX.read(ev.target?.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
          if (data.length < 2) { toast.error("Excel file has no data rows"); return; }
          const parsed = parseRows(data[0].map(String), data.slice(1));
          if (!parsed) { toast.error("Missing required columns: Price, Cost"); return; }
          if (parsed.length === 0) { toast.error("No valid product rows found"); return; }
          onChange([...products, ...parsed]);
          toast.success(`${parsed.length} product(s) loaded from Excel`);
        } catch {
          toast.error("Failed to parse Excel file");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error("Unsupported format. Use .csv or .xlsx");
    }
  }, [products, onChange]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (e.target) e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const sym = currency.symbol;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-info">Multi-Product Input</h3>
          {products.length > 0 && (
            <span className="text-[10px] text-muted-foreground">{products.length} product(s) loaded</span>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button size="sm" variant="ghost" onClick={downloadSampleCSV} className="text-xs gap-1 h-7">
            <Download className="w-3 h-3" /> Sample
          </Button>
          {products.length > 0 && (
            <Button size="sm" variant="ghost" onClick={() => { onChange([]); toast.info("Products cleared"); }} className="text-xs gap-1 h-7 text-destructive">
              <X className="w-3 h-3" /> Clear
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="text-xs gap-1 h-7">
            <Upload className="w-3 h-3" /> Upload
          </Button>
          <Button size="sm" onClick={addProduct} className="text-xs gap-1 h-7">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
      </div>

      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center text-xs transition-colors cursor-pointer ${
          dragging ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'
        }`}
        onClick={() => fileRef.current?.click()}
      >
        {dragging ? 'Drop file here' : 'Drag & drop CSV / Excel file here, or click to browse'}
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {products.map((product, idx) => (
          <div key={product.id} className="card-gradient rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Product {idx + 1}</span>
              <button onClick={() => removeProduct(product.id)} className="text-destructive hover:text-destructive/80">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <Input
              placeholder="Product Name"
              value={product.name}
              onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
              className="h-8 text-xs"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">Price ({sym})</label>
                <Input type="number" value={product.price || ''} onChange={(e) => updateProduct(product.id, 'price', e.target.value)} className="h-8 text-xs" min={0} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Cost ({sym})</label>
                <Input type="number" value={product.costPerUnit || ''} onChange={(e) => updateProduct(product.id, 'costPerUnit', e.target.value)} className="h-8 text-xs" min={0} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Demand</label>
                <Input type="number" value={product.demand || ''} onChange={(e) => updateProduct(product.id, 'demand', e.target.value)} className="h-8 text-xs" min={0} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
