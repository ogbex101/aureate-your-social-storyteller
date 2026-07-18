import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppTopbar } from "@/components/AppTopbar";
import { FloatingActions } from "@/components/FloatingActions";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <SidebarInset className="min-w-0 bg-background">
          <AppTopbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8">
            <Outlet />
          </main>
        </SidebarInset>
        <FloatingActions />
      </div>
    </SidebarProvider>
  );
}