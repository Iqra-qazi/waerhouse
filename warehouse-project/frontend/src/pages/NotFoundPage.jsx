import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6 text-center text-white">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary-300">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold">Page not found</h1>
        <Link
          to="/"
          className="mt-7 inline-flex rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-primary-300/50 hover:bg-primary-500/10"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
