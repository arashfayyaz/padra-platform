const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'padra',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

const normalizeSql = (sql) => {
  return sql
    .replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT IGNORE INTO')
    .replace(/INSERT\s+OR\s+REPLACE\s+INTO/gi, 'REPLACE INTO')
    .replace(/\bCURRENT_TIMESTAMP\b/gi, 'CURRENT_TIMESTAMP');
};

const run = async (sql, params = []) => {
  const [result] = await pool.execute(normalizeSql(sql), params);
  return {
    id: result.insertId,
    lastID: result.insertId,
    changes: result.affectedRows
  };
};

const get = async (sql, params = []) => {
  const [rows] = await pool.execute(normalizeSql(sql), params);
  return rows[0];
};

const all = async (sql, params = []) => {
  const [rows] = await pool.execute(normalizeSql(sql), params);
  return rows;
};

const init = async () => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.query('SET NAMES utf8mb4');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('MariaDB connection successful.');

    /*
     * Schema creation will be added in the next migration step.
     */

    console.log('Database connection initialized successfully.');
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  pool,
  init,
  run,
  get,
  all
};
