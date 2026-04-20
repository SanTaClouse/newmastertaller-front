"use client";

import { useState, useEffect } from "react";
import { Search, X, Edit3, Save, XCircle, History, Car, Gauge, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { formatCurrency } from "@/lib/utils";
import { useVehicles, useVehicle, useUpdateVehicle, Vehicle, useMileageLogs, useAddMileageLog, useDeleteMileageLog } from "@/hooks/use-vehicles";
import { useClient } from "@/hooks/use-clients";
import { useWorkOrders, WorkOrder } from "@/hooks/use-work-orders";

// ── Vehicle history card ──────────────────────────────────────────────────────

function HistoryCard({ order, onClick }: { order: WorkOrder; onClick: () => void }) {
  const completedDate = order.completedAt || order.retiredAt;
  const daysInShop = completedDate
    ? Math.max(0, Math.floor((new Date(completedDate).getTime() - new Date(order.enteredAt).getTime()) / 86400000))
    : Math.floor((Date.now() - new Date(order.enteredAt).getTime()) / 86400000);

  const expenses = order.totalExpenses ?? 0;
  const profit = order.netProfit ?? (Number(order.totalPrice) - expenses);

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", background: "var(--surface-alt)", border: "1px solid var(--border)",
        borderLeft: "3px solid var(--accent)", borderRadius: 12,
        padding: "14px 16px", textAlign: "left", cursor: "pointer",
      }}
    >
      {/* Primary: job description */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
        {order.description || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Sin descripción</span>}
      </div>

      {/* Secondary: date + status + days */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <Badge status={order.status} size="sm" />
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {completedDate
            ? new Date(completedDate).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
            : `Ingresó ${new Date(order.enteredAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}`
          }
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>· {daysInShop} {daysInShop === 1 ? "día" : "días"}</span>
      </div>

      {/* Financials — only if there's a price */}
      {Number(order.totalPrice) > 0 && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>Cobrado</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
              {formatCurrency(order.totalPrice)}
            </div>
          </div>
          {expenses > 0 && (
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>Invertido</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--red)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                {formatCurrency(expenses)}
              </div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>Ganancia</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: profit >= 0 ? "var(--green)" : "var(--red)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
              {formatCurrency(profit)}
            </div>
          </div>
        </div>
      )}
    </button>
  );
}

// ── Vehicle modal ─────────────────────────────────────────────────────────────

function VehicleModal({ vehicleId, onClose, isDesktop }: {
  vehicleId: string; onClose: () => void; isDesktop: boolean;
}) {
  const [tab, setTab] = useState<"info" | "history" | "mileage">("info");
  const [isEditing, setIsEditing] = useState(false);
  const [newMileage, setNewMileage] = useState("");
  const [newMileageDate, setNewMileageDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newMileageNotes, setNewMileageNotes] = useState("");
  const [showMileageForm, setShowMileageForm] = useState(false);
  const [editBrand, setEditBrand] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editPlate, setEditPlate] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editEngine, setEditEngine] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { data: vehicle, isLoading } = useVehicle(vehicleId);
  const { data: client } = useClient(vehicle?.clientId || "");
  const { data: ordersData } = useWorkOrders({
    vehicleId,
    includeFinancials: true,
    limit: 100,
  });
  const updateVehicle = useUpdateVehicle(vehicleId);
  const { data: mileageLogs = [] } = useMileageLogs(vehicleId);
  const addMileageLog = useAddMileageLog(vehicleId);
  const deleteMileageLog = useDeleteMileageLog(vehicleId);

  const orders = ordersData?.data || [];

  const startEdit = () => {
    if (!vehicle) return;
    setEditBrand(vehicle.brand);
    setEditModel(vehicle.model || "");
    setEditYear(vehicle.year ? String(vehicle.year) : "");
    setEditPlate(vehicle.plate || "");
    setEditColor(vehicle.color || "");
    setEditEngine(vehicle.engine || "");
    setEditNotes(vehicle.notes || "");
    setIsEditing(true);
  };

  const saveMileage = async () => {
    if (!newMileage || isNaN(Number(newMileage))) return;
    await addMileageLog.mutateAsync({
      mileage: Number(newMileage),
      recordedAt: new Date(newMileageDate).toISOString(),
      notes: newMileageNotes || undefined,
    });
    setNewMileage("");
    setNewMileageNotes("");
    setNewMileageDate(new Date().toISOString().slice(0, 10));
    setShowMileageForm(false);
  };

  const saveEdit = async () => {
    await updateVehicle.mutateAsync({
      brand: editBrand,
      model: editModel || undefined,
      year: editYear ? Number(editYear) : undefined,
      plate: editPlate || undefined,
      color: editColor || undefined,
      engine: editEngine || undefined,
      notes: editNotes || undefined,
    });
    setIsEditing(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface-alt)", border: "1px solid var(--border)",
    borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };

  const content = isLoading ? (
    <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>Cargando...</div>
  ) : !vehicle ? null : (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>
            {vehicle.brand} {vehicle.model}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4, alignItems: "center" }}>
            {vehicle.year && <span style={{ fontSize: 13, color: "var(--text-sec)" }}>{vehicle.year}</span>}
            {vehicle.plate && (
              <span style={{
                fontSize: 13, color: "var(--accent)", background: "var(--accent-soft)",
                padding: "2px 10px", borderRadius: 6,
                fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 600,
              }}>
                {vehicle.plate}
              </span>
            )}
            {vehicle.color && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{vehicle.color}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!isEditing && tab === "info" && (
            <button
              onClick={startEdit}
              style={{
                background: "var(--accent-soft)", border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 8, padding: "6px 10px", color: "var(--accent)",
                cursor: "pointer", fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <Edit3 size={13} /> Editar
            </button>
          )}
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--card)", borderRadius: 10, padding: 4 }}>
        {(["info", "history", "mileage"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setIsEditing(false); setShowMileageForm(false); }}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 7, border: "none", cursor: "pointer",
              background: tab === t ? "var(--surface)" : "transparent",
              color: tab === t ? "var(--accent)" : "var(--text-muted)",
              fontSize: 13, fontWeight: tab === t ? 600 : 400,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.15s",
            }}
          >
            {t === "info" && <><Car size={14} /> Datos</>}
            {t === "history" && <><History size={14} /> Historial ({orders.length})</>}
            {t === "mileage" && <><Gauge size={14} /> KM</>}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {tab === "info" && (
        isEditing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Marca *</div>
                <input value={editBrand} onChange={e => setEditBrand(e.target.value)} style={inputStyle} placeholder="Toyota" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Modelo</div>
                <input value={editModel} onChange={e => setEditModel(e.target.value)} style={inputStyle} placeholder="Corolla" />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Año</div>
                <input type="number" value={editYear} onChange={e => setEditYear(e.target.value)} style={inputStyle} placeholder="2020" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Patente</div>
                <input value={editPlate} onChange={e => setEditPlate(e.target.value.toUpperCase())} style={{ ...inputStyle, fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }} placeholder="ABC123" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Color</div>
                <input value={editColor} onChange={e => setEditColor(e.target.value)} style={inputStyle} placeholder="Rojo" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Motor</div>
              <input value={editEngine} onChange={e => setEditEngine(e.target.value)} style={inputStyle} placeholder="1.6, 2.0 TDI, V8..." />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Notas</div>
              <textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                placeholder="Observaciones del vehículo..."
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={saveEdit}
                disabled={updateVehicle.isPending || !editBrand.trim()}
                style={{
                  flex: 1, padding: "12px 0", background: "var(--accent)", color: "#fff",
                  border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <Save size={15} /> {updateVehicle.isPending ? "Guardando..." : "Guardar"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: "12px 18px", background: "var(--surface-alt)", border: "1px solid var(--border)",
                  borderRadius: 10, color: "var(--text-sec)", fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <XCircle size={15} /> Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Vehicle fields */}
            <div style={{ background: "var(--card)", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <InfoRow label="Marca" value={vehicle.brand} />
                <InfoRow label="Modelo" value={vehicle.model} />
                <InfoRow label="Año" value={vehicle.year?.toString()} />
                <InfoRow label="Patente" value={vehicle.plate} mono />
                <InfoRow label="Color" value={vehicle.color} />
                <InfoRow label="Motor" value={vehicle.engine} />
              </div>
              {vehicle.notes && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Notas</div>
                  <div style={{ fontSize: 13, color: "var(--text-sec)" }}>{vehicle.notes}</div>
                </div>
              )}
            </div>

            {/* Client */}
            {client ? (
              <div style={{ background: "var(--card)", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Propietario</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{client.fullName}</div>
                {client.phone && (
                  <a href={`tel:${client.phone}`} style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none", marginTop: 4, display: "block" }}>
                    {client.phone}
                  </a>
                )}
              </div>
            ) : (
              <div style={{ background: "var(--card)", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>Sin propietario asignado</div>
              </div>
            )}

            {/* Summary from history */}
            {orders.length > 0 && (() => {
              const completed = orders.filter(o => o.status === "completed" || o.status === "retired");
              const totalRev = completed.reduce((s, o) => s + Number(o.totalPrice), 0);
              const totalProfit = completed.reduce((s, o) => s + (o.netProfit ?? Number(o.totalPrice)), 0);
              return (
                <div style={{ background: "var(--card)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                    Resumen histórico
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Visitas</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                        {orders.length}
                      </div>
                    </div>
                    {totalRev > 0 && (
                      <>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Facturado</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                            {formatCurrency(totalRev)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Ganancia</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: totalProfit >= 0 ? "var(--green)" : "var(--red)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                            {formatCurrency(totalProfit)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )
      )}

      {/* History tab */}
      {tab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              Sin historial de trabajos
            </div>
          ) : (
            [...orders]
              .sort((a, b) => {
                const dateA = new Date(a.completedAt || a.retiredAt || a.enteredAt).getTime();
                const dateB = new Date(b.completedAt || b.retiredAt || b.enteredAt).getTime();
                return dateB - dateA;
              })
              .map((o) => (
                <HistoryCard key={o.id} order={o} onClick={() => {}} />
              ))
          )}
        </div>
      )}

      {/* Mileage tab */}
      {tab === "mileage" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Add button / form */}
          {!showMileageForm ? (
            <button
              onClick={() => setShowMileageForm(true)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "11px 0", borderRadius: 10, border: "1px dashed var(--border)",
                background: "transparent", color: "var(--accent)", fontSize: 14,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              <Plus size={16} /> Registrar kilometraje
            </button>
          ) : (
            <div style={{ background: "var(--card)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Nuevo registro</div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Kilometraje *</div>
                  <input
                    type="number"
                    value={newMileage}
                    onChange={(e) => setNewMileage(e.target.value)}
                    placeholder="125000"
                    autoFocus
                    style={{
                      width: "100%", background: "var(--surface-alt)", border: "1px solid var(--border)",
                      borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 14,
                      outline: "none", boxSizing: "border-box",
                      fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 600,
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Fecha *</div>
                  <input
                    type="date"
                    value={newMileageDate}
                    onChange={(e) => setNewMileageDate(e.target.value)}
                    style={{
                      width: "100%", background: "var(--surface-alt)", border: "1px solid var(--border)",
                      borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 14,
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Notas (opcional)</div>
                <input
                  value={newMileageNotes}
                  onChange={(e) => setNewMileageNotes(e.target.value)}
                  placeholder="Ej: al ingreso del vehículo"
                  style={{
                    width: "100%", background: "var(--surface-alt)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 14,
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={saveMileage}
                  disabled={addMileageLog.isPending || !newMileage}
                  style={{
                    flex: 1, padding: "10px 0", background: "var(--accent)", color: "#fff",
                    border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <Save size={14} /> {addMileageLog.isPending ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={() => { setShowMileageForm(false); setNewMileage(""); setNewMileageNotes(""); }}
                  style={{
                    padding: "10px 16px", background: "var(--surface-alt)", border: "1px solid var(--border)",
                    borderRadius: 8, color: "var(--text-sec)", fontSize: 14, cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Log list */}
          {mileageLogs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 13 }}>
              Sin registros de kilometraje
            </div>
          ) : (
            mileageLogs.map((log, i) => {
              const prev = mileageLogs[i + 1];
              const diff = prev ? log.mileage - prev.mileage : null;
              return (
                <div
                  key={log.id}
                  style={{
                    background: "var(--card)", borderRadius: 12, padding: "12px 16px",
                    display: "flex", alignItems: "center", gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 20, fontWeight: 800, color: "var(--text)",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      display: "flex", alignItems: "baseline", gap: 6,
                    }}>
                      {log.mileage.toLocaleString("es-AR")}
                      <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-muted)" }}>km</span>
                      {diff !== null && diff > 0 && (
                        <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>
                          +{diff.toLocaleString("es-AR")}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {new Date(log.recordedAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                      {log.notes && <span style={{ marginLeft: 8 }}>· {log.notes}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMileageLog.mutate(log.id)}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <div style={{
        position: "fixed", right: 0, top: 0, width: 460, height: "100vh",
        overflowY: "auto", background: "var(--surface)",
        borderLeft: "1px solid var(--border)", zIndex: 200,
        boxShadow: "-4px 0 30px rgba(0,0,0,0.3)",
      }}>
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

// ── Info row helper ───────────────────────────────────────────────────────────

function InfoRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{label}</div>
      <div style={{
        fontSize: 14, fontWeight: 600, color: "var(--text)",
        fontFamily: mono ? "var(--font-jetbrains-mono), monospace" : undefined,
      }}>
        {value}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const { data, isLoading } = useVehicles({ search: search || undefined, limit: 60 });
  const vehicles = data?.data || [];

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ padding: isDesktop ? "0 32px 40px" : "0 16px 100px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Vehículos</div>
        <div style={{ fontSize: 13, color: "var(--text-sec)" }}>{data?.total ?? 0} registrados</div>
      </div>

      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
          <Search size={16} />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por marca, modelo, patente..."
          style={{
            width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "12px 16px 12px 40px", color: "var(--text)",
            fontSize: 14, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Cargando...</div>
      ) : vehicles.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Sin vehículos</div>
      ) : isDesktop ? (
        /* Desktop: table */
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Vehículo", "Patente", "Año", "Motor", "KM", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v: Vehicle) => (
                <tr
                  key={v.id}
                  onClick={() => setSelectedId(v.id)}
                  style={{
                    borderBottom: "1px solid var(--border)", cursor: "pointer",
                    background: selectedId === v.id ? "var(--accent-soft)" : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                    {v.brand} {v.model}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {v.plate ? (
                      <span style={{ fontSize: 13, color: "var(--accent)", fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 600 }}>
                        {v.plate}
                      </span>
                    ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-sec)" }}>{v.year || "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-sec)" }}>{v.engine || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {v.lastMileage ? (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                          {v.lastMileage.toLocaleString("es-AR")} km
                        </div>
                        {v.lastMileageAt && (
                          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
                            {new Date(v.lastMileageAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        )}
                      </div>
                    ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <span style={{ fontSize: 12, color: "var(--accent)" }}>Ver →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mobile: cards */
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {vehicles.map((v: Vehicle) => (
            <button
              key={v.id}
              onClick={() => setSelectedId(v.id)}
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 14, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
                  {v.brand} {v.model}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
                  {v.year && <span style={{ fontSize: 12, color: "var(--text-sec)" }}>{v.year}</span>}
                  {v.engine && <span style={{ fontSize: 12, color: "var(--text-sec)" }}>{v.engine}</span>}
                  {v.lastMileage && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 600 }}>
                      {v.lastMileage.toLocaleString("es-AR")} km
                    </span>
                  )}
                </div>
              </div>
              {v.plate && (
                <span style={{
                  fontSize: 13, color: "var(--accent)", background: "var(--accent-soft)",
                  padding: "4px 10px", borderRadius: 7, flexShrink: 0,
                  fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700,
                }}>
                  {v.plate}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedId && (
        <VehicleModal
          vehicleId={selectedId}
          onClose={() => setSelectedId(null)}
          isDesktop={isDesktop}
        />
      )}
    </div>
  );
}
