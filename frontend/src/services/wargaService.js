import api from './api';

export const wargaService = {
  // 1. Ambil daftar sasaran warga
  // params: { page, limit, search, kategori_sasaran, status_domisili }
  // kategori_sasaran: 'bumil' | 'busui' | 'bayi' | 'balita' | 'apras' | 'uskrem_6_14' | 'uskrem_15_18' | 'dewasa' | 'lansia'
  getWargaList: async (params = {}) => {
    return await api.get('/warga', { params });
  },

  // 2. Ambil detail sasaran berdasarkan ID
  getWargaById: async (id) => {
    return await api.get(`/warga/${id}`);
  },

  // 3. Tambah sasaran baru
  // data: { nik, nama_lengkap, jenis_kelamin, tanggal_lahir, alamat, rt, rw, telepon, status_domisili }
  createWarga: async (data) => {
    return await api.post('/warga', data);
  },

  // 4. Update data sasaran
  updateWarga: async (id, data) => {
    return await api.put(`/warga/${id}`, data);
  },

  // 5. Update status domisili (aktif, pindah, meninggal)
  updateStatusDomisili: async (id, statusDomisili) => {
    return await api.patch(`/warga/${id}/status-domisili`, { status_domisili: statusDomisili });
  },

  // 6. Ambil ringkasan statistik sasaran
  getStatistikSasaran: async () => {
    return await api.get('/warga/statistik-sasaran');
  },

  // 7. Download / Export Excel data sasaran
  exportWargaExcel: async (params = {}) => {
    return await api.get('/warga/export', {
      params,
      responseType: 'blob',
    });
  },

  // 8. Verifikasi mutasi warga
  verifyMutasi: async (data) => {
    return await api.post('/warga/mutasi/verify', data);
  },

  // 9. Konfirmasi mutasi warga
  confirmMutasi: async (data) => {
    return await api.patch('/warga/mutasi/confirm', data);
  },
};

export default wargaService;
