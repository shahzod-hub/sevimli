<script setup>
const scrollToProducts = () => {
  const productsSection = document.getElementById("products");
  if (productsSection) {
    productsSection.scrollIntoView({ behavior: "smooth" });
  }
};
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const hours = ref(5);
const minutes = ref(42);
const seconds = ref(17);

let timer;

onMounted(() => {
  timer = setInterval(() => {
    if (seconds.value > 0) {
      seconds.value--;
    } else if (minutes.value > 0) {
      minutes.value--;
      seconds.value = 59;
    } else if (hours.value > 0) {
      hours.value--;
      minutes.value = 59;
      seconds.value = 59;
    }
  }, 1000);
});

onUnmounted(() => clearInterval(timer));

const pad = (n) => String(n).padStart(2, "0");
const router = useRouter();
const goToProductsList = () => router.push('/home');
</script>

<template>
  <section class="discount-banner">
    <div class="content">
      <div class="left">
        <span class="badge">🔥 Maxsus taklif</span>
        <h2>Bugungi Chegirmalar!</h2>
        <p>Barcha meva va sabzavotlarga <strong>20% chegirma</strong>. Aksiya cheklangan vaqtga!</p>

        <div class="countdown">
          <div class="time-box">
            <strong>{{ pad(hours) }}</strong>
            <span>Soat</span>
          </div>
          <div class="sep">:</div>
          <div class="time-box">
            <strong>{{ pad(minutes) }}</strong>
            <span>Daqiqa</span>
          </div>
          <div class="sep">:</div>
          <div class="time-box">
            <strong>{{ pad(seconds) }}</strong>
            <span>Soniya</span>
          </div>
        </div>
</div>
       <button class="btn" @click="scrollToProducts">
  Xarid qilish →
</button>
      

      <div class="right">
        <img
          src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&h=400&fit=crop"
          alt="Discount"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.discount-banner {
  max-width: 1200px;
  margin: 50px auto;
  padding: 0 5%;
}

.content {
  background: linear-gradient(135deg, #1e3a8a, #2563eb, #0ea5e9);
  border-radius: 28px;
  padding: 50px;
  display: flex;
  align-items: center;
  gap: 40px;
  overflow: hidden;
  position: relative;
}

.content::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 250px; height: 250px;
  background: rgba(255,255,255,0.06);
  border-radius: 50%;
}

.left { flex: 1; color: white; }

.badge {
  background: rgba(255,255,255,0.2);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

h2 {
  font-size: 2.4rem;
  font-weight: 800;
  margin: 16px 0 12px;
}

p {
  color: #bfdbfe;
  line-height: 1.6;
  font-size: 16px;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 28px 0;
}

.time-box {
  background: rgba(255,255,255,0.15);
  border-radius: 14px;
  padding: 14px 20px;
  text-align: center;
  min-width: 72px;
  backdrop-filter: blur(10px);
}

.time-box strong {
  display: block;
  font-size: 28px;
  font-weight: 800;
  font-family: monospace;
}

.time-box span {
  font-size: 11px;
  color: #bfdbfe;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sep {
  font-size: 28px;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  margin-bottom: 18px;
}

.btn {
  display: inline-block;
  background: white;
  color: #2563eb;
  padding: 14px 28px;
  border-radius: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 15px;
}

.btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }

.right { flex: 1; display: flex; justify-content: flex-end; }

.right img {
  width: 100%;
  max-width: 420px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

@media (max-width: 768px) {
  .content { flex-direction: column; padding: 35px 25px; }
  h2 { font-size: 1.8rem; }
  .right { width: 100%; }
  .right img { max-width: 100%; }
}
</style>
