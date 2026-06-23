<script setup>
const props = defineProps({
  modelValue: String
});

const emit = defineEmits(["update:modelValue"]);

const categories = [
  { label: "Barchasi", icon: "🏪" },
  { label: "Mevalar", icon: "🍎" },
  { label: "Sabzavotlar", icon: "🥦" },
  { label: "Ichimliklar", icon: "🥛" },
  { label: "Shirinliklar", icon: "🍫" },
];
</script>

<template>
  <div class="categories">
    <button
      v-for="cat in categories"
      :key="cat.label"
      :class="{ active: modelValue === cat.label || (cat.label === 'Barchasi' && !modelValue) }"
      @click="emit('update:modelValue', cat.label === 'Barchasi' ? '' : cat.label)"
    >
      <span>{{ cat.icon }}</span>
      {{ cat.label }}
    </button>
  </div>
</template>

<style scoped>
.categories {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

button:hover {
  border-color: #2563eb;
  color: #2563eb;
}

button.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}
</style>
