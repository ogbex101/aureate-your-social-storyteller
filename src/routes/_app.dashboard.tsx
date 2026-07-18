import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/PlatformIcon";
import { StatusBadge } from "@/components/StatusBadge";
import { scheduledPosts, pendingApprovals, quickStats, weekStrip } from "@/lib/mock-data";
import { ArrowUpRight, CheckCircle2, Clock, TrendingUp, Link2 } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const days = weekStrip();
  const upcoming = scheduledPosts.slice(0, 5);
  const stats = [
    { label: "Posts this week", value: quickStats.postsThisWeek, delta: "+3", icon: Clock },
    { label: "Engagement rate", value: `${quickStats.engagementRate}%`, delta: "+0.8", icon: TrendingUp },
    { label: "Connected platforms", value: quickStats.connectedPlatforms, delta: "5 / 8", icon: Link2 },
    { label: "Scheduled", value: quickStats.scheduled, delta: "next 14d", icon: CheckCircle2 },
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Saturday morning</p>
          <h2 className="mt-1 font-serif text-3xl">Good morning, Ana.</h2>
          <p className="text-muted-foreground">Two posts need your eyes before they go out today.</p>
        </div>
        <Link to="/new-post"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Draft a new post</Button></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/60 bg-card/60 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-2 font-serif text-3xl">{s.value}</p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><s.icon className="size-4" /></div>
            </div>
            <p className="mt-3 text-xs text-primary">{s.delta}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/60 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl">Pending approvals</h3>
            <Link to="/calendar" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {pendingApprovals.map((p) => (
              <div key={p.id} className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/40 p-3">
                <div className={`h-16 w-16 shrink-0 rounded-md bg-gradient-to-br ${p.thumbnail}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <PlatformIcon platform={p.platform} className="size-3" />
                    <span>{p.date} · {p.time}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-foreground/90">{p.caption}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Approve</Button>
                  <Button size="sm" variant="ghost" className="text-muted-foreground">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/60 bg-card/60 p-5">
          <h3 className="font-serif text-xl">Top post</h3>
          <div className="mt-4 aspect-square w-full rounded-lg bg-gradient-to-br from-amber-200/30 to-amber-500/20" />
          <p className="mt-3 text-sm text-foreground/90">Behind the bar with Priya — 6am prep, one shot at a time.</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span>❤ 3,812</span><span>💬 214</span><span>↗ 96</span>
          </div>
          <Link to="/analytics" className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline">See analytics <ArrowUpRight className="size-3" /></Link>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-xl">This week</h3>
          <Link to="/calendar" className="text-xs text-primary hover:underline">Open calendar</Link>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => (
            <div key={d.date} className="rounded-xl border border-border/60 bg-card/40 p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{d.label}</p>
              <p className="mt-1 font-serif text-2xl">{d.day}</p>
              <div className="mt-2 flex justify-center gap-0.5">
                {Array.from({ length: Math.min(d.count, 5) }).map((_, i) => (
                  <span key={i} className="size-1.5 rounded-full bg-primary" />
                ))}
                {d.count === 0 && <span className="text-[10px] text-muted-foreground">—</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-serif text-xl">Up next</h3>
        <div className="space-y-2">
          {upcoming.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/40 p-3">
              <div className={`h-12 w-12 shrink-0 rounded-md bg-gradient-to-br ${p.thumbnail}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><PlatformIcon platform={p.platform} className="size-3" /><span>{p.date} · {p.time}</span></div>
                <p className="mt-0.5 truncate text-sm text-foreground/90">{p.caption}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}