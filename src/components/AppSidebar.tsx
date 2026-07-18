import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, PenSquare, Users, Link2, MessageSquare, BarChart3, Sparkles, Settings, Clock } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { useAppStore } from "@/lib/store";

const primary = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "New post", url: "/new-post", icon: PenSquare },
  { title: "Schedule", url: "/schedule", icon: Clock },
];

const secondary = [
  { title: "Connections", url: "/connections", icon: Link2 },
  { title: "Messaging bots", url: "/messaging", icon: MessageSquare },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const settings = [
  { title: "Brand", url: "/brand", icon: Sparkles },
  { title: "Team", url: "/team", icon: Users, orgOnly: true },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const accountType = useAppStore((s) => s.accountType);
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  const renderGroup = (label: string, items: { title: string; url: string; icon: typeof LayoutDashboard; orgOnly?: boolean }[]) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] text-primary/70">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.filter((i) => !i.orgOnly || accountType === "organization").map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} className="data-[active=true]:bg-primary/15 data-[active=true]:text-primary hover:bg-sidebar-accent">
                <Link to={item.url} className="flex items-center gap-2.5">
                  <item.icon className="size-4" />
                  <span className="font-sans">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-4 pt-5 pb-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-serif font-bold text-lg">A</div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-serif text-lg font-semibold text-foreground">Aureate</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Meridian Coffee</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-1">
        {renderGroup("Workspace", primary)}
        {renderGroup("Channels", secondary)}
        {renderGroup("Settings", settings)}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        <Link to="/onboarding" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <Settings className="size-3.5" /> <span className="group-data-[collapsible=icon]:hidden">Re-run onboarding</span>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}