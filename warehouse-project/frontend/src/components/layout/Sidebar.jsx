import { NavLink } from "react-router-dom";
import { Warehouse, X } from "lucide-react";
import { navigationByRole } from "../../config/navigation";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const roleItems = navigationByRole[user?.role];
  const items = Array.isArray(roleItems) ? roleItems : [];

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-surface transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar"
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-3 text-lg font-bold text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent">
              <Warehouse size={21} aria-hidden="true" />
            </span>
            WareHub
          </a>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <nav
          className="flex-1 space-y-1 overflow-y-auto p-4"
          aria-label="Application navigation"
        >
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary-600/15 text-primary-300"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={19} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
