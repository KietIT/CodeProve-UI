import type { Metadata } from "next";
import { Suspense } from "react";
import { Sym } from "@/components/app/AppChrome";
import { FeedbackContent } from "./FeedbackContent";

export const metadata: Metadata = { title: "Feedback" };

// Rendered inside the (app) sidebar shell, which supplies the sidebar, top bar,
// footer and auth guard - so this page is just the report body.
export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-container-max px-5 py-10 md:px-12">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <Sym name="hourglass_empty" className="animate-spin text-[22px] text-primary" />
            <span className="font-label-mono text-label-mono">Loading report…</span>
          </div>
        </div>
      }
    >
      <FeedbackContent />
    </Suspense>
  );
}
