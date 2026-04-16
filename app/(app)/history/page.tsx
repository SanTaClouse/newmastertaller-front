"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { OrderDetail } from "@/components/work-orders/OrderDetail";
import { formatCurrency } from "@/lib/utils";
import { useWorkOrders } from "@/hooks/use-work-orders";

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const { data, isLoading } = useWorkOrders({ status: "completed", search: search || undefined, page, limit: 20 });

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const orders = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div style={{ padding: isDesktop ? "0 32px 40px" : "0 16px 100px" }}>
      <div style={{ padding: "20px 0 16px", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
        Historial
      </div>

      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
          <Search size={16} />
        </span>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por marca, modelo, cliente, trabajo..."
          style={{
            width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "12px 16px 12px 40px", color: "var(--text)",
            fontSize: 14, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Cargando...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Sin resultados</div>
      ) : isDesktop ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Vehículo", "Patente", "Trabajo", "Precio", "Fecha"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelectedId(o.id)}
                  style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                >
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                    {o.vehicle?.brand} {o.vehicle?.model}{" "}
                    <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>{o.vehicle?.year}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-sec)" }}>{o.vehicle?.plate || "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-sec)" }}>{o.description || "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                    {formatCurrency(o.totalPrice)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>
                    {new Date(o.completedAt || o.createdAt).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {orders.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelectedId(o.id)}
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 14, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                  {o.vehicle?.brand} {o.vehicle?.model}{" "}
                  <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>· {o.vehicle?.plate}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 2 }}>{o.description || "—"}</div>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                {formatCurrency(o.totalPrice)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={{ padding: "8px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-sec)", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}
          >
            ← Anterior
          </button>
          <span style={{ padding: "8px 16px", color: "var(--text-sec)", fontSize: 14 }}>
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{ padding: "8px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-sec)", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}
          >
            Siguiente →
          </button>
        </div>
      )}

      <OrderDetail orderId={selectedId} onClose={() => setSelectedId(null)} isDesktop={isDesktop} />
    </div>
  );
}
