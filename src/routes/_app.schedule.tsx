import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, useUpsertProfile, usePosts } from "@/lib/queries";
import { Sparkles, Clock, TrendingUp, X, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/schedule")({
  component: Schedule,
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
type Slot = { days: string[]; time: string };

function bestTimeFromPosts(posts: { scheduled_time: string | null; engagement: { likes: number; comments: number; shares: number } | null }[]) {
  const withEngagement = posts.filter((p) => p.scheduled_time && p.engagement);
  if (withEngagement.length < 3) return null;
  const buckets = new Map<string, { day: string; hour: number; total: number; count: number }>();
  for (const p of withEngagement) {
    const d = new Date(p.scheduled_time!);
    const day = DAYS[d.getDay()];
    const hour = d.getHours();
    const key = `${day}-${hour}`;
    const total = p.engagement!.likes + p.engagement!.comments + p.engagement!.shares;
    const existing = buckets.get(key) ?? { day, hour, total: 0, count: 0 };
    existing.total += total;
    existing.count += 1;
    buckets.set(key, existing);
  }
  let best: { day: string; hour: number; total: number; count: number } | null = null;
  for (const b of buckets.values()) {
    if (!best || b.total / b.count > best.total / best.count) best = b;
  }
  return best;
}

function Schedule() {
  const { data: profile, isLoading } = useProfile();
  const { data: posts } = usePosts();
  const upsertProfile = useUpsertProfile();
  const seeded = useRef(false);

  const [autoPostDefault, setAutoPostDefault] = useState(false);
  const [defaultTime, setDefaultTime] = useState("08:30");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [newSlotDays, setNewSlotDays] = useState<string[]>([]);
  const [newSlotTime, setNewSlotTime] = useState("08:30");

  useEffect(() => {
    if (seeded.current || isLoading) return;
    seeded.current = true;
    if (profile) {
      setAutoPostDefault(profile.auto_post_default);
      setDefaultTime(profile.default_post_time ?? "08:30");
      setSlots(profile.recurring_slots ?? []);
    }
  }, [profile, isLoading]);

  const save = (patch: Partial<{ auto_post_default: boolean; default_post_time: string; recurring_slots: Slot[] }>) => {
    upsertProfile.mutate(patch, {
      onError: (e) => toast.error(e.message),
      onSuccess: () => toast.success("Schedule preferences saved"),
    });
  };

  const toggleAutoPost = (checked: boolean) => {
    setAutoPostDefault(checked);
    save({ auto_post_default: checked });
  };

  const saveDefaultTime = () => save({ default_post_time: defaultTime });

  const addSlot = () => {
    if (newSlotDays.length === 0) return;
    const next = [...slots, { days: newSlotDays, time: newSlotTime }];
    setSlots(next);
    setNewSlotDays([]);
    save({ recurring_slots: next });
  };

  const removeSlot = (i: number) => {
    const next = slots.filter((_, j) => j !== i);
    setSlots(next);
    save({ recurring_slots: next });
  };

  const best = bestTimeFromPosts(posts ?? []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-56" />
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="border-border/60 bg-card/60 p-6">
        <h3 className="font-serif text-xl">Default post time</h3>
        <p className="mt-1 text-xs text-muted-foreground">Used to prefill scheduling when you don't pick a time yourself.</p>
        <div className="mt-4 flex items-end gap-3">
          <div>
            <Label>Time</Label>
            <Input type="time" value={defaultTime} onChange={(e) => setDefaultTime(e.target.value)} className="mt-1 border-border/60 bg-background/40" />
          </div>
          <Button size="sm" variant="outline" disabled={upsertProfile.isPending} onClick={saveDefaultTime} className="border-primary/40 text-primary hover:bg-primary/10">
            Save
          </Button>
        </div>

        {best ? (
          <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary"><TrendingUp className="size-4" /></div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium text-primary">Best time to post:</span> {best.day} {String(best.hour).padStart(2, "0")}:00
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">Based on average engagement across {best.count} post{best.count !== 1 ? "s" : ""} at that slot.</p>
              </div>
              <Button size="sm" variant="ghost" className="text-primary" onClick={() => { setDefaultTime(`${String(best.hour).padStart(2, "0")}:00`); save({ default_post_time: `${String(best.hour).padStart(2, "0")}:00` }); }}>
                <Sparkles className="mr-1 size-3" /> Use
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-border/60 bg-background/40 p-4 text-xs text-muted-foreground">
            Not enough engagement data yet to recommend a best time — this fills in once posts have been live for a while.
          </div>
        )}
      </Card>

      <Card className="border-border/60 bg-card/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Auto-post by default</Label>
            <p className="mt-1 text-xs text-muted-foreground">Skip approvals on all future posts unless individually flagged.</p>
          </div>
          <Switch checked={autoPostDefault} onCheckedChange={toggleAutoPost} disabled={upsertProfile.isPending} />
        </div>
      </Card>

      <Card className="border-border/60 bg-card/60 p-6">
        <div className="flex items-center gap-3">
          <Clock className="size-4 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Recurring slots</p>
            <p className="text-xs text-muted-foreground">Your preferred posting rhythm — used to prefill scheduling suggestions.</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {slots.map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 px-3 py-2">
              <p className="text-sm">{s.days.join("/")} at {s.time}</p>
              <button onClick={() => removeSlot(i)} className="text-muted-foreground hover:text-destructive"><X className="size-3.5" /></button>
            </div>
          ))}
          {slots.length === 0 && <p className="text-sm text-muted-foreground">No recurring slots yet.</p>}
        </div>

        <div className="mt-4 space-y-2 rounded-lg border border-dashed border-border/60 p-3">
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setNewSlotDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]))}
                className={`rounded-md border px-2 py-1 text-xs transition ${newSlotDays.includes(d) ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"}`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input type="time" value={newSlotTime} onChange={(e) => setNewSlotTime(e.target.value)} className="border-border/60 bg-background/40" />
            <Button variant="outline" size="sm" disabled={newSlotDays.length === 0} onClick={addSlot} className="shrink-0 border-primary/40 text-primary hover:bg-primary/10">
              <Plus className="mr-1 size-3.5" /> Add
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
