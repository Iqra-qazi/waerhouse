import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import userService from "../services/userService.js";
import warehouseService from "../services/warehouseService.js";
import stockService from "../services/stockService.js";
import { ROLES } from "../config/roles.js";

const PAGE_SIZE = 8;

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

function getId(record) {
  return record?.id ?? record?._id;
}

export default function useWarehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managersLoading, setManagersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [managersError, setManagersError] = useState(null);
  const [search, setSearchState] = useState("");
  const [page, setPageState] = useState(1);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [stock, setStock] = useState([]);
  const [stockError, setStockError] = useState(null);

  const loadWarehouses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await warehouseService.getWarehouses();
      setWarehouses(result.filter((warehouse) => warehouse?.isActive !== false));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load warehouses."));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadManagers = useCallback(async () => {
    setManagersLoading(true);
    setManagersError(null);
    try {
      const result = await userService.getUsers();
      setManagers(
        result.filter((user) => user?.isActive !== false && user?.role === ROLES.MANAGER),
      );
    } catch (requestError) {
      setManagers([]);
      setManagersError(getErrorMessage(requestError, "Unable to load managers."));
    } finally {
      setManagersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWarehouses();
    loadManagers();
  }, [loadWarehouses, loadManagers]);

  const filteredWarehouses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return warehouses.filter((warehouse) => {
      const searchable = [warehouse?.name, warehouse?.code, warehouse?.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return !query || searchable.includes(query);
    });
  }, [warehouses, search]);

  const pageCount = Math.max(1, Math.ceil(filteredWarehouses.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageWarehouses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredWarehouses.slice(start, start + PAGE_SIZE);
  }, [filteredWarehouses, currentPage]);

  const stats = useMemo(() => {
    const managed = warehouses.filter((warehouse) => Boolean(warehouse?.manager)).length;
    return {
      total: warehouses.length,
      managed,
      unassigned: warehouses.length - managed,
    };
  }, [warehouses]);

  const createWarehouse = useCallback(async (payload) => {
    try {
      await warehouseService.createWarehouse(payload);
      toast.success("Warehouse created successfully.");
      await loadWarehouses();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to create warehouse."));
      throw requestError;
    }
  }, [loadWarehouses]);

  const updateWarehouse = useCallback(async (id, payload) => {
    try {
      await warehouseService.updateWarehouse(id, payload);
      toast.success("Warehouse updated successfully.");
      await loadWarehouses();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to update warehouse."));
      throw requestError;
    }
  }, [loadWarehouses]);

  const deleteWarehouse = useCallback(async (warehouse) => {
    const id = getId(warehouse);
    try {
      await warehouseService.deleteWarehouse(id);
      setWarehouses((current) => current.filter((entry) => getId(entry) !== id));
      toast.success("Warehouse deactivated successfully.");
      return true;
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to delete warehouse."));
      return false;
    }
  }, []);

  const loadDetails = useCallback(async (warehouse) => {
    const id = getId(warehouse);
    setDetailsLoading(true);
    setDetailsError(null);
    setStockError(null);
    setDetails(null);
    setStock([]);
    try {
      const record = await warehouseService.getWarehouse(id);
      setDetails(record);
      try {
        const warehouseStock = await stockService.getWarehouseStock(id);
        setStock(warehouseStock);
      } catch (requestError) {
        setStockError(getErrorMessage(requestError, "Unable to load stock details."));
      }
    } catch (requestError) {
      setDetailsError(getErrorMessage(requestError, "Unable to load warehouse details."));
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  return {
    warehouses: pageWarehouses,
    allWarehouses: warehouses,
    filteredCount: filteredWarehouses.length,
    loading,
    error,
    search,
    setSearch: (value) => {
      setSearchState(value);
      setPageState(1);
    },
    page: currentPage,
    pageCount,
    setPage: (value) => setPageState(Math.max(1, Math.min(Number(value) || 1, pageCount))),
    stats,
    retry: loadWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    managers,
    managersLoading,
    managersError,
    retryManagers: loadManagers,
    details,
    detailsLoading,
    detailsError,
    stock,
    stockError,
    loadDetails,
  };
}
