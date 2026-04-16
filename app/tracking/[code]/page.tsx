import { Metadata } from "next";
import { CheckCircle2, Circle, Loader2, Phone, Wrench } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface TrackingPhase {
  name: string;
  orderIndex: number;
  icon?: string;
  status: "completed" | "current" | "pending";
  completedAt?: string;
  enteredAt?: string;
}

interface TrackingData {
  vehicle: { brand?: string; model?: string; year?: number; plate?: string };
  client: { firstName: string } | null;
  status: string;
  enteredAt: string;
  workshop: { name?: string; phone?: string; address?: string };
  currentPhase: { name: string; orderIndex: number } | null;
  phases: TrackingPhase[];
}

async function getTracking(code: string): Promise<TrackingData | null> {
  try {
    const res = await fetch(`${API_URL}/public/tracking/${code}`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const data = await getTracking(code);
  if (!data) return { title: "Seguimiento | MiTaller" };

  const name = data.client?.firstName ? `Hola ${data.client.firstName}` : "";
  const vehicle = `${data.vehicle.brand || ""} ${data.vehicle.model || ""}`.trim();
  const workshop = data.workshop.name || "MiTaller";

  return {
    title: `${name ? `${name} — ` : ""}${vehicle} | ${workshop}`,
    description: `Seguí en tiempo real el estado de tu ${vehicle} en ${workshop}`,
    openGraph: {
      title: `${vehicle} — Seguimiento en vivo`,
      description: `Estado actual: ${data.currentPhase?.name || data.status}`,
    },
  };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  if (mins > 0) return `hace ${mins} minuto${mins > 1 ? "s" : ""}`;
  return "hace un momento";
}

export default async function TrackingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getTracking(code);

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Código no encontrado</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Verificá el link que te enviaron</div>
        </div>
      </div>
    );
  }

  const vehicle = `${data.vehicle.brand || ""} ${data.vehicle.model || ""}`.trim();
  const greeting = data.client?.firstName ? `Hola ${data.client.firstName}` : "Hola";
  const vehicleDesc = vehicle || "tu vehículo";
  const statusBg: Record<string, string> = {
    new: "var(--green-soft)", progress: "var(--accent-soft)",
    delayed: "var(--red-soft)", completed: "var(--green-soft)", incomplete: "var(--orange-soft)",
  };
  const statusColor: Record<string, string> = {
    new: "var(--green)", progress: "var(--accent)",
    delayed: "var(--red)", completed: "var(--green)", incomplete: "var(--orange)",
  };
  const statusLabel: Record<string, string> = {
    new: "Nuevo ingreso", progress: "En proceso", delayed: "Demorado",
    completed: "Listo para retirar", incomplete: "Incompleto",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'DM Sans', system-ui, sans-serif", color: "var(--text)" }}>
      {/* Header workshop */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "20px 20px 16px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0,
            }}>
              <Wrench size={18} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{data.workshop.name || "Taller"}</div>
              {data.workshop.address && (
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{data.workshop.address}</div>
              )}
            </div>
          </div>
          {data.workshop.phone && (
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <a
                href={`tel:${data.workshop.phone}`}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, padding: "10px", background: "var(--accent-soft)",
                  border: "1px solid rgba(59,130,246,0.25)", borderRadius: 12,
                  color: "var(--accent)", fontSize: 14, fontWeight: 600, textDecoration: "none",
                }}
              >
                <Phone size={16} /> Llamar al taller
              </a>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px 40px" }}>
        {/* Vehicle info */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{greeting},</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
            Tu {vehicleDesc} está en el taller
          </div>
          {(data.vehicle.year || data.vehicle.plate) && (
            <div style={{ fontSize: 13, color: "var(--text-sec)", marginTop: 6, display: "flex", gap: 12 }}>
              {data.vehicle.year && <span>{data.vehicle.year}</span>}
              {data.vehicle.plate && (
                <span style={{ fontFamily: "monospace", background: "var(--card)", padding: "2px 8px", borderRadius: 6 }}>
                  {data.vehicle.plate}
                </span>
              )}
            </div>
          )}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 20,
              background: statusBg[data.status] || "var(--surface-alt)",
              color: statusColor[data.status] || "var(--text-sec)",
              fontSize: 13, fontWeight: 600,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor[data.status] || "var(--text-sec)" }} />
              {statusLabel[data.status] || data.status}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
            Ingresó {timeAgo(data.enteredAt)}
          </div>
        </div>

        {/* Phase timeline */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>
            Estado del trabajo
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.phases.map((phase, i) => {
              const isLast = i === data.phases.length - 1;
              const isCurrent = phase.status === "current";
              const isCompleted = phase.status === "completed";
              const isPending = phase.status === "pending";

              return (
                <div key={i} style={{ display: "flex", gap: 16, position: "relative" }}>
                  {/* Vertical line */}
                  {!isLast && (
                    <div style={{
                      position: "absolute", left: 19, top: 40, bottom: 0, width: 2,
                      background: isCompleted ? "var(--green)" : "var(--border)",
                      zIndex: 0,
                    }} />
                  )}

                  {/* Icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isCompleted ? "var(--green-soft)" : isCurrent ? "var(--accent-soft)" : "var(--card)",
                    border: `2px solid ${isCompleted ? "var(--green)" : isCurrent ? "var(--accent)" : "var(--border)"}`,
                    boxShadow: isCurrent ? "0 0 0 4px var(--accent-glow)" : "none",
                  }}>
                    {isCompleted ? (
                      <CheckCircle2 size={18} style={{ color: "var(--green)" }} />
                    ) : isCurrent ? (
                      <Loader2 size={18} style={{ color: "var(--accent)" }} />
                    ) : (
                      <Circle size={18} style={{ color: "var(--border-light)" }} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ paddingBottom: isLast ? 0 : 24, flex: 1 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: isCurrent ? 700 : isCompleted ? 600 : 400,
                      color: isCurrent ? "var(--accent)" : isCompleted ? "var(--text)" : "var(--text-muted)",
                      paddingTop: 10,
                    }}>
                      {phase.name}
                    </div>
                    {isCompleted && phase.completedAt && (
                      <div style={{ fontSize: 11, color: "var(--green)", marginTop: 2 }}>
                        Completada {timeAgo(phase.completedAt)}
                      </div>
                    )}
                    {isCurrent && phase.enteredAt && (
                      <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 2 }}>
                        En esta fase {timeAgo(phase.enteredAt)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "var(--text-muted)" }}>
          Powered by MiTaller
        </div>
      </div>
    </div>
  );
}
