import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AmbientBackdrop } from "@/components/layout/AmbientBackdrop";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AmbientBackdrop />
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
    </>
  );
}
