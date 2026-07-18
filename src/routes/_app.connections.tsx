import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/PlatformIcon";
import { useAppStore, type Platform } from "@/lib/store";
import { platformMeta } from "@/lib/mock-data";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_app/connections")({
  component: Connections,
});

const handles: Partial<Record<Platform, string>> = {
  instagram: "@meridiancoffee",
  facebook: "Meridian Coffee Co.",
  linkedin: "Meridian Coffee Company",
  x: "@meridiancoffee",
  threads: "@meridiancoffee",
};

const followers: Partial<Record<Platform, string>> = {
  instagram: "18.2k",
  facebook: "6.4k",
  linkedin: "2.1k",
  x: "9.8k",
  threads: "3.2k",
};

function Connections() {
  const { connected, toggleConnection } = useAppStore();
  const allPlatforms: Platform[] = ["instagram", "facebook", "linkedin", "tiktok", "x", "pinterest", "youtube", "threads"];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl">Connect the places you show up.</h2>
        <p className="mt-1 text-sm text-muted-foreground">Aureate posts natively — no cross-posted screenshots, no watermarks.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allPlatforms.map((p) => {
          const isConnected = connected[p];
          return (
            <Card key={p} className={`border p-5 transition ${isConnected ? "border-primary/40 bg-primary/5" : "border-border/60 bg-card/60"}`}>
              <div className="flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <PlatformIcon platform={p} className="size-5" />
                </div>
                {isConnected && <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary"><Check className="size-3" /> Connected</span>}
              </div>
              <h3 className="mt-4 font-serif text-lg">{platformMeta[p].label}</h3>
              {isConnected ? (
                <div className="mt-1 space-y-0.5 text-xs">
                  <p className="text-foreground/80">{handles[p] ?? "@meridiancoffee"}</p>
                  <p className="text-muted-foreground">{followers[p] ?? "—"} followers · last synced 2m ago</p>
                </div>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Not connected</p>
              )}
              <Button onClick={() => toggleConnection(p)} variant={isConnected ? "ghost" : "default"} size="sm" className={`mt-4 w-full ${isConnected ? "text-muted-foreground hover:text-destructive" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                {isConnected ? "Disconnect" : "Connect account"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}