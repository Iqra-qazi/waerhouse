import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../config/roles.js";
import orderService from "../services/orderService.js";
import stockService from "../services/stockService.js";
import warehouseService from "../services/warehouseService.js";

const PAGE_SIZE = 10;

function getId(record) {
  if (record && typeof record === "object") return String(record.id ?? record._id ?? "");
  return String(record ?? "");
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

export default function useReports() {
  const { user } = useAuth();
  const [stock, setStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTabState] = useState("stock");
  const [warehouse, setWarehouseState] = useState("");
  const [status, setStatusState] = useState("");
  const [type, setTypeState] = useState("");
  const [from, setFromState] = useState("");
  const [to, setToState] = useState("");
  const [page, setPageState] = useState(1);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stockResult, orderResult, transactionResult, warehouseResult] = await Promise.all([
        stockService.getStock(),
        orderService.getOrders(),
        stockService.getTransactions(),
        warehouseService.getWarehouses(),
      ]);
      setStock(stockResult);
      setOrders(orderResult);
      setTransactions(transactionResult);
      setWarehouses(warehouseResult);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load report data."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredRows = useMemo(() => {
    const source = tab === "stock" ? stock : tab === "orders" ? orders : transactions;
    const fromDate = from ? new Date(`${from}T00:00:00`) : null;
    const toDate = to ? new Date(`${to}T23:59:59.999`) : null;
    return source.filter((entry) => {
      const entryWarehouse = getId(entry?.warehouse);
      const matchesWarehouse = !warehouse || entryWarehouse === String(warehouse);
      const dateValue = tab === "stock" ? entry?.updatedAt : entry?.createdAt;
      const date = new Date(dateValue ?? "");
      const matchesFrom = !fromDate || (Number.isFinite(date.getTime()) && date >= fromDate);
      const matchesTo = !toDate || (Number.isFinite(date.getTime()) && date <= toDate);
      const matchesStatus = tab !== "orders" || !status || entry?.status === status;
      const matchesType = tab !== "transactions" || !type ||
        String(entry?.type ?? "").toUpperCase() === type;
      return matchesWarehouse && matchesFrom && matchesTo && matchesStatus && matchesType;
    });
  }, [from, orders, stock, status, tab, to, transactions, type, warehouse]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredRows]);

  const summary = useMemo(() => {
    if (tab === "stock") {
      return {
        records: filteredRows.length,
        quantity: filteredRows.reduce((sum, entry) => sum + Number(entry?.quantity ?? 0), 0),
      };
    }
    if (tab === "orders") {
      return {
        records: filteredRows.length,
        amount: filteredRows.reduce((sum, entry) => sum + Number(entry?.totalAmount ?? 0), 0),
      };
    }
    return {
      records: filteredRows.length,
      stockIn: filteredRows
        .filter((entry) => entry?.type === "IN")
        .reduce((sum, entry) => sum + Number(entry?.quantity ?? 0), 0),
      stockOut: filteredRows
        .filter((entry) => entry?.type === "OUT")
        .reduce((sum, entry) => sum + Number(entry?.quantity ?? 0), 0),
    };
  }, [filteredRows, tab]);

  const warehouseOptions = useMemo(
    () => warehouses.map((entry) => ({
      value: getId(entry),
      label: entry?.name ?? entry?.code ?? getId(entry),
    })).filter((option) => option.value),
    [warehouses],
  );

  const clearFilters = useCallback(() => {
    setWarehouseState("");
    setStatusState("");
    setTypeState("");
    setFromState("");
    setToState("");
    setPageState(1);
  }, []);

  const setTab = useCallback((value) => {
    setTabState(value);
    setPageState(1);
  }, []);

  return {
    stock,
    orders,
    transactions,
    tab,
    setTab,
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
    warehouseOptions,
    rows: pageRows,
    filteredRows,
    filteredCount: filteredRows.length,
    summary,
    loading,
    error,
    page: currentPage,
    pageCount,
    setPage: (value) => setPageState(Math.max(1, Math.min(Number(value) || 1, pageCount))),
    clearFilters,
    retry: loadReports,
    managerScopeWarning: user?.role === ROLES.MANAGER,
  };
}
