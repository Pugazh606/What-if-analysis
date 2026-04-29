import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Currency, formatCurrency } from "@/lib/currency";
import { MultiProductResult } from "@/components/MultiProductPanel";

interface ReportData {
  businessName: string;
  mode: 'startup' | 'established';
  timePeriod: string;
  currency: Currency;
  revenue: number;
  totalCost: number;
  profit: number;
  breakEvenUnits: number;
  growthPercent?: number;
  survivalIndicator: string;
  score: number;
  scoreLabel: string;
  healthLabel: string;
  multiProductResult?: MultiProductResult | null;
  timeMult: number;
  discount: number;
  segment: string;
}

export function generatePdfReport(data: ReportData) {
  const doc = new jsPDF();
  const fmt = (n: number) => formatCurrency(n, data.currency);
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  const checkPage = (y: number, need = 40) => {
    if (y > ph - need) { doc.addPage(); return 20; }
    return y;
  };

  // ─── Title ───
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  const title = data.businessName
    ? `${data.businessName} – Business Analysis Report`
    : "Business Analysis Report";
  doc.text(title, pw / 2, 22, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("What-If Business Simulator", pw / 2, 29, { align: "center" });
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Mode: ${data.mode === 'startup' ? 'Startup' : 'Established'} | Period: ${data.timePeriod}`, pw / 2, 35, { align: "center" });
  doc.setTextColor(0);
  doc.setDrawColor(200);
  doc.line(14, 39, pw - 14, 39);

  // ─── Executive Summary ───
  let y = 47;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 14, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);

  const margin = data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : '0';
  const execLines: string[] = [];
  if (data.profit >= 0) {
    execLines.push(`The business is currently profitable, generating ${fmt(data.profit)} in profit with a margin of ${margin}%. Total revenue stands at ${fmt(data.revenue)} against costs of ${fmt(data.totalCost)}.`);
  } else {
    execLines.push(`The business is operating at a net loss of ${fmt(Math.abs(data.profit))}. Revenue of ${fmt(data.revenue)} is insufficient to cover total costs of ${fmt(data.totalCost)}. Immediate action is recommended.`);
  }
  execLines.push(`Business Health: ${data.healthLabel} | Simulation Score: ${data.score}/100 (${data.scoreLabel})`);

  for (const line of execLines) {
    const split = doc.splitTextToSize(line, pw - 28);
    doc.text(split, 14, y);
    y += split.length * 4.5 + 2;
  }
  doc.setTextColor(0);

  // ─── Health & Score Table ───
  y = checkPage(y + 4);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Business Health & Score", 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Business Health", data.healthLabel],
      ["Simulation Score", `${data.score}/100 – ${data.scoreLabel}`],
      ["Survival Indicator", data.survivalIndicator],
      ["Customer Segment", data.segment === 'premium' ? 'Premium Customers' : 'Budget Customers'],
      ["Active Discount", data.discount > 0 ? `${data.discount}%` : 'None'],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ─── KPIs ───
  y = checkPage(y);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Key Performance Indicators", 14, y);
  y += 6;

  const kpiRows: string[][] = [
    ["Revenue", fmt(data.revenue)],
    ["Total Cost", fmt(data.totalCost)],
    ["Profit / Loss", fmt(data.profit)],
    ["Profit Margin", `${margin}%`],
    ["Break-even Units", isFinite(data.breakEvenUnits) ? data.breakEvenUnits.toLocaleString() : "∞"],
  ];
  if (data.growthPercent !== undefined) {
    kpiRows.push(["Growth", `${data.growthPercent.toFixed(1)}%`]);
  }

  autoTable(doc, {
    startY: y,
    head: [["KPI", "Value"]],
    body: kpiRows,
    theme: "grid",
    headStyles: { fillColor: [39, 174, 96], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ─── Multi-product breakdown ───
  if (data.multiProductResult && data.multiProductResult.products.length > 0) {
    y = checkPage(y);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Product-Level Breakdown", 14, y);
    y += 6;

    const prodRows = data.multiProductResult.products.map((p) => [
      p.name,
      fmt(p.revenue * data.timeMult),
      fmt(p.cost * data.timeMult),
      fmt(p.profit * data.timeMult),
      p.revenue > 0 ? `${((p.profit / p.revenue) * 100).toFixed(1)}%` : '0%',
    ]);
    prodRows.push([
      "TOTAL",
      fmt(data.multiProductResult.totalRevenue * data.timeMult),
      fmt(data.multiProductResult.totalCost * data.timeMult),
      fmt(data.multiProductResult.totalProfit * data.timeMult),
      data.multiProductResult.totalRevenue > 0
        ? `${((data.multiProductResult.totalProfit / data.multiProductResult.totalRevenue) * 100).toFixed(1)}%`
        : '0%',
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Product", "Revenue", "Cost", "Profit", "Margin"]],
      body: prodRows,
      theme: "grid",
      headStyles: { fillColor: [142, 68, 173], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ─── Insights & Recommendations ───
  y = checkPage(y);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Insights & Recommendations", 14, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);

  const insights: string[] = [];
  if (data.profit >= 0) {
    insights.push("• The business demonstrates positive returns. Continue optimizing cost structure to widen margins.");
  } else {
    insights.push("• The business is loss-making. Priority actions: reduce variable costs, renegotiate supplier terms, or increase pricing strategically.");
  }

  if (data.discount > 0) {
    insights.push(`• A ${data.discount}% discount is active. While this may boost volume, it compresses margins. Test removing or reducing the discount to measure true demand elasticity.`);
  }

  if (isFinite(data.breakEvenUnits)) {
    insights.push(`• Break-even is achievable at ${data.breakEvenUnits.toLocaleString()} units. Focus marketing spend on driving volume past this threshold.`);
  }

  if (data.segment === 'budget') {
    insights.push("• Budget customer segment is price-sensitive. Consider volume-based promotions or bundling strategies.");
  } else {
    insights.push("• Premium customer segment tolerates higher prices. Invest in brand positioning and quality differentiation.");
  }

  if (data.multiProductResult && data.multiProductResult.products.length > 1) {
    const sorted = [...data.multiProductResult.products].sort((a, b) => b.profit - a.profit);
    insights.push(`• Top product: "${sorted[0].name}" — consider allocating more resources here.`);
    const losers = sorted.filter(p => p.profit < 0);
    if (losers.length > 0) {
      insights.push(`• ${losers.length} product(s) are unprofitable (${losers.map(p => p.name).join(', ')}). Evaluate discontinuation or repricing.`);
    }
  }

  for (const line of insights) {
    y = checkPage(y);
    const split = doc.splitTextToSize(line, pw - 28);
    doc.text(split, 14, y);
    y += split.length * 4.5 + 2;
  }
  doc.setTextColor(0);

  // ─── Conclusion ───
  y = checkPage(y + 4);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Conclusion", 14, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);

  const conclusion = data.profit >= 0
    ? `Overall, ${data.businessName || 'the business'} shows a ${data.healthLabel.toLowerCase()} financial position with a simulation score of ${data.score}/100. The current strategy is sustainable. Recommended next steps: explore scaling opportunities, optimize underperforming products, and conduct seasonal demand analysis.`
    : `${data.businessName || 'The business'} requires immediate strategic intervention. With a simulation score of ${data.score}/100 and ${data.healthLabel.toLowerCase()} status, the focus should be on cost reduction, pricing optimization, and potentially pivoting the product mix. Detailed scenario analysis is recommended before major investments.`;

  const cLines = doc.splitTextToSize(conclusion, pw - 28);
  doc.text(cLines, 14, y);
  doc.setTextColor(0);

  // ─── Footer ───
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, pw / 2, ph - 10, { align: "center" });
    doc.text("What-If Business Simulator", 14, ph - 10);
    if (data.businessName) {
      doc.text(data.businessName, pw - 14, ph - 10, { align: "right" });
    }
  }

  const filename = data.businessName
    ? `${data.businessName.replace(/\s+/g, '_')}_report.pdf`
    : "simulation_report.pdf";
  doc.save(filename);
}
