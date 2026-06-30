"use client";

import { Check, Lock, Sparkle, TriangleAlert } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n";

export function WorkspaceMockup() {
  return (
    <div className="group relative [perspective:1600px]">
      <div
        className="hero-glow absolute -inset-6 -z-10 opacity-70 blur-2xl"
        aria-hidden="true"
      />
      <div className="origin-center transition-transform duration-500 [transform:rotateX(8deg)_rotateY(-16deg)] group-hover:[transform:rotateX(4deg)_rotateY(-8deg)]">
        <div className="workspace-mockup overflow-hidden rounded-card border border-border bg-[#0a0f14] shadow-card">
          {/* window chrome */}
          <div className="flex items-center justify-between border-b border-border bg-bg-soft px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="font-mono text-[11px] text-muted">codeprove --assess · session #4f2a</span>
            <span className="inline-flex items-center gap-1 rounded-pill bg-surface px-2 py-0.5 font-mono text-[10px] text-teal">
              <Lock className="h-3 w-3" /> fullscreen-lock
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr]">
            {/* editor */}
            <div className="border-b border-border p-4 font-mono text-[12px] leading-6 sm:border-b-0 sm:border-r">
              <pre className="overflow-hidden">
                <code>
                  <span className="text-muted/50">1  </span>
                  <span className="text-glowviolet">def</span>{" "}
                  <span className="text-teal">is_prime</span>
                  <span className="text-content">(n):</span>
                  {"\n"}
                  <span className="text-muted/50">2  </span>
                  <span className="text-content">    </span>
                  <span className="text-glowviolet">if</span>{" "}
                  <span className="text-content">n &lt; </span>
                  <span className="text-[#febc2e]">2</span>
                  <span className="text-content">:</span>
                  {"\n"}
                  <span className="text-muted/50">3  </span>
                  <span className="text-content">        </span>
                  <span className="text-glowviolet">return</span>{" "}
                  <span className="text-[#ff7b72]">False</span>
                  {"\n"}
                  <span className="text-muted/50">4  </span>
                  <span className="text-glowviolet">    for</span>{" "}
                  <span className="text-content">i </span>
                  <span className="text-glowviolet">in</span>{" "}
                  <span className="text-teal">range</span>
                  <span className="text-content">(</span>
                  <span className="text-[#febc2e]">2</span>
                  <span className="text-content">, </span>
                  <span className="text-teal">int</span>
                  <span className="text-content">(n**</span>
                  <span className="text-[#febc2e]">0.5</span>
                  <span className="text-content">)+</span>
                  <span className="text-[#febc2e]">1</span>
                  <span className="text-content">):</span>
                  {"\n"}
                  <span className="text-muted/50">5  </span>
                  <span className="text-content">        </span>
                  <span className="text-glowviolet">if</span>{" "}
                  <span className="text-content">n % i == </span>
                  <span className="text-[#febc2e]">0</span>
                  <span className="text-content">:</span>
                  {"\n"}
                  <span className="text-muted/50">6  </span>
                  <span className="text-content">            </span>
                  <span className="text-glowviolet">return</span>{" "}
                  <span className="text-[#ff7b72]">False</span>
                  {"\n"}
                  <span className="text-muted/50">7  </span>
                  <span className="text-glowviolet">    return</span>{" "}
                  <span className="text-[#7ee787]">True</span>
                </code>
              </pre>

              <div className="mt-4 flex items-center gap-2 rounded-pill border border-teal/30 bg-teal/10 px-3 py-1.5 text-[11px] text-teal">
                <Check className="h-3.5 w-3.5" />
                TEST_RUN · 4/4 passed · coverage 0.82
              </div>
            </div>

            {/* AI Mentor side-box */}
            <div className="flex flex-col gap-3 bg-bg-soft/60 p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-content">
                <Sparkle className="h-3.5 w-3.5 text-teal" /> Ciel
              </div>

              <div className="rounded-2xl rounded-tl-sm border border-border bg-surface px-3 py-2 text-[11px] leading-relaxed text-muted">
                Trước khi viết code, giả thuyết của bạn cho bài này là gì?
              </div>
              <div className="ml-6 rounded-2xl rounded-tr-sm border border-teal/30 bg-teal/10 px-3 py-2 text-[11px] leading-relaxed text-content">
                Kiểm tra ước số từ 2 đến √n để tối ưu.
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-[#febc2e]/30 bg-[#febc2e]/10 px-3 py-2 text-[11px] leading-relaxed text-[#febc2e]">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>verification-trap: đoạn AI gợi ý có 1 lỗi off-by-one - bạn có thấy không?</span>
              </div>

              <div className="mt-auto flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-2">
                <span className="font-mono text-[11px] text-muted/60">{"> prompt..."}</span>
                <span className="ml-auto h-3.5 w-1.5 animate-pulse-glow bg-teal" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkspacePreview() {
  const { t } = useI18n();

  return (
    <section id="workspace" className="scroll-mt-24 overflow-hidden bg-bg-soft py-20 sm:py-28">
      <div className="container-site grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {t.workspace.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {t.workspace.body}
          </p>
          <ul className="mt-7 space-y-3">
            {t.workspace.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-content">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/15">
                  <Check className="h-3.5 w-3.5 text-teal" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="py-6">
          <WorkspaceMockup />
        </Reveal>
      </div>
    </section>
  );
}
