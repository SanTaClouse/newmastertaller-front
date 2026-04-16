"use client";

import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import {
  useVehiclesFlow, useAvgDays, useTopJobs, useRevenueVsExpenses,
} from "@/hooks/use-stats";

// ── helpers ───────────────────────────────────────────────────────────────────

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function toLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function getMonday(d: Date) {
  const r = new Date(d);
  const dow = r.getDay();
  r.setDate(r.getDate() - (dow === 0 ? 6 : dow - 1));
  r.setHours(0,0,0,0);
  return r;
}
function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(d.getDate() + n); return r;
}
function weekLabel(mon: Date) {
  const sun = addDays(mon, 6);
  const s = `${DAY_SHORT[mon.getDay()]} ${mon.getDate()}`;
  const e = `${DAY_SHORT[sun.getDay()]} ${sun.getDate()}`;
  return mon.getMonth() === sun.getMonth()
    ? `${s} – ${e} ${MONTH_SHORT[mon.getMonth()]}`
    : `${s} ${MONTH_SHORT[mon.getMonth()]} – ${e} ${MONTH_SHORT[sun.getMonth()]}`;
}

// ── custom tooltip ────────────────────────────────────────────────────────────

function FlowTooltip({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "10px 14px", fontSize: 13,
    }}>
      <div style={{ color: "var(--text-sec)", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, display: "flex", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>{p.value}</span>
          <span>{p.name}</span>
        </div>
      ))}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const today = new Date();
  const [monday, setMonday] = useState<Date>(() => getMonday(today));
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const weekStart = toLocalDateStr(monday);
  const isCurrentWeek = weekStart === toLocalDateStr(getMonday(today));
  const isFutureWeek = monday > today;

  const { data: flow } = useVehiclesFlow(weekStart);
  const { data: avgData } = useAvgDays();
  const { data: topJobs } = useTopJobs(6);
  const { data: rve } = useRevenueVsExpenses();

  // Enrich flow data with readable day labels
  const chartData = useMemo(() => {
    if (!flow) return [];
    return flow.map((d: { date: string; entered: number; exited: number }) => ({
      ...d,
      day: DAY_SHORT[new Date(d.date + "T12:00:00").getDay()],
    }));
  }, [flow]);

  const maxJobProfit = topJobs ? Math.max(...topJobs.map((j) => j.totalProfit), 1) : 1;

  const pad = isDesktop ? "0 32px 40px" : "0 16px 100px";

  const navBtn: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 34, height: 34, background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 8, cursor: "pointer", color: "var(--text-sec)", flexShrink: 0,
  };

  const card: React.CSSProperties = {
    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20,
  };

  const kpiCard: React.CSSProperties = {
    ...card, flex: 1,
  };

  return (
    <div style={{ padding: pad }}>
      {/* Header */}
      <div style={{ padding: "20px 0 16px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Estadísticas</div>
        <div style={{ fontSize: 13, color: "var(--text-sec)" }}>Rendimiento del taller</div>
      </div>

      {/* Week nav */}
      <div style={{
        ...card, display: "flex", alignItems: "center", gap: 10,
        marginBottom: 20, padding: "12px 14px",
      }}>
        <button style={navBtn} onClick={() => setMonday(addDays(monday, -7))}>
          <ChevronLeft size={16} />
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{weekLabel(monday)}</div>
          {isCurrentWeek && <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 1 }}>Semana actual</div>}
        </div>
        <button
          style={{ ...navBtn, opacity: isFutureWeek ? 0.4 : 1, cursor: isFutureWeek ? "not-allowed" : "pointer" }}
          onClick={() => !isFutureWeek && setMonday(addDays(monday, 7))}
          disabled={isFutureWeek}
        >
          <ChevronRight size={16} />
        </button>
        {!isCurrentWeek && (
          <button
            onClick={() => setMonday(getMonday(today))}
            style={{
              padding: "5px 10px", background: "var(--accent-soft)",
              border: "1px solid rgba(59,130,246,0.25)", borderRadius: 7,
              color: "var(--accent)", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >
            Hoy
          </button>
        )}
      </div>

      {/* ── 1. Vehicles flow chart ───────────────────────────────────────── */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
            Entrada vs Salida de vehículos
          </div>
          <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 2 }}>
            Ingresaron al taller vs fueron retirados por día
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              axisLine={false} tickLine={false} width={24}
            />
            <Tooltip content={<FlowTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "var(--text-sec)", paddingTop: 8 }}
            />
            <Bar dataKey="entered" name="Entraron" fill="#3B82F6" radius={[4,4,0,0]} />
            <Bar dataKey="exited" name="Salieron" fill="#10B981" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── 2. KPI row ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={kpiCard}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
            Tiempo promedio
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
            {avgData?.avgDays ?? "—"}
            <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-sec)", marginLeft: 4 }}>días</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            {avgData?.count ? `Sobre ${avgData.count} órdenes completadas` : "Sin datos aún"}
          </div>
        </div>

        {rve && (
          <div style={kpiCard}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Este mes — Ganancia
            </div>
            <div style={{
              fontSize: 22, fontWeight: 800, fontFamily: "var(--font-jetbrains-mono), monospace",
              color: rve.current.profit >= 0 ? "var(--green)" : "var(--red)",
            }}>
              {formatCurrency(rve.current.profit)}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              {rve.current.count} trabajos · {formatCurrency(rve.current.expenses)} en gastos
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Revenue vs Expenses ──────────────────────────────────────── */}
      {rve && (
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
            Ingresos vs Egresos
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Este mes", data: rve.current },
              { label: "Mes anterior", data: rve.previous, muted: true },
            ].map(({ label, data, muted }) => (
              <div key={label} style={{
                flex: 1, background: "var(--card)", borderRadius: 12, padding: 14,
                opacity: muted ? 0.7 : 1,
              }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                  {label}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Row label="Facturado" value={formatCurrency(data.revenue)} color="var(--text)" />
                  <Row label="Gastos" value={formatCurrency(data.expenses)} color="var(--red)" />
                  <div style={{ height: 1, background: "var(--border)", margin: "2px 0" }} />
                  <Row
                    label="Ganancia"
                    value={formatCurrency(data.profit)}
                    color={data.profit >= 0 ? "var(--green)" : "var(--red)"}
                    bold
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Top jobs ─────────────────────────────────────────────────── */}
      {topJobs && topJobs.length > 0 && (
        <div style={card}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
              Top trabajos por rentabilidad
            </div>
            <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 2 }}>
              Ganancia neta acumulada por tipo de trabajo
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topJobs.map((job, i) => {
              const pct = (job.totalProfit / maxJobProfit) * 100;
              return (
                <div key={job.description}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: i === 0 ? "var(--yellow)" : "var(--text-muted)",
                        width: 18, textAlign: "center", flexShrink: 0,
                      }}>
                        {i === 0 ? "★" : `#${i + 1}`}
                      </span>
                      <span style={{
                        fontSize: 13, color: "var(--text)", fontWeight: 500,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {job.description}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                        ×{job.count}
                      </span>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 700,
                        color: job.totalProfit >= 0 ? "var(--green)" : "var(--red)",
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                      }}>
                        {formatCurrency(job.totalProfit)}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {formatCurrency(job.avgProfit)}/u
                      </div>
                    </div>
                  </div>
                  <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${Math.max(pct, 4)}%`,
                      background: i === 0 ? "var(--yellow)" : "var(--accent)",
                      borderRadius: 3, transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, color, bold }: { label: string; value: string; color: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
      <span style={{
        fontSize: bold ? 15 : 13, fontWeight: bold ? 700 : 600, color,
        fontFamily: "var(--font-jetbrains-mono), monospace",
      }}>
        {value}
      </span>
    </div>
  );
}
