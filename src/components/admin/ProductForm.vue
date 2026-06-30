<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ isEditing ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish' }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Image upload -->
        <div class="img-upload" @click="$refs.fileInput.click()">
          <img v-if="form.image" :src="form.image" class="preview-img" alt="preview" />
          <div v-else class="upload-placeholder">
            <span>📷</span>
            <p>Rasm yuklash</p>
            <small>PNG, JPG — max 2MB</small>
          </div>
          <input ref="fileInput" type="file" accept="image/*" hidden @change="handleImage" />
          <div v-if="form.image" class="img-overlay">
            <span>Rasmni o'zgartirish</span>
          </div>
        </div>

        <div class="form-grid">
          <!-- Name -->
          <div class="field field--full">
            <label>Mahsulot nomi <span class="req">*</span></label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Masalan: Toza sutli shokolad"
              :class="{ 'input--error': errors.name }"
              @input="clearError('name')"
            />
            <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
          </div>

          <!-- SKU -->
          <div class="field">
            <label>SKU</label>
            <input v-model="form.sku" type="text" placeholder="SKU-001" />
          </div>

          <!-- Category -->
          <div class="field">
            <label>Kategoriya <span class="req">*</span></label>
            <select v-model="form.category" :class="{ 'input--error': errors.category }" @change="clearError('category')">
              <option value="">Tanlang...</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <span v-if="errors.category" class="error-msg">{{ errors.category }}</span>
          </div>

          <!-- Price -->
          <div class="field">
            <label>Narxi (so'm) <span class="req">*</span></label>
            <div class="input-prefix">
              <span class="prefix-label">UZS</span>
              <input
                v-model.number="form.price"
                type="number"
                min="0"
                placeholder="0"
                :class="{ 'input--error': errors.price }"
                @input="clearError('price')"
              />
            </div>
            <span v-if="errors.price" class="error-msg">{{ errors.price }}</span>
          </div>

          <!-- Discount price -->
          <div class="field">
            <label>Chegirma narxi</label>
            <div class="input-prefix">
              <span class="prefix-label">UZS</span>
              <input v-model.number="form.discountPrice" type="number" min="0" placeholder="0" />
            </div>
          </div>

          <!-- Stock -->
          <div class="field">
            <label>Qoldiq (dona) <span class="req">*</span></label>
            <input
              v-model.number="form.stock"
              type="number"
              min="0"
              placeholder="0"
              :class="{ 'input--error': errors.stock }"
              @input="clearError('stock')"
            />
            <span v-if="errors.stock" class="error-msg">{{ errors.stock }}</span>
          </div>

          <!-- Unit -->
          <div class="field">
            <label>O'lchov birligi</label>
            <select v-model="form.unit">
              <option value="dona">dona</option>
              <option value="kg">kg</option>
              <option value="litr">litr</option>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="paket">paket</option>
            </select>
          </div>

          <!-- Barcode -->
          <div class="field">
            <label>Shtrix kod</label>
            <input v-model="form.barcode" type="text" placeholder="4600000000000" />
          </div>

          <!-- Description -->
          <div class="field field--full">
            <label>Tavsif</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Mahsulot haqida qisqacha ma'lumot..."
            ></textarea>
          </div>

          <!-- Toggles -->
          <div class="field field--full toggles">
            <label class="toggle-label">
              <div class="toggle" :class="{ active: form.isActive }" @click="form.isActive = !form.isActive">
                <span class="toggle-knob"></span>
              </div>
              Faol holat
            </label>
            <label class="toggle-label">
              <div class="toggle" :class="{ active: form.isFeatured }" @click="form.isFeatured = !form.isFeatured">
                <span class="toggle-knob"></span>
              </div>
              Tavsiya etilgan
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn--ghost" @click="$emit('close')">Bekor qilish</button>
        <button class="btn btn--primary" :disabled="saving" @click="handleSubmit">
          <span v-if="saving">Saqlanmoqda...</span>
          <span v-else>{{ isEditing ? 'Saqlash' : 'Qo\'shish' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const defaultForm = () => ({
  name: '',
  sku: '',
  category: '',
  price: null,
  discountPrice: null,
  stock: null,
  unit: 'dona',
  barcode: '',
  description: '',
  image: '',
  isActive: true,
  isFeatured: false,
});

export default {
  name: 'ProductForm',
  emits: ['close', 'save'],
  props: {
    product: { type: Object, default: null },
    saving: { type: Boolean, default: false },
  },
  data() {
    return {
      form: defaultForm(),
      errors: {},
      categories: [
        'Nonvoylik mahsulotlari',
        'Sut mahsulotlari',
        'Go\'sht & Baliq',
        'Sabzavotlar',
        'Mevalar',
        'Ichimliklar',
        'Shirinliklar',
        'Ziravorlar',
        'Donli mahsulotlar',
        'Uy kimyosi',
        'Shaxsiy gigiyena',
        'Bolalar mahsulotlari',
      ],
    };
  },
  computed: {
    isEditing() {
      return !!this.product;
    },
  },
  watch: {
    product: {
      immediate: true,
      handler(val) {
        if (val) {
          this.form = { ...defaultForm(), ...val };
        } else {
          this.form = defaultForm();
        }
        this.errors = {};
      },
    },
  },
  methods: {
    handleImage(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { this.form.image = ev.target.result; };
      reader.readAsDataURL(file);
    },
    clearError(field) {
      delete this.errors[field];
    },
    validate() {
      const errs = {};
      if (!this.form.name.trim()) errs.name = 'Mahsulot nomi kiritilishi shart';
      if (!this.form.category) errs.category = 'Kategoriya tanlanishi shart';
      if (!this.form.price || this.form.price <= 0) errs.price = 'To\'g\'ri narx kiriting';
      if (this.form.stock === null || this.form.stock < 0) errs.stock = 'Qoldiq kiritilishi shart';
      this.errors = errs;
      return Object.keys(errs).length === 0;
    },
    handleSubmit() {
      if (!this.validate()) return;
      this.$emit('save', { ...this.form });
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: #fff;
  border-radius: 18px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: modal-in 0.2s ease;
}

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(12px); }
  to   { opacity: 1; transform: scale(1)   translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h2 { margin: 0; font-size: 1.15rem; color: #1e293b; font-weight: 700; }

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 32px; height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #64748b;
  display: flex; align-items: center; justify-content: center;
}
.close-btn:hover { background: #e2e8f0; }

.modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; }

.img-upload {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
  transition: border-color 0.2s;
}
.img-upload:hover { border-color: #16a34a; }

.upload-placeholder { text-align: center; color: #94a3b8; }
.upload-placeholder span { font-size: 2rem; }
.upload-placeholder p { margin: 6px 0 2px; font-size: 0.9rem; font-weight: 500; }
.upload-placeholder small { font-size: 0.75rem; }

.preview-img { width: 100%; height: 100%; object-fit: contain; }

.img-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s;
}
.img-upload:hover .img-overlay { opacity: 1; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field--full { grid-column: 1 / -1; }

.field label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
}
.req { color: #ef4444; }

.field input,
.field select,
.field textarea {
  padding: 9px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}
.field input:focus,
.field select:focus,
.field textarea:focus { border-color: #16a34a; }
.input--error { border-color: #ef4444 !important; }
.error-msg { font-size: 0.75rem; color: #ef4444; }

.input-prefix {
  display: flex;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s;
}
.input-prefix:focus-within { border-color: #16a34a; }
.prefix-label {
  background: #f8fafc;
  padding: 9px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  border-right: 1.5px solid #e2e8f0;
}
.input-prefix input {
  border: none;
  flex: 1;
  padding: 9px 10px;
  outline: none;
  font-size: 0.9rem;
  color: #1e293b;
}

.toggles { display: flex; gap: 24px; flex-wrap: wrap; }

.toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.88rem !important;
  color: #334155 !important;
  user-select: none;
}

.toggle {
  width: 44px; height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle.active { background: #16a34a; }
.toggle-knob {
  position: absolute;
  top: 3px; left: 3px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle.active .toggle-knob { transform: translateX(20px); }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}

.btn { padding: 9px 22px; border-radius: 9px; border: none; cursor: pointer; font-size: 0.9rem; font-weight: 600; }
.btn--ghost { background: #f1f5f9; color: #475569; }
.btn--ghost:hover { background: #e2e8f0; }
.btn--primary { background: #16a34a; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #15803d; }
.btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>