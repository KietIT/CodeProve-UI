"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { acceptPrivacy, getPrivacy, onConsentRequired, outdatedVersionOf, updatePrivacy } from "@/lib/api";
import type { PrivacyState } from "@/lib/types/privacy";
import { useAuth } from "@/lib/auth";
import { PrivacyConsentDialog } from "@/components/privacy/PrivacyConsentDialog";

// Consent to the privacy policy (P3.7). The AI endpoints answer 403
// `privacy_consent_required` until the student accepted the current version;
// this provider loads the state for the signed-in user, asks once per browser
// session ("Later" is remembered per version), and asks again on every 403.

export type ConsentNotice = "outdated" | "failed" | null;

type PrivacyCtx = {
  /** `null` while signed out, loading, or when the backend has no privacy endpoint. */
  privacy: PrivacyState | null;
  loadFailed: boolean;
  reload: () => Promise<void>;
  openDialog: () => void;
  setAiPersonalization: (on: boolean) => Promise<void>;
};

const Ctx = createContext<PrivacyCtx | null>(null);

const LATER_KEY = "codeprove_privacy_later";
// The policy itself must stay readable without the dialog on top of it.
const UNPROMPTED_PATHS = ["/privacy", "/terms"];

function readLater(): string | null {
  try {
    return sessionStorage.getItem(LATER_KEY);
  } catch {
    return null;
  }
}

function writeLater(version: string | null): void {
  try {
    if (version === null) sessionStorage.removeItem(LATER_KEY);
    else sessionStorage.setItem(LATER_KEY, version);
  } catch {
    // Storage blocked (private mode): the dialog simply comes back on reload.
  }
}

export function PrivacyConsentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const userId = user?.id ?? null;

  const [privacy, setPrivacy] = useState<PrivacyState | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  // Opened by a 403 or by the profile button: shown even after "Later".
  const [forced, setForced] = useState(false);
  const [laterVersion, setLaterVersion] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [notice, setNotice] = useState<ConsentNotice>(null);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const reload = useCallback(async () => {
    const requestedFor = userIdRef.current;
    if (requestedFor === null) return;
    try {
      const next = await getPrivacy();
      // Ignore a late answer for an account that has since signed out.
      if (userIdRef.current !== requestedFor) return;
      setPrivacy(next);
      setLoadFailed(false);
    } catch {
      if (userIdRef.current === requestedFor) setLoadFailed(true);
    }
  }, []);

  // Login (email or Google), app load with a stored token, or sign-out.
  useEffect(() => {
    setPrivacy(null);
    setForced(false);
    setNotice(null);
    setLoadFailed(false);
    if (userId === null) return;
    setLaterVersion(readLater());
    void reload();
  }, [userId, reload]);

  // Any AI call refused for missing consent opens the dialog with fresh state.
  // The notice is kept: a retried call must not wipe an "outdated" message.
  useEffect(
    () =>
      onConsentRequired(() => {
        setForced(true);
        void reload();
      }),
    [reload],
  );

  const openDialog = useCallback(() => {
    setNotice(null);
    setForced(true);
    if (!privacy) void reload();
  }, [privacy, reload]);

  const accept = useCallback(async () => {
    if (!privacy || accepting) return;
    setAccepting(true);
    setNotice(null);
    try {
      setPrivacy(await acceptPrivacy(privacy.current_version));
      setForced(false);
      writeLater(null);
      setLaterVersion(null);
    } catch (err) {
      if (outdatedVersionOf(err) !== null) {
        // The text changed while the dialog was open: show the new version.
        await reload();
        setNotice("outdated");
      } else {
        setNotice("failed");
      }
    } finally {
      setAccepting(false);
    }
  }, [privacy, accepting, reload]);

  const later = useCallback(() => {
    setForced(false);
    setNotice(null);
    if (privacy) {
      writeLater(privacy.current_version);
      setLaterVersion(privacy.current_version);
    }
  }, [privacy]);

  const setAiPersonalization = useCallback(async (on: boolean) => {
    setPrivacy(await updatePrivacy({ ai_personalization: on }));
  }, []);

  const needsConsent = privacy !== null && !privacy.consented;
  const autoPrompt =
    needsConsent && laterVersion !== privacy.current_version && !UNPROMPTED_PATHS.includes(pathname ?? "");
  const open = userId !== null && privacy !== null && !privacy.consented && (forced || autoPrompt);

  return (
    <Ctx.Provider value={{ privacy, loadFailed, reload, openDialog, setAiPersonalization }}>
      {children}
      {open && (
        <PrivacyConsentDialog
          version={privacy.current_version}
          accepting={accepting}
          notice={notice}
          onAccept={() => void accept()}
          onLater={later}
        />
      )}
    </Ctx.Provider>
  );
}

const FALLBACK: PrivacyCtx = {
  privacy: null,
  loadFailed: false,
  reload: async () => {},
  openDialog: () => {},
  setAiPersonalization: async () => {},
};

/** Consent state and actions; a no-op outside the provider (isolated renders, tests). */
export function usePrivacyConsent(): PrivacyCtx {
  return useContext(Ctx) ?? FALLBACK;
}
