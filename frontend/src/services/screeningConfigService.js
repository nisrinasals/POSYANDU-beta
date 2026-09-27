import api from "./api";

export const screeningConfigService = {
  getScreeningConfig: async () => {
    return await api.get("/screening-config");
  },

  updateScreeningConfig: async (id, data) => {
    return await api.put(`/screening-config/${id}`, data);
  },
};

export default screeningConfigService;
