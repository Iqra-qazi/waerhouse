import { BadgeCheck, CircleX, PackageCheck, Truck, WalletCards } from "lucide-react";

const cards = [
  { key: "total", label: "Total Orders", icon: WalletCards },
  { key: "pending", label: "Pending", icon: PackageCheck },
  { key: "confirmed", label: "Confirmed", icon: BadgeCheck },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: BadgeCheck },
  { key: "cancelled", label: "Cancelled", icon: CircleX },
];

export default function OrderStatsCards({ stats }) {
  return (
    <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6" aria-label="Order totals by status">
      {cards.map(({ key, label, icon: Icon }) => (
        <article key={key} className="rounded-2xl border border-white/10 bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-400 sm:text-sm">{label}</p>
            <Icon size={16} className="shrink-0 text-primary-300" aria-hidden="true" />
          </div>
          <p className="mt-2 text-xl font-semibold text-white">{Number(stats?.[key] ?? 0).toLocaleString()}</p>
        </article>
      ))}
    </section>
  );
}
