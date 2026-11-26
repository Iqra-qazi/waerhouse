import { useEffect, useState } from "react";
import { Warehouse, Menu, X, ArrowUpRight } from "lucide-react";
import {
  brand,
  navigationActions,
  navigationLabels,
  navigationLinks,
} from "../../data/landingData";
import Button from "../ui/Button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("#home");

  useEffect(() => {
    const updateNavState = () => {
      setScrolled(window.scrollY > 24);
      let active = "#home";
      for (const item of navigationLinks) {
        const section = document.querySelector(item.href);
        if (section && section.getBoundingClientRect().top <= 160) {
          active = item.href;
        }
      }
      setActiveHref(active);
    };
    updateNavState();
    window.addEventListener("scroll", updateNavState, { passive: true });
    return () => window.removeEventListener("scroll", updateNavState);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-page/80 py-3 text-white shadow-sm shadow-black/20 backdrop-blur-md"
          : "bg-transparent py-5 text-white"
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"
        aria-label={navigationLabels.main}
      >
        <a
          href="#home"
          className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight"
          aria-label={`${brand.name} home`}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent text-white shadow-lg shadow-primary-900/40">
            <Warehouse size={21} strokeWidth={2} aria-hidden="true" />
          </span>
          <span>{brand.name}</span>
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {navigationLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={activeHref === item.href ? "location" : undefined}
              className={`relative text-sm font-medium transition after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:bg-primary-400 after:transition-all ${
                activeHref === item.href
                  ? "text-primary-300 after:w-full"
                  : `after:w-0 hover:text-primary-300 hover:after:w-full ${
                      scrolled ? "text-slate-300" : "text-white/85"
                    }`
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            href={navigationActions.login.href}
            variant="outline"
            className={
              scrolled
                ? ""
                : "border-white/20 hover:border-primary-300/50 hover:bg-primary-500/10 hover:text-white"
            }
          >
            {navigationActions.login.label}
          </Button>
          <Button href={navigationActions.signup.href}>
            {navigationActions.signup.label} <ArrowUpRight size={16} aria-hidden="true" />
          </Button>
        </div>

        <button
          type="button"
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition hover:bg-white/10 hover:text-white lg:hidden ${
            menuOpen || scrolled ? "text-white" : "text-white"
          }`}
          aria-label={
            menuOpen ? navigationLabels.closeMenu : navigationLabels.openMenu
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </nav>

      {menuOpen && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-t border-white/10 bg-surface px-5 pb-6 pt-3 text-white shadow-xl shadow-black/30 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col">
            {navigationLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="border-b border-white/10 py-3 text-sm font-medium text-slate-300 transition hover:text-primary-300"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                href={navigationActions.login.href}
                variant="outline"
              >
                {navigationActions.login.label}
              </Button>
              <Button href={navigationActions.signup.href}>
                {navigationActions.signup.label}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
