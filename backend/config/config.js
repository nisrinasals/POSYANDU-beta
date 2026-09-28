require("dotenv").config();

module.exports = {
  development: {
<<<<<<< HEAD
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
=======
    username: String(process.env.DB_USER || "postgres"),
    password: String(process.env.DB_PASSWORD || "changee-me"), // Dikonversi ke String agar tidak pernah undefined/number
    database: String(process.env.DB_NAME || "posyandu"),
    host: String(process.env.DB_HOST || "127.0.0.1"),
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    logging: console.log,
    timezone: "+07:00",
    define: {
      timestamps: false,
      underscored: true,
      freezeTableName: true,
    },
  },
  test: {
<<<<<<< HEAD
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
=======
    username: String(process.env.DB_USER || "postgres"),
    password: String(process.env.DB_PASSWORD || "changee-me"),
    database: String(process.env.DB_NAME || "posyandu_test"),
    host: String(process.env.DB_HOST || "127.0.0.1"),
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    logging: false,
    timezone: "+07:00",
    define: {
      timestamps: false,
      underscored: true,
      freezeTableName: true,
    },
  },
  production: {
<<<<<<< HEAD
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
=======
    username: String(process.env.DB_USER),
    password: String(process.env.DB_PASSWORD),
    database: String(process.env.DB_NAME),
    host: String(process.env.DB_HOST),
    port: process.env.DB_PORT,
    dialect: "postgres",
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    logging: false,
    timezone: "+07:00",
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: false,
      underscored: true,
      freezeTableName: true,
    },
  },
};