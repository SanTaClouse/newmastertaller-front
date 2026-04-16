"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/utils";
import { useWeeklyStats, useMonthlyStats } from "@/hooks/use-stats";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function StatsPage() {
  const [isDesktop, setIsDesktop] = useState(false);
  const { data: weekly } = useWeeklyStats();
  const { data: monthly } = useMonthlyStats();

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const maxProfit = weekly ? Math.max(...weekly.map((d: { profit: number }) => d.profit), 1) : 1;
  const totProfit = weekly?.reduce((s: number, d: { profit: number }) => s + d.profit, 0) || 0;
  const totRev = weekly?.reduce((s: number, d: { revenue: number }) => s + d.revenue, 0) || 0;

  return (
    <div style={{ padding: isDesktop ? "0 32px 40px" : "0 16px 100px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Estadísticas</div>
        <div style={{ fontSize: 13, color: "var(--text-sec)" }}>Semana actual</div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Facturado" value={formatCurrency(totRev)} compact={!isDesktop} />
        <StatCard label="Ganancia" value={formatCurrency(totProfit)} compact={!isDesktop} />
      </div>

      {/* Weekly chart */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>Ganancia por día</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140 }}>
          {(weekly || []).map((d: { profit: number }, i: number) => {
            const h = Math.max((d.profit / maxProfit) * 120, 4);
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "var(--text-sec)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                  {d.profit > 0 ? `${Math.round(d.profit / 1000)}k` : ""}
                </span>
                <div
                  style={{
                    width: "100%",
                    height: h,
                    background: "linear-gradient(180deg, var(--accent), var(--accent-dark))",
                    borderRadius: "6px 6px 2px 2px",
                    transition: "height 0.5s",
                  }}
                />
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{DAYS[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly comparison */}
      {monthly && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>Comparativa mensual</div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, background: "var(--card)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Este mes</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                {formatCurrency(monthly.current.profit)}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 4 }}>
                {monthly.current.count} órdenes
              </div>
            </div>
            <div style={{ flex: 1, background: "var(--card)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Mes anterior</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-sec)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                {formatCurrency(monthly.previous.profit)}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 4 }}>
                {monthly.previous.count} órdenes
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
