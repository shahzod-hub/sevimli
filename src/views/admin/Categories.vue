<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h1>Kategoriyalar</h1>
        <p>{{ categories.length }} ta kategoriya</p>
      </div>
      <button class="btn-primary" @click="openModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Yangi kategoriya
      </button>
    </div>

    <div class="content-layout">
      <!-- Tree View -->
      <div class="card tree-card">
        <div class="card-toolbar">
          <input v-model="search" type="text" placeholder="Kategoriya qidirish..." class="search-input" />
        </div>
        <div class="category-tree">
          <div
            v-for="cat in filteredCategories"
            :key="cat.id"
            class="tree-node"
            :class="{ active: selected?.id === cat.id }"
            @click="selected = cat"
          >
            <div class="node-main">
              <button class="toggle-btn" v-if="cat.children?.length" @click.stop="cat._open = !cat._open">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  :style="{ transform: cat._open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <span v-else class="toggle-placeholder"></span>
              <div class="cat-icon" :style="{ background: cat.color + '22', color: cat.color }">
                <span>{{ cat.icon }}</span>
              </div>
              <div class="node-info">
                <span class="node-name">{{ cat.name }}</span>
                <span class="node-count">{{ cat.productCount }} mahsulot</span>
              </div>
            </div>
            <div class="node-actions">
              <span :class="['status-pill', cat.active ? 'active' : 'inactive']">
                {{ cat.active ? 'Faol' : 'Noaktiv' }}
              </span>
              <button class="btn-icon" @click.stop="openModal(cat)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="btn-icon danger" @click.stop="deleteCategory(cat.id)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                </svg>
              </button>
            </div>

            <!-- Children -->
            <div v-if="cat._open && cat.children?.length" class="children">
              <div v-for="child in cat.children" :key="child.id" class="tree-node child" @click.stop="selected = child">
                <div class="node-main">
                  <span class="toggle-placeholder"></span>
                  <span class="toggle-placeholder"></span>
                  <div class="cat-icon small" :style="{ background: child.color + '22', color: child.color }">
                    <span>{{ child.icon }}</span>
                  </div>
                  <div class="node-info">
                    <span class="node-name">{{ child.name }}</span>
                    <span class="node-count">{{ child.productCount }} mahsulot</span>
                  </div>
                </div>
                <div class="node-actions">
                  <button class="btn-icon" @click.stop="openModal(child)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Panel -->
      <div class="card detail-card" v-if="selected">
        <h2 class="card-title">{{ selected.name }}</h2>
        <div class="detail-icon" :style="{ background: selected.color + '22' }">
          <span style="font-size: 36px">{{ selected.icon }}</span>
        </div>
        <div class="detail-stats">
          <div class="d-stat">
            <span class="d-label">Mahsulotlar</span>
            <span class="d-value">{{ selected.productCount }}</span>
          </div>
          <div class="d-stat">
            <span class="d-label">Holati</span>
            <span :class="['status-pill', selected.active ? 'active' : 'inactive']">
              {{ selected.active ? 'Faol' : 'Noaktiv' }}
            </span>
          </div>
          <div class="d-stat">
            <span class="d-label">Rang</span>
            <div class="color-swatch" :style="{ background: selected.color }"></div>
          </div>
          <div class="d-stat">
            <span class="d-label">Slug</span>
            <code>{{ selected.slug }}</code>
          </div>
        </div>
        <div class="detail-actions">
          <button class="btn-secondary" @click="selected = null">Yopish</button>
          <button class="btn-primary" @click="openModal(selected)">Tahrirlash</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modal.show" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ modal.editMode ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya' }}</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nomi <span class="required">*</span></label>
            <input v-model="modal.form.name" type="text" placeholder="Kategoriya nomi" class="plain-input" />
          </div>
          <div class="form-group">
            <label>Slug</label>
            <input v-model="modal.form.slug" type="text" placeholder="kategoriya-nomi" class="plain-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Emoji belgisi</label>
              <input v-model="modal.form.icon" type="text" placeholder="📱" class="plain-input" maxlength="2" />
            </div>
            <div class="form-group">
              <label>Rang</label>
              <div class="color-pick-row">
                <input v-model="modal.form.color" type="color" class="color-input" />
                <input v-model="modal.form.color" type="text" class="plain-input" placeholder="#6366f1" />
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Asosiy kategoriya</label>
            <select v-model="modal.form.parentId" class="plain-input">
              <option :value="null">— Asosiy kategoriya —</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="toggle-label">
              <span>Faol</span>
              <div class="toggle" :class="{ on: modal.form.active }" @click="modal.form.active = !modal.form.active">
                <div class="toggle-knob"></div>
              </div>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">Bekor qilish</button>
          <button class="btn-primary" @click="saveCategory" :disabled="modal.loading">
            <span v-if="modal.loading" class="spinner"></span>
            <span v-else>{{ modal.editMode ? 'Yangilash' : 'Saqlash' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast success">{{ toast.message }}</div>
  </div>
</template>

<script>
export default {
  name: 'Categories',
  data() {
    return {
      search: '',
      selected: null,
      categories: [
        { id: 1, name: 'Elektronika', slug: 'elektronika', icon: '📱', color: '#6366f1', active: true, productCount: 142, _open: false,
          children: [
            { id: 11, name: 'Telefonlar', slug: 'telefonlar', icon: '📞', color: '#8b5cf6', active: true, productCount: 68 },
            { id: 12, name: 'Noutbuklar', slug: 'noutbuklar', icon: '💻', color: '#06b6d4', active: true, productCount: 41 }
          ]
        },
        { id: 2, name: 'Kiyim-kechak', slug: 'kiyim', icon: '👕', color: '#f59e0b', active: true, productCount: 89, _open: false, children: [] },
        { id: 3, name: 'Oziq-ovqat', slug: 'oziq-ovqat', icon: '🍎', color: '#10b981', active: true, productCount: 214, _open: false, children: [] },
        { id: 4, name: 'Sport', slug: 'sport', icon: '⚽', color: '#ef4444', active: false, productCount: 37, _open: false, children: [] }
      ],
      modal: { show: false, editMode: false, loading: false, form: { name: '', slug: '', icon: '', color: '#6366f1', parentId: null, active: true } },
      toast: { show: false, message: '' }
    }
  },
  computed: {
    filteredCategories() {
      if (!this.search) return this.categories
      return this.categories.filter(c => c.name.toLowerCase().includes(this.search.toLowerCase()))
    }
  },
  methods: {
    openModal(cat = null) {
      this.modal.editMode = !!cat
      this.modal.form = cat
        ? { ...cat }
        : { name: '', slug: '', icon: '', color: '#6366f1', parentId: null, active: true }
      this.modal.show = true
    },
    closeModal() { this.modal.show = false },
    async saveCategory() {
      if (!this.modal.form.name.trim()) return
      this.modal.loading = true
      await new Promise(r => setTimeout(r, 600))
      if (!this.modal.editMode) {
        this.categories.push({ ...this.modal.form, id: Date.now(), productCount: 0, _open: false, children: [] })
      } else {
        const i = this.categories.findIndex(c => c.id === this.modal.form.id)
        if (i !== -1) this.categories.splice(i, 1, { ...this.categories[i], ...this.modal.form })
      }
      this.modal.loading = false
      this.closeModal()
      this.showToast(this.modal.editMode ? 'Kategoriya yangilandi' : 'Kategoriya qo\'shildi')
    },
    deleteCategory(id) {
      this.categories = this.categories.filter(c => c.id !== id)
      if (this.selected?.id === id) this.selected = null
      this.showToast('Kategoriya o\'chirildi')
    },
    showToast(message) {
      this.toast = { show: true, message }
      setTimeout(() => this.toast.show = false, 3000)
    }
  }
}
</script>

<style scoped>
.page-wrapper { padding: 24px; max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
.page-header p { font-size: 13px; color: #6b7280; margin: 0; }
.btn-primary { display: flex; align-items: center; gap: 6px; background: #6366f1; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-secondary { background: #fff; border: 1px solid #e5e7eb; color: #374151; padding: 10px 18px; border-radius: 8px; font-size: 14px; cursor: pointer; }
.content-layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
@media (max-width: 900px) { .content-layout { grid-template-columns: 1fr; } }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
.card-title { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 20px; }
.card-toolbar { margin-bottom: 16px; }
.search-input { width: 100%; padding: 9px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
.search-input:focus { border-color: #6366f1; }
.tree-node { border-radius: 8px; margin-bottom: 4px; }
.tree-node.active > .node-main { background: #eef2ff; }
.node-main { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
.node-main:hover { background: #f9fafb; }
.toggle-btn { background: none; border: none; cursor: pointer; padding: 0; display: flex; color: #6b7280; flex-shrink: 0; }
.toggle-placeholder { width: 22px; flex-shrink: 0; }
.cat-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.cat-icon.small { width: 26px; height: 26px; font-size: 13px; }
.node-info { flex: 1; min-width: 0; }
.node-name { font-size: 14px; font-weight: 500; color: #111827; display: block; }
.node-count { font-size: 12px; color: #9ca3af; }
.node-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.status-pill { font-size: 11px; padding: 2px 8px; border-radius: 20px; font-weight: 500; }
.status-pill.active { background: #dcfce7; color: #16a34a; }
.status-pill.inactive { background: #f3f4f6; color: #6b7280; }
.btn-icon { background: none; border: none; cursor: pointer; color: #6b7280; padding: 4px; border-radius: 4px; display: flex; }
.btn-icon:hover { background: #f3f4f6; color: #111827; }
.btn-icon.danger:hover { background: #fef2f2; color: #ef4444; }
.children { padding-left: 12px; }
.detail-card { display: flex; flex-direction: column; gap: 16px; align-self: start; }
.detail-icon { width: 72px; height: 72px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
.detail-stats { display: flex; flex-direction: column; gap: 12px; }
.d-stat { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
.d-label { font-size: 13px; color: #6b7280; }
.d-value { font-size: 14px; font-weight: 600; color: #111827; }
.color-swatch { width: 20px; height: 20px; border-radius: 4px; border: 1px solid #e5e7eb; }
code { font-size: 12px; background: #f9fafb; padding: 2px 6px; border-radius: 4px; }
.detail-actions { display: flex; gap: 8px; margin-top: 4px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 14px; width: 480px; max-width: 95vw; overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.modal-header h3 { font-size: 18px; font-weight: 700; color: #111827; margin: 0; }
.modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #9ca3af; line-height: 1; }
.modal-body { padding: 20px 24px; }
.modal-footer { padding: 0 24px 20px; display: flex; justify-content: flex-end; gap: 10px; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
.required { color: #ef4444; }
.plain-input { width: 100%; padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
.plain-input:focus { border-color: #6366f1; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.color-pick-row { display: flex; align-items: center; gap: 8px; }
.color-input { width: 40px; height: 40px; border: 1.5px solid #e5e7eb; border-radius: 6px; cursor: pointer; padding: 2px; }
.toggle-label { display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
.toggle { width: 44px; height: 24px; background: #e5e7eb; border-radius: 12px; position: relative; transition: background 0.2s; }
.toggle.on { background: #6366f1; }
.toggle-knob { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle.on .toggle-knob { transform: translateX(20px); }
.toast { position: fixed; bottom: 24px; right: 24px; background: #059669; color: #fff; padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; z-index: 1000; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>