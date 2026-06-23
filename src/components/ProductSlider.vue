<script setup>
import { ref, inject } from "vue";
import { useCartStore } from "../stores/cartStore";
import products from "../data/products.js";

const cart = useCartStore();
const showToast = inject("showToast");
const slider = ref(null);

const topProducts = products.filter(p => p.badge === "Top" || p.badge === "Bestseller" || p.rating >= 4.7);

const scroll = (dir) => {
  slider.value?.scrollBy({ left: dir * 280, behavior: "smooth" });
};

const addToCart = (product) => {
  cart.addToCart(product);
  showToast?.(`${product.name} savatga qo'shildi!`);
};
</script>

<template>
  <section class="slider-section">
    <div class="section-header">
      <div>
        <h2>⭐ Top mahsulotlar</h2>
        <p>Eng ko'p sotilgan va yuqori baholangan mahsulotlar</p>
      </div>
      <div class="controls">
        <button @click="scroll(-1)">←</button>
        <button @click="scroll(1)">→</button>
      </div>
    </div>

    <div class="cards" ref="slider">
      <div class="card" v-for="product in topProducts" :key="product.id">
        <div class="img-wrap">
          <img :src="product.image" :alt="product.name" />
          <span class="badge">{{ product.badge }}</span>
        </div>
        <div class="info">
          <div class="rating">⭐ {{ product.rating }} · {{ product.reviews }} ta sharh</div>
          <h3>{{ product.name }}</h3>
          <div class="bottom">
            <strong>{{ product.price.toLocaleString() }} so'm</strong>
            <button @click="addToCart(product)">+ Savat</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.slider-section {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 5%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
}

h2 { font-size: 26px; font-weight: 800; color: #1a202c; }

.section-header p {
  color: #94a3b8;
  font-size: 14px;
  margin-top: 4px;
}

.controls { display: flex; gap: 8px; }

.controls button {
  width: 42px; height: 42px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.controls button:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.cards {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
  scroll-snap-type: x mandatory;
}

.cards::-webkit-scrollbar { height: 6px; }
.cards::-webkit-scrollbar-thumb { background: #2563eb; border-radius: 10px; }
.cards::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }

.card {
  min-width: 240px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.07);
  scroll-snap-align: start;
  transition: all 0.3s;
}

.card:hover { transform: translateY(-5px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); }

.img-wrap { position: relative; height: 170px; overflow: hidden; }

.img-wrap img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.card:hover .img-wrap img { transform: scale(1.08); }

.badge {
  position: absolute;
  top: 10px; left: 10px;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}

.info { padding: 16px; }

.rating { font-size: 12px; color: #94a3b8; margin-bottom: 6px; }

h3 { font-size: 16px; font-weight: 700; color: #1a202c; margin-bottom: 14px; }

.bottom { display: flex; justify-content: space-between; align-items: center; }

.bottom strong { font-size: 16px; font-weight: 800; color: #2563eb; }

.bottom button {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.bottom button:hover { transform: scale(1.05); }
</style>
