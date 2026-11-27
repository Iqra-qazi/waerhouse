import { useAuth } from "../context/AuthContext";
import { ROLES } from "../config/roles.js";
import usePermissions from "../hooks/usePermissions";
import useSupplyForm from "../hooks/useSupplyForm";
import useSupplyRequests from "../hooks/useSupplyRequests";
import SupplyRequestPanel from "../components/features/supply/SupplyRequestPanel";

export default function SupplyRequestsPage() {
  const { user } = useAuth();
  const { canCreateSupplyRequest, canReviewSupplyRequests } = usePermissions();
  const mine = user?.role === ROLES.SUPPLIER;
  const state = useSupplyRequests({ mine });
  const catalog = useSupplyForm({ enabled: canCreateSupplyRequest });

  return (
    <SupplyRequestPanel
      state={state}
      catalog={catalog}
      mine={mine}
      canCreate={canCreateSupplyRequest}
      canReview={canReviewSupplyRequests}
    />
  );
}
