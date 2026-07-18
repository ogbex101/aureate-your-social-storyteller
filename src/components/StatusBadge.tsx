import { Badge } from "@/components/ui/badge";
import type { PostStatus } from "@/lib/mock-data";

const map: Record<PostStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "border-muted-foreground/40 bg-muted/40 text-muted-foreground" },
  pending_approval: { label: "Needs approval", className: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  approved: { label: "Approved", className: "border-sky-400/40 bg-sky-400/10 text-sky-300" },
  scheduled: { label: "Auto-post", className: "border-primary/40 bg-primary/15 text-primary" },
  posted: { label: "Posted", className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  failed: { label: "Failed", className: "border-destructive/40 bg-destructive/10 text-destructive" },
};

export function StatusBadge({ status }: { status: PostStatus }) {
  const m = map[status];
  return <Badge variant="outline" className={`font-normal ${m.className}`}>{m.label}</Badge>;
}