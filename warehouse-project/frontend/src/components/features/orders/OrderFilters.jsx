import { RotateCcw } from "lucide-react";
import SearchInput from "../../ui/SearchInput";
import Select from "../../ui/Select";
import { ORDER_STATUSES } from "./OrderStatusSelect";

export default function OrderFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  from,
  onFromChange,
  to,
  onToChange,
  onClear,
}) {
  return (
    <section className="mb-5 grid grid-cols-1 items-end gap-3 rounded-2xl border border-white/10 bg-surface p-4 sm:grid-cols-2 xl:grid-cols-5">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search order number or customer"
        className="min-w-0 sm:col-span-2"
      />
      <Select
        aria-label="Filter by order status"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        options={ORDER_STATUSES}
        placeholder="All statuses"
      />
      <div>
        <label htmlFor="order-from-date" className="mb-1.5 block text-sm font-medium text-slate-300">From</label>
        <input id="order-from-date" type="date" value={from} onChange={(event) => onFromChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-elevated px-3 text-sm text-white outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30" />
      </div>
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor="order-to-date" className="mb-1.5 block text-sm font-medium text-slate-300">To</label>
          <input id="order-to-date" type="date" value={to} onChange={(event) => onToChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-elevated px-3 text-sm text-white outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30" />
        </div>
        <button type="button" onClick={onClear} title="Clear filters" aria-label="Clear order filters" className="mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/5 hover:text-white">
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
