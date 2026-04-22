"use client";

import { useState, useEffect, useMemo } from "react";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/common/Badge";
import { OrderDetail } from "@/components/work-orders/OrderDetail";
import { formatCurrency } from "@/lib/utils";
import { useDashboard, useWeeklyStats } from "@/hooks/use-stats";
import { useWorkOrders } from "@/hooks/use-work-orders";

// Compute the Monday of the current week in local timezone (YYYY-MM-DD)
function getLocalMonday(): string {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun, 1=Mon...
  const diff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

// Derive short day name from a YYYY-MM-DD string
function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][d.getDay()];
}

// Format "Lun 13" from a YYYY-MM-DD string
function dayShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return `${["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][d.getDay()]} ${d.getDate()}`;
}

export default function DashboardPage() {
  const [selDay, setSelDay] = useState<number | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const weekStart = useMemo(() => getLocalMonday(), []);

  const { data: dash } = useDashboard();
  const { data: weekly } = useWeeklyStats(weekStart);
  const { data: activeOrders } = useWorkOrders({ status: undefined, limit: 10 });
  const selectedDate = selDay !== null && weekly ? weekly[selDay]?.date : undefined;
  const { data: dayOrders } = useWorkOrders({
    from: selectedDate,
    to: selectedDate,
    limit: 50,
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
  const pending = activeOrders?.data?.filter((o) => o.status !== "completed" && o.status !== "retired") || [];

  // Compute today's date string for highlighting
  const todayStr = new Date().toISOString().slice(0, 10);

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
          const isToday = d.date === todayStr;
          return (
            <button
              key={i}
              onClick={() => setSelDay(active ? null : i)}
              style={{
                minWidth: 60, padding: "12px 8px", borderRadius: 14,
                border: active ? `2px solid var(--accent)` : isToday ? `1px solid var(--accent)` : `1px solid var(--border)`,
                background: active ? "var(--accent-soft)" : "var(--surface)",
                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: active ? "var(--accent)" : isToday ? "var(--accent)" : "var(--text-sec)" }}>
                {dayLabel(d.date)}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {new Date(d.date + "T12:00:00").getDate()}
              </span>
              <span style={{ fontSize: 22, fontWeight: 700, color: active ? "var(--text)" : "var(--text-sec)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                {d.count}
              </span>
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
      {selDay !== null && dayOrders && weekly && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", marginBottom: 10 }}>
            {dayShort(weekly[selDay].date)} — {dayOrders.data.length} trabajo{dayOrders.data.length !== 1 ? "s" : ""}
          </div>
          {dayOrders.data.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)", fontSize: 13 }}>
              Sin órdenes este día
            </div>
          ) : (
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
          )}
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
