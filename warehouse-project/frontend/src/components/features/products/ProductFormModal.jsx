import { useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Modal from "../../ui/Modal";
import Select from "../../ui/Select";
import Spinner from "../../ui/Spinner";
import ImageUploader from "../../forms/ImageUploader";
import productService from "../../../services/productService.js";
import warehouseService from "../../../services/warehouseService.js";

const productSchema = z.object({
  name: z.string().trim().min(1, "Enter a product name."),
  sku: z.string().trim().min(1, "Enter a SKU."),
  category: z.string().trim().min(1, "Enter a category."),
  description: z.string().optional(),
  price: z.number({ error: "Enter a price." }).finite().min(0, "Price cannot be negative."),
  cost: z.number().finite().min(0, "Cost cannot be negative.").optional(),
  unit: z.string().trim().min(1, "Enter a unit."),
  lowStockThreshold: z.number().int().min(0, "Low stock limit cannot be negative.").optional(),
  supplier: z.string().optional(),
  warehouse: z.string().optional(),
  imageUrl: z.union([z.string().url("Enter a valid image URL."), z.literal("")]).optional(),
});

function resolver(values) {
  const parsed = productSchema.safeParse(values);
  if (parsed.success) return { values: parsed.data, errors: {} };

  const errors = {};
  parsed.error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field]) {
      errors[field] = { type: "validation", message: issue.message };
    }
  });
  return { values: {}, errors };
}

function productId(product) {
  return product?.id ?? product?._id ?? "";
}

function getBackendFieldError(error) {
  const message = error?.response?.data?.message ?? "";
  const details = error?.response?.data?.error?.details;
  if (error?.response?.status === 409 || /duplicate|already exists|sku/i.test(message)) {
    return { field: "sku", message: message || "This SKU is already in use." };
  }
  if (details && typeof details === "object") {
    const field = Object.keys(details)[0];
    const validFields = [
      "name", "sku", "category", "description", "price", "cost", "unit",
      "lowStockThreshold", "supplier", "warehouse", "imageUrl",
    ];
    if (validFields.includes(field)) {
      const detail = details[field];
      return {
        field,
        message: typeof detail === "string" ? detail : detail?.message ?? message,
      };
    }
  }
  return null;
}

function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs text-error">
          <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError) {
  return `h-11 w-full rounded-xl border bg-elevated px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-error/60 focus:ring-error/20"
      : "border-white/10 focus:border-primary-400/60 focus:ring-primary-500/30"
  }`;
}

export default function ProductFormModal({
  open,
  onClose,
  product,
  onSave,
  suppliers = [],
  suppliersLoading = false,
  suppliersError,
  onRetrySuppliers,
}) {
  const editing = Boolean(product);
  const [warehouses, setWarehouses] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState("");

  const defaultValues = useMemo(() => ({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    category: product?.category ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    cost: product?.cost ?? undefined,
    unit: product?.unit ?? "piece",
    lowStockThreshold: product?.lowStockThreshold ?? 10,
    supplier: typeof product?.supplier === "object"
      ? String(product.supplier?.id ?? product.supplier?._id ?? "")
      : String(product?.supplier ?? ""),
    warehouse: typeof product?.warehouse === "object"
      ? String(product.warehouse?.id ?? product.warehouse?._id ?? "")
      : String(product?.warehouse ?? ""),
    imageUrl: product?.imageUrl ?? "",
  }), [product]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues, resolver, mode: "onSubmit" });

  const imageUrl = watch("imageUrl") ?? "";

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
    setWarehousesError("");
  }, [open, defaultValues, reset]);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setWarehousesLoading(true);
    setWarehousesError("");
    warehouseService.getWarehouses()
      .then((result) => {
        if (active) setWarehouses(result.filter((entry) => entry?.isActive !== false));
      })
      .catch((error) => {
        if (active) {
          setWarehousesError(error?.response?.data?.message ?? error?.message ?? "Unable to load warehouses.");
        }
      })
      .finally(() => {
        if (active) setWarehousesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open]);

  const warehouseOptions = warehouses.map((entry) => {
    const id = entry?.id ?? entry?._id ?? "";
    const label = [entry?.name, entry?.code ?? entry?.address].filter(Boolean).join(" · ");
    return { value: String(id), label: label || "Warehouse" };
  }).filter((option) => option.value);
  const supplierOptions = suppliers.map((entry) => {
    const id = entry?.id ?? entry?._id ?? "";
    return { value: String(id), label: entry?.name ?? entry?.email ?? "Supplier" };
  }).filter((option) => option.value);

  async function submit(values) {
    clearErrors();
    const payload = {
      name: values.name.trim(),
      sku: values.sku.trim(),
      category: values.category.trim(),
      description: values.description?.trim() ?? "",
      price: Number(values.price),
      unit: values.unit.trim(),
      lowStockThreshold: values.lowStockThreshold,
      imageUrl: values.imageUrl || "",
    };
    if (values.cost !== undefined && values.cost !== null && values.cost !== "") {
      payload.cost = Number(values.cost);
    }
    if (values.supplier) payload.supplier = values.supplier;
    if (values.warehouse) payload.warehouse = values.warehouse;

    try {
      await onSave(payload, product);
      onClose();
    } catch (error) {
      const fieldError = getBackendFieldError(error);
      if (fieldError?.message) {
        setError(fieldError.field, { type: "server", message: fieldError.message });
      }
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit product" : "Add product"}
      description={editing ? "Update product details." : "Add a product to the catalog."}
      size="lg"
    >
      <form className="space-y-5" onSubmit={handleSubmit(submit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="product-name" error={errors.name?.message}>
            <input id="product-name" {...register("name")} className={inputClass(Boolean(errors.name))} placeholder="Product name" />
          </Field>
          <Field label="SKU" htmlFor="product-sku" error={errors.sku?.message}>
            <input id="product-sku" {...register("sku")} className={inputClass(Boolean(errors.sku))} placeholder="SKU-001" />
          </Field>
          <Field label="Category" htmlFor="product-category" error={errors.category?.message}>
            <input id="product-category" {...register("category")} className={inputClass(Boolean(errors.category))} placeholder="Category" />
          </Field>
          <Field label="Unit" htmlFor="product-unit" error={errors.unit?.message}>
            <input id="product-unit" {...register("unit")} className={inputClass(Boolean(errors.unit))} placeholder="piece" />
          </Field>
          <Field label="Price" htmlFor="product-price" error={errors.price?.message}>
            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              {...register("price", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
              className={inputClass(Boolean(errors.price))}
              placeholder="0.00"
            />
          </Field>
          <Field label="Cost (optional)" htmlFor="product-cost" error={errors.cost?.message}>
            <input
              id="product-cost"
              type="number"
              min="0"
              step="0.01"
              {...register("cost", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
              className={inputClass(Boolean(errors.cost))}
              placeholder="0.00"
            />
          </Field>
          <Field label="Low stock limit" htmlFor="product-low-stock" error={errors.lowStockThreshold?.message}>
            <input
              id="product-low-stock"
              type="number"
              min="0"
              step="1"
              {...register("lowStockThreshold", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
              className={inputClass(Boolean(errors.lowStockThreshold))}
            />
          </Field>
          <Select
            label="Supplier"
            {...register("supplier")}
            error={errors.supplier?.message}
            placeholder={suppliersLoading ? "Loading suppliers..." : "Unassigned"}
            options={supplierOptions}
            disabled={suppliersLoading}
          />
          <div className="sm:col-span-2">
            <Select
              label="Warehouse"
              {...register("warehouse")}
              error={errors.warehouse?.message}
              placeholder={warehousesLoading ? "Loading warehouses..." : "Unassigned"}
              options={warehouseOptions}
              disabled={warehousesLoading}
            />
            {warehousesError && (
              <div role="alert" className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-error">
                <span>{warehousesError}</span>
                <button
                  type="button"
                  onClick={() => {
                    setWarehousesError("");
                    setWarehousesLoading(true);
                    warehouseService.getWarehouses()
                      .then((result) => setWarehouses(result.filter((entry) => entry?.isActive !== false)))
                      .catch((error) => setWarehousesError(error?.response?.data?.message ?? error?.message ?? "Unable to load warehouses."))
                      .finally(() => setWarehousesLoading(false));
                  }}
                  className="inline-flex items-center gap-1 text-primary-300 hover:text-white"
                >
                  <RefreshCw size={13} aria-hidden="true" />
                  Retry
                </button>
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            <Field label="Description" htmlFor="product-description" error={errors.description?.message}>
              <textarea
                id="product-description"
                {...register("description")}
                rows={3}
                className={`w-full rounded-xl border bg-elevated px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${errors.description ? "border-error/60 focus:ring-error/20" : "border-white/10 focus:border-primary-400/60 focus:ring-primary-500/30"}`}
                placeholder="Product description (optional)"
              />
            </Field>
          </div>
        </div>

        {suppliersError && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-error/20 bg-error/5 px-3 py-2 text-xs text-error">
            <span>{suppliersError}</span>
            <button type="button" onClick={onRetrySuppliers} className="text-primary-300 hover:text-white">Retry</button>
          </div>
        )}

        <div>
          <ImageUploader
            label="Product image"
            value={imageUrl ? { url: imageUrl } : null}
            onChange={(uploaded) => {
              setValue("imageUrl", uploaded?.url ?? "", { shouldDirty: true, shouldValidate: true });
            }}
            onUpload={productService.uploadProductImage}
          />
          {errors.imageUrl?.message && <p role="alert" className="mt-1.5 text-xs text-error">{errors.imageUrl.message}</p>}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:from-primary-700 hover:to-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Spinner size={4} label="Saving product" />}
            {isSubmitting ? "Saving..." : editing ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
