<template>
  <div class="pagination" v-if="totalPages > 1">
    <div class="pagination-info">
      <span>{{ from }}–{{ to }} / {{ total }} ta</span>
    </div>

    <div class="pagination-controls">
      <!-- First -->
      <button
        class="page-btn"
        :disabled="modelValue === 1"
        @click="go(1)"
        title="Birinchi sahifa"
      >«</button>

      <!-- Prev -->
      <button
        class="page-btn"
        :disabled="modelValue === 1"
        @click="go(modelValue - 1)"
        title="Oldingi"
      >‹</button>

      <!-- Page numbers -->
      <template v-for="page in visiblePages" :key="page">
        <span v-if="page === '...'" class="dots">…</span>
        <button
          v-else
          class="page-btn"
          :class="{ active: page === modelValue }"
          @click="go(page)"
        >{{ page }}</button>
      </template>

      <!-- Next -->
      <button
        class="page-btn"
        :disabled="modelValue === totalPages"
        @click="go(modelValue + 1)"
        title="Keyingi"
      >›</button>

      <!-- Last -->
      <button
        class="page-btn"
        :disabled="modelValue === totalPages"
        @click="go(totalPages)"
        title="Oxirgi sahifa"
      >»</button>
    </div>

    <div class="per-page">
      <select :value="perPage" @change="$emit('update:perPage', Number($event.target.value))">
        <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }} ta</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  emits: ['update:modelValue', 'update:perPage'],
  props: {
    modelValue: { type: Number, default: 1 },
    total: { type: Number, default: 0 },
    perPage: { type: Number, default: 10 },
    perPageOptions: { type: Array, default: () => [10, 20, 50, 100] },
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.perPage) || 1;
    },
    from() {
      return this.total === 0 ? 0 : (this.modelValue - 1) * this.perPage + 1;
    },
    to() {
      return Math.min(this.modelValue * this.perPage, this.total);
    },
    visiblePages() {
      const current = this.modelValue;
      const total = this.totalPages;
      const delta = 2;
      const pages = [];

      const range = (start, end) => {
        for (let i = start; i <= end; i++) pages.push(i);
      };

      if (total <= 7) {
        range(1, total);
      } else {
        pages.push(1);
        if (current > delta + 2) pages.push('...');
        range(
          Math.max(2, current - delta),
          Math.min(total - 1, current + delta)
        );
        if (current < total - delta - 1) pages.push('...');
        pages.push(total);
      }

      return pages;
    },
  },
  methods: {
    go(page) {
      if (page < 1 || page > this.totalPages || page === this.modelValue) return;
      this.$emit('update:modelValue', page);
    },
  },
};
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid #f1f5f9;
  background: #fff;
  border-radius: 0 0 16px 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-info {
  font-size: 0.83rem;
  color: #94a3b8;
  min-width: 80px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  min-width: 34px;
  height: 34px;
  padding: 0 8px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.88rem;
  color: #475569;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.page-btn.active {
  background: #16a34a;
  border-color: #16a34a;
  color: #fff;
  font-weight: 700;
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.dots {
  padding: 0 4px;
  color: #94a3b8;
  font-size: 0.9rem;
  user-select: none;
}

.per-page select {
  padding: 6px 10px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.83rem;
  color: #475569;
  background: #f8fafc;
  cursor: pointer;
  outline: none;
}
.per-page select:focus { border-color: #16a34a; }
</style>