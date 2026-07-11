import { defineStore } from "pinia";
import {
  addToCart as addToCartApi,
  clearCart as clearCartApi,
} from "../api/mockCart";

const readCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.setItem("cart", "[]");
    return [];
  }
};

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: readCart()
  }),

  getters: {
    cartCount: (state) =>
      state.items.reduce((total, item) => total + item.quantity, 0),

    totalPrice: (state) =>
      state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  },

  actions: {
    saveToLocalStorage() {
      localStorage.setItem("cart", JSON.stringify(this.items));
    },

    setItems(items) {
      this.items = items.map(item => ({
        ...item,
        cartItemId: item.cartItemId || `local_${item.id}`,
      }));
      this.saveToLocalStorage();
    },

    mergeItems(items) {
      const remoteItems = items.map(item => ({
        ...item,
        cartItemId: item.cartItemId || `local_${item.id}`,
      }));

      const merged = [...remoteItems];
      const remoteIds = new Set(remoteItems.map(item => String(item.id)));

      this.items.forEach((localItem) => {
        if (!remoteIds.has(String(localItem.id))) {
          merged.push(localItem);
        }
      });

      this.items = merged;
      this.saveToLocalStorage();
    },

    addToCart(product) {
      if (!product?.id) return;

      const existingItem = this.items.find(item => String(item.id) === String(product.id));

      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.items.push({
          ...product,
          quantity: 1,
          cartItemId: `local_${product.id}`,
          createdAt: new Date().toISOString(),
        });
      }

      this.saveToLocalStorage();

      const user = readUser();
      addToCartApi(user.id, product, 1, { syncLocal: false })
        .then((remoteItem) => {
          if (!remoteItem?.cartItemId) return;

          const item = this.items.find(cartItem => String(cartItem.id) === String(product.id));
          if (!item || !String(item.cartItemId || "").startsWith("local_")) return;

          item.cartItemId = remoteItem.cartItemId;
          this.saveToLocalStorage();
        })
        .catch(() => {});
    },

    increaseQuantity(id) {
      const item = this.items.find(item => String(item.id) === String(id));
      if (item) {
        item.quantity++;
        this.saveToLocalStorage();
      }
    },

    decreaseQuantity(id) {
      const item = this.items.find(item => String(item.id) === String(id));
      if (!item) return;
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.removeFromCart(id);
      }
      this.saveToLocalStorage();
    },

    removeFromCart(id) {
      this.items = this.items.filter(item => String(item.id) !== String(id));
      this.saveToLocalStorage();
    },

    // ENDI ASYNC, VA MOCKAPI'NI HAM TOZALAYDI
    async clearCart() {
      this.items = [];
      this.saveToLocalStorage();

      const user = readUser();
      if (user.id) {
        const result = await clearCartApi(user.id);
        return result;
      }
      return { success: true, remoteOk: false };
    }
  }
});
