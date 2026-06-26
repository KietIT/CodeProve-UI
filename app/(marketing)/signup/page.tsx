import type { Metadata } from "next";
import { AuthPanel } from "@/components/sections/AuthPanel";

export const metadata: Metadata = {
  title: "Đăng ký",
  robots: { index: false },
};

export default function SignupPage() {
  return <AuthPanel mode="signup" />;
}
