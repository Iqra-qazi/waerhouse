import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { navigationByRole } from "../../config/navigation";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const roleItems = navigationByRole[user?.role];
  const items = Array.isArray(roleItems) ? roleItems : [];
  const pageTitle =
    items.find((item) => item.path === pathname)?.label ??
    (pathname === "/profile" ? "Profile" : "Dashboard");

  return (
    <div className="min-h-screen bg-page text-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen lg:pl-72">
        <Topbar title={pageTitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-7xl p-5 sm:p-7 lg:p-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
