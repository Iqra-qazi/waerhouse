export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <article className="group rounded-2xl border border-white/10 bg-surface p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary-400/60 hover:shadow-xl hover:shadow-primary-600/10">
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent text-white shadow-lg shadow-primary-900/30 transition group-hover:shadow-primary-600/40">
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </article>
  );
}
