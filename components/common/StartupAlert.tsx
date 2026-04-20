"use client";

import { useEffect, useState } from "react";

export function StartupAlert() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("startup-alert-dismissed");
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem("startup-alert-dismissed", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-md rounded-xl border p-4 shadow-lg flex gap-3 items-start"
        style={{
          background: "#12151E",
          borderColor: "#F59E0B40",
          boxShadow: "0 0 0 1px #F59E0B20, 0 8px 32px #0005",
        }}
      >
        <span className="text-xl mt-0.5 shrink-0">⏳</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-0.5" style={{ color: "#F59E0B" }}>
            Aviso de servidor
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#8892AD" }}>
            Durante esta etapa de prueba la aplicación está alojada en un
            servidor gratuito que se duerme automáticamente cuando hay
            inactividad. Puede ser que en ocasiones demore 1–2 min en despertar.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-md p-1 transition-colors hover:bg-white/10"
          style={{ color: "#525C78" }}
          aria-label="Cerrar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4l8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
