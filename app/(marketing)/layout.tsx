import { MarketingNav } from "@/components/shell/MarketingNav";
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
      <MarketingNav />
      <main className="relative">{children}</main>
      <Footer />
    </>
  );
}
