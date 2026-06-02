const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dobadoba_db'
  });

  const [shops] = await connection.execute('SELECT * FROM shops');
  console.log('Shops:');
  console.log(shops);

  const [terminals] = await connection.execute('SELECT * FROM terminals');
  console.log('Terminals:');
  console.log(terminals);

  await connection.end();
}

main();
