import { gallery } from "../../data/landingData";
import LandingImage from "../ui/LandingImage";
import SectionHeading from "../ui/SectionHeading";

export default function Gallery() {
  return (
    <section id="gallery" className="scroll-mt-24 bg-surface px-5 py-24 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="landing-fade-in">
          <SectionHeading
            eyebrow={gallery.eyebrow}
            title={gallery.title}
            subtitle={gallery.subtitle}
          />
        </div>
        <div className="mt-14 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:auto-rows-[250px] lg:grid-cols-3">
          {gallery.images.map((image, index) => (
            <figure
              key={image.src}
              className={`group relative overflow-hidden rounded-2xl bg-elevated shadow-sm ${
                index === 0 ? "sm:row-span-2 sm:h-full" : ""
              }`}
            >
              <LandingImage
                src={image.src}
                alt={image.alt}
                className="h-full w-full transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-page/95 via-primary-950/25 to-transparent opacity-70 transition group-hover:opacity-100" />
              <figcaption className="absolute bottom-0 left-0 p-5 text-base font-semibold text-white">
                {image.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
