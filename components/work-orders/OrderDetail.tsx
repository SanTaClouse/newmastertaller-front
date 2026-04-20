"use client";

import { useState, useRef, useEffect } from "react";
import { X, Phone, Trash2, Check, ChevronRight, Edit3, Save, XCircle, UserPlus, Search } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { AddExpenseModal } from "./AddExpenseModal";
import { formatCurrency, whatsappLink, daysBetween } from "@/lib/utils";
import {
  useWorkOrder, useUpdateWorkOrder, useDeleteExpense, useAdvancePhase,
  useCompleteWorkOrder, useRetireWorkOrder,
} from "@/hooks/use-work-orders";
import { useRepairPhases } from "@/hooks/use-repair-phases";
import { useClients, useCreateClient, Client } from "@/hooks/use-clients";

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

function ClientSearch({ currentClient, onSelect }: {
  currentClient?: { id: string; fullName: string; phone: string } | null;
  onSelect: (client: Client | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const createClient = useCreateClient();

  const { data } = useClients({ search: query || undefined, limit: 6 });
  const clients = data?.data || [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface-alt)", border: "1px solid var(--border)",
    borderRadius: 8, padding: "8px 12px", color: "var(--text)", fontSize: 13,
    outline: "none", boxSizing: "border-box",
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const client = await createClient.mutateAsync({ fullName: newName, phone: newPhone });
    onSelect(client);
    setShowNew(false);
    setNewName("");
    setNewPhone("");
  };

  if (showNew) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 12, color: "var(--text-sec)", fontWeight: 600 }}>Nuevo cliente</div>
        <input placeholder="Nombre completo *" value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} />
        <input placeholder="Teléfono *" value={newPhone} onChange={e => setNewPhone(e.target.value)} style={inputStyle} />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleCreate}
            disabled={createClient.isPending || !newName.trim() || !newPhone.trim()}
            style={{
              flex: 1, padding: "8px 12px", background: "var(--accent)", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            {createClient.isPending ? "..." : "Crear y asignar"}
          </button>
          <button onClick={() => setShowNew(false)} style={{ padding: "8px 12px", background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-sec)", fontSize: 13, cursor: "pointer" }}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {currentClient && (
        <div style={{ fontSize: 13, color: "var(--text-sec)", marginBottom: 6 }}>
          Actual: <span style={{ color: "var(--text)", fontWeight: 600 }}>{currentClient.fullName}</span>
        </div>
      )}
      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          placeholder={currentClient ? "Cambiar cliente..." : "Buscar cliente..."}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          style={{ ...inputStyle, paddingLeft: 32 }}
        />
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
          marginTop: 4, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
          {clients.map((c: Client) => (
            <button
              key={c.id}
              onClick={() => { onSelect(c); setQuery(""); setOpen(false); }}
              style={{
                width: "100%", padding: "10px 14px", background: "none", border: "none",
                textAlign: "left", cursor: "pointer", borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{c.fullName}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.phone}</div>
            </button>
          ))}
          <button
            onClick={() => { setShowNew(true); setOpen(false); }}
            style={{
              width: "100%", padding: "10px 14px", background: "none", border: "none",
              textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              color: "var(--accent)", fontSize: 13, fontWeight: 600,
            }}
          >
            <UserPlus size={14} /> Crear nuevo cliente
          </button>
        </div>
      )}
    </div>
  );
}

export function OrderDetail({ orderId, onClose, isDesktop }: OrderDetailProps) {
  const [showAddExp, setShowAddExp] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editLabor, setEditLabor] = useState("");
  const [editClientId, setEditClientId] = useState<string | null | undefined>(undefined);

  const { data: order, isLoading } = useWorkOrder(orderId || "");
  const { data: phases = [] } = useRepairPhases();
  const updateOrder = useUpdateWorkOrder(orderId || "");
  const deleteExpense = useDeleteExpense(orderId || "");
  const advancePhase = useAdvancePhase(orderId || "");
  const completeOrder = useCompleteWorkOrder(orderId || "");
  const retireOrder = useRetireWorkOrder(orderId || "");

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://newmastertaller-front.vercel.app";

  const startEdit = () => {
    if (!order) return;
    setEditDescription(order.description || "");
    setEditPrice(String(order.totalPrice || ""));
    setEditLabor(String(order.laborCost || ""));
    setEditClientId(undefined); // undefined = no change
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const saveEdit = async () => {
    const payload: Record<string, unknown> = {
      description: editDescription || undefined,
      totalPrice: editPrice ? Number(editPrice) : undefined,
      laborCost: editLabor ? Number(editLabor) : undefined,
    };
    if (editClientId !== undefined) payload.clientId = editClientId;
    await updateOrder.mutateAsync(payload);
    setIsEditing(false);
  };

  if (!orderId) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface-alt)", border: "1px solid var(--border)",
    borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };

  const content = isLoading ? (
    <div style={{ padding: 24, color: "var(--text-muted)", textAlign: "center" }}>Cargando...</div>
  ) : !order ? null : (() => {
    const totalExpenses = order.expenses?.reduce((s, e) => s + Number(e.cost), 0) || 0;
    const profit = Number(order.totalPrice) - totalExpenses;
    const daysIn = daysBetween(order.enteredAt);
    const isDelayed = daysIn >= 3;

    // Determine client to show (could be updated in edit mode)
    const displayClient = order.client;

    const firstName = displayClient?.fullName?.split(" ")[0] || "";
    const waTrackingMsg = `Hola ${firstName}, podés seguir el estado de tu ${order.vehicle?.brand || ""} ${order.vehicle?.model || ""} en tiempo real desde este link: ${appUrl}/tracking/${order.trackingCode}`;
    const waLink = displayClient?.phone ? whatsappLink(displayClient.phone, waTrackingMsg) : "#";
    const callLink = displayClient?.phone ? `tel:${displayClient.phone}` : "#";

    const currentPhaseIndex = phases.findIndex((p) => p.id === order.currentPhaseId);
    const hasNextPhase = currentPhaseIndex < phases.length - 1;

    if (isEditing) {
      return (
        <div style={{ padding: 24 }}>
          {/* Edit header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                {order.vehicle?.brand} {order.vehicle?.model}
              </div>
              <div style={{ fontSize: 12, color: "var(--accent)", marginTop: 2, fontWeight: 600 }}>Editando orden</div>
            </div>
            <button onClick={cancelEdit} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
              <XCircle size={22} />
            </button>
          </div>

          {/* Cliente */}
          <div style={{ background: "var(--card)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Cliente</div>
            <ClientSearch
              currentClient={displayClient}
              onSelect={(c) => setEditClientId(c ? c.id : null)}
            />
            {editClientId !== undefined && editClientId !== null && (
              <div style={{ fontSize: 12, color: "var(--green)", marginTop: 8 }}>✓ Cliente actualizado</div>
            )}
          </div>

          {/* Descripción */}
          <div style={{ background: "var(--card)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Trabajo / Descripción</div>
            <textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              placeholder="Describí el trabajo a realizar..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {/* Precio + Mano de obra */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, background: "var(--card)", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Precio total ($)</div>
              <input
                type="number"
                value={editPrice}
                onChange={e => setEditPrice(e.target.value)}
                placeholder="0"
                style={{ ...inputStyle, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 18, fontWeight: 700 }}
              />
            </div>
            <div style={{ flex: 1, background: "var(--card)", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Mano de obra ($)</div>
              <input
                type="number"
                value={editLabor}
                onChange={e => setEditLabor(e.target.value)}
                placeholder="0"
                style={{ ...inputStyle, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 18, fontWeight: 700 }}
              />
            </div>
          </div>

          {/* Save / Cancel */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={saveEdit}
              disabled={updateOrder.isPending}
              style={{
                flex: 1, padding: 14, background: "var(--accent)", color: "#fff",
                border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Save size={16} /> {updateOrder.isPending ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              onClick={cancelEdit}
              style={{
                padding: "14px 20px", background: "var(--surface-alt)",
                border: "1px solid var(--border)", borderRadius: 12,
                color: "var(--text-sec)", fontSize: 14, cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      );
    }

    // View mode
    return (
      <div style={{ padding: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
              {order.vehicle?.brand} {order.vehicle?.model}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
              {order.vehicle?.year && (
                <span style={{ fontSize: 13, color: "var(--text-sec)" }}>{order.vehicle.year}</span>
              )}
              {order.vehicle?.plate && (
                <span style={{ fontSize: 13, color: "var(--accent)", fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 600 }}>
                  {order.vehicle.plate}
                </span>
              )}
              {order.vehicle?.engine && (
                <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--card)", padding: "2px 8px", borderRadius: 5 }}>
                  {order.vehicle.engine}
                </span>
              )}
              {order.vehicle?.lastMileage && (
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                  {order.vehicle.lastMileage.toLocaleString("es-AR")} km
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={startEdit}
              title="Editar orden"
              style={{
                background: "var(--accent-soft)", border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 8, padding: "6px 10px", color: "var(--accent)", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
              }}
            >
              <Edit3 size={14} /> Editar
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Badge status={order.status} />
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
            #{order.trackingCode}
          </span>
        </div>

        {/* Client */}
        {displayClient ? (
          <div style={{ background: "var(--card)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Cliente</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>{displayClient.fullName}</div>
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
        ) : (
          <button
            onClick={startEdit}
            style={{
              width: "100%", marginBottom: 12, padding: 14,
              background: "var(--card)", border: "1px dashed var(--border)",
              borderRadius: 14, cursor: "pointer", color: "var(--text-sec)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13,
            }}
          >
            <UserPlus size={16} /> Asignar cliente
          </button>
        )}

        {/* Work info */}
        <div style={{ background: "var(--card)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Trabajo</div>
          <div style={{ fontSize: 15, color: "var(--text)" }}>{order.description || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Sin especificar — editá para agregar</span>}</div>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {order.status !== "completed" && order.status !== "retired" && (
            <button
              onClick={() => completeOrder.mutate()}
              disabled={completeOrder.isPending}
              style={{
                width: "100%", padding: 14, background: "var(--green)", color: "#fff",
                border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Check size={16} /> {completeOrder.isPending ? "..." : "Completar trabajo"}
            </button>
          )}
          {order.status === "completed" && (
            <button
              onClick={() => retireOrder.mutate()}
              disabled={retireOrder.isPending}
              style={{
                width: "100%", padding: 14, background: "var(--surface-alt)",
                border: "1px solid var(--border)", borderRadius: 12,
                fontSize: 14, fontWeight: 600, color: "var(--text-sec)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Check size={16} /> {retireOrder.isPending ? "..." : "Marcar como retirado"}
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
