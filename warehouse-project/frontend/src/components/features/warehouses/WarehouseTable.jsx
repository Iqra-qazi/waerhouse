import { Eye, MapPin, Pencil, Trash2 } from "lucide-react";
import Avatar from "../../ui/Avatar";
import Badge from "../../ui/Badge";
import DataTable from "../../shared/DataTable";

function getId(record) {
  return record?.id ?? record?._id;
}

function getManagerId(manager) {
  if (manager && typeof manager === "object") return getId(manager);
  return manager;
}

function resolveManager(warehouse, managers) {
  if (warehouse?.manager && typeof warehouse.manager === "object") return warehouse.manager;
  const managerId = getManagerId(warehouse?.manager);
  return managers.find((manager) => String(getId(manager)) === String(managerId));
}

export default function WarehouseTable({
  warehouses = [],
  managers = [],
  loading,
  error,
  onRetry,
  onView,
  onEdit,
  onDelete,
  onAdd,
  search,
  allCount,
  page,
  pageCount,
  filteredCount,
  onPageChange,
}) {
  const isEmptyStart = allCount === 0 && !search;
  const columns = [
    {
      key: "name",
      header: "Warehouse",
      render: (warehouse) => (
        <div className="min-w-40">
          <p className="font-medium text-white">{warehouse?.name ?? "Unnamed warehouse"}</p>
          {warehouse?.code && (
            <Badge variant="neutral" className="mt-1.5 font-mono">{warehouse.code}</Badge>
          )}
        </div>
      ),
    },
    {
      key: "address",
      header: "Location",
      render: (warehouse) => (
        <span className="flex min-w-44 items-center gap-2 text-slate-300">
          <MapPin size={15} className="shrink-0 text-primary-300" aria-hidden="true" />
          {warehouse?.address || "—"}
        </span>
      ),
    },
    {
      key: "manager",
      header: "Manager",
      render: (warehouse) => {
        const manager = resolveManager(warehouse, managers);
        if (!manager) return <Badge variant="warning">Not assigned</Badge>;
        return (
          <div className="flex min-w-40 items-center gap-2.5">
            <Avatar name={manager?.name} src={manager?.image ?? manager?.imageUrl} size="sm" />
            <span className="truncate font-medium text-slate-200">{manager?.name ?? "Manager"}</span>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={warehouses}
      getRowId={getId}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyTitle={isEmptyStart ? "No warehouses yet" : "No warehouses found"}
      emptyDescription={
        isEmptyStart
          ? "Create your first warehouse to start organizing locations."
          : "Try a different warehouse name or address."
      }
      emptyAction={
        isEmptyStart ? (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-xl bg-gradient-to-r from-primary-600 to-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:from-primary-700 hover:to-accent"
          >
            Add Warehouse
          </button>
        ) : undefined
      }
      pagination={{
        page,
        pageCount,
        total: filteredCount,
        onPageChange,
      }}
      rowActions={(warehouse) => (
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => onView(warehouse)}
            aria-label={`View ${warehouse?.name ?? "warehouse"}`}
            title="View details"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
          >
            <Eye size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(warehouse)}
            aria-label={`Edit ${warehouse?.name ?? "warehouse"}`}
            title="Edit warehouse"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-primary-500/10 hover:text-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(warehouse)}
            aria-label={`Delete ${warehouse?.name ?? "warehouse"}`}
            title="Delete warehouse"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-error/10 hover:text-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-error"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    />
  );
}
