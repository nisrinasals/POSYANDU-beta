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

  getSesiById: async (id) => {
    return await api.get(`/sesi-posyandu/${id}`);
  },

  createSesi: async (data) => {
    return await api.post("/sesi-posyandu", data);
  },

  updateSesi: async (id, data) => {
    return await api.put(`/sesi-posyandu/${id}`, data);
  },

  updateStatusSesi: async (id, statusData) => {
    return await api.patch(`/sesi-posyandu/${id}/status`, statusData);
  },
};

export default sesiService;
