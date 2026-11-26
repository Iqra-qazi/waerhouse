import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../config/roles.js";
import stockService from "../services/stockService.js";
import warehouseService from "../services/warehouseService.js";

const PAGE_SIZE = 10;

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

function getId(record) {
  if (record && typeof record === "object") return String(record.id ?? record._id ?? "");
  return String(record ?? "");
}

function getTransactionType(transaction) {
  return String(transaction?.type ?? transaction?.transactionType ?? "").toUpperCase();
}

function includesQuery(value, query) {
  return String(value ?? "").toLowerCase().includes(query);
}

export default function useStockTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearchState] = useState("");
  const [warehouse, setWarehouseState] = useState("");
  const [type, setTypeState] = useState("");
  const [from, setFromState] = useState("");
  const [to, setToState] = useState("");
  const [page, setPageState] = useState(1);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [transactionResult, warehouseResult] = await Promise.all([
        stockService.getTransactions(),
        warehouseService.getWarehouses(),
      ]);
      setTransactions(transactionResult);
      setWarehouses(warehouseResult.filter((entry) => entry?.isActive !== false));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load stock transactions."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const fromDate = from ? new Date(`${from}T00:00:00`) : null;
    const toDate = to ? new Date(`${to}T23:59:59.999`) : null;
    return transactions.filter((entry) => {
      const date = new Date(entry?.createdAt ?? entry?.date ?? "");
      const matchesSearch = !query || [
        entry?.product?.name,
        entry?.product?.sku,
      ].some((value) => includesQuery(value, query));
      const matchesWarehouse = !warehouse || getId(entry?.warehouse) === String(warehouse);
      const transactionType = getTransactionType(entry);
      const matchesType = !type ||
        (type === "stock-in" && transactionType === "IN") ||
        (type === "stock-out" && transactionType === "OUT");
      const matchesFrom = !fromDate || (Number.isFinite(date.getTime()) && date >= fromDate);
      const matchesTo = !toDate || (Number.isFinite(date.getTime()) && date <= toDate);
      return matchesSearch && matchesWarehouse && matchesType && matchesFrom && matchesTo;
    });
  }, [from, search, to, transactions, type, warehouse]);

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredTransactions]);
  const warehouseOptions = useMemo(
    () => warehouses.map((entry) => ({
      value: getId(entry),
      label: entry?.name ?? entry?.code ?? getId(entry),
    })).filter((option) => option.value),
    [warehouses],
  );

  const clearFilters = useCallback(() => {
    setSearchState("");
    setWarehouseState("");
    setTypeState("");
    setFromState("");
    setToState("");
    setPageState(1);
  }, []);

  return {
    transactions: pageTransactions,
    filteredTransactions,
    filteredCount: filteredTransactions.length,
    warehouseOptions,
    managerScopeWarning: user?.role === ROLES.MANAGER,
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
    type,
    setType: (value) => {
      setTypeState(value);
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
    clearFilters,
    retry: loadTransactions,
  };
}
