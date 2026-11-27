import { Boxes, MapPin, Package, TriangleAlert, Warehouse } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../../ui/EmptyState";
import Skeleton from "../../ui/Skeleton";

function getId(record) {
  return record?.id ?? record?._id ?? "";
}

export default function MyWarehouseCards({ warehouses, loading }) {
  if (loading) {
    return <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-52 rounded-2xl" />)}</section>;
  }
  if (!warehouses.length) {
    return <EmptyState title="No warehouses available" description="Warehouse locations returned by the API will appear here." icon={Warehouse} />;
  }
  return (
    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {warehouses.map((warehouse) => (
        <article key={getId(warehouse)} className="rounded-2xl border border-white/10 bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-200"><Warehouse size={20} aria-hidden="true" /></span>
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-white">{warehouse?.name ?? "Warehouse"}</h2>
                <p className="mt-1 font-mono text-xs text-slate-500">{warehouse?.code ?? "—"}</p>
              </div>
            </div>
            <span className="max-w-36 text-right text-xs text-slate-500">{warehouse?.capacity == null ? "Capacity not provided" : `${warehouse.capacity} capacity`}</span>
          </div>
          <p className="mt-4 flex items-start gap-2 text-sm text-slate-400">
            <MapPin size={16} className="mt-0.5 shrink-0 text-primary-300" aria-hidden="true" />
            <span className="break-words">{warehouse?.address ?? "No address provided"}</span>
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/10 py-4">
            <Metric icon={Package} label="Products" value={warehouse.productCount} />
            <Metric icon={Boxes} label="Units" value={warehouse.stockQuantity} />
            <Metric icon={TriangleAlert} label="Low stock" value={warehouse.lowStockCount} />
          </div>
          <Link to={`/stock?warehouse=${encodeURIComponent(getId(warehouse))}`} className="mt-4 inline-flex min-h-10 items-center text-sm font-medium text-primary-200 hover:text-primary-100">
            View this warehouse’s stock <span aria-hidden="true" className="ml-1">→</span>
          </Link>
        </article>
      ))}
    </section>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-xs text-slate-500"><Icon size={13} aria-hidden="true" />{label}</div>
      <p className="mt-1 text-lg font-semibold text-white">{Number(value ?? 0).toLocaleString()}</p>
    </div>
  );
}
