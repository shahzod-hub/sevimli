<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
  <section class="hero">
    <div class="hero-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>

    <div class="hero-content">
      <div class="left">
        <div class="eyebrow">🌿 Surxondaryoning #1 online do'koni</div>
        <h1>
          Yangi va Sifatli<br>
          <span class="highlight">Mahsulotlar</span><br>
          Eshigingizga!
        </h1>
        <p>
          Meva, sabzavot va kundalik mahsulotlarni eng qulay narxlarda xarid qiling.
          Tez yetkazib berish kafolatlanadi!
        </p>

        <div class="hero-actions">
          <button class="btn-primary" @click="router.push('/:pathMatch(.*)*')">
            🛒 Xarid boshlash
          </button>
          <button class="btn-secondary" @click="router.push('/about')">
            Biz haqimizda →
          </button>
        </div>

        <div class="stats">
          <div class="stat">
            <strong>10K+</strong>
            <span>Mijozlar</span>
          </div>
          <div class="divider"></div>
          <div class="stat">
            <strong>500+</strong>
            <span>Mahsulotlar</span>
          </div>
          <div class="divider"></div>
          <div class="stat">
            <strong>4.9⭐</strong>
            <span>Reyting</span>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="image-frame">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop"
            alt="Fresh produce"
          />
          <div class="float-card card-1">
            <span>✅</span> Yetkazib beriladi!
          </div>
          <div class="float-card card-2">
            <span>🔥</span> 20% chegirma
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 90vh;
  background: linear-gradient(135deg, #020617 0%, #0c1a3a 50%, #0f172a 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.hero-bg { position: absolute; inset: 0; }

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
}

.blob-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #2563eb, transparent);
  top: -200px; right: -100px;
  animation: float 8s ease-in-out infinite;
}

.blob-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #38bdf8, transparent);
  bottom: -100px; left: -50px;
  animation: float 10s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: auto;
  padding: 80px 5%;
  display: flex;
  align-items: center;
  gap: 60px;
}

.left { flex: 1; color: white; }

.eyebrow {
  display: inline-block;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  padding: 8px 18px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
}

h1 {
  font-size: clamp(38px, 5vw, 62px);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 20px;
}

.highlight {
  background: linear-gradient(90deg, #38bdf8, #6366f1);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  color: #94a3b8;
  font-size: 17px;
  line-height: 1.7;
  max-width: 480px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 35px rgba(37, 99, 235, 0.5); }

.btn-secondary {
  background: rgba(255,255,255,0.08);
  color: white;
  border: 1px solid rgba(255,255,255,0.15);
  padding: 16px 28px;
  border-radius: 14px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover { background: rgba(255,255,255,0.15); }

.stats {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 44px;
}

.stat strong {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.stat span {
  font-size: 13px;
  color: #64748b;
}

.divider {
  width: 1px;
  height: 40px;
  background: rgba(255,255,255,0.12);
}

.right { flex: 1; display: flex; justify-content: center; }

.image-frame {
  position: relative;
  max-width: 480px;
  width: 100%;
}

.image-frame img {
  width: 100%;
  border-radius: 30px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.5);
}

.float-card {
  position: absolute;
  background: white;
  padding: 12px 20px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #1a202c;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  animation: float 4s ease-in-out infinite;
}

.card-1 { bottom: 30px; left: -20px; }
.card-2 { top: 30px; right: -20px; animation-delay: 2s; }

@media (max-width: 900px) {
  .hero-content { flex-direction: column; text-align: center; padding: 60px 5%; }
  p { margin: auto; }
  .hero-actions { justify-content: center; }
  .stats { justify-content: center; }
  .right { width: 100%; max-width: 400px; }
  .card-1 { left: 0; }
  .card-2 { right: 0; }
}
</style>
