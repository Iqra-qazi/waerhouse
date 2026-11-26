import { FilterX } from "lucide-react";
import SearchInput from "../../ui/SearchInput";
import Select from "../../ui/Select";
import { ROLE_LABELS, ROLES } from "../../../config/roles.js";

const roleOptions = [
  { value: ROLES.ADMIN, label: ROLE_LABELS[ROLES.ADMIN] },
  { value: ROLES.MANAGER, label: ROLE_LABELS[ROLES.MANAGER] },
  { value: ROLES.SUPPLIER, label: ROLE_LABELS[ROLES.SUPPLIER] },
  { value: ROLES.SALES, label: ROLE_LABELS[ROLES.SALES] },
];

export default function UserFilters({ search, setSearch, role, setRole }) {
  const hasFilters = Boolean(search || role);

  return (
    <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface p-4 sm:flex-row sm:items-center">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search name, email, or phone"
        className="min-w-0 flex-1"
      />
      <Select
        aria-label="Filter by role"
        value={role}
        onChange={(event) => setRole(event.target.value)}
        placeholder="All roles"
        options={roleOptions}
        className="w-full sm:w-56"
      />
      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setRole("");
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
