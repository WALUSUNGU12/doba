import { query, queryOne, insert, update } from '../db'

export interface Product {
  product_id: number
  shop_id: number
  product_name: string
  description: string
  price: number
  category: string
  stock_quantity: number
  min_stock_level: number
  image_urls: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  shop_name?: string
  seller_name?: string
}

export interface CreateProductData {
  shop_id: number
  product_name: string
  description: string
  price: number
  category: string
  stock_quantity: number
  min_stock_level?: number
  image_urls?: string[]
}

export interface UpdateProductData {
  product_name?: string
  description?: string
  price?: number
  category?: string
  stock_quantity?: number
  min_stock_level?: number
  image_urls?: string[]
  is_active?: boolean
}

export class ProductModel {
  // Create products table if it doesn't exist
  static async createTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS products (
        product_id INT AUTO_INCREMENT PRIMARY KEY,
        shop_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        stock_quantity INT DEFAULT 0,
        min_stock_level INT DEFAULT 5,
        image_urls JSON,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE,
        INDEX idx_shop (shop_id),
        INDEX idx_category (category),
        INDEX idx_active (is_active),
        INDEX idx_price (price),
        INDEX idx_stock (stock_quantity)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `
    
    try {
      await query(createTableSQL)
      console.log('Products table created or already exists')
    } catch (error) {
      console.error('Error creating products table:', error)
      throw error
    }
  }

  // Get product by ID with shop info
  static async findById(id: number): Promise<Product | null> {
    const sql = `
      SELECT p.*, s.shop_name, u.first_name as seller_name
      FROM products p
      JOIN shops s ON p.shop_id = s.shop_id
      JOIN users u ON s.seller_id = u.user_id
      WHERE p.product_id = ?
    `
    const result = await queryOne(sql, [id]) as any
    if (result && result.image_urls) {
      result.image_urls = JSON.parse(result.image_urls)
    }
    return result
  }

  // Get products by shop ID
  static async findByShopId(shopId: number, activeOnly: boolean = true): Promise<Product[]> {
    const sql = `
      SELECT p.*, s.shop_name, u.first_name as seller_name
      FROM products p
      JOIN shops s ON p.shop_id = s.shop_id
      JOIN users u ON s.seller_id = u.user_id
      WHERE p.shop_id = ? ${activeOnly ? 'AND p.is_active = TRUE' : ''}
      ORDER BY p.created_at DESC
    `
    const results = await query(sql, [shopId]) as any[]
    return results.map(product => {
      if (product.image_urls) {
        product.image_urls = JSON.parse(product.image_urls)
      }
      return product
    })
  }

  // Get all products (for admin)
  static async getAll(limit: number = 50, offset: number = 0): Promise<Product[]> {
    const sql = `
      SELECT p.*, s.shop_name, u.first_name as seller_name
      FROM products p
      JOIN shops s ON p.shop_id = s.shop_id
      JOIN users u ON s.seller_id = u.user_id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `
    const results = await query(sql, [limit, offset]) as any[]
    return results.map(product => {
      if (product.image_urls) {
        product.image_urls = JSON.parse(product.image_urls)
      }
      return product
    })
  }

  // Get active products for marketplace
  static async getActiveProducts(limit: number = 50, offset: number = 0): Promise<Product[]> {
    const sql = `
      SELECT p.*, s.shop_name, u.first_name as seller_name
      FROM products p
      JOIN shops s ON p.shop_id = s.shop_id
      JOIN users u ON s.seller_id = u.user_id
      WHERE p.is_active = TRUE AND s.is_active = TRUE AND p.stock_quantity > 0
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `
    const results = await query(sql, [limit, offset]) as any[]
    return results.map(product => {
      if (product.image_urls) {
        product.image_urls = JSON.parse(product.image_urls)
      }
      return product
    })
  }

  // Create new product
  static async create(productData: CreateProductData): Promise<Product> {
    const sql = `
      INSERT INTO products (shop_id, product_name, description, price, category, stock_quantity, min_stock_level, image_urls)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const params = [
      productData.shop_id,
      productData.product_name,
      productData.description,
      productData.price,
      productData.category,
      productData.stock_quantity,
      productData.min_stock_level || 5,
      productData.image_urls ? JSON.stringify(productData.image_urls) : null
    ]
    
    const productId = await insert(sql, params)
    
    // Return the created product
    const newProduct = await this.findById(productId)
    if (!newProduct) {
      throw new Error('Failed to retrieve created product')
    }
    
    return newProduct
  }

  // Update product
  static async update(id: number, productData: UpdateProductData): Promise<boolean> {
    const fields = []
    const params = []
    
    // Build dynamic update query
    if (productData.product_name !== undefined) {
      fields.push('product_name = ?')
      params.push(productData.product_name)
    }
    if (productData.description !== undefined) {
      fields.push('description = ?')
      params.push(productData.description)
    }
    if (productData.price !== undefined) {
      fields.push('price = ?')
      params.push(productData.price)
    }
    if (productData.category !== undefined) {
      fields.push('category = ?')
      params.push(productData.category)
    }
    if (productData.stock_quantity !== undefined) {
      fields.push('stock_quantity = ?')
      params.push(productData.stock_quantity)
    }
    if (productData.min_stock_level !== undefined) {
      fields.push('min_stock_level = ?')
      params.push(productData.min_stock_level)
    }
    if (productData.image_urls !== undefined) {
      fields.push('image_urls = ?')
      params.push(JSON.stringify(productData.image_urls))
    }
    if (productData.is_active !== undefined) {
      fields.push('is_active = ?')
      params.push(productData.is_active)
    }
    
    if (fields.length === 0) {
      return false // No fields to update
    }
    
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`
    params.push(id)
    
    const affectedRows = await update(sql, params)
    return affectedRows > 0
  }

  // Update stock quantity
  static async updateStock(id: number, quantity: number): Promise<boolean> {
    const sql = 'UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?'
    const affectedRows = await update(sql, [quantity, id])
    return affectedRows > 0
  }

  // Decrease stock (for orders)
  static async decreaseStock(id: number, quantity: number): Promise<boolean> {
    const sql = 'UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ? AND stock_quantity >= ?'
    const affectedRows = await update(sql, [quantity, id, quantity])
    return affectedRows > 0
  }

  // Delete product
  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM products WHERE product_id = ?'
    const affectedRows = await update(sql, [id])
    return affectedRows > 0
  }

  // Search products
  static async search(searchTerm: string, limit: number = 20): Promise<Product[]> {
    const sql = `
      SELECT p.*, s.shop_name, u.first_name as seller_name
      FROM products p
      JOIN shops s ON p.shop_id = s.shop_id
      JOIN users u ON s.seller_id = u.user_id
      WHERE p.is_active = TRUE AND s.is_active = TRUE AND (
        p.product_name LIKE ? OR 
        p.description LIKE ? OR 
        p.category LIKE ? OR 
        s.shop_name LIKE ?
      )
      ORDER BY p.created_at DESC
      LIMIT ?
    `
    
    const searchPattern = `%${searchTerm}%`
    const results = await query(sql, [searchPattern, searchPattern, searchPattern, searchPattern, limit]) as any[]
    return results.map(product => {
      if (product.image_urls) {
        product.image_urls = JSON.parse(product.image_urls)
      }
      return product
    })
  }

  // Get products by category
  static async getByCategory(category: string, limit: number = 50): Promise<Product[]> {
    const sql = `
      SELECT p.*, s.shop_name, u.first_name as seller_name
      FROM products p
      JOIN shops s ON p.shop_id = s.shop_id
      JOIN users u ON s.seller_id = u.user_id
      WHERE p.is_active = TRUE AND s.is_active = TRUE AND p.category = ?
      ORDER BY p.created_at DESC
      LIMIT ?
    `
    const results = await query(sql, [category, limit]) as any[]
    return results.map(product => {
      if (product.image_urls) {
        product.image_urls = JSON.parse(product.image_urls)
      }
      return product
    })
  }

  // Get product categories
  static async getCategories(): Promise<string[]> {
    const sql = `
      SELECT DISTINCT category 
      FROM products 
      WHERE is_active = TRUE AND category IS NOT NULL
      ORDER BY category
    `
    const result = await query(sql) as any[]
    return result.map(row => row.category)
  }

  // Get low stock products (for sellers)
  static async getLowStockProducts(shopId: number): Promise<Product[]> {
    const sql = `
      SELECT p.*, s.shop_name, u.first_name as seller_name
      FROM products p
      JOIN shops s ON p.shop_id = s.shop_id
      JOIN users u ON s.seller_id = u.user_id
      WHERE p.shop_id = ? AND p.stock_quantity <= p.min_stock_level AND p.is_active = TRUE
      ORDER BY p.stock_quantity ASC
    `
    const results = await query(sql, [shopId]) as any[]
    return results.map(product => {
      if (product.image_urls) {
        product.image_urls = JSON.parse(product.image_urls)
      }
      return product
    })
  }

  // Get product count
  static async getCount(activeOnly: boolean = false): Promise<number> {
    const sql = activeOnly 
      ? 'SELECT COUNT(*) as count FROM products WHERE is_active = TRUE'
      : 'SELECT COUNT(*) as count FROM products'
    
    const result = await query(sql) as any[]
    return result[0]?.count || 0
  }
}
