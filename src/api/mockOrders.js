const API_BASE = 'https://6a3c40e4e4a07f202e16a52c.mockapi.io/sevimli';
const ORDERS_URL = `${API_BASE}/orders`;
const ORDERS_STORAGE_KEY = 'sevimli_admin_orders';
const ORDER_API_TIMEOUT = 5000;

const normalizeOrder = (order) => ({
  id: order.id ?? `order_${Date.now()}`,
  customerName: order.customerName || order.name || 'Mijoz',
  customerPhone: order.customerPhone || order.phone || '',
  customerAddress: order.customerAddress || order.address || '',
  payment: order.payment || 'cash',
  items: Array.isArray(order.items) ? order.items : [],
  totalPrice: Number(order.totalPrice || order.total || 0),
  status: order.status || 'new',
  createdAt: order.createdAt || new Date().toISOString(),
});

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

const createLocalOrder = (order) => {
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
  [...remoteOrders, ...localOrders].forEach((order) => {
    const normalized = normalizeOrder(order);
    map.set(String(normalized.id), normalized);
  });

  return [...map.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const getRemoteOrders = async () => {
  try {
    const res = await fetch(`${ORDERS_URL}?sortBy=createdAt&order=desc`, {
      signal: AbortSignal.timeout(ORDER_API_TIMEOUT),
    });
    if (!res.ok) throw new Error(`Remote orders endpoint responded ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Remote orders response is not an array');
    return { success: true, data: mergeOrders(data, getLocalOrders()), remote: true };
  } catch (error) {
    console.warn('Remote orders unavailable:', error?.message || error);
    return { success: false, data: getLocalOrders(), remote: false };
  }
};

const saveOrderRemote = async (order) => {
  try {
    const res = await fetch(ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
      signal: AbortSignal.timeout(ORDER_API_TIMEOUT),
    });
    if (!res.ok) throw new Error(`Remote save failed ${res.status}`);
    const saved = await res.json();
    const normalized = createLocalOrder(saved);
    return { success: true, data: normalized, remote: true };
  } catch (error) {
    console.warn('Remote saveOrder failed:', error?.message || error);
    return { success: false, data: createLocalOrder(order), remote: false };
  }
};

const updateRemoteOrderStatus = async (orderId, status) => {
  try {
    const res = await fetch(`${ORDERS_URL}/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
      signal: AbortSignal.timeout(ORDER_API_TIMEOUT),
    });
    if (!res.ok) throw new Error(`Remote update failed ${res.status}`);
    const updated = await res.json();
    const normalized = normalizeOrder(updated);
    const orders = getLocalOrders().map((order) =>
      String(order.id) === String(orderId) ? normalized : order
    );
    saveLocalOrders(orders.some((order) => String(order.id) === String(orderId)) ? orders : [normalized, ...orders]);
    return { success: true, data: normalized, remote: true };
  } catch (error) {
    console.warn('Remote update order status failed:', error?.message || error);
    const orders = getLocalOrders();
    const updated = orders.map((order) =>
      String(order.id) === String(orderId) ? normalizeOrder({ ...order, status }) : order
    );
    saveLocalOrders(updated);
    return { success: false, data: updated.find((order) => String(order.id) === String(orderId)), remote: false };
  }
};

const deleteRemoteOrder = async (orderId) => {
  try {
    const res = await fetch(`${ORDERS_URL}/${orderId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(ORDER_API_TIMEOUT),
    });
    if (!res.ok) throw new Error(`Remote delete failed ${res.status}`);
    saveLocalOrders(getLocalOrders().filter((order) => String(order.id) !== String(orderId)));
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
