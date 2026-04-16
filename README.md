# MiTaller — Frontend

Frontend de **MiTaller**, un SaaS multi-tenant de gestión para talleres mecánicos. Construido con Next.js 14, Tailwind CSS y shadcn/ui.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + design system custom (variables CSS)
- **shadcn/ui** para componentes base
- **TanStack Query** para data fetching
- **Zustand** para estado de auth
- **axios** con interceptor JWT
- **Deploy**: Vercel

## Setup local

### Requisitos
- Node 20+
- Backend corriendo en `http://localhost:3001`

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp .env.local.example .env.local

# 3. Iniciar servidor de desarrollo
npm run dev
# → http://localhost:3000
```

## Credenciales demo

| Campo    | Valor               |
|----------|---------------------|
| Email    | admin@newmaster.com |
| Password | AdminPass123!       |

## Estructura de rutas

```
app/
  (auth)/login/          → Login
  (app)/
    dashboard/           → Dashboard con stats semanales
    work-orders/         → Lista de órdenes con filtros
    history/             → Historial paginado con búsqueda
    clients/             → Lista de clientes
    vehicles/            → Lista de vehículos
    stats/               → Estadísticas semanales y mensuales
    settings/
      repair-phases/     → Configurar fases de reparación
  tracking/[code]/       → Vista pública de tracking (sin auth)
```

## Design System

Colores, tipografía y patrones definidos en:
- `app/globals.css` — variables CSS
- `../mitaller-prototype.jsx` — referencia visual completa

Tipografía: **DM Sans** (UI) + **JetBrains Mono** (números/precios)

## Deploy en Vercel

1. Conectar repo de GitHub
2. Variables de entorno:
   - `NEXT_PUBLIC_API_URL` → URL del backend en Render
   - `NEXT_PUBLIC_APP_URL` → URL de Vercel (para links de tracking)
3. Auto-deploy desde `main`
