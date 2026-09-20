import type { HTMLAttributes } from "react";

export type Avatar = { name: string; src?: string };
export type AvatarStackProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  avatars: readonly Avatar[];
  maxVisible?: number;
  total?: number;
  label?: string;
};
export function AvatarStack({ avatars, maxVisible = 3, total = avatars.length, label = "participants", className = "", ...props }: AvatarStackProps) {
  const limit = Number.isFinite(maxVisible) ? Math.max(0, Math.floor(maxVisible)) : 3;
  const count = Math.max(avatars.length, Number.isFinite(total) ? Math.floor(total) : avatars.length);
  const visible = avatars.slice(0, limit);
  const remaining = count - visible.length;
  return (
    <div {...props} role="group" aria-label={`${count} ${label}`} className={`inline-flex items-center gap-3 ${className}`}>
      <div className="flex -space-x-2">
        {visible.map((avatar, index) => {
          const parts = avatar.name.trim().split(/\s+/).filter(Boolean);
          const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : (parts[0]?.slice(0, 2) ?? "?");
          return (
            <span key={`${avatar.name}-${index}`} title={avatar.name} className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-bg bg-surface text-xs font-semibold uppercase text-content">
              {avatar.src ? (
                // Caller-provided avatar URLs; keep this primitive independent of image services.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar.src} alt={avatar.name} width={36} height={36} className="h-full w-full object-cover" />
              ) : <span aria-label={avatar.name}>{initials.toUpperCase()}</span>}
            </span>
          );
        })}
        {remaining > 0 && <span aria-hidden="true" className="relative inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full border-2 border-bg bg-accent/15 px-1 text-xs font-semibold tabular-nums text-accent">+{remaining}</span>}
      </div>
      <span aria-hidden="true" className="text-sm text-muted">{count} {label}</span>
    </div>
  );
}
