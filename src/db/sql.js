import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- Device registry helpers ---
export async function upsertDevice(deviceId, name = null, registered = 1) {
  const sql = `
    INSERT INTO devices (device_id, name, registered)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE name=VALUES(name), registered=VALUES(registered)
  `;
  await pool.execute(sql, [deviceId, name, registered]);
}

export async function isDeviceRegistered(deviceId) {
  const [rows] = await pool.execute(
    'SELECT registered FROM devices WHERE device_id=?',
    [deviceId]
  );
  return rows.length > 0 && rows[0].registered === 1;
}

export async function deleteDeviceSQL(deviceId) {
  await pool.execute('DELETE FROM devices WHERE device_id=?', [deviceId]);
}

export async function listDevices() {
  const [rows] = await pool.execute('SELECT * FROM devices ORDER BY created_at DESC');
  return rows;
}

export default pool;
