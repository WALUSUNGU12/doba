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
    // 1. Get terminal 5 and its manager email
    const [terminals] = await connection.execute('SELECT * FROM terminals WHERE terminal_id = 5');
    if (terminals.length === 0) {
      throw new Error('Terminal 5 not found');
    }
    const terminal = terminals[0];
    console.log(`Found Terminal: ${terminal.name} (ID: ${terminal.terminal_id}, Manager ID: ${terminal.manager_id})`);

    const [users] = await connection.execute('SELECT email FROM users WHERE user_id = ?', [terminal.manager_id]);
    if (users.length === 0) {
      throw new Error(`Manager user not found for ID: ${terminal.manager_id}`);
    }
    const managerEmail = users[0].email;
    console.log(`Manager Email: ${managerEmail}`);

    // 2. Find or create a mock order
    const [orders] = await connection.execute('SELECT * FROM orders LIMIT 1');
    let order = orders[0];
    console.log(`Using Order: ${order.order_number} (ID: ${order.order_id}, Status: ${order.status})`);

    // Let's reset order status to 'confirmed' for clean test state
    await connection.execute('UPDATE orders SET status = "confirmed" WHERE order_id = ?', [order.order_id]);

    // 3. Find or create a mock delivery for this order
    const [deliveries] = await connection.execute('SELECT * FROM deliveries WHERE order_id = ?', [order.order_id]);
    let delivery = deliveries[0];
    console.log(`Using Delivery: ID ${delivery.delivery_id}, Status: ${delivery.status}`);

    // 4. Create terminal_parcel at terminal 5 for this delivery if not exists
    const [parcels] = await connection.execute('SELECT * FROM terminal_parcels WHERE delivery_id = ? AND terminal_id = 5', [delivery.delivery_id]);
    let parcel = parcels[0];
    
    // Reset parcel status to 'arrived' for clean test state
    await connection.execute('UPDATE terminal_parcels SET status = "arrived" WHERE terminal_parcel_id = ?', [parcel.terminal_parcel_id]);
    console.log(`Reset Terminal Parcel ID ${parcel.terminal_parcel_id} to arrived.`);

    // 5. Login as the Terminal Operator (manager of terminal 5)
    console.log('\nLogging in as terminal manager...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: managerEmail,
        password: 'customer123' // Alice's password
      })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    console.log('Login successful! Role:', loginData.data.user.role);

    // 6. Test out_for_delivery action
    console.log(`\nTesting POST /api/terminals/5/parcels/redeem-by-order (Action: out_for_delivery) for Order ID ${order.order_id}...`);
    const dispatchRes = await fetch(`http://localhost:5000/api/terminals/5/parcels/redeem-by-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        order_id: order.order_id,
        action: 'out_for_delivery',
        notes: 'Testing dispatch by order ID'
      })
    });

    const dispatchData = await dispatchRes.json();
    console.log('Dispatch Status:', dispatchRes.status);
    console.log('Dispatch Response:', dispatchData);

    // Verify DB states after dispatch
    const [transitParcel] = await connection.execute('SELECT status FROM terminal_parcels WHERE terminal_parcel_id = ?', [parcel.terminal_parcel_id]);
    const [transitOrder] = await connection.execute('SELECT status FROM orders WHERE order_id = ?', [order.order_id]);
    console.log('Transit Parcel Status (Expected: out_for_delivery):', transitParcel[0]?.status);
    console.log('Transit Order Status (Expected: out_for_delivery):', transitOrder[0]?.status);

    // 7. Test collect action
    console.log(`\nTesting POST /api/terminals/5/parcels/redeem-by-order (Action: collect) for Order ID ${order.order_id}...`);
    const redeemRes = await fetch(`http://localhost:5000/api/terminals/5/parcels/redeem-by-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        order_id: order.order_id,
        action: 'collect',
        notes: 'Testing collect by order ID'
      })
    });

    const redeemData = await redeemRes.json();
    console.log('Redeem Status:', redeemRes.status);
    console.log('Redeem Response:', redeemData);

    // Verify DB states after collect
    const [finalParcel] = await connection.execute('SELECT status FROM terminal_parcels WHERE terminal_parcel_id = ?', [parcel.terminal_parcel_id]);
    const [finalOrder] = await connection.execute('SELECT status FROM orders WHERE order_id = ?', [order.order_id]);

    console.log('\nDatabase state verification:');
    console.log('Final Parcel Status (Expected: collected):', finalParcel[0]?.status);
    console.log('Final Order Status (Expected: delivered):', finalOrder[0]?.status);

  } catch (err) {
    console.error('Error during test execution:', err);
  } finally {
    await connection.end();
  }
}

main();
