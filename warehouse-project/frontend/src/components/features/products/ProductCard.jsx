import { Eye, Pencil, Package, Trash2 } from "lucide-react";
import Avatar from "../../ui/Avatar";
import Badge from "../../ui/Badge";
import { currency, resolveSupplier } from "./ProductTable";

export default function ProductCard({
  product,
  suppliers = [],
  canManageProducts,
  onView,
  onEdit,
  onDelete,
}) {
  const supplier = resolveSupplier(product, suppliers);
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-surface transition hover:border-primary-400/30 hover:shadow-lg hover:shadow-primary-950/30">
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-elevated">
        {product?.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={`${product?.name ?? "Product"} image`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <Package size={38} className="text-slate-500" aria-hidden="true" />
        )}
        {product?.category && (
          <Badge variant="primary" className="absolute left-3 top-3">{product.category}</Badge>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-white">{product?.name ?? "Unnamed product"}</h2>
            <p className="mt-1 font-mono text-xs text-slate-500">{product?.sku ?? "—"}</p>
          </div>
          <p className="shrink-0 text-sm font-semibold text-primary-200">
            {currency.format(Number(product?.price ?? 0))}
          </p>
        </div>
        <div className="mt-4 flex min-w-0 items-center gap-2 text-xs text-slate-400">
          <Avatar name={supplier?.name ?? supplier?.email ?? "No supplier"} size="sm" />
          <span className="truncate">{supplier?.name ?? supplier?.email ?? "No supplier assigned"}</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => onView(product)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-300 hover:text-white"
          >
            <Eye size={15} aria-hidden="true" />
            View
          </button>
          {canManageProducts && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(product)}
                aria-label={`Edit ${product?.name ?? "product"}`}
                className="rounded-lg p-2 text-slate-400 hover:bg-primary-500/10 hover:text-primary-300"
              >
                <Pencil size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(product)}
                aria-label={`Delete ${product?.name ?? "product"}`}
                className="rounded-lg p-2 text-slate-400 hover:bg-error/10 hover:text-error"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
