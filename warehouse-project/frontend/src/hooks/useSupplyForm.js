import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService.js";
import warehouseService from "../services/warehouseService.js";

function getId(record) {
  if (record == null) return "";
  if (typeof record.toHexString === "function") return record.toHexString().toLowerCase();
  if (typeof record !== "object") return String(record).trim().toLowerCase();
  const nestedId = record._id ?? record.$oid ?? record.id;
  return nestedId == null || nestedId === record ? "" : getId(nestedId);
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

export default function useSupplyForm({ enabled = true } = {}) {
  const { user } = useAuth();
  const supplierId = getId(user);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const loadOptions = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const [productResult, warehouseResult] = await Promise.all([
        productService.getProducts(),
        warehouseService.getWarehouses(),
      ]);
      setProducts(productResult.filter((product) => (
        product?.isActive === true && getId(product?.supplier) === supplierId
      )));
      setWarehouses(warehouseResult.filter((warehouse) => warehouse?.isActive !== false));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load supply request options."));
    } finally {
      setLoading(false);
    }
  }, [enabled, supplierId]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return { products, warehouses, loading, error, retry: loadOptions };
}
