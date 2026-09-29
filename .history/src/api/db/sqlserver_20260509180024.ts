import sql from 'mssql';

const config = {
  server: 'SEIKO\\SQLEXPRESS',
  database: 'LoomiFinCore',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
    encrypt: true,
  },
  authentication: {
    type: 'default',
  },
};

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Conectado a SQL Server');
    return pool;
  })
  .catch(err => console.log('Error de conexión SQL Server', err));

export default sql;
