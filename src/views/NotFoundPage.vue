<template>
  <div class="not-found">
    <div class="content">
      <div class="emoji">🛒</div>
      <h1>404</h1>
      <h2>Sahifa topilmadi</h2>
      <p>Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki o'chirilgan.</p>
      <div class="actions">
        <router-link to="/home" class="home-btn">🏠 Bosh sahifaga</router-link>
        <router-link to="/contact" class="contact-btn">Yordam</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.content {
  text-align: center;
  max-width: 480px;
}

.emoji { font-size: 80px; margin-bottom: 16px; animation: bounce 2s infinite; }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

h1 {
  font-size: 120px;
  font-weight: 900;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: 8px;
}

h2 { font-size: 28px; font-weight: 700; color: #1a202c; margin-bottom: 14px; }

p { color: #64748b; line-height: 1.6; margin-bottom: 36px; }

.actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

.home-btn {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
  padding: 14px 28px;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  font-size: 15px;
  transition: all 0.3s;
}

.home-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(37,99,235,0.35); }

.contact-btn {
  background: white;
  color: #2563eb;
  border: 2px solid #2563eb;
  padding: 14px 28px;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  font-size: 15px;
  transition: all 0.2s;
}

.contact-btn:hover { background: #eff6ff; }
</style>
