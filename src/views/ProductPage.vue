<script setup>
import { computed, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "../stores/cartStore";
import { useFavoriteStore } from "../stores/favoriteStore";
import products from "../data/products.js";

const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const favorite = useFavoriteStore();
const showToast = inject("showToast");

const product = computed(() =>
  products.find(p => p.id === Number(route.params.id))
);

const related = computed(() =>
  products.filter(p => p.category === product.value?.category && p.id !== product.value?.id).slice(0, 4)
);

const addToCart = () => {
  cart.addToCart(product.value);
  showToast?.(`${product.value.name} savatga qo'shildi!`);
};

const toggleFav = () => {
  favorite.toggleFavorite(product.value);
};
</script>

<template>
  <div v-if="product" class="page">
    <div class="breadcrumb">
      <router-link to="/home">Bosh sahifa</router-link>
      <span>›</span>
      <span>{{ product.category }}</span>
      <span>›</span>
      <span>{{ product.name }}</span>
    </div>

    <div class="details">
      <div class="img-wrap">
        <img :src="product.image" :alt="product.name" />
        <span v-if="product.badge" class="badge">{{ product.badge }}</span>
      </div>

      <div class="info">
        <span class="category">{{ product.category }}</span>
        <h1>{{ product.name }}</h1>

        <div class="rating-row">
          <span>⭐ {{ product.rating }}</span>
          <span>{{ product.reviews }} ta sharh</span>
        </div>

        <p class="desc">{{ product.description }}</p>

        <div class="price-row">
          <strong>{{ product.price.toLocaleString() }} so'm</strong>
          <span>/ {{ product.unit }}</span>
        </div>

        <div class="actions">
          <button class="cart-btn" @click="addToCart">🛒 Savatga qo'shish</button>
          <button class="fav-btn" @click="toggleFav">
            {{ favorite.isFavorite(product.id) ? '❤️' : '🤍' }}
          </button>
        </div>

        <div class="features">
          <div class="feature">✅ Yangi va sifatli</div>
          <div class="feature">🚚 Tez yetkazib berish</div>
          <div class="feature">🔒 Xavfsiz to'lov</div>
          <div class="feature">↩️ Qaytarish imkoniyati</div>
        </div>
      </div>
    </div>

    <div class="related" v-if="related.length">
      <h2>O'xshash mahsulotlar</h2>
      <div class="related-grid">
        <div
          class="rel-card"
          v-for="p in related"
          :key="p.id"
          @click="router.push(`/product/${p.id}`)"
        >
          <img :src="p.image" :alt="p.name" />
          <h4>{{ p.name }}</h4>
          <strong>{{ p.price.toLocaleString() }} so'm</strong>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <h2>Mahsulot topilmadi</h2>
    <router-link to="/home">← Ortga qaytish</router-link>
  </div>
</template>

<style scoped>
.page { max-width: 1200px; margin: auto; padding: 40px 5%; }

.breadcrumb {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 36px;
}

.breadcrumb a { color: #2563eb; text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }

.details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;
}

.img-wrap {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12);
}

.img-wrap img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.badge {
  position: absolute;
  top: 16px; left: 16px;
  background: #ef4444;
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}

.category {
  display: inline-block;
  background: #eff6ff;
  color: #2563eb;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 20px;
  margin-bottom: 12px;
}

h1 {
  font-size: 36px;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 12px;
}

.rating-row {
  display: flex;
  gap: 14px;
  font-size: 15px;
  color: #64748b;
  margin-bottom: 20px;
}

.rating-row span:first-child { color: #f59e0b; font-weight: 600; }

.desc {
  color: #64748b;
  line-height: 1.7;
  font-size: 16px;
  margin-bottom: 28px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 28px;
}

.price-row strong { font-size: 36px; font-weight: 800; color: #1a202c; }
.price-row span { color: #94a3b8; font-size: 16px; }

.actions {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.cart-btn {
  flex: 1;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.cart-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(37,99,235,0.35); }

.fav-btn {
  background: white;
  border: 2px solid #e2e8f0;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.fav-btn:hover { border-color: #f43f5e; transform: scale(1.05); }

.features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.feature {
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  color: #475569;
}

.related { margin-top: 70px; }

.related h2 { font-size: 24px; font-weight: 800; color: #1a202c; margin-bottom: 24px; }

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.rel-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
}

.rel-card:hover { transform: translateY(-5px); }

.rel-card img { width: 100%; height: 150px; object-fit: cover; }

.rel-card h4 { padding: 12px 14px 4px; font-size: 15px; color: #1a202c; }

.rel-card strong { display: block; padding: 0 14px 14px; color: #2563eb; font-size: 15px; }

.not-found { text-align: center; padding: 100px 20px; }
.not-found a { color: #2563eb; text-decoration: none; margin-top: 16px; display: inline-block; }

@media (max-width: 768px) {
  .details { grid-template-columns: 1fr; gap: 30px; }
  h1 { font-size: 26px; }
}
</style>
