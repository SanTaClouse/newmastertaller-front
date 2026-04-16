"use client";

import { STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";

interface BadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function Badge({ status, size = "md" }: BadgeProps) {
  const s = STATUS_COLORS[status] || { color: "var(--text-sec)", bg: "var(--surface-alt)" };
  const label = STATUS_LABELS[status] || status;
  const padding = size === "sm" ? "2px 8px" : "4px 10px";
  const fontSize = size === "sm" ? 11 : 12;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding,
        borderRadius: 20,
        background: s.bg,
        color: s.color,
        fontSize,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.color,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
