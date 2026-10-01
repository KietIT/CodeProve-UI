"use client";

import { useEffect, useRef } from "react";
import { ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { appContent } from "@/lib/appContent";
import type { ConsentNotice } from "@/lib/privacyConsent";

type Props = {
  version: string;
  accepting: boolean;
  notice: ConsentNotice;
  onAccept: () => void;
  onLater: () => void;
};

/**
 * Asks for consent to the current privacy policy. Uses lucide icons, not the
 * app's Material Symbols font, because it can open on any page.
 */
export function PrivacyConsentDialog({ version, accepting, notice, onAccept, onLater }: Props) {
  const { locale } = useI18n();
  const t = appContent[locale].privacy.dialog;
  const acceptRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    acceptRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !accepting) onLater();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [accepting, onLater]);

  return (
    // Above the workspace's fullscreen lock (z-80) and explain-back modal (z-50).
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/85 px-4 py-6 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-consent-title"
        aria-describedby="privacy-consent-intro"
        className="flex max-h-full w-full max-w-lg flex-col overflow-y-auto border border-outline-variant/70 bg-surface-container-low p-5 text-on-surface shadow-card sm:p-6"
      >
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <span className="mt-4 font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">{t.eyebrow}</span>
        <h2 id="privacy-consent-title" className="mt-1 font-headline-lg-mobile text-headline-lg-mobile">
          {t.title}
        </h2>
        <p id="privacy-consent-intro" className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          {t.intro}
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-on-surface-variant marker:text-primary">
          {t.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            {t.policyLink}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">{appContent[locale].privacy.newTab}</span>
          </a>
          <span className="font-label-mono text-label-mono text-on-surface-variant/70">
            {t.version.replace("{version}", version)}
          </span>
        </div>

        {notice && (
          <p role="alert" className="mt-4 border border-error/40 bg-error/10 p-3 text-sm text-error">
            {notice === "outdated" ? t.outdated : t.failed}
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onLater}
            disabled={accepting}
            className="cursor-pointer border border-outline-variant/60 px-5 py-2.5 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {t.later}
          </button>
          <button
            ref={acceptRef}
            type="button"
            onClick={onAccept}
            disabled={accepting}
            className="inline-flex cursor-pointer items-center justify-center gap-2 bg-primary px-5 py-2.5 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {accepting && <Loader2 className="h-4 w-4 animate-spin" />}
            {accepting ? t.accepting : t.accept}
          </button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-on-surface-variant/70">{t.laterHint}</p>
      </div>
    </div>
  );
}
