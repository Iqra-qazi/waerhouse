import Avatar from "../../ui/Avatar";
import Badge from "../../ui/Badge";
import DataTable from "../../shared/DataTable";
import OrderStatusBadge from "../orders/OrderStatusBadge";

function getId(record) {
  return record?.id ?? record?._id ?? "";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function getColumns(tab) {
  if (tab === "stock") {
    return [
      { key: "product", header: "Product", render: (entry) => entry?.product?.name ?? "—" },
      { key: "sku", header: "SKU", render: (entry) => entry?.product?.sku ?? "—" },
      { key: "warehouse", header: "Warehouse", render: (entry) => entry?.warehouse?.name ?? entry?.warehouse?.code ?? "—" },
      { key: "quantity", header: "Quantity", render: (entry) => Number(entry?.quantity ?? 0).toLocaleString() },
      { key: "limit", header: "Low stock limit", render: (entry) => entry?.product?.lowStockThreshold ?? 10 },
      { key: "updatedAt", header: "Last updated", render: (entry) => formatDate(entry?.updatedAt) },
    ];
  }
  if (tab === "orders") {
    return [
      { key: "orderNumber", header: "Order", render: (entry) => <span className="font-mono text-white">{entry?.orderNumber ?? "—"}</span> },
      { key: "customer", header: "Customer", render: (entry) => entry?.customer?.name ?? entry?.customer?.email ?? "—" },
      { key: "warehouse", header: "Warehouse", render: (entry) => entry?.warehouse?.name ?? entry?.warehouse?.code ?? "—" },
      { key: "createdAt", header: "Date", render: (entry) => formatDate(entry?.createdAt) },
      { key: "totalAmount", header: "Amount", render: (entry) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(entry?.totalAmount ?? 0)) },
      { key: "status", header: "Status", render: (entry) => <OrderStatusBadge status={entry?.status} /> },
    ];
  }
  return [
    { key: "createdAt", header: "Date", render: (entry) => formatDate(entry?.createdAt) },
    { key: "product", header: "Product", render: (entry) => entry?.product?.name ?? "—" },
    { key: "warehouse", header: "Warehouse", render: (entry) => entry?.warehouse?.name ?? entry?.warehouse?.code ?? "—" },
    { key: "type", header: "Type", render: (entry) => <Badge variant={entry?.type === "IN" ? "success" : entry?.type === "OUT" ? "danger" : "neutral"}>{entry?.type ?? "—"}</Badge> },
    { key: "quantity", header: "Quantity", render: (entry) => Number(entry?.quantity ?? 0).toLocaleString() },
    {
      key: "performedBy",
      header: "Performed by",
      render: (entry) => {
        const name = entry?.performedBy?.name ?? entry?.performedBy?.email ?? "—";
        return <span className="inline-flex items-center gap-2"><Avatar name={name} size="sm" />{name}</span>;
      },
    },
    { key: "reason", header: "Note", render: (entry) => entry?.reason ?? "—" },
  ];
}

export default function ReportTable({ tab, rows, loading, error, onRetry, filteredCount, page, pageCount, onPageChange }) {
  const titles = { stock: "No stock records", orders: "No orders found", transactions: "No transactions found" };
  return (
    <DataTable
      columns={getColumns(tab)}
      rows={rows}
      getRowId={getId}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyTitle={titles[tab]}
      emptyDescription="No records match the selected report filters."
      pagination={{ page, pageCount, total: filteredCount, onPageChange }}
    />
  );
}
