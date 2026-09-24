import api from './api';

export const imunisasiService = {
  // Ambil riwayat imunisasi warga
  getImunisasiByWarga: async (wargaId) => {
    return await api.get(`/imunisasi/warga/${wargaId}`);
  },

  // Ambil detail catatan imunisasi
  getImunisasiById: async (id) => {
    return await api.get(`/imunisasi/${id}`);
  },

  // Buat catatan imunisasi baru
  createImunisasi: async (data) => {
    return await api.post('/imunisasi', data);
  },

  // Update catatan imunisasi
  updateImunisasi: async (id, data) => {
    return await api.put(`/imunisasi/${id}`, data);
  },
};

export default imunisasiService;
