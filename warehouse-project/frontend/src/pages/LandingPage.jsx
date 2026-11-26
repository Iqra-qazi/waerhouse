import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Stats from "../components/landing/Stats";
import Gallery from "../components/landing/Gallery";
import CallToAction from "../components/landing/CallToAction";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
        <Gallery />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
