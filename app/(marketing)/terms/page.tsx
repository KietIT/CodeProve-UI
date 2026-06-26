import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ",
  description: "Điều khoản sử dụng CodeProve trong giai đoạn MVP.",
};

export default function TermsPage() {
  return <LegalPage doc="terms" />;
}
