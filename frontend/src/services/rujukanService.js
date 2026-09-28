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

  getRujukanById: async (id) => {
    return await api.get(`/rujukan/${id}`);
  },

  exportRujukan: async (id) => {
    return await api.get(`/rujukan/${id}/export`, { responseType: "blob" });
  },
};

export default rujukanService;
