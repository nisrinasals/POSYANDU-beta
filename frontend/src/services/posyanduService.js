import api from './api';

export const posyanduService = {
  // Ambil daftar posyandu (untuk dropdown registrasi / faskes)
  getPosyanduList: async (params = {}) => {
    return await api.get('/posyandu', { params });
  },

  // Ambil detail posyandu
  getPosyanduById: async (id) => {
    return await api.get(`/posyandu/${id}`);
  },
};

export default posyanduService;
