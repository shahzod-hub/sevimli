const BASE_URL = 'https://6a3c40e4e4a07f202e16a52c.mockapi.io/sevimli/cart';
const CART_API_TIMEOUT = 2000;
const CART_USER_KEY = 'sevimli_cart_user';
const CART_STORAGE_KEY = 'cart';
const CART_CLEARED_AT_KEY = 'sevimli_cart_cleared_at';

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

const readLocalCart = () => {
  try {
    const data = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    localStorage.setItem(CART_STORAGE_KEY, '[]');
    return [];
  }
};

const writeLocalCart = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

const mapCartItem = (item) => ({
  ...item,
  id: item.productId ?? item.id,
  cartItemId: item.cartItemId ?? item.id ?? `local_${item.productId ?? item.id}`,
  quantity: Number(item.quantity ?? 1),
});

const isActiveRemoteCartItem = (item) => {
  if (item.recordType === 'product' || item.entityType === 'product') return false;
  if (item.recordType === 'order' || item.entityType === 'order') return false;
  if (item.status || item.customerName || item.customerPhone || item.customerAddress) return false;

  const clearedAt = Number(localStorage.getItem(CART_CLEARED_AT_KEY) || 0);
  if (!clearedAt) return true;

  const createdAt = Date.parse(item.createdAt || item.updatedAt || '');
  return Number.isFinite(createdAt) && createdAt > clearedAt;
};

export async function getCart(userId) {
  const cartUserId = getCartUserId(userId);
  const localCart = readLocalCart().map(mapCartItem);

  try {
    const res = await fetch(`${BASE_URL}?userId=${encodeURIComponent(cartUserId)}`, {
      signal: AbortSignal.timeout(CART_API_TIMEOUT),
    });
    if (res.ok) {
      const data = await res.json();
      const filteredData = Array.isArray(data)
        ? data.filter(isActiveRemoteCartItem)
        : [];
      const remoteItems = filteredData.map(mapCartItem);
      const localIds = new Set(localCart.map((item) => String(item.id)));
      const merged = [
        ...localCart,
        ...remoteItems.filter((item) => !localIds.has(String(item.id))),
      ];

      writeLocalCart(merged);
      return { success: true, data: merged, remote: true };
    }
  } catch (e) {
    console.log("MockAPI carts not available or failed, falling back to localStorage");
  }
  
  return { success: true, data: localCart, remote: false };
}

export async function addToCart(userId, product, quantity = 1, options = {}) {
  const { syncLocal = true } = options;
  const cartUserId = getCartUserId(userId);
  const localCart = readLocalCart();
  const existingLocal = localCart.find((item) => String(item.id) === String(product.id));

  if (syncLocal) {
    if (existingLocal) {
      existingLocal.quantity = Number(existingLocal.quantity || 0) + quantity;
    } else {
      localCart.push({
        ...product,
        quantity,
        cartItemId: `local_${product.id}`,
        createdAt: new Date().toISOString(),
      });
    }
    writeLocalCart(localCart);
  }

  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recordType: 'cartItem',
        userId: cartUserId,
        productId: product.id,
        name: product.name,
        image: product.image,
        category: product.category,
        unit: product.unit,
        price: product.price,
        quantity,
        createdAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(CART_API_TIMEOUT),
    });

    if (!response.ok) throw new Error(`MockAPI POST failed ${response.status}`);

    const data = await response.json();
    return mapCartItem(data);
  } catch (e) {
    console.error("MockAPI POST xatosi:", e);
    return mapCartItem(
      existingLocal ||
      localCart.find((item) => String(item.id) === String(product.id)) ||
      { ...product, cartItemId: `local_${product.id}`, quantity }
    );
  }
}

export async function updateCartItem(cartItemId, quantity) {
  const localCart = readLocalCart();
  const localId = parseCartItemId(cartItemId);
  if (isLocalCartId(cartItemId)) {
    const item = localCart.find(i => i.id === localId || i.cartItemId === cartItemId);
    if (item) {
      item.quantity = quantity;
      writeLocalCart(localCart);
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
    writeLocalCart(localCart);
  }
  return { success: true };
}

export async function removeFromCart(cartItemId) {
  const localCart = readLocalCart();
  const localId = parseCartItemId(cartItemId);
  if (isLocalCartId(cartItemId)) {
    const filtered = localCart.filter(i => i.id !== localId && i.cartItemId !== cartItemId);
    writeLocalCart(filtered);
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
  writeLocalCart(filtered);
  return { success: true };
}

export async function clearCart(userId) {
  writeLocalCart([]);
  localStorage.setItem(CART_CLEARED_AT_KEY, String(Date.now()));

  let remoteOk = true;
  const cartUserId = userId;
  const guestUserId = localStorage.getItem(CART_USER_KEY);

  const deleteForUser = async (uid) => {
    if (!uid) return;
    try {
      const res = await fetch(`${BASE_URL}?userId=${encodeURIComponent(uid)}`, {
        signal: AbortSignal.timeout(CART_API_TIMEOUT),
      });
      if (res.ok) {
        const items = await res.json();
        console.log("CLEAR CART ITEMS for user", uid, ":", items);

        const cartItems = Array.isArray(items)
          ? items.filter((item) => item.recordType !== 'product' && item.entityType !== 'product' && item.recordType !== 'order' && item.entityType !== 'order')
          : [];

        if (cartItems.length > 0) {
          const results = await Promise.allSettled(
            cartItems.map(item => {
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

          const userOk = results.every(
            r => r.status === 'fulfilled' && r.value.ok
          );

          if (!userOk) {
            console.error("Ba'zi cart itemlar MockAPI'dan o'chmadi:", results);
            remoteOk = false;
          }
        }
      } else {
        remoteOk = false;
      }
    } catch (e) {
      console.error("Failed to clear remote cart for user", uid, e);
      remoteOk = false;
    }
  };

  await deleteForUser(cartUserId);
  if (guestUserId && guestUserId !== cartUserId) {
    await deleteForUser(guestUserId);
  }

  return { success: true, remoteOk };
}
