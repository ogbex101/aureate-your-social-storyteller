import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, useUpsertProfile } from "@/lib/queries";
import { Plus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/brand")({
  component: Brand,
});

type Pillar = { name: string; desc: string };

function Brand() {
  const { data: profile, isLoading } = useProfile();
  const upsertProfile = useUpsertProfile();
  const seeded = useRef(false);

  const [brandName, setBrandName] = useState("");
  const [toneWords, setToneWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [sample, setSample] = useState("");
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [newPillarName, setNewPillarName] = useState("");

  useEffect(() => {
    if (seeded.current || isLoading) return;
    seeded.current = true;
    if (profile) {
      setBrandName(profile.brand_name);
      setToneWords(profile.tone_words);
      setSample(profile.writing_sample);
      setPillars(profile.content_pillars ?? []);
    }
  }, [profile, isLoading]);

  const save = () => {
    upsertProfile.mutate(
      { brand_name: brandName, tone_words: toneWords, writing_sample: sample, content_pillars: pillars },
      {
        onError: (e) => toast.error(e.message),
        onSuccess: () => toast.success("Brand settings saved"),
      },
    );
  };

  const addPillar = () => {
    if (!newPillarName.trim()) return;
    setPillars([...pillars, { name: newPillarName.trim(), desc: "" }]);
    setNewPillarName("");
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-border/60 bg-card/60 p-6">
            <h3 className="font-serif text-lg">Brand identity</h3>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Brand name</Label>
                <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Your brand or business name" className="mt-1 border-border/60 bg-background/40" />
              </div>
              <div>
                <Label>Logo</Label>
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex size-16 items-center justify-center rounded-lg bg-primary text-primary-foreground font-serif text-2xl font-bold">{(brandName || "A").charAt(0).toUpperCase()}</div>
                  <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10" disabled>Replace</Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Logo upload lands in a later phase.</p>
              </div>
              <div>
                <Label>Brand colors</Label>
                <div className="mt-1 flex items-center gap-2">
                  {["#0A1128", "#D4AF37", "#F5F1E8", "#8B5A2B"].map((c) => (
                    <div key={c} className="flex flex-col items-center gap-1">
                      <div className="size-10 rounded-lg border border-border/60" style={{ backgroundColor: c }} />
                      <span className="text-[10px] text-muted-foreground">{c}</span>
                    </div>
                  ))}
                  <Button variant="ghost" size="icon" className="size-10 rounded-lg border border-dashed border-border/60" disabled><Plus className="size-4" /></Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-border/60 bg-card/60 p-6">
            <h3 className="font-serif text-lg">Brand voice</h3>
            <Label className="mt-4 block">Tone words</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {toneWords.map((w) => (
                <Badge key={w} variant="outline" className="border-primary/30 bg-primary/10 text-primary pr-1">
                  {w}
                  <button onClick={() => setToneWords(toneWords.filter((x) => x !== w))} className="ml-1 rounded hover:bg-primary/20"><X className="size-3" /></button>
                </Badge>
              ))}
              <div className="inline-flex items-center">
                <Input value={newWord} onChange={(e) => setNewWord(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newWord.trim()) { setToneWords([...toneWords, newWord.trim()]); setNewWord(""); } }} placeholder="Add word…" className="h-7 w-32 border-border/60 bg-background/40 text-xs" />
              </div>
            </div>
            <Label className="mt-6 block">Writing sample</Label>
            <Textarea value={sample} onChange={(e) => setSample(e.target.value)} placeholder="Paste a few sentences that sound like you." rows={4} className="mt-2 border-border/60 bg-background/40" />
            <Button size="sm" variant="ghost" className="mt-3 text-primary" disabled><Sparkles className="mr-1 size-3.5" /> Regenerate voice profile</Button>
          </Card>
        </div>

        <Card className="border-border/60 bg-card/60 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg">Content pillars</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">The themes Aureate rotates through when generating ideas.</p>
          <div className="mt-4 space-y-3">
            {pillars.map((p, i) => (
              <div key={`${p.name}-${i}`} className="rounded-lg border border-border/50 bg-background/40 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-serif text-base">{p.name}</p>
                    {p.desc && <p className="mt-0.5 text-xs text-muted-foreground">{p.desc}</p>}
                  </div>
                  <button onClick={() => setPillars(pillars.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="size-4" /></button>
                </div>
              </div>
            ))}
            {pillars.length === 0 && <p className="text-sm text-muted-foreground">No content pillars yet.</p>}
          </div>
          <div className="mt-4 flex gap-2">
            <Input value={newPillarName} onChange={(e) => setNewPillarName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPillar()} placeholder="New pillar name…" className="border-border/60 bg-background/40" />
            <Button variant="outline" size="sm" onClick={addPillar} className="shrink-0 border-primary/40 text-primary hover:bg-primary/10"><Plus className="mr-1 size-3.5" /> Add</Button>
          </div>
        </Card>
      </div>

      <Button onClick={save} disabled={upsertProfile.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {upsertProfile.isPending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
