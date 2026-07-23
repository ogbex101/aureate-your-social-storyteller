import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PostPreview } from "@/components/PostPreview";
import { PlatformIcon } from "@/components/PlatformIcon";
import { PostArt } from "@/components/PostArt";
import type { Platform } from "@/lib/store";
import { platformMeta } from "@/lib/mock-data";
import { useConnections, useCreatePosts, useProfile, useAssets, useUploadAsset } from "@/lib/queries";
import { generateCaption } from "@/lib/ai";
import { Upload, Sparkles, RefreshCw, Edit3, X, Library } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/new-post")({
  component: NewPost,
});

type AssetState = { kind: "none" } | { kind: "uploaded"; assetId: string; url: string; name: string } | { kind: "ai" };

function NewPost() {
  const navigate = useNavigate();
  const { data: connections, isLoading: connectionsLoading } = useConnections();
  const { data: profile } = useProfile();
  const { data: libraryAssets } = useAssets();
  const createPosts = useCreatePosts();
  const uploadAsset = useUploadAsset();
  const brandHandle = profile?.brand_name ? profile.brand_name.toLowerCase().replace(/[^a-z0-9]/g, "") : "yourbrand";
  const [caption, setCaption] = useState("");
  const [context, setContext] = useState("");
  const [asset, setAsset] = useState<AssetState>({ kind: "none" });
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [requireApproval, setRequireApproval] = useState(false);
  const [rejected, setRejected] = useState<Platform[]>([]);
  const [writing, setWriting] = useState(false);
  const connectedPlatforms = (connections ?? []).filter((c) => c.status === "connected").map((c) => c.platform);
  const activePlatforms = connectedPlatforms.filter((p) => !rejected.includes(p));

  useEffect(() => {
    return () => {
      if (asset.kind === "uploaded" && asset.url.startsWith("blob:")) URL.revokeObjectURL(asset.url);
    };
  }, [asset]);

  const handleUpload = (file: File | undefined) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    uploadAsset.mutate(file, {
      onError: (e) => { toast.error(e.message); URL.revokeObjectURL(previewUrl); },
      onSuccess: (row) => {
        setAsset({ kind: "uploaded", assetId: row.id, url: previewUrl, name: row.file_name });
        toast.success("Uploaded");
      },
    });
  };

  const rewrite = async () => {
    setWriting(true);
    try {
      const text = await generateCaption({
        data: {
          draft: caption,
          platform: activePlatforms[0] ? platformMeta[activePlatforms[0]].label : "social media",
          brandName: profile?.brand_name ?? "",
          toneWords: profile?.tone_words ?? [],
          writingSample: profile?.writing_sample ?? "",
          contentPillars: (profile?.content_pillars ?? []).map((p) => p.name),
          context,
        },
      });
      setCaption(text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate a caption.");
    } finally {
      setWriting(false);
    }
  };

  const schedule = () => {
    const now = new Date().toISOString();
    const assetId = asset.kind === "uploaded" ? asset.assetId : null;
    createPosts.mutate(
      activePlatforms.map((platform) => ({
        platform,
        caption,
        status: requireApproval ? "pending_approval" : "scheduled",
        auto_post: !requireApproval,
        scheduled_time: now,
        asset_id: assetId,
      })),
      {
        onError: (e) => toast.error(e.message),
        onSuccess: () => {
          toast.success(`Scheduled across ${activePlatforms.length} platform${activePlatforms.length !== 1 ? "s" : ""}`);
          navigate({ to: "/calendar" });
        },
      },
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <div className="space-y-4">
        <Card className="border-border/60 bg-card/60 p-5">
          <h3 className="font-serif text-lg">Asset</h3>
          {asset.kind === "uploaded" ? (
            <div className="mt-3">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                <img src={asset.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <button onClick={() => setAsset({ kind: "none" })} className="absolute right-2 top-2 rounded-md bg-black/40 p-1.5 text-cream backdrop-blur"><X className="size-3.5" /></button>
                <div className="absolute bottom-2 left-2 rounded bg-black/40 px-2 py-0.5 text-[10px] text-cream backdrop-blur">{asset.name}</div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Aureate will crop per platform automatically.</p>
            </div>
          ) : asset.kind === "ai" ? (
            <div className="mt-3">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                <PostArt seed="new-post-asset" className="absolute inset-0 h-full w-full" />
                <button onClick={() => setAsset({ kind: "none" })} className="absolute right-2 top-2 rounded-md bg-black/40 p-1.5 text-cream backdrop-blur"><X className="size-3.5" /></button>
                <div className="absolute bottom-2 left-2 rounded bg-black/40 px-2 py-0.5 text-[10px] text-cream backdrop-blur">AI-generated image (preview)</div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Real AI image generation lands in a later phase.</p>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files[0]); }}
              className={`mt-3 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center transition ${dragging ? "border-primary bg-primary/10" : "border-primary/40 bg-background/40"}`}
            >
              <Upload className="size-6 text-primary" />
              <p className="mt-2 text-sm">{uploadAsset.isPending ? "Uploading…" : "Drag & drop or click to upload"}</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, MP4 up to 100MB</p>
              <Button variant="outline" size="sm" disabled={uploadAsset.isPending} className="mt-3 border-primary/40 text-primary hover:bg-primary/10" onClick={() => fileInputRef.current?.click()}>
                Choose file
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
              <div className="my-3 flex w-full items-center gap-2 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border/60" /> or <div className="h-px flex-1 bg-border/60" />
              </div>
              <div className="flex gap-2">
                {!!libraryAssets?.length && (
                  <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10" onClick={() => setLibraryOpen(true)}>
                    <Library className="mr-1.5 size-3.5" /> From library
                  </Button>
                )}
                <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10" onClick={() => setAsset({ kind: "ai" })}>
                  <Sparkles className="mr-1.5 size-3.5" /> Generate with AI
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
          <DialogContent className="border-border/60 bg-card sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Choose from library</DialogTitle>
            </DialogHeader>
            <div className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
              {libraryAssets?.map((a) => (
                <button
                  key={a.id}
                  onClick={() => { if (a.url) { setAsset({ kind: "uploaded", assetId: a.id, url: a.url, name: a.file_name }); setLibraryOpen(false); } }}
                  className="aspect-square overflow-hidden rounded-lg border border-border/60 bg-background/40 transition hover:border-primary"
                >
                  {a.url && a.file_type?.startsWith("image/") ? <img src={a.url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Upload className="size-4" /></div>}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Card className="border-border/60 bg-card/60 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg">Caption</h3>
            <Button size="sm" variant="ghost" disabled={writing} onClick={rewrite} className="text-primary">
              <Sparkles className="mr-1 size-3.5" /> {writing ? "Writing…" : caption.trim() ? "Rewrite" : "Write with AI"}
            </Button>
          </div>
          <Label className="mt-3 block text-xs text-muted-foreground">What's this post about?</Label>
          <Textarea value={context} onChange={(e) => setContext(e.target.value)} rows={2} placeholder="e.g. Announcing our summer sale, 20% off all bags this weekend only." className="mt-1.5 border-border/60 bg-background/40 text-sm" />
          <p className="mt-1 text-[11px] text-muted-foreground">The more detail you give, the better the AI caption. Used for both drafting and rewriting.</p>
          <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={6} placeholder="What do you want to tell your audience? Or leave blank and let AI draft one from your brand voice." className="mt-3 border-border/60 bg-background/40" />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{caption.length} chars{profile?.brand_name ? ` · in ${profile.brand_name}'s voice` : ""}</span>
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

        <Button size="lg" disabled={activePlatforms.length === 0 || !caption.trim() || createPosts.isPending} onClick={schedule} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          {createPosts.isPending ? "Scheduling…" : `Schedule across ${activePlatforms.length} platform${activePlatforms.length !== 1 ? "s" : ""}`}
        </Button>
        {!caption.trim() && <p className="text-center text-xs text-muted-foreground">Write a caption before scheduling.</p>}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-xl">Previews</h3>
          <span className="text-xs text-muted-foreground">Each rendered at the platform's native ratio</span>
        </div>
        {connectionsLoading ? null : connectedPlatforms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No platforms connected yet.{" "}
            <Link to="/connections" className="text-primary hover:underline">Connect one</Link> to see previews here.
          </div>
        ) : activePlatforms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">Rejected everything. Undo below.</div>
        ) : (
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 2xl:grid-cols-3">
            {activePlatforms.map((p) => (
              <div key={p} className="space-y-2">
                <PostPreview platform={p} caption={caption} seed={`new-post-${p}`} brand={brandHandle} imageUrl={asset.kind === "uploaded" ? asset.url : undefined} />
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