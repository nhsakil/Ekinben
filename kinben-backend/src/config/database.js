import pg from 'pg';
import 'dotenv/config.js';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kinben_ecommerce'
});

// Test connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✓ PostgreSQL Database Connected Successfully');
    client.release();
  } catch (error) {
    console.error('✗ PostgreSQL Connection Error:', error.message);
    throw error;
  }
}

// Query helper for consistent interface
const query = (text, params) => {
  return pool.query(text, params);
};

export { pool, query, testConnection };
export default pool;
