import type { Metadata } from "next";
import { PersonaPage } from "@/components/sections/PersonaPage";

export const metadata: Metadata = {
  title: "Dành cho sinh viên",
  description:
    "Biến kỹ năng dùng AI thành lợi thế có thể chứng minh - radar năng lực 6 trục và chứng chỉ AI-fluency.",
};

export default function StudentsPage() {
  return <PersonaPage personaKey="students" />;
}
