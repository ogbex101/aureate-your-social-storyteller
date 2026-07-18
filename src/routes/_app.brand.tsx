import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { contentPillars } from "@/lib/mock-data";
import { Plus, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/_app/brand")({
  component: Brand,
});

function Brand() {
  const { brandName, setBrandName, toneWords, setToneWords } = useAppStore();
  const [newWord, setNewWord] = useState("");
  const [pillars, setPillars] = useState(contentPillars);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card className="border-border/60 bg-card/60 p-6">
          <h3 className="font-serif text-lg">Brand identity</h3>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Brand name</Label>
              <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} className="mt-1 border-border/60 bg-background/40" />
            </div>
            <div>
              <Label>Logo</Label>
              <div className="mt-1 flex items-center gap-3">
                <div className="flex size-16 items-center justify-center rounded-lg bg-primary text-primary-foreground font-serif text-2xl font-bold">M</div>
                <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10">Replace</Button>
              </div>
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
                <Button variant="ghost" size="icon" className="size-10 border border-dashed border-border/60 rounded-lg"><Plus className="size-4" /></Button>
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
          <Textarea defaultValue="We keep it warm, considered, a little playful. Never salesy. Details over hype." rows={4} className="mt-2 border-border/60 bg-background/40" />
          <Button size="sm" variant="ghost" className="mt-3 text-primary"><Sparkles className="mr-1 size-3.5" /> Regenerate voice profile</Button>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/60 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg">Content pillars</h3>
          <Button size="sm" variant="ghost" className="text-primary"><Plus className="mr-1 size-3.5" /> Add pillar</Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">The four or five themes Aureate rotates through when generating ideas.</p>
        <div className="mt-4 space-y-3">
          {pillars.map((p, i) => (
            <div key={p.name} className="rounded-lg border border-border/50 bg-background/40 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-serif text-base">{p.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.desc}</p>
                </div>
                <button onClick={() => setPillars(pillars.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="size-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}