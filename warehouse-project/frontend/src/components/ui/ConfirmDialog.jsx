import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  busy = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
          <AlertTriangle size={20} aria-hidden="true" />
        </span>
        <p className="text-sm leading-6 text-slate-300">{description}</p>
      </div>
      <div className="mt-7 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-xl bg-error px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? "Deleting..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
