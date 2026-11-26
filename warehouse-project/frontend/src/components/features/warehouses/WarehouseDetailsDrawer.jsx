import { Boxes, Building2, MapPin } from "lucide-react";
import Avatar from "../../ui/Avatar";
import Badge from "../../ui/Badge";
import ErrorState from "../../ui/ErrorState";
import Modal from "../../ui/Modal";
import Skeleton from "../../ui/Skeleton";

function getId(record) {
  return record?.id ?? record?._id;
}

function findManager(warehouse, managers) {
  if (warehouse?.manager && typeof warehouse.manager === "object") return warehouse.manager;
  const managerId = warehouse?.manager;
  return managers.find((manager) => String(getId(manager)) === String(managerId));
}

function summarizeStock(stock) {
  const rows = Array.isArray(stock) ? stock : [];
  const units = rows.reduce((total, entry) => {
    const quantity = Number(entry?.quantity);
    return total + (Number.isFinite(quantity) && quantity > 0 ? quantity : 0);
  }, 0);
  const products = rows
    .map((entry) => entry?.product?.id ?? entry?.product?._id ?? entry?.product)
    .filter((id) => id !== undefined && id !== null)
    .map(String);
  return {
    units,
    productCount: products.length ? new Set(products).size : rows.length,
  };
}

export default function WarehouseDetailsDrawer({
  open,
  onClose,
  warehouse,
  loading,
  error,
  stock = [],
  stockError,
  managers = [],
  onRetry,
}) {
  const record = warehouse ?? {};
  const manager = findManager(record, managers);
  const stockSummary = summarizeStock(stock);

  return (
    <Modal open={open} onClose={onClose} title="Warehouse details" size="md">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300">
                <Building2 size={21} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white">{record?.name ?? "Warehouse"}</h3>
                {record?.code && <Badge variant="neutral" className="mt-1 font-mono">{record.code}</Badge>}
              </div>
            </div>
          </div>

          <dl className="grid gap-4 rounded-2xl border border-white/10 bg-elevated/60 p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Address</dt>
              <dd className="mt-1.5 flex items-start gap-2 text-sm text-slate-200">
                <MapPin size={15} className="mt-0.5 shrink-0 text-primary-300" aria-hidden="true" />
                {record?.address || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Manager</dt>
              {manager ? (
                <dd className="mt-2 flex items-center gap-2.5">
                  <Avatar name={manager?.name} src={manager?.image ?? manager?.imageUrl} size="sm" />
                  <span className="text-sm font-medium text-slate-200">{manager?.name ?? "Manager"}</span>
                </dd>
              ) : record?.manager ? (
                <dd className="mt-1.5 text-sm text-slate-300">Manager details unavailable</dd>
              ) : (
                <dd className="mt-1.5"><Badge variant="warning">Not assigned</Badge></dd>
              )}
            </div>
          </dl>

          {manager && (
            <section>
              <h4 className="mb-3 text-sm font-semibold text-white">Manager contact</h4>
              <dl className="grid gap-3 rounded-2xl border border-white/10 bg-surface p-4 sm:grid-cols-2">
                <ContactDetail label="Email" value={manager?.email} />
                <ContactDetail label="Phone" value={manager?.phone} />
              </dl>
            </section>
          )}

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Boxes size={17} className="text-primary-300" aria-hidden="true" />
              <h4 className="text-sm font-semibold text-white">Stock overview</h4>
            </div>
            {stockError ? (
              <p role="alert" className="rounded-xl border border-error/20 bg-error/5 p-3 text-sm text-error">
                {stockError}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Metric label="On-hand units" value={stockSummary.units} />
                <Metric label="Different products" value={stockSummary.productCount} />
              </div>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Capacity limits are not included because the backend guide does not define a capacity field.
            </p>
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

function ContactDetail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1.5 break-all text-sm text-slate-200">{value || "Not provided"}</dd>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-elevated p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{Number(value ?? 0).toLocaleString()}</p>
    </div>
  );
}
