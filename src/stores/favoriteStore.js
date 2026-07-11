import { defineStore } from "pinia";

const readFavorites = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem("favorites") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.setItem("favorites", "[]");
    return [];
  }
};

export const useFavoriteStore = defineStore("favorite", {
  state: () => ({
    items: readFavorites()
  }),

  getters: {
    favoriteCount: (state) => state.items.length,

    isFavorite: (state) => {
      return (id) => state.items.some(item => String(item.id) === String(id));
    }
  },

  actions: {
    saveToLocalStorage() {
      localStorage.setItem("favorites", JSON.stringify(this.items));
    },

    addToFavorites(product) {
      if (!this.isFavorite(product.id)) {
        this.items.push(product);
        this.saveToLocalStorage();
      }
    },

    removeFromFavorites(id) {
      this.items = this.items.filter(item => String(item.id) !== String(id));
      this.saveToLocalStorage();
    },

    toggleFavorite(product) {
      if (this.isFavorite(product.id)) {
        this.removeFromFavorites(product.id);
      } else {
        this.addToFavorites(product);
      }
    },

    clearFavorites() {
      this.items = [];
      this.saveToLocalStorage();
    }
  }
});
