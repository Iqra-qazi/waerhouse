import Avatar from "../../ui/Avatar";
import DataTable from "../../shared/DataTable";
import TransactionTypeBadge from "./TransactionTypeBadge";

function getId(record) {
  return record?.id ?? record?._id ?? "";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function getType(transaction) {
  return transaction?.type ?? transaction?.transactionType;
}

function getQuantity(transaction) {
  const quantity = Math.abs(Number(transaction?.quantity ?? 0));
  const type = String(getType(transaction) ?? "").toUpperCase();
  if (type === "IN" || type === "STOCK-IN") return `+${quantity.toLocaleString()}`;
  if (type === "OUT" || type === "STOCK-OUT") return `-${quantity.toLocaleString()}`;
  return quantity.toLocaleString();
}

export default function TransactionTable({
  transactions,
  loading,
  error,
  onRetry,
  filteredCount,
  page,
  pageCount,
  onPageChange,
}) {
  const columns = [
    {
      key: "createdAt",
      header: "Date and time",
      render: (entry) => formatDate(entry?.createdAt ?? entry?.date),
    },
    {
      key: "product",
      header: "Product",
      render: (entry) => (
        <div className="min-w-36">
          <p className="font-medium text-white">{entry?.product?.name ?? "—"}</p>
          <p className="mt-1 font-mono text-xs text-slate-500">{entry?.product?.sku ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "warehouse",
      header: "Warehouse",
      render: (entry) => entry?.warehouse?.name ?? entry?.warehouse?.code ?? "—",
    },
    {
      key: "type",
      header: "Type",
      render: (entry) => <TransactionTypeBadge type={getType(entry)} />,
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (entry) => (
        <span className={`font-semibold tabular-nums ${getQuantity(entry).startsWith("-") ? "text-error" : "text-accent"}`}>
          {getQuantity(entry)}
        </span>
      ),
    },
    {
      key: "performedBy",
      header: "Performed by",
      render: (entry) => {
        const user = entry?.performedBy;
        const name = typeof user === "object"
          ? user?.name ?? user?.email
          : user;
        return (
          <div className="flex min-w-36 items-center gap-2.5">
            <Avatar name={name ?? "Unknown user"} size="sm" />
            <span className="max-w-40 truncate text-slate-200">{name ?? "Unknown user"}</span>
          </div>
        );
      },
    },
    {
      key: "reason",
      header: "Note",
      render: (entry) => <span className="block max-w-56 truncate" title={entry?.reason ?? ""}>{entry?.reason ?? "—"}</span>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={transactions}
      getRowId={(entry) => getId(entry)}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyTitle="No transactions yet"
      emptyDescription={filteredCount ? "There are no transactions on this page." : "No stock movements match these filters."}
      pagination={{
        page,
        pageCount,
        total: filteredCount,
        onPageChange,
      }}
    />
  );
}
