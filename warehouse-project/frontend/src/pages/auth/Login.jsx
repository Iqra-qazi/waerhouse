import { LockKeyhole, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import AuthField from "../../components/auth/AuthField";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthSubmitButton from "../../components/auth/AuthSubmitButton";
import { authContent } from "../../data/landingData";

export default function Login() {
  const content = authContent.login;

  return (
    <AuthLayout title={content.title} subtitle={content.subtitle}>
      <div className="space-y-5">
        <AuthField
          id="email"
          label={content.emailLabel}
          placeholder={content.emailPlaceholder}
          type="email"
          autoComplete="email"
          icon={Mail}
        />
        <AuthField
          id="password"
          label={content.passwordLabel}
          placeholder={content.passwordPlaceholder}
          type="password"
          autoComplete="current-password"
          icon={LockKeyhole}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/20 bg-elevated accent-primary-600 focus:ring-primary-400"
            />
            {content.rememberLabel}
          </label>
          <a
            href="#forgot-password"
            className="font-medium text-primary-300 transition hover:text-white"
          >
            {content.forgotLabel}
          </a>
        </div>
        <AuthSubmitButton label={content.submitLabel} />
        <p className="pt-2 text-center text-sm text-slate-400">
          {content.switchPrompt}{" "}
          <Link
            to="/signup"
            className="font-semibold text-primary-300 transition hover:text-white"
          >
            {content.switchLabel}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}