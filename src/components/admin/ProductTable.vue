<template>
  <div class="product-table-wrapper">
    <!-- Header -->
    <div class="table-header">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="search"
          type="text"
          placeholder="Mahsulot qidirish..."
          class="search-input"
        />
      </div>
      <div class="filters">
        <select v-model="selectedCategory" class="filter-select">
          <option value="">Barcha kategoriyalar</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select v-model="stockFilter" class="filter-select">
          <option value="">Barcha holat</option>
          <option value="instock">Mavjud</option>
          <option value="low">Kam qoldiq</option>
          <option value="out">Tugagan</option>
        </select>
      </div>
      <button class="btn btn--primary" @click="$emit('add-product')">
        + Mahsulot qo'shish
      </button>
    </div>

    <!-- Table -->
    <div class="table-scroll">
      <table class="table">
        <thead>
          <tr>
            <th class="th-check">
              <input type="checkbox" @change="toggleAll" :checked="allSelected" />
            </th>
            <th @click="sortBy('name')" class="sortable">
              Mahsulot
              <span class="sort-icon">{{ getSortIcon('name') }}</span>
            </th>
            <th @click="sortBy('category')" class="sortable">
              Kategoriya
              <span class="sort-icon">{{ getSortIcon('category') }}</span>
            </th>
            <th @click="sortBy('price')" class="sortable">
              Narxi
              <span class="sort-icon">{{ getSortIcon('price') }}</span>
            </th>
            <th @click="sortBy('stock')" class="sortable">
              Qoldiq
              <span class="sort-icon">{{ getSortIcon('stock') }}</span>
            </th>
            <th>Holat</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredProducts.length === 0">
            <td colspan="7" class="empty-row">
              <div class="empty-state">
                <span>📭</span>
                <p>Mahsulot topilmadi</p>
              </div>
            </td>
          </tr>
          <tr
            v-for="product in paginatedProducts"
            :key="product.id"
            class="table-row"
            :class="{ 'row--selected': selectedIds.includes(product.id) }"
          >
            <td>
              <input
                type="checkbox"
                :value="product.id"
                v-model="selectedIds"
              />
            </td>
            <td class="td-product">
              <img
                :src="product.image || '/placeholder.png'"
                :alt="product.name"
                class="product-img"
                @error="handleImgError"
              />
              <div>
                <p class="product-name">{{ product.name }}</p>
                <p class="product-sku">SKU: {{ product.sku }}</p>
              </div>
            </td>
            <td>
              <span class="category-badge">{{ product.category }}</span>
            </td>
            <td class="td-price">{{ formatPrice(product.price) }}</td>
            <td :class="stockClass(product.stock)">{{ product.stock }} dona</td>
            <td>
              <span class="status-badge" :class="`status--${getStatus(product.stock)}`">
                {{ getStatusLabel(product.stock) }}
              </span>
            </td>
            <td class="td-actions">
              <button class="action-btn edit" @click="$emit('edit-product', product)" title="Tahrirlash">✏️</button>
              <button class="action-btn delete" @click="$emit('delete-product', product)" title="O'chirish">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bulk actions -->
    <div v-if="selectedIds.length > 0" class="bulk-bar">
      <span>{{ selectedIds.length }} ta tanlandi</span>
      <button class="btn btn--danger-sm" @click="$emit('bulk-delete', selectedIds)">
        Tanlanganlarni o'chirish
      </button>
      <button class="btn btn--ghost-sm" @click="selectedIds = []">Bekor qilish</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductTable',
  emits: ['add-product', 'edit-product', 'delete-product', 'bulk-delete'],
  props: {
    products: {
      type: Array,
      default: () => [],
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    perPage: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {
      search: '',
      selectedCategory: '',
      stockFilter: '',
      selectedIds: [],
      sortKey: 'name',
      sortDir: 'asc',
    };
  },
  computed: {
    categories() {
      return [...new Set(this.products.map((p) => p.category))];
    },
    filteredProducts() {
      return this.products
        .filter((p) => {
          const matchSearch = p.name.toLowerCase().includes(this.search.toLowerCase()) ||
            p.sku?.toLowerCase().includes(this.search.toLowerCase());
          const matchCat = !this.selectedCategory || p.category === this.selectedCategory;
          const matchStock =
            !this.stockFilter ||
            (this.stockFilter === 'instock' && p.stock > 10) ||
            (this.stockFilter === 'low' && p.stock > 0 && p.stock <= 10) ||
            (this.stockFilter === 'out' && p.stock === 0);
          return matchSearch && matchCat && matchStock;
        })
        .sort((a, b) => {
          const val = this.sortDir === 'asc' ? 1 : -1;
          if (a[this.sortKey] < b[this.sortKey]) return -val;
          if (a[this.sortKey] > b[this.sortKey]) return val;
          return 0;
        });
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredProducts.slice(start, start + this.perPage);
    },
    allSelected() {
      return (
        this.paginatedProducts.length > 0 &&
        this.paginatedProducts.every((p) => this.selectedIds.includes(p.id))
      );
    },
  },
  methods: {
    formatPrice(price) {
      return Number(price).toLocaleString('uz-UZ') + " so'm";
    },
    stockClass(stock) {
      if (stock === 0) return 'td-stock out';
      if (stock <= 10) return 'td-stock low';
      return 'td-stock ok';
    },
    getStatus(stock) {
      if (stock === 0) return 'out';
      if (stock <= 10) return 'low';
      return 'in';
    },
    getStatusLabel(stock) {
      if (stock === 0) return 'Tugagan';
      if (stock <= 10) return 'Kam qoldiq';
      return 'Mavjud';
    },
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortDir = 'asc';
      }
    },
    getSortIcon(key) {
      if (this.sortKey !== key) return '↕';
      return this.sortDir === 'asc' ? '↑' : '↓';
    },
    toggleAll(e) {
      if (e.target.checked) {
        this.selectedIds = this.paginatedProducts.map((p) => p.id);
      } else {
        this.selectedIds = [];
      }
    },
    handleImgError(e) {
      e.target.src = 'https://via.placeholder.com/40x40?text=📦';
    },
  },
};
</script>

<style scoped>
.product-table-wrapper {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  overflow: hidden;
}

.table-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  flex: 1;
  min-width: 200px;
}

.search-icon { font-size: 0.9rem; margin-right: 6px; }

.search-input {
  border: none;
  background: transparent;
  padding: 8px 0;
  font-size: 0.9rem;
  color: #334155;
  width: 100%;
  outline: none;
}

.filters { display: flex; gap: 8px; flex-wrap: wrap; }

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #475569;
  background: #f8fafc;
  cursor: pointer;
  outline: none;
}

.btn { padding: 8px 18px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; font-size: 0.88rem; }
.btn--primary { background: #16a34a; color: #fff; }
.btn--primary:hover { background: #15803d; }
.btn--danger-sm { background: #fee2e2; color: #dc2626; padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.83rem; font-weight: 600; }
.btn--ghost-sm { background: transparent; color: #64748b; padding: 6px 12px; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 0.83rem; }

.table-scroll { overflow-x: auto; }

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.table thead tr {
  background: #f8fafc;
}

.table th {
  padding: 12px 16px;
  text-align: left;
  color: #64748b;
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  border-bottom: 1px solid #e2e8f0;
}

.th-check { width: 40px; }

.sortable { cursor: pointer; user-select: none; }
.sortable:hover { color: #16a34a; }
.sort-icon { margin-left: 4px; font-size: 0.8rem; }

.table-row td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.table-row:last-child td { border-bottom: none; }
.table-row:hover { background: #f8fafc; }
.row--selected { background: #f0fdf4 !important; }

.td-product { display: flex; align-items: center; gap: 12px; }
.product-img { width: 42px; height: 42px; border-radius: 8px; object-fit: cover; background: #f1f5f9; }
.product-name { font-weight: 600; color: #1e293b; margin: 0 0 2px; }
.product-sku { font-size: 0.75rem; color: #94a3b8; margin: 0; }

.category-badge {
  background: #eff6ff;
  color: #3b82f6;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
}

.td-price { font-weight: 700; color: #16a34a; white-space: nowrap; }

.td-stock { font-weight: 600; }
.td-stock.ok  { color: #16a34a; }
.td-stock.low { color: #f97316; }
.td-stock.out { color: #ef4444; }

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}
.status--in  { background: #dcfce7; color: #16a34a; }
.status--low { background: #ffedd5; color: #f97316; }
.status--out { background: #fee2e2; color: #ef4444; }

.td-actions { display: flex; gap: 6px; }
.action-btn { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 6px 8px; border-radius: 6px; transition: background 0.15s; }
.action-btn.edit:hover  { background: #eff6ff; }
.action-btn.delete:hover{ background: #fee2e2; }

.empty-row { padding: 0; }
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px;
  color: #94a3b8;
}
.empty-state span { font-size: 2.5rem; }
.empty-state p { margin: 0; font-size: 0.95rem; }

.bulk-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #f0fdf4;
  border-top: 1px solid #dcfce7;
  font-size: 0.88rem;
  color: #16a34a;
  font-weight: 600;
}
</style>