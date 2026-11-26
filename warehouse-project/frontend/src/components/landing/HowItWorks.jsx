import { ArrowRight } from "lucide-react";
import { howItWorks } from "../../data/landingData";
import SectionHeading from "../ui/SectionHeading";

export default function HowItWorks() {
  const steps = howItWorks.steps ?? [];

  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 bg-page px-5 py-24 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="landing-fade-in">
          <SectionHeading
            eyebrow={howItWorks.eyebrow}
            title={howItWorks.title}
            subtitle={howItWorks.subtitle}
          />
        </div>
        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          <div className="absolute left-[16.7%] right-[16.7%] top-8 hidden border-t border-dashed border-primary-400/40 md:block" />
          {steps.map((step, index) => (
            <article key={step.number} className="relative text-center landing-fade-in">
              <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-page bg-gradient-to-br from-primary-500 to-primary-800 text-lg font-bold text-white shadow-lg shadow-primary-600/30">
                {step.number}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <ArrowRight
                  className="absolute -right-4 top-5 hidden text-primary-300 md:block"
                  size={22}
                  aria-hidden="true"
                />
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
