import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import orderService from "../services/orderService.js";
import productService from "../services/productService.js";
import warehouseService from "../services/warehouseService.js";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

export default function useOrderForm() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productResult, warehouseResult] = await Promise.all([
        productService.getProducts(),
        warehouseService.getWarehouses(),
      ]);
      setProducts(productResult.filter((product) => product?.isActive !== false));
      setWarehouses(warehouseResult.filter((warehouse) => warehouse?.isActive !== false));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load order options."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const createOrder = useCallback(async (payload) => {
    try {
      const order = await orderService.createOrder(payload);
      toast.success("Order placed successfully.");
      return order;
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to place order."));
      throw requestError;
    }
  }, []);

  return { products, warehouses, loading, error, retry: loadCatalog, createOrder };
}
