const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const invoiceRoutes = require('./routes/invoiceRoutes');
import { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Rutas principales
app.use('/api/invoices', invoiceRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('API Fin-Core Loomi funcionando');
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
