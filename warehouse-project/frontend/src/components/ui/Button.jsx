import { Link } from "react-router-dom";

const variants = {
  primary:
    "bg-primary-600 bg-gradient-to-r from-primary-600 to-accent/35 text-white shadow-lg shadow-primary-600/25 hover:from-primary-700 hover:to-accent/35 hover:shadow-primary-600/40 focus-visible:outline-primary-400",
  outline:
    "border border-white/20 bg-white/5 text-white hover:border-primary-300/50 hover:bg-primary-500/10 hover:text-primary-300 focus-visible:outline-primary-400",
  ghost:
    "text-current hover:bg-white/5 hover:text-primary-300 focus-visible:outline-primary-400",
};

export default function Button({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`;

  if (href?.startsWith("/")) {
    return (
      <Link to={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
