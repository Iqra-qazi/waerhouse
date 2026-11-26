import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import Pagination from "../ui/Pagination";
import Skeleton from "../ui/Skeleton";

export default function DataTable({
  columns = [],
  rows = [],
  getRowId,
  loading = false,
  error,
  onRetry,
  emptyTitle = "No results found",
  emptyDescription,
  emptyAction,
  pagination,
  rowActions,
}) {
  const hasActions = typeof rowActions === "function";
  const columnCount = Math.max(1, columns.length + Number(hasActions));

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.025] text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} scope="col" className="whitespace-nowrap px-4 py-3.5 font-medium">
                      {column.header}
                    </th>
                  ))}
                  {hasActions && <th scope="col" className="px-4 py-3.5 text-right font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07]">
                {loading
                  ? Array.from({ length: 5 }, (_, rowIndex) => (
                    <tr key={`skeleton-${rowIndex}`}>
                      {Array.from({ length: columnCount }, (_, columnIndex) => (
                        <td key={`skeleton-${rowIndex}-${columnIndex}`} className="px-4 py-4">
                          <Skeleton className="h-5 w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                  : rows.map((row, rowIndex) => (
                    <tr key={getRowId?.(row) ?? row?.id ?? row?._id ?? rowIndex} className="transition hover:bg-white/[0.025]">
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-4 text-slate-300">
                          {column.render ? column.render(row) : row?.[column.key] ?? "—"}
                        </td>
                      ))}
                      {hasActions && (
                        <td className="px-4 py-4 text-right">{rowActions(row)}</td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {!loading && rows.length === 0 && (
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              action={emptyAction}
            />
          )}
          {pagination && !loading && rows.length > 0 && (
            <Pagination {...pagination} />
          )}
        </>
      )}
    </section>
  );
}
