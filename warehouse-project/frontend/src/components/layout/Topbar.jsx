import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import RoleBadge from "./RoleBadge";

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const name =
    typeof user?.name === "string" && user.name.trim() ? user.name.trim() : "User";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logout();
      toast.success("You have been logged out.");
    } catch (error) {
      toast.error(error.response?.data?.message || "You were signed out on this device.");
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-page/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="rounded-xl border border-white/10 p-2.5 text-slate-300 hover:bg-white/5 lg:hidden"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <p className="truncate text-lg font-semibold text-white">{title}</p>
      </div>
      <div className="relative ml-3">
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/5"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600/25 text-sm font-semibold text-primary-200">
            {initials}
          </span>
          <span className="min-w-0 text-left">
            <span className="block max-w-24 truncate text-xs font-medium text-white sm:max-w-40 sm:text-sm">
              {name}
            </span>
            <span className="mt-1 block">
              <RoleBadge role={user?.role} />
            </span>
          </span>
          <ChevronDown
            size={16}
            className="text-slate-400"
            aria-hidden="true"
          />
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-elevated p-2 shadow-xl shadow-black/30"
          >
            <Link
              to="/profile"
              role="menuitem"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              <UserRound size={17} aria-hidden="true" />
              Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut size={17} aria-hidden="true" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
