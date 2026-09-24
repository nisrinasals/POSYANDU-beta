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
