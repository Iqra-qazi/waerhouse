import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/auth/Login";

export default function LoginRoute() {
  const { isAuthenticated, saveSession } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      toast.error("Enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const authData = response.data?.data;
      if (!authData?.token || !authData?.user) {
        throw new Error("The server did not return a valid sign-in session.");
      }
      saveSession(authData);
      toast.success("Welcome back.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Could not sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
      <LoginPage />
    </form>
  );
}
