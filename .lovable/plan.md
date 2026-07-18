
# Aureate — Build Plan

A multi-page frontend prototype (mock data only, no backend) for a premium social media automation platform. Deep navy background, warm gold accents, cream text, Playfair Display headers + Poppins body.

## Design System

Update `src/styles.css` and `src/routes/__root.tsx`:
- Load Playfair Display + Poppins via `<link>` in root head.
- Redefine tokens (oklch) for navy `#0A1128` background, gold `#D4AF37` primary/accent, cream `#F5F1E8` foreground, muted navy surfaces for cards, subtle gold borders.
- Add `--font-serif` (Playfair) and `--font-sans` (Poppins); apply serif to h1–h4, sans to body.
- Update root `head()` with real Aureate title/description/OG tags (replacing "Lovable App").

## Routes (file-based, TanStack Router)

Public:
- `src/routes/index.tsx` — Landing page (replace placeholder).

Authenticated shell (pathless layout):
- `src/routes/_app.tsx` — Layout with left sidebar nav + top bar, renders `<Outlet />` plus persistent floating "+ New Post" (bottom-right) and mic button (bottom-left, opens a mock voice-command modal).
- `src/routes/_app.onboarding.tsx` — 3-step wizard (account type → brand voice → connect platform).
- `src/routes/_app.dashboard.tsx` — Snapshot, approvals queue, quick stats, weekly strip.
- `src/routes/_app.calendar.tsx` — Month/week toggle grid, day-click opens side Sheet with queued posts.
- `src/routes/_app.new-post.tsx` — Upload/AI drop zone, caption editor, per-platform preview cards with correct aspect ratios (IG square/portrait, Story 9:16, LinkedIn landscape, X compact, Pinterest 2:3, YouTube 16:9, Threads, FB), approval toggle.
- `src/routes/_app.schedule.tsx` — Date/time picker, "best time" suggestion chip, auto-post toggle.
- `src/routes/_app.connections.tsx` — Platform cards with connected/not-connected states.
- `src/routes/_app.messaging.tsx` — WhatsApp/Telegram bot connect + approval routing.
- `src/routes/_app.analytics.tsx` — Recharts (already available via shadcn) engagement bars, posts-over-time line, top post callout.
- `src/routes/_app.team.tsx` — Team roster with Drafter/Approver roles (org only; individual accounts see an upgrade prompt).
- `src/routes/_app.brand.tsx` — Brand voice editor, logo/color inputs, content pillars list.

## Shared Components (`src/components/`)

- `AppSidebar.tsx` — shadcn Sidebar with Aureate wordmark, nav items, account switcher stub.
- `AppTopbar.tsx` — Breadcrumb + search + notifications bell + avatar.
- `FloatingActions.tsx` — Fixed "+ New Post" (gold) and mic (navy outlined gold) buttons; mic opens a Dialog with animated waveform + fake transcript.
- `PlatformIcon.tsx` — Inline SVGs for IG/FB/LI/TT/X/Pinterest/YT/Threads with brand colors on hover, gold on default.
- `PostPreviewCard.tsx` — Renders a post in the correct platform frame/aspect ratio.
- `EmptyState.tsx`, `LoadingState.tsx` (skeleton), populated variants for lists.
- `MockData` module (`src/lib/mock-data.ts`) — Realistic captions, brand names ("Meridian Coffee Co.", "Northlane Studio", "Fern & Fig Interiors"), scheduled posts across next 30 days, engagement metrics, team members ("Ana Reyes — Approver", "Jordan Kim — Drafter"), content pillars ("Behind the bar", "Origin stories", "Weekend rituals").

## State (client-only)

Zustand store `src/lib/store.ts` holds: current account type (individual/org), onboarding completion, connected platforms set, require-approval defaults, view-mode toggles. No backend, no auth — landing "Get Started" routes to `/onboarding`, which routes to `/dashboard`. Team route conditionally renders based on account type from store.

## Empty/Loading/Populated States

Each list surface (dashboard approvals, calendar day panel, connections, team, analytics) has three visual states toggleable via a small dev switch in-page OR shown across different mock scenarios by default (e.g. Instagram connected + LinkedIn pending + TikTok disconnected on Connections page).

## Technical Notes

- Use shadcn primitives already in project: Sidebar, Sheet, Dialog, Tabs, Calendar, Card, Badge, Button, Switch, Toggle, Progress, Chart (recharts).
- Font loading: `<link>` tags in `__root.tsx` head (never `@import` remote URLs).
- All colors via semantic tokens; no hardcoded hex in components.
- Mic button is UI-only (mock transcript animation) — no Web Speech API integration.
- Landing page CTAs use `<Link to="/onboarding">`.

## Out of Scope

- Real auth, real social API connections, real AI generation, real scheduling backend.
- Lovable Cloud is not enabled (pure frontend prototype).
