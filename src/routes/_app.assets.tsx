import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useAssets, useUploadAsset, useDeleteAsset, useUpdateAssetTags, type AssetWithUrl } from "@/lib/queries";
import { ImageIcon, Trash2, Upload, X, Search, Film, CheckSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/assets")({
  component: Assets,
});

function AssetCard({ asset, selected, selectMode, onToggleSelect }: { asset: AssetWithUrl; selected: boolean; selectMode: boolean; onToggleSelect: () => void }) {
  const updateTags = useUpdateAssetTags();
  const deleteAsset = useDeleteAsset();
  const [newTag, setNewTag] = useState("");
  const isImage = asset.file_type?.startsWith("image/");
  const isVideo = asset.file_type?.startsWith("video/");

  const addTag = () => {
    if (!newTag.trim()) return;
    updateTags.mutate({ id: asset.id, tags: [...asset.tags, newTag.trim()] }, { onError: (e) => toast.error(e.message) });
    setNewTag("");
  };

  return (
    <Card className={`group overflow-hidden border bg-card/60 transition ${selected ? "border-primary" : "border-border/60"}`}>
      <div className="relative aspect-square w-full bg-background/40">
        {isImage && asset.url ? (
          <img src={asset.url} alt={asset.file_name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            {isVideo ? <Film className="size-8" /> : <ImageIcon className="size-8" />}
          </div>
        )}
        {isVideo && <span className="absolute bottom-2 left-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-cream backdrop-blur">Video</span>}
        <div className={`absolute left-2 top-2 flex size-5 items-center justify-center rounded-md backdrop-blur transition ${selected ? "bg-primary" : selectMode ? "bg-black/50" : "bg-black/30 opacity-0 group-hover:opacity-100"}`}>
          <Checkbox checked={selected} onCheckedChange={onToggleSelect} className="size-3.5 border-cream/80 text-primary-foreground" />
        </div>
        <button
          onClick={() => deleteAsset.mutate(asset, { onError: (e) => toast.error(e.message), onSuccess: () => toast.success("Deleted") })}
          disabled={deleteAsset.isPending}
          className="absolute right-2 top-2 rounded-md bg-black/50 p-1.5 text-cream backdrop-blur hover:bg-destructive/80"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      <div className="space-y-2 p-3">
        <p className="truncate text-xs text-foreground/90">{asset.file_name}</p>
        <div className="flex flex-wrap gap-1.5">
          {asset.tags.map((t) => (
            <Badge key={t} variant="outline" className="border-primary/30 bg-primary/10 pr-1 text-[10px] text-primary">
              {t}
              <button onClick={() => updateTags.mutate({ id: asset.id, tags: asset.tags.filter((x) => x !== t) })} className="ml-1 rounded hover:bg-primary/20">
                <X className="size-2.5" />
              </button>
            </Badge>
          ))}
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
            placeholder="Add tag…"
            className="h-6 w-20 border-border/60 bg-background/40 text-[10px]"
          />
        </div>
      </div>
    </Card>
  );
}

function Assets() {
  const { data: assets, isLoading } = useAssets();
  const upload = useUploadAsset();
  const deleteAsset = useDeleteAsset();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      upload.mutate(file, {
        onError: (e) => toast.error(`${file.name}: ${e.message}`),
        onSuccess: () => toast.success(`${file.name} uploaded`),
      });
    }
  };

  const allTags = useMemo(() => Array.from(new Set((assets ?? []).flatMap((a) => a.tags))).sort(), [assets]);

  const filtered = useMemo(() => {
    return (assets ?? []).filter((a) => {
      const matchesSearch = !search.trim() || a.file_name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesTags = activeTags.length === 0 || activeTags.every((t) => a.tags.includes(t));
      return matchesSearch && matchesTags;
    });
  }, [assets, search, activeTags]);

  const toggleTag = (t: string) => setActiveTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  const toggleSelect = (id: string) => setSelected((cur) => { const next = new Set(cur); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const deleteSelected = () => {
    const toDelete = (assets ?? []).filter((a) => selected.has(a.id));
    toDelete.forEach((a) => deleteAsset.mutate(a, { onError: (e) => toast.error(`${a.file_name}: ${e.message}`) }));
    toast.success(`Deleting ${toDelete.length} asset${toDelete.length !== 1 ? "s" : ""}`);
    setSelected(new Set());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl">Asset library</h2>
          <p className="mt-1 text-sm text-muted-foreground">Upload once, reuse across posts.</p>
        </div>
        <Button onClick={() => inputRef.current?.click()} disabled={upload.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Upload className="mr-1.5 size-4" /> {upload.isPending ? "Uploading…" : "Upload"}
        </Button>
        <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        className={`rounded-xl border border-dashed p-6 text-center text-sm transition ${dragging ? "border-primary bg-primary/5 text-primary" : "border-border/60 text-muted-foreground"}`}
      >
        Drag & drop images or video here, or use Upload above.
      </div>

      {!isLoading && !!assets?.length && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by filename…" className="h-9 border-border/60 bg-background/40 pl-8 text-sm" />
            </div>
            {selected.size > 0 && (
              <Button size="sm" variant="outline" onClick={deleteSelected} className="h-9 border-destructive/40 text-destructive hover:bg-destructive/10">
                <Trash2 className="mr-1.5 size-3.5" /> Delete {selected.size} selected
              </Button>
            )}
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <CheckSquare className="size-3.5 text-muted-foreground" />
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition ${activeTags.includes(t) ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"}`}
                >
                  {t}
                </button>
              ))}
              {activeTags.length > 0 && (
                <button onClick={() => setActiveTags([])} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
              )}
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
        </div>
      ) : !assets?.length ? (
        <EmptyState icon={<ImageIcon className="size-5" />} title="No assets yet" description="Upload a photo or video to start building your library." />
      ) : !filtered.length ? (
        <EmptyState icon={<Search className="size-5" />} title="No matches" description="Try a different search term or clear the tag filters." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((a) => (
            <AssetCard key={a.id} asset={a} selected={selected.has(a.id)} selectMode={selected.size > 0} onToggleSelect={() => toggleSelect(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
