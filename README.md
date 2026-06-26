# CodeProve - Marketing Website

Public marketing site for **CodeProve**, the platform that measures coding competency *with* AI - grading the whole problem-solving process (understanding, hypothesis, prompting, verification, testing, debugging), not just the final code.

Built per `feat/CodeProve - Marketing Website Design Proposal.md`. Brand-synced with the CodeProve app (shared color tokens + Inter), but with the marketing-only language the proposal calls for: a real 3D hero, larger radii, stronger motion.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS (brand tokens via CSS variables) |
| 3D hero | react-three-fiber + drei (`MeshTransmissionMaterial` glass) |
| Animation | Framer Motion |
| Icons | lucide-react (no emoji icons) |
| Fonts | Inter (UI) + JetBrains Mono (technical accents) |

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run start   # serve the production build
```

## Key features

- **3D "AI Fluency Core"** - a glass hexagonal prism with 6 glowing nodes mapped to the 6 rubric axes. Lazy-loaded (`next/dynamic`, `ssr:false`), with a static SVG poster fallback for `prefers-reduced-motion`, no-WebGL, and low-memory devices (proposal §5.3).
- **Bilingual VN/EN** - client-side toggle with `localStorage`, default Vietnamese (`lib/i18n.tsx`, all copy in `lib/content.ts`).
- **Dark/Light theme** - toggle with `localStorage`; dark is default (where the 3D/glow shines).
- **11-section landing page** - Hero → Trusted-by → Problem → Comparison → 6D Rubric (interactive radar) → Workspace preview (tilted glass mockup) → Personas (tab switcher) → Integrity → Pricing → FAQ → Final CTA.
- **Extra routes** - `/students`, `/universities`, `/employers`, `/pricing`, `/privacy`, `/terms`, plus `/login` & `/signup` handoff stubs (the real auth flow lives in the app).
- **SEO** - per-route metadata, OpenGraph, `sitemap.xml`, `robots.txt`, all pages statically prerendered.

## Structure

```
app/
  layout.tsx                 # fonts + providers + root metadata
  (marketing)/               # route group (own Navbar/Footer)
    layout.tsx
    page.tsx                 # landing
    students|universities|employers/
    pricing | privacy | terms | login | signup/
  sitemap.ts  robots.ts
components/
  three/                     # FluencyCore, HeroScene, HeroCanvas, HeroPoster
  sections/                  # one file per landing section + persona/legal/auth pages
  layout/                    # Navbar, Footer
  ui/                        # Button, Reveal, Logo, Toggles
lib/
  i18n.tsx  theme.tsx  content.ts
```

## Notes

- 3D appears at only 1–2 points per page (hero + small accent in the final CTA / persona heroes use the lighter SVG poster) to control performance, per proposal §2.7.
- Content sourced from *CodeProve – Build Specification v2.0* (6-axis weights, AI Mentor rules, integrity model) and the design proposal.
- Partner logos in "Trusted by" are placeholders for the MVP stage.

_EXE101 project · FPT University._
