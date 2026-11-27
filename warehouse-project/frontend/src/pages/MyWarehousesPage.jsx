import PageHeader from "../components/layout/PageHeader";
import ErrorState from "../components/ui/ErrorState";
import MyWarehouseCards from "../components/features/warehouses/MyWarehouseCards";
import useMyWarehouses from "../hooks/useMyWarehouses";

export default function MyWarehousesPage() {
  const state = useMyWarehouses();
  return (
    <>
      <PageHeader title="My Warehouses" description="Warehouse inventory overview." />
      <div role="alert" className="mb-5 rounded-xl border border-primary-300/20 bg-primary-300/10 px-4 py-3 text-sm text-primary-100">
        The warehouse, stock, and product APIs currently return unscoped lists to managers. This page does not filter records client-side; backend assignment scoping is required to show assigned warehouses only.
      </div>
      {state.error ? (
        <ErrorState message={state.error} onRetry={state.retry} />
      ) : (
        <MyWarehouseCards warehouses={state.warehouses} loading={state.loading} />
      )}
    </>
  );
}
