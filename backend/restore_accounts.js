require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

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
    const password = await bcrypt.hash('12345678', 10);
    const usersToRestore = [
      { email: 'puskemas@gmail.com', role: 'puskesmasAdmin', nama: 'Admin Puskesmas' },
      { email: 'stafdinkes@gmail.com', role: 'dinkes', nama: 'Staf Dinkes' },
      { email: 'adminpuskesmas@gmail.com', role: 'puskesmasAdmin', nama: 'Admin Puskesmas' },
      { email: 'userpuskesmas@gmail.com', role: 'puskesmas', nama: 'Staf Puskesmas' },
      { email: 'admindinkes@gmail.com', role: 'dinkesAdmin', nama: 'Admin Dinkes' },
      { email: 'superadmin@posyandu.org', role: 'sa', nama: 'Superadmin' }
    ];

    for (const u of usersToRestore) {
      await sequelize.query(
        `INSERT INTO users (email, password_hash, role, nama_lengkap, status, email_verified_at) 
         VALUES ('${u.email}', '${password}', '${u.role}', '${u.nama}', 'active', NOW())
         ON CONFLICT DO NOTHING`
      );
    }

    // Update superadmin@gmail.com yang sudah ada
    await sequelize.query(`UPDATE users SET email_verified_at = NOW() WHERE email = 'superadmin@gmail.com'`);

    console.log('Accounts restored and verified');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
