"use client";

import { useState, useEffect } from "react";
import { Search, Phone } from "lucide-react";
import { useClients, Client } from "@/hooks/use-clients";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);
  const { data, isLoading } = useClients({ search: search || undefined });

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const clients: Client[] = data?.data || [];

  return (
    <div style={{ padding: isDesktop ? "0 32px 40px" : "0 16px 100px" }}>
      <div style={{ padding: "20px 0 16px", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
        Clientes
      </div>

      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
          <Search size={16} />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          style={{
            width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "12px 16px 12px 40px", color: "var(--text)",
            fontSize: 14, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Cargando...</div>
      ) : isDesktop ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Cliente", "Teléfono", "Email", "Alta"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{c.fullName}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-sec)" }}>
                    <a href={`tel:${c.phone}`} style={{ color: "var(--accent)", textDecoration: "none" }}>{c.phone}</a>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-sec)" }}>{c.email || "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>
                    {new Date(c.createdAt).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {clients.map((c) => (
            <div
              key={c.id}
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 14, padding: "14px 16px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{c.fullName}</div>
                <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                  <Phone size={12} />{c.phone}
                </div>
              </div>
              <a
                href={`tel:${c.phone}`}
                style={{
                  padding: "8px 14px", background: "var(--accent-soft)",
                  border: "1px solid rgba(59,130,246,0.25)", borderRadius: 10,
                  color: "var(--accent)", fontSize: 13, fontWeight: 600, textDecoration: "none",
                }}
              >
                Llamar
              </a>
            </div>
          ))}
          {!clients.length && (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Sin clientes</div>
          )}
        </div>
      )}
    </div>
  );
}
