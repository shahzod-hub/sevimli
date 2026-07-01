<script setup>

import { ref, inject } from "vue";
const CONTACTS_URL = "https://6a3c40e4e4a07f202e16a52c.mockapi.io/sevimli/sevimli";
const showToast = inject("showToast");

const contacts = [
  { icon: "📍", label: "Manzil", value: "Surxondaryo, Sho'rchi tumani, Osiyo to'yxona ro'parasi" },
  { icon: "📞", label: "Telefon", value: "+998 91 717 41 10" },
  { icon: "✉️", label: "Email", value: "info@sevimlimarket.uz" },
  { icon: "💬", label: "Telegram", value: "@sevimlimarket_uz" },
];

const form = ref({ name: "", email: "", phone: "", subject: "", message: "" });
const sent = ref(false);

const resetForm = () => {
  form.value = { name: "", email: "", phone: "", subject: "", message: "" };
};

const sendMessage = async () => {
  if (!form.value.name || !form.value.email || !form.value.message) {
    showToast?.("Iltimos, ism, email va xabarni to'ldiring!", "error");
    return;
  }

  try {
    const res = await fetch(CONTACTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        subject: form.value.subject,
        message: form.value.message,
        createdAt: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      throw new Error("Xabar yuborilmadi");
    }

    sent.value = true;
    resetForm();
    showToast?.("Xabaringiz yuborildi!", "success");
  } catch (error) {
    console.error(error);
    showToast?.("Xabar yuborishda xatolik bor", "error");
  }
};

const startNewMessage = () => {
  sent.value = false;
  resetForm();
};
</script>

<template>
  <div class="page">
    <div class="header">
      <span class="eyebrow">📞 Aloqa</span>
      <h1>Biz bilan bog'laning</h1>
      <p>Savollaringiz bormi? Bizga yozing, 24 soat ichida javob beramiz!</p>
    </div>

    <div class="layout">
      <div class="contact-info">
        <div class="info-card" v-for="info in contacts" :key="info.label">
          <div class="info-icon">{{ info.icon }}</div>
          <div>
            <h4>{{ info.label }}</h4>
            <p>{{ info.value }}</p>
          </div>
        </div>

        <div class="hours">
          <h3>Ish vaqti</h3>
          <div class="hour-row">
            <span>Dushanba – Juma</span>
            <span>08:00 – 22:00</span>
          </div>
          <div class="hour-row">
            <span>Shanba</span>
            <span>09:00 – 20:00</span>
          </div>
          <div class="hour-row">
            <span>Yakshanba</span>
            <span>10:00 – 18:00</span>
          </div>
        </div>
      </div>

      <div class="form-wrap">
        <div v-if="sent" class="success">
          <div class="check">✅</div>
          <h3>Xabar yuborildi!</h3>
          <p>Tez orada siz bilan bog'lanamiz.</p>
          <button @click="startNewMessage()">
            Yana yozish
          </button>
        </div>

        <form v-else @submit.prevent="sendMessage">
          <h2>Xabar yuborish</h2>

          <div class="row">
            <div class="field">
              <label>Ism *</label>
              <input v-model="form.name" type="text" placeholder="Sardor" />
            </div>
            <div class="field">
              <label>Email *</label>
              <input v-model="form.email" type="email" placeholder="email@mail.com" />
            </div>
          </div>

          <div class="row">
            <div class="field">
              <label>Telefon</label>
              <input v-model="form.phone" type="tel" placeholder="+998 90 ..." />
            </div>
            <div class="field">
              <label>Mavzu</label>
              <input v-model="form.subject" type="text" placeholder="Buyurtma haqida..." />
            </div>
          </div>

          <div class="field">
            <label>Xabar *</label>
            <textarea v-model="form.message" rows="5" type="text" placeholder="Xabaringizni yozing..."></textarea>
          </div>

          <button type="submit" class="submit-btn">📤 Yuborish</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-form {
  display: grid;
  gap: 14px;
  max-width: 520px;
  margin-top: 24px;
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  background: white;
  color: #1a202c;
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.contact-form button {
  padding: 14px 18px;
  border: none;
  border-radius: 12px;
  background: #2563eb;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.page { max-width: 1100px; margin: auto; padding: 60px 5%; }

.header { text-align: center; margin-bottom: 60px; }

.eyebrow {
  display: inline-block;
  background: #eff6ff;
  color: #2563eb;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

h1 { font-size: 38px; font-weight: 800; color: #1a202c; margin-bottom: 12px; }

.header p { color: #64748b; font-size: 17px; }

.layout { display: grid; grid-template-columns: 1fr 1.5fr; gap: 32px; }

.contact-info { display: flex; flex-direction: column; gap: 16px; }

.info-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  background: white;
  padding: 20px;
  border-radius: 18px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
}

.info-icon {
  font-size: 26px;
  width: 52px;
  height: 52px;
  background: #eff6ff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-card h4 { font-size: 14px; color: #94a3b8; margin-bottom: 4px; }
.info-card p { font-size: 16px; font-weight: 600; color: #1a202c; }

.hours {
  background: white;
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
}

.hours h3 { font-size: 17px; font-weight: 700; color: #1a202c; margin-bottom: 16px; }

.hour-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #475569;
}

.hour-row:last-child { border: none; }

.form-wrap {
  background: white;
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.success { text-align: center; padding: 40px 20px; }

.check { font-size: 60px; margin-bottom: 16px; }
.success h3 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
.success p { color: #64748b; margin-bottom: 24px; }

.success button {
  background: #eff6ff;
  color: #2563eb;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
}

form h2 { font-size: 22px; font-weight: 800; color: #1a202c; margin-bottom: 24px; }

.row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.field { margin-bottom: 18px; }

.field label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }

.field input, .field textarea {
  width: 100%;
  padding: 13px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s;
  font-family: inherit;
  background: white;
  color: #1a202c;
}

.field input:focus, .field textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(37,99,235,0.3); }

@media (max-width: 768px) {
  .layout { grid-template-columns: 1fr; }
  .row { grid-template-columns: 1fr; }
  h1 { font-size: 28px; }
}
</style>
