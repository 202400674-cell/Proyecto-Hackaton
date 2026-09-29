const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Rutas principales
app.use('/api/invoices', invoiceRoutes);

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
app.get('/', function (req, res) {
  res.send('API Fin-Core Loomi funcionando');
});

app.listen(PORT, function () {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
