import { defineStore } from "pinia";


export const useCartStore = defineStore("cart", {
  state: () => ({
    items: JSON.parse(localStorage.getItem("cart")) || []
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
      const remoteIds = new Set(remoteItems.map(item => item.id));

      this.items.forEach((localItem) => {
        if (!remoteIds.has(localItem.id)) {
          merged.push(localItem);
        }
      });

      this.items = merged;
      this.saveToLocalStorage();
    },

addToCart(product) {
  const existingItem = this.items.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    this.items.push({
      ...product,
      quantity: 1,
      cartItemId: `local_${product.id}`,
    });
  }

  this.saveToLocalStorage();
},

    increaseQuantity(id) {
      const item = this.items.find(item => item.id === id);
      if (item) {
        item.quantity++;
        this.saveToLocalStorage();
      }
    },

    decreaseQuantity(id) {
      const item = this.items.find(item => item.id === id);
      if (!item) return;
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.removeFromCart(id);
      }
      this.saveToLocalStorage();
    },

    removeFromCart(id) {
      this.items = this.items.filter(item => item.id !== id);
      this.saveToLocalStorage();
    },

    // ENDI ASYNC, VA MOCKAPI'NI HAM TOZALAYDI
    async clearCart() {
      this.items = [];
      this.saveToLocalStorage();

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.id) {
        await clearCartApi(user.id);
      }
    }
  }
});