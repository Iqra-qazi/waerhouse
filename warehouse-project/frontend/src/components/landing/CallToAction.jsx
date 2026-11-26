import { ArrowRight } from "lucide-react";
import { callToAction } from "../../data/landingData";
import Button from "../ui/Button";

export default function CallToAction() {
  return (
    <section className="bg-page px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary-600 bg-gradient-to-br from-primary-600 via-primary-700 to-accent/35 px-6 py-14 text-center shadow-2xl shadow-primary-900/30 sm:px-12 sm:py-16">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-page/15 blur-3xl" />
        <div className="absolute -bottom-48 -left-20 h-96 w-96 rounded-full bg-page/15 blur-3xl" />
        <div className="relative mx-auto max-w-2xl landing-fade-in">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {callToAction.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-white sm:text-lg">
            {callToAction.description}
          </p>
          <Button
            href={callToAction.action.href}
            variant="outline"
            className="mt-8 !border-white !bg-white px-6 !text-primary-700 hover:!bg-white/90 hover:!text-primary-800"
          >
            {callToAction.action.label}
            <ArrowRight size={17} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
