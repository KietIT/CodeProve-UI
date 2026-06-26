import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Geist (Cyber-Industrial display/body engine) is loaded via CSS @import in
// globals.css — it isn't available in this next/font version.

export const metadata: Metadata = {
  metadataBase: new URL("https://codeprove.example"),
  title: {
    default: "CodeProve - Đánh giá năng lực lập trình cùng AI",
    template: "%s · CodeProve",
  },
  description:
    "CodeProve đo toàn bộ quá trình giải quyết vấn đề cùng AI - hiểu đề, đặt giả thuyết, prompt, kiểm chứng và giải thích lại. Không chỉ chấm code cuối cùng.",
  keywords: [
    "AI code assessment",
    "đánh giá lập trình",
    "AI fluency",
    "edtech",
    "coding rubric",
  ],
  openGraph: {
    title: "CodeProve - Đánh giá năng lực lập trình cùng AI",
    description:
      "Không kiểm tra AI giải được bài không - kiểm tra bạn biết dùng AI đúng cách không.",
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeProve - AI-native code assessment",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-bg font-sans text-content antialiased">
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
