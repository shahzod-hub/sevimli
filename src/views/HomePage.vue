<script setup>
import { ref, computed, onMounted } from "vue";
import HeroSection from "../components/HeroSection.vue";
import SearchBar from "../components/SearchBar.vue";
import CategoryFilter from "../components/CategoryFilter.vue";
import DiscountBanner from "../components/DiscountBanner.vue";
import ProductSlider from "../components/ProductSlider.vue";
import ProductCard from "../components/ProductCard.vue";
import { useProductStore } from "../stores/productStore";

const productStore = useProductStore();
const search = ref("");
const category = ref("");
const showDiscountBanner = ref(true);

const filteredProducts = computed(() => {
  return productStore.activeProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.value.toLowerCase()) ||
                        p.description.toLowerCase().includes(search.value.toLowerCase());
    const matchCat = !category.value || (p.category && p.category.toLowerCase() === category.value.toLowerCase());
    return matchSearch && matchCat;
  });
});

onMounted(() => {
  productStore.ensureLoaded();
  try {
    const saved = JSON.parse(localStorage.getItem('sevimli_settings') || '{}');
    showDiscountBanner.value = saved.showDiscountBanner !== false;
  } catch (e) {
    showDiscountBanner.value = true;
  }
});
</script>

<template>
  <HeroSection />

  <DiscountBanner v-if="showDiscountBanner" />

  <div id="products" class="container">
    <SearchBar v-model="search" />
    <CategoryFilter v-model="category" />

    <div class="section-title">
      <h2>Mahsulotlar <span class="count">{{ filteredProducts.length }}</span></h2>
      <p v-if="search || category">
        {{ category || 'Barchasi' }}
        <span v-if="search"> · "{{ search }}" bo'yicha</span>
      </p>
    </div>

    <div v-if="filteredProducts.length > 0" class="products">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>

    <div v-else class="empty">
      <div class="empty-icon">🔍</div>
      <h3>Mahsulot topilmadi</h3>
      <p>"{{ search }}" bo'yicha hech narsa topilmadi</p>
      <button @click="search = ''; category = ''">Filterni tozalash</button>
    </div>
  </div>

  <ProductSlider />
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: auto;
  padding: 50px 5%;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.section-title h2 {
  font-size: 24px;
  font-weight: 800;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 10px;
}

.count {
  background: #2563eb;
  color: white;
  font-size: 13px;
  padding: 3px 10px;
  border-radius: 20px;
}

.section-title p {
  color: #94a3b8;
  font-size: 14px;
}

.products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.empty {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 24px;
}

.empty-icon { font-size: 60px; margin-bottom: 16px; }

.empty h3 { font-size: 22px; color: #1a202c; margin-bottom: 8px; }

.empty p { color: #94a3b8; margin-bottom: 24px; }

.empty button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.2s;
}

.empty button:hover { background: #1d4ed8; }
</style>
