import PageHeader from "../../layout/PageHeader";
import ErrorState from "../../ui/ErrorState";
import Skeleton from "../../ui/Skeleton";

export default function DashboardFrame({ title, description, state, children }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      {state.error ? (
        <ErrorState message={state.error} onRetry={state.retry} />
      ) : state.loading ? (
        <div className="space-y-5" aria-label="Loading dashboard">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      ) : children}
    </>
  );
}
