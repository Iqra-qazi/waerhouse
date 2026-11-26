import { Building2, CircleOff, UsersRound } from "lucide-react";
import Skeleton from "../../ui/Skeleton";

const cards = [
  { key: "total", label: "Total Warehouses", icon: Building2, tone: "text-primary-300 bg-primary-500/10" },
  { key: "managed", label: "Managed Warehouses", icon: UsersRound, tone: "text-accent bg-accent/10" },
  { key: "unassigned", label: "Warehouses Without Manager", icon: CircleOff, tone: "text-primary-200 bg-primary-800/30" },
];

export default function WarehouseStatsCards({ stats, loading }) {
  return (
    <section className="mb-6 grid gap-3 sm:grid-cols-3" aria-label="Warehouse statistics">
      {cards.map(({ key, label, icon: Icon, tone }) => (
        <article key={key} className="rounded-2xl border border-white/10 bg-surface p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-slate-400">{label}</p>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
              <Icon size={17} aria-hidden="true" />
            </span>
          </div>
          {loading ? (
            <Skeleton className="mt-4 h-8 w-16" />
          ) : (
            <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
              {Number(stats?.[key] ?? 0).toLocaleString()}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
