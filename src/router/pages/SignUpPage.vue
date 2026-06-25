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
        <h2 class="title">Ro'yxatdan o'tish</h2>

        <div class="field">
          <label>Ism va familiya</label>
          <input v-model="form.name" type="text" placeholder="Abdullayev Ali" />
        </div>

        <div class="field">
          <label>Telefon raqam</label>
          <input v-model="form.phone" type="tel" placeholder="+998 90 123 45 67" />
        </div>

        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="siz@example.com" />
        </div>

        <div class="field">
          <label>Parol</label>
          <div class="pass-row">
            <input
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              placeholder="Kamida 8 ta belgi"
            />
            <span class="pass-eye" @click="showPass = !showPass">
              {{ showPass ? '🙈' : '👁️' }}
            </span>
          </div>
          <!-- Parol kuchi -->
          <div class="strength-bar">
            <div
              class="strength-fill"
              :style="{ width: strengthPercent + '%', background: strengthColor }"
            ></div>
          </div>
          <span class="strength-label" :style="{ color: strengthColor }">
            {{ strengthLabel }}
          </span>
        </div>

        <div class="field">
          <label>Parolni tasdiqlash</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="••••••••"
            @keyup.enter="doSignup"
          />
          <span v-if="form.confirmPassword && form.password !== form.confirmPassword" class="error-hint">
            ⚠ Parollar mos kelmadi
          </span>
        </div>

        <button class="submit-btn" :disabled="loading" @click="doSignup">
          {{ loading ? 'Saqlanmoqda...' : "Ro'yxatdan o'tish" }}
        </button>

        <div class="divider">yoki</div>

        <button class="demo-btn" @click="fillDemo">
          👤 Demo ma'lumotlar bilan to'ldirish
        </button>

        <p class="switch-link">
          Hisobingiz bormi?
          <router-link to="/signin">Kirish</router-link>
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { mockSignup } from '../../api/mockAuth'

const router = useRouter()

const form = reactive({
  name: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const showPass = ref(false)
const loading = ref(false)
const apiResponse = ref(null)
const toast = reactive({ show: false, message: '', type: 'info' })

/* ── Parol kuchi ── */
const strengthPercent = computed(() => {
  const p = form.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8)  score += 25
  if (p.length >= 12) score += 15
  if (/[A-Z]/.test(p)) score += 20
  if (/[0-9]/.test(p)) score += 20
  if (/[^A-Za-z0-9]/.test(p)) score += 20
  return Math.min(score, 100)
})

const strengthColor = computed(() => {
  if (strengthPercent.value < 30) return '#e24b4a'
  if (strengthPercent.value < 60) return '#f59e0b'
  return '#1b8a5a'
})

const strengthLabel = computed(() => {
  if (!form.password) return ''
  if (strengthPercent.value < 30) return 'Zaif parol'
  if (strengthPercent.value < 60) return "O'rtacha parol"
  return 'Kuchli parol ✓'
})

/* ── Toast ── */
function showToast(message, type = 'info') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => (toast.show = false), 2500)
}

/* ── Demo ── */
function fillDemo() {
  form.name = 'Sardor Toshmatov'
  form.phone = '+998935551122'
  form.email = 'sardor@demo.com'
  form.password = 'Sardor@2024'
  form.confirmPassword = 'Sardor@2024'
  showToast("Demo ma'lumotlar to'ldirildi", 'info')
}

/* ── SIGNUP ── */
async function doSignup() {
  if (!form.name || !form.phone || !form.email || !form.password || !form.confirmPassword) {
    showToast("Barcha maydonlarni to'ldiring", 'error')
    return
  }
  if (!/\S+@\S+\.\S+/.test(form.email)) {
    showToast("Email formati noto'g'ri", 'error')
    return
  }
  if (form.password.length < 8) {
    showToast("Parol kamida 8 ta belgi bo'lishi kerak", 'error')
    return
  }
  if (form.password !== form.confirmPassword) {
    showToast('Parollar mos kelmadi', 'error')
    return
  }

  loading.value = true
  apiResponse.value = null

  try {
    const result = await mockSignup({
      name: form.name,
      phone: form.phone,
      email: form.email,
      password: form.password,
    })

    apiResponse.value = result

    if (result.success) {
      showToast("Ro'yxatdan o'tdingiz! Xush kelibsiz 🎉", 'success')
      localStorage.setItem('token', result.data.data.token)
      setTimeout(() => router.push('/home'), 1200)
    } else {
      showToast(result.data?.message || result.message || 'Xatolik yuz berdi', 'error')
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
  display: flex; align-items: center;
  gap: 10px; justify-content: center;
  margin-bottom: 2rem;
}
.logo-icon {
  width: 44px; height: 44px;
  background: #1b8a5a; border-radius: 12px;
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
  font-size: 20px; font-weight: 600;
  color: #1a1a1a; margin-bottom: 1.25rem;
}

.field { margin-bottom: 14px; }
.field label { display: block; font-size: 13px; color: #555; margin-bottom: 5px; }
.field input {
  width: 100%; padding: 9px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fafafa; color: #1a1a1a;
  outline: none; transition: border 0.15s;
}
.field input:focus { border-color: #1b8a5a; background: #fff; }

.pass-row { position: relative; }
.pass-row input { padding-right: 38px; }
.pass-eye {
  position: absolute; right: 10px; top: 50%;
  transform: translateY(-50%);
  cursor: pointer; font-size: 16px;
}

/* Parol kuchi */
.strength-bar {
  height: 4px; background: #e5e7eb;
  border-radius: 2px; margin-top: 8px;
  overflow: hidden;
}
.strength-fill {
  height: 100%; border-radius: 2px;
  transition: width 0.3s, background 0.3s;
}
.strength-label {
  font-size: 11px; display: block;
  margin-top: 4px; font-weight: 500;
}

.error-hint {
  font-size: 12px; color: #e24b4a;
  display: block; margin-top: 4px;
}

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
  text-align: center; font-size: 13px;
  color: #888; margin-top: 1.25rem;
}
.switch-link a { color: #1b8a5a; text-decoration: none; font-weight: 500; }
.switch-link a:hover { text-decoration: underline; }

.result-box {
  margin-top: 1rem;
  background: #f4f6f8;
  border: 1px solid #e5e7eb;
  border-radius: 8px; padding: 12px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: #555; overflow: auto; max-height: 180px;
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