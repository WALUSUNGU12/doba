const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dobadoba_db'
  });

  try {
    // Let's set up the order and terminals for the test
    // Shop owner is user_id 2 (Alice Kamwendo, seller/operator of terminal 5)
    // Seller terminal (origin): 5
    // Delivery terminal (destination): 4 (managed by user 13, customer2@dobadoba.com)

    // Find the order
    const [orders] = await connection.execute('SELECT * FROM orders LIMIT 1');
    if (orders.length === 0) {
      throw new Error('No orders found to test');
    }
    const order = orders[0];
    const orderId = order.order_id;
    console.log(`Testing with Order ID: ${orderId}, Order Number: ${order.order_number}`);

    // Temporarily update shop 12 to have different seller so seller_id 3 only has shop 13 on Terminal 5
    await connection.execute('UPDATE shops SET seller_id = 15 WHERE shop_id = 12');

    // Update order configuration to ensure:
    // seller_id = 3 (so origin terminal is 5)
    // delivery_terminal_id = 4 (so destination terminal is 4)
    // status = 'confirmed'
    await connection.execute(`
      UPDATE orders
      SET seller_id = 3,
          delivery_terminal_id = 4,
          status = 'confirmed',
          courier_id = NULL
      WHERE order_id = ?
    `, [orderId]);

    // Create terminal_parcel records at both terminals for testing if not exists
    // 1. Delivery/Parcel at terminal 5 (origin)
    const [deliveries] = await connection.execute('SELECT * FROM deliveries WHERE order_id = ?', [orderId]);
    if (deliveries.length === 0) {
      throw new Error(`No delivery found for Order ID: ${orderId}`);
    }
    const deliveryId = deliveries[0].delivery_id;

    // Reset deliveries status to 'in_transit'
    await connection.execute('UPDATE deliveries SET status = "in_transit" WHERE delivery_id = ?', [deliveryId]);

    // Delete existing test parcels to start clean
    await connection.execute('DELETE FROM terminal_parcels WHERE delivery_id = ?', [deliveryId]);

    // Insert parcel at origin terminal 5
    await connection.execute(`
      INSERT INTO terminal_parcels (terminal_id, delivery_id, status, notes)
      VALUES (5, ?, 'arrived', 'Origin arrived parcel')
    `, [deliveryId]);

    // Insert parcel at destination terminal 4
    await connection.execute(`
      INSERT INTO terminal_parcels (terminal_id, delivery_id, status, notes)
      VALUES (4, ?, 'arrived', 'Destination arrived parcel')
    `, [deliveryId]);

    console.log('Seeded test parcels at Terminal 5 (Origin) and Terminal 4 (Destination).');

    // -------------------------------------------------------------
    // Test Part 1: Operator of Terminal 5 (customer1@dobadoba.com)
    // - Should be ALLOWED to accept order (origin)
    // - Should be ALLOWED to collect/redeem parcel (origin)
    // - Should be DENIED from dispatching parcel (not destination)
    // -------------------------------------------------------------
    console.log('\n--- Logging in as customer1@dobadoba.com (Terminal 5 Operator - Origin) ---');
    const login1Res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer1@dobadoba.com', password: 'customer123' })
    });
    const login1Data = await login1Res.json();
    const token1 = login1Data.data.token;

    // A. Try to Accept Order (should succeed)
    // Reset order status to confirmed
    await connection.execute('UPDATE orders SET status = "confirmed", courier_id = NULL WHERE order_id = ?', [orderId]);
    console.log('1A. Attempting to accept order...');
    const accept1Res = await fetch('http://localhost:5000/api/deliveries/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` },
      body: JSON.stringify({ order_id: orderId })
    });
    const accept1Data = await accept1Res.json();
    console.log('Accept Status:', accept1Res.status, 'Response:', accept1Data.message);

    // B. Try to Collect/Redeem parcel (should succeed)
    console.log('1B. Attempting to collect/redeem parcel...');
    const redeem1Res = await fetch('http://localhost:5000/api/terminals/5/parcels/redeem-by-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` },
      body: JSON.stringify({ order_id: orderId, action: 'collect' })
    });
    const redeem1Data = await redeem1Res.json();
    console.log('Redeem Status:', redeem1Res.status, 'Response:', redeem1Data.message);

    // C. Try to Dispatch parcel (should fail)
    console.log('1C. Attempting to dispatch parcel...');
    const dispatch1Res = await fetch('http://localhost:5000/api/terminals/5/parcels/redeem-by-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` },
      body: JSON.stringify({ order_id: orderId, action: 'out_for_delivery' })
    });
    const dispatch1Data = await dispatch1Res.json();
    console.log('Dispatch Status:', dispatch1Res.status, 'Response:', dispatch1Data.message);


    // -------------------------------------------------------------
    // Test Part 2: Operator of Terminal 4 (customer2@dobadoba.com)
    // - Should be DENIED from accepting order (not origin)
    // - Should be DENIED from collecting/redeem parcel (not origin)
    // - Should be ALLOWED to dispatch parcel (destination)
    // -------------------------------------------------------------
    console.log('\n--- Logging in as customer2@dobadoba.com (Terminal 4 Operator - Destination) ---');
    const login2Res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer2@dobadoba.com', password: 'customer123' })
    });
    const login2Data = await login2Res.json();
    const token2 = login2Data.data.token;

    // A. Try to Accept Order (should fail)
    await connection.execute('UPDATE orders SET status = "confirmed", courier_id = NULL WHERE order_id = ?', [orderId]);
    console.log('2A. Attempting to accept order...');
    const accept2Res = await fetch('http://localhost:5000/api/deliveries/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` },
      body: JSON.stringify({ order_id: orderId })
    });
    const accept2Data = await accept2Res.json();
    console.log('Accept Status:', accept2Res.status, 'Response:', accept2Data.message);

    // B. Try to Collect/Redeem parcel (should fail)
    console.log('2B. Attempting to collect/redeem parcel...');
    const redeem2Res = await fetch('http://localhost:5000/api/terminals/4/parcels/redeem-by-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` },
      body: JSON.stringify({ order_id: orderId, action: 'collect' })
    });
    const redeem2Data = await redeem2Res.json();
    console.log('Redeem Status:', redeem2Res.status, 'Response:', redeem2Data.message);

    // C. Try to Dispatch parcel (should succeed)
    console.log('2C. Attempting to dispatch parcel...');
    const dispatch2Res = await fetch('http://localhost:5000/api/terminals/4/parcels/redeem-by-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` },
      body: JSON.stringify({ order_id: orderId, action: 'out_for_delivery' })
    });
    const dispatch2Data = await dispatch2Res.json();
    console.log('Dispatch Status:', dispatch2Res.status, 'Response:', dispatch2Data.message);

  } catch (err) {
    console.error('Error during constraints testing:', err);
  } finally {
    // Restore shop 12 seller_id to 3
    try {
      await connection.execute('UPDATE shops SET seller_id = 3 WHERE shop_id = 12');
      console.log('Restored Shop 12 seller_id back to 3.');
    } catch (restoreErr) {
      console.error('Failed to restore Shop 12 seller_id:', restoreErr);
    }
    await connection.end();
  }
}

main();
