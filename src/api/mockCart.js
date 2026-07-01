const BASE_URL = 'https://6a3c40e4e4a07f202e16a52c.mockapi.io/sevimli/cart';
const CART_API_TIMEOUT = 2000;
const CART_USER_KEY = 'sevimli_cart_user';

const isLocalCartId = (cartItemId) => !cartItemId || String(cartItemId).startsWith('local_');
const getCartUserId = (userId) => {
  if (userId) return userId;
  let guestId = localStorage.getItem(CART_USER_KEY);
  if (!guestId) {
    guestId = `guest_${Math.random().toString(36).slice(2,10)}`;
    localStorage.setItem(CART_USER_KEY, guestId);
  }
  return guestId;
};

const parseCartItemId = (cartItemId) => {
  if (!cartItemId) return NaN;
  if (String(cartItemId).startsWith('local_')) return Number(cartItemId.replace('local_', ''));
  const numeric = Number(cartItemId);
  return Number.isNaN(numeric) ? NaN : numeric;
};

export async function getCart(userId) {
  const cartUserId = getCartUserId(userId);
  try {
    const res = await fetch(`${BASE_URL}?userId=${encodeURIComponent(cartUserId)}`, {
      signal: AbortSignal.timeout(CART_API_TIMEOUT),
    });
    if (res.ok) {
      const data = await res.json();
      const filteredData = Array.isArray(data)
        ? data.filter((item) => !item.status && !item.customerName && !item.customerPhone && !item.customerAddress)
        : [];
      const mapped = filteredData.map((item) => ({
        ...item,
        id: item.productId ?? item.id,
        cartItemId: item.id ?? item.cartItemId,
        quantity: item.quantity ?? 1,
      }));
      return { success: true, data: mapped };
    }
  } catch (e) {
    console.log("MockAPI carts not available or failed, falling back to localStorage");
  }
  
  // Local fallback
  const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
  const mapped = localCart.map(item => ({
    ...item,
    cartItemId: item.cartItemId || `local_${item.id}`
  }));
  return { success: true, data: mapped };
}

export async function addToCart(userId, product, quantity = 1) {
  const cartUserId = getCartUserId(userId);
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: cartUserId,
        productId: product.id,
        name: product.name,
        image: product.image,
        category: product.category,
        unit: product.unit,
        price: product.price,
        quantity,
      }),
      signal: AbortSignal.timeout(CART_API_TIMEOUT),
    });

    console.log("POST status:", response.status);

    const data = await response.json();
    console.log("POST response:", data);

    return data;
  } catch (e) {
    console.error("MockAPI POST xatosi:", e);
    return null;
  }
}

export async function updateCartItem(cartItemId, quantity) {
  const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
  const localId = parseCartItemId(cartItemId);
  if (isLocalCartId(cartItemId)) {
    const item = localCart.find(i => i.id === localId || i.cartItemId === cartItemId);
    if (item) {
      item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(localCart));
    }
    return { success: true };
  }

  try {
    const res = await fetch(`${BASE_URL}/${cartItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
      signal: AbortSignal.timeout(CART_API_TIMEOUT),
    });
    if (res.ok) return { success: true };
  } catch (e) {
    console.error("Failed to update cart item on MockAPI, updating locally", e);
  }

  // Local fallback on failure
  const item = localCart.find(i => i.id === localId || i.cartItemId === cartItemId);
  if (item) {
    item.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(localCart));
  }
  return { success: true };
}

export async function removeFromCart(cartItemId) {
  const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
  const localId = parseCartItemId(cartItemId);
  if (isLocalCartId(cartItemId)) {
    const filtered = localCart.filter(i => i.id !== localId && i.cartItemId !== cartItemId);
    localStorage.setItem('cart', JSON.stringify(filtered));
    return { success: true };
  }

  try {
    const res = await fetch(`${BASE_URL}/${cartItemId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(CART_API_TIMEOUT),
    });
    if (res.ok) return { success: true };
  } catch (e) {
    console.error("Failed to remove cart item from MockAPI, removing locally", e);
  }

  // Local fallback
  const filtered = localCart.filter(i => i.id !== localId && i.cartItemId !== cartItemId);
  localStorage.setItem('cart', JSON.stringify(filtered));
  return { success: true };
}

export async function clearCart(userId) {
  localStorage.setItem('cart', '[]');

  let remoteOk = true;
  const cartUserId = getCartUserId(userId);

  try {
    const res = await fetch(`${BASE_URL}?userId=${encodeURIComponent(cartUserId)}`, {
      signal: AbortSignal.timeout(CART_API_TIMEOUT),
    });
    if (res.ok) {
      const items = await res.json();
      console.log("CLEAR CART ITEMS:", items); // <-- debug uchun, item strukturasini ko'rish

      if (Array.isArray(items) && items.length > 0) {
        const results = await Promise.allSettled(
          items.map(item => {
            const itemId = item.id ?? item.cartItemId ?? item._id;
            if (!itemId) {
              console.error("Item ID topilmadi, o'chirib bo'lmadi:", item);
              return Promise.resolve({ ok: false });
            }
            return fetch(`${BASE_URL}/${itemId}`, {
              method: 'DELETE',
              signal: AbortSignal.timeout(5000),
            });
          })
        );

        remoteOk = results.every(
          r => r.status === 'fulfilled' && r.value.ok
        );

        if (!remoteOk) {
          console.error("Ba'zi cart itemlar MockAPI'dan o'chmadi:", results);
        }
      }
    } else {
      remoteOk = false;
    }
  } catch (e) {
    console.error("Failed to clear remote cart", e);
    remoteOk = false;
  }

  return { success: true, remoteOk };
}