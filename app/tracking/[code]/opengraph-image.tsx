import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Seguimiento de vehículo en MiTaller";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const STATUS_LABEL: Record<string, string> = {
  new: "Nuevo ingreso",
  progress: "En proceso",
  delayed: "Demorado",
  completed: "Listo para retirar",
  incomplete: "Trabajo incompleto",
  retired: "Retirado",
};

const STATUS_COLOR: Record<string, string> = {
  new: "#10B981",
  progress: "#3B82F6",
  delayed: "#EF4444",
  completed: "#10B981",
  incomplete: "#F97316",
  retired: "#525C78",
};

export default async function Image({ params }: { params: { code: string } }) {
  let vehicle = "Vehículo";
  let workshop = "MiTaller";
  let status = "progress";
  let phase = "";
  let plate = "";
  let clientName = "";

  try {
    const res = await fetch(`${API_URL}/public/tracking/${params.code}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      vehicle = [data.vehicle?.brand, data.vehicle?.model].filter(Boolean).join(" ") || "Vehículo";
      if (data.vehicle?.year) vehicle += ` ${data.vehicle.year}`;
      plate = data.vehicle?.plate || "";
      workshop = data.workshop?.name || "MiTaller";
      status = data.status || "progress";
      phase = data.currentPhase?.name || "";
      clientName = data.client?.firstName || "";
    }
  } catch {}

  const accentColor = STATUS_COLOR[status] || "#3B82F6";
  const statusLabel = STATUS_LABEL[status] || status;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0B0E14",
          display: "flex",
          flexDirection: "column",
          padding: "60px 72px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Accent bar top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: accentColor }} />

        {/* Workshop name */}
        <div
          style={{
            fontSize: 22,
            color: "#525C78",
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 48,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 16, height: 16, background: "white", borderRadius: 2 }} />
          </div>
          {workshop}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {clientName && (
            <div style={{ fontSize: 28, color: "#8892AD", marginBottom: 12 }}>
              Hola {clientName},
            </div>
          )}

          <div style={{ fontSize: 64, fontWeight: 800, color: "#F0F2F8", lineHeight: 1.1, marginBottom: 24 }}>
            {vehicle}
          </div>

          {plate && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#12151E",
                border: "2px solid #242A3A",
                borderRadius: 10,
                padding: "8px 20px",
                marginBottom: 32,
                width: "fit-content",
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 700, color: accentColor, letterSpacing: 4 }}>{plate}</span>
            </div>
          )}

          {/* Status + phase row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: `${accentColor}22`,
                border: `2px solid ${accentColor}44`,
                borderRadius: 40,
                padding: "12px 24px",
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: accentColor }} />
              <span style={{ fontSize: 22, fontWeight: 700, color: accentColor }}>{statusLabel}</span>
            </div>
            {phase && (
              <div style={{ fontSize: 20, color: "#8892AD", fontWeight: 500 }}>
                · {phase}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: 18,
            color: "#525C78",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #242A3A",
            paddingTop: 24,
            marginTop: 32,
          }}
        >
          <span>Seguimiento en tiempo real</span>
          <span style={{ color: accentColor, fontWeight: 600 }}>MiTaller</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
