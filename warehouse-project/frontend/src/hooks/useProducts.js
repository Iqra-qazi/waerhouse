import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import usePermissions from "./usePermissions";
import { ROLES } from "../config/roles.js";
import userService from "../services/userService.js";
import productService from "../services/productService.js";
import stockService from "../services/stockService.js";
import warehouseService from "../services/warehouseService.js";

const PAGE_SIZE = 8;

function getId(record) {
  return record?.id ?? record?._id ?? "";
}

function getSupplierId(supplier) {
  if (supplier && typeof supplier === "object") return getId(supplier);
  return supplier ?? "";
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

function isProductSupplierMissing(product) {
  return !getSupplierId(product?.supplier);
}

export default function useProducts() {
  const { canManageProducts, canViewProductStock } = usePermissions();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearchState] = useState("");
  const [category, setCategoryState] = useState("");
  const [supplier, setSupplierState] = useState("");
  const [page, setPageState] = useState(1);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [stock, setStock] = useState([]);
  const [stockError, setStockError] = useState(null);
  const [warehouseLookupError, setWarehouseLookupError] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productService.getProducts();
      setProducts(result.filter((product) => product?.isActive !== false));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load products."));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSuppliers = useCallback(async () => {
    if (!canManageProducts) {
      setSuppliers([]);
      setSuppliersError(null);
      setSuppliersLoading(false);
      return;
    }
    setSuppliersLoading(true);
    setSuppliersError(null);
    try {
      const result = await userService.getUsers();
      setSuppliers(result.filter(
        (entry) => entry?.isActive !== false && entry?.role === ROLES.SUPPLIER,
      ));
    } catch (requestError) {
      setSuppliersError(getErrorMessage(requestError, "Unable to load suppliers."));
    } finally {
      setSuppliersLoading(false);
    }
  }, [canManageProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const categories = useMemo(() => (
    [...new Set(products.map((product) => String(product?.category ?? "").trim()).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right))
  ), [products]);

  const supplierOptions = useMemo(() => {
    const optionsById = new Map();
    suppliers.forEach((entry) => {
      const id = String(getId(entry));
      if (id) optionsById.set(id, { value: id, label: entry?.name ?? entry?.email ?? id });
    });
    products.forEach((product) => {
      const reference = product?.supplier;
      const id = String(getSupplierId(reference) ?? "");
      if (!id || optionsById.has(id)) return;
      const label = typeof reference === "object"
        ? reference?.name ?? reference?.email ?? id
        : id;
      optionsById.set(id, { value: id, label });
    });
    return [...optionsById.values()].sort((left, right) => left.label.localeCompare(right.label));
  }, [products, suppliers]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const searchable = [product?.name, product?.sku].filter(Boolean).join(" ").toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesCategory = !category || product?.category === category;
      const matchesSupplier = !supplier ||
        String(getSupplierId(product?.supplier)) === String(supplier);
      return matchesSearch && matchesCategory && matchesSupplier;
    });
  }, [products, search, category, supplier]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const stats = useMemo(() => ({
    total: products.length,
    categories: new Set(products.map((product) => String(product?.category ?? "").trim()).filter(Boolean)).size,
    withoutSupplier: products.filter(isProductSupplierMissing).length,
  }), [products]);

  const createProduct = useCallback(async (payload) => {
    try {
      await productService.createProduct(payload);
      toast.success("Product created successfully.");
      await loadProducts();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to create product."));
      throw requestError;
    }
  }, [loadProducts]);

  const updateProduct = useCallback(async (id, payload) => {
    try {
      await productService.updateProduct(id, payload);
      toast.success("Product updated successfully.");
      await loadProducts();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to update product."));
      throw requestError;
    }
  }, [loadProducts]);

  const deleteProduct = useCallback(async (product) => {
    const id = getId(product);
    try {
      await productService.deleteProduct(id);
      setProducts((current) => current.filter((entry) => getId(entry) !== id));
      toast.success("Product deactivated successfully.");
      return true;
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to delete product."));
      return false;
    }
  }, []);

  const loadProductDetails = useCallback(async (product) => {
    const id = getId(product);
    setDetails(null);
    setStock([]);
    setWarehouses([]);
    setDetailsError(null);
    setStockError(null);
    setWarehouseLookupError(null);
    setDetailsLoading(true);

    try {
      const record = await productService.getProduct(id);
      setDetails(record);
      if (!canViewProductStock) {
        setStockError("Stock details are restricted to administrators and warehouse managers.");
        return;
      }

      const [stockResult, warehouseResult] = await Promise.allSettled([
          stockService.getProductStock(id),
          warehouseService.getWarehouses(),
      ]);
      if (stockResult.status === "fulfilled") {
        setStock(stockResult.value);
      } else {
        setStockError(getErrorMessage(stockResult.reason, "Unable to load stock details."));
      }
      if (warehouseResult.status === "fulfilled") {
        setWarehouses(warehouseResult.value);
      } else {
        setWarehouseLookupError(
          getErrorMessage(warehouseResult.reason, "Unable to load warehouse names."),
        );
      }
    } catch (requestError) {
      setDetailsError(getErrorMessage(requestError, "Unable to load product details."));
    } finally {
      setDetailsLoading(false);
    }
  }, [canViewProductStock]);

  return {
    products: pageProducts,
    allProducts: products,
    filteredCount: filteredProducts.length,
    loading,
    error,
    search,
    setSearch: (value) => {
      setSearchState(value);
      setPageState(1);
    },
    category,
    setCategory: (value) => {
      setCategoryState(value);
      setPageState(1);
    },
    supplier,
    setSupplier: (value) => {
      setSupplierState(value);
      setPageState(1);
    },
    page: currentPage,
    pageCount,
    setPage: (value) => setPageState(Math.max(1, Math.min(Number(value) || 1, pageCount))),
    categories,
    supplierOptions,
    suppliers,
    suppliersLoading,
    suppliersError,
    retrySuppliers: loadSuppliers,
    stats,
    canManageProducts,
    canViewProductStock,
    retry: loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    details,
    detailsLoading,
    detailsError,
    stock,
    stockError,
    warehouseLookupError,
    warehouses,
    loadProductDetails,
  };
}
