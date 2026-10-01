import { Sym } from "@/components/app/AppChrome";
import { ratingBand, ratingPercent, splitSkills, type SkillBand } from "@/lib/progress";
import type { LearnerSkill } from "@/lib/types/learner";

export type SkillsCopy = {
  skillsTitle: string;
  skillsSub: string;
  bandGood: string;
  bandAverage: string;
  bandPractice: string;
  notEnoughData: string;
  noRatedSkills: string;
};

const BAND_TONE: Record<SkillBand, { text: string; bar: string }> = {
  good: { text: "text-primary", bar: "bg-primary" },
  average: { text: "text-on-surface-variant", bar: "bg-on-surface-variant/60" },
  practice: { text: "text-warning", bar: "bg-warning" },
};

const skillLabel = (skill: LearnerSkill, locale: "vi" | "en") => skill[locale] || skill.key;

/** One bar + word per rated skill; unrated skills listed below without a bar. Never shows the rating. */
export function SkillsCard({
  skills,
  locale,
  copy,
  className = "",
}: {
  skills: LearnerSkill[];
  locale: "vi" | "en";
  copy: SkillsCopy;
  className?: string;
}) {
  const { rated, unrated } = splitSkills(skills);
  const bandWord: Record<SkillBand, string> = {
    good: copy.bandGood,
    average: copy.bandAverage,
    practice: copy.bandPractice,
  };

  return (
    <section className={`ice-card p-6 ${className}`}>
      <div className="mb-6 flex items-center justify-between border-b border-outline-variant/50 pb-4">
        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{copy.skillsTitle}</h2>
          <p className="mt-1 font-label-mono text-label-mono text-on-surface-variant/70">{copy.skillsSub}</p>
        </div>
        <Sym name="psychology" className="text-primary" />
      </div>

      {rated.length === 0 ? (
        <p className="text-sm text-on-surface-variant">{copy.noRatedSkills}</p>
      ) : (
        <ul className="space-y-4">
          {rated.map((skill) => {
            const band = ratingBand(skill.rating);
            const tone = BAND_TONE[band];
            return (
              <li key={skill.key}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="min-w-0 text-sm text-on-surface">{skillLabel(skill, locale)}</span>
                  <span className={`shrink-0 font-label-mono text-label-mono ${tone.text}`}>{bandWord[band]}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden bg-surface-container-highest" aria-hidden="true">
                  <div
                    className={`animate-progress h-full ${tone.bar}`}
                    style={{ ["--final-width" as string]: `${ratingPercent(skill.rating).toFixed(0)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {unrated.length > 0 && (
        <div className="mt-6 border-t border-outline-variant/40 pt-4">
          <p className="mb-2 font-label-mono text-label-mono uppercase text-on-surface-variant/70">{copy.notEnoughData}</p>
          <div className="flex flex-wrap gap-1.5">
            {unrated.map((skill) => (
              <span key={skill.key} className="rounded-pill bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
                {skillLabel(skill, locale)}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
