<<<<<<< HEAD
import api from "./api";
=======
import api from './api';
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66

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
<<<<<<< HEAD
    return await api.post("/imunisasi", data);
=======
    return await api.post('/imunisasi', data);
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
  },

  // Update catatan imunisasi
  updateImunisasi: async (id, data) => {
    return await api.put(`/imunisasi/${id}`, data);
  },
<<<<<<< HEAD

  // Bulk upsert catatan imunisasi
  bulkUpsertImunisasi: async (wargaId, imunisasi) => {
    const response = await api.post("/imunisasi/bulk", { warga_id: wargaId, imunisasi });
    return response.data;
  },
=======
>>>>>>> 583726282333db082b82d71b2ae65f22c7b16e66
};

export default imunisasiService;
