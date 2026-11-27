import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import ErrorState from "../../ui/ErrorState";
import Modal from "../../ui/Modal";
import Select from "../../ui/Select";
import Skeleton from "../../ui/Skeleton";
import Spinner from "../../ui/Spinner";

const formSchema = z.object({
  product: z.string().min(1, "Choose a product."),
  warehouse: z.string().min(1, "Choose a warehouse."),
  quantity: z.string().regex(/^[1-9]\d*$/, "Enter a whole number greater than zero.").transform(Number),
  note: z.string().max(500, "Note must be 500 characters or fewer."),
});

function getId(record) {
  return String(record?.id ?? record?._id ?? "");
}

export default function SupplyRequestForm({
  open,
  onClose,
  products,
  warehouses,
  loading,
  error,
  onRetry,
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { product: "", warehouse: "", quantity: "", note: "" } });
  const productOptions = products.map((product) => ({
    value: getId(product),
    label: `${product?.name ?? "Product"}${product?.sku ? ` (${product.sku})` : ""}`,
  })).filter((option) => option.value);
  const warehouseOptions = warehouses.map((warehouse) => ({
    value: getId(warehouse),
    label: warehouse?.name ?? warehouse?.code ?? getId(warehouse),
  })).filter((option) => option.value);

  useEffect(() => {
    if (open) reset({ product: "", warehouse: "", quantity: "", note: "" });
  }, [open, reset]);

  async function submit(values) {
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) setError(field, { type: "validation", message: issue.message });
      });
      return;
    }
    try {
      await onSubmit(parsed.data);
      onClose();
    } catch (requestError) {
      const message = requestError?.response?.data?.message ?? "Unable to submit supply request.";
      if (/product/i.test(message)) setError("product", { type: "server", message });
      else if (/warehouse/i.test(message)) setError("warehouse", { type: "server", message });
      else setError("quantity", { type: "server", message });
    }
  }

  return (
    <Modal open={open} onClose={() => !isSubmitting && onClose()} title="New Supply Request" description="Request a delivery for one of your products." size="md">
      {loading ? (
        <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-28 w-full" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <div>
            <Select label="Product" placeholder="Choose a product" options={productOptions} error={errors.product?.message} disabled={isSubmitting} {...register("product")} />
            {!productOptions.length && <p className="mt-1.5 text-xs text-slate-400">No active products are assigned to your supplier account.</p>}
          </div>
          <Select label="Warehouse" placeholder="Choose a warehouse" options={warehouseOptions} error={errors.warehouse?.message} disabled={isSubmitting} {...register("warehouse")} />
          <div>
            <label htmlFor="supply-quantity" className="mb-1.5 block text-sm font-medium text-slate-300">Quantity</label>
            <input id="supply-quantity" type="number" min="1" step="1" inputMode="numeric" disabled={isSubmitting} aria-invalid={Boolean(errors.quantity)} className="min-h-11 w-full rounded-xl border border-white/10 bg-elevated px-3.5 text-sm text-white outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30" {...register("quantity")} />
            {errors.quantity && <p className="mt-1.5 text-xs text-error">{errors.quantity.message}</p>}
          </div>
          <div>
            <label htmlFor="supply-note" className="mb-1.5 block text-sm font-medium text-slate-300">Note <span className="font-normal text-slate-500">(optional)</span></label>
            <textarea id="supply-note" rows={3} disabled={isSubmitting} className="w-full rounded-xl border border-white/10 bg-elevated px-3.5 py-2.5 text-sm text-white outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30" {...register("note")} />
            {errors.note && <p className="mt-1.5 text-xs text-error">{errors.note.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="min-h-11 rounded-xl border border-white/10 px-4 text-sm text-slate-300 hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={isSubmitting || !productOptions.length || !warehouseOptions.length} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent px-4 text-sm font-semibold text-white disabled:opacity-50">
              {isSubmitting && <Spinner size={4} />} Submit request
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
