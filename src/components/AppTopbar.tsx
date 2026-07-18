import { Bell, Search } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/calendar": "Content calendar",
  "/new-post": "New post",
  "/schedule": "Schedule settings",
  "/connections": "Platform connections",
  "/messaging": "Messaging bots",
  "/analytics": "Analytics",
  "/team": "Team & approvals",
  "/brand": "Brand & voice",
  "/onboarding": "Get set up",
};

export function AppTopbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = titles[pathname] ?? "Aureate";
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="text-foreground/80 hover:text-primary" />
      <div className="flex flex-1 items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <Badge variant="outline" className="hidden border-primary/30 text-primary md:inline-flex">Beta</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search captions, campaigns…" className="h-9 w-64 border-border/60 bg-card/40 pl-9 text-sm" />
          </div>
          <button className="relative rounded-md p-2 text-foreground/70 hover:bg-card hover:text-foreground">
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
          </button>
          <Avatar className="size-8 border border-primary/30">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-medium">AR</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}