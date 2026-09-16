require("dotenv").config();

const cors = require("cors");
const express = require("express");
const api = require("./routes/api");
const { sequelize } = require("./models");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API Posyandu aktif." });
});

app.use("/api", api);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan." });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : "Terjadi kesalahan pada server.",
  });
});

const startServer = async () => {
  await sequelize.authenticate();
  app.listen(port, () => {
    console.log(`Server Posyandu berjalan pada port ${port}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Gagal menjalankan server:", error);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
