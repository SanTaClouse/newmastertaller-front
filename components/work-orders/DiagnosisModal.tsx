"use client";

import { useState } from "react";
import { X, Send, Check, Clock, Stethoscope } from "lucide-react";
import { useUpdateWorkOrder, useAdvancePhase } from "@/hooks/use-work-orders";
import { formatCurrency, diagnosisWhatsappMessage, whatsappLink } from "@/lib/utils";

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface DiagnosisModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  nextPhaseName: string;
  vehicle: string;
  client: { fullName: string; phone: string } | null;
  trackingCode: string;
  initialDiagnosis?: string;
  initialPrice?: number;
}

type Step = "form" | "sent";

export function DiagnosisModal({
  open, onClose, orderId, nextPhaseName,
  vehicle, client, trackingCode, initialDiagnosis, initialPrice,
}: DiagnosisModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis || "");
  const [price, setPrice] = useState(initialPrice ? String(initialPrice) : "");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [estimatedUnit, setEstimatedUnit] = useState<"horas" | "días">("días");
  const [saving, setSaving] = useState(false);

  const updateOrder = useUpdateWorkOrder(orderId);
  const advancePhase = useAdvancePhase(orderId);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const trackingUrl = `${appUrl}/tracking/${trackingCode}`;
  const firstName = client?.fullName?.split(" ")[0] || "cliente";

  const waMessage = diagnosis && price && estimatedTime
    ? diagnosisWhatsappMessage({
        firstName,
        vehicle,
        diagnosis,
        price: Number(price),
        estimatedTime: Number(estimatedTime),
        estimatedUnit,
        trackingUrl,
      })
    : null;

  const waLink = client?.phone && waMessage
    ? whatsappLink(client.phone, waMessage)
    : null;

  const handleSave = async () => {
    if (!diagnosis.trim()) return;
    setSaving(true);
    try {
      await updateOrder.mutateAsync({
        diagnosis: diagnosis.trim(),
        totalPrice: price ? Number(price) : undefined,
      });
      await advancePhase.mutateAsync();
      setStep("sent");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setStep("form");
    onClose();
  };

  if (!open) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface-alt)", border: "1px solid var(--border)",
    borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 14,
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={handleClose}
    >
      <div
        style={{ width: "100%", maxWidth: 500, background: "var(--surface)", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Stethoscope size={16} style={{ color: "var(--accent)" }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
                {step === "form" ? `Avanzar a "${nextPhaseName}"` : "¡Diagnóstico cargado!"}
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {step === "form" ? vehicle : `${vehicle} · ${nextPhaseName}`}
            </div>
          </div>
          <button onClick={handleClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {step === "form" ? (
            <>
              {/* Diagnosis */}
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 6, display: "block" }}>
                  Diagnóstico técnico *
                </label>
                <textarea
                  autoFocus
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  placeholder="Describí el problema encontrado..."
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {/* Price */}
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 6, display: "block" }}>
                  Costo de reparación ($)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0"
                  style={{ ...inputStyle, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 18, fontWeight: 700 }}
                />
                {price && Number(price) > 0 && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    {formatCurrency(Number(price))}
                  </div>
                )}
              </div>

              {/* Estimated time */}
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={11} /> Tiempo estimado
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="number"
                    value={estimatedTime}
                    onChange={e => setEstimatedTime(e.target.value)}
                    placeholder="3"
                    min={1}
                    style={{ ...inputStyle, flex: 1, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 16, fontWeight: 700 }}
                  />
                  <div style={{ display: "flex", background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                    {(["horas", "días"] as const).map(u => (
                      <button
                        key={u}
                        onClick={() => setEstimatedUnit(u)}
                        style={{
                          padding: "10px 16px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                          background: estimatedUnit === u ? "var(--accent)" : "transparent",
                          color: estimatedUnit === u ? "#fff" : "var(--text-sec)",
                          transition: "all 0.15s",
                        }}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* WA preview */}
              {waMessage && (
                <div style={{ background: "var(--card)", borderRadius: 12, padding: 14, borderLeft: "3px solid var(--whatsapp)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Vista previa del mensaje</div>
                  <div style={{ fontSize: 12, color: "var(--text-sec)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{waMessage}</div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button
                  onClick={handleSave}
                  disabled={saving || !diagnosis.trim()}
                  style={{ flex: 1, padding: 14, background: diagnosis.trim() ? "var(--accent)" : "var(--border)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: diagnosis.trim() ? "pointer" : "not-allowed" }}
                >
                  {saving ? "Guardando..." : "Guardar y avanzar fase"}
                </button>
                <button
                  onClick={handleClose}
                  style={{ padding: "14px 18px", background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-sec)", fontSize: 14, cursor: "pointer" }}
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            /* Step 2: success + WA send */
            <>
              <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--green-soft)", border: "2px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Check size={24} style={{ color: "var(--green)" }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Fase avanzada correctamente</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {client ? `¿Querés notificar a ${firstName}?` : "No hay cliente asignado para notificar"}
                </div>
              </div>

              {waMessage && (
                <div style={{ background: "var(--card)", borderRadius: 12, padding: 14, borderLeft: "3px solid var(--whatsapp)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Mensaje para el cliente</div>
                  <div style={{ fontSize: 12, color: "var(--text-sec)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{waMessage}</div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, background: "var(--whatsapp)", color: "#fff", borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none" }}
                  >
                    <WhatsAppIcon /> Enviar por WhatsApp a {firstName}
                  </a>
                )}
                <button
                  onClick={handleClose}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-sec)", fontSize: 14, cursor: "pointer" }}
                >
                  <Send size={14} /> Cerrar sin enviar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
