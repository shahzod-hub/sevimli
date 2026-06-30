/**
 * Supermarket Admin — API Service
 * Base URL .env dan olinadi: VITE_API_BASE_URL
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// ─── Token ───────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  refreshQueue = [];
};

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // FormData bo'lsa Content-Type ni o'chirish (browser o'zi qo'yadi)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = { ...options, headers };

  let response = await fetch(url, config);

  // Token muddati tugagan — refresh qilishga harakat
  if (response.status === 401 && getRefreshToken()) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((newToken) => {
        headers['Authorization'] = `Bearer ${newToken}`;
        return fetch(url, { ...config, headers });
      });
    }

    isRefreshing = true;

    try {
      const refreshResp = await fetch(`${BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: getRefreshToken() }),
      });

      if (!refreshResp.ok) throw new Error('Refresh failed');

      const { access } = await refreshResp.json();
      setTokens(access);
      processQueue(null, access);

      headers['Authorization'] = `Bearer ${access}`;
      response = await fetch(url, { ...config, headers });
    } catch (err) {
      processQueue(err);
      clearTokens();
      window.dispatchEvent(new Event('auth:logout'));
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  // Bo'sh javob (204 No Content)
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      Object.values(data || {})[0]?.[0] ||
      `Xatolik: ${response.status}`;
    throw new Error(message);
  }

  return data;
}

// Qisqa metodlar
const api = {
  get:    (url, opts = {})      => request(url, { method: 'GET', ...opts }),
  post:   (url, body, opts = {}) => request(url, { method: 'POST',   body: body instanceof FormData ? body : JSON.stringify(body), ...opts }),
  put:    (url, body, opts = {}) => request(url, { method: 'PUT',    body: body instanceof FormData ? body : JSON.stringify(body), ...opts }),
  patch:  (url, body, opts = {}) => request(url, { method: 'PATCH',  body: body instanceof FormData ? body : JSON.stringify(body), ...opts }),
  delete: (url, opts = {})      => request(url, { method: 'DELETE', ...opts }),
};

// ─── Query string builder ─────────────────────────────────────────────────────

function buildQuery(params = {}) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return query ? `?${query}` : '';
}

// ═════════════════════════════════════════════════════════════════════════════
// AUTH
// ═════════════════════════════════════════════════════════════════════════════

export const authApi = {
  /** Login — token olish */
  login: async (username, password) => {
    const data = await api.post('/auth/token/', { username, password });
    setTokens(data.access, data.refresh);
    return data;
  },

  /** Logout */
  logout: async () => {
    try {
      await api.post('/auth/logout/', { refresh: getRefreshToken() });
    } finally {
      clearTokens();
    }
  },

  /** Joriy foydalanuvchi */
  me: () => api.get('/auth/me/'),

  /** Parol o'zgartirish */
  changePassword: (oldPassword, newPassword) =>
    api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    }),
};

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════

export const dashboardApi = {
  /** Asosiy statistika (karta'lar uchun) */
  getStats: () => api.get('/dashboard/stats/'),

  /** Oxirgi buyurtmalar */
  getRecentOrders: (limit = 5) =>
    api.get(`/dashboard/recent-orders/${buildQuery({ limit })}`),

  /** Eng ko'p sotilgan mahsulotlar */
  getTopProducts: (limit = 10) =>
    api.get(`/dashboard/top-products/${buildQuery({ limit })}`),

  /** Daromad grafigi (kunlik/haftalik/oylik) */
  getRevenueChart: (period = 'monthly') =>
    api.get(`/dashboard/revenue/${buildQuery({ period })}`),
};

// ═════════════════════════════════════════════════════════════════════════════
// MAHSULOTLAR
// ═════════════════════════════════════════════════════════════════════════════

export const productsApi = {
  /**
   * Mahsulotlar ro'yxati
   * @param {Object} params - { page, page_size, search, category, stock_status, ordering }
   */
  getAll: (params = {}) =>
    api.get(`/products/${buildQuery(params)}`),

  /** Bitta mahsulot */
  getById: (id) => api.get(`/products/${id}/`),

  /** Yangi mahsulot qo'shish (rasm bilan) */
  create: (productData) => {
    const form = toFormData(productData);
    return api.post('/products/', form);
  },

  /** Mahsulotni yangilash */
  update: (id, productData) => {
    const form = toFormData(productData);
    return api.put(`/products/${id}/`, form);
  },

  /** Qisman yangilash (masalan faqat stock) */
  patch: (id, fields) => api.patch(`/products/${id}/`, fields),

  /** Mahsulotni o'chirish */
  delete: (id) => api.delete(`/products/${id}/`),

  /** Ko'p mahsulotni birdan o'chirish */
  bulkDelete: (ids) =>
    api.post('/products/bulk-delete/', { ids }),

  /** Zaxira qoldiqni yangilash */
  updateStock: (id, stock) =>
    api.patch(`/products/${id}/`, { stock }),

  /** Faol/nofaol holat almashtirish */
  toggleActive: (id) =>
    api.post(`/products/${id}/toggle-active/`),
};

// ═════════════════════════════════════════════════════════════════════════════
// KATEGORIYALAR
// ═════════════════════════════════════════════════════════════════════════════

export const categoriesApi = {
  getAll: (params = {}) => api.get(`/categories/${buildQuery(params)}`),
  getById: (id) => api.get(`/categories/${id}/`),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.put(`/categories/${id}/`, data),
  delete: (id) => api.delete(`/categories/${id}/`),
};

// ═════════════════════════════════════════════════════════════════════════════
// BUYURTMALAR
// ═════════════════════════════════════════════════════════════════════════════

export const ordersApi = {
  /**
   * Buyurtmalar ro'yxati
   * @param {Object} params - { page, page_size, status, search, date_from, date_to }
   */
  getAll: (params = {}) => api.get(`/orders/${buildQuery(params)}`),

  getById: (id) => api.get(`/orders/${id}/`),

  /** Holat o'zgartirish: pending → processing → shipped → delivered | cancelled */
  updateStatus: (id, status) =>
    api.patch(`/orders/${id}/`, { status }),

  /** Buyurtmani bekor qilish */
  cancel: (id, reason = '') =>
    api.post(`/orders/${id}/cancel/`, { reason }),
};

// ═════════════════════════════════════════════════════════════════════════════
// MIJOZLAR
// ═════════════════════════════════════════════════════════════════════════════

export const customersApi = {
  getAll: (params = {}) => api.get(`/customers/${buildQuery(params)}`),
  getById: (id) => api.get(`/customers/${id}/`),
  getOrders: (id, params = {}) =>
    api.get(`/customers/${id}/orders/${buildQuery(params)}`),
  block: (id) => api.post(`/customers/${id}/block/`),
  unblock: (id) => api.post(`/customers/${id}/unblock/`),
};

// ═════════════════════════════════════════════════════════════════════════════
// REKLAMA / BANNERLAR
// ═════════════════════════════════════════════════════════════════════════════

export const bannersApi = {
  getAll: () => api.get('/banners/'),
  create: (data) => {
    const form = toFormData(data);
    return api.post('/banners/', form);
  },
  update: (id, data) => {
    const form = toFormData(data);
    return api.put(`/banners/${id}/`, form);
  },
  delete: (id) => api.delete(`/banners/${id}/`),
  reorder: (orderedIds) =>
    api.post('/banners/reorder/', { ids: orderedIds }),
};

// ═════════════════════════════════════════════════════════════════════════════
// CHEGIRMALAR / KUPONLAR
// ═════════════════════════════════════════════════════════════════════════════

export const couponsApi = {
  getAll: (params = {}) => api.get(`/coupons/${buildQuery(params)}`),
  getById: (id) => api.get(`/coupons/${id}/`),
  create: (data) => api.post('/coupons/', data),
  update: (id, data) => api.put(`/coupons/${id}/`, data),
  delete: (id) => api.delete(`/coupons/${id}/`),
  validate: (code) => api.post('/coupons/validate/', { code }),
};

// ═════════════════════════════════════════════════════════════════════════════
// YETKAZIB BERISH ZONALARI
// ═════════════════════════════════════════════════════════════════════════════

export const deliveryApi = {
  getZones: () => api.get('/delivery/zones/'),
  createZone: (data) => api.post('/delivery/zones/', data),
  updateZone: (id, data) => api.put(`/delivery/zones/${id}/`, data),
  deleteZone: (id) => api.delete(`/delivery/zones/${id}/`),
};

// ═════════════════════════════════════════════════════════════════════════════
// HISOBOTLAR
// ═════════════════════════════════════════════════════════════════════════════

export const reportsApi = {
  /** Sotuvlar hisoboti */
  getSales: (params = {}) =>
    api.get(`/reports/sales/${buildQuery(params)}`),

  /** Mahsulot hisoboti */
  getProducts: (params = {}) =>
    api.get(`/reports/products/${buildQuery(params)}`),

  /** Excel eksport */
  exportExcel: async (type, params = {}) => {
    const token = getToken();
    const query = buildQuery(params);
    const response = await fetch(`${BASE_URL}/reports/export/${type}/${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Eksport xatosi');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// SOZLAMALAR
// ═════════════════════════════════════════════════════════════════════════════

export const settingsApi = {
  get: () => api.get('/settings/'),
  update: (data) => api.patch('/settings/', data),
  uploadLogo: (file) => {
    const form = new FormData();
    form.append('logo', file);
    return api.post('/settings/logo/', form);
  },
};

// ─── Helper: Object → FormData ────────────────────────────────────────────────

function toFormData(obj) {
  const form = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    // File yoki Blob bo'lsa to'g'ridan-to'g'ri
    if (value instanceof File || value instanceof Blob) {
      form.append(key, value);
    } else if (typeof value === 'object') {
      form.append(key, JSON.stringify(value));
    } else {
      form.append(key, value);
    }
  });
  return form;
}

// ─── Default export ───────────────────────────────────────────────────────────

export default {
  auth:      authApi,
  dashboard: dashboardApi,
  products:  productsApi,
  categories: categoriesApi,
  orders:    ordersApi,
  customers: customersApi,
  banners:   bannersApi,
  coupons:   couponsApi,
  delivery:  deliveryApi,
  reports:   reportsApi,
  settings:  settingsApi,
};