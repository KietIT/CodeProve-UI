import type { Metadata } from "next";
import { Suspense } from "react";
import { AppTopNav, AppFooter, Sym } from "@/components/app/AppChrome";
import { FeedbackContent } from "./FeedbackContent";

export const metadata: Metadata = { title: "Feedback" };

export default function FeedbackPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-surface">
      <AppTopNav />
      <Suspense
        fallback={
          <main className="mx-auto w-full max-w-container-max flex-1 px-5 py-10 md:px-12">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <Sym name="hourglass_empty" className="animate-spin text-[22px] text-primary" />
              <span className="font-label-mono text-label-mono">Loading report…</span>
            </div>
          </main>
        }
      >
        <FeedbackContent />
      </Suspense>
      <AppFooter />
    </div>
  );
}
