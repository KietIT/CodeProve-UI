"use client";

import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n";

export function ComingSoonBadge({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return <Badge className={`whitespace-nowrap px-2 py-0.5 text-[10px] ${className}`}>{t.common.comingSoon}</Badge>;
}
