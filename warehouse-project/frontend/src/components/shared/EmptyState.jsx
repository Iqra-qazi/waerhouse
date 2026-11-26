export default function EmptyState({
  title = "Coming soon",
  description = "This section is coming soon.",
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-surface px-6 py-14 text-center">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </section>
  );
}
