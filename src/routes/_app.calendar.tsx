import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { platformMeta } from "@/lib/mock-data";
import { PlatformIcon } from "@/components/PlatformIcon";
import { StatusBadge } from "@/components/StatusBadge";
import { PostArt } from "@/components/PostArt";
import { EmptyState } from "@/components/EmptyState";
import { usePosts } from "@/lib/queries";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { Platform } from "@/lib/store";

export const Route = createFileRoute("/_app/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const { data: posts, isLoading } = usePosts();
  const [view, setView] = useState<"month" | "week">("month");
  const [selected, setSelected] = useState<string | null>(null);
  const [ref] = useState(new Date());
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const iso = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const dateOf = (p: NonNullable<typeof posts>[number]) => (p.scheduled_time ? p.scheduled_time.slice(0, 10) : null);
  const postsFor = (d: number) => (posts ?? []).filter((p) => dateOf(p) === iso(d));

  const selectedPosts = selected ? (posts ?? []).filter((p) => dateOf(p) === selected) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon"><ChevronLeft className="size-4" /></Button>
          <h2 className="font-serif text-2xl">{ref.toLocaleString("en-US", { month: "long", year: "numeric" })}</h2>
          <Button variant="ghost" size="icon"><ChevronRight className="size-4" /></Button>
        </div>
        <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as "month" | "week")} className="border border-border/60 rounded-md">
          <ToggleGroupItem value="month" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Month</ToggleGroupItem>
          <ToggleGroupItem value="week" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Week</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Card className="border-border/60 bg-card/40 p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="aspect-square rounded-md bg-background/20" />;
            const dayPosts = postsFor(d);
            const isSelected = selected === iso(d);
            const isToday = d === new Date().getDate() && month === new Date().getMonth();
            const platforms = Array.from(new Set(dayPosts.map((p) => p.platform))) as Platform[];
            return (
              <button key={i} onClick={() => setSelected(iso(d))} className={`relative aspect-square rounded-md border p-1.5 text-left transition ${isSelected ? "border-primary bg-primary/10" : isToday ? "border-primary/40 bg-primary/5" : "border-border/40 bg-background/40 hover:border-primary/30"}`}>
                <span className={`text-xs ${isToday ? "font-serif text-primary font-semibold" : "text-foreground/80"}`}>{d}</span>
                {dayPosts.length > 0 && (
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex flex-wrap gap-0.5">
                    {platforms.slice(0, 4).map((p) => (
                      <span key={p} className="size-1.5 rounded-full" style={{ backgroundColor: platformMeta[p].hue }} />
                    ))}
                    {platforms.length > 4 && <span className="text-[9px] text-muted-foreground">+{platforms.length - 4}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {!posts?.length && (
        <EmptyState icon={<CalendarDays className="size-5" />} title="No posts scheduled yet" description="Draft a post from New Post and it'll appear on the calendar once it's scheduled." />
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full bg-card border-l border-border/60 sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl">{selected}</SheetTitle>
            <SheetDescription>{selectedPosts.length} post{selectedPosts.length !== 1 ? "s" : ""} scheduled</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {selectedPosts.length === 0 ? (
              <EmptyState icon={<CalendarDays className="size-5" />} title="Nothing scheduled" description="Draft a post to fill this day, or ask Aureate to suggest ideas from your content pillars." />
            ) : selectedPosts.map((p) => (
              <div key={p.id} className="rounded-lg border border-border/50 bg-background/40 p-3">
                <div className="flex items-start gap-3">
                  <PostArt seed={p.id} className="h-14 w-14 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <PlatformIcon platform={p.platform} className="size-3" /> {platformMeta[p.platform].label}
                      {p.scheduled_time && ` · ${new Date(p.scheduled_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm">{p.caption}</p>
                    <div className="mt-2"><StatusBadge status={p.status} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
