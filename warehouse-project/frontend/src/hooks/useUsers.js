import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import userService from "../services/userService.js";
import { ROLES } from "../config/roles.js";

const PAGE_SIZE = 8;

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ??
    error?.message ??
    fallback
  );
}

function userId(user) {
  return user?.id ?? user?._id;
}

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await userService.getUsers();
      setUsers(result.filter((user) => user?.isActive !== false));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = !role || user?.role === role;
      const searchable = [user?.name, user?.email, user?.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesRole && (!query || searchable.includes(query));
    });
  }, [users, search, role]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const createUser = useCallback(async (payload) => {
    try {
      await userService.createUser(payload);
      toast.success("User created successfully.");
      await loadUsers();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to create user."));
      throw requestError;
    }
  }, [loadUsers]);

  const updateUser = useCallback(async (id, payload) => {
    try {
      await userService.updateUser(id, payload);
      toast.success("User updated successfully.");
      await loadUsers();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to update user."));
      throw requestError;
    }
  }, [loadUsers]);

  const deleteUser = useCallback(async (user) => {
    const id = userId(user);
    try {
      await userService.deleteUser(id);
      setUsers((current) => current.filter((entry) => userId(entry) !== id));
      toast.success("User deactivated successfully.");
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to delete user."));
      throw requestError;
    }
  }, []);

  const stats = useMemo(() => ({
    total: users.length,
    [ROLES.ADMIN]: users.filter((user) => user?.role === ROLES.ADMIN).length,
    [ROLES.MANAGER]: users.filter((user) => user?.role === ROLES.MANAGER).length,
    [ROLES.SUPPLIER]: users.filter((user) => user?.role === ROLES.SUPPLIER).length,
    [ROLES.SALES]: users.filter((user) => user?.role === ROLES.SALES).length,
  }), [users]);

  return {
    users: pageUsers,
    allUsers: users,
    filteredCount: filteredUsers.length,
    loading,
    error,
    search,
    setSearch: (value) => {
      setSearch(value);
      setPage(1);
    },
    role,
    setRole: (value) => {
      setRole(value);
      setPage(1);
    },
    page: currentPage,
    pageCount,
    setPage,
    stats,
    retry: loadUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}
