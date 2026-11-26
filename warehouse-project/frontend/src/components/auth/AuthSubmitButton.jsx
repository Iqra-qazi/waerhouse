import { ArrowRight, LoaderCircle } from "lucide-react";

export default function AuthSubmitButton({ label, loading = false }) {
  const Icon = loading ? LoaderCircle : ArrowRight;

  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 bg-gradient-to-r from-primary-600 to-accent/35 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-900/25 transition hover:from-primary-700 hover:to-accent/35 hover:shadow-primary-700/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 disabled:cursor-wait disabled:opacity-80"
    >
      {loading && <span className="sr-only">Loading</span>}
      {label}
      <Icon
        size={17}
        aria-hidden="true"
        className={loading ? "animate-spin" : ""}
      />
    </button>
  );
}
