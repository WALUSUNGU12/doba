import { UserModel } from './models/User'
import { ShopModel } from './models/Shop'
import { ProductModel } from './models/Product'
import { OrderModel } from './models/Order'
import bcrypt from 'bcryptjs'

export async function seedDatabase() {
  console.log('Starting database seeding...')

  try {
    // Create tables
    await UserModel.createTable()
    await ShopModel.createTable()
    await ProductModel.createTable()
    await OrderModel.createTable()
    console.log('Database tables created/verified')

    // Create admin user
    const adminExists = await UserModel.findByEmail('admin@dobadoba.com')
    if (!adminExists) {
      const adminUser = await UserModel.create({
        username: 'admin',
        email: 'admin@dobadoba.com',
        password: 'admin123',
        role: 'admin',
        first_name: 'System',
        last_name: 'Administrator',
        phone: '+265991234567'
      })
      console.log('Admin user created:', adminUser.email)
    }

    // Create sample sellers
    const sellers = [
      {
        username: 'techstore',
        email: 'techstore@dobadoba.com',
        password: 'seller123',
        first_name: 'James',
        last_name: 'Banda',
        phone: '+265991234568'
      },
      {
        username: 'fashionhouse',
        email: 'fashion@dobadoba.com',
        password: 'seller123',
        first_name: 'Mary',
        last_name: 'Phiri',
        phone: '+265991234569'
      },
      {
        username: 'greenfarms',
        email: 'farms@dobadoba.com',
        password: 'seller123',
        first_name: 'John',
        last_name: 'Moyo',
        phone: '+265991234570'
      },
      {
        username: 'bookworld',
        email: 'books@dobadoba.com',
        password: 'seller123',
        first_name: 'Esther',
        last_name: 'Chirwa',
        phone: '+265991234571'
      }
    ]

    const createdSellers = []
    for (const sellerData of sellers) {
      const existingSeller = await UserModel.findByEmail(sellerData.email)
      if (!existingSeller) {
        const seller = await UserModel.create({
          ...sellerData,
          role: 'seller'
        })
        createdSellers.push(seller)
        console.log('Seller created:', seller.email)
      } else {
        createdSellers.push(existingSeller)
      }
    }

    // Create sample shops
    const shops = [
      {
        seller_id: createdSellers[0]?.user_id,
        shop_name: 'Tech Store Mzuzu',
        description: 'Your one-stop shop for electronics and gadgets in Mzuzu',
        category: 'Electronics',
        address: 'Shop 12, Mzuzu City Centre, Mzuzu',
        phone: '+265991234568',
        email: 'techstore@dobadoba.com'
      },
      {
        seller_id: createdSellers[1]?.user_id,
        shop_name: 'African Fashion House',
        description: 'Traditional and modern African clothing and accessories',
        category: 'Clothing',
        address: 'Shop 5, Mzuzu Market, Mzuzu',
        phone: '+265991234569',
        email: 'fashion@dobadoba.com'
      },
      {
        seller_id: createdSellers[2]?.user_id,
        shop_name: 'Green Farms Organic',
        description: 'Fresh organic produce and farm products',
        category: 'Food & Beverages',
        address: 'Farm Road, Mzuzu Farms Area, Mzuzu',
        phone: '+265991234570',
        email: 'farms@dobadoba.com'
      },
      {
        seller_id: createdSellers[3]?.user_id,
        shop_name: 'Book World Mzuzu',
        description: 'Educational books, novels and stationery',
        category: 'Books',
        address: 'Shop 8, Mzuzu City Centre, Mzuzu',
        phone: '+265991234571',
        email: 'books@dobadoba.com'
      }
    ]

    const createdShops = []
    for (const shopData of shops) {
      if (shopData.seller_id) {
        const existingShop = await ShopModel.findBySellerId(shopData.seller_id)
        if (existingShop.length === 0) {
          const shop = await ShopModel.create(shopData)
          createdShops.push(shop)
          console.log('Shop created:', shop.shop_name)
        } else {
          createdShops.push(existingShop[0])
        }
      }
    }

    // Create sample products
    const products = [
      // Tech Store Products
      {
        shop_id: createdShops[0]?.shop_id,
        product_name: 'Samsung Galaxy A54 Smartphone',
        description: 'Latest Samsung smartphone with excellent camera and battery life. Features 6.4" display, 50MP camera, and 5000mAh battery.',
        price: 125000,
        category: 'Electronics',
        stock_quantity: 15,
        min_stock_level: 5,
        image_urls: ['https://via.placeholder.com/300x300/10b981/ffffff?text=Samsung+A54']
      },
      {
        shop_id: createdShops[0]?.shop_id,
        product_name: 'HP Pavilion 15 Laptop',
        description: 'Reliable laptop for work and study with Intel Core i5 processor, 8GB RAM, and 256GB SSD.',
        price: 280000,
        category: 'Electronics',
        stock_quantity: 8,
        min_stock_level: 3,
        image_urls: ['https://via.placeholder.com/300x300/3b82f6/ffffff?text=HP+Laptop']
      },
      {
        shop_id: createdShops[0]?.shop_id,
        product_name: 'Wireless Bluetooth Earbuds',
        description: 'High-quality wireless earbuds with noise cancellation and 24-hour battery life.',
        price: 15000,
        category: 'Electronics',
        stock_quantity: 25,
        min_stock_level: 10,
        image_urls: ['https://via.placeholder.com/300x300/8b5cf6/ffffff?text=Earbuds']
      },

      // Fashion House Products
      {
        shop_id: createdShops[1]?.shop_id,
        product_name: 'Traditional Chitenge Fabric',
        description: 'Beautiful African fabric perfect for traditional wear. 100% cotton with vibrant patterns.',
        price: 15000,
        category: 'Clothing',
        stock_quantity: 30,
        min_stock_level: 10,
        image_urls: ['https://via.placeholder.com/300x300/ec4899/ffffff?text=Chitenge']
      },
      {
        shop_id: createdShops[1]?.shop_id,
        product_name: 'African Print Dress',
        description: 'Elegant African print dress suitable for special occasions. Available in multiple sizes.',
        price: 35000,
        category: 'Clothing',
        stock_quantity: 12,
        min_stock_level: 5,
        image_urls: ['https://via.placeholder.com/300x300/f59e0b/ffffff?text=Dress']
      },
      {
        shop_id: createdShops[1]?.shop_id,
        product_name: 'Handwoven Basket',
        description: 'Traditional handwoven basket made from local materials. Perfect for home decoration.',
        price: 8000,
        category: 'Home & Garden',
        stock_quantity: 20,
        min_stock_level: 8,
        image_urls: ['https://via.placeholder.com/300x300/84cc16/ffffff?text=Basket']
      },

      // Green Farms Products
      {
        shop_id: createdShops[2]?.shop_id,
        product_name: 'Fresh Vegetable Pack',
        description: 'Assorted fresh vegetables from local farms. Includes tomatoes, onions, carrots, and greens.',
        price: 8000,
        category: 'Food & Beverages',
        stock_quantity: 50,
        min_stock_level: 15,
        image_urls: ['https://via.placeholder.com/300x300/22c55e/ffffff?text=Vegetables']
      },
      {
        shop_id: createdShops[2]?.shop_id,
        product_name: 'Organic Honey 500ml',
        description: 'Pure organic honey from local beekeepers. No additives or preservatives.',
        price: 12000,
        category: 'Food & Beverages',
        stock_quantity: 35,
        min_stock_level: 10,
        image_urls: ['https://via.placeholder.com/300x300/eab308/ffffff?text=Honey']
      },
      {
        shop_id: createdShops[2]?.shop_id,
        product_name: 'Fresh Eggs (Dozen)',
        description: 'Farm-fresh free-range eggs. Rich in nutrients and perfect for breakfast.',
        price: 4000,
        category: 'Food & Beverages',
        stock_quantity: 100,
        min_stock_level: 20,
        image_urls: ['https://via.placeholder.com/300x300/fbbf24/ffffff?text=Eggs']
      },

      // Book World Products
      {
        shop_id: createdShops[3]?.shop_id,
        product_name: 'Secondary School Textbook Bundle',
        description: 'Complete set of essential textbooks for Form 1-4 students. All subjects covered.',
        price: 35000,
        category: 'Books',
        stock_quantity: 10,
        min_stock_level: 3,
        image_urls: ['https://via.placeholder.com/300x300/6366f1/ffffff?text=Textbooks']
      },
      {
        shop_id: createdShops[3]?.shop_id,
        product_name: 'African Literature Collection',
        description: 'Collection of classic African literature novels. Perfect for book lovers.',
        price: 18000,
        category: 'Books',
        stock_quantity: 15,
        min_stock_level: 5,
        image_urls: ['https://via.placeholder.com/300x300/a855f7/ffffff?text=Novels']
      },
      {
        shop_id: createdShops[3]?.shop_id,
        product_name: 'Stationery Set',
        description: 'Complete stationery set for students. Includes pens, pencils, notebooks, and more.',
        price: 12000,
        category: 'Books',
        stock_quantity: 40,
        min_stock_level: 15,
        image_urls: ['https://via.placeholder.com/300x300/06b6d4/ffffff?text=Stationery']
      }
    ]

    for (const productData of products) {
      if (productData.shop_id) {
        // Check if product already exists
        const existingProducts = await ProductModel.findByShopId(productData.shop_id)
        const productExists = existingProducts.some(p => p.product_name === productData.product_name)
        
        if (!productExists) {
          const product = await ProductModel.create(productData)
          console.log('Product created:', product.product_name)
        }
      }
    }

    // Create sample customers
    const customers = [
      {
        username: 'customer1',
        email: 'customer1@dobadoba.com',
        password: 'customer123',
        first_name: 'Alice',
        last_name: 'Kamwendo',
        phone: '+265991234572'
      },
      {
        username: 'customer2',
        email: 'customer2@dobadoba.com',
        password: 'customer123',
        first_name: 'Bob',
        last_name: 'Mhango',
        phone: '+265991234573'
      },
      {
        username: 'customer3',
        email: 'customer3@dobadoba.com',
        password: 'customer123',
        first_name: 'Carol',
        last_name: 'Banda',
        phone: '+265991234574'
      }
    ]

    for (const customerData of customers) {
      const existingCustomer = await UserModel.findByEmail(customerData.email)
      if (!existingCustomer) {
        const customer = await UserModel.create({
          ...customerData,
          role: 'customer'
        })
        console.log('Customer created:', customer.email)
      }
    }

    // Create sample couriers
    const couriers = [
      {
        username: 'courier1',
        email: 'courier1@dobadoba.com',
        password: 'courier123',
        first_name: 'David',
        last_name: 'Nyirenda',
        phone: '+265991234575'
      },
      {
        username: 'courier2',
        email: 'courier2@dobadoba.com',
        password: 'courier123',
        first_name: 'Emma',
        last_name: 'Chikopa',
        phone: '+265991234576'
      }
    ]

    for (const courierData of couriers) {
      const existingCourier = await UserModel.findByEmail(courierData.email)
      if (!existingCourier) {
        const courier = await UserModel.create({
          ...courierData,
          role: 'courier'
        })
        console.log('Courier created:', courier.email)
      }
    }

    console.log('Database seeding completed successfully!')
    console.log('\n=== LOGIN CREDENTIALS ===')
    console.log('Admin: admin@dobadoba.com / admin123')
    console.log('Sellers: techstore@dobadoba.com / seller123')
    console.log('Customers: customer1@dobadoba.com / customer123')
    console.log('Couriers: courier1@dobadoba.com / courier123')
    console.log('========================')

  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase().catch(console.error)
}
