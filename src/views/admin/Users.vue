<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h1>Foydalanuvchilar</h1>
        <p>{{ users.length }} ta foydalanuvchi ro'yxatda</p>
      </div>
      <button class="btn-primary" @click="openModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Yangi foydalanuvchi
      </button>
    </div>

    <!-- Summary cards -->
    <div class="summary-grid">
      <div class="sum-card" v-for="s in summary" :key="s.label">
        <div class="sum-icon" :style="{ background: s.bg, color: s.color }">{{ s.icon }}</div>
        <div>
          <p class="sum-val">{{ s.value }}</p>
          <p class="sum-lbl">{{ s.label }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card filters-card">
      <div class="filter-row">
        <div class="search-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="search" type="text" placeholder="Ism, email yoki telefon qidirish..." class="search-input" />
        </div>
        <select v-model="filterRole" class="filter-select">
          <option value="">Barcha rollar</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="customer">Mijoz</option>
        </select>
        <select v-model="filterStatus" class="filter-select">
          <option value="">Barcha holat</option>
          <option value="active">Faol</option>
          <option value="inactive">Bloklangan</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card table-card">
      <div class="bulk-bar" v-if="selected.length">
        <span>{{ selected.length }} tanlandi</span>
        <button class="btn-danger-sm" @click="bulkDelete">O'chirish</button>
        <button class="btn-sm" @click="selected = []">Bekor</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" @change="toggleAll" :checked="isAllSelected" /></th>
              <th>Foydalanuvchi</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Rol</th>
              <th>Holati</th>
              <th>Ro'yxatdan o'tgan</th>
              <th>Buyurtmalar</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" :class="{ 'row-selected': selected.includes(user.id) }">
              <td><input type="checkbox" :value="user.id" v-model="selected" /></td>
              <td>
                <div class="user-cell">
                  <div class="avatar" :style="{ background: avatarColor(user.name) }">{{ user.name[0] }}</div>
                  <div>
                    <p class="user-name">{{ user.name }}</p>
                    <p class="user-id">ID: #{{ user.id }}</p>
                  </div>
                </div>
              </td>
              <td><span class="email-cell">{{ user.email }}</span></td>
              <td><span class="phone-cell">{{ user.phone }}</span></td>
              <td><span :class="['role-badge', user.role]">{{ roleLabel(user.role) }}</span></td>
              <td>
                <label class="toggle-wrap" :title="user.active ? 'Bloklash' : 'Faollashtirish'">
                  <div class="mini-toggle" :class="{ on: user.active }" @click="toggleStatus(user)">
                    <div class="toggle-knob"></div>
                  </div>
                  <span :class="user.active ? 'text-green' : 'text-gray'">{{ user.active ? 'Faol' : 'Bloklangan' }}</span>
                </label>
              </td>
              <td><span class="date-cell">{{ user.createdAt }}</span></td>
              <td><span class="order-count">{{ user.ordersCount }}</span></td>
              <td>
                <div class="row-actions">
                  <button class="btn-icon" @click="openModal(user)" title="Tahrirlash">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="btn-icon danger" @click="deleteUser(user.id)" title="O'chirish">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!filteredUsers.length" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <p>Foydalanuvchilar topilmadi</p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modal.show" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ modal.editMode ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi' }}</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Ism <span class="required">*</span></label>
              <input v-model="modal.form.name" type="text" placeholder="To'liq ism" class="plain-input" />
            </div>
            <div class="form-group">
              <label>Email <span class="required">*</span></label>
              <input v-model="modal.form.email" type="email" placeholder="email@example.com" class="plain-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Telefon</label>
              <input v-model="modal.form.phone" type="tel" placeholder="+998 90 000 0000" class="plain-input" />
            </div>
            <div class="form-group">
              <label>Rol</label>
              <select v-model="modal.form.role" class="plain-input">
                <option value="customer">Mijoz</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div class="form-group" v-if="!modal.editMode">
            <label>Parol <span class="required">*</span></label>
            <input v-model="modal.form.password" type="password" placeholder="Kamida 8 ta belgi" class="plain-input" />
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
          <button class="btn-primary" @click="saveUser" :disabled="modal.loading">
            <span v-if="modal.loading" class="spinner"></span>
            <span v-else>{{ modal.editMode ? 'Yangilash' : 'Saqlash' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    return {
      search: '', filterRole: '', filterStatus: '', selected: [],
      summary: [
        { icon: '👥', label: 'Jami', value: '2,841', bg: '#eef2ff', color: '#6366f1' },
        { icon: '✅', label: 'Faol', value: '2,618', bg: '#dcfce7', color: '#16a34a' },
        { icon: '🚫', label: 'Bloklangan', value: '223', bg: '#fef2f2', color: '#ef4444' },
        { icon: '🆕', label: 'Bu oy', value: '48', bg: '#fef9c3', color: '#ca8a04' }
      ],
      users: [
        { id: 1001, name: 'Aziz Karimov', email: 'aziz@gmail.com', phone: '+998901234567', role: 'admin', active: true, createdAt: '2024-06-10', ordersCount: 0 },
        { id: 1002, name: 'Malika Yusupova', email: 'malika@gmail.com', phone: '+998912345678', role: 'moderator', active: true, createdAt: '2024-07-15', ordersCount: 3 },
        { id: 1003, name: 'Bobur Toshmatov', email: 'bobur@mail.ru', phone: '+998933456789', role: 'customer', active: true, createdAt: '2024-08-20', ordersCount: 12 },
        { id: 1004, name: 'Dilnoza Nazarova', email: 'dilnoza@yahoo.com', phone: '+998944567890', role: 'customer', active: false, createdAt: '2024-09-05', ordersCount: 4 },
        { id: 1005, name: 'Sherzod Aliyev', email: 'sherzod@gmail.com', phone: '+998955678901', role: 'customer', active: true, createdAt: '2024-10-12', ordersCount: 7 }
      ],
      modal: { show: false, editMode: false, loading: false, form: { name: '', email: '', phone: '', role: 'customer', password: '', active: true } },
      toast: { show: false, message: '', type: '' }
    }
  },
  computed: {
    filteredUsers() {
      return this.users.filter(u => {
        const q = this.search.toLowerCase()
        const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q)
        const matchRole = !this.filterRole || u.role === this.filterRole
        const matchStatus = !this.filterStatus || (this.filterStatus === 'active' ? u.active : !u.active)
        return matchQ && matchRole && matchStatus
      })
    },
    isAllSelected() { return this.filteredUsers.length > 0 && this.filteredUsers.every(u => this.selected.includes(u.id)) }
  },
  methods: {
    openModal(user = null) {
      this.modal.editMode = !!user
      this.modal.form = user ? { ...user } : { name: '', email: '', phone: '', role: 'customer', password: '', active: true }
      this.modal.show = true
    },
    closeModal() { this.modal.show = false },
    async saveUser() {
      if (!this.modal.form.name || !this.modal.form.email) return
      this.modal.loading = true
      await new Promise(r => setTimeout(r, 600))
      if (!this.modal.editMode) {
        this.users.push({ ...this.modal.form, id: Date.now(), createdAt: new Date().toISOString().split('T')[0], ordersCount: 0 })
      } else {
        const i = this.users.findIndex(u => u.id === this.modal.form.id)
        if (i !== -1) this.users.splice(i, 1, { ...this.users[i], ...this.modal.form })
      }
      this.modal.loading = false
      this.closeModal()
      this.showToast(this.modal.editMode ? 'Foydalanuvchi yangilandi' : 'Foydalanuvchi qo\'shildi', 'success')
    },
    deleteUser(id) {
      this.users = this.users.filter(u => u.id !== id)
      this.showToast('Foydalanuvchi o\'chirildi', 'success')
    },
    bulkDelete() {
      this.users = this.users.filter(u => !this.selected.includes(u.id))
      this.selected = []
      this.showToast('Foydalanuvchilar o\'chirildi', 'success')
    },
    toggleAll(e) { this.selected = e.target.checked ? this.filteredUsers.map(u => u.id) : [] },
    toggleStatus(user) { user.active = !user.active },
    roleLabel(r) { return { admin: 'Admin', moderator: 'Moderator', customer: 'Mijoz' }[r] || r },
    avatarColor(name) {
      const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']
      return colors[name.charCodeAt(0) % colors.length]
    },
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => this.toast.show = false, 2500)
    }
  }
}
</script>

<style scoped>
.page-wrapper { padding: 24px; max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
.page-header p { font-size: 13px; color: #6b7280; margin: 0; }
.btn-primary { display: flex; align-items: center; gap: 6px; background: #6366f1; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
@media (max-width: 700px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
.sum-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; display: flex; align-items: center; gap: 14px; }
.sum-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.sum-val { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
.sum-lbl { font-size: 12px; color: #6b7280; margin: 0; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.filters-card { padding: 14px 20px; }
.filter-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.search-wrap { position: relative; flex: 1; min-width: 220px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.search-input { width: 100%; padding: 9px 12px 9px 38px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
.filter-select { padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; }
.table-card { padding: 0; overflow: hidden; }
.bulk-bar { display: flex; align-items: center; gap: 12px; background: #eef2ff; padding: 10px 20px; font-size: 14px; color: #4338ca; }
.btn-danger-sm { background: #ef4444; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; }
.btn-sm { background: #fff; color: #374151; border: 1px solid #e5e7eb; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
thead th { text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; background: #f9fafb; white-space: nowrap; }
tbody td { padding: 14px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; vertical-align: middle; }
tr.row-selected { background: #f0f0ff; }
.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; }
.user-name { font-size: 14px; font-weight: 500; color: #111827; margin: 0; }
.user-id { font-size: 12px; color: #9ca3af; margin: 0; }
.email-cell { font-size: 13px; color: #6b7280; }
.phone-cell { font-size: 13px; color: #6b7280; }
.role-badge { font-size: 12px; padding: 3px 10px; border-radius: 20px; font-weight: 500; }
.role-badge.admin { background: #ede9fe; color: #7c3aed; }
.role-badge.moderator { background: #fef3c7; color: #d97706; }
.role-badge.customer { background: #f3f4f6; color: #374151; }
.toggle-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.mini-toggle { width: 36px; height: 20px; background: #e5e7eb; border-radius: 10px; position: relative; transition: background 0.2s; flex-shrink: 0; cursor: pointer; }
.mini-toggle.on { background: #6366f1; }
.toggle-knob { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
.mini-toggle.on .toggle-knob { transform: translateX(16px); }
.text-green { font-size: 13px; color: #16a34a; }
.text-gray { font-size: 13px; color: #9ca3af; }
.date-cell { font-size: 13px; color: #6b7280; white-space: nowrap; }
.order-count { background: #f3f4f6; color: #374151; padding: 3px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; }
.row-actions { display: flex; gap: 6px; }
.btn-icon { background: none; border: none; cursor: pointer; color: #6b7280; padding: 5px; border-radius: 6px; display: flex; }
.btn-icon:hover { background: #f3f4f6; }
.btn-icon.danger:hover { background: #fef2f2; color: #ef4444; }
.empty-state { text-align: center; padding: 60px 20px; color: #9ca3af; }
.empty-state p { margin: 12px 0 0; font-size: 15px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 14px; width: 500px; max-width: 95vw; overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.modal-header h3 { font-size: 18px; font-weight: 700; color: #111827; margin: 0; }
.modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #9ca3af; }
.modal-body { padding: 20px 24px; }
.modal-footer { padding: 0 24px 20px; display: flex; justify-content: flex-end; gap: 10px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
.required { color: #ef4444; }
.plain-input { width: 100%; padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
.plain-input:focus { border-color: #6366f1; }
.toggle-label { display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
.toggle { width: 44px; height: 24px; background: #e5e7eb; border-radius: 12px; position: relative; transition: background 0.2s; cursor: pointer; }
.toggle.on { background: #6366f1; }
.toggle-knob { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: transform 0.2s; }
.toggle.on .toggle-knob { transform: translateX(20px); }
.btn-secondary { background: #fff; border: 1px solid #e5e7eb; color: #374151; padding: 10px 18px; border-radius: 8px; font-size: 14px; cursor: pointer; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
.toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; z-index: 200; }
.toast.success { background: #059669; color: #fff; }
</style>