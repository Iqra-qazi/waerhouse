import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import StockFilters from "../components/features/stock/StockFilters";
import StockMovementModal from "../components/features/stock/StockMovementModal";
import StockStatsCards from "../components/features/stock/StockStatsCards";
import StockTable from "../components/features/stock/StockTable";
import usePermissions from "../hooks/usePermissions";
import useStock from "../hooks/useStock";

function getId(record) {
  return record?.id ?? record?._id ?? "";
}

export default function StockPage() {
  const state = useStock();
  const { canManageStock } = usePermissions();
  const [movement, setMovement] = useState(null);

  function openMovement(type, entry = null) {
    setMovement({
      type,
      product: getId(entry?.product),
      warehouse: getId(entry?.warehouse),
    });
  }

  function clearFilters() {
    state.setSearch("");
    state.setWarehouse("");
    state.setLowStockOnly(false);
  }

  return (
    <>
      <PageHeader title="Stock" description="Monitor inventory levels and record stock movements.">
        {canManageStock && (
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => openMovement("stock-in")}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:flex-none"
            >
              <ArrowDownToLine size={17} aria-hidden="true" />
              Stock In
            </button>
            <button
              type="button"
              onClick={() => openMovement("stock-out")}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-error px-4 text-sm font-semibold text-white transition hover:bg-error/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error sm:flex-none"
            >
              <ArrowUpFromLine size={17} aria-hidden="true" />
              Stock Out
            </button>
          </div>
        )}
      </PageHeader>

      {state.managerScopeWarning && (
        <div role="alert" className="mb-5 rounded-xl border border-primary-300/20 bg-primary-300/10 px-4 py-3 text-sm text-primary-100">
          The backend currently returns all warehouses and stock to managers. This page does not hide or filter records by assignment; backend warehouse scoping is required to restrict this view safely.
        </div>
      )}

      <StockStatsCards stats={state.stats} loading={state.loading} />
      <StockFilters
        search={state.search}
        onSearchChange={state.setSearch}
        warehouse={state.warehouse}
        onWarehouseChange={state.setWarehouse}
        warehouseOptions={state.warehouseOptions}
        lowStockOnly={state.lowStockOnly}
        onLowStockChange={state.setLowStockOnly}
        onClear={clearFilters}
      />
      <StockTable
        stock={state.stock}
        loading={state.loading}
        error={state.error}
        onRetry={state.retry}
        canManageStock={canManageStock}
        onMovement={openMovement}
        filteredCount={state.filteredCount}
        page={state.page}
        pageCount={state.pageCount}
        onPageChange={state.setPage}
      />
      <StockMovementModal
        open={Boolean(movement)}
        onClose={() => setMovement(null)}
        type={movement?.type}
        stock={state.allStock}
        productOptions={state.productOptions}
        warehouseOptions={state.warehouseOptions}
        initialProduct={movement?.product}
        initialWarehouse={movement?.warehouse}
        onSubmit={(payload) => state.moveStock(movement.type, payload)}
      />
    </>
  );
}
