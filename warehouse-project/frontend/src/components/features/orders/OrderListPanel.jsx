import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import PageHeader from "../../layout/PageHeader";
import ConfirmDialog from "../../ui/ConfirmDialog";
import OrderDetailsModal from "./OrderDetailsModal";
import OrderFilters from "./OrderFilters";
import OrderStatsCards from "./OrderStatsCards";
import OrderTable from "./OrderTable";

export default function OrderListPanel({ state, mine = false, canManageOrders = false }) {
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      if (await state.cancelOwnOrder(cancelTarget)) setCancelTarget(null);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <PageHeader title={mine ? "My Orders" : "Orders"} description={mine ? "Track your recent orders." : "Review customer orders and their fulfillment status."}>
        {mine && (
          <Link to="/orders/create" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent px-4 text-sm font-semibold text-white transition hover:brightness-110 sm:w-auto">
            <Plus size={17} aria-hidden="true" /> Create Order
          </Link>
        )}
      </PageHeader>

      {state.managerScopeWarning && (
        <div role="alert" className="mb-5 rounded-xl border border-primary-300/20 bg-primary-300/10 px-4 py-3 text-sm text-primary-100">
          The orders API currently returns all orders to managers without filtering by assigned warehouse. This view does not hide records client-side; backend warehouse scoping is required.
        </div>
      )}

      {!mine && <OrderStatsCards stats={state.stats} />}
      <OrderFilters
        search={state.search}
        onSearchChange={state.setSearch}
        status={state.status}
        onStatusChange={state.setStatus}
        from={state.from}
        onFromChange={state.setFrom}
        to={state.to}
        onToChange={state.setTo}
        onClear={state.clearFilters}
      />
      <OrderTable
        orders={state.orders}
        loading={state.loading}
        error={state.error}
        onRetry={state.retry}
        onView={(order) => {
          setDetailsTarget(order);
          state.loadDetails(order);
        }}
        canChangeStatus={canManageOrders}
        onChangeStatus={state.updateStatus}
        canCancel={mine}
        onCancel={setCancelTarget}
        filteredCount={state.filteredCount}
        page={state.page}
        pageCount={state.pageCount}
        onPageChange={state.setPage}
      />

      <OrderDetailsModal
        open={Boolean(detailsTarget)}
        onClose={() => setDetailsTarget(null)}
        order={state.details ?? detailsTarget}
        loading={state.detailsLoading}
        error={state.detailsError}
        onRetry={() => detailsTarget && state.loadDetails(detailsTarget)}
      />
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel this order?"
        description={`Cancel order ${cancelTarget?.orderNumber ?? ""}? Only pending orders can be cancelled.`}
        confirmLabel="Cancel order"
        busy={cancelling}
        onCancel={() => {
          if (!cancelling) setCancelTarget(null);
        }}
        onConfirm={confirmCancel}
      />
    </>
  );
}
