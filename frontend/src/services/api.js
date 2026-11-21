import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // تأكد من المنفذ الصحيح
});

// إضافة التوكن تلقائياً للـ Headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // أو اسم المفتاح المحفوظ لديك
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;