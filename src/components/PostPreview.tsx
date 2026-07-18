import type { Platform } from "@/lib/store";
import { platformMeta } from "@/lib/mock-data";
import { PlatformIcon } from "./PlatformIcon";
import { PostArt } from "./PostArt";
import { Heart, MessageCircle, Repeat2, Share2 } from "lucide-react";

const aspect: Record<Platform, string> = {
  instagram: "aspect-square",
  facebook: "aspect-[1.91/1]",
  linkedin: "aspect-[1.91/1]",
  tiktok: "aspect-[9/16]",
  x: "aspect-[16/9]",
  pinterest: "aspect-[2/3]",
  youtube: "aspect-video",
  threads: "aspect-square",
};

export function PostPreview({ platform, caption, seed, brand = "meridiancoffee" }: { platform: Platform; caption: string; seed: string; brand?: string }) {
  const meta = platformMeta[platform];
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary">
            <PlatformIcon platform={platform} className="size-3.5" />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-medium text-foreground">@{brand}</p>
            <p className="text-[10px] text-muted-foreground">{meta.label} · Preview</p>
          </div>
        </div>
      </div>
      <div className={`relative w-full overflow-hidden ${aspect[platform]} bg-background/40`}>
        <PostArt seed={seed} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 flex items-end p-3">
          <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] text-cream/90 backdrop-blur">{platform === "tiktok" ? "1080 × 1920" : platform === "pinterest" ? "1080 × 1620" : platform === "youtube" || platform === "x" ? "1920 × 1080" : "1080 × 1080"}</span>
        </div>
      </div>
      <div className="space-y-2 px-3 py-3">
        <p className="text-xs leading-relaxed text-foreground/90 line-clamp-3">{caption}</p>
        <div className="flex items-center gap-4 text-muted-foreground">
          <Heart className="size-3.5" />
          <MessageCircle className="size-3.5" />
          {platform === "x" || platform === "threads" ? <Repeat2 className="size-3.5" /> : <Share2 className="size-3.5" />}
        </div>
      </div>
    </div>
  );
}