<<<<<<< HEAD
import api from "./api";

const PAGE_LIMIT = 100;

export const rujukanService = {
  getRujukanList: async (params = {}) => {
    return await api.get("/rujukan", { params });
  },

  getAllRujukan: async (params = {}) => {
    const allItems = [];
    let page = 1;
    let totalPages = 1;

    do {
      const res = await api.get("/rujukan", {
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

export const rujukanService = {
  // 1. Ambil daftar rujukan
  // params: { page, limit, search, start_date, end_date }
  getRujukanList: async (params = {}) => {
    return await api.get('/rujukan', { params });
  },

  // 2. Ambil detail rujukan berdasarkan ID
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  getRujukanById: async (id) => {
    return await api.get(`/rujukan/${id}`);
  },

<<<<<<< HEAD
  exportRujukan: async (id) => {
    return await api.get(`/rujukan/${id}/export`, { responseType: "blob" });
=======
  // 3. Export surat rujukan PDF
  exportRujukanPdf: async (id) => {
    return await api.get(`/rujukan/${id}/export`, {
      responseType: 'blob',
    });
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  },
};

export default rujukanService;
