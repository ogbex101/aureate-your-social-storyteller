import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useProfile } from "@/lib/queries";
import { team } from "@/lib/mock-data";
import { Users, Plus, ShieldCheck, Pencil } from "lucide-react";

export const Route = createFileRoute("/_app/team")({
  component: Team,
});

function Team() {
  const { data: profile } = useProfile();
  if (profile?.account_type !== "organization") {
    return (
      <Card className="border-primary/30 bg-gradient-to-b from-primary/10 to-transparent p-10 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary"><Users className="size-5" /></div>
        <h2 className="mt-4 font-serif text-2xl">Team is an Organization feature</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">You're on the Individual plan. Switch to Organization to invite drafters and approvers.</p>
        <Link to="/onboarding" className="mt-6 inline-block"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Switch to Organization</Button></Link>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl">Team & approvals</h2>
          <p className="mt-1 text-sm text-muted-foreground">Drafters create. Approvers ship. One tier, no chains.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="mr-1.5 size-4" /> Invite</Button>
      </div>

      <Card className="border-border/60 bg-card/60">
        <div className="divide-y divide-border/40">
          {team.map((m) => (
            <div key={m.id} className="flex items-center gap-4 p-4">
              <Avatar className="size-10 border border-primary/30"><AvatarFallback className="bg-primary/15 text-primary text-xs">{m.avatar}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </div>
              <Badge variant="outline" className={m.role === "Approver" ? "border-primary/40 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"}>
                {m.role === "Approver" && <ShieldCheck className="mr-1 size-3" />}
                {m.role}
              </Badge>
              <Button variant="ghost" size="icon"><Pencil className="size-4 text-muted-foreground" /></Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-border/60 bg-card/60 p-6">
        <h3 className="font-serif text-lg">Approval assignment</h3>
        <p className="mt-1 text-xs text-muted-foreground">Which approver gets pinged for each channel?</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            { platform: "Instagram + Threads", approver: "Ana Reyes" },
            { platform: "LinkedIn", approver: "Marcus Vale" },
            { platform: "X + Facebook", approver: "Ana Reyes" },
            { platform: "TikTok + YouTube", approver: "Marcus Vale" },
          ].map((r) => (
            <div key={r.platform} className="flex items-center justify-between rounded-lg border border-border/40 bg-background/40 p-3 text-sm">
              <span className="text-foreground/90">{r.platform}</span>
              <span className="text-primary">{r.approver}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}