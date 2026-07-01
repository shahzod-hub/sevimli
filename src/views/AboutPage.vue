<template>
  <div class="page">
    <div class="hero">
      <div class="hero-text">
        <span class="eyebrow">🌿 Biz haqimizda</span>
        <h1>Surxondaryoning Eng Yaxshi Online Supermarketi</h1>
        <p>
          2020-yildan buyon xizmat ko'rsatib kelayotgan SuperMarket — yangi va
          sifatli mahsulotlarni uyingizga yetkazib beradi.
        </p>
      </div>
      <img src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&h=400&fit=crop" alt="About" />
    </div>

    <div class="stats-row">
      <div class="stat">
        <strong>10,000+</strong>
        <span>Mamnun mijozlar</span>
      </div>
      <div class="stat">
        <strong>500+</strong>
        <span>Mahsulot turlari</span>
      </div>
      <div class="stat">
        <strong>50+</strong>
        <span>Yetkazib berish nuqtalari</span>
      </div>
      <div class="stat">
        <strong>4.9 ⭐</strong>
        <span>O'rtacha reyting</span>
      </div>
    </div>

    <div class="values">
      <h2>Nima uchun biz?</h2>
      <div class="values-grid">
        <div class="value-card" v-for="v in values" :key="v.title">
          <div class="v-icon">{{ v.icon }}</div>
          <h3>{{ v.title }}</h3>
          <p>{{ v.desc }}</p>
        </div>
      </div>
    </div>

    <div class="team">
      <h2>Bizning jamoa</h2>
      <div class="team-grid">
        <div class="team-card" v-for="member in team" :key="member.name">
          <img :src="member.photo" :alt="member.name" />
          <h3>{{ member.name }}</h3>
          <p>{{ member.role }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const values = [
  { icon: "🌱", title: "Yangilik", desc: "Faqat yangi va mavsumiy mahsulotlar. Har kuni ertalab fermerlardan olinadi." },
  { icon: "⚡", title: "Tezlik", desc: "1-3 soat ichida eshigingizga yetkazib beramiz." },
  { icon: "💎", title: "Sifat", desc: "Har bir mahsulot sifat nazoratidan o'tadi." },
  { icon: "💰", title: "Narx", desc: "Bozor narxidan past. Chegirmalar va aksiyalar doimo mavjud." },
  { icon: "🔒", title: "Xavfsizlik", desc: "To'lovlaringiz 100% himoyalangan." },
  { icon: "🤝", title: "Ishonch", desc: "5 yillik tajriba va minglab mamnun mijozlar." },
];

const team = [
  { name: "Sardor Karimov", role: "Bosh direktor", photo: "https://i.pravatar.cc/150?img=12" },
  { name: "Nilufar Rashidova", role: "Marketing", photo: "https://i.pravatar.cc/150?img=47" },
  { name: "Jasur Toshmatov", role: "Yetkazib berish", photo: "https://i.pravatar.cc/150?img=33" },
  { name: "Malika Yusupova", role: "Mijozlar xizmati", photo: "https://i.pravatar.cc/150?img=48" },
];
</script>

<style scoped>
.page { max-width: 1200px; margin: auto; padding: 60px 5%; }

.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  margin-bottom: 70px;
}

.eyebrow {
  display: inline-block;
  background: #f0fdf4;
  color: #16a34a;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

h1 {
  font-size: 38px;
  font-weight: 800;
  color: #1a202c;
  line-height: 1.2;
  margin-bottom: 16px;
}

.hero p { color: #64748b; line-height: 1.7; font-size: 17px; }

.hero img {
  width: 100%;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 70px;
}

.stat { text-align: center; color: white; }

.stat strong {
  display: block;
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 8px;
}

.stat span { font-size: 14px; color: #bfdbfe; }

.values h2, .team h2 {
  font-size: 28px;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 32px;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 70px;
}

.value-card {
  background: white;
  padding: 28px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  transition: all 0.3s;
}

.value-card:hover { transform: translateY(-5px); }

.v-icon { font-size: 36px; margin-bottom: 14px; }

.value-card h3 { font-size: 18px; font-weight: 700; color: #1a202c; margin-bottom: 8px; }

.value-card p { color: #64748b; line-height: 1.6; font-size: 14px; }

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.team-card {
  background: white;
  padding: 28px 20px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  transition: all 0.3s;
}

.team-card:hover { transform: translateY(-5px); }

.team-card img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 14px;
  border: 4px solid #eff6ff;
}

.team-card h3 { font-size: 16px; font-weight: 700; color: #1a202c; margin-bottom: 4px; }

.team-card p { color: #2563eb; font-size: 13px; font-weight: 500; }

@media (max-width: 768px) {
  .hero { grid-template-columns: 1fr; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  h1 { font-size: 28px; }
}
</style>
