"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useVehicles, Vehicle } from "@/hooks/use-vehicles";
import { VehicleDetail } from "@/components/vehicles/VehicleDetail";

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const { data, isLoading } = useVehicles({ search: search || undefined, limit: 60 });
  const vehicles = data?.data || [];

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ padding: isDesktop ? "0 32px 40px" : "0 16px 100px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Vehículos</div>
        <div style={{ fontSize: 13, color: "var(--text-sec)" }}>{data?.total ?? 0} registrados</div>
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
      ) : vehicles.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Sin vehículos</div>
      ) : isDesktop ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Vehículo", "Patente", "Año", "Motor", "KM", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v: Vehicle) => (
                <tr
                  key={v.id}
                  onClick={() => setSelectedId(v.id)}
                  style={{
                    borderBottom: "1px solid var(--border)", cursor: "pointer",
                    background: selectedId === v.id ? "var(--accent-soft)" : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                    {v.brand} {v.model}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {v.plate ? (
                      <span style={{ fontSize: 13, color: "var(--accent)", fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 600 }}>
                        {v.plate}
                      </span>
                    ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-sec)" }}>{v.year || "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-sec)" }}>{v.engine || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {v.lastMileage ? (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                          {v.lastMileage.toLocaleString("es-AR")} km
                        </div>
                        {v.lastMileageAt && (
                          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
                            {new Date(v.lastMileageAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        )}
                      </div>
                    ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <span style={{ fontSize: 12, color: "var(--accent)" }}>Ver →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {vehicles.map((v: Vehicle) => (
            <button
              key={v.id}
              onClick={() => setSelectedId(v.id)}
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 14, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
                  {v.brand} {v.model}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
                  {v.year && <span style={{ fontSize: 12, color: "var(--text-sec)" }}>{v.year}</span>}
                  {v.engine && <span style={{ fontSize: 12, color: "var(--text-sec)" }}>{v.engine}</span>}
                  {v.lastMileage && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 600 }}>
                      {v.lastMileage.toLocaleString("es-AR")} km
                    </span>
                  )}
                </div>
              </div>
              {v.plate && (
                <span style={{ fontSize: 13, color: "var(--accent)", background: "var(--accent-soft)", padding: "4px 10px", borderRadius: 7, flexShrink: 0, fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}>
                  {v.plate}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <VehicleDetail
        vehicleId={selectedId}
        onClose={() => setSelectedId(null)}
        isDesktop={isDesktop}
      />
    </div>
  );
}
