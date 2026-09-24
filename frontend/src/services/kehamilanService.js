import api from './api';

export const kehamilanService = {
  // Ambil profil kehamilan warga / bumil
  getKehamilanByWarga: async (wargaId) => {
    return await api.get(`/kehamilan/warga/${wargaId}`);
  },

  // Ambil detail kehamilan
  getKehamilanById: async (id) => {
    return await api.get(`/kehamilan/${id}`);
  },

  // Buat profil kehamilan baru
  createKehamilan: async (data) => {
    return await api.post('/kehamilan', data);
  },

  // Update profil kehamilan
  updateKehamilan: async (id, data) => {
    return await api.put(`/kehamilan/${id}`, data);
  },

  // Update status kehamilan (misal: melahirkan, gugur, aktif)
  updateStatusKehamilan: async (id, statusData) => {
    return await api.patch(`/kehamilan/${id}/status`, statusData);
  },
};

export default kehamilanService;
