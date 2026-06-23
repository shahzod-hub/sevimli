<script setup>
import { ref, provide } from "vue";
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";

const toasts = ref([]);

const showToast = (message, type = "success") => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 3000);
};

provide("showToast", showToast);
</script>

<template>
  <Navbar />
  <router-view />
  <Footer />

  <!-- Toast Notifications -->
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', toast.type]"
      >
        <span>{{ toast.type === 'success' ? '✅' : '❌' }}</span>
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background: #f0f4f8;
  color: #1a202c;
}

.toast-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  padding: 14px 20px;
  border-radius: 14px;
  color: white;
  font-weight: 500;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  min-width: 260px;
}

.toast.success { background: linear-gradient(135deg, #059669, #10b981); }
.toast.error { background: linear-gradient(135deg, #dc2626, #ef4444); }

.toast-enter-active,
.toast-leave-active { transition: all 0.35s ease; }
.toast-enter-from { opacity: 0; transform: translateX(60px); }
.toast-leave-to { opacity: 0; transform: translateX(60px); }
</style>
