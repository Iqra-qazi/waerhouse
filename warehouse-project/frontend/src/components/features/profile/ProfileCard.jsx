import { Mail, Phone, UserRound } from "lucide-react";
import Avatar from "../../ui/Avatar";
import Badge from "../../ui/Badge";
import { ROLE_LABELS } from "../../../config/roles.js";

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-white/10 bg-elevated/50 p-4">
      <Icon size={17} className="mt-0.5 shrink-0 text-primary-300" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm text-slate-200">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

export default function ProfileCard({ user }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-surface p-5 sm:p-7">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
        <Avatar name={user?.name ?? user?.email ?? "User"} src={user?.image ?? user?.imageUrl} size="lg" />
        <div className="min-w-0">
          <h2 className="break-words text-xl font-semibold text-white">{user?.name ?? "User"}</h2>
          <p className="mt-1 break-words text-sm text-slate-400">{user?.email ?? "Email not provided"}</p>
          <Badge variant="primary" className="mt-3">{ROLE_LABELS[user?.role] ?? user?.role ?? "User"}</Badge>
        </div>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field icon={UserRound} label="Name" value={user?.name} />
        <Field icon={Mail} label="Email" value={user?.email} />
        <Field icon={Phone} label="Phone" value={user?.phone} />
      </dl>
    </section>
  );
}
