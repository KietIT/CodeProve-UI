import type { Metadata } from "next";
import { PersonaPage } from "@/components/sections/PersonaPage";

export const metadata: Metadata = {
  title: "Dành cho nhà tuyển dụng",
  description:
    "Employer Fluency Report - tuyển kỹ sư biết cộng tác với AI qua các tình huống thực chiến.",
};

export default function EmployersPage() {
  return <PersonaPage personaKey="employers" />;
}
