import { ArrowDown, ArrowRight, Check, Boxes, ClipboardCheck, Truck } from "lucide-react";
import { heroContent } from "../../data/landingData";
import Button from "../ui/Button";
import LandingImage from "../ui/LandingImage";

const glassIcons = [Boxes, ClipboardCheck, Truck];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[760px] scroll-mt-24 items-center overflow-hidden bg-page sm:min-h-screen"
    >
      <LandingImage
        src={heroContent.image.src}
        alt={heroContent.image.alt}
        loading="eager"
        fetchPriority="high"
        position="absolute"
        className="inset-0"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-page/90 via-page/75 to-primary-900/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-page/60 via-transparent to-page/20" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 pb-20 pt-36 sm:px-8 sm:pb-24 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-10">
        <div className="max-w-3xl landing-fade-in">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {heroContent.eyebrow}
          </p>
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {heroContent.titlePrefix}{" "}
            <span className="bg-gradient-to-r from-primary-300 to-accent bg-clip-text text-transparent">
              {heroContent.titleHighlight}
            </span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            {heroContent.description}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href={heroContent.primaryAction.href} className="min-h-12 px-7">
              {heroContent.primaryAction.label}
              <ArrowRight size={17} aria-hidden="true" />
            </Button>
            <Button
              href={heroContent.secondaryAction.href}
              variant="outline"
              className="min-h-12 px-7"
            >
              {heroContent.secondaryAction.label}
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-slate-200">
            {heroContent.trustPoints.map((point) => (
              <li key={point} className="inline-flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-400/15 text-primary-300">
                  <Check size={13} strokeWidth={2.5} aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <aside className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8 lg:shrink-0 lg:translate-y-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
            {heroContent.glassCard.eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {heroContent.glassCard.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {heroContent.glassCard.description}
          </p>
          <ul className="mt-6 space-y-3 border-t border-white/10 pt-5">
            {heroContent.glassCard.points.map((point, index) => {
              const Icon = glassIcons[index];
              return (
                <li key={point} className="flex items-center gap-3 text-sm text-slate-200">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-accent/20 text-primary-300">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  {point}
                </li>
              );
            })}
          </ul>
        </aside>

        <a
          href="#features"
          className="absolute bottom-8 right-8 hidden h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-primary-300/50 hover:bg-primary-500/10 md:inline-flex"
          aria-label={heroContent.scrollLabel}
        >
          <ArrowDown size={19} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
