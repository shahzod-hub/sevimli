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
          <h1>Mahsulotni tahrirlash</h1>
          <p>ID: #{{ $route.params.id }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-danger-outline" @click="confirmDelete = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
          O'chirish
        </button>
        <button class="btn-primary" @click="handleUpdate" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Yangilash</span>
        </button>
      </div>
    </div>

    <div v-if="pageLoading" class="page-loading">
      <div class="loader"></div>
      <p>Ma'lumotlar yuklanmoqda...</p>
    </div>

    <template v-else>
      <div class="form-layout">
        <div class="form-main">
          <div class="card">
            <h2 class="card-title">Asosiy ma'lumotlar</h2>
            <div class="form-group" :class="{ error: errors.name }">
              <label>Mahsulot nomi <span class="required">*</span></label>
              <input v-model="form.name" type="text" />
              <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
            </div>
            <div class="form-group">
              <label>Tavsif</label>
              <textarea v-model="form.description" rows="5"></textarea>
            </div>
          </div>

          <div class="card">
            <h2 class="card-title">Narx</h2>
            <div class="form-row">
              <div class="form-group" :class="{ error: errors.price }">
                <label>Asosiy narx <span class="required">*</span></label>
                <div class="input-prefix">
                  <span>UZS</span>
                  <input v-model.number="form.price" type="number" min="0" />
                </div>
                <span v-if="errors.price" class="error-text">{{ errors.price }}</span>
              </div>
              <div class="form-group">
                <label>Chegirma narxi</label>
                <div class="input-prefix">
                  <span>UZS</span>
                  <input v-model.number="form.salePrice" type="number" min="0" />
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <h2 class="card-title">Xususiyatlar</h2>
            <div class="attributes-list">
              <div v-for="(attr, i) in form.attributes" :key="i" class="attr-row">
                <input v-model="attr.key" placeholder="Nom" />
                <input v-model="attr.value" placeholder="Qiymat" />
                <button class="btn-icon-danger" @click="form.attributes.splice(i, 1)">×</button>
              </div>
            </div>
            <button class="btn-add-attr" @click="form.attributes.push({ key: '', value: '' })">
              + Qo'shish
            </button>
          </div>

          <!-- Audit log -->
          <div class="card">
            <h2 class="card-title">O'zgarishlar tarixi</h2>
            <div class="audit-log">
              <div v-for="(log, i) in auditLogs" :key="i" class="log-item">
                <div class="log-icon" :class="log.type"></div>
                <div class="log-body">
                  <p>{{ log.action }}</p>
                  <span>{{ log.user }} · {{ log.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-side">
          <div class="card">
            <h2 class="card-title">Holati</h2>
            <div class="form-group">
              <select v-model="form.status">
                <option value="active">Faol</option>
                <option value="draft">Qoralama</option>
                <option value="archived">Arxivlangan</option>
              </select>
            </div>
          </div>

          <div class="card">
            <h2 class="card-title">Kategoriya</h2>
            <div class="form-group">
              <label>Kategoriya</label>
              <select v-model="form.category">
                <option value="">Tanlang...</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Brend</label>
              <input v-model="form.brand" type="text" class="plain-input" />
            </div>
          </div>

          <div class="card">
            <h2 class="card-title">Ombor</h2>
            <div class="form-group">
              <label>Miqdor</label>
              <input v-model.number="form.stock" type="number" min="0" class="plain-input" />
            </div>
            <div class="form-group">
              <label>SKU</label>
              <input v-model="form.sku" type="text" class="plain-input" />
            </div>
          </div>

          <div class="card">
            <h2 class="card-title">Rasmlar</h2>
            <div class="image-previews">
              <div v-for="(img, i) in previewImages" :key="i" class="preview-item">
                <img :src="img.url" :alt="img.name" />
                <button class="remove-img" @click="previewImages.splice(i, 1)">×</button>
                <span v-if="i === 0" class="main-badge">Asosiy</span>
              </div>
              <div class="add-img-btn" @click="$refs.fileInput.click()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
            </div>
            <input ref="fileInput" type="file" multiple accept="image/*" @change="handleFiles" hidden />
          </div>

          <div class="card stats-card">
            <h2 class="card-title">Statistika</h2>
            <div class="stat-row" v-for="s in stats" :key="s.label">
              <span class="stat-label">{{ s.label }}</span>
              <span class="stat-value">{{ s.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Delete Confirm Modal -->
    <div v-if="confirmDelete" class="modal-overlay" @click.self="confirmDelete = false">
      <div class="modal">
        <h3>Mahsulotni o'chirish</h3>
        <p>Bu amalni qaytarib bo'lmaydi. Mahsulot butunlay o'chiriladi.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="confirmDelete = false">Bekor qilish</button>
          <button class="btn-danger" @click="handleDelete">O'chirish</button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
  </div>
</template>

<script>
export default {
  name: 'EditProduct',
  data() {
    return {
      pageLoading: true, loading: false, confirmDelete: false,
      previewImages: [
        { url: 'https://via.placeholder.com/80', name: 'rasm1.jpg' }
      ],
      form: {
        name: '', description: '', price: 0, salePrice: 0,
        status: 'active', category: '', brand: '', stock: 0, sku: '',
        attributes: []
      },
      errors: {},
      categories: [
        { id: 1, name: 'Elektronika' }, { id: 2, name: 'Kiyim-kechak' },
        { id: 3, name: 'Oziq-ovqat' }, { id: 4, name: 'Uy-ro\'zg\'or buyumlari' }
      ],
      auditLogs: [
        { type: 'edit', action: 'Narx o\'zgartirildi', user: 'Admin', date: '2025-01-10 14:23' },
        { type: 'create', action: 'Mahsulot yaratildi', user: 'Admin', date: '2025-01-05 09:00' }
      ],
      stats: [
        { label: 'Umumiy sotuv', value: '143 dona' },
        { label: 'Ko\'rishlar', value: '2,841' },
        { label: 'Savatga qo\'shish', value: '312' },
        { label: 'Konversiya', value: '4.6%' }
      ],
      toast: { show: false, message: '', type: '' }
    }
  },
  async created() {
    await this.loadProduct()
  },
  methods: {
    async loadProduct() {
      this.pageLoading = true
      try {
        await new Promise(r => setTimeout(r, 800))
        // Simulate loaded data
        this.form = {
          name: 'iPhone 15 Pro', description: 'Apple\'ning eng yangi flagmani.',
          price: 12500000, salePrice: 11900000, status: 'active',
          category: 1, brand: 'Apple', stock: 25, sku: 'APL-IP15P-BLK',
          attributes: [
            { key: 'Rang', value: 'Qora titanium' },
            { key: 'Xotira', value: '256GB' },
            { key: 'Protsessor', value: 'A17 Pro' }
          ]
        }
      } finally {
        this.pageLoading = false
      }
    },
    validate() {
      this.errors = {}
      if (!this.form.name.trim()) this.errors.name = 'Nom shart'
      if (!this.form.price || this.form.price <= 0) this.errors.price = 'Narx kiriting'
      return Object.keys(this.errors).length === 0
    },
    async handleUpdate() {
      if (!this.validate()) return
      this.loading = true
      try {
        await new Promise(r => setTimeout(r, 800))
        this.showToast('Mahsulot yangilandi!', 'success')
      } catch { this.showToast('Xatolik yuz berdi', 'error') }
      finally { this.loading = false }
    },
    async handleDelete() {
      try {
        await new Promise(r => setTimeout(r, 500))
        this.confirmDelete = false
        this.showToast('Mahsulot o\'chirildi', 'success')
        setTimeout(() => this.$router.push('/admin/products'), 1500)
      } catch { this.showToast('O\'chirishda xatolik', 'error') }
    },
    handleFiles(e) {
      Array.from(e.target.files).forEach(f => {
        const url = URL.createObjectURL(f)
        this.previewImages.push({ url, name: f.name })
      })
    },
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
.header-left p { font-size: 13px; color: #9ca3af; margin: 0; }
.btn-back { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #e5e7eb; color: #374151; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 14px; }
.header-actions { display: flex; gap: 10px; }
.btn-primary { background: #6366f1; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.btn-primary:hover:not(:disabled) { background: #4f46e5; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: #fff; color: #374151; border: 1px solid #e5e7eb; padding: 10px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; }
.btn-danger-outline { display: flex; align-items: center; gap: 6px; background: #fff; color: #ef4444; border: 1.5px solid #ef4444; padding: 10px 16px; border-radius: 8px; font-size: 14px; cursor: pointer; }
.btn-danger { background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; }
.page-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 16px; color: #6b7280; }
.loader { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
.form-layout { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
@media (max-width: 900px) { .form-layout { grid-template-columns: 1fr; } }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
.card-title { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 20px; padding-bottom: 12px; border-bottom: 1px solid #f3f4f6; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
.required { color: #ef4444; }
.form-group input:not(.plain-input), .form-group textarea, .form-group select {
  width: 100%; padding: 10px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px;
  font-size: 14px; color: #111827; outline: none; box-sizing: border-box;
}
.plain-input { width: 100%; padding: 10px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
.form-group.error input, .form-group.error textarea { border-color: #ef4444; }
.error-text { font-size: 12px; color: #ef4444; margin-top: 4px; display: block; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.input-prefix { display: flex; align-items: center; border: 1.5px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.input-prefix span { background: #f9fafb; padding: 10px 12px; font-size: 13px; color: #6b7280; border-right: 1px solid #e5e7eb; }
.input-prefix input { border: none; padding: 10px 12px; flex: 1; font-size: 14px; outline: none; }
.attributes-list { margin-bottom: 12px; }
.attr-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
.attr-row input { flex: 1; padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; }
.btn-icon-danger { background: none; border: none; cursor: pointer; color: #ef4444; font-size: 18px; padding: 0 4px; }
.btn-add-attr { display: flex; align-items: center; gap: 6px; background: none; border: 1.5px dashed #d1d5db; color: #6b7280; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; width: 100%; justify-content: center; }
.audit-log { display: flex; flex-direction: column; gap: 14px; }
.log-item { display: flex; align-items: flex-start; gap: 12px; }
.log-icon { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.log-icon.edit { background: #6366f1; }
.log-icon.create { background: #10b981; }
.log-body p { font-size: 14px; color: #374151; margin: 0 0 2px; }
.log-body span { font-size: 12px; color: #9ca3af; }
.image-previews { display: flex; flex-wrap: wrap; gap: 10px; }
.preview-item { position: relative; width: 75px; height: 75px; }
.preview-item img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1.5px solid #e5e7eb; }
.remove-img { position: absolute; top: -6px; right: -6px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; }
.main-badge { position: absolute; bottom: 4px; left: 4px; background: #6366f1; color: #fff; font-size: 9px; padding: 2px 5px; border-radius: 4px; }
.add-img-btn { width: 75px; height: 75px; border: 2px dashed #d1d5db; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.add-img-btn:hover { border-color: #6366f1; }
.stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.stat-row:last-child { border-bottom: none; }
.stat-label { font-size: 13px; color: #6b7280; }
.stat-value { font-size: 14px; font-weight: 600; color: #111827; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 12px; padding: 28px; width: 400px; max-width: 90vw; }
.modal h3 { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 10px; }
.modal p { color: #6b7280; font-size: 14px; margin: 0 0 24px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; z-index: 1000; }
.toast.success { background: #059669; color: #fff; }
.toast.error { background: #ef4444; color: #fff; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>