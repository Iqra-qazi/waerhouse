const variants = {
  neutral: "border-white/10 bg-white/5 text-slate-300",
  primary: "border-primary-400/30 bg-primary-500/10 text-primary-200",
  success: "border-accent/20 bg-accent/10 text-accent",
  warning: "border-primary-300/20 bg-primary-300/10 text-primary-200",
  danger: "border-error/20 bg-error/10 text-error",
};

export default function Badge({ children, variant = "neutral", className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${variants[variant] ?? variants.neutral} ${className}`}>
      {children}
    </span>
  );
}
