<<<<<<< HEAD
import api from "./api";
=======
import api from './api';
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

export const wargaService = {
  // 1. Ambil daftar sasaran warga
  // params: { page, limit, search, kategori_sasaran, status_domisili }
  // kategori_sasaran: 'bumil' | 'busui' | 'bayi' | 'balita' | 'apras' | 'uskrem_6_14' | 'uskrem_15_18' | 'dewasa' | 'lansia'
<<<<<<< HEAD
  getAllWarga: async (params = {}) => {
    const limit = 100;
    let page = 1;
    let allItems = [];
    let totalPages = 1;

    do {
      const res = await api.get("/warga", {
        params: {
          ...params,
          page,
          limit,
        },
      });

      const items = Array.isArray(res?.data) ? res.data : [];

      allItems = [...allItems, ...items];

      totalPages = Number(res?.pagination?.total_pages || 1);

      page += 1;
    } while (page <= totalPages);

    return {
      success: true,
      data: allItems,
      pagination: {
        total_items: allItems.length,
        total_pages: 1,
        current_page: 1,
        items_per_page: allItems.length,
      },
    };
  },

  // Alias untuk kode lama; tetap menggunakan endpoint backend yang sama.
  getWargaList: async (params = {}) => {
    return await wargaService.getAllWarga(params);
=======
  getWargaList: async (params = {}) => {
    return await api.get('/warga', { params });
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  },

  // 2. Ambil detail sasaran berdasarkan ID
  getWargaById: async (id) => {
    return await api.get(`/warga/${id}`);
  },

  // 3. Tambah sasaran baru
  // data: { nik, nama_lengkap, jenis_kelamin, tanggal_lahir, alamat, rt, rw, telepon, status_domisili }
  createWarga: async (data) => {
<<<<<<< HEAD
    return await api.post("/warga", data);
=======
    return await api.post('/warga', data);
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
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
<<<<<<< HEAD
    return await api.get("/warga/statistik-sasaran");
=======
    return await api.get('/warga/statistik-sasaran');
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  },

  // 7. Download / Export Excel data sasaran
  exportWargaExcel: async (params = {}) => {
<<<<<<< HEAD
    return await api.get("/warga/export", {
      params,
      responseType: "blob",
=======
    return await api.get('/warga/export', {
      params,
      responseType: 'blob',
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
    });
  },

  // 8. Verifikasi mutasi warga
  verifyMutasi: async (data) => {
<<<<<<< HEAD
    return await api.post("/warga/mutasi/verify", data);
=======
    return await api.post('/warga/mutasi/verify', data);
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  },

  // 9. Konfirmasi mutasi warga
  confirmMutasi: async (data) => {
<<<<<<< HEAD
    return await api.patch("/warga/mutasi/confirm", data);
=======
    return await api.patch('/warga/mutasi/confirm', data);
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  },
};

export default wargaService;
