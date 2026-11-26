import { ArrowDownToLine, ArrowUpFromLine, Package } from "lucide-react";
import DataTable from "../../shared/DataTable";
import LowStockBadge from "./LowStockBadge";

function getId(record) {
  return record?.id ?? record?._id ?? "";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function ProductThumbnail({ product }) {
  return product?.imageUrl ? (
    <img
      src={product.imageUrl}
      alt={`${product?.name ?? "Product"} image`}
      loading="lazy"
      className="h-11 w-11 shrink-0 rounded-xl border border-white/10 bg-elevated object-cover"
    />
  ) : (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-elevated text-slate-500">
      <Package size={18} aria-hidden="true" />
    </span>
  );
}

export default function StockTable({
  stock,
  loading,
  error,
  onRetry,
  canManageStock,
  onMovement,
  filteredCount,
  page,
  pageCount,
  onPageChange,
}) {
  const columns = [
    {
      key: "product",
      header: "Product",
      render: (entry) => (
        <div className="flex min-w-48 items-center gap-3">
          <ProductThumbnail product={entry?.product} />
          <div>
            <p className="font-medium text-white">{entry?.product?.name ?? "Unnamed product"}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">{entry?.product?.sku ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "warehouse",
      header: "Warehouse",
      render: (entry) => entry?.warehouse?.name ?? entry?.warehouse?.code ?? "—",
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (entry) => (
        <span className="font-semibold tabular-nums text-white">
          {Number(entry?.quantity ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "threshold",
      header: "Low stock limit",
      render: (entry) => entry?.product?.lowStockThreshold ?? 10,
    },
    {
      key: "status",
      header: "Status",
      render: (entry) => (
        <LowStockBadge
          quantity={entry?.quantity}
          threshold={entry?.product?.lowStockThreshold}
        />
      ),
    },
    {
      key: "updatedAt",
      header: "Last updated",
      render: (entry) => formatDate(entry?.updatedAt),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={stock}
      getRowId={(entry) => getId(entry) || `${getId(entry?.product)}-${getId(entry?.warehouse)}`}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyTitle={filteredCount === 0 ? "No stock found" : "No stock on this page"}
      emptyDescription="Try changing the stock filters or add stock to a product."
      pagination={{
        page,
        pageCount,
        total: filteredCount,
        onPageChange,
      }}
      rowActions={canManageStock ? (entry) => (
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMovement("stock-in", entry)}
            aria-label={`Stock In ${entry?.product?.name ?? "product"}`}
            title="Stock In"
            className="rounded-lg p-2 text-accent transition hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <ArrowDownToLine size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onMovement("stock-out", entry)}
            aria-label={`Stock Out ${entry?.product?.name ?? "product"}`}
            title="Stock Out"
            className="rounded-lg p-2 text-error transition hover:bg-error/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-error"
          >
            <ArrowUpFromLine size={16} aria-hidden="true" />
          </button>
        </div>
      ) : undefined}
    />
  );
}
