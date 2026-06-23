import { defineStore } from "pinia";

export const useFavoriteStore = defineStore("favorite", {
  state: () => ({
    items: JSON.parse(localStorage.getItem("favorites")) || []
  }),

  getters: {
    favoriteCount: (state) => state.items.length,

    isFavorite: (state) => {
      return (id) => state.items.some(item => item.id === id);
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
      this.items = this.items.filter(item => item.id !== id);
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