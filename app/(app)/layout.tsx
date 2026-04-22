"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopPanel } from "@/components/layout/DesktopPanel";
import { CreateOrderModal } from "@/components/work-orders/CreateOrderModal";
import { usePathname } from "next/navigation";
import { useWorkOrders } from "@/hooks/use-work-orders";
import { useDashboard } from "@/hooks/use-stats";
import { DetailPanelProvider, useDetailPanel } from "@/contexts/detail-panel-context";

const DETAIL_PANEL_WIDTH = 420;

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const pathname = usePathname();
  const { isOpen: detailOpen } = useDetailPanel();

  const { data: dashData } = useDashboard();
  const { data: ordersData } = useWorkOrders({ status: "completed", limit: 5 });

  const showPanel = isDesktop && (pathname.includes("dashboard") || pathname.includes("work-orders"));

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const rightPanelWidth = showPanel ? (panelCollapsed ? 48 : 280) : 0;
  const detailWidth = isDesktop && detailOpen ? DETAIL_PANEL_WIDTH : 0;
  const totalRightMargin = rightPanelWidth + detailWidth;

  return (
    <AuthGuard>
      {isDesktop && <Sidebar onNewOrder={() => setCreateOpen(true)} />}
      {showPanel && (
        <DesktopPanel
          collapsed={panelCollapsed}
          onToggle={() => setPanelCollapsed((v) => !v)}
          weekProfit={dashData?.weekProfit}
          prevWeekProfit={dashData?.prevWeekProfit}
          completedOrders={ordersData?.data || []}
        />
      )}

      {!isDesktop && <MobileHeader onNewOrder={() => setCreateOpen(true)} />}

      <main
        style={{
          minHeight: "100vh",
          transition: "margin 0.3s",
          maxWidth: isDesktop ? undefined : 520,
          margin: isDesktop ? `0 ${totalRightMargin}px 0 var(--sidebar-width)` : "0 auto",
          paddingBottom: isDesktop ? 0 : 80,
        }}
      >
        {children}
      </main>

      {!isDesktop && <BottomNav />}

      <CreateOrderModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </AuthGuard>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DetailPanelProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </DetailPanelProvider>
  );
}
