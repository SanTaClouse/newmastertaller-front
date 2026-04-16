"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/common/Badge";
import { OrderDetail } from "@/components/work-orders/OrderDetail";
import { formatCurrency } from "@/lib/utils";
import { useDashboard, useWeeklyStats } from "@/hooks/use-stats";
import { useWorkOrders } from "@/hooks/use-work-orders";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function DashboardPage() {
  const [selDay, setSelDay] = useState<number | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const { data: dash } = useDashboard();
  const { data: weekly } = useWeeklyStats();
  const { data: activeOrders } = useWorkOrders({ status: undefined, limit: 10 });
  const { data: dayOrders } = useWorkOrders({
    from: selDay !== null && weekly ? weekly[selDay]?.date : undefined,
    to: selDay !== null && weekly ? weekly[selDay]?.date : undefined,
    limit: 20,
  });

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const weekProfit = dash?.weekProfit || 0;
  const prevWeekProfit = dash?.prevWeekProfit || 0;
  const diff = weekProfit - prevWeekProfit;
  const weekRevenue = dash?.weekRevenue || 0;
  const pending = activeOrders?.data?.filter((o) => o.status !== "completed") || [];

  return (
    <div style={{ padding: isDesktop ? "0 32px 40px" : "0 16px 100px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <div style={{ fontSize: 13, color: "var(--text-sec)" }}>Semana actual</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Dashboard</div>
      </div>

      {/* Day selector */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 20 }}>
        {(weekly || []).map((d: { date: string; count: number }, i: number) => {
          const active = selDay === i;
          return (
            <button
              key={i}
              onClick={() => setSelDay(active ? null : i)}
              style={{
                minWidth: 56, padding: "12px 8px", borderRadius: 14,
                border: active ? `2px solid var(--accent)` : `1px solid var(--border)`,
                background: active ? "var(--accent-soft)" : "var(--surface)",
                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: active ? "var(--accent)" : "var(--text-sec)" }}>
                {DAYS[i]}
              </span>
              <span style={{ fontSize: 20, fontWeight: 700, color: active ? "var(--text)" : "var(--text-sec)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                {d.count}
              </span>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>autos</span>
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Facturado" value={formatCurrency(weekRevenue)} compact={!isDesktop} />
        <StatCard
          label="Ganancia"
          value={formatCurrency(weekProfit)}
          sub={`${diff > 0 ? "+" : ""}${formatCurrency(diff)} vs ant.`}
          trend={diff >= 0 ? "up" : "down"}
          compact={!isDesktop}
        />
      </div>

      {/* Day orders */}
      {selDay !== null && dayOrders && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", marginBottom: 10 }}>
            {DAYS[selDay]} — {dayOrders.data.length} trabajo{dayOrders.data.length !== 1 ? "s" : ""}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {dayOrders.data.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedOrderId(o.id)}
                style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderLeft: `3px solid var(--accent)`, borderRadius: 12,
                  padding: "12px 16px", cursor: "pointer", textAlign: "left",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                    {o.vehicle?.brand} {o.vehicle?.model}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-sec)" }}>{o.description || "Sin trabajo definido"}</div>
                </div>
                <Badge status={o.status} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pending orders */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Pendientes</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{dash?.activeOrders || 0} activos</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pending.slice(0, 6).map((o) => {
          const daysIn = Math.floor((Date.now() - new Date(o.enteredAt).getTime()) / 86400000);
          return (
            <button
              key={o.id}
              onClick={() => setSelectedOrderId(o.id)}
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 14, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                  {o.vehicle?.brand} {o.vehicle?.model}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-sec)" }}>{o.description || "Sin trabajo definido"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <Badge status={o.status} />
                {daysIn >= 3 && (
                  <div style={{ fontSize: 11, color: "var(--red)", marginTop: 4, fontWeight: 600 }}>
                    ⚠ {daysIn}d
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <OrderDetail orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} isDesktop={isDesktop} />
    </div>
  );
}
