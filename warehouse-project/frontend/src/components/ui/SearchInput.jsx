import { Search, X } from "lucide-react";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className = "",
}) {
  return (
    <label className={`relative block ${className}`}>
      <Search
        size={17}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-white/10 bg-elevated pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-primary-400/60 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-white"
        >
          <X size={15} aria-hidden="true" />
        </button>
      )}
    </label>
  );
}
