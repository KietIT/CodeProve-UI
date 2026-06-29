"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function AuthCallbackClient({
  token,
  error,
}: {
  token?: string;
  error?: string;
}) {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const [message, setMessage] = useState(error ?? "");

  useEffect(() => {
    if (error) return;
    if (!token) {
      setMessage("Missing sign-in token.");
      return;
    }
    let cancelled = false;
    loginWithToken(token)
      .then(() => {
        if (!cancelled) router.replace("/dashboard");
      })
      .catch((err) => {
        if (!cancelled) {
          setMessage(err instanceof Error ? err.message : "Google sign-in failed.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [error, loginWithToken, router, token]);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-on-surface">
      <section className="glass-card w-full max-w-sm p-8 text-center">
        {!message ? (
          <>
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            <h1 className="mt-4 text-xl font-semibold">Signing you in</h1>
            <p className="mt-2 text-sm text-muted">Finishing Google authentication...</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Sign-in failed</h1>
            <p className="mt-2 text-sm text-error">{message}</p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-pill bg-primary px-5 py-2 text-sm font-semibold text-on-primary"
            >
              Back to login
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
