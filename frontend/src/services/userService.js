import api from "./api";

export const userService = {
  // 1. Ambil profil user yang sedang login
  getMe: async () => {
    return await api.get("/users/me");
  },

  // 2. Update profil user yang sedang login
  updateMe: async (data) => {
    return await api.patch("/users/me", data);
  },

  // 3. Upload foto profil
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append("profile_picture", file);
    return await api.post("/users/me/profile-picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // 4. Ambil daftar semua user (untuk Dinkes/Puskesmas Admin)
  getUsersList: async (params = {}) => {
    return await api.get("/users", { params });
  },

  // Ambil seluruh user dengan pagination backend.
  getAllUsers: async (params = {}) => {
    const allItems = [];
    let page = 1;
    let totalPages = 1;
    do {
      const res = await api.get("/users", { params: { ...params, page, limit: 100 } });
      const items = Array.isArray(res?.data) ? res.data : [];
      allItems.push(...items);
      totalPages = Number(res?.pagination?.total_pages || 1);
      page += 1;
    } while (page <= totalPages);
    return { success: true, data: allItems, pagination: { total_items: allItems.length } };
  },

  // 5. Ambil detail user berdasarkan ID
  getUserById: async (id) => {
    return await api.get(`/users/${id}`);
  },

  // 6. Verifikasi akun user / kader
  verifyUser: async (id) => {
    return await api.patch(`/users/${id}/verify`);
  },

  // 7. Nonaktifkan akun user
  deactivateUser: async (id) => {
    return await api.patch(`/users/${id}/deactivate`);
  },

  // 8. Ubah role user
  changeUserRole: async (id, roleData) => {
    return await api.patch(`/users/${id}/role`, roleData);
  },

  // 9. Ubah status user
  changeUserStatus: async (id, statusData) => {
    return await api.patch(`/users/${id}/status`, statusData);
  },

  setUserStatus: async (id, status) => {
    return await api.patch(`/users/${id}/status`, { status });
  },

  // 10. Ganti Admin Puskesmas
  replacePuskesmasAdmin: async (id) => {
    return await api.put(`/users/${id}/puskesmas-admin`);
  },

  // 11. Ganti Admin Dinkes
  replaceDinkesAdmin: async (id) => {
    return await api.put(`/users/${id}/dinkes-admin`);
  },
};

export default userService;
