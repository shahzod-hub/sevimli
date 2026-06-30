<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h1>Buyurtmalar</h1>
        <p>Jami {{ pagination.total }} ta buyurtma</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="exportOrders">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Eksport
        </button>
      </div>
    </div>

    <!-- Stats bar -->
    <div class="stats-bar">
      <div v-for="s in statusStats" :key="s.label" class="stat-card">
        <div class="stat-icon" :style="{ background: s.color + '22', color: s.color }">
          <span>{{ s.emoji }}</span>
        </div>
        <div>
          <p class="stat-num">{{ s.count }}</p>
          <p class="stat-label">{{ s.label }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card filters-card">
      <div class="filter-row">
        <div class="search-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="filters.search" type="text" placeholder="Buyurtma ID yoki mijoz izlash..." class="search-input" />
        </div>
        <select v-model="filters.status" class="filter-select">
          <option value="">Barcha holat</option>
          <option value="pending">Kutilmoqda</option>
          <option value="processing">Jarayonda</option>
          <option value="shipped">Yuborilgan</option>
          <option value="delivered">Yetkazilgan</option>
          <option value="cancelled">Bekor qilingan</option>
        </select>
        <select v-model="filters.payment" class="filter-select">
          <option value="">Barcha to'lov</option>
          <option value="paid">To'langan</option>
          <option value="pending">Kutilmoqda</option>
          <option value="refunded">Qaytarilgan</option>
        </select>
        <input v-model="filters.dateFrom" type="date" class="filter-select" />
        <input v-model="filters.dateTo" type="date" class="filter-select" />
        <button v-if="hasFilters" class="btn-clear" @click="clearFilters">Tozalash</button>
      </div>
    </div>

    <!-- Table -->
    <div class="card table-card">
      <div class="bulk-bar" v-if="selected.length">
        <span>{{ selected.length }} ta tanlandi</span>
        <button class="btn-danger-sm" @click="bulkDelete">O'chirish</button>
        <button class="btn-sm" @click="selected = []">Bekor</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" @change="toggleAll" :checked="isAllSelected" /></th>
              <th>Buyurtma</th>
              <th>Mijoz</th>
              <th>Mahsulotlar</th>
              <th>Summa</th>
              <th>To'lov</th>
              <th>Holati</th>
              <th>Sana</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id" :class="{ 'row-selected': selected.includes(order.id) }">
              <td><input type="checkbox" :value="order.id" v-model="selected" /></td>
              <td><span class="order-id">#{{ order.id }}</span></td>
              <td>
                <div class="customer-cell">
                  <div class="avatar">{{ order.customer[0] }}</div>
                  <div>
                    <p class="cust-name">{{ order.customer }}</p>
                    <p class="cust-phone">{{ order.phone }}</p>
                  </div>
                </div>
              </td>
              <td><span class="item-count">{{ order.items }} dona</span></td>
              <td><span class="amount">{{ formatPrice(order.total) }} UZS</span></td>
              <td><span :class="['payment-badge', order.payment]">{{ paymentLabel(order.payment) }}</span></td>
              <td>
                <select v-model="order.status" class="status-select" :class="order.status" @change="updateStatus(order)">
                  <option value="pending">Kutilmoqda</option>
                  <option value="processing">Jarayonda</option>
                  <option value="shipped">Yuborilgan</option>
                  <option value="delivered">Yetkazilgan</option>
                  <option value="cancelled">Bekor qilingan</option>
                </select>
              </td>
              <td><span class="date-cell">{{ order.date }}</span></td>
              <td>
                <div class="row-actions">
                  <button class="btn-icon" @click="viewOrder(order)" title="Ko'rish">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button class="btn-icon danger" @click="deleteOrder(order.id)" title="O'chirish">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!filteredOrders.length" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
          </svg>
          <p>Buyurtmalar topilmadi</p>
        </div>
      </div>
      <div class="pagination">
        <span class="page-info">{{ filteredOrders.length }} ta ko'rsatilmoqda</span>
        <div class="page-btns">
          <button class="page-btn" :disabled="pagination.page <= 1" @click="pagination.page--">‹</button>
          <button class="page-btn active">{{ pagination.page }}</button>
          <button class="page-btn" :disabled="pagination.page >= pagination.totalPages" @click="pagination.page++">›</button>
        </div>
      </div>
    </div>

    <!-- Detail Drawer -->
    <div v-if="drawerOrder" class="drawer-overlay" @click.self="drawerOrder = null">
      <div class="drawer">
        <div class="drawer-header">
          <h3>Buyurtma #{{ drawerOrder.id }}</h3>
          <button class="modal-close" @click="drawerOrder = null">×</button>
        </div>
        <div class="drawer-body">
          <div class="info-block">
            <label>Mijoz</label>
            <p>{{ drawerOrder.customer }}</p>
            <p class="text-muted">{{ drawerOrder.phone }}</p>
          </div>
          <div class="info-block">
            <label>Manzil</label>
            <p>{{ drawerOrder.address || 'Ko\'rsatilmagan' }}</p>
          </div>
          <div class="info-block">
            <label>Mahsulotlar</label>
            <div v-for="p in drawerOrder.products" :key="p.name" class="product-row">
              <span>{{ p.name }}</span>
              <span class="text-muted">× {{ p.qty }}</span>
              <span class="ml-auto">{{ formatPrice(p.price) }}</span>
            </div>
          </div>
          <div class="info-block total-block">
            <label>Jami</label>
            <strong>{{ formatPrice(drawerOrder.total) }} UZS</strong>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
  </div>
</template>

<script>
export default {
  name: 'Orders',
  data() {
    return {
      selected: [],
      drawerOrder: null,
      filters: { search: '', status: '', payment: '', dateFrom: '', dateTo: '' },
      pagination: { page: 1, total: 48, totalPages: 5 },
      statusStats: [
        { label: 'Yangi', count: 12, color: '#6366f1', emoji: '🆕' },
        { label: 'Jarayonda', count: 8, color: '#f59e0b', emoji: '⚙️' },
        { label: 'Yetkazilgan', count: 24, color: '#10b981', emoji: '✅' },
        { label: 'Bekor qilingan', count: 4, color: '#ef4444', emoji: '❌' }
      ],
      orders: [
        { id: 10043, customer: 'Aziz Karimov', phone: '+998 90 123 4567', items: 3, total: 2500000, payment: 'paid', status: 'delivered', date: '2025-01-12', address: 'Toshkent, Yunusobod', products: [{ name: 'iPhone 15', qty: 1, price: 2000000 }, { name: 'Case', qty: 2, price: 250000 }] },
        { id: 10042, customer: 'Malika Yusupova', phone: '+998 91 234 5678', items: 1, total: 850000, payment: 'pending', status: 'processing', date: '2025-01-11', address: 'Samarqand', products: [{ name: 'Samsung Galaxy', qty: 1, price: 850000 }] },
        { id: 10041, customer: 'Bobur Toshmatov', phone: '+998 93 345 6789', items: 5, total: 430000, payment: 'paid', status: 'shipped', date: '2025-01-10', address: 'Buxoro', products: [{ name: 'T-shirt', qty: 5, price: 86000 }] },
        { id: 10040, customer: 'Dilnoza Nazarova', phone: '+998 94 456 7890', items: 2, total: 1200000, payment: 'refunded', status: 'cancelled', date: '2025-01-09', address: 'Namangan', products: [{ name: 'Laptop', qty: 1, price: 1200000 }] },
        { id: 10039, customer: 'Sherzod Aliyev', phone: '+998 95 567 8901', items: 4, total: 670000, payment: 'paid', status: 'pending', date: '2025-01-08', address: 'Andijon', products: [{ name: 'Shoes', qty: 4, price: 167500 }] }
      ],
      toast: { show: false, message: '', type: '' }
    }
  },
  computed: {
    filteredOrders() {
      return this.orders.filter(o => {
        const q = this.filters.search.toLowerCase()
        const matchSearch = !q || o.id.toString().includes(q) || o.customer.toLowerCase().includes(q)
        const matchStatus = !this.filters.status || o.status === this.filters.status
        const matchPayment = !this.filters.payment || o.payment === this.filters.payment
        return matchSearch && matchStatus && matchPayment
      })
    },
    isAllSelected() { return this.filteredOrders.length > 0 && this.filteredOrders.every(o => this.selected.includes(o.id)) },
    hasFilters() { return Object.values(this.filters).some(v => v) }
  },
  methods: {
    toggleAll(e) { this.selected = e.target.checked ? this.filteredOrders.map(o => o.id) : [] },
    viewOrder(order) { this.drawerOrder = order },
    updateStatus(order) { this.showToast(`#${order.id} holati yangilandi`, 'success') },
    deleteOrder(id) {
      this.orders = this.orders.filter(o => o.id !== id)
      this.showToast('Buyurtma o\'chirildi', 'success')
    },
    bulkDelete() {
      this.orders = this.orders.filter(o => !this.selected.includes(o.id))
      this.selected = []
      this.showToast('Buyurtmalar o\'chirildi', 'success')
    },
    clearFilters() { this.filters = { search: '', status: '', payment: '', dateFrom: '', dateTo: '' } },
    exportOrders() { this.showToast('Eksport tayyorlanmoqda...', 'info') },
    formatPrice(v) { return v ? v.toLocaleString('uz-UZ') : 0 },
    paymentLabel(p) { return { paid: 'To\'langan', pending: 'Kutilmoqda', refunded: 'Qaytarilgan' }[p] || p },
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => this.toast.show = false, 2500)
    }
  }
}
</script>

<style scoped>
.page-wrapper { padding: 24px; max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
.page-header p { font-size: 13px; color: #6b7280; margin: 0; }
.header-actions { display: flex; gap: 10px; }
.btn-secondary { display: flex; align-items: center; gap: 6px; background: #fff; color: #374151; border: 1px solid #e5e7eb; padding: 9px 16px; border-radius: 8px; font-size: 14px; cursor: pointer; }
.stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
@media (max-width: 700px) { .stats-bar { grid-template-columns: repeat(2, 1fr); } }
.stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; display: flex; align-items: center; gap: 14px; }
.stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.stat-num { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
.stat-label { font-size: 12px; color: #6b7280; margin: 0; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.filters-card { padding: 16px 20px; }
.filter-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.search-wrap { position: relative; flex: 1; min-width: 200px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.search-input { width: 100%; padding: 9px 12px 9px 38px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
.search-input:focus { border-color: #6366f1; }
.filter-select { padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; color: #374151; background: #fff; }
.btn-clear { background: none; border: none; color: #6b7280; font-size: 14px; cursor: pointer; text-decoration: underline; }
.table-card { padding: 0; overflow: hidden; }
.bulk-bar { display: flex; align-items: center; gap: 12px; background: #eef2ff; padding: 10px 20px; font-size: 14px; color: #4338ca; }
.btn-danger-sm { background: #ef4444; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; }
.btn-sm { background: #fff; color: #374151; border: 1px solid #e5e7eb; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
thead th { text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; background: #f9fafb; white-space: nowrap; }
tbody td { padding: 14px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; vertical-align: middle; }
tr.row-selected { background: #f0f0ff; }
.order-id { font-weight: 600; color: #6366f1; font-family: monospace; }
.customer-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 32px; height: 32px; background: #eef2ff; color: #6366f1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0; }
.cust-name { font-size: 14px; font-weight: 500; color: #111827; margin: 0; }
.cust-phone { font-size: 12px; color: #9ca3af; margin: 0; }
.item-count { background: #f3f4f6; color: #374151; padding: 3px 8px; border-radius: 6px; font-size: 13px; }
.amount { font-weight: 600; color: #111827; white-space: nowrap; }
.payment-badge { font-size: 12px; padding: 3px 9px; border-radius: 20px; font-weight: 500; }
.payment-badge.paid { background: #dcfce7; color: #16a34a; }
.payment-badge.pending { background: #fef9c3; color: #ca8a04; }
.payment-badge.refunded { background: #fce7f3; color: #be185d; }
.status-select { padding: 5px 10px; border-radius: 6px; border: 1.5px solid #e5e7eb; font-size: 13px; font-weight: 500; outline: none; cursor: pointer; }
.status-select.delivered { border-color: #86efac; color: #16a34a; background: #f0fdf4; }
.status-select.processing { border-color: #fde68a; color: #d97706; background: #fffbeb; }
.status-select.shipped { border-color: #93c5fd; color: #2563eb; background: #eff6ff; }
.status-select.pending { border-color: #e5e7eb; color: #374151; }
.status-select.cancelled { border-color: #fca5a5; color: #dc2626; background: #fef2f2; }
.date-cell { font-size: 13px; color: #6b7280; white-space: nowrap; }
.row-actions { display: flex; gap: 6px; }
.btn-icon { background: none; border: none; cursor: pointer; color: #6b7280; padding: 5px; border-radius: 6px; display: flex; }
.btn-icon:hover { background: #f3f4f6; color: #111827; }
.btn-icon.danger:hover { background: #fef2f2; color: #ef4444; }
.empty-state { text-align: center; padding: 60px 20px; color: #9ca3af; }
.empty-state p { margin: 12px 0 0; font-size: 15px; }
.pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-top: 1px solid #f3f4f6; }
.page-info { font-size: 13px; color: #6b7280; }
.page-btns { display: flex; gap: 6px; }
.page-btn { width: 34px; height: 34px; border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
.page-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; justify-content: flex-end; }
.drawer { width: 420px; max-width: 95vw; background: #fff; height: 100%; overflow-y: auto; box-shadow: -4px 0 20px rgba(0,0,0,0.1); }
.drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
.drawer-header h3 { font-size: 18px; font-weight: 700; margin: 0; }
.modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #9ca3af; }
.drawer-body { padding: 20px 24px; }
.info-block { margin-bottom: 20px; }
.info-block label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 6px; display: block; }
.info-block p { font-size: 15px; color: #111827; margin: 0 0 2px; }
.text-muted { color: #9ca3af !important; font-size: 13px !important; }
.product-row { display: flex; gap: 8px; align-items: center; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
.ml-auto { margin-left: auto; font-weight: 600; }
.total-block { background: #f9fafb; border-radius: 8px; padding: 14px 16px !important; display: flex; justify-content: space-between; align-items: center; }
.total-block label { margin: 0 !important; }
.total-block strong { font-size: 16px; font-weight: 700; color: #6366f1; }
.toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; z-index: 200; }
.toast.success { background: #059669; color: #fff; }
.toast.info { background: #3b82f6; color: #fff; }
</style>