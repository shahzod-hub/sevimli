const mockUsers = [
  {
    id: 1,
    name: 'Ali Valiyev',
    email: 'ali@test.com',
    phone: '+998901234567',
    password: 'password123',
    token: 'mock_token_ali_abc123',
    role: 'customer',
  },
  {
    id: 2,
    name: 'Malika Karimova',
    email: 'malika@test.com',
    phone: '+998971234567',
    password: 'malika2026',
    token: 'https://6a3c40e4e4a07f202e16a52c.mockapi.io/sevimli/',
    role: 'admin',
  },
]

let nextId = 3

function delay(ms = 900) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}


export async function mockSignin(email, password) {
  await delay(900)

  const user = mockUsers.find((u) => u.email === email && u.password === password)

  if (user) {
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
            role: user.role,
          },
          token: user.token,
          expires_in: '24h',
        },
      },
    }
  }

  return {
    success: false,
    data: {
      success: false,
      message: "Email yoki parol noto'g'ri",
      error: 'INVALID_CREDENTIALS',
    },
  }
}


export async function mockSignup({ name, phone, email, password }) {
  await delay(1000)

  if (mockUsers.find((u) => u.email === email)) {
    return {
      success: false,
      data: {
        success: false,
        message: "Bu email allaqachon ro'yxatdan o'tgan",
        error: 'EMAIL_ALREADY_EXISTS',
      },
    }
  }

  const newUser = {
    id: nextId++,
    name,
    email,
    phone,
    password,
    token: 'mock_token_' + email.split('@')[0] + '_' + Math.random().toString(36).slice(2, 8),
    role: 'customer',
  }
  mockUsers.push(newUser)

  return {
    success: true,
    data: {
      success: true,
      message: "Ro'yxatdan muvaffaqiyatli o'tdingiz",
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
        },
        token: newUser.token,
        expires_in: '24h',
      },
    },
  }
}


export async function mockForgotPassword(email) {
  await delay(700)
  return {
    success: true,
    data: {
      success: true,
      message: 'Parol tiklash havolasi yuborildi',
      data: { email, sent_at: new Date().toISOString() },
    },
  }
}