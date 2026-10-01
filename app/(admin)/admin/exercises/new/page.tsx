"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { adminRequest } from "../../_auth";
import { useAdminCopy } from "../../_copy";
import { BackLink, card, field, PageHeading, primaryButton } from "../../_ui";
import { blankPayload, type ExerciseRecord } from "../_api";

export default function NewExercisePage() {
  const { locale } = useAdminCopy();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const record = await adminRequest<ExerciseRecord>("/admin/exercises/drafts", {
        method: "POST", body: blankPayload(code.trim().toUpperCase(), title.trim()),
      });
      router.push(`/admin/exercises/${record.code}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Request failed"); }
    finally { setBusy(false); }
  }

  return <div className="max-w-2xl"><BackLink href="/admin/exercises">{locale === "vi" ? "Danh sách bài tập" : "Exercise list"}</BackLink>
    <PageHeading eyebrow={locale === "vi" ? "Nội dung học tập" : "Learning content"}
      title={locale === "vi" ? "Tạo bài nháp" : "New exercise draft"}
      description={locale === "vi" ? "Tạo mã bài và tên, rồi bổ sung nội dung, test và lời giải trong bản nháp." : "Create a code and title, then complete the content, tests and solution in the draft."} />
    {error && <p role="alert" className="mb-4 rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error">{error}</p>}
    <form onSubmit={create} className={`${card} space-y-5 p-6`}>
      <label className="block text-sm font-semibold">{locale === "vi" ? "Mã bài (CP-001)" : "Exercise code (CP-001)"}<input className={`${field} mt-2`} value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} pattern="CP-[0-9]{3}" placeholder="CP-301" required /></label>
      <label className="block text-sm font-semibold">{locale === "vi" ? "Tên bài tập" : "Title"}<input className={`${field} mt-2`} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} required /></label>
      <button type="submit" disabled={busy} className={primaryButton}>{busy ? "..." : locale === "vi" ? "Tạo bản nháp" : "Create draft"}</button>
    </form>
  </div>;
}
