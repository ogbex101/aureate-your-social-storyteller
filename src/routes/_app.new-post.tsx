import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PostPreview } from "@/components/PostPreview";
import { PlatformIcon } from "@/components/PlatformIcon";
import { useAppStore, type Platform } from "@/lib/store";
import { platformMeta, thumb } from "@/lib/mock-data";
import { Upload, Sparkles, RefreshCw, Edit3, X } from "lucide-react";

export const Route = createFileRoute("/_app/new-post")({
  component: NewPost,
});

function NewPost() {
  const { connected } = useAppStore();
  const [caption, setCaption] = useState("The Ethiopia Yirgacheffe just landed. Blueberry, jasmine, a finish like honey on toast. Available Saturday from 8am at the flagship. Doors open at 7:45 for the regulars.");
  const [hasAsset, setHasAsset] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [rejected, setRejected] = useState<Platform[]>([]);
  const activePlatforms = (Object.entries(connected) as [Platform, boolean][]).filter(([, v]) => v).map(([k]) => k).filter((p) => !rejected.includes(p));

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <div className="space-y-4">
        <Card className="border-border/60 bg-card/60 p-5">
          <h3 className="font-serif text-lg">Asset</h3>
          {hasAsset ? (
            <div className="mt-3">
              <div className={`relative aspect-square w-full rounded-lg bg-gradient-to-br ${thumb("yirg")}`}>
                <button onClick={() => setHasAsset(false)} className="absolute right-2 top-2 rounded-md bg-black/40 p-1.5 text-cream backdrop-blur"><X className="size-3.5" /></button>
                <div className="absolute bottom-2 left-2 rounded bg-black/40 px-2 py-0.5 text-[10px] text-cream backdrop-blur">yirgacheffe-drop.jpg · 3.2 MB</div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Aureate will crop per platform automatically.</p>
            </div>
          ) : (
            <div className="mt-3 flex flex-col items-center justify-center rounded-lg border border-dashed border-primary/40 bg-background/40 p-8 text-center">
              <Upload className="size-6 text-primary" />
              <p className="mt-2 text-sm">Drag & drop or click to upload</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, MP4 up to 100MB</p>
              <div className="my-3 text-xs text-muted-foreground">— or —</div>
              <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10" onClick={() => setHasAsset(true)}>
                <Sparkles className="mr-1.5 size-3.5" /> Generate with AI
              </Button>
            </div>
          )}
        </Card>

        <Card className="border-border/60 bg-card/60 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg">Caption</h3>
            <Button size="sm" variant="ghost" className="text-primary"><Sparkles className="mr-1 size-3.5" /> Rewrite</Button>
          </div>
          <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={6} className="mt-3 border-border/60 bg-background/40" />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{caption.length} chars · in Meridian's voice</span>
            <span className="text-primary">4 hashtag suggestions</span>
          </div>
        </Card>

        <Card className="border-border/60 bg-card/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="approval">Require approval for this post</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">Overrides workspace default (off).</p>
            </div>
            <Switch id="approval" checked={requireApproval} onCheckedChange={setRequireApproval} />
          </div>
        </Card>

        <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Schedule across {activePlatforms.length} platform{activePlatforms.length !== 1 ? "s" : ""}</Button>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-xl">Previews</h3>
          <span className="text-xs text-muted-foreground">Each rendered at the platform's native ratio</span>
        </div>
        {activePlatforms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">Rejected everything. Undo below.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activePlatforms.map((p) => (
              <div key={p} className="space-y-2">
                <PostPreview platform={p} caption={caption} thumbnail={thumb("yirg")} />
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <PlatformIcon platform={p} className="size-3" /> {platformMeta[p].label}
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 ${requireApproval ? "border-amber-400/40 bg-amber-400/10 text-amber-300" : "border-primary/40 bg-primary/15 text-primary"}`}>{requireApproval ? "Needs approval" : "Auto-post"}</span>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="ghost" className="flex-1 text-xs"><Edit3 className="mr-1 size-3" /> Edit</Button>
                  <Button size="sm" variant="ghost" className="flex-1 text-xs"><RefreshCw className="mr-1 size-3" /> Regenerate</Button>
                  <Button size="sm" variant="ghost" onClick={() => setRejected([...rejected, p])} className="flex-1 text-xs text-destructive"><X className="mr-1 size-3" /> Reject</Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {rejected.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setRejected([])} className="mt-3 text-muted-foreground">Undo {rejected.length} rejection{rejected.length !== 1 ? "s" : ""}</Button>
        )}
      </div>
    </div>
  );
}