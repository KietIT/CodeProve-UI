import { Hero } from "@/components/sections/Hero";
import { ProductPreviewSection } from "@/components/landing/ProductPreviewSection";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { About } from "@/components/sections/About";
import { Service } from "@/components/sections/Service";
import { RubricShowcase } from "@/components/sections/RubricShowcase";
import { Pricing } from "@/components/sections/Pricing";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductPreviewSection />
      <TrustedBy />
      <HowItWorks />
      <About />
      <Service />
      <RubricShowcase />
      <Pricing />
      <Contact />
    </>
  );
}
