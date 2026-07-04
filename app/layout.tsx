import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";

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

// Display/body type is Inter (above). The old Geist CSS @import was removed:
// it render-blocked every route and nothing used the font-geist classes.

export const metadata: Metadata = {
  metadataBase: new URL("https://code-prove.vercel.app"),
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
          <I18nProvider>
            <AuthProvider>{children}</AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
