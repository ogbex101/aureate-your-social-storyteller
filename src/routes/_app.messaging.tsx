import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { team } from "@/lib/mock-data";
import { MessageCircle, Send, Check } from "lucide-react";

export const Route = createFileRoute("/_app/messaging")({
  component: Messaging,
});

function Messaging() {
  const [waConnected, setWa] = useState(true);
  const [tgConnected, setTg] = useState(false);
  const [routing, setRouting] = useState("approvers");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl">Approve from your phone.</h2>
        <p className="mt-1 text-sm text-muted-foreground">Aureate DMs the approver a preview. They reply ✅ or ✏️ — done in six seconds.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={`border p-6 ${waConnected ? "border-primary/40 bg-primary/5" : "border-border/60 bg-card/60"}`}>
          <div className="flex items-start justify-between">
            <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300"><MessageCircle className="size-5" /></div>
            {waConnected && <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary"><Check className="size-3" /> Live</span>}
          </div>
          <h3 className="mt-4 font-serif text-lg">WhatsApp bot</h3>
          {waConnected ? (
            <p className="mt-1 text-xs text-muted-foreground">Connected to +1 (415) 555-0180 · 4 approvals routed this week</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Scan a QR code with your business WhatsApp</p>
          )}
          <Button onClick={() => setWa(!waConnected)} variant={waConnected ? "ghost" : "default"} size="sm" className={`mt-4 w-full ${waConnected ? "text-muted-foreground hover:text-destructive" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
            {waConnected ? "Disconnect" : "Connect WhatsApp"}
          </Button>
        </Card>

        <Card className={`border p-6 ${tgConnected ? "border-primary/40 bg-primary/5" : "border-border/60 bg-card/60"}`}>
          <div className="flex items-start justify-between">
            <div className="flex size-12 items-center justify-center rounded-lg bg-sky-400/15 text-sky-300"><Send className="size-5" /></div>
            {tgConnected && <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary"><Check className="size-3" /> Live</span>}
          </div>
          <h3 className="mt-4 font-serif text-lg">Telegram bot</h3>
          <p className="mt-1 text-xs text-muted-foreground">{tgConnected ? "Connected to @meridian_bot" : "Add @AureateBot to your workspace group"}</p>
          <Button onClick={() => setTg(!tgConnected)} variant={tgConnected ? "ghost" : "default"} size="sm" className={`mt-4 w-full ${tgConnected ? "text-muted-foreground hover:text-destructive" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
            {tgConnected ? "Disconnect" : "Connect Telegram"}
          </Button>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/60 p-6">
        <h3 className="font-serif text-lg">Approval routing</h3>
        <p className="mt-1 text-xs text-muted-foreground">Who gets pinged when a post needs approval?</p>
        <RadioGroup value={routing} onValueChange={setRouting} className="mt-4 space-y-3">
          {[
            { id: "all", label: "Everyone on the team", desc: "First to approve wins. Loud but fast." },
            { id: "approvers", label: "Approvers only", desc: `Currently ${team.filter((t) => t.role === "Approver").length} people: ${team.filter((t) => t.role === "Approver").map((t) => t.name.split(" ")[0]).join(", ")}` },
            { id: "one", label: "One designated approver", desc: "Route everything to a single reviewer." },
          ].map((opt) => (
            <label key={opt.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${routing === opt.id ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"}`}>
              <RadioGroupItem value={opt.id} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </label>
          ))}
        </RadioGroup>

        <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
          <div>
            <Label>Also send weekly digest</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">Sunday 7pm: what went out, what worked.</p>
          </div>
          <Switch defaultChecked />
        </div>
      </Card>
    </div>
  );
}