import { PostArt } from "./PostArt";
import { PlatformIcon } from "./PlatformIcon";
import type { Platform } from "@/lib/store";
import { Mic, Sparkles } from "lucide-react";

const rows: { platform: Platform; caption: string; status: string; statusClass: string }[] = [
  { platform: "instagram", caption: "The Ethiopia Yirgacheffe just landed…", status: "Auto-post", statusClass: "border-primary/40 bg-primary/15 text-primary" },
  { platform: "linkedin", caption: "Three years in: what running a roaster taught me…", status: "Needs approval", statusClass: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  { platform: "threads", caption: "Kept a notebook of every drink we pulled…", status: "Posted", statusClass: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
];

export function HeroMockup() {
  return (
    <div className="relative mx-auto mt-16 max-w-3xl [perspective:1600px]">
      <div className="rounded-2xl border border-primary/25 bg-card/80 shadow-[0_50px_120px_-30px_oklch(0.78_0.13_85/0.35)] backdrop-blur [transform:rotateX(6deg)_rotateY(-4deg)]">
        <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
          <span className="size-2.5 rounded-full bg-destructive/60" />
          <span className="size-2.5 rounded-full bg-amber-400/60" />
          <span className="size-2.5 rounded-full bg-emerald-400/60" />
          <span className="ml-3 rounded-full bg-background/60 px-3 py-1 text-[11px] text-muted-foreground">app.aureate.co/dashboard</span>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-0">
          <div className="hidden flex-col items-center gap-4 border-r border-border/50 px-3 py-6 sm:flex">
            {(["instagram", "linkedin", "x", "tiktok", "threads"] as Platform[]).map((p) => (
              <div key={p} className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PlatformIcon platform={p} className="size-3.5" />
              </div>
            ))}
          </div>
          <div className="min-w-0 p-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Posts this week", value: "13" },
                { label: "Engagement", value: "6.1%" },
                { label: "Scheduled", value: "22" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border/50 bg-background/40 p-3 text-left">
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className="mt-1 font-serif text-xl text-cream">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {rows.map((r) => (
                <div key={r.platform} className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/30 p-2.5 text-left">
                  <PostArt seed={r.platform} className="h-9 w-9 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <PlatformIcon platform={r.platform} className="size-2.5" />
                      <span className="truncate">{r.caption}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] ${r.statusClass}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -right-4 -top-4 flex items-center gap-2 rounded-full border border-primary/30 bg-card px-3 py-2 text-xs shadow-lg sm:-right-8">
        <Sparkles className="size-3.5 text-primary" />
        <span>Caption drafted in Meridian's voice</span>
      </div>
      <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-full border border-primary/30 bg-card px-3 py-2 text-xs shadow-lg sm:-left-8">
        <Mic className="size-3.5 text-primary" />
        <span>"Schedule it for Saturday"</span>
      </div>
    </div>
  );
}
