"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Settings } from "lucide-react";
import { useRepairPhases, useCreatePhase, useDeletePhase, useUpdatePhase } from "@/hooks/use-repair-phases";

export default function RepairPhasesPage() {
  const { data: phases = [], isLoading } = useRepairPhases();
  const createPhase = useCreatePhase();
  const deletePhase = useDeletePhase();

  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!newName.trim()) return;
    await createPhase.mutateAsync({
      name: newName.trim(),
      orderIndex: (phases[phases.length - 1]?.orderIndex || 0) + 1,
    });
    setNewName("");
    setAdding(false);
  }

  return (
    <div style={{ padding: "24px 20px", maxWidth: 600 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Settings size={22} style={{ color: "var(--accent)" }} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Fases de reparación</div>
          <div style={{ fontSize: 13, color: "var(--text-sec)" }}>Configura el flujo de tu taller</div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>Cargando...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {phases.map((phase, idx) => (
            <div
              key={phase.id}
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 12,
              }}
            >
              <GripVertical size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <div
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "var(--accent-soft)", color: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}
              >
                {phase.orderIndex}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{phase.name}</div>
                {phase.isDefault && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Predeterminada</div>
                )}
              </div>
              <button
                onClick={() => deletePhase.mutate(phase.id)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          {/* Add new */}
          {adding ? (
            <div style={{ background: "var(--surface)", border: "1px solid var(--accent)", borderRadius: 12, padding: 16 }}>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
                placeholder="Nombre de la fase..."
                style={{
                  width: "100%", background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 14,
                  outline: "none", boxSizing: "border-box", marginBottom: 10,
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim() || createPhase.isPending}
                  style={{
                    padding: "8px 16px", background: "var(--accent)", color: "#fff",
                    border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Guardar
                </button>
                <button
                  onClick={() => { setAdding(false); setNewName(""); }}
                  style={{
                    padding: "8px 16px", background: "transparent", color: "var(--text-muted)",
                    border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 16px", background: "transparent",
                border: "1px dashed var(--border-light)", borderRadius: 12,
                color: "var(--text-muted)", fontSize: 14, cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Plus size={16} /> Agregar fase
            </button>
          )}
        </div>
      )}
    </div>
  );
}
