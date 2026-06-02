const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dobadoba_db'
  });

  const [deliveries] = await connection.execute(`
    SELECT d.*, o.order_number, o.status as order_status 
    FROM deliveries d
    JOIN orders o ON d.order_id = o.order_id
  `);
  console.log('Deliveries:');
  console.log(deliveries);

  const [terminals] = await connection.execute(`
    SELECT terminal_id, name, manager_id FROM terminals
  `);
  console.log('Terminals:');
  console.log(terminals);

  await connection.end();
}

main();
