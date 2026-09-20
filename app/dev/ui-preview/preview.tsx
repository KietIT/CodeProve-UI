"use client";

import { useState } from "react";
import { ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { StatBlock } from "@/components/ui/StatBlock";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { ThemeToggle } from "@/components/ui/Toggles";

const swatches = [
  { label: "Background", style: "bg-bg" }, { label: "Surface", style: "bg-surface" },
  { label: "Accent", style: "bg-accent" }, { label: "Warning", style: "bg-warning" },
  { label: "Danger", style: "bg-danger" }, { label: "Content", style: "bg-content" },
];
const avatars = [{ name: "An Nguyen" }, { name: "Binh Tran" }, { name: "Chi Le" }, { name: "Dung Pham" }];

export function Preview() {
  const [clicks, setClicks] = useState(0);
  return (
    <main className="mx-auto max-w-site space-y-10 px-5 py-10 sm:px-8">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-4">
          <SectionBadge icon={<Layers size={14} />}>CodeProve · Phase 1</SectionBadge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-display-lg">UI primitives</h1>
          <p className="max-w-xl text-muted">Trang kiểm tra nội bộ. Dữ liệu bên dưới chỉ là ví dụ hiển thị.</p>
        </div>
        <ThemeToggle />
      </header>
      <section aria-labelledby="tokens-title" className="space-y-4">
        <h2 id="tokens-title" className="text-xl font-semibold">Tokens</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {swatches.map(s => <Card key={s.label} className="space-y-3 p-3"><div data-swatch={s.label} className={`h-16 rounded-pill border border-border ${s.style}`} /><p className="text-sm text-muted">{s.label}</p></Card>)}
        </div>
      </section>
      <section aria-labelledby="buttons-title" className="space-y-4">
        <h2 id="buttons-title" className="text-xl font-semibold">Button</h2>
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center gap-3"><Button onClick={() => setClicks(c => c + 1)}>Primary <ArrowRight size={16} /></Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="vivid">Vivid</Button></div>
          <div className="flex flex-wrap items-center gap-3"><Button size="sm">Small</Button><Button size="md">Medium</Button><Button size="lg">Large</Button></div>
          <div className="flex flex-wrap items-center gap-3"><Button disabled>Disabled button</Button><Button href="/workspace" disabled>Disabled link</Button><Button href="#levels" variant="secondary">Link đến LevelBadge</Button></div>
          <p role="status" className="text-sm text-muted">Primary đã bấm: {clicks}</p>
        </Card>
      </section>
      <section aria-labelledby="cards-title" className="space-y-4">
        <h2 id="cards-title" className="text-xl font-semibold">Card · StatBlock</h2>
        <div className="grid gap-4 md:grid-cols-3"><Card><StatBlock value="24" label="Bài tập" description="Default card · dữ liệu minh họa" /></Card><Card variant="outlined"><StatBlock value="82/100" label="Điểm hiển thị" description="Outlined card · truyền sẵn qua props" /></Card><Card variant="accent"><StatBlock value="—" label="Chưa có dữ liệu" description="Accent card · không tự tính điểm" /></Card></div>
      </section>
      <section aria-labelledby="badges-title" className="space-y-4">
        <h2 id="badges-title" className="text-xl font-semibold">Badge · SectionBadge</h2>
        <Card className="flex flex-wrap items-center gap-3"><Badge>Neutral</Badge><Badge tone="accent">Accent</Badge><Badge tone="success">Success</Badge><Badge tone="warning">Warning</Badge><Badge tone="danger">Danger</Badge><SectionBadge icon={<Layers size={14} />}>Section label</SectionBadge></Card>
      </section>
      <section id="levels" aria-labelledby="levels-title" className="space-y-4">
        <h2 id="levels-title" className="text-xl font-semibold">LevelBadge</h2>
        <Card className="flex flex-wrap gap-3"><LevelBadge level="Easy" /><LevelBadge level="Medium" /><LevelBadge level="Hard" /><LevelBadge level="green" label="Không có cờ" /><LevelBadge level="yellow" label="Cần xem lại" /><LevelBadge level="red" label="Bị gắn cờ" /></Card>
      </section>
      <section aria-labelledby="avatars-title" className="space-y-4">
        <h2 id="avatars-title" className="text-xl font-semibold">AvatarStack</h2>
        <Card className="flex flex-col items-start gap-5"><AvatarStack avatars={avatars} total={24} label="người làm" /><AvatarStack avatars={avatars.slice(0, 2)} label="người làm" /><AvatarStack avatars={[]} label="người làm" /></Card>
      </section>
    </main>
  );
}
