"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CodeBlock } from "@/components/daily/CodeBlock";
import { useAuth } from "@/lib/auth";
import {
  claimStreak,
  fetchToday,
  submitAttempt,
  type DailyChallenge,
} from "@/lib/dailyApi";
import { clearHistory, computeLocalStreak, loadHistory, saveEntry, todayVN } from "@/lib/dailyStorage";
import { useI18n } from "@/lib/i18n";

type Phase = "loading" | "error" | "playing" | "revealed";

type Tier = "green" | "yellow" | "red";

// Unifies the two distinct result shapes the backend returns: DailyResult
// (nested in GET /today once already played - has hints_used/time_taken_seconds,
// no streak) and DailyAttemptOut (from POST /attempt - has streak, and the
// hints_used/time_taken_seconds the client already knew and sent).
type ResultView = {
  correct: boolean;
  tier: Tier;
  buggy_line: number;
  explanation: string;
  hints_used: number;
  time_taken_seconds: number;
  streak: number | null;
};

const TIER_DOT: Record<Tier, string> = {
  green: "bg-[#28c840]",
  yellow: "bg-[#febc2e]",
  red: "bg-[#ff5f57]",
};

export function DailyBugHunt() {
  const { t } = useI18n();
  const { user } = useAuth();
  const d = t.dailyBugHunt;

  const [phase, setPhase] = useState<Phase>("loading");
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [result, setResult] = useState<ResultView | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const startRef = useRef<number | null>(null);
  const claimedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchToday()
      .then((data) => {
        if (cancelled) return;
        setChallenge(data);
        if (data.already_played && data.result) {
          setResult({ ...data.result, streak: null });
          setPhase("revealed");
        } else {
          startRef.current = performance.now();
          setPhase("playing");
        }
      })
      .catch(() => {
        if (!cancelled) setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Once a signed-in user is detected with unclaimed anonymous history,
  // submit it once and clear it locally - clearing IS the "already claimed"
  // flag, so there is no separate piece of state to keep in sync.
  useEffect(() => {
    if (claimedRef.current || !user) return;
    const history = loadHistory();
    if (history.length === 0) return;
    claimedRef.current = true;
    claimStreak(
      history.map(({ date, selected_line, hints_used, time_taken_seconds }) => ({
        date,
        selected_line,
        hints_used,
        time_taken_seconds,
      }))
    )
      .then(() => clearHistory())
      .catch(() => {
        claimedRef.current = false;
      });
  }, [user]);

  async function handleSubmit() {
    if (selectedLine === null || challenge === null || startRef.current === null) return;
    setSubmitting(true);
    const time_taken_seconds = Math.round((performance.now() - startRef.current) / 1000);
    try {
      const res = await submitAttempt({
        selected_line: selectedLine,
        hints_used: hintsUsed,
        time_taken_seconds,
      });
      setResult({ ...res, hints_used: hintsUsed, time_taken_seconds });
      setPhase("revealed");
      if (!user) {
        saveEntry({
          date: todayVN(),
          selected_line: selectedLine,
          hints_used: hintsUsed,
          time_taken_seconds,
          tier: res.tier,
        });
      }
    } catch {
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleShare() {
    if (!challenge || !result) return;
    const tierEmoji = result.tier === "green" ? "\u{1F7E9}" : result.tier === "yellow" ? "\u{1F7E8}" : "\u{1F7E5}";
    const streakLine =
      result.streak != null ? `\n${d.shareStreak.replace("{n}", String(result.streak))}` : "";
    const text = `${d.shareTitle.replace("{n}", String(challenge.challenge_number))} ${tierEmoji}\n${d.shareResult
      .replace("{s}", String(result.time_taken_seconds))
      .replace("{h}", String(result.hints_used))}${streakLine}\nhttps://code-prove.vercel.app/daily`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (phase === "loading") {
    return <div className="container-site py-20 text-center text-muted">{d.loading}</div>;
  }

  if (phase === "error") {
    return (
      <div className="container-site py-20 text-center">
        <p className="text-lg font-semibold text-content">{d.errorTitle}</p>
        <p className="mt-2 text-muted">{d.errorBody}</p>
      </div>
    );
  }

  if (!challenge) return null;

  const localStreak = user ? null : computeLocalStreak(loadHistory(), todayVN());
  const showClaimBanner = !user && localStreak !== null && localStreak >= 3;

  return (
    <div className="container-site max-w-3xl py-12">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-teal">{d.eyebrow}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-content sm:text-4xl">{d.title}</h1>
      <p className="mt-3 text-muted">{d.subtitle}</p>

      <div className="mt-2 flex items-center gap-2 text-sm text-muted">
        <span>
          {d.challengeLabel} #{challenge.challenge_number}
        </span>
        <span>&middot;</span>
        <span>{challenge.prompt_title}</span>
      </div>

      {showClaimBanner && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-card border border-teal/40 bg-teal/10 p-4">
          <p className="text-sm text-content">{d.claimBanner}</p>
          <Button href="/signup" size="sm" variant="vivid">
            {d.claimBannerCta}
          </Button>
        </div>
      )}

      <div className="mt-6">
        <CodeBlock
          code={challenge.buggy_code}
          selectedLine={selectedLine}
          onSelectLine={setSelectedLine}
          revealedLine={phase === "revealed" ? result?.buggy_line ?? null : null}
          disabled={phase === "revealed"}
        />
      </div>

      {phase === "playing" && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted">{d.selectLinePrompt}</p>

          {hintsUsed > 0 && (
            <div className="space-y-2 rounded-card border border-border bg-surface/60 p-4 text-sm text-content">
              <p>{challenge.hint_1}</p>
              {hintsUsed > 1 && <p>{challenge.hint_2}</p>}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setHintsUsed((n) => Math.min(2, n + 1))}
              disabled={hintsUsed >= 2}
              className="cursor-pointer rounded-pill border border-border bg-surface/60 px-4 py-2 text-sm text-content transition-colors duration-200 hover:border-teal/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hintsUsed >= 2
                ? d.noHintsLeft
                : `${d.hintButton} (${d.hintsLeft.replace("{n}", String(2 - hintsUsed))})`}
            </button>
            <Button onClick={handleSubmit} disabled={selectedLine === null || submitting} variant="vivid">
              {submitting ? d.submitting : d.submitButton}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {phase === "revealed" && result && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className={`inline-block h-3 w-3 rounded-full ${TIER_DOT[result.tier]}`} />
            <p className="text-lg font-semibold text-content">
              {result.correct ? d.resultTitleCorrect : d.resultTitleIncorrect}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted">{d.yourLine}</p>
              <p className="mt-1 font-mono text-content">{selectedLine ?? "-"}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted">{d.correctLine}</p>
              <p className="mt-1 font-mono text-content">{result.buggy_line}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted">{d.timeTaken}</p>
              <p className="mt-1 text-content">{result.time_taken_seconds}s</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted">{d.hintsUsedLabel}</p>
              <p className="mt-1 text-content">{result.hints_used}</p>
            </div>
          </div>

          <div className="glass-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">{d.explanationLabel}</p>
            <p className="mt-1 text-content">{result.explanation}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {result.streak != null
                ? `${d.streakLabel}: ${d.streakDays.replace("{n}", String(result.streak))}`
                : d.streakNone}
            </p>
            <Button onClick={handleShare} variant="secondary" size="sm">
              <Sparkles className="h-4 w-4" />
              {copied ? d.shareCopied : d.shareButton}
            </Button>
          </div>

          <p className="text-center text-sm text-muted">{d.playAgainTomorrow}</p>
        </div>
      )}
    </div>
  );
}
