import { query, queryOne, insert, update } from '../db'

export interface Shop {
  shop_id: number
  seller_id: number
  shop_name: string
  description: string
  category: string
  address: string
  phone: string
  email: string
  logo_url?: string
  banner_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  seller_name?: string
  seller_email?: string
}

export interface CreateShopData {
  seller_id: number
  shop_name: string
  description: string
  category: string
  address: string
  phone: string
  email: string
  logo_url?: string
  banner_url?: string
}

export interface UpdateShopData {
  shop_name?: string
  description?: string
  category?: string
  address?: string
  phone?: string
  email?: string
  logo_url?: string
  banner_url?: string
  is_active?: boolean
}

export class ShopModel {
  // Create shops table if it doesn't exist
  static async createTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS shops (
        shop_id INT AUTO_INCREMENT PRIMARY KEY,
        seller_id INT NOT NULL,
        shop_name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        address VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        logo_url VARCHAR(500),
        banner_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_seller (seller_id),
        INDEX idx_category (category),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `
    
    try {
      await query(createTableSQL)
      console.log('Shops table created or already exists')
    } catch (error) {
      console.error('Error creating shops table:', error)
      throw error
    }
  }

  // Get shop by ID with seller info
  static async findById(id: number): Promise<Shop | null> {
    const sql = `
      SELECT s.*, u.first_name as seller_name, u.email as seller_email
      FROM shops s
      JOIN users u ON s.seller_id = u.user_id
      WHERE s.shop_id = ?
    `
    return await queryOne(sql, [id])
  }

  // Get shops by seller ID
  static async findBySellerId(sellerId: number): Promise<Shop[]> {
    const sql = `
      SELECT s.*, u.first_name as seller_name, u.email as seller_email
      FROM shops s
      JOIN users u ON s.seller_id = u.user_id
      WHERE s.seller_id = ?
      ORDER BY s.created_at DESC
    `
    return await query(sql, [sellerId]) as Shop[]
  }

  // Get all shops (for admin)
  static async getAll(limit: number = 50, offset: number = 0): Promise<Shop[]> {
    const sql = `
      SELECT s.*, u.first_name as seller_name, u.email as seller_email
      FROM shops s
      JOIN users u ON s.seller_id = u.user_id
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `
    return await query(sql, [limit, offset]) as Shop[]
  }

  // Get active shops for marketplace
  static async getActiveShops(limit: number = 50, offset: number = 0): Promise<Shop[]> {
    const sql = `
      SELECT s.*, u.first_name as seller_name, u.email as seller_email
      FROM shops s
      JOIN users u ON s.seller_id = u.user_id
      WHERE s.is_active = TRUE
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `
    return await query(sql, [limit, offset]) as Shop[]
  }

  // Create new shop
  static async create(shopData: CreateShopData): Promise<Shop> {
    const sql = `
      INSERT INTO shops (seller_id, shop_name, description, category, address, phone, email, logo_url, banner_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const params = [
      shopData.seller_id,
      shopData.shop_name,
      shopData.description,
      shopData.category,
      shopData.address,
      shopData.phone,
      shopData.email,
      shopData.logo_url || null,
      shopData.banner_url || null
    ]
    
    const shopId = await insert(sql, params)
    
    // Return the created shop
    const newShop = await this.findById(shopId)
    if (!newShop) {
      throw new Error('Failed to retrieve created shop')
    }
    
    return newShop
  }

  // Update shop
  static async update(id: number, shopData: UpdateShopData): Promise<boolean> {
    const fields = []
    const params = []
    
    // Build dynamic update query
    if (shopData.shop_name !== undefined) {
      fields.push('shop_name = ?')
      params.push(shopData.shop_name)
    }
    if (shopData.description !== undefined) {
      fields.push('description = ?')
      params.push(shopData.description)
    }
    if (shopData.category !== undefined) {
      fields.push('category = ?')
      params.push(shopData.category)
    }
    if (shopData.address !== undefined) {
      fields.push('address = ?')
      params.push(shopData.address)
    }
    if (shopData.phone !== undefined) {
      fields.push('phone = ?')
      params.push(shopData.phone)
    }
    if (shopData.email !== undefined) {
      fields.push('email = ?')
      params.push(shopData.email)
    }
    if (shopData.logo_url !== undefined) {
      fields.push('logo_url = ?')
      params.push(shopData.logo_url)
    }
    if (shopData.banner_url !== undefined) {
      fields.push('banner_url = ?')
      params.push(shopData.banner_url)
    }
    if (shopData.is_active !== undefined) {
      fields.push('is_active = ?')
      params.push(shopData.is_active)
    }
    
    if (fields.length === 0) {
      return false // No fields to update
    }
    
    const sql = `UPDATE shops SET ${fields.join(', ')} WHERE shop_id = ?`
    params.push(id)
    
    const affectedRows = await update(sql, params)
    return affectedRows > 0
  }

  // Delete shop
  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM shops WHERE shop_id = ?'
    const affectedRows = await update(sql, [id])
    return affectedRows > 0
  }

  // Search shops
  static async search(searchTerm: string, limit: number = 20): Promise<Shop[]> {
    const sql = `
      SELECT s.*, u.first_name as seller_name, u.email as seller_email
      FROM shops s
      JOIN users u ON s.seller_id = u.user_id
      WHERE s.is_active = TRUE AND (
        s.shop_name LIKE ? OR 
        s.description LIKE ? OR 
        s.category LIKE ? OR 
        u.first_name LIKE ? OR 
        u.last_name LIKE ?
      )
      ORDER BY s.created_at DESC
      LIMIT ?
    `
    
    const searchPattern = `%${searchTerm}%`
    return await query(sql, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, limit]) as Shop[]
  }

  // Get shops by category
  static async getByCategory(category: string, limit: number = 50): Promise<Shop[]> {
    const sql = `
      SELECT s.*, u.first_name as seller_name, u.email as seller_email
      FROM shops s
      JOIN users u ON s.seller_id = u.user_id
      WHERE s.is_active = TRUE AND s.category = ?
      ORDER BY s.created_at DESC
      LIMIT ?
    `
    return await query(sql, [category, limit]) as Shop[]
  }

  // Get shop categories
  static async getCategories(): Promise<string[]> {
    const sql = `
      SELECT DISTINCT category 
      FROM shops 
      WHERE is_active = TRUE AND category IS NOT NULL
      ORDER BY category
    `
    const result = await query(sql) as any[]
    return result.map(row => row.category)
  }

  // Get shop count
  static async getCount(activeOnly: boolean = false): Promise<number> {
    const sql = activeOnly 
      ? 'SELECT COUNT(*) as count FROM shops WHERE is_active = TRUE'
      : 'SELECT COUNT(*) as count FROM shops'
    
    const result = await query(sql) as any[]
    return result[0]?.count || 0
  }
}
