import PageHeader from "../components/layout/PageHeader";
import ErrorState from "../components/ui/ErrorState";
import Skeleton from "../components/ui/Skeleton";
import ProfileCard from "../components/features/profile/ProfileCard";
import ProfileCapabilitiesNotice from "../components/features/profile/ProfileCapabilitiesNotice";
import useProfile from "../hooks/useProfile";

export default function ProfilePage() {
  const state = useProfile();
  return (
    <>
      <PageHeader title="Profile" description="Your account information and access role." />
      {state.error ? (
        <ErrorState message={state.error} onRetry={state.retry} />
      ) : state.loading ? (
        <div className="space-y-4" aria-label="Loading profile">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      ) : (
        <>
          <ProfileCard user={state.user} />
          <ProfileCapabilitiesNotice />
        </>
      )}
    </>
  );
}
