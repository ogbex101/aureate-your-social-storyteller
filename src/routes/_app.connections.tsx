import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PlatformIcon } from "@/components/PlatformIcon";
import type { Platform } from "@/lib/store";
import type { PlatformConnectionRow } from "@/lib/database.types";
import { platformMeta } from "@/lib/mock-data";
import { useConnections, useToggleConnection, useUpdateConnectionDetails } from "@/lib/queries";
import { Check, ExternalLink, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/connections")({
  component: Connections,
});

const allPlatforms: Platform[] = ["instagram", "facebook", "linkedin", "tiktok", "x", "pinterest", "youtube", "threads"];

function ConnectionCard({ platform, row, onToggle, toggling }: { platform: Platform; row: PlatformConnectionRow | undefined; onToggle: () => void; toggling: boolean }) {
  const updateDetails = useUpdateConnectionDetails();
  const connected = row?.status === "connected";
  const [editing, setEditing] = useState(false);
  const [handle, setHandle] = useState(row?.handle ?? "");
  const [profileUrl, setProfileUrl] = useState(row?.profile_url ?? "");

  useEffect(() => {
    setHandle(row?.handle ?? "");
    setProfileUrl(row?.profile_url ?? "");
  }, [row?.handle, row?.profile_url]);

  const saveDetails = () => {
    updateDetails.mutate(
      { platform, handle: handle.trim(), profile_url: profileUrl.trim() },
      {
        onError: (e) => toast.error(e.message),
        onSuccess: () => { toast.success("Saved"); setEditing(false); },
      },
    );
  };

  return (
    <Card className={`border p-5 transition ${connected ? "border-primary/40 bg-primary/5" : "border-border/60 bg-card/60"}`}>
      <div className="flex items-start justify-between">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <PlatformIcon platform={platform} className="size-5" />
        </div>
        {connected && <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary"><Check className="size-3" /> Connected</span>}
      </div>
      <h3 className="mt-4 font-serif text-lg">{platformMeta[platform].label}</h3>

      {connected && editing ? (
        <div className="mt-2 space-y-2">
          <Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@handle" className="h-8 border-border/60 bg-background/40 text-xs" />
          <Input value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} placeholder="https://…" className="h-8 border-border/60 bg-background/40 text-xs" />
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" disabled={updateDetails.isPending} onClick={saveDetails} className="h-7 flex-1 border-primary/40 text-xs text-primary hover:bg-primary/10">
              {updateDetails.isPending ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 flex-1 text-xs text-muted-foreground">Cancel</Button>
          </div>
        </div>
      ) : connected ? (
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="min-w-0">
            {row?.handle ? (
              row?.profile_url ? (
                <a href={row.profile_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 truncate text-xs text-primary hover:underline">
                  {row.handle} <ExternalLink className="size-2.5 shrink-0" />
                </a>
              ) : (
                <p className="truncate text-xs text-muted-foreground">{row.handle}</p>
              )
            ) : (
              <p className="text-xs text-muted-foreground">No handle set</p>
            )}
          </div>
          <button onClick={() => setEditing(true)} className="shrink-0 text-muted-foreground hover:text-primary"><Pencil className="size-3.5" /></button>
        </div>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">Not connected</p>
      )}

      <Button onClick={onToggle} disabled={toggling} variant={connected ? "ghost" : "default"} size="sm" className={`mt-4 w-full ${connected ? "text-muted-foreground hover:text-destructive" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
        {connected ? "Disconnect" : "Connect account"}
      </Button>
    </Card>
  );
}

function Connections() {
  const { data: connections, isLoading } = useConnections();
  const toggle = useToggleConnection();

  const rowFor = (p: Platform) => connections?.find((c) => c.platform === p);
  const isConnected = (p: Platform) => rowFor(p)?.status === "connected";

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl">Connect the places you show up.</h2>
          <p className="mt-1 text-sm text-muted-foreground">Aureate posts natively — no cross-posted screenshots, no watermarks.</p>
        </div>
        <Link to="/profile" className="shrink-0 text-xs text-primary hover:underline">Contact details →</Link>
      </div>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allPlatforms.map((p) => <Skeleton key={p} className="h-40 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allPlatforms.map((p) => (
            <ConnectionCard key={p} platform={p} row={rowFor(p)} onToggle={() => onToggle(p)} toggling={toggle.isPending} />
          ))}
        </div>
      )}
    </div>
  );
}
