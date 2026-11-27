import Avatar from "../../ui/Avatar";
import Modal from "../../ui/Modal";
import SupplyStatusBadge from "./SupplyStatusBadge";

function getName(value) {
  if (value && typeof value === "object") return value.name ?? value.email ?? "—";
  return value ?? "—";
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-elevated/50 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-200">{value || "—"}</dd>
    </div>
  );
}

export default function SupplyRequestDetailsModal({ open, onClose, request }) {
  const supplierName = getName(request?.supplier);
  return (
    <Modal open={open} onClose={onClose} title="Supply request details" size="md">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-elevated/50 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={supplierName} />
            <div><p className="font-medium text-white">{supplierName}</p><p className="text-xs text-slate-500">Supplier</p></div>
          </div>
          <SupplyStatusBadge status={request?.status} />
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Detail label="Product" value={`${request?.product?.name ?? "—"}${request?.product?.sku ? ` (${request.product.sku})` : ""}`} />
          <Detail label="Warehouse" value={request?.warehouse?.name ?? request?.warehouse?.code} />
          <Detail label="Quantity" value={Number(request?.quantity ?? 0).toLocaleString()} />
          <Detail label="Requested" value={request?.createdAt ? new Date(request.createdAt).toLocaleString() : "—"} />
          <Detail label="Reviewed" value={request?.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : "Not reviewed"} />
          <Detail label="Reviewed by" value={getName(request?.reviewedBy)} />
          <div className="sm:col-span-2"><Detail label="Note" value={request?.note} /></div>
        </dl>
        <div className="flex justify-end"><button type="button" onClick={onClose} className="min-h-10 rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-300 hover:bg-white/5">Close</button></div>
      </div>
    </Modal>
  );
}
