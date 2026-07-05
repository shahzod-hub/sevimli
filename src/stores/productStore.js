import { defineStore } from "pinia";
import defaultProducts from "../data/products.js";

const STORAGE_KEY = "sevimli_products";

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

    ensureLoaded() {
      if (!this.loaded) this.loadProducts();
    },

    saveProducts() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products));
    },

    createProduct(payload) {
      this.ensureLoaded();
      const product = normalizeProduct({
        ...payload,
        id: payload.id ?? Date.now(),
        title: payload.name,
        rating: payload.rating || 4.6,
        reviews: payload.reviews || 0,
      });
      this.products.unshift(product);
      this.saveProducts();
      return product;
    },

    setProducts(products) {
      this.products = products.map(normalizeProduct);
      this.loaded = true;
      this.saveProducts();
    },

    updateProduct(id, payload) {
      this.ensureLoaded();
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
      return updated;
    },

    deleteProduct(id) {
      this.ensureLoaded();
      this.products = this.products.filter((product) => String(product.id) !== String(id));
      this.saveProducts();
    },

    importDefaultProducts() {
      this.ensureLoaded();
      const existingNames = new Set(this.products.map((product) => product.name.toLowerCase()));
      const incoming = defaultProducts
        .map(normalizeProduct)
        .filter((product) => !existingNames.has(product.name.toLowerCase()));

      this.products = [...incoming, ...this.products];
      this.saveProducts();
      return incoming.length;
    },

    resetProducts() {
      this.products = defaultProducts.map(normalizeProduct);
      this.loaded = true;
      this.saveProducts();
    },
  },
});
