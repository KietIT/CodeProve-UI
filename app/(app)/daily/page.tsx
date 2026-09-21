import type { Metadata } from "next";
import { DailyBugHunt } from "@/components/daily/DailyBugHunt";

export const metadata: Metadata = {
  title: "Bug Hunt of the Day",
  description: "A daily challenge: spot the bug Ciel planted in today's code.",
};

// Rendered inside the app shell (sidebar + top bar), so no page-level header.
export default function DailyPage() {
  return <DailyBugHunt />;
}
