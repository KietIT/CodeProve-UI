"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Plus, Trash2 } from "lucide-react";
import { adminRequest, useAdminAuth } from "../../_auth";
import { useAdminCopy } from "../../_copy";
import { statusTone } from "../../_data";
import { BackLink, card, field, PageHeading, primaryButton, secondaryButton } from "../../_ui";
import type { DebugBlock, DraftMutant, DraftPayload, DraftTest, ExerciseRecord } from "../_api";

type ValidationResult = { code: string; revision: number; valid: boolean; errors: string[] };
const emptyDebug: DebugBlock = { regions: null, explanation_vi: "", explanation_en: "", hint_vi: "", hint_en: "" };
const emptyTest: DraftTest = { description: "", input: "", expected: "", category: "happy", hidden: true };
const emptyMutant: DraftMutant = { code: "", bug_line: 1, bug_type: "", note_vi: "", note_en: "" };

function errorMessage(cause: unknown): string { return cause instanceof Error ? cause.message : "Request failed"; }

export default function AdminExerciseEditorPage({ params }: { params: { code: string } }) {
  const { admin } = useAdminAuth();
  const { locale, t } = useAdminCopy();
  const [record, setRecord] = useState<ExerciseRecord | null>(null);
  const [draft, setDraft] = useState<DraftPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [regionsInput, setRegionsInput] = useState("null");
  const [regionsInvalid, setRegionsInvalid] = useState(false);

  useEffect(() => {
    let active = true;
    adminRequest<ExerciseRecord>(`/admin/exercises/${params.code}`).then((value) => {
      if (active) { setRecord(value); setDraft(structuredClone(value.payload)); setRegionsInput(JSON.stringify(value.payload.debug?.regions ?? null)); setError(""); }
    }).catch((cause: unknown) => { if (active) setError(errorMessage(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.code]);

  if (loading) return <p className="p-5 text-sm">{locale === "vi" ? "Đang tải bài tập..." : "Loading exercise..."}</p>;
  if (!record || !draft) return <div><BackLink href="/admin/exercises">{t.editor.back}</BackLink><p role="alert" className="mt-4 text-error">{error || t.editor.notFound}</p></div>;

  const dirty = JSON.stringify(draft) !== JSON.stringify(record.payload);
  const editable = record.status === "draft" || record.status === "published";
  const revision = record.revision;
  const canReview = record.author_user_id !== null && record.author_user_id !== admin?.id;
  const setValue = <K extends keyof DraftPayload>(key: K, value: DraftPayload[K]) => {
    setDraft((old) => old ? { ...old, [key]: value } : old);
    setValidation(null); setNotice("");
  };
  const updateTest = (index: number, patch: Partial<DraftTest>) => setValue("tests", draft.tests.map((item, position) => position === index ? { ...item, ...patch } : item));
  const updateMutant = (index: number, patch: Partial<DraftMutant>) => setValue("mutants", draft.mutants.map((item, position) => position === index ? { ...item, ...patch } : item));
  const updateDebug = (patch: Partial<DebugBlock>) => setValue("debug", { ...(draft.debug ?? emptyDebug), ...patch });

  async function save() {
    if (!record || !draft || regionsInvalid) return;
    setBusy(true); setError(""); setNotice("");
    try {
      let current = record;
      if (current.revision === null) {
        current = await adminRequest<ExerciseRecord>(`/admin/exercises/${draft.code}/draft`, { method: "POST" });
      }
      if (JSON.stringify(draft) !== JSON.stringify(current.payload)) {
        current = await adminRequest<ExerciseRecord>(`/admin/exercises/drafts/${draft.code}`, {
          method: "PUT", body: { expected_revision: current.revision, payload: draft },
        });
      }
      setRecord(current); setDraft(structuredClone(current.payload)); setValidation(null);
      setNotice(locale === "vi" ? "Đã lưu bản nháp." : "Draft saved.");
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(false); }
  }

  async function runAction(action: "validate" | "submit" | "approve" | "reject" | "publish") {
    if (!record || !draft) return;
    if (regionsInvalid) { setError(locale === "vi" ? "Sửa JSON vùng lỗi trước khi tiếp tục." : "Fix the bug regions JSON first."); return; }
    if (dirty || revision === null) { setError(locale === "vi" ? "Lưu bản nháp trước khi tiếp tục." : "Save the draft first."); return; }
    if (action === "publish" && !window.confirm(locale === "vi" ? "Xuất bản bài tập này cho người học?" : "Publish this exercise to learners?")) return;
    setBusy(true); setError(""); setNotice("");
    try {
      if (action === "validate") {
        const result = await adminRequest<ValidationResult>(`/admin/exercises/drafts/${draft.code}/validate`, {
          method: "POST", body: { expected_revision: revision },
        });
        setValidation(result);
      } else {
        const result = await adminRequest<ExerciseRecord>(`/admin/exercises/drafts/${draft.code}/${action}`, {
          method: "POST", body: { expected_revision: revision },
        });
        setRecord(result); setDraft(structuredClone(result.payload)); setValidation(null);
        setNotice(locale === "vi" ? "Đã cập nhật trạng thái bài tập." : "Exercise status updated.");
      }
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(false); }
  }

  const label = (vi: string, en: string) => locale === "vi" ? vi : en;
  const textField = (key: keyof DraftPayload, vi: string, en: string, rows = 3, code = false) =>
    <label className="block text-sm font-semibold"><span className="mb-1.5 block">{label(vi, en)}</span><textarea rows={rows} disabled={!editable || busy} value={String(draft[key] ?? "")}
      onChange={(event) => setValue(key, event.target.value as never)} spellCheck={!code}
      className={`${field} ${code ? "font-mono" : ""}`} /></label>;

  return <div className="pb-12">
    <BackLink href="/admin/exercises">{t.editor.back}</BackLink>
    <PageHeading eyebrow={`${record.code} · ${draft.level} · ${label("phiên bản", "revision")} ${revision ?? "—"}`}
      title={draft.title} description={label("Lưu nháp, kiểm tra, nhờ admin khác duyệt rồi xuất bản.", "Save, validate, get approval from another admin, then publish.")}
      action={<span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusTone[record.status]}`}>{t.common[record.status]}</span>} />
    {error && <p role="alert" className="mb-4 rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">{notice}</p>}
    {dirty && <p className="mb-4 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">{label("Có thay đổi chưa lưu.", "Unsaved changes.")}</p>}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-6">
        <section className={`${card} space-y-4 p-5 sm:p-6`}><h2 className="text-lg font-bold">{t.editor.basics}</h2>
          <p className="text-xs text-on-surface-variant">{label("Mã bài:", "Code:")} {draft.code}</p>
          <label className="block text-sm font-semibold">{t.editor.title}<input className={`${field} mt-1.5`} disabled={!editable || busy} value={draft.title} onChange={(e) => setValue("title", e.target.value)} /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">{label("Độ khó", "Difficulty")}<select className={`${field} mt-1.5`} disabled={!editable || busy} value={draft.difficulty} onChange={(e) => setValue("difficulty", e.target.value as DraftPayload["difficulty"])}><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
            <label className="text-sm font-semibold">{label("Cấp độ", "Level")}<select className={`${field} mt-1.5`} disabled={!editable || busy} value={draft.level} onChange={(e) => setValue("level", e.target.value as DraftPayload["level"])}><option>fresher</option><option>junior</option><option>senior</option></select></label>
            <label className="text-sm font-semibold">{label("Loại bài", "Type")}<select className={`${field} mt-1.5`} disabled={!editable || busy} value={draft.kind} onChange={(e) => { const kind = e.target.value as DraftPayload["kind"]; setDraft((old) => old ? { ...old, kind, debug: kind === "debug" ? old.debug ?? structuredClone(emptyDebug) : null } : old); setRegionsInput("null"); setRegionsInvalid(false); setValidation(null); }}><option value="implement">Implement</option><option value="debug">Debug</option></select></label>
            <label className="text-sm font-semibold">{label("Chủ đề", "Category")}<input className={`${field} mt-1.5`} disabled={!editable || busy} value={draft.category} onChange={(e) => setValue("category", e.target.value)} /></label>
          </div>
          <p className="text-xs text-on-surface-variant">{label("Ngôn ngữ thực thi: Python", "Execution language: Python")}</p>
        </section>
        <section className={`${card} space-y-4 p-5 sm:p-6`}><h2 className="text-lg font-bold">{t.editor.content}</h2>
          {textField("description", "Mô tả ngắn", "Short description", 2)}
          {textField("learning_objective", "Mục tiêu học tập", "Learning objective", 2)}
          {textField("summary", t.editor.summary, "Problem statement", 5)}
          {textField("starter_code", t.editor.starter, "Starter code", 8, true)}
          {textField("hint", t.editor.hint, "Hint", 3)}
          {textField("reference_solution", t.editor.reference, "Reference solution · admins only", 8, true)}
          <label className="block text-sm font-semibold">{label("Từ khóa chủ đề (ngăn cách bằng dấu phẩy)", "Topic keywords (comma separated)")}<input className={`${field} mt-1.5`} disabled={!editable || busy} value={draft.domain_keywords.join(", ")} onChange={(e) => setValue("domain_keywords", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} /></label>
          <label className="block text-sm font-semibold">{t.editor.skills}<input className={`${field} mt-1.5`} disabled={!editable || busy} value={draft.skills.join(", ")} onChange={(e) => setValue("skills", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} /></label>
        </section>
        <section className={`${card} p-5 sm:p-6`}><div className="flex items-center justify-between gap-2"><div><h2 className="text-lg font-bold">{t.editor.tests}</h2><p className="text-xs text-on-surface-variant">{t.editor.testsHelp}</p></div><button type="button" disabled={!editable || busy} onClick={() => setValue("tests", [...draft.tests, { ...emptyTest }])} className={secondaryButton}><Plus size={16} />{t.editor.addTest}</button></div>
          <div className="mt-4 space-y-4">{draft.tests.map((test, index) => <div key={index} className="rounded-xl border border-outline-variant/60 p-4"><div className="mb-3 flex justify-between"><strong>Test #{index + 1}</strong><button type="button" aria-label={`${t.editor.removeTest} ${index + 1}`} disabled={!editable || busy} onClick={() => setValue("tests", draft.tests.filter((_, i) => i !== index))}><Trash2 size={16} /></button></div><div className="grid gap-3 sm:grid-cols-2"><label className="sm:col-span-2 text-sm">{t.editor.descriptionLabel}<input className={`${field} mt-1`} disabled={!editable || busy} value={test.description} onChange={(e) => updateTest(index, { description: e.target.value })} /></label><label className="text-sm">{t.editor.input}<input className={`${field} mt-1 font-mono`} disabled={!editable || busy} value={test.input} onChange={(e) => updateTest(index, { input: e.target.value })} /></label><label className="text-sm">{t.editor.expected}<input className={`${field} mt-1 font-mono`} disabled={!editable || busy} value={test.expected} onChange={(e) => updateTest(index, { expected: e.target.value })} /></label><label className="text-sm">{t.editor.category}<select className={`${field} mt-1`} disabled={!editable || busy} value={test.category} onChange={(e) => updateTest(index, { category: e.target.value as DraftTest["category"] })}><option>happy</option><option>boundary</option><option>edge</option><option>error</option></select></label><label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" disabled={!editable || busy} checked={test.hidden} onChange={(e) => updateTest(index, { hidden: e.target.checked })} />{t.editor.hidden}</label></div></div>)}</div>
        </section>
        <section className={`${card} p-5 sm:p-6`}><div className="flex items-center justify-between"><h2 className="text-lg font-bold">{t.editor.mutants}</h2><button type="button" disabled={!editable || busy} onClick={() => setValue("mutants", [...draft.mutants, { ...emptyMutant }])} className={secondaryButton}><Plus size={16} />{t.editor.addMutant}</button></div><div className="mt-4 space-y-4">{draft.mutants.map((mutant, index) => <div key={index} className="rounded-xl border border-outline-variant/60 p-4"><div className="mb-3 flex justify-between"><strong>Mutant #{index + 1}</strong><button type="button" aria-label={`${t.editor.removeMutant} ${index + 1}`} disabled={!editable || busy} onClick={() => setValue("mutants", draft.mutants.filter((_, i) => i !== index))}><Trash2 size={16} /></button></div><div className="grid gap-3 sm:grid-cols-2"><label className="sm:col-span-2 text-sm">Code<textarea rows={5} className={`${field} mt-1 font-mono`} disabled={!editable || busy} value={mutant.code} onChange={(e) => updateMutant(index, { code: e.target.value })} /></label><label className="text-sm">{t.editor.bugLine}<input type="number" min={1} className={`${field} mt-1`} disabled={!editable || busy} value={mutant.bug_line} onChange={(e) => updateMutant(index, { bug_line: Number(e.target.value) })} /></label><label className="text-sm">{t.editor.bugType}<input className={`${field} mt-1`} disabled={!editable || busy} value={mutant.bug_type} onChange={(e) => updateMutant(index, { bug_type: e.target.value })} /></label><label className="text-sm">{t.editor.noteVi}<input className={`${field} mt-1`} disabled={!editable || busy} value={mutant.note_vi} onChange={(e) => updateMutant(index, { note_vi: e.target.value })} /></label><label className="text-sm">{t.editor.noteEn}<input className={`${field} mt-1`} disabled={!editable || busy} value={mutant.note_en} onChange={(e) => updateMutant(index, { note_en: e.target.value })} /></label></div></div>)}</div></section>
        {draft.kind === "debug" && <section className={`${card} space-y-4 p-5 sm:p-6`}><h2 className="text-lg font-bold">{label("Giải thích bài sửa lỗi", "Debug explanation")}</h2>{(["explanation_vi", "explanation_en", "hint_vi", "hint_en"] as const).map((key) => <label key={key} className="block text-sm font-semibold">{key}<textarea rows={2} className={`${field} mt-1`} disabled={!editable || busy} value={draft.debug?.[key] ?? ""} onChange={(e) => updateDebug({ [key]: e.target.value })} /></label>)}<label className="block text-sm font-semibold">{label("Vùng lỗi (JSON, tùy chọn)", "Bug regions (JSON, optional)")}<input className={`${field} mt-1 font-mono`} disabled={!editable || busy} value={regionsInput} onChange={(e) => { setRegionsInput(e.target.value); setRegionsInvalid(true); }} onBlur={() => { try { const parsed: unknown = JSON.parse(regionsInput); if (parsed !== null && !Array.isArray(parsed)) throw new Error(); updateDebug({ regions: parsed as number[][] | null }); setRegionsInvalid(false); setError(""); } catch { setError(label("JSON vùng lỗi chưa hợp lệ.", "Invalid regions JSON.")); } }} /></label></section>}
        <section className={`${card} space-y-3 p-5 sm:p-6`}><h2 className="text-lg font-bold">{label("Giới hạn test ẩn", "Hidden test limit")}</h2><p className="text-xs text-on-surface-variant">{label("Mặc định ít nhất 5 test ẩn. Chỉ giảm xuống 3–5 khi có lý do rõ ràng.", "Default minimum is 5 hidden tests. Lower to 3–5 only with a reason.")}</p><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.limits !== null} disabled={!editable || busy} onChange={(e) => setValue("limits", e.target.checked ? { min_hidden: 3, reason: "" } : null)} />{label("Dùng ngoại lệ", "Use exception")}</label>{draft.limits && <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">{label("Số test ẩn tối thiểu", "Minimum hidden tests")}<input type="number" min={3} max={5} className={`${field} mt-1`} disabled={!editable || busy} value={draft.limits.min_hidden} onChange={(e) => setValue("limits", { ...draft.limits!, min_hidden: Number(e.target.value) })} /></label><label className="text-sm">{label("Lý do", "Reason")}<input className={`${field} mt-1`} disabled={!editable || busy} value={draft.limits.reason} onChange={(e) => setValue("limits", { ...draft.limits!, reason: e.target.value })} /></label></div>}</section>
      </div>
      <aside className="xl:sticky xl:top-24 xl:self-start"><div className={`${card} space-y-3 p-5`}><h2 className="font-bold">{label("Quy trình duyệt", "Review workflow")}</h2><p className="text-xs text-on-surface-variant">{label("Người tạo/sửa cuối:", "Last author:")} #{record.author_user_id ?? "—"}<br />{label("Người duyệt:", "Reviewer:")} #{record.reviewer_user_id ?? "—"}</p>
        {editable && <button type="button" disabled={busy || regionsInvalid || (!dirty && revision !== null && record.status === "draft")} onClick={() => void save()} className={`${primaryButton} w-full`}>{label("Lưu bản nháp", "Save draft")}</button>}
        {revision !== null && <button type="button" disabled={busy || dirty} onClick={() => void runAction("validate")} className={`${secondaryButton} w-full`}><Check size={16} />{label("Kiểm tra đầy đủ", "Full validation")}</button>}
        {record.status === "draft" && <button type="button" disabled={busy || dirty} onClick={() => void runAction("submit")} className={`${secondaryButton} w-full`}>{label("Gửi duyệt", "Submit for review")}</button>}
        {record.status === "review" && canReview && <><button type="button" disabled={busy} onClick={() => void runAction("approve")} className={`${primaryButton} w-full`}>{label("Duyệt bài", "Approve")}</button><button type="button" disabled={busy} onClick={() => void runAction("reject")} className={`${secondaryButton} w-full`}>{label("Trả lại nháp", "Reject")}</button></>}
        {record.status === "review" && !canReview && <p className="text-xs text-on-surface-variant">{label("Cần admin khác duyệt bài này.", "Another admin must review this draft.")}</p>}
        {record.status === "approved" && <button type="button" disabled={busy} onClick={() => void runAction("publish")} className={`${primaryButton} w-full`}>{label("Xuất bản", "Publish")}</button>}
        {record.status === "published" && <p className="text-xs text-on-surface-variant">{label("Chỉnh sửa rồi lưu sẽ mở phiên bản nháp mới. Bài đang xuất bản vẫn giữ nguyên đến lần xuất bản tiếp theo.", "Edit and save to open a new draft. The current published version stays live until the next publication.")}</p>}
      </div>{validation && <div role="status" className={`${card} mt-4 p-4 text-sm`}>{validation.valid ? <p className="flex items-center gap-2 text-primary"><Check size={17} />{label("Kiểm tra đạt.", "Validation passed.")}</p> : <><p className="flex items-center gap-2 font-semibold text-warning"><AlertTriangle size={17} />{label("Cần sửa:", "Fix:")} {validation.errors.length}</p><ul className="mt-2 list-inside list-disc space-y-1">{validation.errors.map((issue, index) => <li key={index}>{issue}</li>)}</ul></>}</div>}</aside>
    </div>
  </div>;
}
