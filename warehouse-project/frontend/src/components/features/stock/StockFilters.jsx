import { RotateCcw } from "lucide-react";
import SearchInput from "../../ui/SearchInput";
import Select from "../../ui/Select";

export default function StockFilters({
  search,
  onSearchChange,
  warehouse,
  onWarehouseChange,
  warehouseOptions,
  lowStockOnly,
  onLowStockChange,
  onClear,
}) {
  return (
    <section className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-surface p-4">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search product name or SKU"
        className="min-w-[220px] flex-1"
      />
      <Select
        id="stock-warehouse-filter"
        aria-label="Filter by warehouse"
        value={warehouse}
        onChange={(event) => onWarehouseChange(event.target.value)}
        options={warehouseOptions}
        placeholder="All warehouses"
        className="w-full sm:w-56"
      />
      <label className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-elevated px-3.5 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={lowStockOnly}
          onChange={(event) => onLowStockChange(event.target.checked)}
          className="h-4 w-4 accent-primary-400"
        />
        Low stock only
      </label>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-3.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
      >
        <RotateCcw size={15} aria-hidden="true" />
        Clear
      </button>
    </section>
  );
}
