<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal">
      <div class="modal-icon">🗑️</div>
      <h2 class="modal-title">O'chirishni tasdiqlang</h2>
      <p class="modal-desc">
        <strong>{{ itemName }}</strong>
        {{ isBulk ? `va yana ${count - 1} ta mahsulotni` : 'ni' }}
        o'chirmoqchisiz. Bu amalni ortga qaytarib bo'lmaydi.
      </p>

      <div v-if="isBulk" class="item-count-badge">
        {{ count }} ta mahsulot o'chiriladi
      </div>

      <div class="modal-actions">
        <button class="btn btn--ghost" :disabled="deleting" @click="$emit('cancel')">
          Bekor qilish
        </button>
        <button class="btn btn--danger" :disabled="deleting" @click="$emit('confirm')">
          <span v-if="deleting">O'chirilmoqda...</span>
          <span v-else>Ha, o'chirish</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteModal',
  emits: ['confirm', 'cancel'],
  props: {
    item: { type: Object, default: null },
    items: { type: Array, default: () => [] },
    deleting: { type: Boolean, default: false },
  },
  computed: {
    isBulk() {
      return this.items && this.items.length > 1;
    },
    count() {
      return this.items ? this.items.length : 1;
    },
    itemName() {
      if (this.item) return this.item.name;
      if (this.items && this.items.length > 0) return this.items[0].name;
      return 'Mahsulot';
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 16px;
}

.modal {
  background: #fff;
  border-radius: 18px;
  padding: 36px 32px 28px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: pop-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pop-in {
  from { opacity: 0; transform: scale(0.88); }
  to   { opacity: 1; transform: scale(1); }
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  display: inline-block;
  background: #fee2e2;
  width: 72px; height: 72px;
  line-height: 72px;
  border-radius: 50%;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 10px;
}

.modal-desc {
  font-size: 0.92rem;
  color: #64748b;
  margin: 0 0 16px;
  line-height: 1.55;
}
.modal-desc strong { color: #1e293b; }

.item-count-badge {
  display: inline-block;
  background: #fee2e2;
  color: #dc2626;
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 4px;
}

.btn {
  padding: 10px 26px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.15s, opacity 0.15s;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn--ghost { background: #f1f5f9; color: #475569; }
.btn--ghost:hover:not(:disabled) { background: #e2e8f0; }

.btn--danger { background: #ef4444; color: #fff; }
.btn--danger:hover:not(:disabled) { background: #dc2626; }
</style>