"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OrderDetail } from "@/components/work-orders/OrderDetail";
import { formatCurrency } from "@/lib/utils";
import { useWorkOrders, WorkOrder } from "@/hooks/use-work-orders";

// ── Helpers ──────────────────────────────────────────────────────────────────

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

/** YYYY-MM-DD in local timezone */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Monday of the week containing `d` (local timezone) */
function getMonday(d: Date): Date {
  const result = new Date(d);
  const dow = result.getDay(); // 0=Sun
  result.setDate(result.getDate() - (dow === 0 ? 6 : dow - 1));
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Add N days to a date */
function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(d.getDate() + n);
  return result;
}

/** "Lun 13 – Dom 19 Abr" or "Lun 28 Abr – Dom 4 May" */
function weekLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  const startDay = `${DAY_NAMES[monday.getDay()]} ${monday.getDate()}`;
  const endDay = `${DAY_NAMES[sunday.getDay()]} ${sunday.getDate()}`;
  if (monday.getMonth() === sunday.getMonth()) {
    return `${startDay} – ${endDay} ${MONTH_NAMES[monday.getMonth()]}`;
  }
  return `${startDay} ${MONTH_NAMES[monday.getMonth()]} – ${endDay} ${MONTH_NAMES[sunday.getMonth()]}`;
}

function completedOn(order: WorkOrder): string {
  return (order.completedAt || order.createdAt).slice(0, 10);
}

function daysBetweenDates(entered: string, completed: string): number {
  const a = new Date(entered);
  const b = new Date(completed);
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / 86400000));
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const today = new Date();
  // The currently viewed week, identified by its Monday
  const [monday, setMonday] = useState<Date>(() => getMonday(today));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sunday = addDays(monday, 6);
  const from = toLocalDateStr(monday);
  const to = toLocalDateStr(sunday);

  const { data, isLoading } = useWorkOrders({
    status: "completed",
    from,
    to,
    limit: 100,
    includeFinancials: true,
  });

  const orders = data?.data || [];

  // Build 7-day grid for the current week
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(monday, i);
      const dateStr = toLocalDateStr(d);
      return {
        date: dateStr,
        label: `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
        orders: orders.filter((o) => completedOn(o) === dateStr),
      };
    });
  }, [monday, orders]);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.totalPrice), 0);
  const totalProfit = orders.reduce(
    (s, o) => s + (o.netProfit ?? Number(o.totalPrice) - (o.totalExpenses ?? 0)),
    0
  );

  const todayStr = toLocalDateStr(today);
  const isCurrentWeek = from === toLocalDateStr(getMonday(today));
  const isFutureWeek = monday > today;

  const navBtn: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 36, height: 36, background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 10, cursor: "pointer", color: "var(--text-sec)",
    flexShrink: 0,
  };

  return (
    <div style={{ padding: isDesktop ? "0 32px 40px" : "0 16px 100px" }}>
      {/* Header */}
      <div style={{ padding: "20px 0 16px" }}>
        <div style={{ fontSize: 13, color: "var(--text-sec)" }}>Trabajos terminados</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Vista semanal</div>
      </div>

      {/* Week navigator */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "12px 14px",
      }}>
        <button style={navBtn} onClick={() => setMonday(addDays(monday, -7))}>
          <ChevronLeft size={18} />
        </button>

        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
            {weekLabel(monday)}
          </div>
          {isCurrentWeek && (
            <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 2 }}>Semana actual</div>
          )}
        </div>

        <button
          style={{ ...navBtn, opacity: isFutureWeek ? 0.4 : 1, cursor: isFutureWeek ? "not-allowed" : "pointer" }}
          onClick={() => !isFutureWeek && setMonday(addDays(monday, 7))}
          disabled={isFutureWeek}
        >
          <ChevronRight size={18} />
        </button>

        {!isCurrentWeek && (
          <button
            onClick={() => setMonday(getMonday(today))}
            style={{
              padding: "6px 12px", background: "var(--accent-soft)",
              border: "1px solid rgba(59,130,246,0.25)", borderRadius: 8,
              color: "var(--accent)", fontSize: 12, fontWeight: 600, cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Hoy
          </button>
        )}
      </div>

      {/* Week summary totals */}
      {orders.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={{
            flex: 1, background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "12px 16px",
          }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              Facturado
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
              {formatCurrency(totalRevenue)}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {orders.length} trabajo{orders.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div style={{
            flex: 1, background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "12px 16px",
          }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              Ganancia neta
            </div>
            <div style={{
              fontSize: 20, fontWeight: 700,
              color: totalProfit >= 0 ? "var(--green)" : "var(--red)",
              fontFamily: "var(--font-jetbrains-mono), monospace",
            }}>
              {formatCurrency(totalProfit)}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Cargando...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {days.map(({ date, label, orders: dayOrders }) => {
            const isFuture = date > todayStr;
            const isToday = date === todayStr;
            if (isFuture) return null; // don't render future days

            return (
              <div key={date}>
                {/* Day header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: isToday ? "var(--accent)" : dayOrders.length > 0 ? "var(--text)" : "var(--text-muted)",
                    minWidth: 80,
                  }}>
                    {label}
                  </span>
                  {dayOrders.length > 0 && (
                    <span style={{
                      fontSize: 11, padding: "2px 8px",
                      background: "var(--green-soft)", color: "var(--green)",
                      borderRadius: 20, fontWeight: 600,
                    }}>
                      {dayOrders.length} trabajo{dayOrders.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </div>

                {dayOrders.length === 0 ? (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", paddingLeft: 4, paddingBottom: 4 }}>
                    Sin trabajos completados
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {dayOrders.map((o) => {
                      const expenses = o.totalExpenses ?? 0;
                      const profit = o.netProfit ?? (Number(o.totalPrice) - expenses);
                      const days = daysBetweenDates(o.enteredAt, o.completedAt || o.createdAt);

                      return (
                        <button
                          key={o.id}
                          onClick={() => setSelectedId(o.id)}
                          style={{
                            background: "var(--surface)", border: "1px solid var(--border)",
                            borderLeft: "3px solid var(--green)", borderRadius: 14,
                            padding: "14px 16px", cursor: "pointer", textAlign: "left",
                            width: "100%",
                          }}
                        >
                          {/* Vehicle + days */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                              {o.vehicle?.brand} {o.vehicle?.model}
                              {o.vehicle?.year && (
                                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400, marginLeft: 6 }}>
                                  {o.vehicle.year}
                                </span>
                              )}
                            </span>
                            <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", marginLeft: 8 }}>
                              {days} {days === 1 ? "día" : "días"}
                            </span>
                          </div>

                          {/* Client + description */}
                          {(o.client || o.description) && (
                            <div style={{ fontSize: 12, color: "var(--text-sec)", marginBottom: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {o.client && <span style={{ color: "var(--accent)" }}>{o.client.fullName}</span>}
                              {o.client && o.description && <span style={{ color: "var(--text-muted)" }}>·</span>}
                              {o.description && <span>{o.description}</span>}
                            </div>
                          )}

                          {/* Financials row */}
                          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                            <div>
                              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>Cobrado</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                                {formatCurrency(o.totalPrice)}
                              </div>
                            </div>
                            {expenses > 0 && (
                              <div>
                                <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>Invertido</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--red)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                                  {formatCurrency(expenses)}
                                </div>
                              </div>
                            )}
                            <div>
                              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>Ganancia</div>
                              <div style={{
                                fontSize: 15, fontWeight: 700,
                                color: profit >= 0 ? "var(--green)" : "var(--red)",
                                fontFamily: "var(--font-jetbrains-mono), monospace",
                              }}>
                                {formatCurrency(profit)}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {orders.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
              Sin trabajos completados esta semana
            </div>
          )}
        </div>
      )}

      <OrderDetail orderId={selectedId} onClose={() => setSelectedId(null)} isDesktop={isDesktop} />
    </div>
  );
}
