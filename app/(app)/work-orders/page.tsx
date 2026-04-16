"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { OrderDetail } from "@/components/work-orders/OrderDetail";
import { formatCurrency } from "@/lib/utils";
import { useWorkOrders } from "@/hooks/use-work-orders";

const FILTERS = [
  ["", "Todos"], ["new", "Nuevos"], ["progress", "En proceso"],
  ["delayed", "Demorados"], ["completed", "Completados"], ["incomplete", "Incompletos"],
];

export default function WorkOrdersPage() {
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const { data, isLoading } = useWorkOrders({ status: filter || undefined, search: search || undefined });

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ padding: isDesktop ? "0 32px 40px" : "0 16px 100px" }}>
      <div style={{ padding: "20px 0 16px", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
        Trabajos
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
          <Search size={16} />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por marca, modelo, trabajo..."
          style={{
            width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "11px 16px 11px 40px", color: "var(--text)",
            fontSize: 14, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 12 }}>
        {FILTERS.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            style={{
              padding: "8px 14px", borderRadius: 20,
              border: filter === k ? `1px solid var(--accent)` : `1px solid var(--border)`,
              background: filter === k ? "var(--accent-soft)" : "transparent",
              color: filter === k ? "var(--accent)" : "var(--text-sec)",
              fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Cargando...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(data?.data || []).map((o) => {
            const daysIn = Math.floor((Date.now() - new Date(o.enteredAt).getTime()) / 86400000);
            const statusColor = { new: "var(--green)", progress: "var(--yellow)", delayed: "var(--red)", completed: "var(--accent)", incomplete: "var(--orange)" }[o.status] || "var(--border)";
            return (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderLeft: `3px solid ${statusColor}`,
                  borderRadius: 14, padding: "16px 18px", cursor: "pointer", textAlign: "left",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                      {o.vehicle?.brand} {o.vehicle?.model}{" "}
                      <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>· {o.vehicle?.year}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 2 }}>
                      {o.vehicle?.plate}
                    </div>
                  </div>
                  <Badge status={o.status} />
                </div>
                <div style={{ fontSize: 13, color: "var(--text-sec)", marginBottom: 10 }}>
                  {o.description || "Sin trabajo definido"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                    {formatCurrency(o.totalPrice)}
                  </span>
                  <span style={{ fontSize: 12, color: daysIn >= 3 ? "var(--red)" : "var(--text-muted)" }}>
                    {daysIn}d en taller
                  </span>
                </div>
              </button>
            );
          })}
          {!data?.data?.length && (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              Sin órdenes
            </div>
          )}
        </div>
      )}

      <OrderDetail orderId={selectedId} onClose={() => setSelectedId(null)} isDesktop={isDesktop} />
    </div>
  );
}
