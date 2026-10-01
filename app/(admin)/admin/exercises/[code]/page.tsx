"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Download, Plus, Trash2 } from "lucide-react";
import { exercises, formatDate, statusTone, type AdminExercise, type AdminMutant, type AdminTest } from "../../_data";
import { useAdminCopy } from "../../_copy";
import { BackLink, card, field, PageHeading, PreviewNotice, primaryButton, secondaryButton } from "../../_ui";

const inputLabel = "mb-1.5 block text-xs font-semibold text-on-surface-variant";
const monoField = `${field} font-[ui-monospace,SFMono-Regular,Consolas,monospace] leading-relaxed`;
type EditorText = ReturnType<typeof useAdminCopy>["t"]["editor"];

function validateDraft(exercise: AdminExercise, t: EditorText): string[] {
  const issues: string[] = [];
  if (!/^CP-\d{3}$/.test(exercise.code)) issues.push(t.invalidCode);
  if (!exercise.summary.trim()) issues.push(t.missingSummary);
  if (!exercise.referenceSolution.trim()) issues.push(t.missingReference);
  if (!exercise.starterCode.trim()) issues.push(t.missingStarter);
  if (exercise.tests.length < 1) issues.push(t.missingTest);
  if (exercise.tests.some((test) => !test.description.trim() || !test.input.trim())) issues.push(t.invalidTest);
  if (exercise.mutants.some((mutant) => !mutant.code.trim() || mutant.bugLine < 1 || !mutant.bugType.trim())) issues.push(t.invalidMutant);
  return issues;
}

function downloadDraft(exercise: AdminExercise) {
  const payload = {
    code: exercise.code,
    reference_solution: exercise.referenceSolution.split("\n"),
    tests: exercise.tests,
    mutants: exercise.mutants.map((item) => ({ code: item.code.split("\n"), bug_line: item.bugLine, bug_type: item.bugType, note_vi: item.noteVi, note_en: item.noteEn })),
    exercise: { summary: exercise.summary, starter_code: exercise.starterCode.split("\n"), hint: exercise.hint },
    skills: exercise.skills.length ? { tags: exercise.skills, review: { status: "draft", author: "admin-ui", reviewer: null } } : undefined,
    review: { status: "draft", author: "admin-ui", reviewer: null },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${exercise.code}-draft.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function AdminExerciseEditorPage({ params }: { params: { code: string } }) {
  const { locale, t } = useAdminCopy();
  const source = useMemo(() => exercises.find((item) => item.code === params.code), [params.code]);
  const [draft, setDraft] = useState<AdminExercise | null>(() => source ? structuredClone(source) : null);
  const [checked, setChecked] = useState(false);
  const [exported, setExported] = useState(false);
  if (!source || !draft) return <div><BackLink href="/admin/exercises?demo=1">{t.editor.back}</BackLink><h1 className="text-2xl font-bold">{t.editor.notFound}</h1><p className="mt-2 text-on-surface-variant">{params.code} {t.editor.notFoundBody}</p></div>;

  const issues = validateDraft(draft, t.editor);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(source);
  const setValue = <K extends keyof AdminExercise>(key: K, value: AdminExercise[K]) => { setDraft((current) => current ? { ...current, [key]: value } : current); setChecked(false); setExported(false); };
  const updateTest = (index: number, patch: Partial<AdminTest>) => setValue("tests", draft.tests.map((item, position) => position === index ? { ...item, ...patch } : item));
  const updateMutant = (index: number, patch: Partial<AdminMutant>) => setValue("mutants", draft.mutants.map((item, position) => position === index ? { ...item, ...patch } : item));

  return <div className="pb-12">
    <BackLink href="/admin/exercises?demo=1">{t.editor.back}</BackLink>
    <PageHeading eyebrow={`${draft.code} · ${draft.level}`} title={draft.title} description={t.editor.description} action={<span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusTone[source.status]}`}>{t.common[source.status]}</span>} />
    <PreviewNotice />
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface-container-low p-4 text-xs"><span className="font-semibold text-on-surface-variant">{t.editor.process}</span>{[t.editor.draft, t.editor.check, t.editor.approve, t.editor.publish].map((step, index) => <span key={step} className={`rounded-lg px-3 py-1.5 ${index === 0 ? "bg-primary/15 font-semibold text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>{index + 1}. {step}</span>)}<span className="ml-auto text-on-surface-variant">{t.editor.sampleUpdated}: {formatDate(source.updatedAt, locale)}</span></div>
    {isDirty && <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm"><span>{t.editor.unsaved}</span><button type="button" onClick={() => { if (window.confirm(t.editor.restoreConfirm)) { setDraft(structuredClone(source)); setChecked(false); setExported(false); } }} className="font-semibold text-primary hover:underline">{t.editor.restore}</button></div>}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]"><div className="space-y-6">
      <section id="basics" className={`${card} p-5 sm:p-6`}><h2 className="text-lg font-bold">{t.editor.basics}</h2><p className="mt-1 text-sm text-on-surface-variant">{t.editor.basicsHelp}</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><span className={inputLabel}>{t.editor.code}</span><p className={`${field} flex items-center opacity-70`}>{draft.code}</p></div><div><span className={inputLabel}>{t.editor.title}</span><p className={`${field} flex items-center opacity-70`}>{draft.title}</p></div><div><span className={inputLabel}>{t.editor.level}</span><p className={`${field} flex items-center capitalize opacity-70`}>{draft.level}</p></div><div><span className={inputLabel}>{t.editor.kindDifficulty}</span><p className={`${field} flex items-center capitalize opacity-70`}>{draft.kind} · {draft.difficulty}</p></div></div></section>
      <section id="content" className={`${card} p-5 sm:p-6`}><h2 className="text-lg font-bold">{t.editor.content}</h2><div className="mt-5 space-y-4"><label className="block"><span className={inputLabel}>{t.editor.summary}</span><textarea rows={5} value={draft.summary} onChange={(event) => setValue("summary", event.target.value)} className={field} /></label><label className="block"><span className={inputLabel}>{t.editor.starter}</span><textarea rows={7} value={draft.starterCode} onChange={(event) => setValue("starterCode", event.target.value)} spellCheck={false} className={monoField} /></label><label className="block"><span className={inputLabel}>{t.editor.hint}</span><textarea rows={3} value={draft.hint} onChange={(event) => setValue("hint", event.target.value)} className={field} /></label><label className="block"><span className={inputLabel}>{t.editor.reference}</span><textarea rows={8} value={draft.referenceSolution} onChange={(event) => setValue("referenceSolution", event.target.value)} spellCheck={false} className={monoField} /></label></div></section>
      <section id="tests" className={`${card} p-5 sm:p-6`}><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">{t.editor.tests}</h2><p className="mt-1 text-sm text-on-surface-variant">{t.editor.testsHelp}</p></div><button type="button" onClick={() => setValue("tests", [...draft.tests, { description: "", input: "", expected: "", category: "happy", hidden: true }])} className={secondaryButton}><Plus size={16} />{t.editor.addTest}</button></div><div className="mt-5 space-y-4">{draft.tests.map((test, index) => <div key={index} className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-4"><div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-semibold">Test #{index + 1}</h3><button type="button" aria-label={`${t.editor.removeTest} ${index + 1}`} onClick={() => setValue("tests", draft.tests.filter((_, position) => position !== index))} className="rounded-lg p-2 text-error hover:bg-error/10"><Trash2 size={16} /></button></div><div className="grid gap-3 sm:grid-cols-2"><label className="sm:col-span-2"><span className={inputLabel}>{t.editor.descriptionLabel}</span><input value={test.description} onChange={(event) => updateTest(index, { description: event.target.value })} className={field} /></label><label><span className={inputLabel}>{t.editor.input}</span><input value={test.input} onChange={(event) => updateTest(index, { input: event.target.value })} className={monoField} /></label><label><span className={inputLabel}>{t.editor.expected}</span><input value={test.expected} onChange={(event) => updateTest(index, { expected: event.target.value })} className={monoField} /></label><label><span className={inputLabel}>{t.editor.category}</span><select value={test.category} onChange={(event) => updateTest(index, { category: event.target.value as AdminTest["category"] })} className={field}><option value="happy">Happy</option><option value="boundary">Boundary</option><option value="edge">Edge</option><option value="error">Error</option></select></label><label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={test.hidden} onChange={(event) => updateTest(index, { hidden: event.target.checked })} className="accent-primary" />{t.editor.hidden}</label></div></div>)}</div></section>
      <section id="mutants" className={`${card} p-5 sm:p-6`}><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">{t.editor.mutants}</h2><p className="mt-1 text-sm text-on-surface-variant">{t.editor.mutantsHelp}</p></div><button type="button" onClick={() => setValue("mutants", [...draft.mutants, { code: "", bugLine: 1, bugType: "", noteVi: "", noteEn: "" }])} className={secondaryButton}><Plus size={16} />{t.editor.addMutant}</button></div><div className="mt-5 space-y-4">{draft.mutants.map((mutant, index) => <div key={index} className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-4"><div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-semibold">Mutant #{index + 1}</h3><button type="button" aria-label={`${t.editor.removeMutant} ${index + 1}`} onClick={() => setValue("mutants", draft.mutants.filter((_, position) => position !== index))} className="rounded-lg p-2 text-error hover:bg-error/10"><Trash2 size={16} /></button></div><div className="grid gap-3 sm:grid-cols-2"><label className="sm:col-span-2"><span className={inputLabel}>Code</span><textarea rows={5} value={mutant.code} onChange={(event) => updateMutant(index, { code: event.target.value })} spellCheck={false} className={monoField} /></label><label><span className={inputLabel}>{t.editor.bugLine}</span><input type="number" min={1} value={mutant.bugLine} onChange={(event) => updateMutant(index, { bugLine: Number(event.target.value) })} className={field} /></label><label><span className={inputLabel}>{t.editor.bugType}</span><input value={mutant.bugType} onChange={(event) => updateMutant(index, { bugType: event.target.value })} className={field} /></label><label><span className={inputLabel}>{t.editor.noteVi}</span><input value={mutant.noteVi} onChange={(event) => updateMutant(index, { noteVi: event.target.value })} className={field} /></label><label><span className={inputLabel}>{t.editor.noteEn}</span><input value={mutant.noteEn} onChange={(event) => updateMutant(index, { noteEn: event.target.value })} className={field} /></label></div></div>)}</div></section>
      <section id="review" className={`${card} p-5 sm:p-6`}><h2 className="text-lg font-bold">{t.editor.skillsReview}</h2><label className="mt-5 block"><span className={inputLabel}>{t.editor.skills}</span><input value={draft.skills.join(", ")} onChange={(event) => setValue("skills", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} className={field} /></label><div className="mt-5 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-on-surface"><p className="font-semibold">{t.editor.reviewDraft}</p><p className="mt-1 text-on-surface-variant">{t.editor.reviewHelp}</p></div></section>
    </div><aside className="xl:sticky xl:top-24 xl:self-start"><div className={`${card} p-5`}><h2 className="font-bold">{t.editor.sections}</h2><nav aria-label={t.editor.sections} className="mt-4 space-y-2 text-sm text-on-surface-variant">{[["basics", t.editor.basics], ["content", t.editor.content], ["tests", `${t.editor.tests} (${draft.tests.length})`], ["mutants", `${t.editor.mutants} (${draft.mutants.length})`], ["review", t.editor.skillsReview]].map(([id, label]) => <a key={id} href={`#${id}`} className="block rounded-lg px-2 py-1.5 hover:bg-surface-container hover:text-primary">{label}</a>)}</nav><div className="mt-5 border-t border-outline-variant/50 pt-5"><button type="button" onClick={() => setChecked(true)} className={`${secondaryButton} w-full`}><Check size={16} />{t.editor.basicCheck}</button><button type="button" onClick={() => { downloadDraft(draft); setExported(true); }} className={`${primaryButton} mt-2 w-full`}><Download size={16} />{t.editor.download}</button><p className="mt-3 text-xs text-on-surface-variant">{t.editor.notSaved}</p></div></div>{checked && <div role="status" className={`${card} mt-4 p-4 text-sm`}>{issues.length ? <><p className="flex items-center gap-2 font-semibold text-warning"><AlertTriangle size={17} />{t.editor.needsFix} {issues.length} {t.editor.items}</p><ul className="mt-2 list-inside list-disc space-y-1 text-on-surface-variant">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul></> : <><p className="flex items-center gap-2 font-semibold text-primary"><Check size={17} />{t.editor.passed}</p><p className="mt-1 text-on-surface-variant">{t.editor.passedHelp}</p></>}</div>}{exported && <p role="status" className="mt-3 text-sm text-primary">{t.editor.downloaded}</p>}</aside></div>
  </div>;
}
