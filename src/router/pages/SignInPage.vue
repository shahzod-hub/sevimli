<template>
  
  <div class="auth-page">
    <div class="wrap">
      <!-- Logo -->
      <div class="logo">
        <div class="logo-icon">🛒</div>
        <div>
          <div class="logo-text">FreshMart</div>
          <div class="logo-sub">Online supermarket</div>
        </div>
      </div>

      <div class="card">
        <h2 class="title">Tizimga kirish</h2>

        <div class="field">
          <label>Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="siz@example.com"
            @keyup.enter="doSignin"
          />
        </div>

        <div class="field">
          <label>Parol</label>
          <div class="pass-row">
            <input
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              placeholder="••••••••"
              @keyup.enter="doSignin"
            />
            <span class="pass-eye" @click="showPass = !showPass">
              {{ showPass ? '🙈' : '👁️' }}
            </span>
          </div>
          <span class="forgot" @click="forgotPassword">Parolni unutdingizmi?</span>
        </div>

        <button class="submit-btn" :disabled="loading" @click="doSignin">
          {{ loading ? 'Tekshirilmoqda...' : 'Kirish' }}
        </button>

        <div class="divider">yoki</div>

        <button class="demo-btn" @click="fillDemo">
          👤 Demo hisob bilan to'ldirish
        </button>

        <p class="switch-link">
          Hisobingiz yo'qmi?
          <router-link to="/signup">Ro'yxatdan o'ting</router-link>
        </p>

        <!-- API Response -->
        <div v-if="apiResponse" class="result-box">
          <span :class="apiResponse.success ? 'status-ok' : 'status-err'">
            {{ apiResponse.success ? '✓ 200 OK' : '✗ 400 Bad Request' }}
          </span>
          <pre>{{ JSON.stringify(apiResponse.data, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { mockSignin } from '../../api/mockAuth'

const router = useRouter()

const form = reactive({ email: '', password: '' })
const showPass = ref(false)
const loading = ref(false)
const apiResponse = ref(null)
const toast = reactive({ show: false, message: '', type: 'info' })

function showToast(message, type = 'info') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => (toast.show = false), 2500)
}

function fillDemo() {
  form.email = 'ali@test.com'
  form.password = 'password123'
  showToast("Demo ma'lumotlar to'ldirildi", 'info')
}

async function doSignin() {
  if (!form.email || !form.password) {
    showToast('Email va parolni kiriting', 'error')
    return
  }
  if (!/\S+@\S+\.\S+/.test(form.email)) {
    showToast("Email formati noto'g'ri", 'error')
    return
  }

  loading.value = true
  apiResponse.value = null

  try {
    const result = await mockSignin(form.email, form.password)

    apiResponse.value = result

    if (result.success) {
      showToast('Xush kelibsiz, ' + result.data.data.user.name + '! 🛒', 'success')
      localStorage.setItem('token', result.data.data.token)
      setTimeout(() => router.push('/home'), 1200)
    } else {
      showToast(result.data?.message || 'Email yoki parol xato', 'error')
    }
  } catch (error) {
    apiResponse.value = {
      success: false,
      data: {
        message: 'Serverga bog‘lanishda xatolik yuz berdi',
        error: error?.message || 'NETWORK_ERROR',
      },
    }
    showToast('Server bilan ulanib bo‘lmadi, qayta urinib ko‘ring', 'error')
  } finally {
    loading.value = false
  }
}

async function forgotPassword() {
  if (!form.email) {
    showToast('Avval emailingizni kiriting', 'info')
    return
  }
  showToast('Havola ' + form.email + ' ga yuborildi', 'success')
  apiResponse.value = {
    success: true,
    data: {
      success: true,
      message: 'Parol tiklash havolasi yuborildi',
      data: { email: form.email, sent_at: new Date().toISOString() },
    },
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #f4f6f8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.wrap { width: 100%; max-width: 420px; }

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-bottom: 2rem;
}
.logo-icon {
  width: 44px; height: 44px;
  background: #1b8a5a;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
}
.logo-text { font-size: 22px; font-weight: 600; color: #1a1a1a; }
.logo-sub  { font-size: 12px; color: #888; }

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.25rem;
}

.field { margin-bottom: 14px; }
.field label { display: block; font-size: 13px; color: #555; margin-bottom: 5px; }
.field input {
  width: 100%; padding: 9px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fafafa;
  color: #1a1a1a;
  outline: none;
  transition: border 0.15s;
}
.field input:focus { border-color: #1b8a5a; background: #fff; }

.pass-row { position: relative; }
.pass-row input { padding-right: 38px; }
.pass-eye {
  position: absolute; right: 10px; top: 50%;
  transform: translateY(-50%);
  cursor: pointer; font-size: 16px;
}

.forgot {
  font-size: 12px; color: #1b8a5a;
  cursor: pointer; display: block;
  text-align: right; margin-top: 4px;
}
.forgot:hover { text-decoration: underline; }

.submit-btn {
  width: 100%; padding: 11px;
  background: #1b8a5a; color: #fff;
  border: none; border-radius: 8px;
  font-size: 15px; font-weight: 500;
  cursor: pointer; margin-top: 6px;
  transition: background 0.15s;
}
.submit-btn:hover:not(:disabled) { background: #156d48; }
.submit-btn:disabled { background: #aaa; cursor: not-allowed; }

.divider {
  text-align: center; font-size: 12px; color: #bbb;
  margin: 14px 0; position: relative;
}
.divider::before, .divider::after {
  content: ''; position: absolute;
  top: 50%; width: 42%; height: 1px; background: #e5e7eb;
}
.divider::before { left: 0; }
.divider::after  { right: 0; }

.demo-btn {
  width: 100%; padding: 10px;
  background: #f4f6f8;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px; color: #555; cursor: pointer;
}
.demo-btn:hover { background: #eaecef; }

.switch-link {
  text-align: center;
  font-size: 13px; color: #888;
  margin-top: 1.25rem;
}
.switch-link a { color: #1b8a5a; text-decoration: none; font-weight: 500; }
.switch-link a:hover { text-decoration: underline; }

.result-box {
  margin-top: 1rem;
  background: #f4f6f8;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: #555;
  overflow: auto;
  max-height: 180px;
}
.result-box pre { margin-top: 4px; white-space: pre-wrap; }
.status-ok  { color: #1b8a5a; font-weight: 600; }
.status-err { color: #e24b4a; font-weight: 600; }

.toast {
  position: fixed; bottom: 24px; left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px; border-radius: 8px;
  font-size: 14px; color: #fff;
  z-index: 999; white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}
.toast.success { background: #1b8a5a; }
.toast.error   { background: #e24b4a; }
.toast.info    { background: #378add; }
.toast-enter-active, .toast-leave-active { transition: opacity 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; }
</style>
