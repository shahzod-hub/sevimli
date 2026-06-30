const BASE_URL = 'https://6a3c40e4e4a07f202e16a52c.mockapi.io/sevimli/cart';

export async function getCart(userId) {
  try {
    const res = await fetch(`${BASE_URL}/cart?userId=${userId}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: Array.isArray(data) ? data : [] };
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
export async function addToCart(userId, product) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      productId: product.id,
      name: product.name,
      image: product.image,
      category: product.category,
      unit: product.unit,
      price: product.price,
      quantity: 1,
    }),
  });

  return await response.json();
}
export async function updateCartItem(cartItemId, quantity) {
  if (String(cartItemId).startsWith('local_')) {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const id = Number(cartItemId.replace('local_', ''));
    const item = localCart.find(i => i.id === id);
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
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return { success: true };
  } catch (e) {
    console.error("Failed to update cart item on MockAPI, updating locally", e);
  }
  
  // Local fallback on failure
  const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
  const id = Number(cartItemId);
  const item = localCart.find(i => i.id === id);
  if (item) {
    item.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(localCart));
  }
  return { success: true };
}

export async function removeFromCart(cartItemId) {
  if (String(cartItemId).startsWith('local_')) {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const id = Number(cartItemId.replace('local_', ''));
    const filtered = localCart.filter(i => i.id !== id);
    localStorage.setItem('cart', JSON.stringify(filtered));
    return { success: true };
  }

  try {
    const res = await fetch(`${BASE_URL}/${cartItemId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return { success: true };
  } catch (e) {
    console.error("Failed to remove cart item from MockAPI, removing locally", e);
  }
  
  // Local fallback
  const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
  const id = Number(cartItemId);
  const filtered = localCart.filter(i => i.id !== id);
  localStorage.setItem('cart', JSON.stringify(filtered));
  return { success: true };
}

export async function clearCart(userId) {
  localStorage.setItem('cart', '[]');
  
  try {
    const res = await fetch(`${BASE_URL}?userId=${userId}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        for (const item of items) {
          await fetch(`${BASE_URL}/${item.id}`, { 
            method: 'DELETE',
            signal: AbortSignal.timeout(3000)
          });
        }
      }
    }
  } catch (e) {
    console.error("Failed to clear remote cart", e);
  }
  return { success: true };
}