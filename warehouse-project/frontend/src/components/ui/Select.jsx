export default function Select({
  label,
  error,
  options = [],
  placeholder,
  className = "",
  id,
  ...props
}) {
  const selectId = id ?? props.name;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        className="min-h-11 w-full rounded-xl border border-white/10 bg-elevated px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
}
