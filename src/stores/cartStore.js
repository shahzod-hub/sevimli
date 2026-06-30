import { defineStore } from "pinia";
  import { addToCart as addCartApi,getCart } from "../api/mockCart";
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
      this.items = items;
      this.saveToLocalStorage();
    },

async addToCart(product) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const existingItem = this.items.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    this.items.push({
      ...product,
      quantity: 1
    });
  }

  this.saveToLocalStorage();

  if (user.id) {
    await addCartApi(user.id, product);
  }
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

    clearCart() {
      this.items = [];
      this.saveToLocalStorage();
    }
  }
});