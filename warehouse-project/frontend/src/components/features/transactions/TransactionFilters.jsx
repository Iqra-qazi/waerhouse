import { RotateCcw } from "lucide-react";
import SearchInput from "../../ui/SearchInput";
import Select from "../../ui/Select";

const typeOptions = [
  { value: "stock-in", label: "Stock In" },
  { value: "stock-out", label: "Stock Out" },
];

export default function TransactionFilters({
  search,
  onSearchChange,
  warehouse,
  onWarehouseChange,
  warehouseOptions,
  type,
  onTypeChange,
  from,
  onFromChange,
  to,
  onToChange,
  onClear,
}) {
  return (
    <section className="mb-5 grid grid-cols-1 items-end gap-3 rounded-2xl border border-white/10 bg-surface p-4 sm:grid-cols-2 xl:grid-cols-6">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search product name or SKU"
        className="min-w-0 sm:col-span-2"
      />
      <Select
        id="transaction-warehouse-filter"
        aria-label="Filter by warehouse"
        value={warehouse}
        onChange={(event) => onWarehouseChange(event.target.value)}
        options={warehouseOptions}
        placeholder="All warehouses"
      />
      <Select
        id="transaction-type-filter"
        aria-label="Filter by transaction type"
        value={type}
        onChange={(event) => onTypeChange(event.target.value)}
        options={typeOptions}
        placeholder="All types"
      />
      <div>
        <label htmlFor="transaction-from-date" className="mb-1.5 block text-sm font-medium text-slate-300">From</label>
        <input
          id="transaction-from-date"
          type="date"
          value={from}
          onChange={(event) => onFromChange(event.target.value)}
          className="min-h-11 w-full rounded-xl border border-white/10 bg-elevated px-3 text-sm text-white outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30"
        />
      </div>
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor="transaction-to-date" className="mb-1.5 block text-sm font-medium text-slate-300">To</label>
          <input
            id="transaction-to-date"
            type="date"
            value={to}
            onChange={(event) => onToChange(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-white/10 bg-elevated px-3 text-sm text-white outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
        <button
          type="button"
          onClick={onClear}
          title="Clear filters"
          aria-label="Clear filters"
          className="mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
