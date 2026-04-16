@AGENTS.md

# CLAUDE.md — MiTaller Frontend

## Contexto del proyecto

Este es el **frontend Next.js** de MiTaller, un SaaS multi-tenant de gestión para talleres mecánicos.

**Archivos de referencia (en el directorio padre `../`):**
- `../mitaller-prompt.md` — Especificación completa del MVP: rutas, componentes, UX, design system.
- `../mitaller-prototype.jsx` — **Fuente de verdad visual**: paleta de colores (objeto `C`), tipografía, patrones de UI, comportamiento del formulario secuencial, estilos de estados.

## Stack
- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS + CSS custom variables para design system
- shadcn/ui para componentes base
- TanStack Query (React Query) para data fetching
- Zustand para estado global (auth, tenant)
- react-hook-form + zod para formularios
- axios con interceptor de JWT
- Deploy: Vercel

## Design System (del prototipo)
```
Colores (variables CSS en globals.css):
--bg: #0B0E14        (fondo principal)
--surface: #12151E   (cards, sidebar)
--surface-alt: #181C28
--card: #1A1F2E
--border: #242A3A
--accent: #3B82F6    (azul principal)
--green: #10B981     (nuevo/completado)
--yellow: #F59E0B    (en proceso)
--red: #EF4444       (demorado)
--orange: #F97316    (incompleto)
--text: #F0F2F8
--text-sec: #8892AD
--text-muted: #525C78
--whatsapp: #25D366

Tipografía:
- DM Sans (UI general)
- JetBrains Mono (números, precios, montos)

Estados de orden: new(verde), progress(amarillo), delayed(rojo), completed(azul), incomplete(naranja)
```

## Estructura de rutas (App Router)
```
app/
  (auth)/login/page.tsx          → login, redirige a /dashboard si ya autenticado
  (app)/
    layout.tsx                   → AuthGuard + Sidebar (desktop) / BottomNav (mobile)
    dashboard/page.tsx
    work-orders/
      page.tsx                   → lista con filtros por status
      [id]/page.tsx              → detalle (panel lateral en desktop, página en mobile)
    history/page.tsx             → historial paginado con búsqueda
    clients/
      page.tsx
      [id]/page.tsx
    vehicles/page.tsx
    stats/page.tsx
    settings/repair-phases/page.tsx
  tracking/[code]/page.tsx       → PÚBLICA, SSR, sin auth
```

## Responsive
- **Mobile (< 900px):** bottom tabs (5 items), bottom-sheets para modales
- **Desktop (≥ 900px):** sidebar 240px fijo, panel lateral derecho colapsable (stats), detalle como panel lateral

## API
- Base URL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001/api/v1`)
- JWT en header `Authorization: Bearer <token>`
- Al recibir 401 → limpiar storage + redirect a `/login`

## Variables de entorno (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Credenciales demo
- Email: `admin@newmaster.com`
- Password: `AdminPass123!`

## Componentes clave
- `CreateOrderModal` — flujo secuencial con Enter (Marca→Modelo→Año→Trabajo→Precio)
- `OrderDetail` — gastos, ganancia neta, WhatsApp, llamar, avanzar fase
- `PhaseTimeline` — timeline vertical (completada/actual/pendiente) para tracking público
- `StatCard`, `Badge` — compartidos

## Reglas UX críticas
1. Formulario de orden: solo Marca es obligatoria, Enter avanza al siguiente campo
2. WhatsApp link: `https://wa.me/{phone}?text={encoded}` — generado en frontend
3. Tracking público `/tracking/[code]`: SSR con generateMetadata para og:tags, sin login
4. Indicador de demora: >3 días warning visual, >5 días badge "Demorado"
5. Ganancia neta en rojo si negativa, verde si positiva
