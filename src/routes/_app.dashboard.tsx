import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlatformIcon } from "@/components/PlatformIcon";
import { StatusBadge } from "@/components/StatusBadge";
import { PostArt } from "@/components/PostArt";
import { EmptyState } from "@/components/EmptyState";
import { usePosts, useConnections, useApprovePost, useRejectPost } from "@/lib/queries";
import { useAuth } from "@/lib/AuthProvider";
import { ArrowUpRight, CheckCircle2, Clock, TrendingUp, Link2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function greeting(hour: number) {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user } = useAuth();
  const { data: posts, isLoading } = usePosts();
  const { data: connections } = useConnections();
  const approve = useApprovePost();
  const reject = useRejectPost();

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const weekEnd = new Date(startOfToday);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const queuedStatuses = ["scheduled", "approved", "pending_approval"];
  const pendingApprovals = (posts ?? []).filter((p) => p.status === "pending_approval");
  // "Up next" is the queue of anything not yet posted/failed — not a strict future-time
  // check, since a post scheduled for "now" (no time-picker wired yet) would otherwise
  // always read as already-past by the time this renders.
  const upcoming = (posts ?? []).filter((p) => queuedStatuses.includes(p.status)).slice(0, 5);
  const postedWithEngagement = (posts ?? []).filter((p) => p.status === "posted" && p.engagement);
  const topPost = postedWithEngagement.sort((a, b) => (b.engagement?.likes ?? 0) - (a.engagement?.likes ?? 0))[0];

  const postsThisWeek = (posts ?? []).filter((p) => p.scheduled_time && new Date(p.scheduled_time) >= startOfToday && new Date(p.scheduled_time) < weekEnd).length;
  const scheduledCount = (posts ?? []).filter((p) => p.status === "scheduled").length;
  const connectedCount = connections?.filter((c) => c.status === "connected").length ?? 0;

  const stats = [
    { label: "Posts this week", value: postsThisWeek, icon: Clock },
    { label: "Needs approval", value: pendingApprovals.length, icon: TrendingUp },
    { label: "Connected platforms", value: `${connectedCount} / 8`, icon: Link2 },
    { label: "Scheduled", value: scheduledCount, icon: CheckCircle2 },
  ];

  const activeStatuses = [...queuedStatuses, "posted"];
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const count = (posts ?? []).filter((p) => activeStatuses.includes(p.status) && p.scheduled_time && new Date(p.scheduled_time).toDateString() === d.toDateString()).length;
    return { label: d.toLocaleDateString("en-US", { weekday: "short" }), day: d.getDate(), count };
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">{now.toLocaleDateString("en-US", { weekday: "long" })}</p>
          <h2 className="mt-1 font-serif text-3xl">{greeting(now.getHours())}{user?.email ? `, ${user.email.split("@")[0]}` : ""}.</h2>
          <p className="text-muted-foreground">
            {pendingApprovals.length > 0 ? `${pendingApprovals.length} post${pendingApprovals.length !== 1 ? "s" : ""} need your eyes before they go out.` : "You're all caught up."}
          </p>
        </div>
        <Link to="/new-post"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Draft a new post</Button></Link>
      </div>

      {connectedCount === 0 && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary"><Link2 className="size-4" /></div>
            <div>
              <p className="text-sm font-medium">No platforms connected yet</p>
              <p className="text-xs text-muted-foreground">Connect at least one to start scheduling posts.</p>
            </div>
          </div>
          <Link to="/connections"><Button size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">Connect a platform</Button></Link>
        </div>
      )}

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
            {pendingApprovals.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="size-5" />} title="Nothing waiting" description="Posts you flag for approval will show up here before they go out." />
            ) : pendingApprovals.map((p) => (
              <div key={p.id} className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/40 p-3">
                <PostArt seed={p.id} className="h-16 w-16 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <PlatformIcon platform={p.platform} className="size-3" />
                    <span>{p.scheduled_time ? new Date(p.scheduled_time).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Unscheduled"}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-foreground/90">{p.caption}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={approve.isPending}
                    onClick={() => approve.mutate(p.id, { onError: (e) => toast.error(e.message), onSuccess: () => toast.success("Approved") })}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={reject.isPending}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => reject.mutate(p.id, { onError: (e) => toast.error(e.message), onSuccess: () => toast.success("Sent back to drafts") })}
                  >
                    <X className="mr-1 size-3" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/60 bg-card/60 p-5">
          <h3 className="font-serif text-xl">Top post</h3>
          {topPost ? (
            <>
              <PostArt seed={topPost.id} className="mt-4 aspect-square w-full rounded-lg" />
              <p className="mt-3 text-sm text-foreground/90">{topPost.caption}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span>❤ {topPost.engagement?.likes.toLocaleString()}</span><span>💬 {topPost.engagement?.comments}</span><span>↗ {topPost.engagement?.shares}</span>
              </div>
              <Link to="/analytics" className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline">See analytics <ArrowUpRight className="size-3" /></Link>
            </>
          ) : (
            <div className="mt-4">
              <EmptyState icon={<Sparkles className="size-5" />} title="No posts yet" description="Once something's live, your best performer shows up here." />
            </div>
          )}
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-xl">This week</h3>
          <Link to="/calendar" className="text-xs text-primary hover:underline">Open calendar</Link>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card/40 p-3 text-center">
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
        {upcoming.length === 0 ? (
          <EmptyState icon={<Clock className="size-5" />} title="Nothing scheduled" description="Draft a post and it'll show up here once it's queued." action={<Link to="/new-post"><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Draft a new post</Button></Link>} />
        ) : (
          <div className="space-y-2">
            {upcoming.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/40 p-3">
                <PostArt seed={p.id} className="h-12 w-12 shrink-0 rounded-md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <PlatformIcon platform={p.platform} className="size-3" />
                    <span>{p.scheduled_time ? new Date(p.scheduled_time).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Unscheduled"}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-foreground/90">{p.caption}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
