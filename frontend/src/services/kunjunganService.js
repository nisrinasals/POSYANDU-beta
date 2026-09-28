import api from './api';

export const kunjunganService = {
  // 1. Buat kunjungan / registrasi kehadiran (Langkah 1 Pendaftaran)
  createKunjungan: async (data) => {
    return await api.post('/kunjungan', data);
  },

  // 2. Ambil daftar kunjungan
  getKunjunganList: async (params = {}) => {
    return await api.get('/kunjungan', { params });
  },

  // 3. Ambil antrean kunjungan hari ini
  getAntreanHariIni: async () => {
    return await api.get('/kunjungan/antrean-hari-ini');
  },

  // 4. Ambil detail kunjungan
  getKunjunganById: async (id) => {
    return await api.get(`/kunjungan/${id}`);
  },

  // 5. Update status langkah pelayanan (Langkah 1 -> Langkah 2 -> Langkah 3 -> Langkah 4 -> Langkah 5)
  updateStatusLangkah: async (id, data) => {
    return await api.patch(`/kunjungan/${id}/status-langkah`, data);
  },

  // 6. Batalkan / hapus kunjungan
  deleteKunjungan: async (id) => {
    return await api.delete(`/kunjungan/${id}`);
  },
};

export default kunjunganService;
