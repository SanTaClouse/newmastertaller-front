"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, setAuth, initFromStorage } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.user, data.accessToken);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--card)",
    border: "1.5px solid var(--border)",
    borderRadius: 12,
    padding: "13px 16px",
    color: "var(--text)",
    fontSize: 15,
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: 32,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <Wrench size={22} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>MiTaller</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Gestión de taller</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-sec)",
                textTransform: "uppercase",
                letterSpacing: 1,
                display: "block",
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@newmaster.com"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-sec)",
                textTransform: "uppercase",
                letterSpacing: 1,
                display: "block",
                marginBottom: 6,
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {error && (
            <div
              style={{
                background: "var(--red-soft)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                color: "var(--red)",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              background: loading ? "var(--border)" : "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4,
              transition: "background 0.2s",
            }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            padding: "12px 16px",
            background: "var(--surface-alt)",
            borderRadius: 10,
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          <strong style={{ color: "var(--text-sec)" }}>Demo:</strong> admin@newmaster.com /{" "}
          AdminPass123!
        </div>
      </div>
    </div>
  );
}
