import { useEffect } from "react";
import { z } from "zod";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useForm } from "react-hook-form";
import Modal from "../../ui/Modal";
import Select from "../../ui/Select";
import Spinner from "../../ui/Spinner";

const movementSchema = z.object({
  warehouse: z.string().min(1, "Select a warehouse."),
  product: z.string().min(1, "Select a product."),
  quantity: z.string()
    .regex(/^[1-9]\d*$/, "Enter a whole number greater than zero.")
    .transform(Number),
  note: z.string().max(500, "Note must be 500 characters or fewer."),
});

function fieldErrors(parsed) {
  const errors = {};
  parsed.error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (field && !errors[field]) errors[field] = issue.message;
  });
  return errors;
}

export default function StockMovementModal({
  open,
  onClose,
  type = "stock-in",
  stock = [],
  productOptions = [],
  warehouseOptions = [],
  initialProduct = "",
  initialWarehouse = "",
  onSubmit,
}) {
  const isStockIn = type === "stock-in";
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      warehouse: initialWarehouse,
      product: initialProduct,
      quantity: "",
      note: "",
    },
  });
  const selectedProduct = watch("product");
  const selectedWarehouse = watch("warehouse");
  const available = Number(stock.find((entry) => (
    String(entry?.product?.id ?? entry?.product?._id ?? entry?.product) === String(selectedProduct) &&
    String(entry?.warehouse?.id ?? entry?.warehouse?._id ?? entry?.warehouse) === String(selectedWarehouse)
  ))?.quantity ?? 0);

  useEffect(() => {
    if (open) {
      reset({
        warehouse: initialWarehouse,
        product: initialProduct,
        quantity: "",
        note: "",
      });
    }
  }, [initialProduct, initialWarehouse, open, reset, type]);

  async function submit(values) {
    const parsed = movementSchema.safeParse(values);
    if (!parsed.success) {
      Object.entries(fieldErrors(parsed)).forEach(([field, message]) => {
        setError(field, { type: "validation", message });
      });
      return;
    }
    if (!isStockIn && parsed.data.quantity > available) {
      setError("quantity", {
        type: "available",
        message: `Only ${available} available in this warehouse.`,
      });
      return;
    }

    clearErrors();
    try {
      await onSubmit({
        product: parsed.data.product,
        warehouse: parsed.data.warehouse,
        quantity: parsed.data.quantity,
        reason: parsed.data.note,
      });
      onClose();
    } catch (requestError) {
      const message = requestError?.response?.data?.message ?? "Unable to update stock.";
      const details = requestError?.response?.data?.error?.details;
      const code = requestError?.response?.data?.error?.code;
      if (code === "INSUFFICIENT_STOCK") {
        const availableQuantity = details?.available;
        setError("quantity", {
          type: "server",
          message: Number.isFinite(Number(availableQuantity))
            ? `Only ${Number(availableQuantity)} available in this warehouse.`
            : message,
        });
      } else if (/product/i.test(message)) {
        setError("product", { type: "server", message });
      } else if (/warehouse|capacity|full/i.test(message)) {
        setError("warehouse", { type: "server", message });
      } else if (/quantity|integer|stock/i.test(message)) {
        setError("quantity", { type: "server", message });
      } else {
        setError("root.server", { type: "server", message });
      }
    }
  }

  const Icon = isStockIn ? ArrowDownToLine : ArrowUpFromLine;
  const movementLabel = isStockIn ? "Stock In" : "Stock Out";
  const actionClass = isStockIn
    ? "bg-accent text-white hover:bg-accent/90 focus-visible:outline-accent"
    : "bg-error text-white hover:bg-error/90 focus-visible:outline-error";

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      title={movementLabel}
      description={isStockIn ? "Add inventory to a warehouse." : "Remove inventory from a warehouse."}
      size="md"
    >
      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        <Select
          label="Warehouse"
          placeholder="Choose a warehouse"
          options={warehouseOptions}
          error={errors.warehouse?.message}
          disabled={isSubmitting}
          {...register("warehouse")}
        />
        <Select
          label="Product"
          placeholder="Choose a product"
          options={productOptions}
          error={errors.product?.message}
          disabled={isSubmitting}
          {...register("product")}
        />
        <div>
          <label htmlFor="stock-movement-quantity" className="mb-1.5 block text-sm font-medium text-slate-300">
            Quantity
          </label>
          <input
            id="stock-movement-quantity"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            aria-invalid={Boolean(errors.quantity)}
            disabled={isSubmitting}
            className="min-h-11 w-full rounded-xl border border-white/10 bg-elevated px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30 disabled:opacity-60"
            {...register("quantity")}
          />
          {!errors.quantity && (
            <p className="mt-1.5 text-xs text-slate-400">
              Available in this warehouse: {available.toLocaleString()}
            </p>
          )}
          {errors.quantity && <p className="mt-1.5 text-xs text-error">{errors.quantity.message}</p>}
        </div>
        <div>
          <label htmlFor="stock-movement-note" className="mb-1.5 block text-sm font-medium text-slate-300">
            Note <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <textarea
            id="stock-movement-note"
            rows={3}
            aria-invalid={Boolean(errors.note)}
            disabled={isSubmitting}
            className="w-full resize-y rounded-xl border border-white/10 bg-elevated px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30 disabled:opacity-60"
            {...register("note")}
          />
          {errors.note && <p className="mt-1.5 text-xs text-error">{errors.note.message}</p>}
        </div>
        {errors.root?.server && (
          <p role="alert" className="rounded-xl border border-error/20 bg-error/10 px-3.5 py-3 text-sm text-error">
            {errors.root.server.message}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="min-h-11 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${actionClass}`}
          >
            {isSubmitting ? <Spinner size={4} /> : <Icon size={16} aria-hidden="true" />}
            {isSubmitting ? "Saving..." : movementLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
