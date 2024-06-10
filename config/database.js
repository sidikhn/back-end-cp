require('dotenv').config();
const { createPool } = require('mysql');

const pool = createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: 'localhost',
  port: process.env.DB_PORT,
  connectionLimit: 10,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Database connected successfully.');
  connection.release();
});

module.exports = pool;
