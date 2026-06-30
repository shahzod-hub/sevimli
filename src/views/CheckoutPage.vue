<script setup>
import { ref, inject } from "vue";
import { useCartStore } from "../stores/cartStore";
import { useRouter } from "vue-router";

const cart = useCartStore();
const router = useRouter();
const showToast = inject("showToast");

const form = ref({
  name: "",
  phone: "",
  address: "",
  payment: "cash"
});

const submitted = ref(false);

const placeOrder = () => {
  if (!form.value.name || !form.value.phone || !form.value.address) {
    showToast?.("Iltimos, barcha maydonlarni to'ldiring!", "error");
    return;
  }
  submitted.value = true;
  cart.clearCart();
};
</script>

<template>
  <div class="page">

    <div v-if="submitted" class="success">
      <div class="check">✅</div>
      <h2>Buyurtma qabul qilindi!</h2>
      <p>Tez orada operator siz bilan bog'lanadi. Rahmat!</p>
      <button @click="router.push('/')">Bosh sahifaga qaytish</button>
    </div>

    <div v-else class="layout">
      <div class="form-section">
        <h1>📦 Buyurtma berish</h1>

        <div class="field">
          <label>Ism  *</label>
          <input v-model="form.name" placeholder="Sardor Karimov" />
        </div>

        <div class="field">
          <label>Telefon raqam *</label>
          <input v-model="form.phone" placeholder="+998 99 999 99 99" type="tel" />
        </div>

        <div class="field">
          <label>Yetkazib berish manzili *</label>
          <textarea v-model="form.address" placeholder="Sho'rchi tumani ..." rows="3"></textarea>
        </div>

        <div class="field">
          <label>To'lov usuli</label>
          <div class="payment-options">
            <label :class="{ selected: form.payment === 'cash' }">
              <input type="radio" v-model="form.payment" value="cash" />
              💵 Naqd pul
            </label>
            <label :class="{ selected: form.payment === 'click' }">
              <input type="radio" v-model="form.payment" value="click" />
              📱 Click
            </label>
          </div>
        </div>

        <button class="submit-btn" @click="placeOrder">
          Buyurtma berish →
        </button>
      </div>

      <div class="order-summary">
        <h2>Buyurtmangiz</h2>
        <div class="items">
          <div class="item" v-for="item in cart.items" :key="item.id">
            <img :src="item.image" :alt="item.name" />
            <div>
              <h4>{{ item.name }}</h4>
              <p>{{ item.quantity }} × {{ item.price.toLocaleString() }} so'm</p>
            </div>
            <strong>{{ (item.quantity * item.price).toLocaleString() }}</strong>
          </div>
        </div>
        <div class="total">
          <span>Jami:</span>
          <strong>{{ cart.totalPrice.toLocaleString() }} so'm</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: 1100px; margin: auto; padding: 50px 5%; }

.success {
  text-align: center;
  padding: 100px 20px;
  background: white;
  border-radius: 24px;
}

.check { font-size: 80px; margin-bottom: 24px; }
.success h2 { font-size: 32px; font-weight: 800; margin-bottom: 12px; }
.success p { color: #64748b; margin-bottom: 32px; font-size: 16px; }

.success button {
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
  grid-template-columns: 1fr 380px;
  gap: 32px;
  align-items: start;
}

.form-section h1 { font-size: 28px; font-weight: 800; color: #1a202c; margin-bottom: 32px; }

.field { margin-bottom: 22px; }

.field label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.field input, .field textarea {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 15px;
  transition: all 0.2s;
  font-family: inherit;
  color: #1a202c;
  background: white;
}

.field input:focus, .field textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
}

.payment-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.payment-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s;
}

.payment-options label.selected {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
}

.payment-options input[type="radio"] { display: none; }

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(37,99,235,0.35); }

.order-summary {
  background: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  position: sticky;
  top: 90px;
}

.order-summary h2 { font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #1a202c; }

.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.item img {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  object-fit: cover;
}

.item div { flex: 1; }
.item h4 { font-size: 14px; font-weight: 600; color: #1a202c; }
.item p { font-size: 12px; color: #94a3b8; margin-top: 2px; }
.item strong { font-size: 14px; font-weight: 700; color: #2563eb; }

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
}

.total strong { font-size: 22px; color: #2563eb; }

@media (max-width: 768px) {
  .layout { grid-template-columns: 1fr; }
}
</style>
