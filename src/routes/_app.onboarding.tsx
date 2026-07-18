import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlatformIcon } from "@/components/PlatformIcon";
import { platformMeta } from "@/lib/mock-data";
import { useAppStore, type Platform } from "@/lib/store";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Check, User, Users } from "lucide-react";

export const Route = createFileRoute("/_app/onboarding")({
  component: Onboarding,
});

const allPlatforms: Platform[] = ["instagram", "facebook", "linkedin", "tiktok", "x", "pinterest", "youtube", "threads"];

function Onboarding() {
  const navigate = useNavigate();
  const store = useAppStore();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [tone, setTone] = useState(store.toneWords.join(", "));
  const [sample, setSample] = useState("We keep it warm, considered, a little playful. Never salesy. Details over hype.");
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    const toneWords = tone.split(",").map((s) => s.trim()).filter(Boolean);
    store.setToneWords(toneWords);
    store.setOnboarded(true);
    if (user) {
      setSaving(true);
      await supabase.from("profiles").upsert({
        id: user.id,
        account_type: store.accountType,
        brand_name: store.brandName,
        tone_words: toneWords,
        writing_sample: sample,
      });
      const connectedPlatforms = allPlatforms.filter((p) => store.connected[p]);
      if (connectedPlatforms.length > 0) {
        await supabase.from("platform_connections").upsert(
          connectedPlatforms.map((platform) => ({
            user_id: user.id,
            platform,
            status: "connected" as const,
            connected_at: new Date().toISOString(),
          })),
          { onConflict: "user_id,platform" },
        );
      }
      setSaving(false);
    }
    navigate({ to: "/dashboard" });
  };

  const next = () => (step < 3 ? setStep(step + 1) : finish());

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex flex-1 items-center gap-2">
            <div className={`flex size-8 items-center justify-center rounded-full text-xs font-medium ${step >= n ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>{step > n ? <Check className="size-4" /> : n}</div>
            {n < 3 && <div className={`h-px flex-1 ${step > n ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <Card className="border-border/60 bg-card/60 p-8">
        {step === 1 && (
          <div>
            <h2 className="font-serif text-3xl">How will you use Aureate?</h2>
            <p className="mt-2 text-muted-foreground">This affects approval flows, team roles, and analytics.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                { id: "individual", icon: User, title: "Individual / Solo", body: "You're the drafter and the approver. Fast, low-ceremony workflow." },
                { id: "organization", icon: Users, title: "Organization / Team", body: "Multiple people, roles, and approval routing across channels." },
              ].map((opt) => (
                <button key={opt.id} onClick={() => store.setAccountType(opt.id as "individual" | "organization")} className={`text-left rounded-xl border p-5 transition ${store.accountType === opt.id ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"}`}>
                  <opt.icon className="size-5 text-primary" />
                  <h3 className="mt-3 font-serif text-lg">{opt.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{opt.body}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 className="font-serif text-3xl">Set your brand voice.</h2>
            <p className="mt-2 text-muted-foreground">Three tone words and a short writing sample. We'll match it.</p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-primary">Brand name</label>
                <Input value={store.brandName} onChange={(e) => store.setBrandName(e.target.value)} className="mt-1 border-border/60 bg-background/40" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-primary">Tone words (comma separated)</label>
                <Input value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Warm, Considered, Playful" className="mt-1 border-border/60 bg-background/40" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-primary">Writing sample</label>
                <Textarea value={sample} onChange={(e) => setSample(e.target.value)} rows={5} className="mt-1 border-border/60 bg-background/40" />
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2 className="font-serif text-3xl">Connect your first platform.</h2>
            <p className="mt-2 text-muted-foreground">You can add more in Connections anytime.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {allPlatforms.map((p) => (
                <button key={p} onClick={() => store.toggleConnection(p)} className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${store.connected[p] ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"}`}>
                  <div className="flex items-center gap-3">
                    <PlatformIcon platform={p} className="size-5 text-primary" />
                    <span className="font-medium">{platformMeta[p].label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{store.connected[p] ? "Connected" : "Connect"}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>Back</Button>
          <Button onClick={next} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">{saving ? "Saving…" : step === 3 ? "Finish setup" : "Continue"}</Button>
        </div>
      </Card>
    </div>
  );
}