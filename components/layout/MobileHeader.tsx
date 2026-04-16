"use client";

import { Wrench, Plus } from "lucide-react";

interface MobileHeaderProps {
  onNewOrder: () => void;
}

export function MobileHeader({ onNewOrder }: MobileHeaderProps) {
  return (
    <header
      style={{
        padding: "14px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <Wrench size={16} />
        </div>
        <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>MiTaller</span>
      </div>
      <button
        onClick={onNewOrder}
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: "var(--accent)",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 20px var(--accent-glow)",
        }}
      >
        <Plus size={20} />
      </button>
    </header>
  );
}
