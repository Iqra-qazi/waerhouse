import { useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import ProductCard from "../components/features/products/ProductCard";
import ProductDetailsModal from "../components/features/products/ProductDetailsModal";
import ProductFilters from "../components/features/products/ProductFilters";
import ProductFormModal from "../components/features/products/ProductFormModal";
import ProductStatsCards from "../components/features/products/ProductStatsCards";
import ProductTable from "../components/features/products/ProductTable";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Pagination from "../components/ui/Pagination";
import Skeleton from "../components/ui/Skeleton";
import useProducts from "../hooks/useProducts";

function getId(record) {
  return record?.id ?? record?._id ?? "";
}

export default function ProductsPage() {
  const state = useProducts();
  const [view, setView] = useState("table");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const hasFilters = Boolean(state.search || state.category || state.supplier);

  function openCreate() {
    setSelectedProduct(null);
    setFormOpen(true);
  }

  function openEdit(product) {
    setSelectedProduct(product);
    setFormOpen(true);
  }

  function openDetails(product) {
    setDetailsTarget(product);
    state.loadProductDetails(product);
  }

  async function saveProduct(payload, product) {
    if (product) {
      await state.updateProduct(getId(product), payload);
    } else {
      await state.createProduct(payload);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const deleted = await state.deleteProduct(deleteTarget);
      if (deleted) setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader title="Products" description="Browse and manage the product catalog.">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-white/10 bg-surface p-1" aria-label="Product view">
            <button
              type="button"
              onClick={() => setView("table")}
              aria-pressed={view === "table"}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${view === "table" ? "bg-primary-500/15 text-primary-200" : "text-slate-400 hover:text-white"}`}
            >
              <List size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${view === "grid" ? "bg-primary-500/15 text-primary-200" : "text-slate-400 hover:text-white"}`}
            >
              <LayoutGrid size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
          {state.canManageProducts && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:from-primary-700 hover:to-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
            >
              <Plus size={17} aria-hidden="true" />
              Add Product
            </button>
          )}
        </div>
      </PageHeader>

      <ProductStatsCards stats={state.stats} loading={state.loading} />

      <ProductFilters
        search={state.search}
        setSearch={state.setSearch}
        category={state.category}
        setCategory={state.setCategory}
        categories={state.categories}
        supplier={state.supplier}
        setSupplier={state.setSupplier}
        suppliers={state.supplierOptions}
      />

      {view === "table" ? (
        <ProductTable
          products={state.products}
          suppliers={state.suppliers}
          loading={state.loading}
          error={state.error}
          onRetry={state.retry}
          canManageProducts={state.canManageProducts}
          onView={openDetails}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onAdd={openCreate}
          allCount={state.allProducts.length}
          filteredCount={state.filteredCount}
          hasFilters={hasFilters}
          page={state.page}
          pageCount={state.pageCount}
          onPageChange={state.setPage}
        />
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={state.retry} />
      ) : state.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`product-card-skeleton-${index}`} className="rounded-2xl border border-white/10 bg-surface p-4">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="mt-4 h-5 w-2/3" />
              <Skeleton className="mt-3 h-4 w-1/3" />
              <Skeleton className="mt-5 h-8 w-full" />
            </div>
          ))}
        </div>
      ) : state.products.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {state.products.map((product) => (
              <ProductCard
                key={getId(product)}
                product={product}
                suppliers={state.suppliers}
                canManageProducts={state.canManageProducts}
                onView={openDetails}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
          <Pagination
            page={state.page}
            pageCount={state.pageCount}
            total={state.filteredCount}
            onPageChange={state.setPage}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-surface">
          <EmptyState
            title={state.allProducts.length === 0 && !hasFilters ? "No products yet" : "No products found"}
            description={
              state.allProducts.length === 0 && !hasFilters
                ? "Add your first product to start building the catalog."
                : "Try a different name, SKU, category, or supplier."
            }
            action={state.allProducts.length === 0 && !hasFilters && state.canManageProducts ? (
              <button
                type="button"
                onClick={openCreate}
                className="rounded-xl bg-gradient-to-r from-primary-600 to-accent px-4 py-2.5 text-sm font-semibold text-white"
              >
                Add Product
              </button>
            ) : undefined}
          />
        </div>
      )}

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={selectedProduct}
        onSave={saveProduct}
        suppliers={state.suppliers}
        suppliersLoading={state.suppliersLoading}
        suppliersError={state.suppliersError}
        onRetrySuppliers={state.retrySuppliers}
      />

      <ProductDetailsModal
        open={Boolean(detailsTarget)}
        onClose={() => setDetailsTarget(null)}
        product={state.details ?? detailsTarget}
        loading={state.detailsLoading}
        error={state.detailsError}
        stock={state.stock}
        stockError={state.stockError}
        warehouseLookupError={state.warehouseLookupError}
        warehouses={state.warehouses}
        suppliers={state.suppliers}
        canViewProductStock={state.canViewProductStock}
        onRetry={() => detailsTarget && state.loadProductDetails(detailsTarget)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product?"
        description={`This will deactivate ${deleteTarget?.name ?? "this product"}. If stock or orders prevent deletion, the backend response will be shown.`}
        confirmLabel="Delete product"
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}
