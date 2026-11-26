import { Check, Warehouse } from "lucide-react";
import { brand, authContent, heroContent } from "../../data/landingData";
import LandingImage from "../ui/LandingImage";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-page text-white md:grid md:grid-cols-2">
      <section className="relative min-h-[340px] overflow-hidden bg-page md:min-h-screen">
        <LandingImage
          src={heroContent.image.src}
          alt={heroContent.image.alt}
          loading="eager"
          fetchPriority="high"
          position="absolute"
          className="inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-page/90 via-page/75 to-primary-900/60" />
        <div className="relative z-10 flex min-h-[340px] flex-col justify-between px-6 py-7 sm:px-10 sm:py-9 md:min-h-screen md:px-12 md:py-10 lg:px-16">
          <a
            href="/"
            className="inline-flex w-fit items-center gap-2.5 text-xl font-bold tracking-tight text-white"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent text-white shadow-lg shadow-primary-900/40">
              <Warehouse size={21} aria-hidden="true" />
            </span>
            {brand.name}
          </a>
          <div className="max-w-xl py-9 md:py-16">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">
              {authContent.kicker}
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              {authContent.marketingTitle}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              {brand.description}
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              {heroContent.trustPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-3 text-sm font-medium text-slate-200"
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-400/15 text-primary-300">
                    <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <p className="hidden text-sm text-slate-400 md:block">
            {authContent.continueLabel}
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-page px-5 py-12 sm:px-8 md:min-h-screen md:py-16">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl shadow-primary-950/30 sm:p-9">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
