import { Boxes, MapPin, Package } from "lucide-react";
import Avatar from "../../ui/Avatar";
import Badge from "../../ui/Badge";
import ErrorState from "../../ui/ErrorState";
import Modal from "../../ui/Modal";
import Skeleton from "../../ui/Skeleton";
import { currency } from "./ProductTable";

function getId(record) {
  return record?.id ?? record?._id ?? "";
}

function resolveReference(reference, records = []) {
  if (reference && typeof reference === "object") return reference;
  return records.find((record) => String(getId(record)) === String(reference));
}

function stockQuantity(entry) {
  const quantity = Number(entry?.quantity ?? 0);
  return Number.isFinite(quantity) ? quantity : 0;
}

export default function ProductDetailsModal({
  open,
  onClose,
  product,
  loading,
  error,
  stock = [],
  stockError,
  warehouseLookupError,
  warehouses = [],
  suppliers = [],
  canViewProductStock,
  onRetry,
}) {
  const record = product ?? {};
  const supplier = resolveReference(record?.supplier, suppliers);
  const totalQuantity = stock.reduce((total, entry) => total + stockQuantity(entry), 0);
  const threshold = Number(record?.lowStockThreshold ?? 10);
  const isLowStock = canViewProductStock && !stockError && totalQuantity <= threshold;
  const warehouseName = (entry) => {
    const ref = entry?.warehouse ?? entry;
    const warehouse = resolveReference(ref, warehouses);
    return warehouse?.name ?? warehouse?.code ?? (typeof ref === "object" ? "Warehouse" : ref) ?? "Warehouse";
  };

  return (
    <Modal open={open} onClose={onClose} title="Product details" size="lg">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <div className="space-y-6">
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {record?.imageUrl ? (
              <img
                src={record.imageUrl}
                alt={`${record?.name ?? "Product"} image`}
                className="h-40 w-full rounded-2xl border border-white/10 bg-elevated object-cover sm:h-32 sm:w-40"
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center rounded-2xl border border-white/10 bg-elevated text-slate-500 sm:h-32 sm:w-40">
                <Package size={38} aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold text-white">{record?.name ?? "Product"}</h3>
                {isLowStock && <Badge variant="danger">Low Stock</Badge>}
              </div>
              <p className="mt-1 font-mono text-sm text-slate-400">{record?.sku ?? "—"}</p>
              {record?.category && <Badge variant="primary" className="mt-3">{record.category}</Badge>}
              <p className="mt-3 text-lg font-semibold text-primary-200">
                {currency.format(Number(record?.price ?? 0))}
              </p>
            </div>
          </section>

          <dl className="grid gap-3 rounded-2xl border border-white/10 bg-elevated/60 p-4 sm:grid-cols-2">
            <Detail label="Cost" value={record?.cost === undefined || record?.cost === null ? "Not provided" : currency.format(Number(record.cost))} />
            <Detail label="Unit" value={record?.unit ?? "piece"} />
            <Detail label="Low stock limit" value={record?.lowStockThreshold ?? 10} />
            <Detail label="Description" value={record?.description || "No description"} />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
              <dd className="mt-1.5">
                <Badge variant={record?.isActive === false ? "danger" : "success"}>
                  {record?.isActive === false ? "Inactive" : "Active"}
                </Badge>
              </dd>
            </div>
            <Detail label="Created" value={formatDate(record?.createdAt)} />
            <Detail label="Last updated" value={formatDate(record?.updatedAt)} />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Supplier</dt>
              {supplier ? (
                <dd className="mt-2 flex min-w-0 items-center gap-2.5">
                  <Avatar name={supplier?.name ?? supplier?.email ?? "Supplier"} src={supplier?.image ?? supplier?.imageUrl} size="sm" />
                  <span className="truncate text-sm text-slate-200">{supplier?.name ?? supplier?.email ?? "Supplier"}</span>
                </dd>
              ) : (
                <dd className="mt-1.5"><Badge variant="warning">Not assigned</Badge></dd>
              )}
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Warehouse</dt>
              <dd className="mt-1.5 flex items-center gap-2 text-sm text-slate-200">
                <MapPin size={15} className="shrink-0 text-primary-300" aria-hidden="true" />
                {resolveReference(record?.warehouse, warehouses)?.name ??
                  resolveReference(record?.warehouse, warehouses)?.code ??
                  (record?.warehouse ? "Warehouse details unavailable" : "Not assigned")}
              </dd>
            </div>
          </dl>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Boxes size={17} className="text-primary-300" aria-hidden="true" />
              <h4 className="text-sm font-semibold text-white">Stock by warehouse</h4>
            </div>
            {stockError ? (
              <p role="alert" className="rounded-xl border border-error/20 bg-error/5 p-3 text-sm text-error">
                {stockError}
              </p>
            ) : !canViewProductStock ? (
              <p className="rounded-xl border border-white/10 bg-elevated p-3 text-sm text-slate-400">
                Stock details are available to administrators and warehouse managers.
              </p>
            ) : (
              <>
                {warehouseLookupError && (
                  <p role="alert" className="mb-3 rounded-xl border border-error/20 bg-error/5 p-3 text-sm text-error">
                    {warehouseLookupError} Warehouse IDs are shown where names are unavailable.
                  </p>
                )}
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full min-w-[360px] text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.025] text-xs uppercase text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Warehouse</th>
                      <th className="px-4 py-3 text-right font-medium">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.07]">
                    {stock.length > 0 ? stock.map((entry, index) => (
                      <tr key={getId(entry) || `${warehouseName(entry)}-${index}`}>
                        <td className="px-4 py-3 text-slate-300">{warehouseName(entry)}</td>
                        <td className="px-4 py-3 text-right font-medium text-white">
                          {stockQuantity(entry).toLocaleString()}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={2} className="px-4 py-4 text-center text-slate-400">No stock recorded.</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="border-t border-white/10 bg-white/[0.025]">
                    <tr>
                      <th className="px-4 py-3 text-slate-300">Total on hand</th>
                      <td className="px-4 py-3 text-right font-semibold text-white">{totalQuantity.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                  </table>
                </div>
              </>
            )}
          </section>

          <div className="flex justify-end border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1.5 whitespace-pre-wrap break-words text-sm text-slate-200">{value ?? "—"}</dd>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
}
