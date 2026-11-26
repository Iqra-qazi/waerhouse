import { SearchX } from "lucide-react";

export default function EmptyState({
  title = "Nothing here yet",
  description,
  icon: Icon = SearchX,
  action,
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-400">
        <Icon size={22} aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
