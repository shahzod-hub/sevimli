<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="$router.back()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Orqaga
        </button>
        <div>
          <h1>Yangi mahsulot qo'shish</h1>
          <p>Mahsulot ma'lumotlarini to'ldiring</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="saveDraft">Qoralama saqlash</button>
        <button class="btn-primary" @click="handleSubmit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Saqlash</span>
        </button>
      </div>
    </div>

    <div class="form-layout">
      <!-- LEFT COLUMN -->
      <div class="form-main">
        <!-- Basic Info -->
        <div class="card">
          <h2 class="card-title">Asosiy ma'lumotlar</h2>
          <div class="form-group" :class="{ error: errors.name }">
            <label>Mahsulot nomi <span class="required">*</span></label>
            <input v-model="form.name" type="text" placeholder="Masalan: iPhone 15 Pro" />
            <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
          </div>
          <div class="form-group" :class="{ error: errors.description }">
            <label>Tavsif <span class="required">*</span></label>
            <textarea v-model="form.description" rows="5" placeholder="Mahsulot haqida batafsil ma'lumot..."></textarea>
            <span v-if="errors.description" class="error-text">{{ errors.description }}</span>
            <span class="char-count">{{ form.description.length }} / 2000</span>
          </div>
        </div>

        <!-- Pricing -->
        <div class="card">
          <h2 class="card-title">Narx</h2>
          <div class="form-row">
            <div class="form-group" :class="{ error: errors.price }">
              <label>Asosiy narx <span class="required">*</span></label>
              <div class="input-prefix">
                <span>UZS</span>
                <input v-model.number="form.price" type="number" placeholder="0" min="0" />
              </div>
              <span v-if="errors.price" class="error-text">{{ errors.price }}</span>
            </div>
            <div class="form-group">
              <label>Chegirma narxi</label>
              <div class="input-prefix">
                <span>UZS</span>
                <input v-model.number="form.salePrice" type="number" placeholder="0" min="0" />
              </div>
            </div>
            <div class="form-group">
              <label>Chegirma (%)</label>
              <input v-model.number="form.discount" type="number" placeholder="0" min="0" max="100" class="plain-input" />
            </div>
          </div>
          <div v-if="form.price && form.salePrice" class="discount-badge">
            Tejash: {{ formatPrice(form.price - form.salePrice) }} UZS
          </div>
        </div>

        <!-- Attributes -->
        <div class="card">
          <h2 class="card-title">Xususiyatlar</h2>
          <div class="attributes-list">
            <div v-for="(attr, i) in form.attributes" :key="i" class="attr-row">
              <input v-model="attr.key" placeholder="Nom (masalan: Rang)" />
              <input v-model="attr.value" placeholder="Qiymat (masalan: Qora)" />
              <button class="btn-icon-danger" @click="removeAttribute(i)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <button class="btn-add-attr" @click="addAttribute">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Xususiyat qo'shish
          </button>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="form-side">
        <!-- Status -->
        <div class="card">
          <h2 class="card-title">Holati</h2>
          <div class="form-group">
            <label>Mahsulot holati</label>
            <select v-model="form.status">
              <option value="active">Faol</option>
              <option value="draft">Qoralama</option>
              <option value="archived">Arxivlangan</option>
            </select>
          </div>
          <div class="form-group">
            <label>E'lon sanasi</label>
            <input v-model="form.publishDate" type="datetime-local" class="plain-input" />
          </div>
        </div>

        <!-- Category -->
        <div class="card">
          <h2 class="card-title">Kategoriya</h2>
          <div class="form-group" :class="{ error: errors.category }">
            <label>Kategoriya <span class="required">*</span></label>
            <select v-model="form.category">
              <option value="">Tanlang...</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <span v-if="errors.category" class="error-text">{{ errors.category }}</span>
          </div>
          <div class="form-group">
            <label>Brend</label>
            <input v-model="form.brand" type="text" placeholder="Brend nomi" class="plain-input" />
          </div>
        </div>

        <!-- Stock -->
        <div class="card">
          <h2 class="card-title">Ombor</h2>
          <div class="form-group" :class="{ error: errors.stock }">
            <label>Miqdor <span class="required">*</span></label>
            <input v-model.number="form.stock" type="number" placeholder="0" min="0" class="plain-input" />
            <span v-if="errors.stock" class="error-text">{{ errors.stock }}</span>
          </div>
          <div class="form-group">
            <label>SKU kodi</label>
            <div class="input-with-btn">
              <input v-model="form.sku" type="text" placeholder="AUTO-001" class="plain-input" />
              <button type="button" class="btn-generate" @click="generateSku">Yaratish</button>
            </div>
          </div>
        </div>

        <!-- Images -->
        <div class="card">
          <h2 class="card-title">Rasmlar</h2>
          <div
            class="upload-zone"
            :class="{ dragging: isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
            @click="$refs.fileInput.click()"
          >
            <input ref="fileInput" type="file" multiple accept="image/*" @change="handleFiles" hidden />
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
              <polyline points="16 16 12 12 8 16"/>
              <line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            <p>Rasm yuklash uchun bosing yoki sudrab tashlang</p>
            <span>PNG, JPG, WEBP – max 5MB</span>
          </div>
          <div v-if="previewImages.length" class="image-previews">
            <div v-for="(img, i) in previewImages" :key="i" class="preview-item">
              <img :src="img.url" :alt="img.name" />
              <button class="remove-img" @click="removeImage(i)">×</button>
              <span v-if="i === 0" class="main-badge">Asosiy</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
  </div>
</template>

<script>
export default {
  name: 'AddProduct',
  data() {
    return {
      loading: false,
      isDragging: false,
      previewImages: [],
      form: {
        name: '', description: '', price: '', salePrice: '', discount: '',
        status: 'active', category: '', brand: '', stock: '',
        sku: '', publishDate: '', attributes: []
      },
      errors: {},
      categories: [
        { id: 1, name: 'Elektronika' },
        { id: 2, name: 'Kiyim-kechak' },
        { id: 3, name: 'Oziq-ovqat' },
        { id: 4, name: 'Uy-ro\'zg\'or buyumlari' }
      ],
      toast: { show: false, message: '', type: '' }
    }
  },
  methods: {
    validate() {
      this.errors = {}
      if (!this.form.name.trim()) this.errors.name = 'Mahsulot nomi shart'
      if (!this.form.description.trim()) this.errors.description = 'Tavsif shart'
      if (!this.form.price || this.form.price <= 0) this.errors.price = 'To\'g\'ri narx kiriting'
      if (!this.form.category) this.errors.category = 'Kategoriya tanlang'
      if (this.form.stock === '' || this.form.stock < 0) this.errors.stock = 'Miqdor kiriting'
      return Object.keys(this.errors).length === 0
    },
    async handleSubmit() {
      if (!this.validate()) return
      this.loading = true
      try {
        await new Promise(r => setTimeout(r, 1000))
        this.showToast('Mahsulot muvaffaqiyatli qo\'shildi!', 'success')
        setTimeout(() => this.$router.push('/admin/products'), 1500)
      } catch {
        this.showToast('Xatolik yuz berdi', 'error')
      } finally {
        this.loading = false
      }
    },
    saveDraft() {
      this.form.status = 'draft'
      this.showToast('Qoralama saqlandi', 'info')
    },
    addAttribute() { this.form.attributes.push({ key: '', value: '' }) },
    removeAttribute(i) { this.form.attributes.splice(i, 1) },
    generateSku() {
      this.form.sku = 'SKU-' + Math.random().toString(36).substr(2, 8).toUpperCase()
    },
    handleFiles(e) { this.processFiles(e.target.files) },
    handleDrop(e) {
      this.isDragging = false
      this.processFiles(e.dataTransfer.files)
    },
    processFiles(files) {
      Array.from(files).forEach(f => {
        if (!f.type.startsWith('image/')) return
        const url = URL.createObjectURL(f)
        this.previewImages.push({ url, name: f.name, file: f })
      })
    },
    removeImage(i) {
      URL.revokeObjectURL(this.previewImages[i].url)
      this.previewImages.splice(i, 1)
    },
    formatPrice(v) { return v ? v.toLocaleString('uz-UZ') : 0 },
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => this.toast.show = false, 3000)
    }
  }
}
</script>

<style scoped>
.page-wrapper { padding: 24px; max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-left h1 { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
.header-left p { font-size: 13px; color: #6b7280; margin: 0; }
.btn-back { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #e5e7eb; color: #374151; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 14px; }
.btn-back:hover { background: #f9fafb; }
.header-actions { display: flex; gap: 10px; }
.btn-primary { background: #6366f1; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.btn-primary:hover:not(:disabled) { background: #4f46e5; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: #fff; color: #374151; border: 1px solid #e5e7eb; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-secondary:hover { background: #f9fafb; }
.form-layout { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
@media (max-width: 900px) { .form-layout { grid-template-columns: 1fr; } }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
.card-title { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 20px; padding-bottom: 12px; border-bottom: 1px solid #f3f4f6; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
.required { color: #ef4444; }
.form-group input:not(.plain-input), .form-group textarea, .form-group select {
  width: 100%; padding: 10px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px;
  font-size: 14px; color: #111827; outline: none; transition: border-color 0.2s;
  box-sizing: border-box; background: #fff;
}
.plain-input { width: 100%; padding: 10px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #111827; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.form-group input:focus, .form-group textarea:focus, .form-group select:focus, .plain-input:focus { border-color: #6366f1; }
.form-group.error input, .form-group.error textarea, .form-group.error select { border-color: #ef4444; }
.error-text { font-size: 12px; color: #ef4444; margin-top: 4px; display: block; }
.char-count { font-size: 12px; color: #9ca3af; display: block; text-align: right; margin-top: 4px; }
.form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.input-prefix { display: flex; align-items: center; border: 1.5px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.input-prefix span { background: #f9fafb; padding: 10px 12px; font-size: 13px; color: #6b7280; border-right: 1px solid #e5e7eb; white-space: nowrap; }
.input-prefix input { border: none; padding: 10px 12px; flex: 1; font-size: 14px; outline: none; }
.discount-badge { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px 14px; font-size: 13px; font-weight: 600; margin-top: 8px; }
.attributes-list { margin-bottom: 12px; }
.attr-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
.attr-row input { flex: 1; padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; }
.attr-row input:focus { border-color: #6366f1; }
.btn-icon-danger { background: none; border: none; cursor: pointer; color: #ef4444; padding: 4px; display: flex; }
.btn-add-attr { display: flex; align-items: center; gap: 6px; background: none; border: 1.5px dashed #d1d5db; color: #6b7280; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; width: 100%; justify-content: center; }
.btn-add-attr:hover { border-color: #6366f1; color: #6366f1; }
.input-with-btn { display: flex; gap: 8px; }
.btn-generate { background: #f9fafb; border: 1.5px solid #e5e7eb; color: #374151; padding: 0 12px; border-radius: 8px; cursor: pointer; font-size: 13px; white-space: nowrap; }
.upload-zone {
  border: 2px dashed #d1d5db; border-radius: 10px; padding: 30px; text-align: center;
  cursor: pointer; transition: all 0.2s;
}
.upload-zone:hover, .upload-zone.dragging { border-color: #6366f1; background: #f0f0ff; }
.upload-zone p { font-size: 14px; color: #374151; margin: 10px 0 4px; }
.upload-zone span { font-size: 12px; color: #9ca3af; }
.image-previews { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
.preview-item { position: relative; width: 80px; height: 80px; }
.preview-item img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1.5px solid #e5e7eb; }
.remove-img { position: absolute; top: -6px; right: -6px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; }
.main-badge { position: absolute; bottom: 4px; left: 4px; background: #6366f1; color: #fff; font-size: 9px; padding: 2px 5px; border-radius: 4px; }
.toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; z-index: 1000; animation: slideUp 0.3s ease; }
.toast.success { background: #059669; color: #fff; }
.toast.error { background: #ef4444; color: #fff; }
.toast.info { background: #3b82f6; color: #fff; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>