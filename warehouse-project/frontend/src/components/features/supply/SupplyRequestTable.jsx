import { Eye, Check, X } from "lucide-react";
import Avatar from "../../ui/Avatar";
import DataTable from "../../shared/DataTable";
import SupplyStatusBadge from "./SupplyStatusBadge";

function getId(record) {
  return record?.id ?? record?._id ?? "";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export default function SupplyRequestTable({
  requests,
  loading,
  error,
  onRetry,
  canReview,
  onReview,
  onView,
  filteredCount,
  page,
  pageCount,
  onPageChange,
}) {
  const columns = [
    { key: "createdAt", header: "Requested", render: (request) => formatDate(request?.createdAt) },
    {
      key: "product",
      header: "Product",
      render: (request) => (
        <div className="min-w-36">
          <p className="font-medium text-white">{request?.product?.name ?? "—"}</p>
          <p className="mt-1 font-mono text-xs text-slate-500">{request?.product?.sku ?? "—"}</p>
        </div>
      ),
    },
    { key: "warehouse", header: "Warehouse", render: (request) => request?.warehouse?.name ?? request?.warehouse?.code ?? "—" },
    { key: "quantity", header: "Quantity", render: (request) => Number(request?.quantity ?? 0).toLocaleString() },
    {
      key: "supplier",
      header: "Supplier",
      render: (request) => {
        const supplier = request?.supplier;
        const name = typeof supplier === "object" ? supplier?.name ?? supplier?.email : supplier;
        return (
          <div className="flex min-w-32 items-center gap-2">
            <Avatar name={name ?? "Supplier"} size="sm" />
            <span className="max-w-36 truncate text-slate-200">{name ?? "—"}</span>
          </div>
        );
      },
    },
    { key: "status", header: "Status", render: (request) => <SupplyStatusBadge status={request?.status} /> },
    { key: "note", header: "Note", render: (request) => <span className="block max-w-48 truncate" title={request?.note ?? ""}>{request?.note ?? "—"}</span> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={requests}
      getRowId={getId}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyTitle="No supply requests"
      emptyDescription="Requests matching your filters will appear here."
      pagination={{ page, pageCount, total: filteredCount, onPageChange }}
      rowActions={(request) => (
        <div className="inline-flex items-center gap-1">
          <button type="button" onClick={() => onView(request)} aria-label="View supply request" title="View details" className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
            <Eye size={16} aria-hidden="true" />
          </button>
          {canReview && request?.status === "pending" && (
            <>
              <button type="button" onClick={() => onReview(request, "approved")} aria-label="Approve supply request" title="Approve" className="rounded-lg p-2 text-accent hover:bg-accent/10">
                <Check size={16} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => onReview(request, "rejected")} aria-label="Reject supply request" title="Reject" className="rounded-lg p-2 text-error hover:bg-error/10">
                <X size={16} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      )}
    />
  );
}
