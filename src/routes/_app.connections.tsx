import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlatformIcon } from "@/components/PlatformIcon";
import type { Platform } from "@/lib/store";
import { platformMeta } from "@/lib/mock-data";
import { useConnections, useToggleConnection } from "@/lib/queries";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/connections")({
  component: Connections,
});

const allPlatforms: Platform[] = ["instagram", "facebook", "linkedin", "tiktok", "x", "pinterest", "youtube", "threads"];

function Connections() {
  const { data: connections, isLoading } = useConnections();
  const toggle = useToggleConnection();

  const isConnected = (p: Platform) => connections?.some((c) => c.platform === p && c.status === "connected") ?? false;

  const onToggle = (p: Platform) => {
    toggle.mutate(
      { platform: p, connect: !isConnected(p) },
      {
        onError: (e) => toast.error(e.message),
        onSuccess: () => toast.success(isConnected(p) ? `Disconnected ${platformMeta[p].label}` : `Connected ${platformMeta[p].label}`),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl">Connect the places you show up.</h2>
        <p className="mt-1 text-sm text-muted-foreground">Aureate posts natively — no cross-posted screenshots, no watermarks.</p>
      </div>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allPlatforms.map((p) => <Skeleton key={p} className="h-40 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allPlatforms.map((p) => {
            const connected = isConnected(p);
            return (
              <Card key={p} className={`border p-5 transition ${connected ? "border-primary/40 bg-primary/5" : "border-border/60 bg-card/60"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <PlatformIcon platform={p} className="size-5" />
                  </div>
                  {connected && <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary"><Check className="size-3" /> Connected</span>}
                </div>
                <h3 className="mt-4 font-serif text-lg">{platformMeta[p].label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{connected ? "Connected via Aureate" : "Not connected"}</p>
                <Button onClick={() => onToggle(p)} disabled={toggle.isPending} variant={connected ? "ghost" : "default"} size="sm" className={`mt-4 w-full ${connected ? "text-muted-foreground hover:text-destructive" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                  {connected ? "Disconnect" : "Connect account"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
