import { useState } from "react";
import ProductDetailsModal from "../components/features/products/ProductDetailsModal";
import ProductFilters from "../components/features/products/ProductFilters";
import ProductStatsCards from "../components/features/products/ProductStatsCards";
import ProductTable from "../components/features/products/ProductTable";
import PageHeader from "../components/layout/PageHeader";
import useProducts from "../hooks/useProducts";

export default function MyProductsPage() {
  const state = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <>
      <PageHeader title="My Products" description="Products associated with your supplier account." />
      <ProductStatsCards stats={state.stats} loading={state.loading} />
      <ProductFilters
        search={state.search}
        setSearch={state.setSearch}
        category={state.category}
        setCategory={state.setCategory}
        categories={state.categories}
        supplier={state.supplier}
        setSupplier={state.setSupplier}
        suppliers={state.supplierOptions}
      />
      <ProductTable
        products={state.products}
        suppliers={state.suppliers}
        loading={state.loading}
        error={state.error}
        onRetry={state.retry}
        canManageProducts={false}
        onView={(product) => {
          setSelectedProduct(product);
          state.loadProductDetails(product);
        }}
        allCount={state.allProducts.length}
        filteredCount={state.filteredCount}
        hasFilters={Boolean(state.search || state.category || state.supplier)}
        page={state.page}
        pageCount={state.pageCount}
        onPageChange={state.setPage}
      />
      <ProductDetailsModal
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        product={state.details ?? selectedProduct}
        loading={state.detailsLoading}
        error={state.detailsError}
        stock={state.stock}
        stockError={state.stockError}
        warehouseLookupError={state.warehouseLookupError}
        warehouses={state.warehouses}
        suppliers={state.suppliers}
        canViewProductStock={false}
        onRetry={() => selectedProduct && state.loadProductDetails(selectedProduct)}
      />
    </>
  );
}
