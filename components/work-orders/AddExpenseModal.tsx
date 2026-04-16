"use client";

import { useState, useEffect, useRef } from "react";
import { X, Package } from "lucide-react";
import { useAddExpense } from "@/hooks/use-work-orders";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  workOrderId: string;
}

export function AddExpenseModal({ open, onClose, workOrderId }: AddExpenseModalProps) {
  const [desc, setDesc] = useState("");
  const [cost, setCost] = useState("");
  const descRef = useRef<HTMLInputElement>(null);
  const addExpense = useAddExpense(workOrderId);

  useEffect(() => {
    if (open) {
      setDesc(""); setCost("");
      setTimeout(() => descRef.current?.focus(), 200);
    }
  }, [open]);

  const canAdd = desc.trim() && cost.trim();

  async function handleAdd() {
    if (!canAdd) return;
    await addExpense.mutateAsync({ description: desc.trim(), cost: parseFloat(cost) });
    onClose();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--card)",
    border: "1px solid var(--border)", borderRadius: 12,
    padding: "12px 16px", color: "var(--text)", fontSize: 14,
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(10px)", zIndex: 1100,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: 520, background: "var(--surface)",
          borderRadius: "20px 20px 0 0", border: "1px solid var(--border)", borderBottom: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
              <Package size={18} /> Agregar gasto / repuesto
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-sec)", fontWeight: 600, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
                Descripción
              </label>
              <input
                ref={descRef}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") document.getElementById("exp-cost")?.focus(); }}
                placeholder="Ej: Filtro de aceite Mann"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-sec)", fontWeight: 600, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
                Costo
              </label>
              <input
                id="exp-cost"
                value={cost}
                onChange={(e) => setCost(e.target.value.replace(/\D/g, ""))}
                placeholder="Ej: 3200"
                inputMode="numeric"
                style={{ ...inputStyle, fontFamily: "var(--font-jetbrains-mono), monospace" }}
              />
            </div>
          </div>

          <button
            disabled={!canAdd || addExpense.isPending}
            onClick={handleAdd}
            style={{
              width: "100%", marginTop: 20, padding: 14,
              background: canAdd ? "var(--accent)" : "var(--border)",
              color: canAdd ? "#fff" : "var(--text-muted)",
              border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: canAdd ? "pointer" : "not-allowed", opacity: canAdd ? 1 : 0.5,
            }}
          >
            {addExpense.isPending ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
