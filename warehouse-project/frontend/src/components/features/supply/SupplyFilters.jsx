import { RotateCcw } from "lucide-react";
import SearchInput from "../../ui/SearchInput";
import Select from "../../ui/Select";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function SupplyFilters({
  search,
  onSearchChange,
  warehouse,
  onWarehouseChange,
  warehouseOptions,
  status,
  onStatusChange,
  from,
  onFromChange,
  to,
  onToChange,
  onClear,
}) {
  return (
    <section className="mb-5 grid grid-cols-1 items-end gap-3 rounded-2xl border border-white/10 bg-surface p-4 sm:grid-cols-2 xl:grid-cols-6">
      <SearchInput value={search} onChange={onSearchChange} placeholder="Search product or supplier" className="min-w-0 sm:col-span-2" />
      <Select aria-label="Filter by warehouse" value={warehouse} onChange={(event) => onWarehouseChange(event.target.value)} options={warehouseOptions} placeholder="All warehouses" />
      <Select aria-label="Filter by request status" value={status} onChange={(event) => onStatusChange(event.target.value)} options={statusOptions} placeholder="All statuses" />
      <div>
        <label htmlFor="supply-from-date" className="mb-1.5 block text-sm font-medium text-slate-300">From</label>
        <input id="supply-from-date" type="date" value={from} onChange={(event) => onFromChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-elevated px-3 text-sm text-white outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30" />
      </div>
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor="supply-to-date" className="mb-1.5 block text-sm font-medium text-slate-300">To</label>
          <input id="supply-to-date" type="date" value={to} onChange={(event) => onToChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-elevated px-3 text-sm text-white outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30" />
        </div>
        <button type="button" onClick={onClear} aria-label="Clear supply filters" className="mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/5">
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
