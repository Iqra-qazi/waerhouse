import { useEffect, useRef, useState } from "react";
import { stats, statsAriaLabel } from "../../data/landingData";

export default function Stats() {
  const sectionRef = useRef(null);
  const startedRef = useRef(false);
  const [values, setValues] = useState(() => stats.map(() => 0));

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    let frameId;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        observer.disconnect();

        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReducedMotion) {
          setValues(stats.map((stat) => stat.value));
          return;
        }

        const startedAt = performance.now();
        const duration = 1500;
        const animate = (now) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          setValues(stats.map((stat) => Math.round(stat.value * eased)));
          if (progress < 1) frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
      },
      { threshold: 0.35 },
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="stats-pattern bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 px-5 py-16 sm:px-8 lg:px-10 lg:py-20"
      aria-label={statsAriaLabel}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 md:grid-cols-4 md:gap-6">
        {stats.map((stat, index) => (
          <div key={stat.label} className="text-center landing-fade-in">
            <p className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {values[index].toLocaleString()}
              <span className="text-primary-200">{stat.suffix}</span>
            </p>
            <p className="mt-2 text-sm font-medium text-slate-200 sm:text-base">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
