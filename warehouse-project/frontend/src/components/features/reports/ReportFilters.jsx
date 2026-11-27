import { RotateCcw } from "lucide-react";
import Select from "../../ui/Select";

const orderStatuses = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const transactionTypes = [
  { value: "IN", label: "Stock In" },
  { value: "OUT", label: "Stock Out" },
  { value: "ADJUSTMENT", label: "Adjustment" },
  { value: "ORDER", label: "Order" },
];

export default function ReportFilters({
  tab,
  warehouse,
  onWarehouseChange,
  warehouseOptions,
  status,
  onStatusChange,
  type,
  onTypeChange,
  from,
  onFromChange,
  to,
  onToChange,
  onClear,
}) {
  return (
    <section className="mb-5 grid grid-cols-1 items-end gap-3 rounded-2xl border border-white/10 bg-surface p-4 sm:grid-cols-2 xl:grid-cols-5">
      <Select aria-label="Filter report by warehouse" value={warehouse} onChange={(event) => onWarehouseChange(event.target.value)} options={warehouseOptions} placeholder="All warehouses" />
      {tab === "orders" && <Select aria-label="Filter report by order status" value={status} onChange={(event) => onStatusChange(event.target.value)} options={orderStatuses} placeholder="All statuses" />}
      {tab === "transactions" && <Select aria-label="Filter report by transaction type" value={type} onChange={(event) => onTypeChange(event.target.value)} options={transactionTypes} placeholder="All types" />}
      <div>
        <label htmlFor="report-from-date" className="mb-1.5 block text-sm font-medium text-slate-300">From</label>
        <input id="report-from-date" type="date" value={from} onChange={(event) => onFromChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-elevated px-3 text-sm text-white outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30" />
      </div>
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor="report-to-date" className="mb-1.5 block text-sm font-medium text-slate-300">To</label>
          <input id="report-to-date" type="date" value={to} onChange={(event) => onToChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-elevated px-3 text-sm text-white outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30" />
        </div>
        <button type="button" onClick={onClear} aria-label="Clear report filters" title="Clear filters" className="mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/5">
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
