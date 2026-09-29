require("dotenv").config();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const {
  sequelize,
  Kecamatan,
  Kelurahan,
  Puskesmas,
  Posyandu,
  User,
  SesiPosyandu,
} = require("./models");

async function seedDatabase() {
  try {
    console.log("=== MEMULAI SEEDING DATABASE POSYANDU ===");
    await sequelize.authenticate();

    // Reset PostgreSQL sequences to match MAX(id)
    const tables = ["kecamatan", "kelurahan", "puskesmas", "posyandu", "users", "sesi_posyandu"];
    for (const tbl of tables) {
      try {
        await sequelize.query(
          `SELECT setval(pg_get_serial_sequence('${tbl}', 'id'), COALESCE((SELECT MAX(id) FROM "${tbl}"), 1));`
        );
      } catch (e) {}
    }

    // 1. Seed Default Kecamatan & Kelurahan
    console.log("1. Seeding Kecamatan & Kelurahan...");
    let kecamatanCilodong = await Kecamatan.findOne({ where: { nama_kecamatan: "Cilodong" } });
    if (!kecamatanCilodong) {
      kecamatanCilodong = await Kecamatan.create({ nama_kecamatan: "Cilodong" });
    }

    let kelurahanSukamaju = await Kelurahan.findOne({ where: { nama_kelurahan: "Sukamaju", kecamatan_id: kecamatanCilodong.id } });
    if (!kelurahanSukamaju) {
      kelurahanSukamaju = await Kelurahan.create({ nama_kelurahan: "Sukamaju", kecamatan_id: kecamatanCilodong.id });
    }

    // 2. Seed Default Puskesmas
    console.log("2. Seeding Puskesmas...");
    let puskesmasSukamaju = await Puskesmas.findOne({ where: { kode_puskesmas: "PKM-SUKAMAJU" } });
    if (!puskesmasSukamaju) {
      puskesmasSukamaju = await Puskesmas.create({
        kode_puskesmas: "PKM-SUKAMAJU",
        nama_puskesmas: "Puskesmas Pembina Sukamaju",
        kelurahan_id: kelurahanSukamaju.id,
        alamat: "Jl. Raya Bogor KM 35, Sukamaju, Cilodong",
      });
    }

    // 3. Seed Default Posyandu
    console.log("3. Seeding Posyandu Default (Melati & Mawar)...");
    let posyanduMelati = await Posyandu.findOne({ where: { nama_posyandu: "Posyandu Melati", kelurahan_id: kelurahanSukamaju.id } });
    if (!posyanduMelati) {
      posyanduMelati = await Posyandu.create({
        nama_posyandu: "Posyandu Melati",
        kelurahan_id: kelurahanSukamaju.id,
        puskesmas_id: puskesmasSukamaju.id,
        alamat: "Balai Warga RW 04, Sukamaju",
      });
    }

    let posyanduMawar = await Posyandu.findOne({ where: { nama_posyandu: "Posyandu Mawar", kelurahan_id: kelurahanSukamaju.id } });
    if (!posyanduMawar) {
      posyanduMawar = await Posyandu.create({
        nama_posyandu: "Posyandu Mawar",
        kelurahan_id: kelurahanSukamaju.id,
        puskesmas_id: puskesmasSukamaju.id,
        alamat: "Balai RW 02, Sukamaju",
      });
    }

    // Load Data Posyandu 2026 (611 Posyandu Resmi) jika ada
    const posyanduDataPath = path.join(__dirname, "../frontend/src/data/daftarPosyandu2026.json");
    if (fs.existsSync(posyanduDataPath)) {
      console.log("3b. Seeding Data Master Posyandu 2026 (611 Posyandu)...");
      const listData = require(posyanduDataPath);
      for (const item of listData) {
        if (!item.nama) continue;

        let kec = await Kecamatan.findOne({ where: { nama_kecamatan: item.kecamatan || "Cilodong" } });
        if (!kec) {
          kec = await Kecamatan.create({ nama_kecamatan: item.kecamatan || "Cilodong" });
        }

        let kel = await Kelurahan.findOne({ where: { nama_kelurahan: item.kelurahan || "Sukamaju", kecamatan_id: kec.id } });
        if (!kel) {
          kel = await Kelurahan.create({ nama_kelurahan: item.kelurahan || "Sukamaju", kecamatan_id: kec.id });
        }

        let pkm = await Puskesmas.findOne({ where: { nama_puskesmas: item.puskesmas || "Puskesmas Pembina Sukamaju" } });
        if (!pkm) {
          pkm = await Puskesmas.create({
            kode_puskesmas: `PKM-${String(item.puskesmas || "PKM").toUpperCase().replace(/\s+/g, "-")}`,
            nama_puskesmas: item.puskesmas || "Puskesmas Pembina Sukamaju",
            kelurahan_id: kel.id,
            alamat: `Jl. Puskesmas ${item.puskesmas || ""}`,
          });
        }

        let pos = await Posyandu.findOne({ where: { nama_posyandu: item.nama, kelurahan_id: kel.id } });
        if (!pos) {
          await Posyandu.create({
            nama_posyandu: item.nama,
            kelurahan_id: kel.id,
            puskesmas_id: pkm.id,
            alamat: `Wilayah ${item.nama}, Kel. ${item.kelurahan}`,
          });
        }
      }
      console.log("   + Data Master Posyandu 2026 berhasil disemai!");
    }

    // 4. Seed Users Akun Resmi Gmail untuk semua Role (Super Admin, Dinkes Admin, Dinkes Staf, Puskesmas Admin, Puskesmas Staf, Kader)
    console.log("4. Seeding Akun Login Gmail untuk semua Role...");
    const passwordHash = await bcrypt.hash("12345678", 10);

    const defaultUsers = [
      {
        email: "superadmin@gmail.com",
        nama_lengkap: "Super Administrator Sistem",
        role: "sa",
        telepon: "088888888888",
        status: "active",
        email_verified: true,
        email_verified_at: new Date(),
      },
      {
        email: "admindinkes@gmail.com",
        nama_lengkap: "dr. H. Rahmat Hidayat, M.Kes",
        role: "dinkesAdmin",
        telepon: "081298765432",
        status: "active",
        email_verified: true,
        email_verified_at: new Date(),
      },
      {
        email: "stafdinkes@gmail.com",
        nama_lengkap: "Anisa Mayasari, SKM",
        role: "dinkes",
        telepon: "081298765433",
        status: "active",
        email_verified: true,
        email_verified_at: new Date(),
      },
      {
        email: "adminpuskesmas@gmail.com",
        nama_lengkap: "dr. Hendra Setiawan",
        role: "puskesmasAdmin",
        puskesmas_id: puskesmasSukamaju.id,
        telepon: "081387654321",
        status: "active",
        email_verified: true,
        email_verified_at: new Date(),
      },
      {
        email: "userpuskesmas@gmail.com",
        nama_lengkap: "dr. Sarah Amanda Putri",
        role: "puskesmas",
        puskesmas_id: puskesmasSukamaju.id,
        telepon: "081387654322",
        status: "active",
        email_verified: true,
        email_verified_at: new Date(),
      },
      {
        email: "kaderposyandu@gmail.com",
        nama_lengkap: "Dzakiyah Al Zahrani",
        role: "kader",
        posyandu_id: posyanduMelati.id,
        telepon: "088227683468",
        status: "active",
        email_verified: true,
        email_verified_at: new Date(),
      },
    ];

    for (const u of defaultUsers) {
      const existing = await User.findOne({ where: { email: u.email } });
      if (!existing) {
        await User.create({
          ...u,
          password_hash: passwordHash,
          token_version: 1,
        });
        console.log(`   + Created user: ${u.email} [${u.role}]`);
      } else {
        await existing.update({
          status: "active",
          email_verified: true,
          password_hash: passwordHash,
        });
        console.log(`   * Updated user: ${u.email} [${u.role}]`);
      }
    }

    console.log("=== SEEDING DATABASE SELESAI DENGAN SUKSES! ===");
    process.exit(0);
  } catch (error) {
    console.error("Gagal melakukan seeding:", error);
    process.exit(1);
  }
}

seedDatabase();
