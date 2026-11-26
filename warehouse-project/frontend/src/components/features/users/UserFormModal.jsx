import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../ui/Modal";
import Select from "../../ui/Select";
import Spinner from "../../ui/Spinner";
import ImageUploader from "../../forms/ImageUploader";
import userService from "../../../services/userService.js";
import warehouseService from "../../../services/warehouseService.js";
import { ROLE_LABELS, ROLES } from "../../../config/roles.js";

const roleOptions = [
  { value: ROLES.ADMIN, label: ROLE_LABELS[ROLES.ADMIN] },
  { value: ROLES.MANAGER, label: ROLE_LABELS[ROLES.MANAGER] },
  { value: ROLES.SUPPLIER, label: ROLE_LABELS[ROLES.SUPPLIER] },
  { value: ROLES.SALES, label: ROLE_LABELS[ROLES.SALES] },
];

const schema = z.object({
  name: z.string().trim().min(2, "Enter a name with at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().max(30, "Phone number is too long.").optional().or(z.literal("")),
  role: z.enum([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPPLIER, ROLES.SALES], {
    error: "Select a role.",
  }),
  password: z.string().optional(),
  assignedWarehouses: z.array(z.string()).default([]),
});

function createResolver(editing) {
  return async (values) => {
    const result = schema.safeParse(values);
    const errors = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !errors[field]) {
          errors[field] = { type: "validation", message: issue.message };
        }
      }
    }

    if (!editing && !values.password) {
      errors.password = { type: "validation", message: "Password is required." };
    } else if (values.password && values.password.length < 8) {
      errors.password = { type: "validation", message: "Use at least 8 characters." };
    }

    return Object.keys(errors).length
      ? { values: {}, errors }
      : { values: result.data, errors: {} };
  };
}

function getUserId(user) {
  return user?.id ?? user?._id ?? "";
}

function normalizedWarehouseIds(warehouses) {
  if (!Array.isArray(warehouses)) return [];
  return warehouses.map((warehouse) => {
    if (warehouse && typeof warehouse === "object") {
      return String(warehouse.id ?? warehouse._id ?? "");
    }
    return String(warehouse);
  }).filter(Boolean).sort();
}

function backendFieldError(error) {
  const details = error?.response?.data?.error?.details;
  const message = error?.response?.data?.message ?? "";
  if (error?.response?.status === 409 || /duplicate|already exists|email/i.test(message)) {
    return { field: "email", message: message || "An account with this email already exists." };
  }
  if (details && typeof details === "object") {
    const firstField = Object.keys(details)[0];
    if (["name", "email", "phone", "role", "password"].includes(firstField)) {
      const detail = details[firstField];
      return {
        field: firstField,
        message: typeof detail === "string" ? detail : detail?.message ?? message,
      };
    }
  }
  return null;
}

export default function UserFormModal({ open, onClose, user, onSave }) {
  const editing = Boolean(user);
  const [warehouses, setWarehouses] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState("");
  const [uploadedImage, setUploadedImage] = useState(
    user?.image || user?.imageUrl
      ? { url: user.image ?? user.imageUrl, fileId: user.imageFileId ?? "" }
      : null,
  );

  const defaultValues = useMemo(() => ({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    role: user?.role ?? "",
    password: "",
    assignedWarehouses: normalizedWarehouseIds(user?.assignedWarehouses),
  }), [user]);
  const validationResolver = useMemo(() => createResolver(editing), [editing]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues, resolver: validationResolver, mode: "onSubmit" });

  const selectedRole = watch("role");
  const selectedWarehouseIds = watch("assignedWarehouses") ?? [];

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
    setUploadedImage(
      user?.image || user?.imageUrl
        ? { url: user.image ?? user.imageUrl, fileId: user.imageFileId ?? "" }
        : null,
    );
    setWarehousesError("");
  }, [open, user, defaultValues, reset]);

  useEffect(() => {
    if (!open || selectedRole !== ROLES.MANAGER) return undefined;
    let active = true;
    setWarehousesLoading(true);
    setWarehousesError("");
    warehouseService.getWarehouses()
      .then((result) => {
        if (active) setWarehouses(result);
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
  }, [open, selectedRole]);

  async function submit(values) {
    clearErrors("email");
    const existingWarehouseIds = normalizedWarehouseIds(user?.assignedWarehouses);
    const submittedWarehouseIds = normalizedWarehouseIds(values.assignedWarehouses);
    const assignmentChanged =
      values.role === ROLES.MANAGER &&
      JSON.stringify(existingWarehouseIds) !== JSON.stringify(submittedWarehouseIds);

    if (assignmentChanged) {
      const message = "Warehouse assignments cannot be saved: the backend guide does not document this user field.";
      setError("assignedWarehouses", { type: "server", message });
      toast.error(message);
      return;
    }

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() ?? "",
      role: values.role,
    };
    if (values.password) payload.password = values.password;

    try {
      await onSave(payload, user);
      onClose();
    } catch (error) {
      const fieldError = backendFieldError(error);
      if (fieldError?.message) {
        setError(fieldError.field, { type: "server", message: fieldError.message });
      }
    }
  }

  const warehouseOptions = warehouses.map((warehouse) => ({
    value: String(warehouse?.id ?? warehouse?._id ?? ""),
    label: [warehouse?.name, warehouse?.code].filter(Boolean).join(" · ") || "Warehouse",
  })).filter((option) => option.value);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit user" : "Add user"}
      description={editing ? "Update the account details below." : "Create a user account."}
      size="lg"
    >
      <form className="space-y-5" onSubmit={handleSubmit(submit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="user-name" error={errors.name?.message}>
            <input
              id="user-name"
              {...register("name")}
              autoComplete="name"
              className={inputClass(Boolean(errors.name))}
              placeholder="Full name"
            />
          </Field>
          <Field label="Email" htmlFor="user-email" error={errors.email?.message}>
            <input
              id="user-email"
              {...register("email")}
              type="email"
              autoComplete="email"
              className={inputClass(Boolean(errors.email))}
              placeholder="name@example.com"
            />
          </Field>
          <Field label="Phone" htmlFor="user-phone" error={errors.phone?.message}>
            <input
              id="user-phone"
              {...register("phone")}
              type="tel"
              autoComplete="tel"
              className={inputClass(Boolean(errors.phone))}
              placeholder="Phone number (optional)"
            />
          </Field>
          <Select
            label="Role"
            {...register("role")}
            error={errors.role?.message}
            placeholder="Select a role"
            options={roleOptions}
          />
          <div className="sm:col-span-2">
            <Field
              label="Password"
              htmlFor="user-password"
              error={errors.password?.message}
              hint={editing ? "Leave blank to keep current." : "At least 8 characters."}
            >
              <input
                id="user-password"
                {...register("password")}
                type="password"
                autoComplete="new-password"
                className={inputClass(Boolean(errors.password))}
                placeholder={editing ? "Optional" : "Set a password"}
              />
            </Field>
          </div>
        </div>

        {selectedRole === ROLES.MANAGER && (
          <div>
            <label htmlFor="assignedWarehouses" className="mb-1.5 block text-sm font-medium text-slate-300">
              Assign warehouses
            </label>
            <Select
              id="assignedWarehouses"
              multiple
              value={selectedWarehouseIds}
              onChange={(event) => {
                setValue(
                  "assignedWarehouses",
                  Array.from(event.target.selectedOptions, (option) => option.value),
                  { shouldDirty: true, shouldValidate: true },
                );
                clearErrors("assignedWarehouses");
              }}
              options={warehouseOptions}
              disabled={warehousesLoading || Boolean(warehousesError)}
              className="min-h-32 [&_select]:min-h-32"
              aria-describedby="warehouse-help"
            />
            <p id="warehouse-help" className="mt-1.5 text-xs text-slate-500">
              Select one or more warehouses. Use Ctrl/Command to select multiple.
            </p>
            {warehousesLoading && <p className="mt-1 text-xs text-slate-400">Loading warehouses...</p>}
            {warehousesError && (
              <p role="alert" className="mt-1 text-xs text-error">
                {warehousesError}
              </p>
            )}
            {errors.assignedWarehouses?.message && (
              <p role="alert" className="mt-1 flex items-start gap-1.5 text-xs text-error">
                <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                {errors.assignedWarehouses.message}
              </p>
            )}
            <p className="mt-2 rounded-lg border border-primary-300/20 bg-primary-500/5 px-3 py-2 text-xs leading-5 text-primary-200">
              The backend API guide does not document saving warehouse assignments on a user. Changed assignments cannot be submitted.
            </p>
          </div>
        )}

        <div>
          <ImageUploader
            value={uploadedImage}
            onChange={setUploadedImage}
            onUpload={userService.uploadUserImage}
          />
          <p className="mt-2 rounded-lg border border-primary-300/20 bg-primary-500/5 px-3 py-2 text-xs leading-5 text-primary-200">
            The image upload endpoint is available, but the backend guide does not document storing image fields on a user. Uploads are preview-only here.
          </p>
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
            className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:from-primary-700 hover:to-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Spinner size={4} label="Saving user" />}
            {isSubmitting ? "Saving..." : editing ? "Save changes" : "Create user"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
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
