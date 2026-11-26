import { Eye, Pencil, Package, Trash2 } from "lucide-react";
import Avatar from "../../ui/Avatar";
import Badge from "../../ui/Badge";
import DataTable from "../../shared/DataTable";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function getId(record) {
  return record?.id ?? record?._id ?? "";
}

function getSupplierId(supplier) {
  if (supplier && typeof supplier === "object") return getId(supplier);
  return supplier ?? "";
}

function resolveSupplier(product, suppliers) {
  const reference = product?.supplier;
  if (reference && typeof reference === "object") return reference;
  const id = getSupplierId(reference);
  return suppliers.find((entry) => String(getId(entry)) === String(id));
}

function ProductThumbnail({ product }) {
  const size = "h-12 w-12";
  return product?.imageUrl ? (
    <img
      src={product.imageUrl}
      alt={`${product?.name ?? "Product"} image`}
      loading="lazy"
      className={`${size} shrink-0 rounded-xl border border-white/10 bg-elevated object-cover`}
    />
  ) : (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-xl border border-white/10 bg-elevated text-slate-500`}>
      <Package size={20} aria-hidden="true" />
    </span>
  );
}

export { resolveSupplier, currency, getId };

export default function ProductTable({
  products = [],
  suppliers = [],
  loading,
  error,
  onRetry,
  canManageProducts,
  onView,
  onEdit,
  onDelete,
  onAdd,
  allCount,
  filteredCount,
  hasFilters,
  page,
  pageCount,
  onPageChange,
}) {
  const columns = [
    {
      key: "imageUrl",
      header: "Image",
      render: (product) => <ProductThumbnail product={product} />,
    },
    {
      key: "name",
      header: "Product",
      render: (product) => (
        <div className="min-w-36">
          <p className="font-medium text-white">{product?.name ?? "Unnamed product"}</p>
          <p className="mt-1 font-mono text-xs text-slate-500">{product?.sku ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (product) => product?.category
        ? <Badge variant="primary">{product.category}</Badge>
        : <span className="text-slate-500">—</span>,
    },
    {
      key: "price",
      header: "Price",
      render: (product) => currency.format(Number(product?.price ?? 0)),
    },
    {
      key: "cost",
      header: "Cost",
      render: (product) => product?.cost === undefined || product?.cost === null
        ? "—"
        : currency.format(Number(product.cost)),
    },
    { key: "unit", header: "Unit", render: (product) => product?.unit || "piece" },
    { key: "lowStockThreshold", header: "Low stock limit", render: (product) => product?.lowStockThreshold ?? 10 },
    {
      key: "supplier",
      header: "Supplier",
      render: (product) => {
        const supplier = resolveSupplier(product, suppliers);
        if (!product?.supplier) return <Badge variant="warning">Not assigned</Badge>;
        return (
          <div className="flex min-w-36 items-center gap-2.5">
            <Avatar name={supplier?.name ?? supplier?.email ?? "Supplier"} src={supplier?.image ?? supplier?.imageUrl} size="sm" />
            <span className="max-w-36 truncate text-slate-200">
              {supplier?.name ?? supplier?.email ?? getSupplierId(product.supplier)}
            </span>
          </div>
        );
      },
    },
  ];

  const isEmptyStart = allCount === 0 && !hasFilters;
  return (
    <DataTable
      columns={columns}
      rows={products}
      getRowId={getId}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyTitle={isEmptyStart ? "No products yet" : "No products found"}
      emptyDescription={
        isEmptyStart
          ? "Add your first product to start building the catalog."
          : "Try a different name, SKU, category, or supplier."
      }
      emptyAction={
        isEmptyStart && canManageProducts ? (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-xl bg-gradient-to-r from-primary-600 to-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:from-primary-700 hover:to-accent"
          >
            Add Product
          </button>
        ) : undefined
      }
      pagination={{
        page,
        pageCount,
        total: filteredCount,
        onPageChange,
      }}
      rowActions={(product) => (
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => onView(product)}
            aria-label={`View ${product?.name ?? "product"}`}
            title="View details"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
          >
            <Eye size={16} aria-hidden="true" />
          </button>
          {canManageProducts && (
            <>
              <button
                type="button"
                onClick={() => onEdit(product)}
                aria-label={`Edit ${product?.name ?? "product"}`}
                title="Edit product"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-primary-500/10 hover:text-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
              >
                <Pencil size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(product)}
                aria-label={`Delete ${product?.name ?? "product"}`}
                title="Delete product"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-error/10 hover:text-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-error"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      )}
    />
  );
}
