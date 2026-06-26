import type { Metadata } from "next";
import { AuthPanel } from "@/components/sections/AuthPanel";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false },
};

export default function LoginPage() {
  return <AuthPanel mode="login" />;
}
