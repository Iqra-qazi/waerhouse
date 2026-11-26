import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/layout/PageHeader";
import UserFilters from "../components/features/users/UserFilters";
import UserFormModal from "../components/features/users/UserFormModal";
import UserStatsCards from "../components/features/users/UserStatsCards";
import UserTable from "../components/features/users/UserTable";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import useUsers from "../hooks/useUsers";

function getId(user) {
  return user?.id ?? user?._id;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const usersState = useUsers();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setSelectedUser(null);
    setFormOpen(true);
  }

  function openEdit(user) {
    setSelectedUser(user);
    setFormOpen(true);
  }

  async function saveUser(payload, user) {
    if (user) {
      await usersState.updateUser(getId(user), payload);
    } else {
      await usersState.createUser(payload);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await usersState.deleteUser(deleteTarget);
      setDeleteTarget(null);
    } catch {
      // The hook displays the API error in a toast; keep the confirmation open for retry.
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader title="Users" description="Manage user accounts and access.">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:from-primary-700 hover:to-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
        >
          <Plus size={17} aria-hidden="true" />
          Add User
        </button>
      </PageHeader>

      <UserStatsCards stats={usersState.stats} />
      <UserFilters
        search={usersState.search}
        setSearch={usersState.setSearch}
        role={usersState.role}
        setRole={usersState.setRole}
      />
      <UserTable
        users={usersState.users}
        loading={usersState.loading}
        error={usersState.error}
        onRetry={usersState.retry}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        currentUserId={getId(currentUser)}
        page={usersState.page}
        pageCount={usersState.pageCount}
        total={usersState.filteredCount}
        onPageChange={usersState.setPage}
      />

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        user={selectedUser}
        onSave={saveUser}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user?"
        description={`This will deactivate ${deleteTarget?.name ?? "this user"}'s account.`}
        confirmLabel="Delete user"
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}
