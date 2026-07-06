
const USERS_ENDPOINT = 'https://6a3c40e4e4a07f202e16a52c.mockapi.io/sevimli/sevimli'
const STORAGE_KEY = 'sevimli_mock_users'

const initialUsers = [
  {
    id: '1',
    name: 'Ali Test',
    email: 'ali@test.com',
    phone: '+998901234567',
    password: 'password123',
    role: 'customer',
  },
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@sevimli.uz',
    phone: '+998901234567',
    password: 'admin123',
    role: 'admin',
  }
]

function delay(ms = 900) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function generateToken(email) {
  return 'mock_token_' + email.split('@')[0] + '_' + Math.random().toString(36).slice(2, 8)
}

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    let users = []
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        users = parsed
      }
    }
    
    // Ensure all initialUsers are present in the list
    initialUsers.forEach(initUser => {
      if (!users.some(u => u.email === initUser.email)) {
        users.push(initUser)
      }
    })
    
    return users
  } catch {
    return initialUsers.slice()
  }
}

function saveStoredUsers(sevimli) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sevimli))
}

export async function mockSignin(email, password) {
  await delay(900)

  try {
    let sevimli
    let remoteOk = false

    // Avval mockapi'ga murojaat qilamiz
    try {
      const res = await fetch(`${USERS_ENDPOINT}?email=${encodeURIComponent(email)}`, {
        signal: AbortSignal.timeout(5000),
      })
      if (res.status === 200) {
        const remoteUsers = await res.json()
        if (Array.isArray(remoteUsers)) {
          sevimli = remoteUsers
          remoteOk = true
        }
      } else if (res.status === 404) {
        sevimli = []
        remoteOk = true
      }
    } catch (e) {
      console.log('MockAPI unavailable, using localStorage')
    }

    const localUsers = getStoredUsers()
    if (!remoteOk) {
      sevimli = localUsers
    }
console.log("Remote users:", sevimli)
console.log("Local users:", localUsers)
console.log("Email:", email)
console.log("Password:", password)
let user = sevimli.find((u) => u.email === email && u.password === password)

if (!user) {
  user = localUsers.find((u) => u.email === email && u.password === password)
  // Agar foydalanuvchi lokal topilsa va MockAPI ishlayotgan bo'lsa, uni MockAPI ga yuklab (seed) qo'yamiz
  if (user && remoteOk) {
    try {
      const createRes = await fetch(USERS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
        signal: AbortSignal.timeout(5000),
      })
      if (createRes.ok) {
        const created = await createRes.json()
        user = created
      }
    } catch (e) {
      console.log('Failed to seed local user to MockAPI:', e)
    }
  }
}

if (!user) {
  return {
    success: false,
    data: {
      success: false,
      message: "Email yoki parol noto'g'ri",
      error: 'INVALID_CREDENTIALS',
    },
  }
}

if (!user.role) {
  const localUser = localUsers.find((u) => u.email === email)
  if (localUser?.role) {
    user.role = localUser.role
  }
}

    const token = generateToken(email)

    // Remote'da bo'lsa, tokenni yangilashga harakat qilamiz
    if (remoteOk) {
      try {
        await fetch(`${USERS_ENDPOINT}/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...user, token }),
          signal: AbortSignal.timeout(5000),
        })
      } catch (e) {
        console.log('Could not update remote, continuing locally')
      }
    }

    return {
      success: true,
      data: {
        success: true,
        message: 'Tizimga muvaffaqiyatli kirdingiz',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role ?? 'customer',
          },
          token,
          expires_in: '24h',
        },
      },
    }
  } catch (err) {
    return {
      success: false,
      data: {
        success: false,
        message: 'Server bilan ulanishda xatolik',
        error: 'SERVER_ERROR',
      },
    }
  }
}

export async function mockSignup({ name, phone, email, password }) {
  await delay(1000)

  try {
    let sevimli
    let remoteOk = false

    // Avval mockapi'ga murojaat qilamiz - shu email band emasligini tekshiramiz
    try {
      const res = await fetch(`${USERS_ENDPOINT}?email=${encodeURIComponent(email)}`, {
        signal: AbortSignal.timeout(5000),
      })
      if (res.status === 200) {
        const remoteUsers = await res.json()
        if (Array.isArray(remoteUsers)) {
          sevimli = remoteUsers
          remoteOk = true
        }
      } else if (res.status === 404) {
        sevimli = []
        remoteOk = true
      }
    } catch (e) {
      console.log('MockAPI unavailable, using localStorage')
    }

    if (!remoteOk) {
      sevimli = getStoredUsers()
    }

    if (sevimli.some((u) => u.email === email)) {
      return {
        success: false,
        data: {
          success: false,
          message: "Bu email allaqachon ro'yxatdan o'tgan",
          error: 'EMAIL_ALREADY_EXISTS',
        },
      }
    }

    const token = generateToken(email)
    const newUser = {
      id: Date.now().toString(),
      name,
      phone,
      email,
      password,
      token,
      role: 'customer',
    }

    // Remote'da yaratishga harakat qilamiz
    let createdUser = newUser
    let createdRemotely = false
    if (remoteOk) {
      try {
        const res = await fetch(`${USERS_ENDPOINT}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
          signal: AbortSignal.timeout(5000),
        })
        if (res.ok) {
          createdUser = await res.json()
          createdRemotely = true
        }
      } catch (e) {
        console.log('Could not create on remote, saving locally')
      }
    }

    // Remote'ga yoza olmagan bo'lsak, localStorage'ga zaxira sifatida saqlaymiz
    if (!createdRemotely) {
      const storedSevimli = getStoredUsers()
      storedSevimli.push(newUser)
      saveStoredUsers(storedSevimli)
    }

    return {
      success: true,
      data: {
        success: true,
        message: "Ro'yxatdan muvaffaqiyatli o'tdingiz",
        data: {
          user: {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            phone: createdUser.phone,
            role: createdUser.role ?? 'customer',
          },
          token: createdUser.token,
          expires_in: '24h',
        },
      },
    }
  } catch (err) {
    return {
      success: false,
      data: {
        success: false,
        message: 'Server bilan ulanishda xatolik',
        error: 'SERVER_ERROR',
      },
    }
  }
}

export async function mockForgotPassword(email) {
  await delay(700)

  try {
    return {
      success: true,
      data: {
        success: true,
        message: 'Parol tiklash havolasi yuborildi',
        data: { email, sent_at: new Date().toISOString() },
      },
    }
  } catch (err) {
    return {
      success: false,
      data: {
        success: false,
        message: 'Server bilan ulanishda xatolik',
        error: 'SERVER_ERROR',
      },
    }
  }
}