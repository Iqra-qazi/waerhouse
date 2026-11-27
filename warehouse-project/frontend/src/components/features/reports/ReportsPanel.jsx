import { useState } from "react";
import { Download } from "lucide-react";
import PageHeader from "../../layout/PageHeader";
import StatCard from "../../shared/StatCard";
import ReportFilters from "./ReportFilters";
import ReportTable from "./ReportTable";
import ErrorState from "../../ui/ErrorState";

const tabs = [
  { value: "stock", label: "Stock Report" },
  { value: "orders", label: "Orders Report" },
  { value: "transactions", label: "Transactions Report" },
];

function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function csvRows(tab, entries) {
  if (tab === "stock") {
    return [
      ["Product", "SKU", "Warehouse", "Quantity", "Low stock limit", "Last updated"],
      ...entries.map((entry) => [entry?.product?.name, entry?.product?.sku, entry?.warehouse?.name ?? entry?.warehouse?.code, entry?.quantity, entry?.product?.lowStockThreshold, entry?.updatedAt]),
    ];
  }
  if (tab === "orders") {
    return [
      ["Order number", "Customer", "Warehouse", "Date", "Total amount", "Status"],
      ...entries.map((entry) => [entry?.orderNumber, entry?.customer?.name ?? entry?.customer?.email, entry?.warehouse?.name ?? entry?.warehouse?.code, entry?.createdAt, entry?.totalAmount, entry?.status]),
    ];
  }
  return [
    ["Date", "Product", "Warehouse", "Type", "Quantity", "Performed by", "Note"],
    ...entries.map((entry) => [entry?.createdAt, entry?.product?.name, entry?.warehouse?.name ?? entry?.warehouse?.code, entry?.type, entry?.quantity, entry?.performedBy?.name ?? entry?.performedBy?.email, entry?.reason]),
  ];
}

function downloadCsv(tab, entries) {
  const content = csvRows(tab, entries).map((row) => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${tab}-report-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function summaryCards(state) {
  if (state.tab === "stock") {
    return [
      { label: "Stock records", value: Number(state.summary.records).toLocaleString() },
      { label: "Units on hand", value: Number(state.summary.quantity).toLocaleString() },
    ];
  }
  if (state.tab === "orders") {
    return [
      { label: "Orders", value: Number(state.summary.records).toLocaleString() },
      { label: "Order value", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(state.summary.amount) },
    ];
  }
  return [
    { label: "Transactions", value: Number(state.summary.records).toLocaleString() },
    { label: "Stock in units", value: Number(state.summary.stockIn).toLocaleString() },
    { label: "Stock out units", value: Number(state.summary.stockOut).toLocaleString() },
  ];
}

export default function ReportsPanel({ state, managerScopeWarning }) {
  const [activeTab, setActiveTab] = useState(state.tab);
  const cards = summaryCards(state);
  return (
    <>
      <PageHeader title="Reports" description="Review and export inventory, order, and transaction data." />
      {managerScopeWarning && (
        <div role="alert" className="mb-5 rounded-xl border border-primary-300/20 bg-primary-300/10 px-4 py-3 text-sm text-primary-100">
          Manager report endpoints return unscoped records. Filters here are interactive report filters only and do not provide access control; backend warehouse scoping is required.
        </div>
      )}
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Report type">
        {tabs.map((tab) => (
          <button key={tab.value} type="button" role="tab" aria-selected={state.tab === tab.value} onClick={() => { state.setTab(tab.value); setActiveTab(tab.value); }} className={`min-h-10 rounded-xl px-4 text-sm font-medium transition ${state.tab === tab.value ? "bg-primary-500/20 text-primary-100" : "border border-white/10 text-slate-300 hover:bg-white/5"}`}>
            {tab.label}
          </button>
        ))}
      </div>
      {state.error ? (
        <ErrorState message={state.error} onRetry={state.retry} />
      ) : (
        <>
          <ReportFilters
            tab={activeTab}
            warehouse={state.warehouse}
            onWarehouseChange={state.setWarehouse}
            warehouseOptions={state.warehouseOptions}
            status={state.status}
            onStatusChange={state.setStatus}
            type={state.type}
            onTypeChange={state.setType}
            from={state.from}
            onFromChange={state.setFrom}
            to={state.to}
            onToChange={state.setTo}
            onClear={state.clearFilters}
          />
          <section className={`mb-5 grid gap-3 ${cards.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`} aria-label="Report summary">
            {cards.map((card) => <StatCard key={card.label} label={card.label} value={card.value} loading={state.loading} />)}
          </section>
          <div className="mb-3 flex justify-end">
            <button type="button" onClick={() => downloadCsv(state.tab, state.filteredRows)} disabled={state.loading || !state.filteredRows.length} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-50">
              <Download size={16} aria-hidden="true" /> Export CSV
            </button>
          </div>
          <ReportTable
            tab={state.tab}
            rows={state.rows}
            loading={state.loading}
            filteredCount={state.filteredCount}
            page={state.page}
            pageCount={state.pageCount}
            onPageChange={state.setPage}
          />
        </>
      )}
    </>
  );
}
