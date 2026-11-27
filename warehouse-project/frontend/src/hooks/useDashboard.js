import { useCallback, useEffect, useState } from "react";
import adminService from "../services/adminService.js";
import orderService from "../services/orderService.js";
import productService from "../services/productService.js";
import stockService from "../services/stockService.js";
import supplyService from "../services/supplyService.js";
import userService from "../services/userService.js";
import warehouseService from "../services/warehouseService.js";
import { ROLES } from "../config/roles.js";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

export default function useDashboard(role) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (role === ROLES.ADMIN) {
        const [summary, users, warehouses, products, orders, stock, lowStock, transactions, supplyRequests] = await Promise.all([
          adminService.getDashboardSummary(),
          userService.getUsers(),
          warehouseService.getWarehouses(),
          productService.getProducts(),
          orderService.getOrders(),
          stockService.getStock(),
          adminService.getLowStock(),
          stockService.getTransactions(),
          supplyService.getSupplyRequests(),
        ]);
        setData({ summary, users, warehouses, products, orders, stock, lowStock, transactions, supplyRequests });
      } else if (role === ROLES.MANAGER) {
        const [summary, warehouses, products, orders, stock, lowStock, transactions, supplyRequests] = await Promise.all([
          adminService.getDashboardSummary(),
          warehouseService.getWarehouses(),
          productService.getProducts(),
          orderService.getOrders(),
          stockService.getStock(),
          adminService.getLowStock(),
          stockService.getTransactions(),
          supplyService.getSupplyRequests(),
        ]);
        setData({ summary, warehouses, products, orders, stock, lowStock, transactions, supplyRequests });
      } else if (role === ROLES.SUPPLIER) {
        const [products, supplyRequests] = await Promise.all([
          productService.getProducts(),
          supplyService.getMySupplyRequests(),
        ]);
        setData({ products, supplyRequests });
      } else if (role === ROLES.SALES) {
        setData({ orders: await orderService.getMyOrders() });
      } else {
        setData({});
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load dashboard data."));
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    retry: load,
    managerScopeWarning: role === ROLES.MANAGER,
  };
}
