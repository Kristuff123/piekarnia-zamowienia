// Service layer for MS SQL (ERP). In this prototype it returns in-memory mock data.
// To connect to a real MS SQL server, set MSSQL_* env vars and replace the
// mock returns below with queries using the `mssql` package.
const mssql = require("mssql");

const config = {
  server: process.env.MSSQL_SERVER || "localhost",
  port: Number(process.env.MSSQL_PORT || 1433),
  database: process.env.MSSQL_DATABASE || "ERP",
  user: process.env.MSSQL_USER || "sa",
  password: process.env.MSSQL_PASSWORD || "",
  options: { encrypt: false, trustServerCertificate: true },
};

async function query(sql) {
  if (!process.env.MSSQL_SERVER) return null; // mock mode
  const pool = await mssql.connect(config);
  const result = await pool.request().query(sql);
  return result.recordset;
}

module.exports = { config, query, mssql };
