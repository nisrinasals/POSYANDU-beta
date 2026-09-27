import api from "./api";

export const posyanduService = {
  // Ambil daftar posyandu (untuk dropdown registrasi / faskes)
  getPosyanduList: async (params = {}) => {
    return await api.get("/posyandu", { params });
  },

  getAllPosyandu: async (params = {}) => {
    const allItems = [];
    let page = 1;
    let totalPages = 1;

    do {
      const res = await api.get("/posyandu", {
        params: { ...params, page, limit: 100 },
      });
      const items = Array.isArray(res?.data) ? res.data : [];
      allItems.push(...items);
      totalPages = Number(res?.pagination?.total_pages || 1);
      page += 1;
    } while (page <= totalPages);

    return { success: true, data: allItems, pagination: { total_items: allItems.length } };
  },

  // Ambil detail posyandu
  getPosyanduById: async (id) => {
    return await api.get(`/posyandu/${id}`);
  },

  // Public registration directory. No JWT is required by the frontend call.
  getPublicPosyanduList: async (params = {}) => {
    return await api.get("/public/posyandu", { params });
  },

  getPublicPuskesmasList: async (params = {}) => {
    return await api.get("/public/puskesmas", { params });
  },
};

export default posyanduService;
