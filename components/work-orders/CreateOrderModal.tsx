"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus, Check } from "lucide-react";
import { useCarBrands, useCarModels } from "@/hooks/use-car-catalog";
import { useCreateWorkOrder } from "@/hooks/use-work-orders";
import { api } from "@/lib/api";

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateOrderModal({ open, onClose }: CreateOrderModalProps) {
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState("");
  const [brandId, setBrandId] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [work, setWork] = useState("");
  const [price, setPrice] = useState("");
  const [km, setKm] = useState("");
  const [showBrands, setShowBrands] = useState(false);
  const [showModels, setShowModels] = useState(false);

  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const { data: brands = [] } = useCarBrands();
  const { data: models = [] } = useCarModels(brandId);
  const createOrder = useCreateWorkOrder();

  const filteredBrands = brand
    ? brands.filter((b) => b.name.toLowerCase().includes(brand.toLowerCase()))
    : brands;
  const filteredModels = model
    ? models.filter((m) => m.name.toLowerCase().includes(model.toLowerCase()))
    : models;

  useEffect(() => {
    if (open) {
      setStep(0); setBrand(""); setBrandId(""); setModel(""); setYear(""); setWork(""); setPrice(""); setKm("");
      setTimeout(() => refs[0].current?.focus(), 200);
    }
  }, [open]);

  const advance = (s: number) => {
    if (s < 5) {
      setStep(s + 1);
      setTimeout(() => refs[s + 1].current?.focus(), 50);
    }
  };

  const canCreate = brand.trim().length > 0;

  async function handleCreate() {
    if (!canCreate) return;
    const order = await createOrder.mutateAsync({
      brand: brand.trim(),
      model: model.trim() || undefined,
      year: year ? parseInt(year) : undefined,
      description: work.trim() || undefined,
      totalPrice: price ? parseFloat(price) : 0,
    });
    if (km && order?.vehicle?.id) {
      await api.post(`/vehicles/${order.vehicle.id}/mileage`, {
        mileage: Number(km),
        recordedAt: order.enteredAt || new Date().toISOString(),
        notes: "Al ingreso del vehículo",
      }).catch(() => {});
    }
    onClose();
  }

  const fieldStyle = (active: boolean): React.CSSProperties => ({
    width: "100%",
    background: active ? "var(--card)" : "var(--surface-alt)",
    border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
    borderRadius: 12,
    padding: "12px 16px",
    color: "var(--text)",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "all 0.2s",
  });

  const labelStyle = (active: boolean, filled: boolean): React.CSSProperties => ({
    fontSize: 12,
    fontWeight: 600,
    color: active ? "var(--accent)" : filled ? "var(--green)" : "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    display: "flex",
    alignItems: "center",
    gap: 6,
  });

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(10px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--surface)",
          borderRadius: "20px 20px 0 0",
          border: "1px solid var(--border)",
          borderBottom: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: 24 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Nueva orden</div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
            {["Marca *", "Modelo", "Año", "Trabajo", "Precio", "KM"].map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i <= step ? "var(--accent)" : "var(--border)",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Brand */}
            <div style={{ position: "relative" }}>
              <div style={labelStyle(step === 0, !!brand.trim())}>
                {brand.trim() && <Check size={12} />} Marca <span style={{ color: "var(--red)" }}>*</span>
              </div>
              <input
                ref={refs[0]}
                value={brand}
                onFocus={() => { setStep(0); setShowBrands(true); }}
                onChange={(e) => { setBrand(e.target.value); setBrandId(""); setModel(""); setShowBrands(true); }}
                onKeyDown={(e) => { if (e.key === "Enter" && brand.trim()) { setShowBrands(false); advance(0); } }}
                placeholder="Ej: Volkswagen"
                style={fieldStyle(step === 0)}
              />
              {showBrands && step === 0 && filteredBrands.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: 12, marginTop: 4, maxHeight: 160, overflowY: "auto",
                }}>
                  {filteredBrands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => { setBrand(b.name); setBrandId(b.id); setShowBrands(false); setModel(""); advance(0); }}
                      style={{
                        width: "100%", padding: "10px 16px", background: "none",
                        border: "none", borderBottom: "1px solid var(--border)",
                        color: "var(--text)", fontSize: 14, textAlign: "left", cursor: "pointer",
                      }}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model */}
            {step >= 1 && (
              <div style={{ position: "relative" }}>
                <div style={labelStyle(step === 1, !!model.trim())}>
                  {model.trim() && <Check size={12} />} Modelo
                </div>
                <input
                  ref={refs[1]}
                  value={model}
                  onFocus={() => { setStep(1); setShowModels(true); }}
                  onChange={(e) => { setModel(e.target.value); setShowModels(true); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { setShowModels(false); advance(1); } }}
                  placeholder="Ej: Gol Trend"
                  style={fieldStyle(step === 1)}
                />
                {showModels && step === 1 && filteredModels.length > 0 && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                    background: "var(--card)", border: "1px solid var(--border)",
                    borderRadius: 12, marginTop: 4, maxHeight: 160, overflowY: "auto",
                  }}>
                    {filteredModels.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setModel(m.name); setShowModels(false); advance(1); }}
                        style={{
                          width: "100%", padding: "10px 16px", background: "none",
                          border: "none", borderBottom: "1px solid var(--border)",
                          color: "var(--text)", fontSize: 14, textAlign: "left", cursor: "pointer",
                        }}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Year */}
            {step >= 2 && (
              <div>
                <div style={labelStyle(step === 2, !!year.trim())}>
                  {year.trim() && <Check size={12} />} Año
                </div>
                <input
                  ref={refs[2]}
                  value={year}
                  onFocus={() => setStep(2)}
                  onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  onKeyDown={(e) => { if (e.key === "Enter") advance(2); }}
                  placeholder="Ej: 2020"
                  inputMode="numeric"
                  style={fieldStyle(step === 2)}
                />
              </div>
            )}

            {/* Work */}
            {step >= 3 && (
              <div>
                <div style={labelStyle(step === 3, !!work.trim())}>
                  {work.trim() && <Check size={12} />} Trabajo{" "}
                  <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none" }}>(opcional)</span>
                </div>
                <input
                  ref={refs[3]}
                  value={work}
                  onFocus={() => setStep(3)}
                  onChange={(e) => setWork(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") advance(3); }}
                  placeholder="Ej: Cambio de aceite"
                  style={fieldStyle(step === 3)}
                />
              </div>
            )}

            {/* Price */}
            {step >= 4 && (
              <div>
                <div style={labelStyle(step === 4, !!price.trim())}>
                  {price.trim() && <Check size={12} />} Precio{" "}
                  <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none" }}>(opcional)</span>
                </div>
                <input
                  ref={refs[4]}
                  value={price}
                  onFocus={() => setStep(4)}
                  onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => { if (e.key === "Enter") advance(4); }}
                  placeholder="Ej: 50000"
                  inputMode="numeric"
                  style={{ ...fieldStyle(step === 4), fontFamily: "var(--font-jetbrains-mono), monospace" }}
                />
              </div>
            )}

            {/* KM */}
            {step >= 5 && (
              <div>
                <div style={labelStyle(step === 5, !!km.trim())}>
                  {km.trim() && <Check size={12} />} Kilometraje{" "}
                  <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none" }}>(opcional)</span>
                </div>
                <input
                  ref={refs[5]}
                  value={km}
                  onFocus={() => setStep(5)}
                  onChange={(e) => setKm(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                  placeholder="Ej: 85000"
                  inputMode="numeric"
                  style={{ ...fieldStyle(step === 5), fontFamily: "var(--font-jetbrains-mono), monospace" }}
                />
              </div>
            )}
          </div>

          <button
            disabled={!canCreate || createOrder.isPending}
            onClick={handleCreate}
            style={{
              width: "100%", marginTop: 24, padding: 16,
              background: canCreate ? "var(--accent)" : "var(--border)",
              color: canCreate ? "#fff" : "var(--text-muted)",
              border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700,
              cursor: canCreate ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: canCreate ? 1 : 0.5,
            }}
          >
            <Plus size={18} />
            {createOrder.isPending ? "Creando..." : `Crear orden${!canCreate ? " — ingresá la marca" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
