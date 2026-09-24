import api from './api';

export const authService = {
  // 1. Register user
  // payload: { role, email, password, nama_lengkap, telepon, nik, puskesmas_id, posyandu_id }
  register: async (payload) => {
    return await api.post('/auth/register', payload);
  },

  // 2. Verify OTP
  // payload: { email, otp_code, purpose: 'register' | 'reset_password' }
  verifyOtp: async (payload) => {
    return await api.post('/auth/verify-otp', payload);
  },

  // 3. Resend OTP
  // payload: { email, otp_code, purpose }
  resendOtp: async (payload) => {
    return await api.post('/auth/resend-otp', payload);
  },

  // 4. Login
  // payload: { email, password }
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // Simpan token jika dikembalikan pada response
    if (response?.data?.token || response?.token) {
      const token = response?.data?.token || response?.token;
      localStorage.setItem('token', token);
    }
    return response;
  },

  // 5. Request Reset Password
  // payload: { email }
  requestResetPassword: async (email) => {
    return await api.post('/auth/request-reset-password', { email });
  },

  // 6. Reset Password
  // payload: { email, otp_code, new_password }
  resetPassword: async (payload) => {
    return await api.post('/auth/reset-password', payload);
  },

  // 7. Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

export default authService;
