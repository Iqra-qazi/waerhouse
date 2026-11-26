import { Boxes, Package, TriangleAlert, CircleOff } from "lucide-react";

const cards = [
  { key: "totalQuantity", label: "Total Items in Stock", icon: Boxes, tone: "text-primary-300 bg-primary-500/10" },
  { key: "differentProducts", label: "Different Products", icon: Package, tone: "text-accent bg-accent/10" },
  { key: "lowStockProducts", label: "Low Stock Products", icon: TriangleAlert, tone: "text-primary-200 bg-primary-300/10" },
  { key: "outOfStockProducts", label: "Out of Stock Products", icon: CircleOff, tone: "text-error bg-error/10" },
];

export default function StockStatsCards({ stats, loading }) {
  return (
    <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Stock summary">
      {cards.map(({ key, label, icon: Icon, tone }) => (
        <article key={key} className="rounded-2xl border border-white/10 bg-surface p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {loading ? "—" : Number(stats?.[key] ?? 0).toLocaleString()}
              </p>
            </div>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
              <Icon size={19} aria-hidden="true" />
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}
