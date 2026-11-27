import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService.js";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

export default function useProfile() {
  const { user: sessionUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser({ ...sessionUser, ...currentUser });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load your profile."));
    } finally {
      setLoading(false);
    }
  }, [sessionUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return { user, loading, error, retry: loadProfile };
}
