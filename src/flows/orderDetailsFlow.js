import { getOrderById } from '../utils/supabase.js';
import { getAuthenticatedUserId } from './authFlow.js';
import { sessionStore } from '../utils/sessionStore.js';

export async function handleOrderDetails(userId, message) {
  const state = sessionStore.getState(userId);

  if (state === 'AWAITING_ORDER_ID') {
    return await fetchOrderDetails(userId, message);
  }

  return {
    response: 'Please provide an Order ID to view details.',
  };
}

async function fetchOrderDetails(userId, orderId) {
  const supabaseUserId = getAuthenticatedUserId(userId);
  const orderIdTrimmed = orderId.trim();

  if (!orderIdTrimmed) {
    return {
      response: '❌ Please provide a valid Order ID.',
    };
  }

  const result = await getOrderById(orderIdTrimmed, supabaseUserId);

  if (!result.success) {
    return {
      response: `❌ Order not found or you don't have permission to view it.\n\nPlease check the Order ID and try again.\n\nType "menu" to return to the main menu.`,
    };
  }

  const order = result.order;
  const createdDate = new Date(order.created_at).toLocaleDateString();
  const deliveryDate = new Date(order.preferred_delivery_date).toLocaleDateString();
  const statusEmoji = getStatusEmoji(order.order_status);

  const response = `
📋 *Order Details*

🆔 Order ID: ${order.id}
📅 Order Date: ${createdDate}
${statusEmoji} Status: ${order.order_status}

🍾 Bottle Type: ${order.bottle_type}
📦 Quantity: ${order.quantity} bottles
📍 Delivery Address: ${order.delivery_address}
🚚 Preferred Delivery Date: ${deliveryDate}

Type "menu" to return to the main menu.`;

  return { response };
}

function getStatusEmoji(status) {
  switch (status) {
    case 'Pending':
      return '⏳';
    case 'Confirmed':
      return '✅';
    case 'Delivered':
      return '📦';
    default:
      return '📋';
  }
}
