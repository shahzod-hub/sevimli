import { defineStore } from "pinia";
import defaultProducts from "../data/products.js";

const API_BASE = "https://6a3c40e4e4a07f202e16a52c.mockapi.io/sevimli";
const PRODUCTS_URL = `${API_BASE}/cart`;
const STORAGE_KEY = "sevimli_products";
const PRODUCT_API_TIMEOUT = 5000;
let storageSyncInitialized = false;

const normalizeProduct = (product, index = 0) => {
  const isRemote = product.recordType === "product" || product.entityType === "product";
  return {
    id: product.id ?? Date.now() + index,
    remoteId: product.remoteId || (isRemote ? product.id : null),
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
    recordType: product.recordType || product.entityType || "",
    createdAt: product.createdAt || "",
  };
};

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
  const mapByName = new Map();
  localProducts.forEach((product) => {
    const norm = normalizeProduct(product);
    mapByName.set(norm.name.toLowerCase().trim(), norm);
  });

  remoteProducts.forEach((remoteProduct) => {
    const normRemote = normalizeProduct(remoteProduct);
    const key = normRemote.name.toLowerCase().trim();
    const existing = mapByName.get(key);
    
    if (existing) {
      mapByName.set(key, {
        ...existing,
        ...normRemote,
        id: existing.id,
        remoteId: remoteProduct.id,
      });
    } else {
      mapByName.set(key, {
        ...normRemote,
        remoteId: remoteProduct.id,
      });
    }
  });

  return [...mapByName.values()];
};

const isRemoteProduct = (item) =>
  item?.recordType === "product" || item?.entityType === "product";

const requestProducts = async (url, options = {}) => {
  const headers = { ...options.headers };
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
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
        const data = await requestProducts(`${PRODUCTS_URL}?recordType=product&sortBy=createdAt&order=desc`);
        if (!Array.isArray(data)) throw new Error("Products response is not an array");

        const remoteProducts = data.filter(isRemoteProduct);
        const merged = mergeProducts(remoteProducts, this.products.length ? this.products : readProducts());
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
    },

    saveProducts() {
      saveProductsToStorage(this.products);
    },

    async createProduct(payload) {
      const product = normalizeProduct({
        ...payload,
        id: payload.id ?? Date.now(),
        recordType: "product",
        title: payload.name,
        rating: payload.rating || 4.6,
        reviews: payload.reviews || 0,
        createdAt: payload.createdAt || new Date().toISOString(),
      });

      try {
        const saved = await requestProducts(PRODUCTS_URL, {
          method: "POST",
          body: JSON.stringify({ ...product, recordType: "product", entityType: "product" }),
        });
        const remoteProduct = normalizeProduct(saved);
        const normalizedRemote = { ...remoteProduct, id: product.id, remoteId: saved.id };
        this.products = [
          normalizedRemote,
          ...this.products.filter((item) => String(item.id) !== String(product.id)),
        ];
        this.loaded = true;
        this.saveProducts();
        return normalizedRemote;
      } catch (error) {
        console.warn("Remote create product failed:", error?.message || error);
        throw new Error("Mahsulot MockAPI'ga saqlanmadi. MockAPI'da cart resource borligini tekshiring.");
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

      const product = this.products[index];
      const updated = normalizeProduct({
        ...product,
        ...payload,
        id: product.id,
        remoteId: product.remoteId,
        title: payload.name || product.title,
      });

      if (updated.remoteId) {
        try {
          const saved = await requestProducts(`${PRODUCTS_URL}/${updated.remoteId}`, {
            method: "PUT",
            body: JSON.stringify({ ...updated, id: updated.remoteId, recordType: "product", entityType: "product" }),
          });
          const remoteProduct = normalizeProduct(saved);
          this.products[index] = { ...remoteProduct, id: updated.id, remoteId: saved.id };
          this.saveProducts();
          return this.products[index];
        } catch (error) {
          console.warn("Remote update product failed, saving locally:", error?.message || error);
          this.products[index] = updated;
          this.saveProducts();
          return updated;
        }
      } else {
        try {
          const saved = await requestProducts(PRODUCTS_URL, {
            method: "POST",
            body: JSON.stringify({ ...updated, recordType: "product", entityType: "product" }),
          });
          const remoteProduct = normalizeProduct(saved);
          this.products[index] = { ...remoteProduct, id: updated.id, remoteId: saved.id };
          this.saveProducts();
          return this.products[index];
        } catch (error) {
          console.warn("Remote create product failed during update, saving locally:", error?.message || error);
          this.products[index] = updated;
          this.saveProducts();
          return updated;
        }
      }
    },

    replaceProduct(oldId, payload) {
      if (!this.loaded) this.loadProducts();
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
      const product = this.products.find((p) => String(p.id) === String(id));
      if (!product) return;

      try {
        if (product.remoteId) {
          await requestProducts(`${PRODUCTS_URL}/${product.remoteId}`, { method: "DELETE" });
        }
        this.products = this.products.filter((p) => String(p.id) !== String(id));
        this.saveProducts();
      } catch (error) {
        console.warn("Remote delete product failed:", error?.message || error);
        throw new Error("Mahsulot MockAPI'dan o'chirilmadi. cart resource'ni tekshiring.");
      }
    },

    async importDefaultProducts() {
      if (!this.loaded) this.loadProducts();
      await this.syncProductsFromRemote();
      const existingNames = new Set(
        this.products
          .filter(isRemoteProduct)
          .map((product) => product.name.toLowerCase())
      );
      const incoming = defaultProducts
        .map((product) => normalizeProduct({ ...product, recordType: "product" }))
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
