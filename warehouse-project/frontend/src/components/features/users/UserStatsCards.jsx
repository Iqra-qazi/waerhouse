import { BriefcaseBusiness, ShieldCheck, Truck, Users, UserRound } from "lucide-react";
import { ROLE_LABELS, ROLES } from "../../../config/roles.js";

const cards = [
  { key: "total", label: "Total Users", icon: Users, tone: "text-primary-300 bg-primary-500/10" },
  { key: ROLES.ADMIN, label: ROLE_LABELS[ROLES.ADMIN], icon: ShieldCheck, tone: "text-primary-200 bg-primary-800/30" },
  { key: ROLES.MANAGER, label: ROLE_LABELS[ROLES.MANAGER], icon: BriefcaseBusiness, tone: "text-primary-300 bg-primary-600/10" },
  { key: ROLES.SUPPLIER, label: ROLE_LABELS[ROLES.SUPPLIER], icon: Truck, tone: "text-accent bg-accent/10" },
  { key: ROLES.SALES, label: ROLE_LABELS[ROLES.SALES], icon: UserRound, tone: "text-primary-400 bg-primary-500/10" },
];

export default function UserStatsCards({ stats }) {
  return (
    <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5" aria-label="User counts">
      {cards.map(({ key, label, icon: Icon, tone }) => (
        <article key={key} className="rounded-2xl border border-white/10 bg-surface p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-slate-400 sm:text-sm">{label}</p>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
              <Icon size={17} aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {Number(stats?.[key] ?? 0).toLocaleString()}
          </p>
        </article>
      ))}
    </section>
  );
}
