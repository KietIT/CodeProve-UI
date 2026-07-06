import type { Metadata } from "next";
import { DailyHeader } from "@/components/daily/DailyHeader";
import { DailyBugHunt } from "@/components/daily/DailyBugHunt";

export const metadata: Metadata = {
  title: "Bug Hunt of the Day",
  description: "A daily challenge: spot the bug Ciel planted in today's code.",
};

export default function DailyPage() {
  return (
    <>
      <DailyHeader />
      <DailyBugHunt />
    </>
  );
}
