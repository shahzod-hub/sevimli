<script setup>
import { inject } from "vue";
import { useFavoriteStore } from "../stores/favoriteStore";
import { useCartStore } from "../stores/cartStore";
import { useRouter } from "vue-router";

const favorite = useFavoriteStore();
const cart = useCartStore();
const router = useRouter();
const showToast = inject("showToast");

const addToCart = (item) => {
  cart.addToCart(item);
  showToast?.(`${item.name} savatga qo'shildi!`);
};
</script>

<template>
  <div class="page">
    <div class="header">
      <h1>❤️ Sevimlilar</h1>
      <span v-if="favorite.items.length">{{ favorite.favoriteCount }} ta</span>
    </div>

    <div v-if="favorite.items.length === 0" class="empty">
      <div class="icon">❤️</div>
      <h3>Sevimlilar bo'sh</h3>
      <p>Yoqtirgan mahsulotlaringizni sevimlilarga qo'shing!</p>
      <button @click="router.push('/')">Mahsulotlarni ko'rish</button>
    </div>

    <div v-else>
      <div class="grid">
        <div class="card" v-for="item in favorite.items" :key="item.id">
          <div class="img-wrap" @click="router.push(`/product/${item.id}`)">
            <img :src="item.image" :alt="item.name" />
          </div>

          <div class="body">
            <span class="category">{{ item.category }}</span>
            <h3 @click="router.push(`/product/${item.id}`)">{{ item.name }}</h3>
            <p>{{ item.description }}</p>

            <div class="footer">
              <strong>{{ item.price.toLocaleString() }} so'm</strong>
              <div class="btns">
                <button class="cart-btn" @click="addToCart(item)">🛒</button>
                <button class="remove-btn" @click="favorite.removeFromFavorites(item.id)">✕</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button class="clear-all" @click="favorite.clearFavorites()">
        Hammasini o'chirish
      </button>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: 1200px; margin: auto; padding: 50px 5%; }

.header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 36px;
}

.header h1 { font-size: 32px; font-weight: 800; color: #1a202c; }

.header span {
  background: #f43f5e;
  color: white;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 14px;
}

.empty {
  text-align: center;
  padding: 100px 20px;
  background: white;
  border-radius: 24px;
}

.icon { font-size: 70px; margin-bottom: 20px; }
.empty h3 { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
.empty p { color: #94a3b8; margin-bottom: 28px; }

.empty button {
  background: linear-gradient(135deg, #f43f5e, #fb7185);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.07);
  transition: all 0.3s;
}

.card:hover { transform: translateY(-5px); }

.img-wrap {
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.card:hover .img-wrap img { transform: scale(1.06); }

.body { padding: 18px; }

.category {
  display: inline-block;
  background: #fff1f2;
  color: #f43f5e;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 8px;
}

h3 {
  font-size: 17px;
  font-weight: 700;
  color: #1a202c;
  cursor: pointer;
  margin-bottom: 6px;
  transition: color 0.2s;
}

h3:hover { color: #2563eb; }

p { font-size: 13px; color: #94a3b8; margin-bottom: 16px; }

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer strong { font-size: 17px; font-weight: 800; color: #1a202c; }

.btns { display: flex; gap: 8px; }

.cart-btn {
  background: #eff6ff;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  font-size: 17px;
  cursor: pointer;
  transition: all 0.2s;
}

.cart-btn:hover { background: #2563eb; }

.remove-btn {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover { background: #ef4444; color: white; }

.clear-all {
  display: block;
  margin: 32px auto 0;
  background: none;
  color: #ef4444;
  border: 2px solid #fee2e2;
  padding: 12px 28px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.clear-all:hover { background: #fee2e2; }
</style>
