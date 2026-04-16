"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down";
  compact?: boolean;
}

export function StatCard({ label, value, sub, trend, compact }: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: compact ? "14px 16px" : "18px 20px",
        flex: 1,
        minWidth: compact ? 120 : 140,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: compact ? 4 : 8,
        }}
      >
        <span
          style={{
            color: "var(--text-sec)",
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: compact ? 20 : 26,
          fontWeight: 700,
          color: "var(--text)",
          fontFamily: "var(--font-jetbrains-mono), monospace",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
            fontSize: 12,
            color: trend === "up" ? "var(--green)" : "var(--red)",
          }}
        >
          {trend === "up" ? (
            <TrendingUp size={13} />
          ) : (
            <TrendingDown size={13} />
          )}
          {sub}
        </div>
      )}
    </div>
  );
}
