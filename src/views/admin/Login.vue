<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#6366f1"/>
            <path d="M10 20h20M20 10v20" stroke="white" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
        <h1>Admin Panel</h1>
        <p>Tizimga kirish uchun ma'lumotlarni kiriting</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group" :class="{ error: errors.email }">
          <label>Email</label>
          <div class="input-wrapper">
            <span class="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <input
              v-model="form.email"
              type="email"
              placeholder="admin@example.com"
              autocomplete="email"
            />
          </div>
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="form-group" :class="{ error: errors.password }">
          <label>Parol</label>
          <div class="input-wrapper">
            <span class="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.remember" />
            <span>Eslab qolish</span>
          </label>
        </div>

        <div v-if="loginError" class="alert alert-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ loginError }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Kirish</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLogin',
  data() {
    return {
      form: {
        email: '',
        password: '',
        remember: false
      },
      errors: {},
      loginError: '',
      loading: false,
      showPassword: false
    }
  },
  methods: {
    validate() {
      this.errors = {}
      if (!this.form.email) this.errors.email = 'Email kiritish shart'
      else if (!/\S+@\S+\.\S+/.test(this.form.email)) this.errors.email = 'Email noto\'g\'ri formatda'
      if (!this.form.password) this.errors.password = 'Parol kiritish shart'
      else if (this.form.password.length < 6) this.errors.password = 'Parol kamida 6 ta belgi bo\'lishi kerak'
      return Object.keys(this.errors).length === 0
    },
    async handleLogin() {
      if (!this.validate()) return
      this.loading = true
      this.loginError = ''
      try {
        // API call: await this.$store.dispatch('auth/login', this.form)
        await new Promise(r => setTimeout(r, 1000))
        // Simulate: if wrong credentials
        if (this.form.email !== 'admin@example.com') {
          throw new Error('Email yoki parol noto\'g\'ri')
        }
        this.$router.push('/admin/dashboard')
      } catch (e) {
        this.loginError = e.message || 'Kirish amalga oshmadi'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.login-header { text-align: center; margin-bottom: 32px; }
.logo { margin-bottom: 16px; }
.login-header h1 { font-size: 24px; font-weight: 700; color: #1e1b4b; margin: 0 0 8px; }
.login-header p { color: #6b7280; font-size: 14px; margin: 0; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 12px; color: #9ca3af; display: flex; }
.input-wrapper input {
  width: 100%; padding: 10px 12px 10px 40px;
  border: 1.5px solid #e5e7eb; border-radius: 8px;
  font-size: 14px; color: #111827; outline: none; transition: border-color 0.2s;
  box-sizing: border-box;
}
.input-wrapper input:focus { border-color: #6366f1; }
.form-group.error .input-wrapper input { border-color: #ef4444; }
.error-text { font-size: 12px; color: #ef4444; margin-top: 4px; display: block; }
.toggle-password { position: absolute; right: 12px; background: none; border: none; cursor: pointer; color: #9ca3af; display: flex; padding: 0; }
.form-options { display: flex; align-items: center; margin-bottom: 20px; }
.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #374151; cursor: pointer; }
.checkbox-label input { accent-color: #6366f1; }
.alert { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }
.alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.btn-login {
  width: 100%; padding: 12px; background: #6366f1; color: #fff;
  border: none; border-radius: 8px; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center;
}
.btn-login:hover:not(:disabled) { background: #4f46e5; }
.btn-login:disabled { opacity: 0.7; cursor: not-allowed; }
.spinner {
  width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>