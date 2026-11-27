import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../config/roles.js";
import orderService from "../services/orderService.js";

const PAGE_SIZE = 8;

function getId(record) {
  if (record && typeof record === "object") return String(record.id ?? record._id ?? "");
  return String(record ?? "");
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

function getCustomerName(order) {
  return typeof order?.customer === "object"
    ? order.customer?.name ?? order.customer?.email ?? ""
    : order?.customerName ?? "";
}

export default function useOrders({ mine = false } = {}) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearchState] = useState("");
  const [status, setStatusState] = useState("");
  const [from, setFromState] = useState("");
  const [to, setToState] = useState("");
  const [page, setPageState] = useState(1);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(mine ? await orderService.getMyOrders() : await orderService.getOrders());
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load orders."));
    } finally {
      setLoading(false);
    }
  }, [mine]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    const fromDate = from ? new Date(`${from}T00:00:00`) : null;
    const toDate = to ? new Date(`${to}T23:59:59.999`) : null;
    return orders.filter((order) => {
      const createdAt = new Date(order?.createdAt ?? "");
      const matchesSearch = !query ||
        [order?.orderNumber, getCustomerName(order)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesStatus = !status || order?.status === status;
      const matchesFrom = !fromDate || (Number.isFinite(createdAt.getTime()) && createdAt >= fromDate);
      const matchesTo = !toDate || (Number.isFinite(createdAt.getTime()) && createdAt <= toDate);
      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [from, orders, search, status, to]);

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredOrders]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order?.status === "pending").length,
    confirmed: orders.filter((order) => order?.status === "confirmed").length,
    shipped: orders.filter((order) => order?.status === "shipped").length,
    delivered: orders.filter((order) => order?.status === "delivered").length,
    cancelled: orders.filter((order) => order?.status === "cancelled").length,
  }), [orders]);

  const loadDetails = useCallback(async (order) => {
    setDetails(order);
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      setDetails(await orderService.getOrder(getId(order)));
    } catch (requestError) {
      setDetailsError(getErrorMessage(requestError, "Unable to load order details."));
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (order, nextStatus) => {
    try {
      await orderService.updateOrderStatus(getId(order), nextStatus);
      toast.success("Order status updated.");
      await loadOrders();
      return true;
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to update order status."));
      return false;
    }
  }, [loadOrders]);

  const cancelOwnOrder = useCallback(async (order) => {
    try {
      await orderService.cancelOrder(getId(order));
      toast.success("Order cancelled.");
      await loadOrders();
      return true;
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to cancel order."));
      return false;
    }
  }, [loadOrders]);

  const clearFilters = useCallback(() => {
    setSearchState("");
    setStatusState("");
    setFromState("");
    setToState("");
    setPageState(1);
  }, []);

  return {
    orders: pageOrders,
    allOrders: orders,
    filteredCount: filteredOrders.length,
    loading,
    error,
    search,
    setSearch: (value) => {
      setSearchState(value);
      setPageState(1);
    },
    status,
    setStatus: (value) => {
      setStatusState(value);
      setPageState(1);
    },
    from,
    setFrom: (value) => {
      setFromState(value);
      setPageState(1);
    },
    to,
    setTo: (value) => {
      setToState(value);
      setPageState(1);
    },
    page: currentPage,
    pageCount,
    setPage: (value) => setPageState(Math.max(1, Math.min(Number(value) || 1, pageCount))),
    stats,
    managerScopeWarning: !mine && user?.role === ROLES.MANAGER,
    retry: loadOrders,
    clearFilters,
    loadDetails,
    details,
    detailsLoading,
    detailsError,
    updateStatus,
    cancelOwnOrder,
  };
}
