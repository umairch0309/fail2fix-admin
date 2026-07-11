import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { WebSocketProvider } from "@/components/websocket-provider";
import { GlobalSheets } from "@/components/global-sheets";
import { requireRole } from "@/lib/auth-utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side admin check - redirects non-admin users to login
  await requireRole("admin", "/login");

  return (
    <div className="h-screen bg-[#F4F4F4] p-2 md:p-4 flex overflow-hidden">
      <SidebarProvider className="h-full">
        <AppSidebar />
        <main className="flex-1 min-w-0 bg-white rounded-xl border border-[#EAEAEA] flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 min-h-0 overflow-auto">
            <WebSocketProvider>
              {children}
            </WebSocketProvider>
          </div>
        </main>
      </SidebarProvider>
      <GlobalSheets />
    </div>
  );
}
