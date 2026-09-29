const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql/msnodesqlv8');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

const masterConfig = {
  connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=SEIKO\\SQLEXPRESS;Database=master;Trusted_Connection=yes;TrustServerCertificate=yes;',
  driver: 'msnodesqlv8',
};

const dbConfig = {
  connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=SEIKO\\SQLEXPRESS;Database=loomi;Trusted_Connection=yes;TrustServerCertificate=yes;',
  driver: 'msnodesqlv8',
};

let pool;

async function initDb() {
  // 1. Connect to master and create loomi database if it doesn't exist
  const masterPool = await sql.connect(masterConfig);
  await masterPool.request().query(`
    IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'loomi')
      CREATE DATABASE loomi;
  `);
  await masterPool.close();

  // 2. Connect to loomi and create tables
  pool = await sql.connect(dbConfig);
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='clients' AND xtype='U')
      CREATE TABLE clients (
        id          NVARCHAR(50)  PRIMARY KEY,
        name        NVARCHAR(200) NOT NULL,
        phone       NVARCHAR(50),
        email       NVARCHAR(200),
        note        NVARCHAR(500),
        count       INT DEFAULT 0,
        created_at  DATETIME DEFAULT GETDATE()
      );
  `);
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='invoices' AND xtype='U')
      CREATE TABLE invoices (
        id        NVARCHAR(50)    PRIMARY KEY,
        concept   NVARCHAR(500),
        type      NVARCHAR(100),
        method    NVARCHAR(100),
        amount    DECIMAL(10,2),
        date      NVARCHAR(20),
        receptor  NVARCHAR(200),
        phone     NVARCHAR(50),
        note      NVARCHAR(1000),
        status    NVARCHAR(50),
        block     INT,
        ts        BIGINT,
        hash      NVARCHAR(100),
        quick     BIT,
        created_at DATETIME DEFAULT GETDATE()
      );
  `);

  console.log('✅ Base de datos "loomi" lista — tablas creadas/verificadas.');
}

// ── Invoices ──────────────────────────────────────────────────────────────────

app.get('/api/invoices', async (req, res) => {
  try {
    const result = await pool.request().query(
      'SELECT * FROM invoices ORDER BY created_at DESC'
    );
    const rows = result.recordset.map(r => ({
      ...r,
      amount: parseFloat(r.amount),
      quick: !!r.quick,
      block: r.block ?? undefined,
      ts: r.ts ? Number(r.ts) : undefined,
      hash: r.hash ?? undefined,
    }));
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  const { id, concept, type, method, amount, date, receptor, phone, note, status, block, ts, hash, quick } = req.body;
  try {
    await pool.request()
      .input('id',       sql.NVarChar(50),   id)
      .input('concept',  sql.NVarChar(500),  concept)
      .input('type',     sql.NVarChar(100),  type)
      .input('method',   sql.NVarChar(100),  method)
      .input('amount',   sql.Decimal(10,2),  amount)
      .input('date',     sql.NVarChar(20),   date)
      .input('receptor', sql.NVarChar(200),  receptor)
      .input('phone',    sql.NVarChar(50),   phone ?? '')
      .input('note',     sql.NVarChar(1000), note ?? '')
      .input('status',   sql.NVarChar(50),   status)
      .input('block',    sql.Int,            block ?? null)
      .input('ts',       sql.BigInt,         ts ?? null)
      .input('hash',     sql.NVarChar(100),  hash ?? null)
      .input('quick',    sql.Bit,            quick ? 1 : 0)
      .query(`
        INSERT INTO invoices (id, concept, type, method, amount, date, receptor, phone, note, status, block, ts, hash, quick)
        VALUES (@id, @concept, @type, @method, @amount, @date, @receptor, @phone, @note, @status, @block, @ts, @hash, @quick)
      `);
    res.json({ ok: true, id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ── Clients ───────────────────────────────────────────────────────────────────

app.get('/api/clients', async (req, res) => {
  try {
    const result = await pool.request().query(
      'SELECT * FROM clients ORDER BY created_at DESC'
    );
    const rows = result.recordset.map(r => ({ ...r, count: r.count ?? 0 }));
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/clients', async (req, res) => {
  const { id, name, phone, email, note } = req.body;
  try {
    await pool.request()
      .input('id',    sql.NVarChar(50),  id)
      .input('name',  sql.NVarChar(200), name)
      .input('phone', sql.NVarChar(50),  phone ?? '')
      .input('email', sql.NVarChar(200), email ?? '')
      .input('note',  sql.NVarChar(500), note ?? '')
      .query(`
        INSERT INTO clients (id, name, phone, email, note)
        VALUES (@id, @name, @phone, @email, @note)
      `);
    res.json({ ok: true, id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/clients/:id/count', async (req, res) => {
  try {
    await pool.request()
      .input('id', sql.NVarChar(50), req.params.id)
      .query('UPDATE clients SET count = count + 1 WHERE id = @id');
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/clients/:id', async (req, res) => {
  const { name, phone, email, note } = req.body;
  try {
    await pool.request()
      .input('id',    sql.NVarChar(50),  req.params.id)
      .input('name',  sql.NVarChar(200), name)
      .input('phone', sql.NVarChar(50),  phone ?? '')
      .input('email', sql.NVarChar(200), email ?? '')
      .input('note',  sql.NVarChar(500), note ?? '')
      .query('UPDATE clients SET name=@name, phone=@phone, email=@email, note=@note WHERE id=@id');
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/invoices/:id/confirm', async (req, res) => {
  const { block, hash, ts } = req.body;
  try {
    await pool.request()
      .input('id',    sql.NVarChar(50),  req.params.id)
      .input('block', sql.Int,           block)
      .input('hash',  sql.NVarChar(100), hash)
      .input('ts',    sql.BigInt,        ts)
      .query("UPDATE invoices SET status='confirmed', block=@block, hash=@hash, ts=@ts WHERE id=@id AND status='pending'");
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    await pool.request()
      .input('id', sql.NVarChar(50), req.params.id)
      .query("DELETE FROM invoices WHERE id=@id AND status='pending'");
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ── Healthcheck ───────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({ message: 'API Loomi + FinCore funcionando en http://localhost:4000' });
});

// ── Boot ──────────────────────────────────────────────────────────────────────

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n✅ BACKEND funcionando en http://localhost:${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api/invoices\n`);
    });
  })
  .catch(err => {
    console.error('❌ Error al inicializar la base de datos:', err.message);
    process.exit(1);
  });
