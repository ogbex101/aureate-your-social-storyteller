import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles, Clock, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_app/schedule")({
  component: Schedule,
});

function Schedule() {
  const [requireApprovalDefault, setRequireApproval] = useState(false);
  const [date, setDate] = useState("2026-07-25");
  const [time, setTime] = useState("08:30");
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="border-border/60 bg-card/60 p-6">
        <h3 className="font-serif text-xl">When should it go out?</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 border-border/60 bg-background/40" />
          </div>
          <div>
            <Label>Time</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 border-border/60 bg-background/40" />
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary"><TrendingUp className="size-4" /></div>
            <div className="flex-1">
              <p className="text-sm"><span className="text-primary font-medium">Best time to post:</span> Saturday 08:30</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Based on 42% higher engagement across your last 60 posts on Instagram and Threads.</p>
            </div>
            <Button size="sm" variant="ghost" className="text-primary" onClick={() => setTime("08:30")}><Sparkles className="mr-1 size-3" /> Use</Button>
          </div>
        </div>
      </Card>

      <Card className="border-border/60 bg-card/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Auto-post by default</Label>
            <p className="mt-1 text-xs text-muted-foreground">Skip approvals on all future posts unless individually flagged.</p>
          </div>
          <Switch checked={!requireApprovalDefault} onCheckedChange={(v) => setRequireApproval(!v)} />
        </div>
      </Card>

      <Card className="border-border/60 bg-card/60 p-6">
        <div className="flex items-center gap-3">
          <Clock className="size-4 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Recurring slots</p>
            <p className="text-xs text-muted-foreground">Mon/Wed/Fri at 8:30am, Sat/Sun at 10:00am</p>
          </div>
          <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10">Edit</Button>
        </div>
      </Card>
    </div>
  );
}