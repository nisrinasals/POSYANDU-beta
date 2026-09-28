<<<<<<< HEAD
import api from "./api";

const PAGE_LIMIT = 100;

export const pemeriksaanService = {
  getPemeriksaanList: async (params = {}) => {
    return await api.get("/pemeriksaan", { params });
  },

  getAllPemeriksaan: async (params = {}) => {
    const allItems = [];
    let page = 1;
    let totalPages = 1;

    do {
      const res = await api.get("/pemeriksaan", {
        params: { ...params, page, limit: PAGE_LIMIT },
      });
      const items = Array.isArray(res?.data) ? res.data : [];
      allItems.push(...items);
      totalPages = Number(res?.pagination?.total_pages || 1);
      page += 1;
    } while (page <= totalPages);

    return { success: true, data: allItems, pagination: { total_items: allItems.length } };
  },

  getMonthlyStatistics: async () => {
    return await api.get("/pemeriksaan/statistik-bulanan");
  },

  getRekapitulasi: async (params = {}) => {
    return await api.get("/pemeriksaan/rekapitulasi", { params });
  },

  createPemeriksaan: async (data) => {
    return await api.post("/pemeriksaan", data);
  },

=======
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
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  getPemeriksaanById: async (id) => {
    return await api.get(`/pemeriksaan/${id}`);
  },

<<<<<<< HEAD
=======
  // 4. Update data pemeriksaan
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  updatePemeriksaan: async (id, data) => {
    return await api.put(`/pemeriksaan/${id}`, data);
  },

<<<<<<< HEAD
=======
  // 5. Hapus data pemeriksaan
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  deletePemeriksaan: async (id) => {
    return await api.delete(`/pemeriksaan/${id}`);
  },

<<<<<<< HEAD
  saveStep2: async (data) => {
    return await api.post("/pemeriksaan/step-2", data);
  },

=======
  // 6. Simpan Langkah 2 (Pengukuran & Penimbangan: BB, TB/PB, LiLA, LP, Tekanan Darah, dll.)
  saveStep2: async (data) => {
    return await api.post('/pemeriksaan/step-2', data);
  },

  // 7. Ambil hasil plotting Langkah 3 (KMS, Grafik Pertumbuhan WHO, IMT/U, dll.)
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  getStep3Plotting: async (id) => {
    return await api.get(`/pemeriksaan/${id}/step-3`);
  },

<<<<<<< HEAD
=======
  // 8. Simpan Langkah 4 (Skrining Kesehatan / SKILAS / Kuesioner Khusus)
  saveStep4: async (data) => {
    return await api.post('/pemeriksaan/step-4', data);
  },

  // 9. Simpan Langkah 5 (Edukasi, Pelayanan Kesehatan, & Rujukan)
  saveStep5: async (data) => {
    return await api.post('/pemeriksaan/step-5', data);
  },

  // 10. Ambil riwayat skrining tahunan warga
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  getScreeningHistory: async (id) => {
    return await api.get(`/pemeriksaan/${id}/screening-history`);
  },

<<<<<<< HEAD
  saveStep4: async (data) => {
    return await api.post("/pemeriksaan/step-4", data);
  },

  saveStep5: async (data) => {
    return await api.post("/pemeriksaan/step-5", data);
  },

  exportPemeriksaanExcel: async (params = {}) => {
    return await api.get("/pemeriksaan/export", {
      params,
      responseType: "blob",
=======
  // 11. Ekspor Rekap Pemeriksaan ke Excel
  exportPemeriksaanExcel: async (params = {}) => {
    return await api.get('/pemeriksaan/export', {
      params,
      responseType: 'blob',
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    });
  },
};

export default pemeriksaanService;
