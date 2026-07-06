<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <p class="subtitle">Boshqaruv paneli</p>
        <h1>Admin Dashboard</h1>
      </div>
      <div class="header-actions">
        <button class="refresh-btn" @click="refreshAll">Yangilash</button>
        <button class="btn secondary" @click="logout">Chiqish</button>
      </div>
    </div>

    <div class="dashboard-metrics">
      <div class="metric-card">
        <span>Mahsulotlar</span>
        <strong>{{ products.length }}</strong>
      </div>
      <div class="metric-card">
        <span>Buyurtmalar</span>
        <strong>{{ orders.length }}</strong>
      </div>
      <div class="metric-card">
        <span>Foydalanuvchilar</span>
        <strong>{{ users.length }}</strong>
      </div>
    </div>

    <div class="tabs">
      <button :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">Mahsulotlar</button>
      <button :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">Buyurtmalar</button>
      <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">Foydalanuvchilar</button>
      <button :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">Sozlamalar</button>
    </div>

    <div class="panel-body">
      <div v-if="error" class="error-banner">{{ error }}</div>
      <div v-if="loading" class="admin-loading">
        <div class="loader"></div>
        <p>Ma'lumotlar yuklanmoqda...</p>
      </div>

      <div v-else>
        <div v-if="activeTab === 'products'">
          <div class="section-header">
            <div>
              <h2>Mahsulotlarni boshqarish</h2>
              <p>MockAPI orqali mahsulotlarni qo'shish, tahrirlash va o'chirish.</p>
            </div>
            <div class="section-actions">
              <button class="btn secondary" @click="openAddProductModal">➕ Yangi mahsulot</button>
              <button class="btn secondary" @click="importProductsFromLocal" :disabled="importLoading">
                {{ importLoading ? 'Import qilinmoqda...' : 'Mahsulotlarni import qilish' }}
              </button>
              <button class="btn secondary" @click="exportProductsCSV">📤 Export CSV</button>
            </div>
          </div>

          <div class="table-toolbar">
            <input v-model="productSearch" type="text" placeholder="Mahsulotlar bo'yicha qidirish..." />
            <select v-model="productCategory">
              <option value="">Barcha kategoriyalar</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div v-if="products.length === 0" class="empty-state">
            <p>Mahsulotlar hali mavjud emas.</p>
          </div>

          <div v-else class="data-grid">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Nomi</th>
                  <th>Kategoriya</th>
                  <th>Narxi</th>
                  <th>Qoldiq</th>
                  <th>Status</th>
                  <th>Amal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in filteredProducts" :key="product.id">
                  <td>{{ product.name }}</td>
                  <td>{{ product.category }}</td>
                  <td>{{ formatCurrency(product.price) }}</td>
                  <td>{{ product.stock ?? 0 }} {{ product.unit || 'dona' }}</td>
                  <td>{{ product.active === false ? 'Faol emas' : 'Faol' }}</td>
                  <td class="row-actions">
                    <button class="btn small" @click="openEditProductModal(product)">Tahrirlash</button>
                    <button class="btn small danger" @click="deleteProduct(product.id)">O'chirish</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else-if="activeTab === 'orders'">
          <div class="section-header">
              <div>
                <h2>Buyurtmalar</h2>
                <p>Mijoz buyurtmalarini ko'rish va holatini o'zgartirish.</p>
              </div>
              <div class="section-actions">
                <button class="btn secondary" @click="exportOrdersCSV">📤 Export CSV</button>
              </div>
            </div>

          <div class="table-toolbar">
            <input v-model="orderSearch" type="text" placeholder="Mijoz yoki buyurtma bo'yicha qidirish..." />
            <select v-model="orderStatusFilter">
              <option value="">Barcha holatlar</option>
              <option value="new">Yangi</option>
              <option value="processing">Jarayonda</option>
              <option value="completed">Tugallangan</option>
              <option value="cancelled">Bekor qilingan</option>
            </select>
          </div>

          <div v-if="orders.length === 0" class="empty-state">
            <p>Buyurtma yo'q.</p>
          </div>

          <div v-else class="data-grid">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Buyurtmachi</th>
                  <th>Tel</th>
                  <th>Jami</th>
                  <th>Holat</th>
                  <th>Sana</th>
                  <th>Amal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in filteredOrders" :key="order.id">
                  <td>{{ order.customerName }}</td>
                  <td>{{ order.customerPhone }}</td>
                  <td>{{ formatCurrency(order.totalPrice) }}</td>
                  <td>{{ order.status || 'new' }}</td>
                  <td>{{ formatDate(order.createdAt) }}</td>
                  <td class="row-actions">
                    <button class="btn small" @click="viewOrderDetails(order)">Ko'rish</button>
                    <button class="btn small" @click="updateOrderStatus(order, 'processing')">Jarayonda</button>
                    <button class="btn small" @click="updateOrderStatus(order, 'completed')">Tugallandi</button>
                    <button class="btn small danger" @click="updateOrderStatus(order, 'cancelled')">Bekor</button>
                    <button class="btn small danger outline" @click="deleteOrder(order.id)">O'chirish</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else-if="activeTab === 'users'">
          <div class="section-header">
            <div>
              <h2>Foydalanuvchilar</h2>
              <p>Registratsiyadan o'tgan mijozlar va adminlar ro'yxati.</p>
            </div>
          </div>

          <div class="table-toolbar">
            <input v-model="userSearch" type="text" placeholder="Foydalanuvchi bo'yicha qidirish..." />
          </div>

          <div v-if="users.length === 0" class="empty-state">
            <p>Hali foydalanuvchilar mavjud emas.</p>
          </div>

          <div v-else class="data-grid">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Ism</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Amal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.role || 'customer' }}</td>
                  <td class="row-actions">
                    <button
                      v-if="user.role !== 'admin'"
                      class="btn small"
                      @click="changeUserRole(user, 'admin')"
                    >Admin berish</button>
                    <button
                      v-else
                      class="btn small danger outline"
                      @click="changeUserRole(user, 'customer')"
                    >Admin olib tashlash</button>
                    <button
                      class="btn small danger"
                      @click="deleteUser(user.id)"
                    >O'chirish</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else-if="activeTab === 'settings'" class="settings-section">
          <div class="settings-card">
            <h3>Sayt sozlamalari</h3>
            <div class="setting-row">
              <label class="switch-container">
                <input type="checkbox" v-model="settings.showDiscountBanner" @change="saveSettings" />
                <span class="slider"></span>
              </label>
              <span class="setting-label">Bosh sahifada chegirmalar bannerini ko'rsatish</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
         <h3>{{ modalMode === 'add' ? "Yangi mahsulot qo'shish" : "Mahsulotni tahrirlash" }}</h3>
          <button @click="showModal = false" class="close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <label>
              Nomi
              <input v-model="productForm.name" placeholder="Masalan: Olma" />
            </label>
            <label>
              Kategoriya
              <select v-model="productForm.category">
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </label>
            <label>
              Narxi
              <input type="number" v-model.number="productForm.price" />
            </label>
            <label>
              Qoldiq
              <input type="number" v-model.number="productForm.stock" />
            </label>
            <label>
              Birlik
              <input v-model="productForm.unit" />
            </label>
            <label>
              URL rasm
              <input v-model="productForm.image" />
            </label>
            <label class="span-2">
              Tavsif
              <textarea v-model="productForm.description" rows="4"></textarea>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn secondary" @click="showModal = false">Bekor qilish</button>
          <button class="btn" @click="saveProduct">Saqlash</button>
        </div>
      </div>
    </div>
  </div>
  
    <div v-if="showOrderModal" class="modal-overlay" @click.self="showOrderModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Buyurtma tafsilotlari</h3>
          <button @click="showOrderModal = false" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="orderDetail">
            <p><strong>Buyurtmachi:</strong> {{ orderDetail.customerName }}</p>
            <p><strong>Tel:</strong> {{ orderDetail.customerPhone }}</p>
            <p><strong>Manzil:</strong> {{ orderDetail.customerAddress }}</p>
            <p><strong>Jami:</strong> {{ formatCurrency(orderDetail.totalPrice) }}</p>
            <h4>Mavjud mahsulotlar:</h4>
            <ul>
              <li v-for="(it, idx) in (orderDetail.items || [])" :key="idx">
                {{ it.name }} — {{ it.quantity }} x {{ formatCurrency(it.price) }} = {{ formatCurrency((it.quantity || 0) * (it.price || 0)) }}
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="showOrderModal = false">Yopish</button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useProductStore } from '../stores/productStore'
import localProducts from '../data/products'

const showToast = inject('showToast', () => {})
const API_BASE = 'https://6a3c40e4e4a07f202e16a52c.mockapi.io/sevimli'
const PRODUCTS_URL = `${API_BASE}/cart`
const ORDERS_URL = `${API_BASE}/cart`
const USERS_URL = `${API_BASE}/sevimli`
const ORDERS_STORAGE_KEY = 'sevimli_admin_orders'
const USERS_STORAGE_KEY = 'sevimli_mock_users'

const activeTab = ref('products')
const settings = ref({
  showDiscountBanner: true,
})
const loading = ref(false)
const error = ref('')

const productStore = useProductStore()
const products = computed(() => productStore.products)
const orders = ref([])
const users = ref([])

const currentUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
})

const productSearch = ref('')
const productCategory = ref('')
const orderSearch = ref('')
const orderStatusFilter = ref('')
const userSearch = ref('')

const showModal = ref(false)
const showOrderModal = ref(false)
const modalMode = ref('add')
const editingProductId = ref(null)
const importLoading = ref(false)
const orderDetail = ref(null)
const productForm = ref({
  name: '',
  category: 'Mevalar',
  price: 0,
  stock: 0,
  unit: 'dona',
  image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
  description: '',
  active: true,
})

const fallbackCategories = [
  'Mevalar',
  'Sabzavotlar',
  'Sut mahsulotlari',
  "Go'shtlar",
  'Shirinliklar',
  'Ichimliklar',
  'Quruq mevalar & choylar',
]

const normalizeCategory = (category) => {
  const value = String(category || '').trim()
  const normalized = value.toLowerCase().replace(/ʻ|‘|`/g, "'")

  if (!value || value.includes(',')) return ''
  if (normalized === 'goshtlar' || normalized === "go'shtlar" || normalized === "go'shlar") return "Go'shtlar"
  if (normalized === 'sut mahsulotlar' || normalized === 'sut mahsulotlari') return 'Sut mahsulotlari'
  if (normalized === 'quruq mevalar & choylar') return 'Quruq mevalar & choylar'

  return value
}

const categories = computed(() => {
  const names = [...fallbackCategories, ...productStore.categories].map(normalizeCategory).filter(Boolean)
  return [...new Set(names)]
})

const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const nameMatch = product.name?.toLowerCase().includes(productSearch.value.toLowerCase())
    const categoryMatch = !productCategory.value || product.category === productCategory.value
    return nameMatch && categoryMatch
  })
})

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const searchValue = orderSearch.value.toLowerCase()
    const matchCustomer =
      order.customerName?.toLowerCase().includes(searchValue) ||
      order.customerPhone?.toLowerCase().includes(searchValue) ||
      order.customerAddress?.toLowerCase().includes(searchValue)
    const statusMatch = !orderStatusFilter.value || (order.status || 'new') === orderStatusFilter.value
    return matchCustomer && statusMatch
  })
})

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const value = userSearch.value.toLowerCase()
    return (
      user.name?.toLowerCase().includes(value) ||
      user.email?.toLowerCase().includes(value)
    )
  })
})

const readStorageArray = (key, fallback = []) => {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return fallback
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const saveOrders = () => {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders.value))
}

const saveUsers = () => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users.value))
}

const normalizeOrder = (order) => ({
  ...order,
  id: order.id || `order_${Date.now()}`,
  customerName: order.customerName || order.name || 'Mijoz',
  customerPhone: order.customerPhone || order.phone || '',
  customerAddress: order.customerAddress || order.address || '',
  totalPrice: Number(order.totalPrice || order.total || 0),
  status: order.status || 'new',
  createdAt: order.createdAt || new Date().toISOString(),
})

const normalizeProductPayload = (product) => ({
  name: product.name || product.title || '',
  title: product.name || product.title || '',
  category: product.category || categories.value[0],
  price: Number(product.price || 0),
  stock: Number(product.stock || 0),
  unit: product.unit || 'dona',
  image: product.image || '',
  description: product.description || '',
  rating: Number(product.rating || 4.6),
  reviews: Number(product.reviews || 0),
  badge: product.badge || '',
  barcode: product.barcode || '',
  active: product.active !== false,
})

const fetchProducts = async () => {
  loading.value = true
  error.value = ''
  try {
    productStore.ensureLoaded()
    const res = await fetch(PRODUCTS_URL, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) throw new Error('MockAPI mahsulotlari yuklanmadi.')
    const data = await res.json()
    const remoteProducts = Array.isArray(data)
      ? data.filter((item) => item.name && !item.customerName && !item.customerAddress)
      : []
    if (remoteProducts.length) productStore.setProducts(remoteProducts)
  } catch (err) {
    if (!products.value.length) error.value = err.message
  } finally {
    loading.value = false
  }
}

const fetchOrders = async () => {
  loading.value = true
  error.value = ''
  orders.value = readStorageArray(ORDERS_STORAGE_KEY).map(normalizeOrder)
  try {
    const res = await fetch(ORDERS_URL, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) throw new Error('Buyurtmalar yuklanmadi.')
    const data = await res.json()
    const remoteOrders = Array.isArray(data)
      ? data.filter((item) => item.customerName || item.customerAddress)
          .map(normalizeOrder)
      : []
    if (remoteOrders.length) {
      orders.value = remoteOrders
      saveOrders()
    }
  } catch (err) {
    if (!orders.value.length) error.value = err.message
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  users.value = readStorageArray(USERS_STORAGE_KEY, [
    {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@sevimli.uz',
      phone: '+998901234567',
      password: 'admin123',
      role: 'admin',
    },
  ])
  try {
    const res = await fetch(USERS_URL, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) throw new Error('Foydalanuvchilar yuklanmadi.')
    const data = await res.json()
    if (Array.isArray(data)) {
      const merged = [...data]
      const remoteEmails = new Set(data.map(u => u.email.toLowerCase()))
      
      const defaultUsers = [
        {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@sevimli.uz',
          phone: '+998901234567',
          password: 'admin123',
          role: 'admin',
        },
        {
          id: '1',
          name: 'Ali Test',
          email: 'ali@test.com',
          phone: '+998901234567',
          password: 'password123',
          role: 'customer',
        }
      ]
      
      defaultUsers.forEach(defUser => {
        if (!remoteEmails.has(defUser.email.toLowerCase())) {
          merged.push(defUser)
        }
      })
      
      users.value = merged
      saveUsers()
    }
  } catch (err) {
    if (!users.value.length) error.value = err.message
  } finally {
    loading.value = false
  }
}

const refreshAll = async () => {
  await Promise.all([fetchProducts(), fetchOrders(), fetchUsers()])
}

const importProductsFromLocal = async () => {
  importLoading.value = true

  try {
    let createdCount = 0
    for (const item of localProducts) {
      const payload = normalizeProductPayload(item)
      const res = await fetch(PRODUCTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const created = await res.json()
        productStore.createProduct(created)
        createdCount += 1
      }
    }
    showToast(`${createdCount} ta mahsulot import qilindi.`, 'success')
  } catch (err) {
    showToast(err.message || 'Mahsulot importida xatolik.', 'error')
  } finally {
    importLoading.value = false
  }
}

const openAddProductModal = () => {
  modalMode.value = 'add'
  editingProductId.value = null
  productForm.value = {
    name: '',
    category: categories.value[0],
    price: 0,
    stock: 10,
    unit: 'dona',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
    description: '',
    active: true,
  }
  showModal.value = true
}

const openEditProductModal = (product) => {
  modalMode.value = 'edit'
  editingProductId.value = product.id
  productForm.value = {
    name: product.name || '',
    category: product.category || categories.value[0],
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    unit: product.unit || 'dona',
    image: product.image || '',
    description: product.description || '',
    active: product.active !== false,
  }
  showModal.value = true
}

const saveProduct = async () => {
  if (!productForm.value.name || productForm.value.price <= 0) {
    showToast('Iltimos, mahsulot nomi va narxini kiriting.', 'error')
    return
  }
  try {
    const payload = {
      ...productForm.value,
      price: Number(productForm.value.price),
      stock: Number(productForm.value.stock),
    }
    if (modalMode.value === 'add') {
      const res = await fetch(PRODUCTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizeProductPayload(payload)),
      })
      if (!res.ok) throw new Error("Mahsulotni MockAPI'ga qo'shib bo'lmadi.")
      const created = await res.json()
      productStore.createProduct(created)
      showToast("Mahsulot qo'shildi.", 'success')
    } else {
      const res = await fetch(`${PRODUCTS_URL}/${editingProductId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizeProductPayload(payload)),
      })
      if (!res.ok) throw new Error("Mahsulotni MockAPI'da yangilab bo'lmadi.")
      const updated = await res.json()
      productStore.updateProduct(editingProductId.value, updated)
      showToast('Mahsulot yangilandi.', 'success')
    }
    showModal.value = false
    return
    let res
    if (modalMode.value === 'add') {
      res = await fetch(PRODUCTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Mahsulot qo‘shishda xatolik yuz berdi.')
      const created = await res.json()
      products.value.unshift(created)
      showToast('Mahsulot qo‘shildi.', 'success')
    } else {
      res = await fetch(`${PRODUCTS_URL}/${editingProductId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Mahsulotni yangilashda xatolik yuz berdi.')
      const updated = await res.json()
      const index = products.value.findIndex((item) => item.id === editingProductId.value)
      if (index !== -1) products.value[index] = updated
      showToast('Mahsulot yangilandi.', 'success')
    }
    showModal.value = false
  } catch (err) {
    showToast(err.message, 'error')
  }
}

const deleteProduct = async (id) => {
  if (!confirm('Mahsulotni o‘chirishni tasdiqlaysizmi?')) return
  try {
    const res = await fetch(`${PRODUCTS_URL}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error("Mahsulotni MockAPI'dan o'chirib bo'lmadi.")
    productStore.deleteProduct(id)
    showToast("Mahsulot o'chirildi.", 'success')
  } catch (err) {
    showToast(err.message, 'error')
  }
}

const updateOrderStatus = async (order, status) => {
  try {
    order.status = status
    saveOrders()
    showToast('Buyurtma holati yangilandi.', 'success')
    return
    const res = await fetch(`${ORDERS_URL}/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...order, status }),
    })
    if (!res.ok) throw new Error('Buyurtma holatini yangilashda xatolik yuz berdi.')
    order.status = status
    showToast('Buyurtma holati yangilandi.', 'success')
  } catch (err) {
    showToast(err.message, 'error')
  }
}

const deleteOrder = async (id) => {
  if (!confirm('Buyurtmani oʻchirishni tasdiqlaysizmi?')) return
  try {
    orders.value = orders.value.filter((order) => order.id !== id)
    saveOrders()
    showToast("Buyurtma o'chirildi.", 'success')
    return
    const res = await fetch(`${ORDERS_URL}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Buyurtmani oʻchirishda xatolik yuz berdi.')
    orders.value = orders.value.filter((order) => order.id !== id)
    showToast('Buyurtma o‘chirildi.', 'success')
  } catch (err) {
    showToast(err.message, 'error')
  }
}

const viewOrderDetails = (order) => {
  orderDetail.value = order
  showOrderModal.value = true
}

const exportToCSV = (filename, rows) => {
  if (!rows || !rows.length) {
    showToast('Eksport uchun maʼlumot topilmadi.', 'error')
    return
  }
  const keys = Object.keys(rows[0])
  const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => '"' + (r[k] ?? '') + '"').join(','))).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.setAttribute('download', filename)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const exportProductsCSV = () => {
  const rows = products.value.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, stock: p.stock }))
  exportToCSV('products.csv', rows)
}

const exportOrdersCSV = () => {
  const rows = orders.value.map(o => ({ id: o.id, customerName: o.customerName, customerPhone: o.customerPhone, totalPrice: o.totalPrice, status: o.status, createdAt: o.createdAt }))
  exportToCSV('orders.csv', rows)
}

const changeUserRole = async (user, role) => {
  try {
    user.role = role
    saveUsers()
    showToast('Foydalanuvchi roli yangilandi.', 'success')
    return
    const res = await fetch(`${USERS_URL}/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, role }),
    })
    if (!res.ok) throw new Error('Foydalanuvchi rolini yangilashda xato bor.')
    user.role = role
    showToast('Foydalanuvchi roli yangilandi.', 'success')
  } catch (err) {
    showToast(err.message, 'error')
  }
}

const deleteUser = async (id) => {
  if (!confirm('Foydalanuvchini oʻchirishni tasdiqlaysizmi?')) return
  if (id === currentUser.value.id) {
    showToast('Oʻzingizni oʻchirib boʻlmaydi.', 'error')
    return
  }

  try {
    users.value = users.value.filter((user) => user.id !== id)
    saveUsers()
    showToast("Foydalanuvchi o'chirildi.", 'success')
    return
    const res = await fetch(`${USERS_URL}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Foydalanuvchini oʻchirishda xatolik yuz berdi.')
    users.value = users.value.filter((user) => user.id !== id)
    showToast('Foydalanuvchi oʻchirildi.', 'success')
  } catch (err) {
    showToast(err.message, 'error')
  }
}

const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  window.location.href = '/signin'
}

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('uz-UZ') + ' so\'m'
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('uz-UZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const loadSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('sevimli_settings') || '{}')
    settings.value.showDiscountBanner = saved.showDiscountBanner !== false
  } catch (e) {
    console.error('Error loading settings:', e)
  }
}

const saveSettings = () => {
  localStorage.setItem('sevimli_settings', JSON.stringify(settings.value))
  showToast('Sozlamalar saqlandi', 'success')
}

onMounted(() => {
  refreshAll()
  loadSettings()
})
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: auto;
  padding: 40px 5%;
  color: #1f2937;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 8px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.tabs button {
  border: 1px solid #d1d5db;
  background: white;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  color: #374151;
  transition: all 0.2s ease;
}

.tabs button.active,
.tabs button:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.section-header,
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.section-actions,
.header-actions {
  display: flex;
  gap: 10px;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.admin-table th,
.admin-table td {
  padding: 16px 18px;
  border-bottom: 1px solid #f3f4f6;
  text-align: left;
  font-size: 14px;
}

.admin-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
}

.admin-table tbody tr:hover {
  background: #f8fafc;
}

.row-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  border: none;
  background: #2563eb;
  color: white;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn.secondary {
  background: #f8fafc;
  color: #111827;
  border: 1px solid #d1d5db;
}

.btn.danger {
  background: #ef4444;
}

.btn.outline {
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.btn.small {
  padding: 8px 12px;
  font-size: 13px;
}

.empty-state,
.admin-loading {
  padding: 24px;
  background: white;
  border-radius: 18px;
  text-align: center;
  color: #4b5563;
}

.loader {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 5px solid rgba(37, 99, 235, 0.16);
  border-top-color: #2563eb;
  animation: spin 1s linear infinite;
  margin: auto 0 18px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 20px;
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.metric-card span {
  display: block;
  color: #64748b;
  margin-bottom: 8px;
}

.metric-card strong {
  font-size: 28px;
  color: #111827;
}

.error-banner {
  background: #fee2e2;
  color: #991b1b;
  padding: 14px 18px;
  border-radius: 16px;
  margin-bottom: 18px;
  border: 1px solid #fecaca;
}

.refresh-btn {
  background: #f8fafc;
  color: #111827;
  border: 1px solid #cbd5e1;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.refresh-btn:hover {
  transform: translateY(-1px);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.data-grid {
  overflow-x: auto;
}

.table-toolbar input,
.table-toolbar select,
.modal-body input,
.modal-body select,
.modal-body textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 14px;
  color: #111827;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 50;
}

.modal-card {
  width: min(900px, 100%);
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.modal-body {
  display: grid;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-grid .span-2 {
  grid-column: span 2;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Sozlamalar bo'limi */
.settings-section {
  padding: 30px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  border: 1px solid #e2e8f0;
}

.settings-card {
  max-width: 600px;
  margin: 0 auto;
}

.settings-card h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.setting-label {
  font-size: 15px;
  font-weight: 500;
  color: #475569;
}

/* Switch styling */
.switch-container {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.switch-container input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #cbd5e1;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2563eb;
}

input:checked + .slider:before {
  transform: translateX(24px);
}
</style>
