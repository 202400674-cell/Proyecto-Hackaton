# Loomi — FinCore

## Estructura

- `src/api/` — Backend Express + SQL Server
- `src/client/` — Frontend React + Vite
- `src/shared/` — Tipos compartidos

## Scripts

### Backend
1. Instala dependencias:
   ```bash
   cd src/api
   npm install
   ```
2. Inicia el backend:
   ```bash
   npm run dev
   ```

### Frontend
1. Instala dependencias:
   ```bash
   cd src/client
   npm install
   ```
2. Inicia el frontend:
   ```bash
   npm run dev
   ```

### Base de datos
- Ejecuta el script `src/api/db/init.sql` en SQL Server Management Studio para crear la base y tabla.

## Notas
- El frontend se conecta automáticamente al backend en `/api` vía proxy Vite.
- Todo es responsive y preparado para escritorio y móvil.
