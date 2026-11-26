import {
  BriefcaseBusiness,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import toast from "react-hot-toast";
import AuthField from "../../components/auth/AuthField";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthSubmitButton from "../../components/auth/AuthSubmitButton";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { authContent } from "../../data/landingData";

const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name.").max(100, "Name is too long."),
    email: z.string().trim().email("Enter a valid email address."),
    role: z.string().refine((value) => ["sales", "supplier"].includes(value), {
      message: "Choose Sales or Supplier.",
    }),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

async function signupResolver(values) {
  const result = signupSchema.safeParse(values);
  if (result.success) return { values: result.data, errors: {} };

  const errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field && !errors[field]) {
      errors[field] = { type: issue.code, message: issue.message };
    }
  }
  return { values: {}, errors };
}

const signupFields = ["name", "email", "role", "password", "confirmPassword"];

function getServerField(error, message) {
  const details = error.response?.data?.error?.details;
  const detailField =
    details && typeof details === "object"
      ? Object.keys(details).find((field) => signupFields.includes(field))
      : undefined;
  if (detailField) return detailField;

  const code = error.response?.data?.error?.code;
  if (code === "DUPLICATE_VALUE" || /email/i.test(message)) return "email";
  if (/password/i.test(message)) return "password";
  if (/role|sales|supplier/i.test(message)) return "role";
  if (/name/i.test(message)) return "name";
  return null;
}

export default function Register() {
  const content = authContent.signup;
  const { saveSession } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: signupResolver,
    defaultValues: {
      name: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onInvalid = (formErrors) => {
    const firstInvalidField = signupFields.find((field) => formErrors[field]);
    if (firstInvalidField) setFocus(firstInvalidField);
    toast.error("Please correct the highlighted fields.");
  };

  const onSubmit = async (values) => {
    setServerError("");
    const payload = {
      name: values.name,
      email: values.email,
      role: values.role,
      password: values.password,
    };

    try {
      const registrationResponse = await api.post("/auth/register", payload);
      let authData = registrationResponse.data?.data;

      if (!authData?.token) {
        const loginResponse = await api.post("/auth/login", {
          email: payload.email,
          password: payload.password,
        });
        authData = loginResponse.data?.data;
      }

      if (!authData?.token || !authData?.user) {
        throw new Error("The server did not return a valid sign-in session.");
      }

      saveSession(authData);
      toast.success("Account created successfully.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Could not create your account.";
      const field = getServerField(error, message);
      if (field) {
        setError(field, { type: "server", message });
      } else {
        setServerError(message);
      }
      toast.error(message);
    }
  };

  return (
    <AuthLayout title={content.title} subtitle={content.subtitle}>
      <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <AuthField
          id="name"
          label={content.nameLabel}
          placeholder={content.namePlaceholder}
          autoComplete="name"
          icon={UserRound}
          registration={register("name")}
          error={errors.name?.message}
        />
        <AuthField
          id="email"
          label={content.emailLabel}
          placeholder={content.emailPlaceholder}
          type="email"
          autoComplete="email"
          icon={Mail}
          registration={register("email")}
          error={errors.email?.message}
        />
        <AuthField
          id="role"
          label={content.roleLabel}
          icon={BriefcaseBusiness}
          error={errors.role?.message}
        >
          <select
            id="role"
            {...register("role")}
            className="w-full appearance-none rounded-xl border border-white/10 bg-elevated py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-primary-400/70 focus:ring-2 focus:ring-primary-400/25"
          >
            <option value="" disabled>
              {content.rolePlaceholder}
            </option>
            {content.roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </AuthField>
        <AuthField
          id="password"
          label={content.passwordLabel}
          placeholder={content.passwordPlaceholder}
          type="password"
          autoComplete="new-password"
          icon={LockKeyhole}
          registration={register("password")}
          error={errors.password?.message}
        />
        <AuthField
          id="confirmPassword"
          label={content.confirmPasswordLabel}
          placeholder={content.confirmPasswordPlaceholder}
          type="password"
          autoComplete="new-password"
          icon={LockKeyhole}
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
        <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs leading-5 text-slate-400">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-elevated accent-primary-600 focus:ring-primary-400"
          />
          {content.termsLabel}
        </label>
        {serverError && (
          <p role="alert" className="text-sm font-medium text-error">
            {serverError}
          </p>
        )}
        <AuthSubmitButton label={content.submitLabel} loading={isSubmitting} />
        <p className="pt-2 text-center text-sm text-slate-400">
          {content.switchPrompt}{" "}
          <Link
            to="/login"
            className="font-semibold text-primary-300 transition hover:text-white"
          >
            {content.switchLabel}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}