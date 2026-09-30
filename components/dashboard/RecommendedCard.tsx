import Link from "next/link";
import { Sym } from "@/components/app/AppChrome";
import { Badge } from "@/components/ui/Badge";
import { LevelBadge, type Level } from "@/components/ui/LevelBadge";
import type { RecommendedExercise, SkillTag } from "@/lib/types/dashboard";

export type RecommendedCopy = {
  recommendedTitle: string;
  recommendedPractise: string;
  recommendedDebug: string;
};

// Same level → colour mapping as the Workspace level cards.
const LEVEL_TONE: Record<string, Level> = { fresher: "Easy", junior: "Medium", senior: "Hard" };

const levelName = (level: string) => level.charAt(0).toUpperCase() + level.slice(1);

const skillLabel = (skill: SkillTag, locale: "vi" | "en") => skill[locale] || skill.key;

/** Labels of the weak skills that motivate the suggestion, in the item's skill order. */
export function reasonLabels(item: RecommendedExercise, locale: "vi" | "en"): string[] {
  const weak = new Set(item.reason_skills);
  return item.skills.filter((s) => weak.has(s.key)).map((s) => skillLabel(s, locale));
}

/** "Recommended next" card; renders nothing when there is no suggestion. */
export function RecommendedCard({
  items,
  locale,
  copy,
}: {
  items: RecommendedExercise[] | undefined;
  locale: "vi" | "en";
  copy: RecommendedCopy;
}) {
  if (!items?.length) return null;

  return (
    <section className="ice-card mb-8 p-6">
      <div className="mb-2 flex items-center justify-between border-b border-outline-variant/50 pb-4">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{copy.recommendedTitle}</h2>
        <Sym name="route" className="text-primary" />
      </div>
      <ul className="flex flex-col divide-y divide-outline-variant/40">
        {items.map((item) => {
          const reasons = reasonLabels(item, locale);
          return (
            <li key={item.code}>
              <Link
                href={{ pathname: "/solve", query: { id: item.code, level: item.level } }}
                className="group flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-on-surface group-hover:text-primary">{item.title}</span>
                    <LevelBadge level={LEVEL_TONE[item.level] ?? "Medium"} label={levelName(item.level)} />
                    {item.kind === "debug" && (
                      <Badge tone="accent">{copy.recommendedDebug}</Badge>
                    )}
                  </div>
                  {item.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.skills.map((s) => (
                        <span key={s.key} className="rounded-pill bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
                          {skillLabel(s, locale)}
                        </span>
                      ))}
                    </div>
                  )}
                  {reasons.length > 0 && (
                    <p className="mt-2 font-label-mono text-label-mono text-primary">
                      {copy.recommendedPractise}: {reasons.join(", ")}
                    </p>
                  )}
                </div>
                <Sym
                  name="arrow_forward"
                  className="shrink-0 text-[20px] text-on-surface-variant transition-transform group-hover:translate-x-1 group-hover:text-primary"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
