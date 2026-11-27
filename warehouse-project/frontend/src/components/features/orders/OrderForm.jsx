import { useMemo } from "react";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import ErrorState from "../../ui/ErrorState";
import Select from "../../ui/Select";
import Skeleton from "../../ui/Skeleton";
import Spinner from "../../ui/Spinner";

const orderFormSchema = z.object({
  warehouse: z.string().min(1, "Select a warehouse."),
  shippingAddress: z.string().trim().min(1, "Enter a shipping address.").max(500),
  note: z.string().max(500, "Note must be 500 characters or fewer."),
  items: z.array(z.object({
    product: z.string().min(1, "Choose a product."),
    quantity: z.string().regex(/^[1-9]\d*$/, "Enter a whole number greater than zero.").transform(Number),
  })).min(1, "Add at least one product."),
});

function getId(record) {
  return record?.id ?? record?._id ?? "";
}

export default function OrderForm({ products, warehouses, loading, error, onRetry, onSubmit }) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      warehouse: "",
      shippingAddress: "",
      note: "",
      items: [{ product: "", quantity: "1" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = useWatch({ control, name: "items" }) ?? [];
  const productById = useMemo(
    () => new Map(products.map((product) => [String(getId(product)), product])),
    [products],
  );
  const productOptions = products.map((product) => ({
    value: String(getId(product)),
    label: `${product?.name ?? "Product"}${product?.sku ? ` (${product.sku})` : ""}`,
  })).filter((option) => option.value);
  const warehouseOptions = warehouses.map((warehouse) => ({
    value: String(getId(warehouse)),
    label: warehouse?.name ?? warehouse?.code ?? String(getId(warehouse)),
  })).filter((option) => option.value);
  const total = watchedItems.reduce((sum, item) => {
    const product = productById.get(String(item?.product ?? ""));
    const quantity = Number(item?.quantity ?? 0);
    return sum + Number(product?.price ?? 0) * (Number.isFinite(quantity) ? quantity : 0);
  }, 0);

  async function submit(values) {
    const parsed = orderFormSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const fieldPath = issue.path.join(".");
        if (fieldPath) setError(fieldPath, { type: "validation", message: issue.message });
      });
      return;
    }
    try {
      await onSubmit({
        warehouse: parsed.data.warehouse,
        items: parsed.data.items.map(({ product, quantity }) => ({ product, quantity })),
        shippingAddress: parsed.data.shippingAddress,
        note: parsed.data.note,
      });
    } catch (requestError) {
      const message = requestError?.response?.data?.message ?? "Unable to place the order.";
      const details = requestError?.response?.data?.error?.details;
      const itemIndex = parsed.data.items.findIndex((item) => (
        !details?.product || String(item.product) === String(details.product)
      ));
      if (requestError?.response?.data?.error?.code === "INSUFFICIENT_STOCK" && itemIndex >= 0) {
        setError(`items.${itemIndex}.quantity`, {
          type: "server",
          message: `${message}. Available: ${Number(details?.available ?? 0)}.`,
        });
      } else {
        setError("root.server", { type: "server", message });
      }
    }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-14 w-full" /><Skeleton className="h-40 w-full" /><Skeleton className="h-28 w-full" /></div>;
  }
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      <section className="rounded-2xl border border-white/10 bg-surface p-4 sm:p-6">
        <h2 className="text-base font-semibold text-white">Order destination</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Select label="Warehouse" placeholder="Choose a warehouse" options={warehouseOptions} error={errors.warehouse?.message} disabled={isSubmitting} {...register("warehouse")} />
          <div>
            <label htmlFor="order-shipping-address" className="mb-1.5 block text-sm font-medium text-slate-300">Shipping address</label>
            <textarea id="order-shipping-address" rows={2} aria-invalid={Boolean(errors.shippingAddress)} disabled={isSubmitting} className="w-full rounded-xl border border-white/10 bg-elevated px-3.5 py-2.5 text-sm text-white outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30" {...register("shippingAddress")} />
            {errors.shippingAddress && <p className="mt-1.5 text-xs text-error">{errors.shippingAddress.message}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Products</h2>
            <p className="mt-1 text-xs text-slate-400">Inventory availability is validated by the order API for sales users.</p>
          </div>
          <button type="button" onClick={() => append({ product: "", quantity: "1" })} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-primary-400/20 px-3 text-sm font-medium text-primary-200 hover:bg-primary-500/10">
            <Plus size={16} aria-hidden="true" /> Add product
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {fields.map((field, index) => {
            const selectedProduct = productById.get(String(watchedItems[index]?.product ?? ""));
            return (
              <div key={field.id} className="grid gap-3 rounded-xl border border-white/10 bg-elevated/50 p-3 sm:grid-cols-[minmax(0,1fr)_120px_140px_40px] sm:items-end">
                <Select label="Product" placeholder="Choose a product" options={productOptions} error={errors.items?.[index]?.product?.message} disabled={isSubmitting} {...register(`items.${index}.product`)} />
                <div>
                  <label htmlFor={`order-quantity-${index}`} className="mb-1.5 block text-sm font-medium text-slate-300">Quantity</label>
                  <input id={`order-quantity-${index}`} type="number" min="1" step="1" inputMode="numeric" aria-invalid={Boolean(errors.items?.[index]?.quantity)} disabled={isSubmitting} className="min-h-11 w-full rounded-xl border border-white/10 bg-elevated px-3 text-sm text-white outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30" {...register(`items.${index}.quantity`)} />
                  {errors.items?.[index]?.quantity && <p className="mt-1 text-xs text-error">{errors.items[index].quantity.message}</p>}
                </div>
                <div>
                  <label htmlFor={`order-price-${index}`} className="mb-1.5 block text-sm font-medium text-slate-300">Unit price</label>
                  <input id={`order-price-${index}`} readOnly value={selectedProduct ? Number(selectedProduct.price ?? 0).toFixed(2) : ""} placeholder="Auto-filled" className="min-h-11 w-full rounded-xl border border-white/10 bg-elevated px-3 text-sm text-slate-300" />
                </div>
                <button type="button" onClick={() => remove(index)} disabled={fields.length <= 1 || isSubmitting} aria-label={`Remove product row ${index + 1}`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-error transition hover:bg-error/10 disabled:opacity-40">
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
        {errors.items?.message && <p className="mt-2 text-sm text-error">{errors.items.message}</p>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="text-sm text-slate-400">Order total</p>
          <p className="text-xl font-semibold text-white">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total)}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-surface p-4 sm:p-6">
        <label htmlFor="order-note" className="mb-1.5 block text-sm font-medium text-slate-300">Note <span className="font-normal text-slate-500">(optional)</span></label>
        <textarea id="order-note" rows={3} disabled={isSubmitting} className="w-full rounded-xl border border-white/10 bg-elevated px-3.5 py-2.5 text-sm text-white outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30" {...register("note")} />
        {errors.note && <p className="mt-1.5 text-xs text-error">{errors.note.message}</p>}
        {errors.root?.server && <p role="alert" className="mt-3 rounded-xl border border-error/20 bg-error/10 p-3 text-sm text-error">{errors.root.server.message}</p>}
        <div className="mt-5 flex justify-end">
          <button type="submit" disabled={isSubmitting || !products.length || !warehouses.length} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent px-5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50">
            {isSubmitting && <Spinner size={4} />}
            {isSubmitting ? "Placing order..." : "Place order"}
          </button>
        </div>
      </section>
    </form>
  );
}
