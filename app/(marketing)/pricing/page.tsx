import type { Metadata } from "next";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Bảng giá",
  description:
    "Miễn phí cho sinh viên. Trường học và nhà tuyển dụng trả theo quy mô sử dụng.",
};

export default function PricingPage() {
  return (
    <>
      <Pricing standalone />
      <FAQ />
      <FinalCTA />
    </>
  );
}
