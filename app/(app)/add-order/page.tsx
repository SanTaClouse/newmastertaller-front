"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Check, ChevronDown, Info } from "lucide-react";
import { useCarBrands, useCarModels } from "@/hooks/use-car-catalog";
import { useCreateWorkOrder } from "@/hooks/use-work-orders";
import { useClients, useCreateClient, Client } from "@/hooks/use-clients";

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--surface-alt)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 14,
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase",
  letterSpacing: 1, fontWeight: 600, marginBottom: 6, display: "block",
};

// Autocomplete con navegación completa por teclado
function AutocompleteInput({ value, onChange, options, placeholder, onSelect, nextRef }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  onSelect: (v: string) => void;
  nextRef?: React.RefObject<HTMLElement>;
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const filtered = value ? options.filter(o => o.toLowerCase().includes(value.toLowerCase())) : options;
  const visible = filtered.slice(0, 20);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-item]");
      items[highlighted]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  const select = useCallback((v: string) => {
    onSelect(v);
    setOpen(false);
    setHighlighted(-1);
    setTimeout(() => nextRef?.current?.focus(), 50);
  }, [onSelect, nextRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      setHighlighted(0);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(i => Math.min(i + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0 && visible[highlighted]) {
        select(visible[highlighted]);
      } else if (visible.length === 1) {
        select(visible[0]);
      } else {
        // Confirm typed value and move on
        setOpen(false);
        setTimeout(() => nextRef?.current?.focus(), 50);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlighted(-1);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); setHighlighted(0); }}
        onFocus={() => { setOpen(true); setHighlighted(0); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: 36 }}
      />
      <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
      {open && visible.length > 0 && (
        <div ref={listRef} style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, marginTop: 4, maxHeight: 220, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          {visible.map((o, i) => (
            <button
              key={o}
              data-item
              onClick={() => select(o)}
              style={{ width: "100%", padding: "10px 14px", background: highlighted === i ? "var(--accent-soft)" : "none", border: "none", textAlign: "left", cursor: "pointer", fontSize: 14, color: highlighted === i ? "var(--accent)" : "var(--text)", borderBottom: "1px solid var(--border)", fontWeight: highlighted === i ? 600 : 400 }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Buscador de cliente con nombre persistente al crear
function ClientPicker({ onSelect }: { onSelect: (id: string | null) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const createClient = useCreateClient();
  const { data } = useClients({ search: query || undefined, limit: 8 });
  const clients = data?.data || [];
  // "Crear" siempre aparece al final como opción extra
  const totalItems = clients.length + 1;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const client = await createClient.mutateAsync({ fullName: newName, phone: newPhone });
    setSelected(client);
    onSelect(client.id);
    setShowNew(false);
  };

  const openNew = () => {
    // Preserva el texto que ya escribió como nombre del cliente
    setNewName(query);
    setQuery("");
    setShowNew(true);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open && e.key === "ArrowDown") { setOpen(true); setHighlighted(0); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(i => Math.min(i + 1, totalItems - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0 && highlighted < clients.length) {
        const c = clients[highlighted];
        setSelected(c); onSelect(c.id); setOpen(false);
      } else if (highlighted === clients.length) {
        openNew();
      }
    } else if (e.key === "Escape") { setOpen(false); }
  };

  if (showNew) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          autoFocus
          placeholder="Nombre completo *"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && phoneRef.current?.focus()}
          style={inputStyle}
        />
        <input
          ref={phoneRef}
          placeholder="Teléfono *"
          value={newPhone}
          onChange={e => setNewPhone(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleCreate()}
          style={inputStyle}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleCreate} disabled={createClient.isPending || !newName.trim() || !newPhone.trim()}
            style={{ flex: 1, padding: "10px 14px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {createClient.isPending ? "..." : "Crear cliente"}
          </button>
          <button onClick={() => setShowNew(false)}
            style={{ padding: "10px 14px", background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-sec)", fontSize: 14, cursor: "pointer" }}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {selected ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{selected.fullName}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{selected.phone}</div>
          </div>
          <button onClick={() => { setSelected(null); onSelect(null); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12 }}>
            Cambiar
          </button>
        </div>
      ) : (
        <>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              placeholder="Buscar cliente o escribir nombre nuevo..."
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true); setHighlighted(0); }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>
          {open && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, marginTop: 4, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
              {clients.map((c: Client, i: number) => (
                <button key={c.id} onClick={() => { setSelected(c); onSelect(c.id); setOpen(false); }}
                  style={{ width: "100%", padding: "10px 14px", background: highlighted === i ? "var(--accent-soft)" : "none", border: "none", textAlign: "left", cursor: "pointer", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 14, fontWeight: highlighted === i ? 600 : 400, color: highlighted === i ? "var(--accent)" : "var(--text)" }}>{c.fullName}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.phone}</div>
                </button>
              ))}
              <button onClick={openNew}
                style={{ width: "100%", padding: "10px 14px", background: highlighted === clients.length ? "var(--accent-soft)" : "none", border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: highlighted === clients.length ? "var(--accent)" : "var(--accent)", fontSize: 14, fontWeight: 600 }}>
                <UserPlus size={14} /> {query ? `Crear "${query}"` : "Crear nuevo cliente"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AddOrderPage() {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);

  const [brand, setBrand] = useState("");
  const [brandId, setBrandId] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [color, setColor] = useState("");
  const [engine, setEngine] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Refs para navegación por teclado entre campos
  const modelRef = useRef<HTMLElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const plateRef = useRef<HTMLInputElement>(null);

  const { data: brands = [] } = useCarBrands();
  const { data: models = [] } = useCarModels(brandId);
  const createOrder = useCreateWorkOrder();

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const brandNames = brands.map((b: { id: string; name: string }) => b.name);
  const modelNames = models.map((m: { name: string }) => m.name);

  const handleBrandSelect = (name: string) => {
    setBrand(name);
    const found = brands.find((b: { id: string; name: string }) => b.name === name);
    setBrandId(found?.id || "");
    setModel("");
  };

  const currentYear = new Date().getFullYear();

  const handleSubmit = async () => {
    if (!brand.trim()) return;
    await createOrder.mutateAsync({
      brand,
      model: model || undefined,
      year: year ? Number(year) : undefined,
      plate: plate || undefined,
      color: color || undefined,
      description: description || undefined,
      totalPrice: totalPrice ? Number(totalPrice) : undefined,
      laborCost: laborCost ? Number(laborCost) : undefined,
      clientId: clientId || undefined,
    });
    setSubmitted(true);
    setTimeout(() => router.push("/work-orders"), 1200);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--green-soft)", border: "2px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Check size={24} style={{ color: "var(--green)" }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Orden creada</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Redirigiendo a trabajos...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: isDesktop ? "0 40px 60px" : "0 16px 100px", maxWidth: 860, margin: "0 auto" }}>
      <div style={{ padding: "28px 0 20px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Nueva orden completa</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          Podés navegar entre campos con <kbd style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 5px", fontSize: 11 }}>↑ ↓</kbd> con <kbd style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 5px", fontSize: 11 }}>Tab</kbd>y confirmar con <kbd style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 5px", fontSize: 11 }}>Enter</kbd>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 16 }}>

        {/* Vehículo */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>Vehículo</div>

          <div>
            <label style={labelStyle}>Marca *</label>
            <AutocompleteInput
              value={brand} onChange={setBrand} options={brandNames}
              placeholder="Toyota, Ford, Renault..." onSelect={handleBrandSelect}
              nextRef={modelRef as React.RefObject<HTMLElement>}
            />
          </div>

          <div>
            <label style={labelStyle}>Modelo</label>
            <AutocompleteInput
              value={model} onChange={setModel} options={modelNames}
              placeholder="Corolla, Ranger, Sandero..." onSelect={setModel}
              nextRef={yearRef as React.RefObject<HTMLElement>}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>
                Año
                {year && Number(year) > currentYear && (
                  <span style={{ color: "var(--accent)", marginLeft: 6, fontWeight: 400, textTransform: "none", fontSize: 10 }}>
                    (año modelo — OK)
                  </span>
                )}
              </label>
              <input
                ref={yearRef}
                type="number" value={year}
                onChange={e => setYear(e.target.value)}
                onKeyDown={e => e.key === "Enter" && plateRef.current?.focus()}
                placeholder={String(currentYear)}
                min={1900} max={currentYear + 2}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Patente</label>
              <input
                ref={plateRef}
                value={plate} onChange={e => setPlate(e.target.value.toUpperCase())}
                placeholder="AB123CD"
                style={{ ...inputStyle, fontFamily: "var(--font-jetbrains-mono), monospace", textTransform: "uppercase" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Color</label>
              <input value={color} onChange={e => setColor(e.target.value)} placeholder="Blanco, Negro..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Motor</label>
              <input value={engine} onChange={e => setEngine(e.target.value)} placeholder="1.6, 2.0 TDI..." style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Orden */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>Orden de trabajo</div>

          <div>
            <label style={labelStyle}>Cliente</label>
            <ClientPicker onSelect={setClientId} />
            {!clientId && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 11, color: "var(--text-muted)" }}>
                <Info size={11} /> Sin cliente asignado — se puede agregar después desde el detalle de la orden
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Lo que dice el cliente</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="¿Qué le pasa al vehículo según el cliente?"
              rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Precio total ($)</label>
              <input type="number" value={totalPrice} onChange={e => setTotalPrice(e.target.value)} placeholder="0"
                style={{ ...inputStyle, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 18, fontWeight: 700 }} />
            </div>
            <div>
              <label style={labelStyle}>Mano de obra ($)</label>
              <input type="number" value={laborCost} onChange={e => setLaborCost(e.target.value)} placeholder="0"
                style={{ ...inputStyle, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 18, fontWeight: 700 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button
          onClick={handleSubmit}
          disabled={!brand.trim() || createOrder.isPending}
          style={{ flex: 1, padding: 16, background: !brand.trim() ? "var(--border)" : "var(--accent)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: brand.trim() ? "pointer" : "not-allowed", transition: "background 0.2s" }}
        >
          {createOrder.isPending ? "Creando orden..." : "Crear orden de trabajo"}
        </button>
        <button onClick={() => router.back()}
          style={{ padding: "16px 24px", background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-sec)", fontSize: 14, cursor: "pointer" }}>
          Cancelar
        </button>
      </div>

      {!brand.trim() && (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
          La marca del vehículo es el único campo obligatorio
        </div>
      )}
    </div>
  );
}
