import { query, queryOne, insert, update } from '../db'

export interface Order {
  order_id: number
  customer_id: number
  shop_id: number
  product_id: number
  quantity: number
  unit_price: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'refunded'
  delivery_address: string
  delivery_phone: string
  delivery_notes?: string
  courier_id?: number
  pickup_address: string
  estimated_delivery_time?: string
  actual_delivery_time?: string
  created_at: string
  updated_at: string
  customer_name?: string
  shop_name?: string
  product_name?: string
  courier_name?: string
}

export interface CreateOrderData {
  customer_id: number
  shop_id: number
  product_id: number
  quantity: number
  unit_price: number
  delivery_address: string
  delivery_phone: string
  delivery_notes?: string
}

export interface UpdateOrderData {
  status?: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled'
  payment_status?: 'pending' | 'paid' | 'refunded'
  courier_id?: number
  estimated_delivery_time?: string
  actual_delivery_time?: string
  delivery_notes?: string
}

export class OrderModel {
  // Create orders table if it doesn't exist
  static async createTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS orders (
        order_id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        shop_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
        delivery_address VARCHAR(255) NOT NULL,
        delivery_phone VARCHAR(20) NOT NULL,
        delivery_notes TEXT,
        courier_id INT,
        pickup_address VARCHAR(255),
        estimated_delivery_time TIMESTAMP NULL,
        actual_delivery_time TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(user_id),
        FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id),
        FOREIGN KEY (courier_id) REFERENCES users(user_id),
        INDEX idx_customer (customer_id),
        INDEX idx_shop (shop_id),
        INDEX idx_product (product_id),
        INDEX idx_courier (courier_id),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `
    
    try {
      await query(createTableSQL)
      console.log('Orders table created or already exists')
    } catch (error) {
      console.error('Error creating orders table:', error)
      throw error
    }
  }

  // Get order by ID with all related info
  static async findById(id: number): Promise<Order | null> {
    const sql = `
      SELECT o.*, 
             u1.first_name as customer_name,
             s.shop_name,
             p.product_name,
             u2.first_name as courier_name
      FROM orders o
      JOIN users u1 ON o.customer_id = u1.user_id
      JOIN shops s ON o.shop_id = s.shop_id
      JOIN products p ON o.product_id = p.product_id
      LEFT JOIN users u2 ON o.courier_id = u2.user_id
      WHERE o.order_id = ?
    `
    return await queryOne(sql, [id])
  }

  // Get orders by customer ID
  static async findByCustomerId(customerId: number, limit: number = 50, offset: number = 0): Promise<Order[]> {
    const sql = `
      SELECT o.*, 
             u1.first_name as customer_name,
             s.shop_name,
             p.product_name,
             u2.first_name as courier_name
      FROM orders o
      JOIN users u1 ON o.customer_id = u1.user_id
      JOIN shops s ON o.shop_id = s.shop_id
      JOIN products p ON o.product_id = p.product_id
      LEFT JOIN users u2 ON o.courier_id = u2.user_id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `
    return await query(sql, [customerId, limit, offset]) as Order[]
  }

  // Get orders by shop ID
  static async findByShopId(shopId: number, limit: number = 50, offset: number = 0): Promise<Order[]> {
    const sql = `
      SELECT o.*, 
             u1.first_name as customer_name,
             s.shop_name,
             p.product_name,
             u2.first_name as courier_name
      FROM orders o
      JOIN users u1 ON o.customer_id = u1.user_id
      JOIN shops s ON o.shop_id = s.shop_id
      JOIN products p ON o.product_id = p.product_id
      LEFT JOIN users u2 ON o.courier_id = u2.user_id
      WHERE o.shop_id = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `
    return await query(sql, [shopId, limit, offset]) as Order[]
  }

  // Get orders by courier ID
  static async findByCourierId(courierId: number, limit: number = 50, offset: number = 0): Promise<Order[]> {
    const sql = `
      SELECT o.*, 
             u1.first_name as customer_name,
             s.shop_name,
             p.product_name,
             u2.first_name as courier_name
      FROM orders o
      JOIN users u1 ON o.customer_id = u1.user_id
      JOIN shops s ON o.shop_id = s.shop_id
      JOIN products p ON o.product_id = p.product_id
      LEFT JOIN users u2 ON o.courier_id = u2.user_id
      WHERE o.courier_id = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `
    return await query(sql, [courierId, limit, offset]) as Order[]
  }

  // Get all orders (for admin)
  static async getAll(limit: number = 50, offset: number = 0): Promise<Order[]> {
    const sql = `
      SELECT o.*, 
             u1.first_name as customer_name,
             s.shop_name,
             p.product_name,
             u2.first_name as courier_name
      FROM orders o
      JOIN users u1 ON o.customer_id = u1.user_id
      JOIN shops s ON o.shop_id = s.shop_id
      JOIN products p ON o.product_id = p.product_id
      LEFT JOIN users u2 ON o.courier_id = u2.user_id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `
    return await query(sql, [limit, offset]) as Order[]
  }

  // Get pending orders for couriers
  static async getPendingOrders(limit: number = 50): Promise<Order[]> {
    const sql = `
      SELECT o.*, 
             u1.first_name as customer_name,
             s.shop_name,
             s.address as pickup_address,
             p.product_name,
             u2.first_name as courier_name
      FROM orders o
      JOIN users u1 ON o.customer_id = u1.user_id
      JOIN shops s ON o.shop_id = s.shop_id
      JOIN products p ON o.product_id = p.product_id
      LEFT JOIN users u2 ON o.courier_id = u2.user_id
      WHERE o.status IN ('confirmed', 'preparing', 'ready_for_pickup') AND o.courier_id IS NULL
      ORDER BY o.created_at ASC
      LIMIT ?
    `
    return await query(sql, [limit]) as Order[]
  }

  // Get active orders for specific courier
  static async getActiveCourierOrders(courierId: number): Promise<Order[]> {
    const sql = `
      SELECT o.*, 
             u1.first_name as customer_name,
             s.shop_name,
             s.address as pickup_address,
             p.product_name,
             u2.first_name as courier_name
      FROM orders o
      JOIN users u1 ON o.customer_id = u1.user_id
      JOIN shops s ON o.shop_id = s.shop_id
      JOIN products p ON o.product_id = p.product_id
      LEFT JOIN users u2 ON o.courier_id = u2.user_id
      WHERE o.courier_id = ? AND o.status NOT IN ('delivered', 'cancelled')
      ORDER BY o.created_at ASC
    `
    return await query(sql, [courierId]) as Order[]
  }

  // Create new order
  static async create(orderData: CreateOrderData): Promise<Order> {
    const totalAmount = orderData.quantity * orderData.unit_price
    
    // Get shop address for pickup
    const shop = await queryOne('SELECT address FROM shops WHERE shop_id = ?', [orderData.shop_id]) as any
    const pickupAddress = shop?.address || ''
    
    const sql = `
      INSERT INTO orders (customer_id, shop_id, product_id, quantity, unit_price, total_amount, delivery_address, delivery_phone, delivery_notes, pickup_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const params = [
      orderData.customer_id,
      orderData.shop_id,
      orderData.product_id,
      orderData.quantity,
      orderData.unit_price,
      totalAmount,
      orderData.delivery_address,
      orderData.delivery_phone,
      orderData.delivery_notes || null,
      pickupAddress
    ]
    
    const orderId = await insert(sql, params)
    
    // Decrease product stock
    await query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ? AND stock_quantity >= ?', 
                [orderData.quantity, orderData.product_id, orderData.quantity])
    
    // Return the created order
    const newOrder = await this.findById(orderId)
    if (!newOrder) {
      throw new Error('Failed to retrieve created order')
    }
    
    return newOrder
  }

  // Update order
  static async update(id: number, orderData: UpdateOrderData): Promise<boolean> {
    const fields = []
    const params = []
    
    // Build dynamic update query
    if (orderData.status !== undefined) {
      fields.push('status = ?')
      params.push(orderData.status)
    }
    if (orderData.payment_status !== undefined) {
      fields.push('payment_status = ?')
      params.push(orderData.payment_status)
    }
    if (orderData.courier_id !== undefined) {
      fields.push('courier_id = ?')
      params.push(orderData.courier_id)
    }
    if (orderData.estimated_delivery_time !== undefined) {
      fields.push('estimated_delivery_time = ?')
      params.push(orderData.estimated_delivery_time)
    }
    if (orderData.actual_delivery_time !== undefined) {
      fields.push('actual_delivery_time = ?')
      params.push(orderData.actual_delivery_time)
    }
    if (orderData.delivery_notes !== undefined) {
      fields.push('delivery_notes = ?')
      params.push(orderData.delivery_notes)
    }
    
    if (fields.length === 0) {
      return false // No fields to update
    }
    
    const sql = `UPDATE orders SET ${fields.join(', ')} WHERE order_id = ?`
    params.push(id)
    
    const affectedRows = await update(sql, params)
    return affectedRows > 0
  }

  // Assign courier to order
  static async assignCourier(orderId: number, courierId: number, estimatedDeliveryTime?: string): Promise<boolean> {
    const sql = `
      UPDATE orders 
      SET courier_id = ?, status = 'out_for_delivery', estimated_delivery_time = ?
      WHERE order_id = ? AND courier_id IS NULL
    `
    const affectedRows = await update(sql, [courierId, estimatedDeliveryTime || null, orderId])
    return affectedRows > 0
  }

  // Complete order
  static async completeOrder(orderId: number): Promise<boolean> {
    const sql = `
      UPDATE orders 
      SET status = 'delivered', actual_delivery_time = CURRENT_TIMESTAMP
      WHERE order_id = ? AND status = 'out_for_delivery'
    `
    const affectedRows = await update(sql, [orderId])
    return affectedRows > 0
  }

  // Cancel order and restore stock
  static async cancelOrder(orderId: number): Promise<boolean> {
    // Get order details to restore stock
    const order = await this.findById(orderId)
    if (!order) {
      return false
    }
    
    // Only cancel if not already delivered
    if (order.status === 'delivered') {
      return false
    }
    
    // Update order status
    const updateSql = 'UPDATE orders SET status = ? WHERE order_id = ?'
    await update(updateSql, ['cancelled', orderId])
    
    // Restore product stock
    await query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?', 
                [order.quantity, order.product_id])
    
    return true
  }

  // Get order statistics
  static async getOrderStats(startDate?: string, endDate?: string): Promise<any> {
    let whereClause = ''
    const params = []
    
    if (startDate && endDate) {
      whereClause = 'WHERE created_at BETWEEN ? AND ?'
      params.push(startDate, endDate)
    }
    
    const sql = `
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders
      FROM orders ${whereClause}
    `
    
    const result = await query(sql, params) as any[]
    return result[0] || {}
  }

  // Get order count
  static async getCount(status?: string): Promise<number> {
    let sql = 'SELECT COUNT(*) as count FROM orders'
    const params = []
    
    if (status) {
      sql += ' WHERE status = ?'
      params.push(status)
    }
    
    const result = await query(sql, params) as any[]
    return result[0]?.count || 0
  }
}
