import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Service } from "@/components/sections/Service";
import { RubricShowcase } from "@/components/sections/RubricShowcase";
import { Pricing } from "@/components/sections/Pricing";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Service />
      <RubricShowcase />
      <Pricing />
      <Contact />
    </>
  );
}
