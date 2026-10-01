import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";

export const metadata: Metadata = {
  title: "Quyền riêng tư",
  description: "CodeProve thu thập dữ liệu gì, dùng để làm gì, chia sẻ với ai và bạn có những quyền gì.",
};

export default function PrivacyPage() {
  return <LegalPage doc="privacy" />;
}
