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
  AuditLog,
} = require("./models");

async function seedDatabase() {
  try {
    console.log("=== MEMULAI SEEDING DATABASE POSYANDU ILP RESMI KOTA YOGYAKARTA ===");
    await sequelize.authenticate();

    // 1. Reset PostgreSQL sequences to match MAX(id)
    const tables = ["kecamatan", "kelurahan", "puskesmas", "posyandu", "users", "sesi_posyandu"];
    for (const tbl of tables) {
      try {
        await sequelize.query(
          `SELECT setval(pg_get_serial_sequence('${tbl}', 'id'), COALESCE((SELECT MAX(id) FROM "${tbl}"), 1));`
        );
      } catch (e) {}
    }

    // 2. Bersihkan Data Dummy (jika ada)
    console.log("1. Membersihkan data dummy (Cilodong, Sukamaju, Puskesmas Demo)...");
    const dummyEmails = [
      "kader@posyandu.test",
      "kader@gmail.com",
      "admin.pkm.sukamaju@gmail.com",
      "staf.pkm.sukamaju@gmail.com",
      "kader.posyandu.melati@gmail.com",
      "salsadilla4455@gmail.com",
      "kaderposyandu@gmail.com",
      "puskemas@gmail.com",
      "puskesmas.test@jogjakota.go.id",
      "admin@dinkes.jogjakota.go.id",
      "superadmin@posyandu.jogjakota.go.id",
      "superadmin@posyandu.org",
      "superadmin.posyandu@gmail.com",
      "kader1@gmail.com",
      "kadersatu@gmail.com",
    ];
    const dummyUsers = await User.findAll({ where: { email: dummyEmails } });
    if (dummyUsers.length > 0) {
      const dummyIds = dummyUsers.map((u) => u.id);
      await AuditLog.update({ user_id: null }, { where: { user_id: dummyIds } });
      await User.destroy({ where: { id: dummyIds } });
    }
    await Posyandu.destroy({ where: { id: [1, 2, 3] } }).catch(() => {});
    await Puskesmas.destroy({ where: { id: [1, 2] } }).catch(() => {});
    await Kelurahan.destroy({ where: { nama_kelurahan: "Sukamaju" } }).catch(() => {});
    await Kecamatan.destroy({ where: { nama_kecamatan: ["Kecamatan Demo", "Cilodong"] } }).catch(() => {});

    // 3. Load Data Posyandu Resmi 2026 Kota Yogyakarta
    const posyanduDataPath = path.join(__dirname, "../frontend/src/data/daftarPosyandu2026.json");
    if (fs.existsSync(posyanduDataPath)) {
      console.log("2. Memverifikasi & Menyemai Data Master Posyandu 2026...");
      const listData = require(posyanduDataPath);
      for (const item of listData) {
        if (!item.nama || !item.kecamatan || !item.kelurahan || !item.puskesmas) continue;

        let [kec] = await Kecamatan.findOrCreate({
          where: { nama_kecamatan: item.kecamatan },
          defaults: { nama_kecamatan: item.kecamatan },
        });

        let [kel] = await Kelurahan.findOrCreate({
          where: { nama_kelurahan: item.kelurahan, kecamatan_id: kec.id },
          defaults: { nama_kelurahan: item.kelurahan, kecamatan_id: kec.id },
        });

        let [pkm] = await Puskesmas.findOrCreate({
          where: { nama_puskesmas: item.puskesmas },
          defaults: {
            kode_puskesmas: `PKM-${String(item.puskesmas).toUpperCase().replace(/\s+/g, "-")}`,
            nama_puskesmas: item.puskesmas,
            kelurahan_id: kel.id,
            alamat: `Jl. Puskesmas ${item.puskesmas}`,
          },
        });

        let pos = await Posyandu.findOne({
          where: { nama_posyandu: item.nama, kelurahan_id: kel.id },
        });
        if (!pos) {
          await Posyandu.create({
            nama_posyandu: item.nama,
            kelurahan_id: kel.id,
            puskesmas_id: pkm.id,
            alamat: `Wilayah ${item.nama}, Kel. ${item.kelurahan}`,
          });
        }
      }
      console.log("   + Master Data Wilayah resmi siap.");
    }

    // 4. Helper Slug Puskesmas
    const getPuskesmasSlug = (nama) => {
      return nama
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "")
        .replace(/i+$/, (match) => {
          if (match === "ii") return "2";
          if (match === "i") return "1";
          return match;
        });
    };

    // 5. Seed Akun Super Admin
    console.log("3. Seeding Akun Super Admin...");
    const saEmail = "superadmin@gmail.com";
    const saPassword = "superadmin";
    const saHash = await bcrypt.hash(saPassword, 10);
    const existingSA = await User.findOne({ where: { email: saEmail } });
    if (!existingSA) {
      await User.create({
        email: saEmail,
        password_hash: saHash,
        nama_lengkap: "Super Administrator Sistem",
        role: "sa",
        status: "active",
        email_verified: true,
        email_verified_at: new Date(),
        token_version: 1,
      });
      console.log(`   + Created: ${saEmail} (Password: ${saPassword})`);
    } else {
      await existingSA.update({
        password_hash: saHash,
        status: "active",
        email_verified: true,
      });
      console.log(`   * Updated: ${saEmail} (Password: ${saPassword})`);
    }

    // 6. Seed Akun Dinkes
    console.log("4. Seeding Akun Dinas Kesehatan...");
    const dinkesUsers = [
      {
        email: "admindinkes@gmail.com",
        password: "admindinkes",
        nama_lengkap: "Admin Dinas Kesehatan Kota Yogyakarta",
        role: "dinkesAdmin",
      },
      {
        email: "stafdinkes@gmail.com",
        password: "stafdinkes",
        nama_lengkap: "Staf Dinas Kesehatan Kota Yogyakarta",
        role: "dinkes",
      },
    ];
    for (const d of dinkesUsers) {
      const hash = await bcrypt.hash(d.password, 10);
      const existing = await User.findOne({ where: { email: d.email } });
      if (!existing) {
        await User.create({
          email: d.email,
          password_hash: hash,
          nama_lengkap: d.nama_lengkap,
          role: d.role,
          status: "active",
          email_verified: true,
          email_verified_at: new Date(),
          token_version: 1,
        });
        console.log(`   + Created: ${d.email} (Password: ${d.password})`);
      } else {
        await existing.update({
          password_hash: hash,
          nama_lengkap: d.nama_lengkap,
          role: d.role,
          status: "active",
          email_verified: true,
        });
        console.log(`   * Updated: ${d.email} (Password: ${d.password})`);
      }
    }

    // 7. Seed Akun 18 Puskesmas Resmi
    console.log("5. Seeding Akun 18 Puskesmas Resmi Kota Yogyakarta...");
    const pkmRealList = await Puskesmas.findAll({ order: [["id", "ASC"]] });
    for (const pkm of pkmRealList) {
      const slug = getPuskesmasSlug(pkm.nama_puskesmas);
      const email = `${slug}@gmail.com`;
      const oldEmail = `puskesmas.${slug}@gmail.com`;
      const password = slug;
      const hash = await bcrypt.hash(password, 10);
      const nama = `Admin Puskesmas ${pkm.nama_puskesmas}`;

      let existing = await User.findOne({ where: { email: [email, oldEmail] } });
      if (!existing) {
        await User.create({
          email,
          password_hash: hash,
          nama_lengkap: nama,
          role: "puskesmasAdmin",
          puskesmas_id: pkm.id,
          status: "active",
          email_verified: true,
          email_verified_at: new Date(),
          token_version: 1,
        });
        console.log(`   + Created: ${email} [${pkm.nama_puskesmas}] (Password: ${password})`);
      } else {
        await existing.update({
          email,
          password_hash: hash,
          nama_lengkap: nama,
          role: "puskesmasAdmin",
          puskesmas_id: pkm.id,
          status: "active",
          email_verified: true,
        });
        console.log(`   * Updated: ${email} [${pkm.nama_puskesmas}] (Password: ${password})`);
      }
    }

    // 8. Seed Fallback Puskesmas & Kader
    console.log("6. Seeding Fallback Puskesmas & Kader...");
    const gedongtengenPkm = pkmRealList.find((p) => p.nama_puskesmas.toLowerCase().includes("gedong"));
    const fallbackList = [
      { email: "adminpuskesmas@gmail.com", password: "adminpuskesmas", pkmId: gedongtengenPkm?.id },
      { email: "userpuskesmas@gmail.com", password: "userpuskesmas", pkmId: gedongtengenPkm?.id },
      { email: "kaderadas@gmail.com", password: "kaderadas" },
      { email: "kaderdua@gmail.com", password: "kaderdua" },
    ];
    for (const f of fallbackList) {
      const existing = await User.findOne({ where: { email: f.email } });
      if (existing) {
        const hash = await bcrypt.hash(f.password, 10);
        await existing.update({
          password_hash: hash,
          ...(f.pkmId ? { puskesmas_id: f.pkmId } : {}),
          status: "active",
          email_verified: true,
        });
        console.log(`   * Updated: ${f.email} (Password: ${f.password})`);
      }
    }

    console.log("\n=== SEEDING BERHASIL DENGAN SUKSES! ===");
    process.exit(0);
  } catch (error) {
    console.error("Gagal melakukan seeding:", error);
    process.exit(1);
  }
}

seedDatabase();
