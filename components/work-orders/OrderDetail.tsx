"use client";

import { useState } from "react";
import { X, Phone, Trash2, Edit3, Check, ChevronRight } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { AddExpenseModal } from "./AddExpenseModal";
import { formatCurrency, whatsappLink, daysBetween, timeAgo } from "@/lib/utils";
import {
  useWorkOrder, useDeleteExpense, useAdvancePhase, useCompleteWorkOrder,
} from "@/hooks/use-work-orders";
import { useRepairPhases } from "@/hooks/use-repair-phases";

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface OrderDetailProps {
  orderId: string | null;
  onClose: () => void;
  isDesktop: boolean;
}

export function OrderDetail({ orderId, onClose, isDesktop }: OrderDetailProps) {
  const [showAddExp, setShowAddExp] = useState(false);
  const { data: order, isLoading } = useWorkOrder(orderId || "");
  const { data: phases = [] } = useRepairPhases();
  const deleteExpense = useDeleteExpense(orderId || "");
  const advancePhase = useAdvancePhase(orderId || "");
  const completeOrder = useCompleteWorkOrder(orderId || "");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!orderId) return null;

  const content = isLoading ? (
    <div style={{ padding: 24, color: "var(--text-muted)", textAlign: "center" }}>Cargando...</div>
  ) : !order ? null : (() => {
    const totalExpenses = order.expenses?.reduce((s, e) => s + Number(e.cost), 0) || 0;
    const profit = Number(order.totalPrice) - totalExpenses;
    const daysIn = daysBetween(order.enteredAt);
    const isDelayed = daysIn >= 3;

    const firstName = order.client?.fullName?.split(" ")[0] || "";
    const waTrackingMsg = `Hola ${firstName}, podés seguir el estado de tu ${order.vehicle?.brand || ""} ${order.vehicle?.model || ""} en tiempo real desde este link: ${appUrl}/tracking/${order.trackingCode}`;
    const waLink = order.client?.phone
      ? whatsappLink(order.client.phone, waTrackingMsg)
      : "#";
    const callLink = order.client?.phone ? `tel:${order.client.phone}` : "#";

    const currentPhaseIndex = phases.findIndex((p) => p.id === order.currentPhaseId);
    const hasNextPhase = currentPhaseIndex < phases.length - 1;

    return (
      <div style={{ padding: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
              {order.vehicle?.brand} {order.vehicle?.model}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-sec)", marginTop: 2 }}>
              {order.vehicle?.year && `${order.vehicle.year} · `}{order.vehicle?.plate}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Badge status={order.status} />
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
            #{order.trackingCode}
          </span>
        </div>

        {/* Client + Communication */}
        {order.client && (
          <div style={{ background: "var(--card)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Cliente
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
              {order.client.fullName}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, padding: 12, background: "var(--whatsapp-soft)",
                  border: "1px solid rgba(37,211,102,0.25)", borderRadius: 12,
                  color: "var(--whatsapp)", fontSize: 14, fontWeight: 600, textDecoration: "none",
                }}
              >
                <WhatsAppIcon /> Seguimiento
              </a>
              <a
                href={callLink}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, padding: 12, background: "var(--accent-soft)",
                  border: "1px solid rgba(59,130,246,0.25)", borderRadius: 12,
                  color: "var(--accent)", fontSize: 14, fontWeight: 600, textDecoration: "none",
                }}
              >
                <Phone size={16} /> Llamar
              </a>
            </div>
          </div>
        )}

        {/* Work info */}
        <div style={{ background: "var(--card)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Trabajo</div>
          <div style={{ fontSize: 15, color: "var(--text)" }}>{order.description || "Sin especificar"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 13, color: isDelayed ? "var(--red)" : "var(--text-sec)" }}>
            {isDelayed ? "⚠" : "🕐"} {daysIn} {daysIn === 1 ? "día" : "días"} en taller
            {isDelayed && " — demorado"}
          </div>
        </div>

        {/* Phase */}
        {order.currentPhaseId && phases.length > 0 && (
          <div style={{ background: "var(--card)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Fase actual</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
              {phases.find((p) => p.id === order.currentPhaseId)?.name || "—"}
            </div>
            {hasNextPhase && order.status !== "completed" && (
              <button
                onClick={() => advancePhase.mutate()}
                disabled={advancePhase.isPending}
                style={{
                  marginTop: 12, display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", background: "var(--accent-soft)",
                  border: "1px solid rgba(59,130,246,0.25)", borderRadius: 10,
                  color: "var(--accent)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                <ChevronRight size={16} /> Avanzar fase
              </button>
            )}
          </div>
        )}

        {/* Financials */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, background: "var(--card)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Precio</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
              {formatCurrency(order.totalPrice)}
            </div>
          </div>
          <div style={{ flex: 1, background: "var(--card)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Mano de obra</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
              {formatCurrency(order.laborCost)}
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div style={{ background: "var(--card)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Gastos / Repuestos</div>
            <button
              onClick={() => setShowAddExp(true)}
              style={{
                display: "flex", alignItems: "center", gap: 4, padding: "6px 12px",
                background: "var(--accent-soft)", border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 8, color: "var(--accent)", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              + Agregar
            </button>
          </div>
          {!order.expenses?.length ? (
            <div style={{ textAlign: "center", padding: 16, color: "var(--text-muted)", fontSize: 13 }}>Sin gastos registrados</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {order.expenses.map((e) => (
                <div
                  key={e.id}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 12px", background: "var(--surface-alt)", borderRadius: 10,
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text)", flex: 1 }}>{e.description}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--red)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                      {formatCurrency(e.cost)}
                    </span>
                    <button
                      onClick={() => deleteExpense.mutate(e.id)}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderTop: "1px solid var(--border)", marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-sec)" }}>Total gastos</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--red)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Net profit */}
        <div
          style={{
            background: profit >= 0 ? "var(--green-soft)" : "var(--red-soft)",
            borderRadius: 14, padding: 16, marginBottom: 16,
            border: `1px solid ${profit >= 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          <div style={{ fontSize: 11, color: profit >= 0 ? "var(--green)" : "var(--red)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            Ganancia neta
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: profit >= 0 ? "var(--green)" : "var(--red)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
            {formatCurrency(profit)}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          {order.status !== "completed" && (
            <button
              onClick={() => completeOrder.mutate()}
              disabled={completeOrder.isPending}
              style={{
                flex: 1, padding: 14, background: "var(--green)", color: "#fff",
                border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Check size={16} /> {completeOrder.isPending ? "..." : "Completar"}
            </button>
          )}
        </div>

        <AddExpenseModal open={showAddExp} onClose={() => setShowAddExp(false)} workOrderId={orderId || ""} />
      </div>
    );
  })();

  if (isDesktop) {
    return (
      <div
        style={{
          position: "fixed", right: 0, top: 0, width: 420, height: "100vh",
          overflowY: "auto", background: "var(--surface)",
          borderLeft: "1px solid var(--border)", zIndex: 200,
          boxShadow: "-4px 0 30px rgba(0,0,0,0.3)",
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(10px)", zIndex: 1000,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
          background: "var(--surface)", borderRadius: "20px 20px 0 0",
          border: "1px solid var(--border)", borderBottom: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
}
