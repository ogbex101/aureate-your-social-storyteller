import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useAssets, useUploadAsset, useDeleteAsset, useUpdateAssetTags, type AssetWithUrl } from "@/lib/queries";
import { ImageIcon, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/assets")({
  component: Assets,
});

function AssetCard({ asset }: { asset: AssetWithUrl }) {
  const updateTags = useUpdateAssetTags();
  const deleteAsset = useDeleteAsset();
  const [newTag, setNewTag] = useState("");
  const isImage = asset.file_type?.startsWith("image/");

  const addTag = () => {
    if (!newTag.trim()) return;
    updateTags.mutate({ id: asset.id, tags: [...asset.tags, newTag.trim()] }, { onError: (e) => toast.error(e.message) });
    setNewTag("");
  };

  return (
    <Card className="overflow-hidden border-border/60 bg-card/60">
      <div className="relative aspect-square w-full bg-background/40">
        {isImage && asset.url ? (
          <img src={asset.url} alt={asset.file_name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-8" />
          </div>
        )}
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      upload.mutate(file, {
        onError: (e) => toast.error(`${file.name}: ${e.message}`),
        onSuccess: () => toast.success(`${file.name} uploaded`),
      });
    }
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

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
        </div>
      ) : !assets?.length ? (
        <EmptyState icon={<ImageIcon className="size-5" />} title="No assets yet" description="Upload a photo or video to start building your library." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {assets.map((a) => <AssetCard key={a.id} asset={a} />)}
        </div>
      )}
    </div>
  );
}
