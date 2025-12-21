import { getUserOrders } from '../utils/supabase.js';
import { getAuthenticatedUserId } from './authFlow.js';

export async function handleOrderHistory(userId) {
  const supabaseUserId = getAuthenticatedUserId(userId);

  const result = await getUserOrders(supabaseUserId, 10);

  if (!result.success) {
    return {
      response: `❌ Failed to fetch order history: ${result.error}`,
    };
  }

  if (result.orders.length === 0) {
    return {
      response: '📋 You have no orders yet.\n\nType "menu" to return to the main menu.',
    };
  }

  let response = '📋 *Your Recent Orders*\n\n';

  result.orders.forEach((order, index) => {
    const date = new Date(order.created_at).toLocaleDateString();
    const status = getStatusEmoji(order.order_status);
    
    response += `${index + 1}. Order ID: ${order.id.substring(0, 8)}...\n`;
    response += `   📅 Date: ${date}\n`;
    response += `   ${status} Status: ${order.order_status}\n`;
    response += `   🍾 ${order.quantity}x ${order.bottle_type}\n\n`;
  });

  response += 'To view details of a specific order, select option 3 from the main menu.\n\n';
  response += '💡 Type "menu" to return to the main menu.';

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
