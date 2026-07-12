import { defineStore } from "pinia";
import defaultProducts from "../data/products.js";

const API_BASE = "https://6a3c40e4e4a07f202e16a52c.mockapi.io/sevimli";
const PRODUCTS_URL = `${API_BASE}/products`;
const STORAGE_KEY = "sevimli_products";
const PRODUCT_API_TIMEOUT = 5000;
let storageSyncInitialized = false;

const normalizeProduct = (product, index = 0) => ({
  id: product.id ?? Date.now() + index,
  name: product.name || product.title || "",
  title: product.title || product.name || "",
  description: product.description || "",
  price: Number(product.price || 0),
  category: product.category || "Boshqa",
  image:
    product.image ||
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
  rating: Number(product.rating || 4.6),
  reviews: Number(product.reviews || 0),
  badge: product.badge || "",
  unit: product.unit || "dona",
  stock: Number(product.stock ?? 10),
  barcode: product.barcode || "",
  active: product.active !== false,
});

const readProducts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed.map(normalizeProduct);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return defaultProducts.map(normalizeProduct);
};

const saveProductsToStorage = (products) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

const mergeProducts = (remoteProducts, localProducts) => {
  const map = new Map();
  [...localProducts, ...remoteProducts].forEach((product, index) => {
    const normalized = normalizeProduct(product, index);
    map.set(String(normalized.id), normalized);
  });
  return [...map.values()];
};

const requestProducts = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    signal: AbortSignal.timeout(PRODUCT_API_TIMEOUT),
  });

  if (!res.ok) throw new Error(`Products endpoint responded ${res.status}`);
  return res.status === 204 ? null : res.json();
};

export const useProductStore = defineStore("products", {
  state: () => ({
    products: [],
    loaded: false,
  }),

  getters: {
    activeProducts: (state) => state.products.filter((product) => product.active !== false),
    categories: (state) => {
      const names = state.products.map((product) => product.category).filter(Boolean);
      return [...new Set(names)];
    },
  },

  actions: {
    loadProducts() {
      this.products = readProducts();
      this.loaded = true;
      this.saveProducts();
    },

    async syncProductsFromRemote() {
      try {
        const data = await requestProducts(`${PRODUCTS_URL}?sortBy=createdAt&order=desc`);
        if (!Array.isArray(data)) throw new Error("Products response is not an array");

        const merged = mergeProducts(data, this.products.length ? this.products : readProducts());
        this.products = merged;
        this.loaded = true;
        this.saveProducts();
        return { success: true, remote: true, data: merged };
      } catch (error) {
        console.warn("Remote products unavailable:", error?.message || error);
        if (!this.loaded) this.loadProducts();
        return { success: false, remote: false, data: this.products };
      }
    },

    ensureLoaded() {
      if (!this.loaded) this.loadProducts();
      this.syncProductsFromRemote();
    },

    saveProducts() {
      saveProductsToStorage(this.products);
    },

    async createProduct(payload) {
      if (!this.loaded) this.loadProducts();
      const product = normalizeProduct({
        ...payload,
        id: payload.id ?? Date.now(),
        title: payload.name,
        rating: payload.rating || 4.6,
        reviews: payload.reviews || 0,
        createdAt: payload.createdAt || new Date().toISOString(),
      });
      this.products.unshift(product);
      this.saveProducts();

      try {
        const saved = await requestProducts(PRODUCTS_URL, {
          method: "POST",
          body: JSON.stringify(product),
        });
        const remoteProduct = normalizeProduct(saved);
        this.replaceProduct(product.id, remoteProduct);
        return remoteProduct;
      } catch (error) {
        console.warn("Remote create product failed:", error?.message || error);
        return product;
      }
    },

    setProducts(products) {
      this.products = products.map(normalizeProduct);
      this.loaded = true;
      this.saveProducts();
    },

    async updateProduct(id, payload) {
      if (!this.loaded) this.loadProducts();
      const index = this.products.findIndex((product) => String(product.id) === String(id));
      if (index === -1) return null;

      const updated = normalizeProduct({
        ...this.products[index],
        ...payload,
        id: this.products[index].id,
        title: payload.name || this.products[index].title,
      });
      this.products[index] = updated;
      this.saveProducts();

      try {
        const saved = await requestProducts(`${PRODUCTS_URL}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updated),
        });
        const remoteProduct = normalizeProduct(saved);
        this.replaceProduct(id, remoteProduct);
        return remoteProduct;
      } catch (error) {
        console.warn("Remote update product failed:", error?.message || error);
      }

      return updated;
    },

    replaceProduct(oldId, payload) {
      this.ensureLoaded();
      const index = this.products.findIndex((product) => String(product.id) === String(oldId));
      if (index === -1) return null;

      const updated = normalizeProduct({
        ...this.products[index],
        ...payload,
        id: payload.id ?? this.products[index].id,
        title: payload.name || this.products[index].title,
      });
      this.products[index] = updated;
      this.saveProducts();
      return updated;
    },

    async deleteProduct(id) {
      if (!this.loaded) this.loadProducts();
      this.products = this.products.filter((product) => String(product.id) !== String(id));
      this.saveProducts();

      try {
        await requestProducts(`${PRODUCTS_URL}/${id}`, { method: "DELETE" });
      } catch (error) {
        console.warn("Remote delete product failed:", error?.message || error);
      }
    },

    async importDefaultProducts() {
      if (!this.loaded) this.loadProducts();
      const existingNames = new Set(this.products.map((product) => product.name.toLowerCase()));
      const incoming = defaultProducts
        .map(normalizeProduct)
        .filter((product) => !existingNames.has(product.name.toLowerCase()));

      for (const product of incoming) {
        await this.createProduct(product);
      }

      return incoming.length;
    },

    resetProducts() {
      this.products = defaultProducts.map(normalizeProduct);
      this.loaded = true;
      this.saveProducts();
    },

    initStorageSync() {
      if (storageSyncInitialized || typeof window === 'undefined') return;
      storageSyncInitialized = true;

      window.addEventListener('storage', (event) => {
        if (event.key !== STORAGE_KEY) return;
        this.products = readProducts();
        this.loaded = true;
      });
    },
  },
});
