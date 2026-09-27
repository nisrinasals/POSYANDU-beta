import api from './api';

export const sesiService = {
  // 1. Ambil daftar sesi / jadwal posyandu
  getSesiList: async (params = {}) => {
    return await api.get('/sesi-posyandu', { params });
  },

  // 2. Ambil detail sesi posyandu
  getSesiById: async (id) => {
    return await api.get(`/sesi-posyandu/${id}`);
  },

  // 3. Buat sesi posyandu baru
  createSesi: async (data) => {
    return await api.post('/sesi-posyandu', data);
  },

  // 4. Update data sesi posyandu
  updateSesi: async (id, data) => {
    return await api.put(`/sesi-posyandu/${id}`, data);
  },

  // 5. Update status sesi posyandu (misal: 'aktif' / 'selesai' / 'dibatalkan')
  updateStatusSesi: async (id, statusData) => {
    return await api.patch(`/sesi-posyandu/${id}/status`, statusData);
  },
};

export default sesiService;
