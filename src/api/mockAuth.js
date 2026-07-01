
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
    if (!raw) return initialUsers.slice()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : initialUsers.slice()
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
      if (res.ok) {
        const remoteUsers = await res.json()
        if (Array.isArray(remoteUsers)) {
          sevimli = remoteUsers
          remoteOk = true
        }
      }
    } catch (e) {
      console.log('MockAPI unavailable, using localStorage')
    }

    if (!remoteOk) {
      sevimli = getStoredUsers()
    }

let user = sevimli.find((u) => u.email === email && u.password === password)

if (!user) {
  user = getStoredUsers().find((u) => u.email === email && u.password === password)
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
      if (res.ok) {
        const remoteUsers = await res.json()
        if (Array.isArray(remoteUsers)) {
          sevimli = remoteUsers
          remoteOk = true
        }
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