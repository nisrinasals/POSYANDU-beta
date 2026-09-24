import api from './api';

export const pemeriksaanService = {
  // 1. Ambil list data pemeriksaan
  // params: { page, limit, search, kategori_sasaran, start_date, end_date }
  getPemeriksaanList: async (params = {}) => {
    return await api.get('/pemeriksaan', { params });
  },

  // 2. Buat pemeriksaan baru (penuh)
  createPemeriksaan: async (data) => {
    return await api.post('/pemeriksaan', data);
  },

  // 3. Ambil detail pemeriksaan berdasarkan ID
  getPemeriksaanById: async (id) => {
    return await api.get(`/pemeriksaan/${id}`);
  },

  // 4. Update data pemeriksaan
  updatePemeriksaan: async (id, data) => {
    return await api.put(`/pemeriksaan/${id}`, data);
  },

  // 5. Hapus data pemeriksaan
  deletePemeriksaan: async (id) => {
    return await api.delete(`/pemeriksaan/${id}`);
  },

  // 6. Simpan Langkah 2 (Pengukuran & Penimbangan: BB, TB/PB, LiLA, LP, Tekanan Darah, dll.)
  saveStep2: async (data) => {
    return await api.post('/pemeriksaan/step-2', data);
  },

  // 7. Ambil hasil plotting Langkah 3 (KMS, Grafik Pertumbuhan WHO, IMT/U, dll.)
  getStep3Plotting: async (id) => {
    return await api.get(`/pemeriksaan/${id}/step-3`);
  },

  // 8. Simpan Langkah 4 (Skrining Kesehatan / SKILAS / Kuesioner Khusus)
  saveStep4: async (data) => {
    return await api.post('/pemeriksaan/step-4', data);
  },

  // 9. Simpan Langkah 5 (Edukasi, Pelayanan Kesehatan, & Rujukan)
  saveStep5: async (data) => {
    return await api.post('/pemeriksaan/step-5', data);
  },

  // 10. Ekspor Rekap Pemeriksaan ke Excel
  exportPemeriksaanExcel: async (params = {}) => {
    return await api.get('/pemeriksaan/export', {
      params,
      responseType: 'blob',
    });
  },
};

export default pemeriksaanService;
