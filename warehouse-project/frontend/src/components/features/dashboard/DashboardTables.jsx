import { Link } from "react-router-dom";
import DataTable from "../../shared/DataTable";
import Avatar from "../../ui/Avatar";
import Badge from "../../ui/Badge";
import OrderStatusBadge from "../orders/OrderStatusBadge";
import SupplyStatusBadge from "../supply/SupplyStatusBadge";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function getId(record) {
  return record?.id ?? record?._id ?? "";
}

export function RecentOrdersTable({ orders = [], ordersPath = "/orders" }) {
  const columns = [
    { key: "orderNumber", header: "Order", render: (order) => <span className="font-mono text-white">{order?.orderNumber ?? "—"}</span> },
    { key: "customer", header: "Customer", render: (order) => order?.customer?.name ?? order?.customer?.email ?? "—" },
    { key: "createdAt", header: "Date", render: (order) => formatDate(order?.createdAt) },
    { key: "totalAmount", header: "Amount", render: (order) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(order?.totalAmount ?? 0)) },
    { key: "status", header: "Status", render: (order) => <OrderStatusBadge status={order?.status} /> },
  ];
  return (
    <section className="rounded-2xl border border-white/10 bg-surface">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <h2 className="text-sm font-semibold text-white">Recent orders</h2>
        <Link to={ordersPath} className="text-xs font-medium text-primary-200 hover:text-primary-100">View orders</Link>
      </div>
      <DataTable columns={columns} rows={orders.slice(0, 5)} getRowId={getId} emptyTitle="No recent orders" emptyDescription="New orders will appear here." />
    </section>
  );
}

export function RecentTransactionsTable({ transactions = [] }) {
  const columns = [
    { key: "createdAt", header: "Date", render: (entry) => formatDate(entry?.createdAt) },
    { key: "product", header: "Product", render: (entry) => entry?.product?.name ?? "—" },
    { key: "warehouse", header: "Warehouse", render: (entry) => entry?.warehouse?.name ?? "—" },
    {
      key: "type",
      header: "Type",
      render: (entry) => <Badge variant={entry?.type === "IN" ? "success" : entry?.type === "OUT" ? "danger" : "neutral"}>{entry?.type ?? "—"}</Badge>,
    },
    { key: "quantity", header: "Quantity", render: (entry) => Number(entry?.quantity ?? 0).toLocaleString() },
    {
      key: "performedBy",
      header: "Performed by",
      render: (entry) => {
        const name = entry?.performedBy?.name ?? entry?.performedBy?.email ?? "—";
        return <span className="inline-flex items-center gap-2"><Avatar name={name} size="sm" />{name}</span>;
      },
    },
  ];
  return (
    <section className="rounded-2xl border border-white/10 bg-surface">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <h2 className="text-sm font-semibold text-white">Recent transactions</h2>
        <Link to="/stock-transactions" className="text-xs font-medium text-primary-200 hover:text-primary-100">View transactions</Link>
      </div>
      <DataTable columns={columns} rows={transactions.slice(0, 5)} getRowId={getId} emptyTitle="No recent transactions" emptyDescription="Stock movements will appear here." />
    </section>
  );
}

export function LowStockTable({ entries = [] }) {
  const columns = [
    { key: "product", header: "Product", render: (entry) => entry?.product?.name ?? "—" },
    { key: "warehouse", header: "Warehouse", render: (entry) => entry?.warehouse?.name ?? "—" },
    { key: "quantity", header: "On hand", render: (entry) => Number(entry?.quantity ?? 0).toLocaleString() },
    { key: "limit", header: "Limit", render: (entry) => entry?.product?.lowStockThreshold ?? 10 },
  ];
  return <DataTable columns={columns} rows={entries.slice(0, 6)} getRowId={getId} emptyTitle="No low-stock products" emptyDescription="No low-stock items were returned by the API." />;
}

export function RecentSupplyTable({ requests = [] }) {
  const columns = [
    { key: "product", header: "Product", render: (entry) => entry?.product?.name ?? "—" },
    { key: "warehouse", header: "Warehouse", render: (entry) => entry?.warehouse?.name ?? "—" },
    { key: "quantity", header: "Quantity", render: (entry) => Number(entry?.quantity ?? 0).toLocaleString() },
    { key: "status", header: "Status", render: (entry) => <SupplyStatusBadge status={entry?.status} /> },
  ];
  return (
    <section className="rounded-2xl border border-white/10 bg-surface">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <h2 className="text-sm font-semibold text-white">Recent supply requests</h2>
        <Link to="/supply-requests" className="text-xs font-medium text-primary-200 hover:text-primary-100">View requests</Link>
      </div>
      <DataTable columns={columns} rows={requests.slice(0, 5)} getRowId={getId} emptyTitle="No supply requests" emptyDescription="Recent requests will appear here." />
    </section>
  );
}
