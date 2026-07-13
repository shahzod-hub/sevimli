const API_BASE = 'https://6a3c40e4e4a07f202e16a52c.mockapi.io/sevimli';
const CART_URL = `${API_BASE}/cart`;
const ORDERS_STORAGE_KEY = 'sevimli_admin_orders';
const ORDER_API_TIMEOUT = 5000;

const isRemoteOrder = (order) => order?.recordType === 'order' || order?.entityType === 'order';

const normalizeOrderItems = (order) => {
  if (Array.isArray(order.items)) return order.items;

  if (order.items && typeof order.items === 'object') {
    return Object.values(order.items);
  }

  if (typeof order.itemsJson === 'string') {
    try {
      const parsed = JSON.parse(order.itemsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const normalizeOrder = (order) => {
  const items = normalizeOrderItems(order);

  return {
    ...order,
    id: order.id ?? `order_${Date.now()}`,
    recordType: 'order',
    entityType: 'order',
    customerName: order.customerName || order.name || 'Mijoz',
    customerPhone: order.customerPhone || order.phone || '',
    customerAddress: order.customerAddress || order.address || '',
    payment: order.payment || 'cash',
    items,
    itemsJson: order.itemsJson || JSON.stringify(items),
    itemCount: Number(order.itemCount || items.length),
    totalPrice: Number(order.totalPrice || order.total || 0),
    status: order.status || 'new',
    createdAt: order.createdAt || new Date().toISOString(),
  };
};

const requestCart = async (url, options = {}) => {
  const headers = { ...options.headers };
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
    signal: AbortSignal.timeout(ORDER_API_TIMEOUT),
  });

  if (!res.ok) throw new Error(`MockAPI cart responded ${res.status}`);
  return res.status === 204 ? null : res.json();
};

const getLocalOrders = () => {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY) || '[]';
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeOrder) : [];
  } catch {
    return [];
  }
};

const saveLocalOrders = (orders) => {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
};

const upsertLocalOrder = (order) => {
  const normalized = normalizeOrder(order);
  const current = getLocalOrders();
  const existingIndex = current.findIndex((item) => String(item.id) === String(normalized.id));

  if (existingIndex >= 0) {
    current[existingIndex] = normalized;
    saveLocalOrders(current);
  } else {
    saveLocalOrders([normalized, ...current]);
  }

  return normalized;
};

const mergeOrders = (remoteOrders, localOrders) => {
  const map = new Map();
  [...localOrders, ...remoteOrders].forEach((order) => {
    const normalized = normalizeOrder(order);
    map.set(String(normalized.id), normalized);
  });

  return [...map.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const getRemoteOrders = async () => {
  try {
    const data = await requestCart(`${CART_URL}?recordType=order&sortBy=createdAt&order=desc`);
    if (!Array.isArray(data)) throw new Error('Remote orders response is not an array');

    const remoteOrders = data.filter(isRemoteOrder).map(normalizeOrder);
    const orders = mergeOrders(remoteOrders, getLocalOrders());
    saveLocalOrders(orders);

    return { success: true, data: orders, remote: true };
  } catch (error) {
    console.warn('Remote orders unavailable:', error?.message || error);
    return { success: false, data: getLocalOrders(), remote: false };
  }
};

const saveOrderRemote = async (order) => {
  const normalized = normalizeOrder({
    ...order,
    recordType: 'order',
    entityType: 'order',
  });

  try {
    const saved = await requestCart(CART_URL, {
      method: 'POST',
      body: JSON.stringify(normalized),
    });

    return { success: true, data: upsertLocalOrder(saved), remote: true };
  } catch (error) {
    console.warn('Remote saveOrder failed:', error?.message || error);
    return { success: false, data: upsertLocalOrder(normalized), remote: false };
  }
};

const updateRemoteOrderStatus = async (orderId, status) => {
  const currentOrder = getLocalOrders().find((order) => String(order.id) === String(orderId));
  const payload = normalizeOrder({
    ...(currentOrder || {}),
    id: orderId,
    status,
    recordType: 'order',
    entityType: 'order',
  });

  try {
    const updated = await requestCart(`${CART_URL}/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return { success: true, data: upsertLocalOrder(updated), remote: true };
  } catch (error) {
    console.warn('Remote update order status failed:', error?.message || error);
    return { success: false, data: upsertLocalOrder(payload), remote: false };
  }
};

const deleteRemoteOrder = async (orderId) => {
  try {
    await requestCart(`${CART_URL}/${orderId}`, { method: 'DELETE' });
    const orders = getLocalOrders().filter((order) => String(order.id) !== String(orderId));
    saveLocalOrders(orders);
    return { success: true, remote: true };
  } catch (error) {
    console.warn('Remote delete order failed:', error?.message || error);
    const orders = getLocalOrders().filter((order) => String(order.id) !== String(orderId));
    saveLocalOrders(orders);
    return { success: false, remote: false };
  }
};

export const ordersApi = {
  getOrders: getRemoteOrders,
  saveOrder: saveOrderRemote,
  updateOrderStatus: updateRemoteOrderStatus,
  deleteOrder: deleteRemoteOrder,
  getLocalOrders,
  saveLocalOrders,
};
