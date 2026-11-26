import { useLocation } from "react-router-dom";
import { navigationByRole } from "../config/navigation";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/layout/PageHeader";
import EmptyState from "../components/shared/EmptyState";

export default function PlaceholderPage({ title: explicitTitle }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const roleItems = navigationByRole[user?.role];
  const items = Array.isArray(roleItems) ? roleItems : [];
  const title =
    explicitTitle ??
    items.find((item) => item.path === pathname)?.label ??
    "Page";

  return (
    <>
      <PageHeader title={title} />
      <EmptyState />
    </>
  );
}
