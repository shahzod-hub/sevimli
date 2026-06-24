

const BASE_URL = 'https://6a3c40e4e4a07f202e16a52c.mockapi.io/sevimli'


export async function mockSignin(email, password) {
  const res = await fetch(`${BASE_URL}/sevimli?email=${email}`)
  const users = await res.json()

  const user = users.find((u) => u.email === email && u.password === password)

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
          token: 'mock_token_' + user.id + '_' + Math.random().toString(36).slice(2, 8),
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

  const checkRes = await fetch(`${BASE_URL}/sevimli?email=${email}`)
  const existing = await checkRes.json()

  if (existing.length > 0) {
    return {
      success: false,
      data: {
        success: false,
        message: "Bu email allaqachon ro'yxatdan o'tgan",
        error: 'EMAIL_ALREADY_EXISTS',
      },
    }
  }

  
  const res = await fetch(`${BASE_URL}/sevimli`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password, role: 'customer' }),
  })

  const newUser = await res.json()

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
        token: 'mock_token_' + newUser.id + '_' + Math.random().toString(36).slice(2, 8),
        expires_in: '24h',
      },
    },
  }
}


export async function mockForgotPassword(email) {
  return {
    success: true,
    data: {
      success: true,
      message: 'Parol tiklash havolasi yuborildi',
      data: { email, sent_at: new Date().toISOString() },
    },
  }
}