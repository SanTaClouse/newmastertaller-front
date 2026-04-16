"use client";

import { BarChart2, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DesktopPanelProps {
  collapsed: boolean;
  onToggle: () => void;
  weekProfit?: number;
  prevWeekProfit?: number;
  completedOrders?: { id: string; vehicle?: { brand: string; model?: string }; totalPrice: number; description?: string }[];
}

export function DesktopPanel({
  collapsed,
  onToggle,
  weekProfit = 0,
  prevWeekProfit = 0,
  completedOrders = [],
}: DesktopPanelProps) {
  if (collapsed) {
    return (
      <aside
        onClick={onToggle}
        style={{
          width: 48,
          height: "100vh",
          position: "fixed",
          right: 0,
          top: 0,
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: 20,
          cursor: "pointer",
          zIndex: 50,
          color: "var(--text-muted)",
        }}
      >
        <BarChart2 size={20} />
      </aside>
    );
  }

  return (
    <aside
      style={{
        width: "var(--panel-width)",
        height: "100vh",
        position: "fixed",
        right: 0,
        top: 0,
        background: "var(--surface)",
        borderLeft: "1px solid var(--border)",
        overflowY: "auto",
        padding: "20px 16px",
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
          Resumen semanal
        </span>
        <button
          onClick={onToggle}
          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div
        style={{
          background: "var(--green-soft)",
          borderRadius: 14,
          padding: 16,
          marginBottom: 16,
          border: "1px solid rgba(16,185,129,0.15)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--green)",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 4,
          }}
        >
          Ganancia semanal
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--green)",
            fontFamily: "var(--font-jetbrains-mono), monospace",
          }}
        >
          {formatCurrency(weekProfit)}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 4 }}>
          Sem. anterior: {formatCurrency(prevWeekProfit)}
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>
        Completados esta semana
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {completedOrders.length === 0 && (
          <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 13 }}>
            Sin trabajos completados
          </div>
        )}
        {completedOrders.map((o) => (
          <div
            key={o.id}
            style={{
              background: "var(--card)",
              borderRadius: 10,
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                {o.vehicle?.brand} {o.vehicle?.model}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {o.description || "Sin descripción"}
              </div>
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--green)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              {formatCurrency(o.totalPrice)}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
