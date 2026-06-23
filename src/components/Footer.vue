<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="col brand">
        <h3>🛒 SuperMarket</h3>
        <p>Eng sifatli mahsulotlarni uyingizga yetkazib beramiz. Sog'lom ovqatlanish — baxtli hayot!</p>
        <div class="socials">
          <a href="#">📘</a>
          <a href="#">📸</a>
          <a href="#">🐦</a>
          <a href="#">▶️</a>
        </div>
      </div>

      <div class="col">
        <h4>Sahifalar</h4>
        <router-link to="/">Bosh sahifa</router-link>
        <router-link to="/cart">Savat</router-link>
        <router-link to="/favorites">Sevimlilar</router-link>
        <router-link to="/about">Biz haqimizda</router-link>
        <router-link to="/contact">Aloqa</router-link>
      </div>

      <div class="col">
        <h4>Kategoriyalar</h4>
        <router-link to="/">Mevalar</router-link>
        <router-link to="/">Sabzavotlar</router-link>
        <router-link to="/">Ichimliklar</router-link>
        <router-link to="/">Shirinliklar</router-link>
      </div>

      <div class="col">
        <h4>Aloqa</h4>
        <p>📍 Surxondaryo, O'zbekiston</p>
        <p>📞 +998 90 123 45 67</p>
        <p>✉️ info@supermarket.uz</p>
        <p>🕐 07:00 – 23:00</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2026 SuperMarket. Barcha huquqlar himoyalangan.</p>
      <p>Made with ❤️ in Uzbekistan</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #0a0f1e;
  color: #94a3b8;
  margin-top: 80px;
}

.footer-inner {
  max-width: 1200px;
  margin: auto;
  padding: 60px 5%;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 40px;
}

.col h3 {
  color: white;
  font-size: 22px;
  margin-bottom: 15px;
}

.col h4 {
  color: white;
  font-size: 15px;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.brand p {
  line-height: 1.7;
  font-size: 14px;
}

.socials {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.socials a {
  background: rgba(255,255,255,0.08);
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  text-decoration: none;
  transition: all 0.2s;
}

.socials a:hover { background: rgba(56,189,248,0.2); transform: translateY(-3px); }

.col a, .col p {
  display: block;
  color: #94a3b8;
  text-decoration: none;
  margin-bottom: 10px;
  font-size: 14px;
  transition: color 0.2s;
}

.col a:hover { color: #38bdf8; }

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.08);
  padding: 20px 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: auto;
  font-size: 13px;
}

@media (max-width: 768px) {
  .footer-inner { grid-template-columns: 1fr 1fr; }
  .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
}

@media (max-width: 480px) {
  .footer-inner { grid-template-columns: 1fr; }
}
</style>
