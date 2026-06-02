import mysql from 'mysql2/promise'

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dobadoba_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log('Database connected successfully')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Execute query with error handling
export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Get single record
export async function queryOne(sql: string, params?: any[]) {
  try {
    const results = await query(sql, params) as any[]
    return results.length > 0 ? results[0] : null
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Insert record and return ID
export async function insert(sql: string, params?: any[]) {
  try {
    const [result] = await pool.execute(sql, params) as any
    return result.insertId
  } catch (error) {
    console.error('Database insert error:', error)
    throw error
  }
}

// Update record
export async function update(sql: string, params?: any[]) {
  try {
    const [result] = await pool.execute(sql, params) as any
    return result.affectedRows
  } catch (error) {
    console.error('Database update error:', error)
    throw error
  }
}

// Delete record
export async function remove(sql: string, params?: any[]) {
  try {
    const [result] = await pool.execute(sql, params) as any
    return result.affectedRows
  } catch (error) {
    console.error('Database delete error:', error)
    throw error
  }
}

// Close connection pool
export async function closePool() {
  try {
    await pool.end()
    console.log('Database connection pool closed')
  } catch (error) {
    console.error('Error closing database pool:', error)
  }
}

export default pool
