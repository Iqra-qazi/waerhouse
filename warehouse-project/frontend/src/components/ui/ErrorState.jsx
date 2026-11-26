import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
        <AlertCircle size={22} aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {message && <p className="mt-2 max-w-md text-sm text-slate-400">{message}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-primary-400/50 hover:bg-primary-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
        >
          <RefreshCw size={15} aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
