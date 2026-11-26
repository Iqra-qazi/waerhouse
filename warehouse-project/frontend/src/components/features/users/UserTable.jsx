import { Pencil, Trash2 } from "lucide-react";
import Avatar from "../../ui/Avatar";
import Badge from "../../ui/Badge";
import RoleBadge from "../../layout/RoleBadge";
import DataTable from "../../shared/DataTable";

function getId(user) {
  return user?.id ?? user?._id;
}

function getWarehouseName(warehouse) {
  if (warehouse && typeof warehouse === "object") {
    return warehouse.name ?? warehouse.code ?? warehouse.id ?? warehouse._id ?? "Warehouse";
  }
  const id = String(warehouse ?? "");
  return id.length > 10 ? `${id.slice(0, 6)}…${id.slice(-3)}` : id || "Warehouse";
}

export default function UserTable({
  users,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
  currentUserId,
  page,
  pageCount,
  total,
  onPageChange,
}) {
  const columns = [
    {
      key: "name",
      header: "User",
      render: (user) => (
        <div className="flex min-w-48 items-center gap-3">
          <Avatar name={user?.name} src={user?.image ?? user?.imageUrl} />
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{user?.name ?? "Unnamed user"}</p>
            {user?.isActive === false && <Badge variant="warning" className="mt-1">Inactive</Badge>}
          </div>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (user) => user?.email ?? "—" },
    { key: "phone", header: "Phone", render: (user) => user?.phone || "—" },
    { key: "role", header: "Role", render: (user) => <RoleBadge role={user?.role} /> },
    {
      key: "assignedWarehouses",
      header: "Assigned warehouses",
      render: (user) => {
        const warehouses = Array.isArray(user?.assignedWarehouses) ? user.assignedWarehouses : [];
        if (warehouses.length === 0) return <span className="text-slate-500">—</span>;
        return (
          <div className="flex max-w-64 flex-wrap gap-1.5">
            {warehouses.slice(0, 2).map((warehouse, index) => (
              <Badge key={String(warehouse?.id ?? warehouse?._id ?? warehouse) + index} variant="neutral">
                {getWarehouseName(warehouse)}
              </Badge>
            ))}
            {warehouses.length > 2 && <Badge variant="primary">+{warehouses.length - 2}</Badge>}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={users}
      getRowId={getId}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyTitle="No users found"
      emptyDescription="Try changing your search or role filter."
      pagination={{
        page,
        pageCount,
        total,
        onPageChange,
      }}
      rowActions={(user) => {
        const self = String(getId(user) ?? "") === String(currentUserId ?? "");
        return (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(user)}
              aria-label={`Edit ${user?.name ?? "user"}`}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-primary-500/10 hover:text-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
            >
              <Pencil size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(user)}
              disabled={self}
              title={self ? "You cannot delete your own account" : `Delete ${user?.name ?? "user"}`}
              aria-label={self ? "You cannot delete your own account" : `Delete ${user?.name ?? "user"}`}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-error/10 hover:text-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-400"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        );
      }}
    />
  );
}
