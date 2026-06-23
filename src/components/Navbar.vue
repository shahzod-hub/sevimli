<script setup>
import { ref } from "vue";
import { useCartStore } from "../stores/cartStore";
import { useFavoriteStore } from "../stores/favoriteStore";

const cart = useCartStore();
const favorite = useFavoriteStore();
const menuOpen = ref(false);
</script>

<template>
  <nav class="navbar">
    <div class="nav-inner">
      <router-link to="/" class="logo">
        🛒 <span>Super<b>Market</b></span>
      </router-link>

      <div class="nav-links" :class="{ open: menuOpen }">
        <router-link to="/" @click="menuOpen = false">Bosh sahifa</router-link>
        <router-link to="/about" @click="menuOpen = false">Biz haqimizda</router-link>
        <router-link to="/contact" @click="menuOpen = false">Aloqa</router-link>
      </div>

      <div class="nav-actions">
        <router-link to="/favorites" class="icon-btn">
          ❤️
          <span class="badge" v-if="favorite.favoriteCount > 0">{{ favorite.favoriteCount }}</span>
        </router-link>

        <router-link to="/cart" class="icon-btn cart-btn">
          🛒
          <span class="badge" v-if="cart.cartCount > 0">{{ cart.cartCount }}</span>
        </router-link>

        <button class="hamburger" @click="menuOpen = !menuOpen">
          {{ menuOpen ? '✕' : '☰' }}
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(10, 15, 30, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.nav-inner {
  max-width: 1200px;
  margin: auto;
  padding: 0 5%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.logo {
  font-size: 22px;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.logo span { color: #94a3b8; }
.logo b { color: #38bdf8; }

.nav-links {
  display: flex;
  gap: 6px;
}

.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: white;
  background: rgba(255,255,255,0.1);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  position: relative;
  background: rgba(255,255,255,0.08);
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.icon-btn:hover { background: rgba(255,255,255,0.15); }

.cart-btn { background: rgba(56, 189, 248, 0.2); }
.cart-btn:hover { background: rgba(56, 189, 248, 0.35); }

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.hamburger {
  display: none;
  background: rgba(255,255,255,0.08);
  border: none;
  color: white;
  font-size: 18px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .hamburger { display: flex; align-items: center; justify-content: center; }

  .nav-links {
    display: none;
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    background: #0a0f1e;
    flex-direction: column;
    padding: 20px;
    gap: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .nav-links.open { display: flex; }
  .nav-links a { padding: 14px 16px; }
}
</style>
