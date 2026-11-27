import { useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../../layout/PageHeader";
import ConfirmDialog from "../../ui/ConfirmDialog";
import SupplyFilters from "./SupplyFilters";
import SupplyRequestDetailsModal from "./SupplyRequestDetailsModal";
import SupplyRequestForm from "./SupplyRequestForm";
import SupplyRequestTable from "./SupplyRequestTable";

const statCards = [
  ["total", "All requests"],
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
];

export default function SupplyRequestPanel({
  state,
  catalog,
  mine,
  canCreate,
  canReview,
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const warehouseOptions = catalog.warehouses.map((warehouse) => ({
    value: String(warehouse?.id ?? warehouse?._id ?? ""),
    label: warehouse?.name ?? warehouse?.code ?? "",
  })).filter((option) => option.value);

  async function confirmReview() {
    if (!reviewTarget) return;
    setReviewing(true);
    try {
      if (await state.reviewRequest(reviewTarget.request, reviewTarget.status)) setReviewTarget(null);
    } finally {
      setReviewing(false);
    }
  }

  async function create(payload) {
    await state.createRequest(payload);
    setFormOpen(false);
  }

  function openRequestForm() {
    setFormOpen(true);
    void catalog.retry();
  }

  return (
    <>
      <PageHeader title="Supply Requests" description={mine ? "Request replenishment for your products." : "Review incoming supplier requests."}>
        {canCreate && (
          <button type="button" onClick={openRequestForm} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent px-4 text-sm font-semibold text-white hover:brightness-110 sm:w-auto">
            <Plus size={17} aria-hidden="true" /> New Request
          </button>
        )}
      </PageHeader>

      {state.managerScopeWarning && (
        <div role="alert" className="mb-5 rounded-xl border border-primary-300/20 bg-primary-300/10 px-4 py-3 text-sm text-primary-100">
          The supply API currently returns requests from every warehouse to managers. This page does not hide requests by warehouse; backend assignment scoping is required.
        </div>
      )}

      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Supply request totals">
        {statCards.map(([key, label]) => (
          <article key={key} className="rounded-2xl border border-white/10 bg-surface p-4">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{Number(state.stats[key] ?? 0).toLocaleString()}</p>
          </article>
        ))}
      </section>

      <SupplyFilters
        search={state.search}
        onSearchChange={state.setSearch}
        warehouse={state.warehouse}
        onWarehouseChange={state.setWarehouse}
        warehouseOptions={warehouseOptions}
        status={state.status}
        onStatusChange={state.setStatus}
        from={state.from}
        onFromChange={state.setFrom}
        to={state.to}
        onToChange={state.setTo}
        onClear={state.clearFilters}
      />
      <SupplyRequestTable
        requests={state.requests}
        loading={state.loading}
        error={state.error}
        onRetry={state.retry}
        canReview={canReview}
        onReview={(request, status) => setReviewTarget({ request, status })}
        onView={setDetails}
        filteredCount={state.filteredCount}
        page={state.page}
        pageCount={state.pageCount}
        onPageChange={state.setPage}
      />

      <SupplyRequestForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        products={catalog.products}
        warehouses={catalog.warehouses}
        loading={catalog.loading}
        error={catalog.error}
        onRetry={catalog.retry}
        onSubmit={create}
      />
      <SupplyRequestDetailsModal
        open={Boolean(details)}
        onClose={() => setDetails(null)}
        request={details}
      />
      <ConfirmDialog
        open={Boolean(reviewTarget)}
        title={`${reviewTarget?.status === "approved" ? "Approve" : "Reject"} supply request?`}
        description={`This will ${reviewTarget?.status === "approved" ? "approve" : "reject"} the request for ${reviewTarget?.request?.product?.name ?? "this product"}.`}
        confirmLabel={reviewTarget?.status === "approved" ? "Approve" : "Reject"}
        busy={reviewing}
        onCancel={() => {
          if (!reviewing) setReviewTarget(null);
        }}
        onConfirm={confirmReview}
      />
    </>
  );
}
