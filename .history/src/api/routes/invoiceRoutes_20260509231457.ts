const express = require('express');
const sql = require('../db/sqlserver');
const poolPromise = sql.poolPromise;

const router = express.Router();

// Obtener todas las facturas
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Invoices');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener facturas', details: err });
  }
});

// Crear nueva factura
router.post('/', async (req, res) => {
  const { cliente, descripcion, oficio, monto, metodo, fecha, vencimiento } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('cliente', sql.NVarChar, cliente)
      .input('descripcion', sql.NVarChar, descripcion)
      .input('oficio', sql.NVarChar, oficio)
      .input('monto', sql.Decimal(18,2), monto)
      .input('metodo', sql.NVarChar, metodo)
      .input('fecha', sql.Date, fecha)
      .input('vencimiento', sql.Date, vencimiento)
      .query('INSERT INTO Invoices (cliente, descripcion, oficio, monto, metodo, fecha, vencimiento) VALUES (@cliente, @descripcion, @oficio, @monto, @metodo, @fecha, @vencimiento)');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear factura', details: err });
  }
});

module.exports = router;
