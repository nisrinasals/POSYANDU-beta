const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/posyandu');
sequelize.query("SELECT email, role FROM users WHERE role='kader' LIMIT 1")
  .then(res => { console.log(res[0]); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
