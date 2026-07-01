<script setup>
import { ref, onMounted, computed, inject } from 'vue';
import defaultProducts from "../data/products.js";

const showToast = inject("showToast", () => {});

// MockAPI URL
const MOCKAPI_URL = "https://6a3c40e4e4a07f202e16a52c.mockapi.io/sevimli/cart";

// State variables
const products = ref([]);
const loading = ref(true);
const error = ref(null);
const search = ref("");
const selectedCategory = ref("");

// Seeder (Import) State
const seeding = ref(false);
const seedProgress = ref(0);
const seedTotal = ref(0);

// Modal states
const showModal = ref(false);
const modalMode = ref("add"); // 'add' or 'edit'
const editingProductId = ref(null);

const form = ref({
  name: "",
  category: "Mevalar",
  price: 0,
  stock: 0,
  barcode: "",
  unit: "kg",
  image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
  description: ""
});

// Categories list for filtering/selecting
const categories = ["Mevalar", "Sabzavotlar", "Sut mahsulotlari", "Goshtlar", "Shirinliklar", "Ichimliklar"];

const fetchProducts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch(MOCKAPI_URL);
    if (res.status === 404) {
      throw new Error("MockAPI da 'products' resursi hali yaratilmagan. Iltimos, MockAPI loyihangizda 'products' resursini yarating.");
    }
    if (!res.ok) throw new Error("MockAPI ma'lumotlarini yuklashda xatolik yuz berdi.");
    products.value = await res.json();
  } catch (err) {
    console.error(err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Seed Products logic
const seedProducts = async () => {
  if (!confirm("Boshlang'ich mahsulotlar to'plamini (15 ta mahsulot) MockAPI ga yuklamoqchimisiz?")) return;
  seeding.value = true;
  seedProgress.value = 0;
  
  // Pick first 15 products to seed
  const itemsToSeed = defaultProducts.slice(0, 15);
  seedTotal.value = itemsToSeed.length;

  try {
    for (let i = 0; i < itemsToSeed.length; i++) {
      const p = itemsToSeed[i];
      // Adapt local products data structure
      const newProduct = {
        name: p.name || p.title,
        category: p.category || "Mevalar",
        price: Number(p.price || 0),
        stock: Number(p.stock || Math.floor(Math.random() * 100) + 10), // Random stock if empty
        barcode: p.barcode || "478" + Math.floor(Math.random() * 1000000000),
        unit: p.unit || "kg",
        image: p.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
        description: p.description || ""
      };

      const res = await fetch(MOCKAPI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
      });

      if (!res.ok) throw new Error("Mahsulotni yuklashda API xatolik berdi.");
      seedProgress.value = i + 1;
      // Small delay to avoid API rate limits
      await new Promise(r => setTimeout(r, 150));
    }

    showToast("Mahsulotlar muvaffaqiyatli import qilindi! 🎉", "success");
    await fetchProducts();
  } catch (err) {
    console.error(err);
    showToast("Import qilishda xatolik yuz berdi: " + err.message, "error");
  } finally {
    seeding.value = false;
  }
};

// Delete Product
const handleDelete = async (id) => {
  if (!confirm("Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?")) return;
  try {
    const res = await fetch(`${MOCKAPI_URL}/${id}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Mahsulotni o'chirishda xatolik yuz berdi.");
    products.value = products.value.filter(p => p.id !== id);
    showToast("Mahsulot o'chirildi! 🗑️", "success");
  } catch (err) {
    console.error(err);
    showToast(err.message, "error");
  }
};

// Open Modals
const openAddModal = () => {
  modalMode.value = "add";
  editingProductId.value = null;
  form.value = {
    name: "",
    category: "Mevalar",
    price: 0,
    stock: 10,
    barcode: "478" + Math.floor(Math.random() * 1000000000),
    unit: "dona",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
    description: ""
  };
  showModal.value = true;
};

const openEditModal = (product) => {
  modalMode.value = "edit";
  editingProductId.value = product.id;
  form.value = {
    name: product.name,
    category: product.category,
    price: Number(product.price),
    stock: Number(product.stock),
    barcode: product.barcode,
    unit: product.unit || "dona",
    image: product.image,
    description: product.description || ""
  };
  showModal.value = true;
};

// Save Product (Create or Update)
const saveProduct = async () => {
  if (!form.value.name || form.value.price <= 0 || form.value.stock < 0) {
    showToast("Iltimos, barcha majburiy maydonlarni to'ldiring!", "error");
    return;
  }

  const payload = {
    name: form.value.name,
    category: form.value.category,
    price: Number(form.value.price),
    stock: Number(form.value.stock),
    barcode: form.value.barcode,
    unit: form.value.unit,
    image: form.value.image,
    description: form.value.description
  };

  try {
    if (modalMode.value === "add") {
      const res = await fetch(MOCKAPI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Mahsulot qo'shishda xatolik.");
      const data = await res.json();
      products.value.push(data);
      showToast("Yangi mahsulot qo'shildi! ➕", "success");
    } else {
      const res = await fetch(`${MOCKAPI_URL}/${editingProductId.value}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Mahsulotni yangilashda xatolik.");
      const data = await res.json();
      const index = products.value.findIndex(p => p.id === editingProductId.value);
      if (index !== -1) products.value[index] = data;
      showToast("Mahsulot ma'lumotlari yangilandi! 💾", "success");
    }
    showModal.value = false;
  } catch (err) {
    console.error(err);
    showToast(err.message, "error");
  }
};

// Filtered products list
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.value.toLowerCase()) || 
                        (p.barcode && p.barcode.includes(search.value));
    const matchCat = !selectedCategory.value || p.category === selectedCategory.value;
    return matchSearch && matchCat;
  });
});

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="products-page">
    <!-- Header -->
    <div class="page-header">
      <div class="title-section">
        <h2>📦 Mahsulotlar ro'yxati</h2>
        <p class="subtitle">MockAPI orqali mahsulotlarni do'kon bo'yicha boshqarish</p>
      </div>
      <div class="action-buttons">
        <button v-if="products.length === 0 && !loading" class="seed-btn" @click="seedProducts" :disabled="seeding">
          {{ seeding ? `Import qilinmoqda (${seedProgress}/${seedTotal})...` : '📥 Boshlang\'ich mahsulotlarni import qilish' }}
        </button>
        <button class="add-btn" @click="openAddModal">
          ➕ Yangi qo'shish
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-card">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" placeholder="Mahsulot nomi yoki shtrix-kodi bo'yicha qidirish..." />
      </div>
      <div class="category-select">
        <select v-model="selectedCategory">
          <option value="">Barcha kategoriyalar</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <!-- Loading & Error -->
    <div v-if="loading && products.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Mahsulotlar ro'yxati yuklanmoqda...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>MockAPI bilan ulanishda xatolik</h3>
      <p>{{ error }}</p>
      <button @click="fetchProducts" class="retry-btn">Qayta urinish</button>
    </div>

    <!-- Empty Database UI -->
    <div v-else-if="products.length === 0" class="empty-state">
      <div class="empty-icon">📂</div>
      <h3>Hozircha mahsulotlar mavjud emas</h3>
      <p>MockAPI ma'lumotlar bazasi bo'sh. Sayt mahsulotlarini import qilish tugmasini bosing yoki qo'lda qo'shing.</p>
      <button class="seed-btn" @click="seedProducts" :disabled="seeding">
        {{ seeding ? `Yuklanmoqda... (${seedProgress}/${seedTotal})` : '📥 Boshlang\'ich mahsulotlarni import qilish' }}
      </button>
    </div>

    <!-- Products Table -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Rasm</th>
            <th>Mahsulot nomi</th>
            <th>Kategoriya</th>
            <th>Shtrix-kod</th>
            <th>Narxi</th>
            <th>Qoldiq</th>
            <th class="actions-th">Harakatlar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td class="td-img">
              <img :src="product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop'" alt="product image" class="prod-thumbnail" />
            </td>
            <td class="td-name">
              <div class="name-wrapper">
                <span class="prod-name">{{ product.name }}</span>
                <span class="prod-desc-sub">{{ product.description ? product.description.substring(0, 45) + '...' : 'Tavsif kiritilmagan' }}</span>
              </div>
            </td>
            <td>
              <span class="cat-badge">{{ product.category }}</span>
            </td>
            <td><code>{{ product.barcode || 'Mavjud emas' }}</code></td>
            <td class="price-val">{{ Number(product.price).toLocaleString() }} so'm</td>
            <td :class="{ 'low-stock': Number(product.stock) < 10, 'normal-stock': Number(product.stock) >= 10 }">
              {{ product.stock }} {{ product.unit || 'dona' }}
              <span v-if="Number(product.stock) < 10" class="low-stock-label">Kam qoldi!</span>
            </td>
            <td class="actions-td">
              <button class="edit-btn" @click="openEditModal(product)">✏️ Tahrirlash</button>
              <button class="delete-btn" @click="handleDelete(product.id)">🗑️ O'chirish</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Seed Loading Overlay -->
    <div v-if="seeding" class="modal-overlay">
      <div class="modal-card seed-modal">
        <h3>📥 Mahsulotlar import qilinmoqda</h3>
        <p>Iltimos, MockAPI ma'lumotlar bazasini yuklash tugashini kuting.</p>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" :style="{ width: (seedProgress / seedTotal * 100) + '%' }"></div>
        </div>
        <div class="progress-text">{{ seedProgress }} / {{ seedTotal }} ta mahsulot yuklandi</div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ modalMode === 'add' ? '➕ Yangi mahsulot qo\'shish' : '✏️ Mahsulotni tahrirlash' }}</h3>
          <button class="close-btn" @click="showModal = false">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group span-2">
              <label>Mahsulot nomi *</label>
              <input v-model="form.name" type="text" placeholder="Masalan: Coca-Cola 1.5L" required />
            </div>

            <div class="form-group">
              <label>Kategoriya</label>
              <select v-model="form.category">
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Narxi (so'm) *</label>
              <input v-model.number="form.price" type="number" min="0" placeholder="15000" required />
            </div>

            <div class="form-group">
              <label>Shtrix-kod</label>
              <input v-model="form.barcode" type="text" placeholder="478001234567" />
            </div>

            <div class="form-group">
              <label>Qoldiq (Soni) *</label>
              <input v-model.number="form.stock" type="number" min="0" required />
            </div>

            <div class="form-group">
              <label>O'lchov birligi</label>
              <select v-model="form.unit">
                <option value="dona">dona</option>
                <option value="kg">kg</option>
                <option value="litr">litr</option>
                <option value="paket">paket</option>
              </select>
            </div>

            <div class="form-group span-2">
              <label>Rasm URL manzili</label>
              <input v-model="form.image" type="text" placeholder="https://images.unsplash.com/..." />
            </div>

            <div class="form-group span-2">
              <label>Tavsif (Qisqacha)</label>
              <textarea v-model="form.description" rows="3" placeholder="Mahsulot haqida ma'lumot kiriting..."></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="showModal = false">Bekor qilish</button>
          <button class="save-btn" @click="saveProduct">Saqlash</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.title-section h2 {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}

.title-section .subtitle {
  color: #64748b;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.add-btn {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
}

.add-btn:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
}

.seed-btn {
  background-color: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.seed-btn:hover:not(:disabled) {
  background-color: #d1fae5;
  color: #047857;
}

.seed-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Filters Card */
.filters-card {
  background: white;
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  position: relative;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 10px 14px 10px 42px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  outline: none;
  font-size: 14px;
  transition: all 0.2s;
}

.search-box input:focus {
  border-color: #0284c7;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.1);
}

.category-select select {
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  outline: none;
  font-size: 14px;
  cursor: pointer;
}

/* Table Card */
.table-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  overflow-x: auto;
  border: 1px solid #e2e8f0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 14px;
}

.data-table tbody tr:hover {
  background-color: #f8fafc;
}

.prod-thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.prod-name {
  font-weight: 700;
  color: #0f172a;
}

.prod-desc-sub {
  font-size: 12px;
  color: #94a3b8;
}

.cat-badge {
  background-color: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.price-val {
  font-weight: 700;
  color: #0f172a;
}

.low-stock {
  color: #ef4444;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.low-stock-label {
  background-color: #fef2f2;
  color: #ef4444;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.normal-stock {
  font-weight: 500;
  color: #10b981;
}

code {
  background-color: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}

.actions-th {
  text-align: right;
}

.actions-td {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.actions-td button {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.actions-td .edit-btn:hover {
  background-color: #eff6ff;
  border-color: #3b82f6;
  color: #2563eb;
}

.actions-td .delete-btn:hover {
  background-color: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

/* Modals & Overlays */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #94a3b8;
}

.close-btn:hover {
  color: #0f172a;
}

.modal-body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.span-2 {
  grid-column: span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.form-group input, 
.form-group select, 
.form-group textarea {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus, 
.form-group select:focus, 
.form-group textarea:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #f1f5f9;
}

.save-btn {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.save-btn:hover {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
}

/* Loading & Error States */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 60px 24px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  border: 1px solid #e2e8f0;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top-color: #0284c7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3, .error-state h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.empty-state p, .error-state p {
  color: #64748b;
  margin-bottom: 20px;
}

/* Seed Modal specific */
.seed-modal {
  padding: 30px;
  text-align: center;
}

.seed-modal h3 {
  font-size: 18px;
  margin-bottom: 6px;
}

.seed-modal p {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 20px;
}

.progress-bar-container {
  height: 12px;
  background-color: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  width: 0%;
  transition: width 0.15s ease-out;
}

.progress-text {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}
</style>