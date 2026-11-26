import { Download } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import TransactionFilters from "../components/features/transactions/TransactionFilters";
import TransactionTable from "../components/features/transactions/TransactionTable";
import useStockTransactions from "../hooks/useStockTransactions";

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function getName(value) {
  if (value && typeof value === "object") return value.name ?? value.email ?? "";
  return value ?? "";
}

function exportCsv(transactions) {
  const rows = [
    ["Date and time", "Product", "SKU", "Warehouse", "Type", "Quantity", "Performed by", "Note"],
    ...transactions.map((entry) => {
      const type = String(entry?.type ?? entry?.transactionType ?? "").toUpperCase();
      const quantity = Math.abs(Number(entry?.quantity ?? 0));
      const signedQuantity = type === "IN" || type === "STOCK-IN"
        ? `+${quantity}`
        : type === "OUT" || type === "STOCK-OUT"
          ? `-${quantity}`
          : String(quantity);
      return [
        entry?.createdAt ?? entry?.date ?? "",
        entry?.product?.name ?? "",
        entry?.product?.sku ?? "",
        entry?.warehouse?.name ?? entry?.warehouse?.code ?? "",
        type,
        signedQuantity,
        getName(entry?.performedBy),
        entry?.reason ?? "",
      ];
    }),
  ];
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `stock-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function StockTransactionsPage() {
  const state = useStockTransactions();

  return (
    <>
      <PageHeader title="Stock Transactions" description="Review and export inventory movements.">
        <button
          type="button"
          onClick={() => exportCsv(state.filteredTransactions)}
          disabled={state.filteredTransactions.length === 0}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <Download size={17} aria-hidden="true" />
          Export CSV
        </button>
      </PageHeader>

      {state.managerScopeWarning && (
        <div role="alert" className="mb-5 rounded-xl border border-primary-300/20 bg-primary-300/10 px-4 py-3 text-sm text-primary-100">
          The backend does not restrict warehouse or transaction visibility to a manager’s assigned warehouses. This page filters only the transactions returned by the API; backend scoping is required for access control.
        </div>
      )}

      <TransactionFilters
        search={state.search}
        onSearchChange={state.setSearch}
        warehouse={state.warehouse}
        onWarehouseChange={state.setWarehouse}
        warehouseOptions={state.warehouseOptions}
        type={state.type}
        onTypeChange={state.setType}
        from={state.from}
        onFromChange={state.setFrom}
        to={state.to}
        onToChange={state.setTo}
        onClear={state.clearFilters}
      />
      <TransactionTable
        transactions={state.transactions}
        loading={state.loading}
        error={state.error}
        onRetry={state.retry}
        filteredCount={state.filteredCount}
        page={state.page}
        pageCount={state.pageCount}
        onPageChange={state.setPage}
      />
    </>
  );
}
