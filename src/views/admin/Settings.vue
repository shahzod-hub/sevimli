<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h1>Sozlamalar</h1>
        <p>Tizim konfiguratsiyasini boshqarish</p>
      </div>
      <button class="btn-primary" @click="saveAll" :disabled="saving">
        <span v-if="saving" class="spinner"></span>
        <span v-else>Saqlash</span>
      </button>
    </div>

    <div class="settings-layout">
      <!-- Sidebar nav -->
      <div class="settings-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Content -->
      <div class="settings-body">

        <!-- General -->
        <div v-if="activeTab === 'general'" class="tab-content">
          <h2>Umumiy sozlamalar</h2>
          <div class="card">
            <div class="form-group">
              <label>Sayt nomi</label>
              <input v-model="settings.general.siteName" type="text" class="plain-input" />
            </div>
            <div class="form-group">
              <label>Sayt tavsifi</label>
              <textarea v-model="settings.general.siteDesc" rows="3" class="plain-input"></textarea>
            </div>
            <div class="form-group">
              <label>Sayt URL</label>
              <input v-model="settings.general.siteUrl" type="url" class="plain-input" />
            </div>
            <div class="form-group">
              <label>Admin email</label>
              <input v-model="settings.general.adminEmail" type="email" class="plain-input" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Valyuta</label>
                <select v-model="settings.general.currency" class="plain-input">
                  <option value="UZS">UZS — O'zbek so'mi</option>
                  <option value="USD">USD — AQSH dollari</option>
                  <option value="EUR">EUR — Yevro</option>
                </select>
              </div>
              <div class="form-group">
                <label>Til</label>
                <select v-model="settings.general.language" class="plain-input">
                  <option value="uz">O'zbek</option>
                  <option value="ru">Rus</option>
                  <option value="en">Ingliz</option>
                </select>
              </div>
            </div>
          </div>
          <div class="card">
            <h3 class="section-title">Tizim rejimlari</h3>
            <div class="toggle-row" v-for="mode in generalModes" :key="mode.key">
              <div>
                <p class="toggle-title">{{ mode.label }}</p>
                <p class="toggle-desc">{{ mode.desc }}</p>
              </div>
              <div class="toggle" :class="{ on: settings.general[mode.key] }" @click="settings.general[mode.key] = !settings.general[mode.key]">
                <div class="toggle-knob"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Store -->
        <div v-if="activeTab === 'store'" class="tab-content">
          <h2>Do'kon sozlamalari</h2>
          <div class="card">
            <div class="form-group">
              <label>Manzil</label>
              <input v-model="settings.store.address" type="text" class="plain-input" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Telefon</label>
                <input v-model="settings.store.phone" type="tel" class="plain-input" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input v-model="settings.store.email" type="email" class="plain-input" />
              </div>
            </div>
            <div class="form-group">
              <label>Ish vaqti</label>
              <input v-model="settings.store.workHours" type="text" placeholder="Du-Sha 09:00 - 18:00" class="plain-input" />
            </div>
            <div class="form-group">
              <label>Minimal buyurtma summası (UZS)</label>
              <input v-model.number="settings.store.minOrder" type="number" class="plain-input" />
            </div>
          </div>
          <div class="card">
            <h3 class="section-title">Yetkazib berish</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Standart narx (UZS)</label>
                <input v-model.number="settings.store.deliveryPrice" type="number" class="plain-input" />
              </div>
              <div class="form-group">
                <label>Bepul yetkazish (UZS dan)</label>
                <input v-model.number="settings.store.freeDeliveryFrom" type="number" class="plain-input" />
              </div>
            </div>
            <div class="toggle-row">
              <div>
                <p class="toggle-title">Bepul yetkazib berish</p>
                <p class="toggle-desc">Belgilangan summadan oshganda avtomatik</p>
              </div>
              <div class="toggle" :class="{ on: settings.store.freeDelivery }" @click="settings.store.freeDelivery = !settings.store.freeDelivery">
                <div class="toggle-knob"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div v-if="activeTab === 'notifications'" class="tab-content">
          <h2>Bildirishnomalar</h2>
          <div class="card">
            <h3 class="section-title">Email bildirishnomalari</h3>
            <div class="toggle-row" v-for="n in emailNotifs" :key="n.key">
              <div>
                <p class="toggle-title">{{ n.label }}</p>
                <p class="toggle-desc">{{ n.desc }}</p>
              </div>
              <div class="toggle" :class="{ on: settings.notifications[n.key] }" @click="settings.notifications[n.key] = !settings.notifications[n.key]">
                <div class="toggle-knob"></div>
              </div>
            </div>
          </div>
          <div class="card">
            <h3 class="section-title">SMTP sozlamalari</h3>
            <div class="form-row">
              <div class="form-group">
                <label>SMTP Host</label>
                <input v-model="settings.notifications.smtpHost" type="text" class="plain-input" placeholder="smtp.gmail.com" />
              </div>
              <div class="form-group">
                <label>Port</label>
                <input v-model.number="settings.notifications.smtpPort" type="number" class="plain-input" placeholder="587" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Foydalanuvchi nomi</label>
                <input v-model="settings.notifications.smtpUser" type="text" class="plain-input" />
              </div>
              <div class="form-group">
                <label>Parol</label>
                <input v-model="settings.notifications.smtpPass" type="password" class="plain-input" />
              </div>
            </div>
            <button class="btn-secondary" @click="testEmail">Test xabar yuborish</button>
          </div>
        </div>

        <!-- Security -->
        <div v-if="activeTab === 'security'" class="tab-content">
          <h2>Xavfsizlik</h2>
          <div class="card">
            <h3 class="section-title">Parolni o'zgartirish</h3>
            <div class="form-group">
              <label>Joriy parol</label>
              <input v-model="security.currentPass" type="password" class="plain-input" />
            </div>
            <div class="form-group">
              <label>Yangi parol</label>
              <input v-model="security.newPass" type="password" class="plain-input" />
            </div>
            <div class="form-group">
              <label>Yangi parolni tasdiqlash</label>
              <input v-model="security.confirmPass" type="password" class="plain-input" />
              <span v-if="security.newPass && security.confirmPass && security.newPass !== security.confirmPass" class="error-text">
                Parollar mos kelmaydi
              </span>
            </div>
            <button class="btn-primary" @click="changePassword">Parolni yangilash</button>
          </div>
          <div class="card">
            <h3 class="section-title">Sessiya va kirish</h3>
            <div class="toggle-row" v-for="sec in securityToggles" :key="sec.key">
              <div>
                <p class="toggle-title">{{ sec.label }}</p>
                <p class="toggle-desc">{{ sec.desc }}</p>
              </div>
              <div class="toggle" :class="{ on: settings.security[sec.key] }" @click="settings.security[sec.key] = !settings.security[sec.key]">
                <div class="toggle-knob"></div>
              </div>
            </div>
            <div class="form-group" style="margin-top: 16px">
              <label>Sessiya muddati (daqiqa)</label>
              <input v-model.number="settings.security.sessionTimeout" type="number" class="plain-input" />
            </div>
          </div>
          <div class="card danger-zone">
            <h3 class="section-title danger">Xavfli zona</h3>
            <p class="danger-text">Bu amallar qaytarib bo'lmaydi. Ehtiyot bo'ling.</p>
            <div class="danger-actions">
              <button class="btn-danger-outline" @click="clearCache">Keshni tozalash</button>
              <button class="btn-danger-outline" @click="resetSettings">Sozlamalarni tiklash</button>
            </div>
          </div>
        </div>

        <!-- Integrations -->
        <div v-if="activeTab === 'integrations'" class="tab-content">
          <h2>Integratsiyalar</h2>
          <div class="card" v-for="integration in integrations" :key="integration.name">
            <div class="integration-row">
              <div class="integration-icon">{{ integration.icon }}</div>
              <div class="integration-info">
                <p class="int-name">{{ integration.name }}</p>
                <p class="int-desc">{{ integration.desc }}</p>
              </div>
              <div class="integration-status">
                <span :class="['int-badge', integration.connected ? 'connected' : '']">
                  {{ integration.connected ? 'Ulangan' : 'Ulanmagan' }}
                </span>
                <button class="btn-sm-outline" @click="integration.connected = !integration.connected">
                  {{ integration.connected ? 'Uzish' : 'Ulash' }}
                </button>
              </div>
            </div>
            <div v-if="integration.connected && integration.key" class="integration-key">
              <label>API Kalit</label>
              <div class="key-row">
                <input :type="integration.showKey ? 'text' : 'password'" :value="integration.key" readonly class="plain-input" />
                <button class="btn-icon-sm" @click="integration.showKey = !integration.showKey">👁</button>
                <button class="btn-icon-sm" @click="copyKey(integration.key)">📋</button>
              </div>
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
  name: 'Settings',
  data() {
    return {
      activeTab: 'general',
      saving: false,
      tabs: [
        { id: 'general', label: 'Umumiy', icon: '⚙️' },
        { id: 'store', label: 'Do\'kon', icon: '🏪' },
        { id: 'notifications', label: 'Bildirishnomalar', icon: '🔔' },
        { id: 'security', label: 'Xavfsizlik', icon: '🔒' },
        { id: 'integrations', label: 'Integratsiyalar', icon: '🔌' }
      ],
      settings: {
        general: { siteName: 'MyShop', siteDesc: 'O\'zbekistonning eng yaxshi internet-do\'koni', siteUrl: 'https://myshop.uz', adminEmail: 'admin@myshop.uz', currency: 'UZS', language: 'uz', maintenance: false, registration: true, guestCheckout: true },
        store: { address: 'Toshkent, Chilonzor, 12-uy', phone: '+998 71 234 5678', email: 'info@myshop.uz', workHours: 'Du-Shan 09:00-18:00', minOrder: 50000, deliveryPrice: 25000, freeDeliveryFrom: 500000, freeDelivery: true },
        notifications: { newOrder: true, orderStatus: true, lowStock: true, newUser: false, smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPass: '' },
        security: { twoFactor: false, loginAttempts: true, ipWhitelist: false, sessionTimeout: 120 }
      },
      security: { currentPass: '', newPass: '', confirmPass: '' },
      generalModes: [
        { key: 'maintenance', label: 'Texnik xizmat rejimi', desc: 'Saytni vaqtincha yopib qo\'yish' },
        { key: 'registration', label: 'Ro\'yxatdan o\'tish', desc: 'Yangi foydalanuvchilar ro\'yxatdan o\'ta oladi' },
        { key: 'guestCheckout', label: 'Mehmon buyurtmasi', desc: 'Ro\'yxatdan o\'tmasdan xarid qilish' }
      ],
      emailNotifs: [
        { key: 'newOrder', label: 'Yangi buyurtma', desc: 'Har yangi buyurtmada email yuboriladi' },
        { key: 'orderStatus', label: 'Buyurtma holati', desc: 'Holat o\'zgarganda mijozga xabar yuboriladi' },
        { key: 'lowStock', label: 'Kam qolgan mahsulot', desc: '5 ta va undan kam qolganda ogohlantirish' },
        { key: 'newUser', label: 'Yangi foydalanuvchi', desc: 'Yangi ro\'yxatdan o\'tishda xabar' }
      ],
      securityToggles: [
        { key: 'twoFactor', label: 'Ikki bosqichli tasdiqlash', desc: 'Kirishda SMS yoki email orqali tasdiqlash' },
        { key: 'loginAttempts', label: 'Kirish urinishlarini cheklash', desc: '5 noto\'g\'ri urinishdan so\'ng bloklash' },
        { key: 'ipWhitelist', label: 'IP whitelist', desc: 'Faqat ruxsat etilgan IP lardan kirish' }
      ],
      integrations: [
        { name: 'Payme', desc: 'O\'zbek to\'lov tizimi integratsiyasi', icon: '💳', connected: true, key: 'payme_live_key_xxxx', showKey: false },
        { name: 'Click', desc: 'Click to\'lov tizimi', icon: '⚡', connected: false, key: '', showKey: false },
        { name: 'Telegram Bot', desc: 'Buyurtmalar uchun Telegram bot', icon: '🤖', connected: true, key: '1234567890:AAH...', showKey: false },
        { name: 'SMS Aero', desc: 'SMS bildirishnomalar uchun', icon: '📱', connected: false, key: '', showKey: false },
        { name: 'Google Analytics', desc: 'Trafik va konversiya tahlili', icon: '📊', connected: true, key: 'G-XXXXXXXXXX', showKey: false }
      ],
      toast: { show: false, message: '', type: '' }
    }
  },
  methods: {
    async saveAll() {
      this.saving = true
      await new Promise(r => setTimeout(r, 800))
      this.saving = false
      this.showToast('Sozlamalar saqlandi!', 'success')
    },
    changePassword() {
      if (!this.security.currentPass || !this.security.newPass) return
      if (this.security.newPass !== this.security.confirmPass) return
      this.showToast('Parol muvaffaqiyatli yangilandi', 'success')
      this.security = { currentPass: '', newPass: '', confirmPass: '' }
    },
    testEmail() { this.showToast('Test xabar yuborildi!', 'info') },
    clearCache() { this.showToast('Kesh tozalandi', 'success') },
    resetSettings() { this.showToast('Sozlamalar tiklandi', 'info') },
    copyKey(key) { navigator.clipboard?.writeText(key); this.showToast('Nusxalandi!', 'success') },
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => this.toast.show = false, 2500)
    }
  }
}
</script>

<style scoped>
.page-wrapper { padding: 24px; max-width: 1100px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
.page-header p { font-size: 13px; color: #6b7280; margin: 0; }
.btn-primary { display: flex; align-items: center; gap: 6px; background: #6366f1; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: #fff; border: 1px solid #e5e7eb; color: #374151; padding: 9px 16px; border-radius: 8px; font-size: 14px; cursor: pointer; }
.settings-layout { display: grid; grid-template-columns: 220px 1fr; gap: 20px; }
@media (max-width: 700px) { .settings-layout { grid-template-columns: 1fr; } }
.settings-nav { display: flex; flex-direction: column; gap: 4px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border: none; background: none; border-radius: 8px; font-size: 14px; color: #374151; cursor: pointer; text-align: left; }
.nav-item:hover { background: #f3f4f6; }
.nav-item.active { background: #eef2ff; color: #6366f1; font-weight: 600; }
.nav-icon { font-size: 16px; width: 20px; }
.tab-content h2 { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 20px; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.section-title { font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.plain-input { width: 100%; padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
.plain-input:focus { border-color: #6366f1; }
.toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #f3f4f6; gap: 20px; }
.toggle-row:last-of-type { border-bottom: none; }
.toggle-title { font-size: 14px; font-weight: 500; color: #111827; margin: 0 0 2px; }
.toggle-desc { font-size: 13px; color: #6b7280; margin: 0; }
.toggle { width: 44px; height: 24px; background: #e5e7eb; border-radius: 12px; position: relative; transition: background 0.2s; cursor: pointer; flex-shrink: 0; }
.toggle.on { background: #6366f1; }
.toggle-knob { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle.on .toggle-knob { transform: translateX(20px); }
.error-text { font-size: 12px; color: #ef4444; margin-top: 4px; display: block; }
.danger-zone { border-color: #fca5a5; }
.section-title.danger { color: #ef4444; }
.danger-text { font-size: 14px; color: #6b7280; margin-bottom: 16px; }
.danger-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-danger-outline { background: #fff; color: #ef4444; border: 1.5px solid #ef4444; padding: 9px 16px; border-radius: 8px; font-size: 14px; cursor: pointer; }
.integration-row { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
.integration-icon { font-size: 28px; width: 48px; text-align: center; }
.integration-info { flex: 1; }
.int-name { font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 2px; }
.int-desc { font-size: 13px; color: #6b7280; margin: 0; }
.integration-status { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.int-badge { font-size: 12px; padding: 3px 9px; border-radius: 20px; background: #f3f4f6; color: #9ca3af; }
.int-badge.connected { background: #dcfce7; color: #16a34a; }
.btn-sm-outline { background: #fff; border: 1px solid #e5e7eb; color: #374151; padding: 6px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; white-space: nowrap; }
.integration-key { padding-top: 12px; border-top: 1px solid #f3f4f6; }
.integration-key label { font-size: 12px; font-weight: 500; color: #6b7280; display: block; margin-bottom: 6px; }
.key-row { display: flex; gap: 8px; align-items: center; }
.btn-icon-sm { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px; cursor: pointer; font-size: 14px; flex-shrink: 0; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
.toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; z-index: 200; }
.toast.success { background: #059669; color: #fff; }
.toast.info { background: #3b82f6; color: #fff; }
</style>