import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../config/roles.js";
import supplyService from "../services/supplyService.js";

const PAGE_SIZE = 8;

function getId(record) {
  if (record && typeof record === "object") return String(record.id ?? record._id ?? "");
  return String(record ?? "");
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

export default function useSupplyRequests({ mine = false } = {}) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearchState] = useState("");
  const [warehouse, setWarehouseState] = useState("");
  const [status, setStatusState] = useState("");
  const [from, setFromState] = useState("");
  const [to, setToState] = useState("");
  const [page, setPageState] = useState(1);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRequests(mine
        ? await supplyService.getMySupplyRequests()
        : await supplyService.getSupplyRequests());
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load supply requests."));
    } finally {
      setLoading(false);
    }
  }, [mine]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    const fromDate = from ? new Date(`${from}T00:00:00`) : null;
    const toDate = to ? new Date(`${to}T23:59:59.999`) : null;
    return requests.filter((request) => {
      const requestDate = new Date(request?.createdAt ?? "");
      const matchesSearch = !query || [
        request?.product?.name,
        request?.product?.sku,
        request?.supplier?.name,
      ].filter(Boolean).join(" ").toLowerCase().includes(query);
      const matchesWarehouse = !warehouse || getId(request?.warehouse) === String(warehouse);
      const matchesStatus = !status || request?.status === status;
      const matchesFrom = !fromDate || (Number.isFinite(requestDate.getTime()) && requestDate >= fromDate);
      const matchesTo = !toDate || (Number.isFinite(requestDate.getTime()) && requestDate <= toDate);
      return matchesSearch && matchesWarehouse && matchesStatus && matchesFrom && matchesTo;
    });
  }, [from, requests, search, status, to, warehouse]);

  const pageCount = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRequests = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredRequests]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((request) => request?.status === "pending").length,
    approved: requests.filter((request) => request?.status === "approved").length,
    rejected: requests.filter((request) => request?.status === "rejected").length,
  }), [requests]);

  const createRequest = useCallback(async (payload) => {
    try {
      await supplyService.createSupplyRequest(payload);
      toast.success("Supply request submitted.");
      await loadRequests();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to submit supply request."));
      throw requestError;
    }
  }, [loadRequests]);

  const reviewRequest = useCallback(async (request, nextStatus) => {
    try {
      await supplyService.reviewSupplyRequest(getId(request), nextStatus);
      toast.success(nextStatus === "approved" ? "Supply request approved." : "Supply request rejected.");
      await loadRequests();
      return true;
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to review supply request."));
      return false;
    }
  }, [loadRequests]);

  const clearFilters = useCallback(() => {
    setSearchState("");
    setWarehouseState("");
    setStatusState("");
    setFromState("");
    setToState("");
    setPageState(1);
  }, []);

  return {
    requests: pageRequests,
    allRequests: requests,
    filteredCount: filteredRequests.length,
    loading,
    error,
    search,
    setSearch: (value) => {
      setSearchState(value);
      setPageState(1);
    },
    warehouse,
    setWarehouse: (value) => {
      setWarehouseState(value);
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
    retry: loadRequests,
    clearFilters,
    createRequest,
    reviewRequest,
  };
}
