import { query, queryOne, insert, update, remove } from '../db'
import bcrypt from 'bcryptjs'

export interface User {
  user_id: number
  username: string
  email: string
  password_hash: string
  role: 'customer' | 'seller' | 'courier' | 'admin' | 'operator'
  first_name: string
  last_name: string
  phone?: string
  profile_image?: string
  is_active: boolean
  email_verified?: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface CreateUserData {
  username: string
  email: string
  password: string
  role: 'customer' | 'seller' | 'courier' | 'admin' | 'operator'
  first_name: string
  last_name: string
  phone?: string
  profile_image?: string
}

export interface UpdateUserData {
  username?: string
  email?: string
  role?: 'customer' | 'seller' | 'courier' | 'admin' | 'operator'
  first_name?: string
  last_name?: string
  phone?: string
  profile_image?: string
  email_verified?: boolean
}

export class UserModel {
  // Create users table if it doesn't exist
  static async createTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('customer', 'seller', 'courier', 'admin', 'operator') DEFAULT 'customer',
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        profile_image VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_username (username),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `
    
    try {
      await query(createTableSQL)
      console.log('Users table created or already exists')
    } catch (error) {
      console.error('Error creating users table:', error)
      throw error
    }
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = ?'
    return await queryOne(sql, [email])
  }

  // Find user by username
  static async findByUsername(username: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE username = ?'
    return await queryOne(sql, [username])
  }

  // Find user by ID
  static async findById(id: number): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE user_id = ?'
    const user = await queryOne(sql, [id])
    
    // Remove password_hash from returned user
    if (user) {
      delete user.password_hash
    }
    
    return user
  }

  // Create new user
  static async create(userData: CreateUserData): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const sql = `
      INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone, profile_image, email_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const params = [
      userData.username,
      userData.email,
      hashedPassword,
      userData.role || 'customer',
      userData.first_name,
      userData.last_name,
      userData.phone || null,
      userData.profile_image || null,
      false // email_verified defaults to false
    ]
    
    const userId = await insert(sql, params)
    
    // Return the created user without password_hash
    const newUser = await this.findById(userId)
    if (!newUser) {
      throw new Error('Failed to retrieve created user')
    }
    
    return newUser
  }

  // Verify user password
  static async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email)
    
    if (!user) {
      return null
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    
    if (!isValidPassword) {
      return null
    }
    
    // Remove password_hash from returned user
    delete user.password_hash
    
    // Update last login
    await this.updateLastLogin(user.user_id)
    
    return user
  }

  // Update user
  static async update(id: number, userData: UpdateUserData): Promise<boolean> {
    const fields = []
    const params = []
    
    // Build dynamic update query
    if (userData.username !== undefined) {
      fields.push('username = ?')
      params.push(userData.username)
    }
    if (userData.email !== undefined) {
      fields.push('email = ?')
      params.push(userData.email)
    }
    if (userData.role !== undefined) {
      fields.push('role = ?')
      params.push(userData.role)
    }
    if (userData.first_name !== undefined) {
      fields.push('first_name = ?')
      params.push(userData.first_name)
    }
    if (userData.last_name !== undefined) {
      fields.push('last_name = ?')
      params.push(userData.last_name)
    }
    if (userData.phone !== undefined) {
      fields.push('phone = ?')
      params.push(userData.phone)
    }
    if (userData.profile_image !== undefined) {
      fields.push('profile_image = ?')
      params.push(userData.profile_image)
    }
    if (userData.email_verified !== undefined) {
      fields.push('email_verified = ?')
      params.push(userData.email_verified)
    }
    
    if (fields.length === 0) {
      return false // No fields to update
    }
    
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`
    params.push(id)
    
    const affectedRows = await update(sql, params)
    return affectedRows > 0
  }

  // Update last login
  static async updateLastLogin(id: number): Promise<void> {
    const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?'
    await update(sql, [id])
  }

  // Verify user email
  static async verifyEmail(email: string): Promise<boolean> {
    const sql = 'UPDATE users SET email_verified = TRUE WHERE email = ?'
    const affectedRows = await update(sql, [email])
    return affectedRows > 0
  }

  // Get all users (for admin)
  static async getAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    const sql = `
      SELECT user_id, username, email, role, first_name, last_name, phone, 
             profile_image, is_active, email_verified, created_at, updated_at, last_login
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `
    
    const users = await query(sql, [limit, offset]) as User[]
    return users
  }

  // Get users by role
  static async getByRole(role: string, limit: number = 50, offset: number = 0): Promise<User[]> {
    const sql = `
      SELECT user_id, username, email, role, first_name, last_name, phone, 
             profile_image, email_verified, created_at, updated_at, last_login
      FROM users 
      WHERE role = ?
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `
    
    const users = await query(sql, [role, limit, offset]) as User[]
    return users
  }

  // Delete user
  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM users WHERE user_id = ?'
    const affectedRows = await remove(sql, [id])
    return affectedRows > 0
  }

  // Search users
  static async search(searchTerm: string, limit: number = 20): Promise<User[]> {
    const sql = `
      SELECT user_id, username, email, role, first_name, last_name, phone, 
             profile_image, email_verified, created_at, updated_at, last_login
      FROM users 
      WHERE username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?
      ORDER BY created_at DESC 
      LIMIT ?
    `
    
    const searchPattern = `%${searchTerm}%`
    const users = await query(sql, [searchPattern, searchPattern, searchPattern, searchPattern, limit]) as User[]
    return users
  }
}
