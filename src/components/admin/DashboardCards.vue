<template>
  <div class="dashboard-cards">
    <div
      v-for="card in cards"
      :key="card.key"
      class="card"
      :class="`card--${card.color}`"
    >
      <div class="card__icon">
        <span>{{ card.icon }}</span>
      </div>
      <div class="card__body">
        <p class="card__label">{{ card.label }}</p>
        <p class="card__value">{{ formatValue(card.value, card.prefix) }}</p>
        <p class="card__change" :class="card.change >= 0 ? 'positive' : 'negative'">
          {{ card.change >= 0 ? '↑' : '↓' }} {{ Math.abs(card.change) }}% o'tgan oydan
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardCards',
  props: {
    stats: {
      type: Object,
      default: () => ({
        totalProducts: 0,
        totalRevenue: 0,
        totalOrders: 0,
        lowStock: 0,
        revenueChange: 0,
        ordersChange: 0,
        productsChange: 0,
        stockChange: 0,
      }),
    },
  },
  computed: {
    cards() {
      return [
        {
          key: 'revenue',
          label: 'Umumiy daromad',
          value: this.stats.totalRevenue,
          prefix: "so'm",
          change: this.stats.revenueChange,
          icon: '💰',
          color: 'green',
        },
        {
          key: 'orders',
          label: 'Buyurtmalar',
          value: this.stats.totalOrders,
          prefix: '',
          change: this.stats.ordersChange,
          icon: '🛒',
          color: 'blue',
        },
        {
          key: 'products',
          label: 'Mahsulotlar',
          value: this.stats.totalProducts,
          prefix: '',
          change: this.stats.productsChange,
          icon: '📦',
          color: 'orange',
        },
        {
          key: 'stock',
          label: 'Kam qoldiq',
          value: this.stats.lowStock,
          prefix: '',
          change: this.stats.stockChange,
          icon: '⚠️',
          color: 'red',
        },
      ];
    },
  },
  methods: {
    formatValue(value, prefix) {
      const formatted = Number(value).toLocaleString('uz-UZ');
      return prefix ? `${formatted} ${prefix}` : formatted;
    },
  },
};
</script>

<style scoped>
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  padding: 24px 0;
}

.card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  border-left: 4px solid transparent;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.11);
}

.card--green { border-left-color: #22c55e; }
.card--blue  { border-left-color: #3b82f6; }
.card--orange{ border-left-color: #f97316; }
.card--red   { border-left-color: #ef4444; }

.card__icon {
  font-size: 2rem;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  flex-shrink: 0;
}

.card__body {
  flex: 1;
  min-width: 0;
}

.card__label {
  font-size: 0.78rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 4px;
  font-weight: 600;
}

.card__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card__change {
  font-size: 0.78rem;
  margin: 0;
  font-weight: 500;
}

.positive { color: #22c55e; }
.negative { color: #ef4444; }
</style>