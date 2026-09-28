<<<<<<< HEAD
import api from "./api";

const PAGE_LIMIT = 100;

export const sesiService = {
  getSesiList: async (params = {}) => {
    return await api.get("/sesi-posyandu", { params });
  },

  getAllSesi: async (params = {}) => {
    const allItems = [];
    let page = 1;
    let totalPages = 1;

    do {
      const res = await api.get("/sesi-posyandu", {
        params: { ...params, page, limit: PAGE_LIMIT },
      });
      const items = Array.isArray(res?.data) ? res.data : [];
      allItems.push(...items);
      totalPages = Number(res?.pagination?.total_pages || 1);
      page += 1;
    } while (page <= totalPages);

    return { success: true, data: allItems, pagination: { total_items: allItems.length } };
  },

=======
import api from './api';

export const sesiService = {
  // 1. Ambil daftar sesi / jadwal posyandu
  getSesiList: async (params = {}) => {
    return await api.get('/sesi-posyandu', { params });
  },

  // 2. Ambil detail sesi posyandu
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  getSesiById: async (id) => {
    return await api.get(`/sesi-posyandu/${id}`);
  },

<<<<<<< HEAD
  createSesi: async (data) => {
    return await api.post("/sesi-posyandu", data);
  },

=======
  // 3. Buat sesi posyandu baru
  createSesi: async (data) => {
    return await api.post('/sesi-posyandu', data);
  },

  // 4. Update data sesi posyandu
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  updateSesi: async (id, data) => {
    return await api.put(`/sesi-posyandu/${id}`, data);
  },

<<<<<<< HEAD
=======
  // 5. Update status sesi posyandu (misal: 'aktif' / 'selesai' / 'dibatalkan')
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  updateStatusSesi: async (id, statusData) => {
    return await api.patch(`/sesi-posyandu/${id}/status`, statusData);
  },
};

export default sesiService;
