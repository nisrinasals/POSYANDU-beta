import api from './api';

export const rujukanService = {
  // 1. Ambil daftar rujukan
  // params: { page, limit, search, start_date, end_date }
  getRujukanList: async (params = {}) => {
    return await api.get('/rujukan', { params });
  },

  // 2. Ambil detail rujukan berdasarkan ID
  getRujukanById: async (id) => {
    return await api.get(`/rujukan/${id}`);
  },

  // 3. Export surat rujukan PDF
  exportRujukanPdf: async (id) => {
    return await api.get(`/rujukan/${id}/export`, {
      responseType: 'blob',
    });
  },
};

export default rujukanService;
