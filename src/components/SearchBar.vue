<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: String
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="search-wrap">
    <span class="icon">🔍</span>
    <input
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      placeholder="Mahsulot qidirish... (olma, banan, sut...)"
    />
    <button v-if="modelValue" class="clear" @click="emit('update:modelValue', '')">✕</button>
  </div>
</template>

<style scoped>
.search-wrap {
  position: relative;
  margin-bottom: 28px;
}

.icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  pointer-events: none;
}

input {
  width: 100%;
  padding: 18px 50px 18px 52px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  background: white;
  font-size: 16px;
  transition: all 0.2s;
  color: #1a202c;
}

input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.clear {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: #e2e8f0;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  color: #64748b;
  transition: all 0.2s;
}

.clear:hover { background: #cbd5e1; }
</style>
