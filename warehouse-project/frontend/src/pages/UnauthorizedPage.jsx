import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6 text-center text-white">
      <div className="max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary-300">
          Access denied
        </p>
        <h1 className="mt-3 text-3xl font-bold">
          You don’t have access to this page.
        </h1>
        <p className="mt-3 text-slate-400">
          Your account role does not allow this destination.
        </p>
        <Link
          to="/dashboard"
          className="mt-7 inline-flex rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
