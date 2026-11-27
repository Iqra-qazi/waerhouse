import { useCallback, useEffect, useMemo, useState } from "react";
import productService from "../services/productService.js";
import stockService from "../services/stockService.js";
import warehouseService from "../services/warehouseService.js";

function getId(record) {
  if (record && typeof record === "object") return String(record.id ?? record._id ?? "");
  return String(record ?? "");
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

export default function useMyWarehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [warehouseResult, stockResult, productResult] = await Promise.all([
        warehouseService.getWarehouses(),
        stockService.getStock(),
        productService.getProducts(),
      ]);
      setWarehouses(warehouseResult.filter((warehouse) => warehouse?.isActive !== false));
      setStock(stockResult);
      setProducts(productResult.filter((product) => product?.isActive !== false));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load warehouse information."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const warehouseCards = useMemo(() => warehouses.map((warehouse) => {
    const warehouseId = getId(warehouse);
    const warehouseStock = stock.filter((entry) => getId(entry?.warehouse) === warehouseId);
    const lowProductIds = new Set(warehouseStock.filter((entry) => {
      const threshold = Number(entry?.product?.lowStockThreshold ?? 10);
      return Number(entry?.quantity ?? 0) <= threshold;
    }).map((entry) => getId(entry?.product)).filter(Boolean));
    const productCount = products.filter((product) => getId(product?.warehouse) === warehouseId).length;
    return {
      ...warehouse,
      productCount,
      lowStockCount: lowProductIds.size,
      stockQuantity: warehouseStock.reduce((sum, entry) => sum + Number(entry?.quantity ?? 0), 0),
    };
  }), [products, stock, warehouses]);

  return { warehouses: warehouseCards, loading, error, retry: load };
}
