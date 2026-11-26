export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  light = false,
  align = "center",
}) {
  return (
    <div
      className={`mx-auto max-w-2xl ${
        align === "left" ? "text-left" : "text-center"
      }`}
    >
      {eyebrow && (
        <p
          className={`mb-3 text-xs font-bold uppercase tracking-[0.2em] ${
            light ? "text-primary-300" : "text-primary-400"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
