import Skeleton from "../ui/Skeleton";

export default function StatCard({
  label,
  value,
  icon: Icon,
  loading = false,
  description,
  tone = "text-primary-300 bg-primary-500/10",
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">{label}</p>
          {loading ? (
            <Skeleton className="mt-3 h-8 w-20" />
          ) : (
            <p className="mt-2 break-words text-2xl font-semibold tracking-tight text-white">
              {value ?? "—"}
            </p>
          )}
          {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
        </div>
        {Icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
            <Icon size={18} aria-hidden="true" />
          </span>
        )}
      </div>
    </article>
  );
}
