const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Base de datos simulada en memoria
let invoices = [];
let idCounter = 1;

// Obtener todas las facturas
app.get('/api/invoices', (req, res) => {
  res.json(invoices);
});

// Crear nueva factura
app.post('/api/invoices', (req, res) => {
  const { cliente, descripcion, oficio, monto, metodo, fecha, vencimiento } = req.body;
  const newInvoice = {
    id: idCounter++,
    cliente,
    descripcion,
    oficio,
    monto: parseFloat(monto),
    metodo,
    fecha,
    vencimiento
  };
  invoices.push(newInvoice);
  res.json({ ok: true, id: newInvoice.id });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API Fin-Core Loomi funcionando correctamente en http://localhost:4000' });
});

app.listen(PORT, () => {
  console.log(`\n✅ BACKEND FUNCIONANDO en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api/invoices\n`);
});
