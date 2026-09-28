require("dotenv").config();
const bcrypt = require("bcryptjs");
const {
  sequelize,
  Kecamatan,
  Kelurahan,
  Puskesmas,
  Posyandu,
  User,
  SesiPosyandu,
  Warga
} = require("./models");

async function seedDatabase() {
  try {
    console.log("=== MEMULAI SEEDING DATABASE POSYANDU ===");
    await sequelize.authenticate();

    // 1. Seed Kecamatan & Kelurahan
    console.log("1. Seeding Kecamatan & Kelurahan...");
    const [kecamatan] = await Kecamatan.findOrCreate({
      where: { nama_kecamatan: "Cilodong" },
      defaults: { nama_kecamatan: "Cilodong" }
    });

    const [kelurahan] = await Kelurahan.findOrCreate({
      where: { nama_kelurahan: "Sukamaju", kecamatan_id: kecamatan.id },
      defaults: { nama_kelurahan: "Sukamaju", kecamatan_id: kecamatan.id }
    });

    // 2. Seed Puskesmas
    console.log("2. Seeding Puskesmas...");
    const [puskesmas] = await Puskesmas.findOrCreate({
      where: { kode_puskesmas: "PKM-SUKAMAJU" },
      defaults: {
        kode_puskesmas: "PKM-SUKAMAJU",
        nama_puskesmas: "Puskesmas Pembina Sukamaju",
        kelurahan_id: kelurahan.id,
        alamat: "Jl. Raya Bogor KM 35, Sukamaju, Cilodong"
      }
    });

    // 3. Seed Posyandu
    console.log("3. Seeding Posyandu...");
    const [posyanduMelati] = await Posyandu.findOrCreate({
      where: { nama_posyandu: "Posyandu Melati", kelurahan_id: kelurahan.id },
      defaults: {
        nama_posyandu: "Posyandu Melati",
        kelurahan_id: kelurahan.id,
        puskesmas_id: puskesmas.id,
        alamat: "Balai Warga RW 04, Sukamaju"
      }
    });

    const [posyanduMawar] = await Posyandu.findOrCreate({
      where: { nama_posyandu: "Posyandu Mawar", kelurahan_id: kelurahan.id },
      defaults: {
        nama_posyandu: "Posyandu Mawar",
        kelurahan_id: kelurahan.id,
        puskesmas_id: puskesmas.id,
        alamat: "Balai RW 02, Sukamaju"
      }
    });

    // 4. Seed Users
    console.log("4. Seeding Users (Admin Dinkes, Puskesmas, & Kader)...");
    const passwordHash = await bcrypt.hash("password123", 10);

    const defaultUsers = [
      {
        email: "admin.dinkes@depok.go.id",
        nama_lengkap: "dr. H. Rahmat Hidayat, M.Kes",
        role: "dinkesAdmin",
        telepon: "081298765432",
        status: "active",
        email_verified: true,
        email_verified_at: new Date()
      },
      {
        email: "staf.dinkes@depok.go.id",
        nama_lengkap: "Anisa Mayasari, SKM",
        role: "dinkes",
        telepon: "081298765433",
        status: "active",
        email_verified: true,
        email_verified_at: new Date()
      },
      {
        email: "admin.sukamaju@pkm.go.id",
        nama_lengkap: "dr. Hendra Setiawan",
        role: "puskesmasAdmin",
        puskesmas_id: puskesmas.id,
        telepon: "081387654321",
        status: "active",
        email_verified: true,
        email_verified_at: new Date()
      },
      {
        email: "staf.sukamaju@pkm.go.id",
        nama_lengkap: "dr. Sarah Amanda Putri",
        role: "puskesmas",
        puskesmas_id: puskesmas.id,
        telepon: "081387654322",
        status: "active",
        email_verified: true,
        email_verified_at: new Date()
      },
      {
        email: "kader.melati@posyandu.org",
        nama_lengkap: "Dzakiyah Al Zahrani",
        role: "kader",
        posyandu_id: posyanduMelati.id,
        telepon: "088227683468",
        status: "active",
        email_verified: true,
        email_verified_at: new Date()
      },
      {
        email: "superadmin@posyandu.org",
        nama_lengkap: "Super Administrator Sistem",
        role: "sa",
        telepon: "088888888888",
        status: "active",
        email_verified: true,
        email_verified_at: new Date()
      }
    ];

    for (const u of defaultUsers) {
      const existing = await User.findOne({ where: { email: u.email } });
      if (!existing) {
        await User.create({
          ...u,
          password_hash: passwordHash,
          token_version: 1
        });
        console.log(`   + Created user: ${u.email} [${u.role}]`);
      } else {
        await existing.update({
          status: "active",
          email_verified: true,
          password_hash: passwordHash
        });
        console.log(`   * Updated user: ${u.email} [${u.role}]`);
      }
    }

    // 5. Seed Sesi Posyandu Hari Ini
    console.log("5. Seeding Sesi Posyandu Hari Ini...");
    const todayStr = new Date().toISOString().split("T")[0];
    const [sesiHariIni] = await SesiPosyandu.findOrCreate({
      where: {
        posyandu_id: posyanduMelati.id,
        tanggal_pelaksanaan: todayStr
      },
      defaults: {
        posyandu_id: posyanduMelati.id,
        tanggal_pelaksanaan: todayStr,
        lokasi: "Balai Warga RW 04",
        rw: "04",
        status: "open"
      }
    });
    console.log(`   + Sesi Posyandu ID: ${sesiHariIni.id} pada tanggal ${todayStr}`);

    // 6. Seed Contoh Data Sasaran (Warga)
    console.log("6. Seeding Data Sasaran Warga...");
    const sampleWarga = [
      {
        posyandu_id: posyanduMelati.id,
        nik: "3276015504240001",
        nama_lengkap: "Rayyan Al-Fatih",
        jenis_kelamin: "L",
        tanggal_lahir: "2024-04-15",
        nama_ibu: "Siti Nurhaliza",
        nama_ayah: "Ahmad Fauzi",
        alamat: "Jl. Melati RT 01 RW 04 No. 12",
        rt: "01",
        rw: "04",
        telepon: "081234567801",
        status_domisili: "aktif"
      },
      {
        posyandu_id: posyanduMelati.id,
        nik: "3276016108250002",
        nama_lengkap: "Aisyah Putri Azzahra",
        jenis_kelamin: "P",
        tanggal_lahir: "2025-08-21",
        nama_ibu: "Dewi Sartika",
        nama_ayah: "Budi Santoso",
        alamat: "Jl. Melati RT 02 RW 04 No. 05",
        rt: "02",
        rw: "04",
        telepon: "081234567802",
        status_domisili: "aktif"
      },
      {
        posyandu_id: posyanduMelati.id,
        nik: "3276015206980003",
        nama_lengkap: "Ny. Ratna Sari",
        jenis_kelamin: "P",
        tanggal_lahir: "1998-06-12",
        status_perkawinan: "menikah",
        alamat: "Jl. Melati RT 03 RW 04 No. 18",
        rt: "03",
        rw: "04",
        telepon: "081234567803",
        status_domisili: "aktif"
      },
      {
        posyandu_id: posyanduMelati.id,
        nik: "3276011403600004",
        nama_lengkap: "Bpk. Suhardi",
        jenis_kelamin: "L",
        tanggal_lahir: "1960-03-14",
        status_perkawinan: "menikah",
        alamat: "Jl. Melati RT 04 RW 04 No. 22",
        rt: "04",
        rw: "04",
        telepon: "081234567804",
        status_domisili: "aktif"
      }
    ];

    for (const w of sampleWarga) {
      const [warga] = await Warga.findOrCreate({
        where: { nik: w.nik },
        defaults: w
      });
      console.log(`   + Sasaran: ${w.nama_lengkap} (NIK: ${w.nik})`);
    }

    console.log("=== SEEDING DATABASE SELESAI DENGAN SUKSES! ===");
    process.exit(0);
  } catch (error) {
    console.error("Gagal melakukan seeding:", error);
    process.exit(1);
  }
}

seedDatabase();
