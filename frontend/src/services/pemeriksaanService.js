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

  createPemeriksaan: async (data) => {
    return await api.post("/pemeriksaan", data);
  },

  getPemeriksaanById: async (id) => {
    return await api.get(`/pemeriksaan/${id}`);
  },

  updatePemeriksaan: async (id, data) => {
    return await api.put(`/pemeriksaan/${id}`, data);
  },

  deletePemeriksaan: async (id) => {
    return await api.delete(`/pemeriksaan/${id}`);
  },

  saveStep2: async (data) => {
    return await api.post("/pemeriksaan/step-2", data);
  },

  getStep3Plotting: async (id) => {
    return await api.get(`/pemeriksaan/${id}/step-3`);
  },

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
    });
  },
};

export default pemeriksaanService;
