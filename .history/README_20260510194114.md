# 🚀 Loomi - Plataforma de Facturación

Aplicación fullstack de facturación y gestión de cobros construida con **React + Vite** (frontend) y **Node.js + Express** (backend).

## ✨ Características

- ✅ **Dashboard interactivo** con resumen de cobros totales y facturas registradas
- ✅ **Crear facturas** con datos del cliente, descripción, monto, método de pago y fechas
- ✅ **Historial completo** de todas las facturas creadas
- ✅ **Gestión de cobros** con seguimiento de pagos
- ✅ **Perfil de usuario** personalizado
- ✅ **Planes de suscripción** disponibles
- ✅ **Interfaz responsiva** y moderna con tema oscuro
- ✅ **API REST** backend sincronizada con frontend en tiempo real
- ✅ **Comunicación frontend-backend** sin errores

## 🏗️ Arquitectura

```
Proyecto_Hackaton/
├── src/
│   ├── client/          # Frontend React + Vite
│   │   ├── pages/       # Páginas (Inicio, Crear, Cobros, Historial, Perfil, Planes)
│   │   ├── components/  # Componentes reutilizables (NavBar, Layout, InvoiceForm)
│   │   ├── App.tsx      # Router principal
│   │   └── main.tsx     # Entry point
│   ├── api/             # Backend Node.js + Express
│   │   ├── server.js    # Servidor principal (puerto 4000)
│   │   ├── package.json # Dependencias backend
│   │   └── db/          # Almacenamiento (init.sql para referencias)
│   └── shared/          # Tipos compartidos
│       └── types.ts     # Interfaz Invoice
├── package.json         # Scripts principales
└── README.md           # Este archivo
```

## 🚀 Instalación y Ejecución

### Requisitos
- **Node.js** v18+ instalado
- **npm** o **yarn**

### 1️⃣ Instalación de dependencias

```bash
# Frontend
cd src/client
npm install

# Backend
cd ../api
npm install
```

### 2️⃣ Ejecutar la aplicación (2 terminales)

**Terminal 1 - Backend (Puerto 4000):**
```bash
cd src/api
npm run dev
```
Verás: `✅ BACKEND FUNCIONANDO en http://localhost:4000`

**Terminal 2 - Frontend (Puerto 5173):**
```bash
cd src/client
npm run dev
```
Verás: `➜ Local: http://localhost:5173/`

### 3️⃣ Abrir en navegador

```
http://localhost:5173
```

## 📊 Flujo de datos

1. **Usuario** llena el formulario en `/crear`
2. **Frontend (React)** valida y envía POST a `http://localhost:4000/api/invoices`
3. **Backend (Express)** recibe y guarda en memoria (array)
4. **Frontend** consulta GET `/api/invoices` para obtener todas las facturas
5. **Datos se actualizan en tiempo real** en Dashboard, Historial, Cobros

## 🔌 API Endpoints

### GET /api/invoices
Obtiene todas las facturas registradas.

**Respuesta:**
```json
[
  {
    "id": 1,
    "cliente": "Empresa XYZ",
    "descripcion": "Diseño de sitio web",
    "oficio": "Desarrollo",
    "monto": 5000,
    "metodo": "Transferencia bancaria",
    "fechaInicio": "2026-05-11",
    "fechaVencimiento": "2026-06-11",
    "notas": ""
  }
]
```

### POST /api/invoices
Crea una nueva factura.

**Body:**
```json
{
  "cliente": "Empresa XYZ",
  "descripcion": "Diseño de sitio web",
  "oficio": "Desarrollo",
  "monto": 5000,
  "metodo": "Transferencia bancaria",
  "fechaInicio": "2026-05-11",
  "fechaVencimiento": "2026-06-11",
  "notas": ""
}
```

## 🎨 Páginas

| Página | URL | Descripción |
|--------|-----|-------------|
| Inicio | `/` | Dashboard con resumen de cobros |
| Crear | `/crear` | Formulario para crear facturas |
| Cobros | `/cobros` | Seguimiento de pagos pendientes |
| Historial | `/historial` | Lista completa de facturas |
| Perfil | `/perfil` | Información del usuario |
| Planes | `/planes` | Planes de suscripción disponibles |

## 📱 Tecnologías

**Frontend:**
- React 18
- Vite 4
- React Router 6
- TypeScript
- CSS Modules + Global Styles

**Backend:**
- Node.js
- Express 4
- CORS habilitado
- body-parser para JSON
- Almacenamiento en memoria (escalable a SQL Server)

## ✅ Testing Manual

1. Navega a `http://localhost:5173`
2. Verifica que el dashboard muestre "$0" y "0 facturas"
3. Ve a `/crear` y rellena el formulario
4. Haz clic en "Crear Factura"
5. Verás un alert de confirmación
6. Ve a `/historial` y confirma que la factura aparece
7. Vuelve a `/` y verifica que los totales se actualizaron ✅

## 🔮 Características Futuras

- [ ] Integración con SQL Server para persistencia
- [ ] Autenticación y autorización
- [ ] Temas personalizables
- [ ] Exportar facturas a PDF
- [ ] Integración de pagos (Stripe, PayPal)
- [ ] Notificaciones en tiempo real
- [ ] Análisis y reportes avanzados

## 📝 Notas

- Los datos se almacenan **en memoria** actualmente (se pierden al reiniciar)
- Para producción, migrá a una base de datos persistente (SQL Server, PostgreSQL, etc.)
- El backend corre en **Puerto 4000** y el frontend en **Puerto 5173**
- CORS está habilitado para desarrollo local

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor abre un PR con tus cambios.

## 📄 Licencia

Este proyecto es parte del Hackathon y está disponible bajo licencia MIT.

---

**Construido con ❤️ durante el Hackathon**
