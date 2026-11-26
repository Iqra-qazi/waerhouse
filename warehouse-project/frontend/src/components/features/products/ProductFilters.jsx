import { FilterX } from "lucide-react";
import SearchInput from "../../ui/SearchInput";
import Select from "../../ui/Select";

export default function ProductFilters({
  search,
  setSearch,
  category,
  setCategory,
  categories = [],
  supplier,
  setSupplier,
  suppliers = [],
}) {
  const hasFilters = Boolean(search || category || supplier);

  return (
    <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface p-4 lg:flex-row lg:items-center">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search product name or SKU"
        className="min-w-0 flex-1"
      />
      <Select
        aria-label="Filter by category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        placeholder="All categories"
        options={categories.map((value) => ({ value, label: value }))}
        className="w-full lg:w-52"
      />
      <Select
        aria-label="Filter by supplier"
        value={supplier}
        onChange={(event) => setSupplier(event.target.value)}
        placeholder="All suppliers"
        options={suppliers}
        className="w-full lg:w-60"
      />
      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setCategory("");
            setSupplier("");
          }}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-300 transition hover:border-primary-400/40 hover:text-white"
        >
          <FilterX size={16} aria-hidden="true" />
          Clear
        </button>
      )}
    </section>
  );
}
