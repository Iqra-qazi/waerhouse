import { AlertCircle } from "lucide-react";

export default function AuthField({
  id,
  label,
  placeholder,
  type = "text",
  icon: Icon,
  autoComplete,
  children,
  error,
  registration,
}) {
  const controlClass =
    "w-full rounded-xl border border-white/10 bg-elevated py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-primary-400/70 focus:ring-2 focus:ring-primary-400/25";

  return (
    <label htmlFor={id} className="block text-sm font-medium text-slate-200">
      {label}
      <span className="auth-input-wrap relative mt-2 block">
        <Icon
          className="auth-input-icon pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors"
          size={17}
          aria-hidden="true"
        />
        {children || (
          <input
            id={id}
            name={id}
            type={type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            {...registration}
            className={controlClass}
          />
        )}
      </span>
      {error && (
        <span role="alert" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-error">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </span>
      )}
    </label>
  );
}
