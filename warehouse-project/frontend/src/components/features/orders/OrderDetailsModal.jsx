import { Package } from "lucide-react";
import ErrorState from "../../ui/ErrorState";
import Modal from "../../ui/Modal";
import OrderStatusBadge from "./OrderStatusBadge";
import Skeleton from "../../ui/Skeleton";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function getCustomer(order) {
  if (order?.customer && typeof order.customer === "object") return order.customer;
  return { name: order?.customerName, phone: order?.customerPhone };
}

export default function OrderDetailsModal({ open, onClose, order, loading, error, onRetry }) {
  const customer = getCustomer(order);
  return (
    <Modal open={open} onClose={onClose} title="Order details" size="lg">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <div className="space-y-5">
          <section className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-white/10 bg-elevated/60 p-4">
            <div>
              <p className="font-mono text-lg font-semibold text-white">{order?.orderNumber ?? "—"}</p>
              <p className="mt-1 text-sm text-slate-400">{customer?.name ?? customer?.email ?? "Customer"}</p>
              <p className="mt-1 text-xs text-slate-500">{customer?.phone ?? customer?.email ?? "Contact unavailable"}</p>
            </div>
            <OrderStatusBadge status={order?.status} />
          </section>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Detail label="Warehouse" value={order?.warehouse?.name ?? order?.warehouse?.code} />
            <Detail label="Created" value={order?.createdAt ? new Date(order.createdAt).toLocaleString() : "—"} />
            <Detail label="Shipping address" value={order?.shippingAddress} />
            <Detail label="Note" value={order?.note} />
          </dl>
          <section className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.025] text-xs uppercase text-slate-400">
                <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3 text-right">Quantity</th><th className="px-4 py-3 text-right">Unit price</th><th className="px-4 py-3 text-right">Total</th></tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07]">
                {(order?.items ?? []).map((item, index) => {
                  const quantity = Number(item?.quantity ?? 0);
                  const price = Number(item?.unitPrice ?? item?.price ?? 0);
                  return (
                    <tr key={item?.id ?? item?._id ?? `${item?.product?._id ?? index}`}>
                      <td className="px-4 py-3 text-slate-200"><span className="mr-2 inline-flex text-primary-300"><Package size={15} aria-hidden="true" /></span>{item?.product?.name ?? "Product"}<span className="ml-2 font-mono text-xs text-slate-500">{item?.product?.sku ?? ""}</span></td>
                      <td className="px-4 py-3 text-right text-slate-300">{quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-300">{currency.format(price)}</td>
                      <td className="px-4 py-3 text-right font-medium text-white">{currency.format(price * quantity)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t border-white/10 bg-white/[0.025]">
                <tr><th colSpan={3} className="px-4 py-3 text-right text-slate-300">Order total</th><td className="px-4 py-3 text-right font-semibold text-white">{currency.format(Number(order?.totalAmount ?? 0))}</td></tr>
              </tfoot>
            </table>
          </section>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="min-h-10 rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-300 hover:bg-white/5">Close</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Detail({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-elevated/50 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-200">{value || "—"}</dd>
    </div>
  );
}
