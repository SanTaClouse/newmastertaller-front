"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wrench, BarChart2, Clock, Users } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/work-orders", label: "Trabajos", icon: Wrench },
  { href: "/stats", label: "Stats", icon: BarChart2 },
  { href: "/history", label: "Historial", icon: Clock },
  { href: "/clients", label: "Clientes", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 0 12px",
        zIndex: 900,
      }}
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              color: active ? "var(--accent)" : "var(--text-muted)",
              textDecoration: "none",
              padding: "4px 12px",
              position: "relative",
              minWidth: 50,
            }}
          >
            {active && (
              <span
                style={{
                  position: "absolute",
                  top: -8,
                  width: 20,
                  height: 3,
                  borderRadius: 2,
                  background: "var(--accent)",
                }}
              />
            )}
            <Icon size={22} />
            <span style={{ fontSize: 11, fontWeight: active ? 600 : 400 }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
