import { useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import WarehouseDetailsDrawer from "../components/features/warehouses/WarehouseDetailsDrawer";
import WarehouseFormModal from "../components/features/warehouses/WarehouseFormModal";
import WarehouseStatsCards from "../components/features/warehouses/WarehouseStatsCards";
import WarehouseTable from "../components/features/warehouses/WarehouseTable";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import SearchInput from "../components/ui/SearchInput";
import useWarehouses from "../hooks/useWarehouses";

function getId(record) {
  return record?.id ?? record?._id;
}

export default function WarehousesPage() {
  const state = useWarehouses();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setSelectedWarehouse(null);
    setFormOpen(true);
  }

  function openEdit(warehouse) {
    setSelectedWarehouse(warehouse);
    setFormOpen(true);
  }

  function openDetails(warehouse) {
    setDetailsTarget(warehouse);
    state.loadDetails(warehouse);
  }

  async function saveWarehouse(payload, warehouse) {
    if (warehouse) {
      await state.updateWarehouse(getId(warehouse), payload);
    } else {
      await state.createWarehouse(payload);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const deleted = await state.deleteWarehouse(deleteTarget);
      if (deleted) setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader title="Warehouses" description="Manage warehouse locations and managers.">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:from-primary-700 hover:to-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
        >
          <Plus size={17} aria-hidden="true" />
          Add Warehouse
        </button>
      </PageHeader>

      <WarehouseStatsCards stats={state.stats} loading={state.loading} />

      <section className="mb-5 rounded-2xl border border-white/10 bg-surface p-4">
        <SearchInput
          value={state.search}
          onChange={state.setSearch}
          placeholder="Search warehouse name or address"
          className="max-w-xl"
        />
      </section>

      <WarehouseTable
        warehouses={state.warehouses}
        managers={state.managers}
        loading={state.loading}
        error={state.error}
        onRetry={state.retry}
        onView={openDetails}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onAdd={openCreate}
        search={state.search}
        allCount={state.allWarehouses.length}
        page={state.page}
        pageCount={state.pageCount}
        filteredCount={state.filteredCount}
        onPageChange={state.setPage}
      />

      <WarehouseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        warehouse={selectedWarehouse}
        managers={state.managers}
        managersLoading={state.managersLoading}
        managersError={state.managersError}
        onRetryManagers={state.retryManagers}
        onSave={saveWarehouse}
      />

      <WarehouseDetailsDrawer
        open={Boolean(detailsTarget)}
        onClose={() => setDetailsTarget(null)}
        warehouse={state.details ?? detailsTarget}
        loading={state.detailsLoading}
        error={state.detailsError}
        stock={state.stock}
        stockError={state.stockError}
        managers={state.managers}
        onRetry={() => detailsTarget && state.loadDetails(detailsTarget)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete warehouse?"
        description={`This will deactivate ${deleteTarget?.name ?? "this warehouse"}. If stock prevents deletion, the backend response will be shown.`}
        confirmLabel="Delete warehouse"
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}
