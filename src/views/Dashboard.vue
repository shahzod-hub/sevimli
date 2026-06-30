<script setup>
import { ref, onMounted, computed } from "vue";

const loading = ref(true);
const error = ref(null);
const products = ref([]);

const stats = computed(() => {
  if (products.value.length === 0) {
    return {
      total: 0,
      lowStock: 0,
      avgPrice: 0,
      categoriesCount: 0
    };
  }

  const total = products.value.length;
  const lowStock = products.value.filter(p => Number(p.stock) < 10).length;
  const totalPrice = products.value.reduce((sum, p) => sum + Number(p.price || 0), 0);
  const avgPrice = Math.round(totalPrice / total);
  
  const categories = new Set(products.value.map(p => p.category).filter(Boolean));
  const categoriesCount = categories.size;

  return {
    total,
    lowStock,
    avgPrice,
    categoriesCount
  };
});

const lowStockProducts = computed(() => {
  return products.value
    .filter(p => Number(p.stock) < 10)
    .sort((a, b) => Number(a.stock) - Number(b.stock))
    .slice(0, 5);
});

const categoryDistribution = computed(() => {
  const counts = {};
  products.value.forEach(p => {
    if (p.category) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
  });

  const total = products.value.length;
  return Object.entries(counts).map(([name, count]) => ({
    name,
    count,
    percentage: total ? Math.round((count / total) * 100) : 0
  })).sort((a, b) => b.count - a.count);
});

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return "Xayrli tun";
  if (hour < 12) return "Xayrli tong";
  if (hour < 18) return "Xayrli kun";
  return "Xayrli kech";
});

const fetchProducts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch("https://6a3c40e4e4a07f202e16a52c.mockapi.io/sevimli/products");
    if (res.status === 404) {
      throw new Error("MockAPI da 'products' resursi hali yaratilmagan. Iltimos, MockAPI loyihangizda 'products' resursini yarating.");
    }
    if (!res.ok) throw new Error("MockAPI ma'lumotlarini yuklashda xatolik yuz berdi");
    products.value = await res.json();
  } catch (err) {
    console.error(err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="dashboard">
    <!-- Greeting Section -->
    <div class="welcome-banner">
      <div class="welcome-text">
        <h1>{{ greeting }}, Admin! 👋</h1>
        <p>Do'koningizdagi bugungi holat va asosiy statistik ma'lumotlar.</p>
      </div>
      <button class="refresh-btn" @click="fetchProducts" :disabled="loading">
        {{ loading ? 'Yangilanmoqda...' : '🔄 Ma\'lumotlarni yangilash' }}
      </button>
    </div>

    <!-- Loading & Error States -->
    <div v-if="loading && products.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Statistikalar yuklanmoqda...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Ulanishda xatolik yuz berdi</h3>
      <p>{{ error }}</p>
      <button @click="fetchProducts" class="retry-btn">Qayta urinish</button>
    </div>

    <div v-else>
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card border-blue">
          <div class="stat-icon bg-blue-light">📦</div>
          <div class="stat-info">
            <span class="stat-label">Jami mahsulotlar</span>
            <h2 class="stat-value">{{ stats.total }} ta</h2>
          </div>
        </div>

        <div class="stat-card border-red">
          <div class="stat-icon bg-red-light">⚠️</div>
          <div class="stat-info">
            <span class="stat-label">Kam qolganlar (qoldiq < 10)</span>
            <h2 class="stat-value" :class="{ 'text-red': stats.lowStock > 0 }">{{ stats.lowStock }} ta</h2>
          </div>
        </div>

        <div class="stat-card border-green">
          <div class="stat-icon bg-green-light">💰</div>
          <div class="stat-info">
            <span class="stat-label">O'rtacha narx</span>
            <h2 class="stat-value">{{ stats.avgPrice.toLocaleString() }} so'm</h2>
          </div>
        </div>

        <div class="stat-card border-purple">
          <div class="stat-icon bg-purple-light">📂</div>
          <div class="stat-info">
            <span class="stat-label font-small">Kategoriyalar soni</span>
            <h2 class="stat-value">{{ stats.categoriesCount }} ta</h2>
          </div>
        </div>
      </div>

      <!-- Action Required for empty DB -->
      <div v-if="products.length === 0" class="empty-db-alert animate-pulse">
        💡 <b>MockAPI bo'sh!</b> Boshqaruv panelida to'liq hisobotlarni ko'rish uchun
        <router-link to="/admin/products" class="alert-link">Mahsulotlar sahifasiga</router-link>
        o'ting va boshlang'ich mahsulotlar to'plamini yuklang.
      </div>

      <!-- Content Row -->
      <div class="dashboard-row" v-if="products.length > 0">
        <!-- Low Stock list -->
        <div class="card-column list-card">
          <div class="card-header">
            <h3>📉 Kam qolgan mahsulotlar</h3>
            <router-link to="/admin/products" class="view-all-link">Hammasini ko'rish →</router-link>
          </div>
          <div class="card-body">
            <div v-if="lowStockProducts.length === 0" class="empty-list-success">
              ✅ Barcha mahsulotlar yetarli miqdorda mavjud.
            </div>
            <ul v-else class="stock-list">
              <li v-for="product in lowStockProducts" :key="product.id" class="stock-item">
                <div class="product-mini-details">
                  <span class="item-name">{{ product.name }}</span>
                  <span class="item-category">{{ product.category }}</span>
                </div>
                <div class="stock-badge" :class="Number(product.stock) === 0 ? 'bg-red' : 'bg-orange'">
                  Qoldiq: {{ product.stock }} {{ product.unit || 'dona' }}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Category chart -->
        <div class="card-column chart-card">
          <div class="card-header">
            <h3>📊 Kategoriyalar ulushi</h3>
          </div>
          <div class="card-body">
            <div class="category-bars">
              <div v-for="cat in categoryDistribution" :key="cat.name" class="bar-item">
                <div class="bar-labels">
                  <span class="bar-name">{{ cat.name }}</span>
                  <span class="bar-count">{{ cat.count }} ta ({{ cat.percentage }}%)</span>
                </div>
                <div class="bar-bg">
                  <div class="bar-fill" :style="{ width: cat.percentage + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.welcome-banner {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: white;
  padding: 30px;
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.welcome-text h1 {
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 6px;
}

.welcome-text p {
  color: #94a3b8;
  font-size: 15px;
}

.refresh-btn {
  background: #38bdf8;
  color: #0f172a;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.2);
}

.refresh-btn:hover:not(:disabled) {
  background: #0ea5e9;
  transform: translateY(-2px);
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.error-state p {
  color: #64748b;
  margin-bottom: 24px;
}

.retry-btn {
  background: #0f172a;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #1e293b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  border-left: 5px solid transparent;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.border-blue { border-left-color: #3b82f6; }
.border-red { border-left-color: #ef4444; }
.border-green { border-left-color: #10b981; }
.border-purple { border-left-color: #a855f7; }

.stat-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.bg-blue-light { background: #eff6ff; }
.bg-red-light { background: #fef2f2; }
.bg-green-light { background: #ecfdf5; }
.bg-purple-light { background: #faf5ff; }

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.text-red {
  color: #ef4444;
}

.empty-db-alert {
  background-color: #fffbeb;
  border: 1px dashed #f59e0b;
  color: #b45309;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 15px;
}

.alert-link {
  color: #d97706;
  font-weight: 700;
  text-decoration: underline;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .85; }
}

.dashboard-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 992px) {
  .dashboard-row {
    grid-template-columns: 1fr;
  }
}

.card-column {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.view-all-link {
  font-size: 13px;
  color: #0284c7;
  text-decoration: none;
  font-weight: 600;
}

.view-all-link:hover {
  text-decoration: underline;
}

.stock-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}

.product-mini-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.item-category {
  font-size: 12px;
  color: #94a3b8;
}

.stock-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
  color: white;
}

.bg-red { background-color: #ef4444; }
.bg-orange { background-color: #f97316; }

.empty-list-success {
  text-align: center;
  color: #10b981;
  font-weight: 600;
  padding: 40px 0;
}

.category-bars {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.bar-name {
  font-weight: 700;
  color: #334155;
}

.bar-count {
  color: #64748b;
}

.bar-bg {
  height: 8px;
  background-color: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #0284c7);
  border-radius: 10px;
  transition: width 0.8s ease-in-out;
}
</style>
