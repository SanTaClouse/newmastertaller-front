"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wrench, BarChart2, Clock, Users, Car, Plus, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/work-orders", label: "Trabajos", icon: Wrench },
  { href: "/stats", label: "Estadísticas", icon: BarChart2 },
  { href: "/history", label: "Historial", icon: Clock },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/vehicles", label: "Vehículos", icon: Car },
];

interface SidebarProps {
  onNewOrder: () => void;
}

export function Sidebar({ onNewOrder }: SidebarProps) {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        height: "100vh",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <Wrench size={18} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: -0.3 }}>
            MiTaller
          </div>
          {user && (
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
              {user.tenant.name}
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Primary: full intake form */}
        <Link
          href="/add-order"
          style={{
            width: "100%",
            padding: "12px 16px",
            background: pathname.startsWith("/add-order") ? "var(--accent-dark, #2563EB)" : "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
            textDecoration: "none",
            boxShadow: "0 2px 12px var(--accent-glow)",
          }}
        >
          <Plus size={18} /> Carga completa
        </Link>
        {/* Secondary: quick order modal */}
        <button
          onClick={onNewOrder}
          style={{
            width: "100%",
            padding: "8px 16px",
            marginBottom: 12,
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus size={13} /> Nueva orden rápida
        </button>

        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 16px",
                borderRadius: 10,
                background: active ? "var(--accent-soft)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-sec)",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <Icon size={18} /> {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>MiTaller MVP</span>
        <button
          onClick={clearAuth}
          title="Cerrar sesión"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: 4,
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
