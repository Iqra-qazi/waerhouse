import { ROLE_LABELS, ROLES } from "../../config/roles.js";

const roleStyles = {
  [ROLES.ADMIN]: "border-primary-400/40 bg-primary-600/20 text-primary-300",
  [ROLES.MANAGER]: "border-primary-500/40 bg-primary-800/40 text-primary-200",
  [ROLES.SUPPLIER]: "border-accent/40 bg-accent/10 text-accent",
  [ROLES.SALES]: "border-primary-300/40 bg-primary-500/20 text-primary-200",
};

export default function RoleBadge({ role }) {
  const label = ROLE_LABELS[role] ?? "Unknown role";
  const style = roleStyles[role] ?? "border-white/10 bg-white/5 text-slate-300";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
