import {
  Warehouse,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  Camera,
  Globe2,
} from "lucide-react";
import { brand, footerContent, navigationLinks } from "../../data/landingData";

const contactIcons = { email: Mail, phone: Phone, address: MapPin };
const socialIcons = {
  LinkedIn: BriefcaseBusiness,
  Instagram: Camera,
  Facebook: Globe2,
};

export default function Footer() {
  return (
    <footer
      id="contact"
      className="scroll-mt-24 bg-footer px-5 pb-8 pt-16 text-white sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr]">
          <div className="max-w-sm">
            <a href="#home" className="inline-flex items-center gap-2.5 text-xl font-bold">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent text-white">
                <Warehouse size={21} aria-hidden="true" />
              </span>
              {brand.name}
            </a>
            <p className="mt-5 text-sm leading-6 text-slate-400">
              {footerContent.description}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {footerContent.socialLinks.map((social) => {
                const Icon = socialIcons[social.platform];
                return (
                  <a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.platform}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:border-primary-400 hover:bg-primary-600 hover:text-white"
                  >
                    <Icon size={17} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              {footerContent.quickLinksTitle}
            </h2>
            <ul className="mt-5 space-y-3">
              {navigationLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-slate-400 transition hover:text-primary-300"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              {footerContent.contactTitle}
            </h2>
            <ul className="mt-5 space-y-4">
              {footerContent.contact.map((item) => {
                const Icon = contactIcons[item.type];
                const content = (
                  <>
                    <Icon
                      size={17}
                      className="mt-0.5 shrink-0 text-primary-300"
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </>
                );
                return (
                  <li
                    key={item.type}
                    className="flex items-start gap-3 text-sm text-slate-400"
                  >
                    {item.href ? (
                      <a
                        href={item.href}
                        className="flex items-start gap-3 transition hover:text-primary-300"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <p className="pt-7 text-sm text-slate-400">{footerContent.copyright}</p>
      </div>
    </footer>
  );
}
