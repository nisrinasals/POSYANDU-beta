/**
 * Kumpulan fungsi validasi data Posyandu ILP
 */

// 1. Validasi NIK (Harus tepat 16 digit angka)
export const validateNik = (nik) => {
  if (!nik) return { isValid: false, message: 'NIK wajib diisi.' };
  const cleanNik = String(nik).trim().replace(/\D/g, '');
  if (cleanNik.length !== 16) {
    return { isValid: false, message: `NIK harus tepat 16 digit angka. (Saat ini: ${cleanNik.length} digit)` };
  }
  return { isValid: true, cleanValue: cleanNik };
};

// 2. Format input NIK (hanya angka, maks 16 digit)
export const formatNikInput = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '').slice(0, 16);
};

// 3. Validasi Nomor Telepon / WA (10 - 15 digit angka)
export const validatePhone = (phone) => {
  if (!phone) return { isValid: true, cleanValue: '' }; // opsional jika kosong
  const cleanPhone = String(phone).trim().replace(/\D/g, '');
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return { isValid: false, message: 'Nomor telepon harus antara 10 hingga 15 digit angka.' };
  }
  return { isValid: true, cleanValue: cleanPhone };
};

// 4. Format input Telepon (hanya angka, maks 15 digit)
export const formatPhoneInput = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '').slice(0, 15);
};

// 5. Validasi Tanggal Lahir (tidak boleh di masa depan)
export const validateBirthDate = (dateStr) => {
  if (!dateStr) return { isValid: false, message: 'Tanggal lahir wajib diisi.' };
  const selectedDate = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (selectedDate > today) {
    return { isValid: false, message: 'Tanggal lahir tidak boleh di masa depan.' };
  }
  return { isValid: true };
};

// 6. Validasi Email
export const validateEmail = (email) => {
  if (!email) return { isValid: false, message: 'Alamat email wajib diisi.' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email).trim())) {
    return { isValid: false, message: 'Format alamat email tidak valid.' };
  }
  return { isValid: true };
};

// 7. Validasi Password
export const validatePassword = (password, confirmPassword = null) => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Kata sandi minimal 8 karakter.' };
  }
  if (confirmPassword !== null && password !== confirmPassword) {
    return { isValid: false, message: 'Konfirmasi kata sandi tidak cocok.' };
  }
  return { isValid: true };
};

// 8. Validasi Pengukuran Fisik (BB, TB, LiLA)
export const validateMeasurements = ({ bb, tb, lila, sistol, diastol }) => {
  const errors = [];

  if (bb !== undefined && bb !== '' && bb !== null) {
    const numBb = parseFloat(bb);
    if (isNaN(numBb) || numBb < 0.5 || numBb > 300) {
      errors.push('Berat Badan (BB) harus bernilai antara 0.5 - 300 kg.');
    }
  }

  if (tb !== undefined && tb !== '' && tb !== null) {
    const numTb = parseFloat(tb);
    if (isNaN(numTb) || numTb < 20 || numTb > 250) {
      errors.push('Tinggi/Panjang Badan (TB/PB) harus bernilai antara 20 - 250 cm.');
    }
  }

  if (lila !== undefined && lila !== '' && lila !== null) {
    const numLila = parseFloat(lila);
    if (isNaN(numLila) || numLila < 5 || numLila > 60) {
      errors.push('Lingkar Lengan (LiLA) harus bernilai antara 5 - 60 cm.');
    }
  }

  if (sistol && diastol) {
    const numSis = parseInt(sistol, 10);
    const numDia = parseInt(diastol, 10);
    if (numSis <= numDia) {
      errors.push('Tekanan Sistol harus lebih besar dari Diastol.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    message: errors[0] || '',
    errorMessage: errors.join('\n')
  };
};

// 9. Validasi Kesesuaian Usia / Tanggal Lahir terhadap Klaster Kategori ILP
export const validateCategoryAge = (kategoriId, birthDateStr, gender = 'L') => {
  if (!birthDateStr) return { isValid: false, message: 'Tanggal lahir wajib diisi.' };
  
  const birth = new Date(birthDateStr);
  const now = new Date();
  if (isNaN(birth.getTime())) return { isValid: false, message: 'Format tanggal lahir tidak valid.' };
  if (birth > now) return { isValid: false, message: 'Tanggal lahir tidak boleh di masa depan.' };

  // Hitung usia dalam tahun dan total bulan
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());

  // Tentukan kategori aktual berdasarkan usia
  let actualCategory = '';
  if (totalMonths < 12) {
    actualCategory = 'Bayi 0–11 Bln';
  } else if (totalMonths < 60) {
    actualCategory = 'Balita 12–59 Bln';
  } else if (totalMonths <= 72) {
    actualCategory = 'Apras 60–72 Bln';
  } else if (years >= 6 && years <= 14) {
    actualCategory = 'Usekrem 6–14 Thn';
  } else if (years >= 15 && years <= 18) {
    actualCategory = 'Usekrem 15–18 Thn';
  } else if (years >= 19 && years <= 59) {
    actualCategory = 'Dewasa';
  } else {
    actualCategory = 'Lansia';
  }

  const ageDisplay = years > 0 ? `${years} Tahun` : `${Math.max(0, totalMonths)} Bulan`;
  const kat = String(kategoriId || '').toLowerCase().replace(/[–—]/g, '-').trim();

  if (kat === 'bayi-0-11' || kat.includes('bayi')) {
    if (totalMonths >= 12) {
      return {
        isValid: false,
        message: `Tanggal lahir yang dimasukkan menghasilkan usia ${ageDisplay} (tergolong kategori "${actualCategory}"). Klaster "Bayi 0–11 Bln" hanya untuk usia 0 hingga 11 bulan. Silakan pilih klaster yang sesuai.`
      };
    }
  } else if (kat === 'balita-12-59' || kat.includes('balita')) {
    if (totalMonths < 12 || totalMonths >= 60) {
      return {
        isValid: false,
        message: `Tanggal lahir yang dimasukkan menghasilkan usia ${ageDisplay} (tergolong kategori "${actualCategory}"). Klaster "Balita 12–59 Bln" hanya untuk usia 12 hingga 59 bulan (1–4 tahun). Silakan pilih klaster yang sesuai.`
      };
    }
  } else if (kat === 'apras-60-72' || kat.includes('apras')) {
    if (totalMonths < 60 || totalMonths > 72) {
      return {
        isValid: false,
        message: `Tanggal lahir yang dimasukkan menghasilkan usia ${ageDisplay} (tergolong kategori "${actualCategory}"). Klaster "Apras 60–72 Bln" hanya untuk anak usia 60 hingga 72 bulan (5–6 tahun). Silakan pilih klaster yang sesuai.`
      };
    }
  } else if (kat === 'usekrem-6-14' || kat.includes('6-14') || kat.includes('sekolah')) {
    if (years < 6 || years > 14 || (years === 6 && totalMonths < 72)) {
      return {
        isValid: false,
        message: `Tanggal lahir yang dimasukkan menghasilkan usia ${ageDisplay} (tergolong kategori "${actualCategory}"). Klaster "Usekrem 6–14 Thn" hanya untuk usia 6 hingga 14 tahun. Silakan pilih klaster yang sesuai.`
      };
    }
  } else if (kat === 'usekrem-15-18' || kat.includes('15-18') || kat.includes('remaja')) {
    if (years < 15 || years > 18) {
      return {
        isValid: false,
        message: `Tanggal lahir yang dimasukkan menghasilkan usia ${ageDisplay} (tergolong kategori "${actualCategory}"). Klaster "Usekrem 15–18 Thn" hanya untuk usia 15 hingga 18 tahun. Silakan pilih klaster yang sesuai.`
      };
    }
  } else if (kat === 'dewasa') {
    if (years < 19 || years > 59) {
      return {
        isValid: false,
        message: `Tanggal lahir yang dimasukkan menghasilkan usia ${ageDisplay} (tergolong kategori "${actualCategory}"). Klaster "Dewasa" hanya untuk usia produktif 19 hingga 59 tahun. Silakan pilih klaster yang sesuai.`
      };
    }
  } else if (kat === 'lansia') {
    if (years < 60) {
      return {
        isValid: false,
        message: `Tanggal lahir yang dimasukkan menghasilkan usia ${ageDisplay} (tergolong kategori "${actualCategory}"). Klaster "Lansia" hanya untuk usia 60 tahun ke atas. Silakan pilih klaster yang sesuai.`
      };
    }
  } else if (kat === 'bumil' || kat === 'nifas') {
    if (gender === 'L' || gender === 'Laki-laki') {
      return {
        isValid: false,
        message: `Klaster "${kat === 'bumil' ? 'Ibu Hamil' : 'Nifas/Menyusui'}" wajib berjenis kelamin Perempuan.`
      };
    }
    if (years < 10 || years > 60) {
      return {
        isValid: false,
        message: `Tanggal lahir yang dimasukkan menghasilkan usia ${ageDisplay}. Klaster "${kat === 'bumil' ? 'Ibu Hamil' : 'Nifas/Menyusui'}" diperuntukkan untuk usia reproduktif wanita (10–60 tahun).`
      };
    }
  }

  return { isValid: true, actualCategory, ageDisplay };
};
