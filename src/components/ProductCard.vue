<script setup>
import { inject } from "vue";
import { useCartStore } from "../stores/cartStore";
import { useFavoriteStore } from "../stores/favoriteStore";
import { useRouter } from "vue-router";

const cart = useCartStore();
const favorite = useFavoriteStore();
const router = useRouter();
const showToast = inject("showToast");

const props = defineProps({
  product: Object
});

const addToCart = () => {
  cart.addToCart(props.product);
  showToast?.(`${props.product.name} savatga qo'shildi!`);
};

const toggleFavorite = () => {
  favorite.toggleFavorite(props.product);
  const msg = favorite.isFavorite(props.product.id)
    ? `${props.product.name} sevimlilarga qo'shildi!`
    : `${props.product.name} sevimlilardan olib tashlandi`;
  showToast?.(msg);
};
</script>

<template>
  <div class="card">
    <div class="img-wrap" @click="router.push(`/product/${product.id}`)">
      <img :src="product.image" :alt="product.name" />
      <span v-if="product.badge" class="badge">{{ product.badge }}</span>
      <button class="fav-btn" @click.stop="toggleFavorite">
        {{ favorite.isFavorite(product.id) ? '❤️' : '🤍' }}
      </button>
    </div>

    <div class="body">
      <div class="meta">
        <span class="category">{{ product.category }}</span>
        <span class="rating">⭐ {{ product.rating }}</span>
      </div>

      <h3 @click="router.push(`/product/${product.id}`)">{{ product.name }}</h3>
      <p>{{ product.description }}</p>

      <div class="footer">
        <div class="price">
          <strong>{{ product.price.toLocaleString() }}</strong>
          <span>so'm/{{ product.unit }}</span>
        </div>
        <button class="add-btn" @click="addToCart">
          + Savat
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 15px rgba(0,0,0,0.06);
  transition: all 0.3s;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
}

.img-wrap {
  position: relative;
  overflow: hidden;
  height: 210px;
}

.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.card:hover .img-wrap img { transform: scale(1.06); }

.badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fav-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fav-btn:hover { transform: scale(1.15); }

.body { padding: 18px; }

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category {
  font-size: 12px;
  color: #2563eb;
  font-weight: 600;
  background: #eff6ff;
  padding: 3px 10px;
  border-radius: 20px;
}

.rating {
  font-size: 13px;
  color: #f59e0b;
  font-weight: 600;
}

h3 {
  font-size: 17px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 6px;
  transition: color 0.2s;
}

h3:hover { color: #2563eb; }

p {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 16px;
  line-height: 1.5;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price strong {
  font-size: 18px;
  font-weight: 800;
  color: #1a202c;
}

.price span {
  font-size: 12px;
  color: #94a3b8;
  margin-left: 4px;
}

.add-btn {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover { transform: scale(1.05); box-shadow: 0 5px 20px rgba(37,99,235,0.35); }
</style>
