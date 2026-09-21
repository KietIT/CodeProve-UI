"use client";

import { LevelBadge } from "@/components/ui/LevelBadge";
import type { ReportOut } from "@/lib/types/report";

/**
 * Academic-integrity flag for a report. Reuses the Phase 1 LevelBadge
 * (green/yellow/red) rather than introducing new colours. Display only.
 */
export function IntegrityFlags({
  status,
  label,
}: {
  status: ReportOut["integrity_status"];
  label: string;
}) {
  // integrity_status maps 1:1 to LevelBadge's semantic level tones.
  return <LevelBadge level={status} label={label} />;
}
