import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../config/roles.js";
import productService from "../services/productService.js";
import stockService from "../services/stockService.js";
import warehouseService from "../services/warehouseService.js";

const PAGE_SIZE = 8;

function getId(record) {
  if (record && typeof record === "object") return String(record.id ?? record._id ?? "");
  return String(record ?? "");
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

function getThreshold(product) {
  return Number(product?.lowStockThreshold ?? 10);
}

function getStockState(entry) {
  const quantity = Number(entry?.quantity ?? 0);
  if (quantity <= 0) return "out";
  return quantity <= getThreshold(entry?.product) ? "low" : "in";
}

export default function useStock() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [stock, setStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearchState] = useState("");
  const [warehouse, setWarehouseState] = useState(() => searchParams.get("warehouse") ?? "");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPageState] = useState(1);

  const loadStock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stockResult, productResult, warehouseResult] = await Promise.all([
        stockService.getStock(),
        productService.getProducts(),
        warehouseService.getWarehouses(),
      ]);
      setStock(stockResult);
      setProducts(productResult.filter((product) => product?.isActive !== false));
      setWarehouses(warehouseResult.filter((entry) => entry?.isActive !== false));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load stock."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStock();
  }, [loadStock]);

  useEffect(() => {
    const warehouseId = searchParams.get("warehouse");
    if (warehouseId) setWarehouseState(warehouseId);
  }, [searchParams]);

  const normalizedStock = useMemo(() => {
    const productsById = new Map(products.map((product) => [getId(product), product]));
    const warehousesById = new Map(warehouses.map((entry) => [getId(entry), entry]));
    return stock.map((entry) => ({
      ...entry,
      product: typeof entry?.product === "object"
        ? entry.product
        : productsById.get(getId(entry?.product)),
      warehouse: typeof entry?.warehouse === "object"
        ? entry.warehouse
        : warehousesById.get(getId(entry?.warehouse)),
    }));
  }, [products, stock, warehouses]);

  const filteredStock = useMemo(() => {
    const query = search.trim().toLowerCase();
    return normalizedStock.filter((entry) => {
      const matchesSearch = !query || [
        entry?.product?.name,
        entry?.product?.sku,
      ].filter(Boolean).join(" ").toLowerCase().includes(query);
      const matchesWarehouse = !warehouse || getId(entry?.warehouse) === String(warehouse);
      const matchesLow = !lowStockOnly || getStockState(entry) === "low";
      return matchesSearch && matchesWarehouse && matchesLow;
    });
  }, [lowStockOnly, normalizedStock, search, warehouse]);

  const pageCount = Math.max(1, Math.ceil(filteredStock.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStock = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStock.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredStock]);

  const stats = useMemo(() => {
    const productIds = new Set();
    const lowProductIds = new Set();
    const outProductIds = new Set();
    let totalQuantity = 0;

    normalizedStock.forEach((entry) => {
      const id = getId(entry?.product);
      if (id) productIds.add(id);
      totalQuantity += Number(entry?.quantity ?? 0);
      if (getStockState(entry) === "low" && id) lowProductIds.add(id);
      if (getStockState(entry) === "out" && id) outProductIds.add(id);
    });

    return {
      totalQuantity,
      differentProducts: productIds.size,
      lowStockProducts: lowProductIds.size,
      outOfStockProducts: outProductIds.size,
    };
  }, [normalizedStock]);

  const moveStock = useCallback(async (type, payload) => {
    try {
      if (type === "stock-in") {
        await stockService.stockIn(payload);
      } else {
        await stockService.stockOut(payload);
      }
      toast.success(type === "stock-in" ? "Stock added successfully." : "Stock removed successfully.");
      await loadStock();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to update stock."));
      throw requestError;
    }
  }, [loadStock]);

  const productOptions = useMemo(
    () => products.map((product) => ({
      value: getId(product),
      label: `${product?.name ?? "Unnamed product"}${product?.sku ? ` (${product.sku})` : ""}`,
    })).filter((option) => option.value),
    [products],
  );
  const warehouseOptions = useMemo(
    () => warehouses.map((entry) => ({
      value: getId(entry),
      label: entry?.name ?? entry?.code ?? getId(entry),
    })).filter((option) => option.value),
    [warehouses],
  );

  return {
    stock: pageStock,
    allStock: normalizedStock,
    filteredCount: filteredStock.length,
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
    lowStockOnly,
    setLowStockOnly: (value) => {
      setLowStockOnly(value);
      setPageState(1);
    },
    page: currentPage,
    pageCount,
    setPage: (value) => setPageState(Math.max(1, Math.min(Number(value) || 1, pageCount))),
    stats,
    products,
    warehouses,
    productOptions,
    warehouseOptions,
    managerScopeWarning: user?.role === ROLES.MANAGER,
    retry: loadStock,
    moveStock,
  };
}
