import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";

export const metadata: Metadata = {
  title: "Quyền riêng tư",
  description: "CodeProve thu thập telemetry hành vi minh bạch để chấm điểm và đảm bảo tính toàn vẹn.",
};

export default function PrivacyPage() {
  return <LegalPage doc="privacy" />;
}
