require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT
  }
);

async function run() {
  try {
    const emails = [
      'puskemas@gmail.com',
      'stafdinkes@gmail.com',
      'adminpuskesmas@gmail.com',
      'userpuskesmas@gmail.com',
      'admindinkes@gmail.com',
      'superadmin@posyandu.org',
      'superadmin@gmail.com'
    ];
    
    await sequelize.query(`DELETE FROM users WHERE email IN ('${emails.join("','")}')`);
    console.log('Dummy accounts deleted');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
