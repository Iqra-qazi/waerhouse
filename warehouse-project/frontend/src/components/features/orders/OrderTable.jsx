import { Eye, XCircle } from "lucide-react";
import DataTable from "../../shared/DataTable";
import Avatar from "../../ui/Avatar";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderStatusSelect from "./OrderStatusSelect";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function getId(order) {
  return order?.id ?? order?._id ?? "";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function getCustomer(order) {
  if (order?.customer && typeof order.customer === "object") return order.customer;
  return { name: order?.customerName, phone: order?.customerPhone };
}

export default function OrderTable({
  orders,
  loading,
  error,
  onRetry,
  onView,
  canChangeStatus,
  onChangeStatus,
  canCancel,
  onCancel,
  filteredCount,
  page,
  pageCount,
  onPageChange,
}) {
  const columns = [
    {
      key: "orderNumber",
      header: "Order",
      render: (order) => (
        <div className="min-w-36">
          <p className="font-mono font-medium text-white">{order?.orderNumber ?? "—"}</p>
          <p className="mt-1 text-xs text-slate-500">{formatDate(order?.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (order) => {
        const customer = getCustomer(order);
        const name = customer?.name ?? customer?.email ?? "Customer";
        return (
          <div className="flex min-w-40 items-center gap-2.5">
            <Avatar name={name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-slate-200">{name}</p>
              <p className="truncate text-xs text-slate-500">{customer?.phone ?? customer?.email ?? "Phone unavailable"}</p>
            </div>
          </div>
        );
      },
    },
    { key: "warehouse", header: "Warehouse", render: (order) => order?.warehouse?.name ?? order?.warehouse?.code ?? "—" },
    { key: "items", header: "Products", render: (order) => (order?.items ?? []).reduce((total, item) => total + Number(item?.quantity ?? 0), 0) },
    { key: "totalAmount", header: "Total", render: (order) => currency.format(Number(order?.totalAmount ?? 0)) },
    { key: "status", header: "Status", render: (order) => <OrderStatusBadge status={order?.status} /> },
    ...(canChangeStatus ? [{
      key: "updateStatus",
      header: "Update status",
      render: (order) => <OrderStatusSelect order={order} onChange={onChangeStatus} />,
    }] : []),
  ];

  return (
    <DataTable
      columns={columns}
      rows={orders}
      getRowId={getId}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyTitle="No orders found"
      emptyDescription="Orders that match your filters will appear here."
      pagination={{ page, pageCount, total: filteredCount, onPageChange }}
      rowActions={(order) => (
        <div className="inline-flex items-center gap-1">
          <button type="button" onClick={() => onView(order)} aria-label={`View order ${order?.orderNumber ?? ""}`} title="View order" className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
            <Eye size={16} aria-hidden="true" />
          </button>
          {canCancel && order?.status === "pending" && (
            <button type="button" onClick={() => onCancel(order)} aria-label={`Cancel order ${order?.orderNumber ?? ""}`} title="Cancel order" className="rounded-lg p-2 text-error transition hover:bg-error/10">
              <XCircle size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    />
  );
}
