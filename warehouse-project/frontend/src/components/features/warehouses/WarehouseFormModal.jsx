import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../ui/Modal";
import Select from "../../ui/Select";
import Spinner from "../../ui/Spinner";

const schema = z.object({
  name: z.string().trim().min(2, "Enter a warehouse name."),
  code: z.string()
    .trim()
    .min(2, "Enter a warehouse code.")
    .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, "Use letters, numbers, hyphens, or underscores.")
    .transform((value) => value.toUpperCase()),
  address: z.string().trim().min(2, "Enter a warehouse address."),
  manager: z.string().optional().or(z.literal("")),
});

function createResolver() {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) return { values: result.data, errors: {} };

    const errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !errors[field]) {
        errors[field] = { type: "validation", message: issue.message };
      }
    }
    return { values: {}, errors };
  };
}

function getId(record) {
  return record?.id ?? record?._id ?? "";
}

function managerId(manager) {
  if (manager && typeof manager === "object") return getId(manager);
  return manager ?? "";
}

function backendFieldError(error) {
  const message = error?.response?.data?.message ?? "";
  const details = error?.response?.data?.error?.details;
  if (error?.response?.status === 409 || /duplicate|already exists/i.test(message)) {
    return { field: "code", message: message || "This warehouse code already exists." };
  }
  if (details && typeof details === "object") {
    const field = Object.keys(details).find((key) => ["name", "code", "address", "manager"].includes(key));
    if (field) {
      const detail = details[field];
      return {
        field,
        message: typeof detail === "string" ? detail : detail?.message ?? message,
      };
    }
  }
  return null;
}

export default function WarehouseFormModal({
  open,
  onClose,
  warehouse,
  managers = [],
  managersLoading,
  managersError,
  onRetryManagers,
  onSave,
}) {
  const editing = Boolean(warehouse);
  const defaultValues = useMemo(() => ({
    name: warehouse?.name ?? "",
    code: warehouse?.code ?? "",
    address: warehouse?.address ?? "",
    manager: String(managerId(warehouse?.manager)),
  }), [warehouse]);
  const resolver = useMemo(createResolver, []);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues, resolver, mode: "onSubmit" });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      clearErrors();
    }
  }, [open, defaultValues, reset, clearErrors]);

  async function submit(values) {
    const originalManager = String(managerId(warehouse?.manager));
    const nextManager = values.manager ?? "";
    if (editing && originalManager && !nextManager) {
      const message = "The API guide does not document clearing a warehouse manager.";
      setError("manager", { type: "server", message });
      toast.error(message);
      return;
    }

    const payload = {
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      address: values.address.trim(),
    };
    if (nextManager) payload.manager = nextManager;

    try {
      await onSave(payload, warehouse);
      onClose();
    } catch (error) {
      const fieldError = backendFieldError(error);
      if (fieldError?.message) setError(fieldError.field, { type: "server", message: fieldError.message });
    }
  }

  const managerOptions = managers.map((manager) => ({
    value: String(getId(manager)),
    label: manager?.name
      ? `${manager.name}${manager.email ? ` · ${manager.email}` : ""}`
      : String(manager?.email ?? "Manager"),
  })).filter((option) => option.value);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit warehouse" : "Add warehouse"}
      description={editing ? "Update the warehouse details." : "Add a location to your warehouse network."}
      size="md"
    >
      <form className="space-y-5" onSubmit={handleSubmit(submit)}>
        <Field label="Warehouse name" htmlFor="warehouse-name" error={errors.name?.message}>
          <input
            id="warehouse-name"
            {...register("name")}
            placeholder="e.g. West Distribution Center"
            className={inputClass(Boolean(errors.name))}
          />
        </Field>
        <Field label="Warehouse code" htmlFor="warehouse-code" error={errors.code?.message}>
          <input
            id="warehouse-code"
            {...register("code")}
            placeholder="e.g. WEST"
            autoCapitalize="characters"
            className={inputClass(Boolean(errors.code))}
          />
        </Field>
        <Field label="Address" htmlFor="warehouse-address" error={errors.address?.message}>
          <input
            id="warehouse-address"
            {...register("address")}
            placeholder="Street address"
            autoComplete="street-address"
            className={inputClass(Boolean(errors.address))}
          />
        </Field>

        <Select
          label="Manager"
          {...register("manager")}
          error={errors.manager?.message}
          placeholder="Unassigned"
          options={managerOptions}
          disabled={managersLoading || Boolean(managersError)}
        />
        {managersLoading && <p className="-mt-3 text-xs text-slate-500">Loading managers...</p>}
        {managersError && (
          <div className="-mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span role="alert" className="text-error">{managersError}</span>
            <button type="button" onClick={onRetryManagers} className="inline-flex items-center gap-1 text-primary-300 hover:text-white">
              <RefreshCw size={13} aria-hidden="true" />
              Retry
            </button>
          </div>
        )}
        {!managersLoading && !managersError && managers.length === 0 && (
          <p className="-mt-3 text-xs text-slate-500">
            No active users with the backend role “manager” were found. The manager list is filtered from the documented users list.
          </p>
        )}
        <p className="-mt-2 rounded-lg border border-primary-300/20 bg-primary-500/5 px-3 py-2 text-xs leading-5 text-primary-200">
          The API guide documents the warehouse manager reference only; it does not document synchronizing a user&apos;s assigned warehouses.
        </p>

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
            {isSubmitting && <Spinner size={4} label="Saving warehouse" />}
            {isSubmitting ? "Saving..." : editing ? "Save changes" : "Create warehouse"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, htmlFor, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      {children}
      {error && <p role="alert" className="mt-1.5 text-xs text-error">{error}</p>}
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
