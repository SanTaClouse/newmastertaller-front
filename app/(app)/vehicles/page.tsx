"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", search],
    queryFn: () => api.get("/vehicles", { params: { search: search || undefined, limit: 50 } }).then((r) => r.data),
  });

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const vehicles = data?.data || [];

  return (
    <div style={{ padding: isDesktop ? "0 32px 40px" : "0 16px 100px" }}>
      <div style={{ padding: "20px 0 16px", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
        Vehículos
      </div>

      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
          <Search size={16} />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por marca, modelo, patente..."
          style={{
            width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "12px 16px 12px 40px", color: "var(--text)",
            fontSize: 14, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Cargando...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {vehicles.map((v: { id: string; brand: string; model?: string; year?: number; plate?: string; color?: string }) => (
            <div
              key={v.id}
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 14, padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
                {v.brand} {v.model}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                {v.year && <span style={{ fontSize: 12, color: "var(--text-sec)" }}>{v.year}</span>}
                {v.plate && (
                  <span style={{
                    fontSize: 12, color: "var(--text-sec)", background: "var(--card)",
                    padding: "2px 8px", borderRadius: 6, fontFamily: "var(--font-jetbrains-mono), monospace",
                  }}>
                    {v.plate}
                  </span>
                )}
                {v.color && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{v.color}</span>}
              </div>
            </div>
          ))}
          {!vehicles.length && (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Sin vehículos</div>
          )}
        </div>
      )}
    </div>
  );
}
