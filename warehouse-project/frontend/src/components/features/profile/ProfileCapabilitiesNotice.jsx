export default function ProfileCapabilitiesNotice() {
  return (
    <div role="status" className="mt-5 rounded-xl border border-primary-300/20 bg-primary-300/10 px-4 py-3 text-sm text-primary-100">
      Profile editing, profile image updates, and password changes are not available: the backend guide documents only GET /api/auth/me and has no authenticated profile-update or password-change endpoint.
    </div>
  );
}
