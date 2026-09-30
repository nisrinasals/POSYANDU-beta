const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('posyandu', 'postgres', 'americanopav', { host: 'localhost', dialect: 'postgres' });
sequelize.query("UPDATE users SET puskesmas_id = 3 WHERE email IN ('adminpuskesmas@gmail.com', 'userpuskesmas@gmail.com')")
  .then(() => { console.log("Updated!"); process.exit(0); })
  .catch(err => { console.log(err); process.exit(1); });
