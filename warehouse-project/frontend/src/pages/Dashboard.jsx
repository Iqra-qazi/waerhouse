import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
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
    <main className="min-h-screen bg-page p-6 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">
          Welcome, {user.name} ({user.role})
        </h1>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-primary-300/50 hover:bg-primary-500/10 disabled:cursor-wait disabled:opacity-70"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </main>
  );
}
