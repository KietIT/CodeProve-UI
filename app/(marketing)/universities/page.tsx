import type { Metadata } from "next";
import { PersonaPage } from "@/components/sections/PersonaPage";

export const metadata: Metadata = {
  title: "Dành cho trường học",
  description:
    "Phân biệt hiểu thật và copy AI bằng dữ liệu - dashboard giảng viên, rubric minh bạch, integrity badge.",
};

export default function UniversitiesPage() {
  return <PersonaPage personaKey="universities" />;
}
