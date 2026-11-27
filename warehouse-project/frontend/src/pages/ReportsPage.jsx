import ReportsPanel from "../components/features/reports/ReportsPanel";
import useReports from "../hooks/useReports";
import usePermissions from "../hooks/usePermissions";

export default function ReportsPage() {
  const state = useReports();
  const { canViewReports } = usePermissions();
  return <ReportsPanel state={state} managerScopeWarning={canViewReports && state.isManager} />;
}
