import {
  Package,
  ArrowDownToLine,
  ShoppingCart,
  Truck,
  ChartNoAxesCombined,
  ShieldCheck,
} from "lucide-react";
import { features, featuresSection } from "../../data/landingData";
import FeatureCard from "../ui/FeatureCard";
import SectionHeading from "../ui/SectionHeading";

const featureIcons = {
  Package,
  ArrowDownToLine,
  ShoppingCart,
  Truck,
  ChartNoAxesCombined,
  ShieldCheck,
};

export default function Features() {
  return (
    <section id="features" className="scroll-mt-24 bg-surface px-5 py-24 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="landing-fade-in">
          <SectionHeading
            eyebrow={featuresSection.eyebrow}
            title={featuresSection.title}
            subtitle={featuresSection.subtitle}
          />
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={featureIcons[feature.icon]}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
