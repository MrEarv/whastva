# React + Vite + Material UI Starter

Plantilla lista para usar con **React + Vite + TypeScript + Material UI**.
Incluye layout con AppBar + Drawer, rutas (React Router), tema claro/oscuro y un CRUD de ejemplo (Usuarios).

## Requisitos
- Node.js 18+ (probado con Node 20)
- npm o pnpm o yarn

## Uso
```bash
npm install
npm run dev
```

Compilar para producción:
```bash
npm run build
npm run preview
```

## Estructura
- `src/theme.tsx`: Tema MUI + toggle light/dark almacenado en localStorage.
- `src/layouts/DashboardLayout.tsx`: Layout con AppBar y Drawer (sidebar).
- `src/pages/Dashboard.tsx`: Tarjetas de ejemplo.
- `src/pages/Users.tsx`: CRUD simple con Tabla y Diálogos.
- `src/App.tsx`: Definición de rutas.

## Tips para personalizar
- Cambia colores en `createTheme` dentro de `theme.tsx`.
- Agrega nuevas páginas: crea `src/pages/Nueva.tsx` y añade una `<Route>` y un elemento en el menú.
- Conecta tu API con `fetch` o `axios` y reemplaza el `seed` en `Users.tsx` por datos reales.