<script setup>
import { useCartStore } from "../stores/cartStore";
import { useRouter } from "vue-router";

const cart = useCartStore();
const router = useRouter();
</script>

<template>
  <div class="page">
    <div class="header">
      <h1>🛒 Savat</h1>
      <span v-if="cart.items.length">{{ cart.cartCount }} ta mahsulot</span>
    </div>

    <div v-if="cart.items.length === 0" class="empty">
      <div class="icon">🛒</div>
      <h3>Savat bo'sh</h3>
      <p>Savatga mahsulot qo'shing va buyurtma bering!</p>
      <button @click="router.push('/')">Xarid qilish</button>
    </div>

    <div v-else class="layout">
      <div class="items">
        <div class="cart-item" v-for="item in cart.items" :key="item.id">
          <img :src="item.image" :alt="item.name" />

          <div class="info">
            <h3>{{ item.name }}</h3>
            <p>{{ item.category }}</p>
            <strong>{{ item.price.toLocaleString() }} so'm/{{ item.unit }}</strong>
          </div>

          <div class="qty">
            <button @click="cart.decreaseQuantity(item.id)">−</button>
            <span>{{ item.quantity }}</span>
            <button @click="cart.increaseQuantity(item.id)">+</button>
          </div>

          <div class="subtotal">
            {{ (item.price * item.quantity).toLocaleString() }} so'm
          </div>

          <button class="remove" @click="cart.removeFromCart(item.id)">✕</button>
        </div>
      </div>

      <div class="summary">
        <h2>Buyurtma xulosasi</h2>

        <div class="summary-row">
          <span>Mahsulotlar ({{ cart.cartCount }} ta)</span>
          <span>{{ cart.totalPrice.toLocaleString() }} so'm</span>
        </div>
        <div class="summary-row">
          <span>Yetkazib berish</span>
          <span class="free">Bepul</span>
        </div>
        <div class="summary-row discount">
          <span>Chegirma</span>
          <span>− 0 so'm</span>
        </div>

        <div class="total">
          <span>Jami</span>
          <strong>{{ cart.totalPrice.toLocaleString() }} so'm</strong>
        </div>

        <button class="checkout-btn" @click="router.push('/checkout')">
          Buyurtma berish →
        </button>

        <button class="clear-btn" @click="cart.clearCart()">
          Savatni tozalash
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: 1200px; margin: auto; padding: 50px 5%; }

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 36px;
}

.header h1 { font-size: 32px; font-weight: 800; color: #1a202c; }

.header span {
  background: #2563eb;
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

.empty h3 { font-size: 26px; font-weight: 700; color: #1a202c; margin-bottom: 8px; }
.empty p { color: #94a3b8; margin-bottom: 28px; }

.empty button {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 28px;
  align-items: start;
}

.items { display: flex; flex-direction: column; gap: 16px; }

.cart-item {
  display: flex;
  align-items: center;
  gap: 18px;
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.cart-item img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 14px;
  flex-shrink: 0;
}

.info { flex: 1; }
.info h3 { font-size: 16px; font-weight: 700; color: #1a202c; margin-bottom: 4px; }
.info p { font-size: 13px; color: #94a3b8; margin-bottom: 6px; }
.info strong { color: #2563eb; font-size: 15px; }

.qty {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
}

.qty button {
  border: none;
  background: none;
  width: 36px;
  height: 36px;
  font-size: 18px;
  cursor: pointer;
  color: #475569;
  transition: all 0.2s;
}

.qty button:hover { background: #e2e8f0; color: #1a202c; }

.qty span {
  min-width: 32px;
  text-align: center;
  font-weight: 700;
  font-size: 15px;
  color: #1a202c;
}

.subtotal {
  font-weight: 700;
  color: #1a202c;
  font-size: 16px;
  min-width: 120px;
  text-align: right;
}

.remove {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
  transition: all 0.2s;
}

.remove:hover { background: #ef4444; color: white; }

.summary {
  background: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  position: sticky;
  top: 90px;
}

.summary h2 { font-size: 20px; font-weight: 800; color: #1a202c; margin-bottom: 24px; }

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 15px;
  color: #475569;
}

.free { color: #10b981; font-weight: 600; }
.discount { color: #ef4444; }

.total {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
}

.total strong { font-size: 22px; color: #2563eb; }

.checkout-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 12px;
}

.checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(37,99,235,0.35); }

.clear-btn {
  width: 100%;
  padding: 12px;
  background: none;
  color: #ef4444;
  border: 2px solid #fee2e2;
  border-radius: 14px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover { background: #fee2e2; }

@media (max-width: 768px) {
  .layout { grid-template-columns: 1fr; }
  .cart-item { flex-wrap: wrap; }
  .subtotal { width: 100%; text-align: left; }
}
</style>
