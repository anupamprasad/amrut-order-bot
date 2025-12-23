import { sessionStore } from '../utils/sessionStore.js';
import { createOrder, sendOrderNotification } from '../utils/supabase.js';
import { getAuthenticatedUserId } from './authFlow.js';

const ORDER_STATES = {
  START: 'NEW_ORDER_START',
  AWAITING_BOTTLE_TYPE: 'AWAITING_BOTTLE_TYPE',
  AWAITING_QUANTITY: 'AWAITING_QUANTITY',
  AWAITING_ADDRESS: 'AWAITING_ADDRESS',
  AWAITING_DELIVERY_DATE: 'AWAITING_DELIVERY_DATE',
  AWAITING_CONFIRMATION: 'AWAITING_CONFIRMATION',
};

export async function handleNewOrderFlow(userId, message) {
  const state = sessionStore.getState(userId);

  switch (state) {
    case ORDER_STATES.START:
      return startNewOrder(userId);

    case ORDER_STATES.AWAITING_BOTTLE_TYPE:
      return handleBottleTypeInput(userId, message);

    case ORDER_STATES.AWAITING_QUANTITY:
      return handleQuantityInput(userId, message);

    case ORDER_STATES.AWAITING_ADDRESS:
      return handleAddressInput(userId, message);

    case ORDER_STATES.AWAITING_DELIVERY_DATE:
      return handleDeliveryDateInput(userId, message);

    case ORDER_STATES.AWAITING_CONFIRMATION:
      return handleConfirmation(userId, message);

    default:
      return startNewOrder(userId);
  }
}

function startNewOrder(userId) {
  sessionStore.updateState(userId, ORDER_STATES.AWAITING_BOTTLE_TYPE);
  return {
    response: `📦 *New Order*\n\nPlease select bottle type:\n\n• 1. 200ml Bottle\n• 2. 300ml Bottle\n• 3. 500ml Bottle\n\nReply with 1, 2, or 3\n\n💡 Type 'menu' anytime to go back`,
    images: [
      {
        url: '/images/bottle.svg',
        caption: '1. 200ml Bottle',
        type: '200ml'
      },
      {
        url: '/images/bottle.svg',
        caption: '2. 300ml Bottle',
        type: '300ml'
      },
      {
        url: '/images/bottle.svg',
        caption: '3. 500ml Bottle',
        type: '500ml'
      }
    ],
  };
}

function handleBottleTypeInput(userId, message) {
  const choice = message.trim();
  let bottleType;

  if (choice === '1') {
    bottleType = '200ml';
  } else if (choice === '2') {
    bottleType = '300ml';
  } else if (choice === '3') {
    bottleType = '500ml';
  } else {
    return {
      response: '❌ Invalid selection. Please reply with 1 for 200ml, 2 for 300ml, or 3 for 500ml:',
    };
  }

  sessionStore.setTempData(userId, 'bottleType', bottleType);
  sessionStore.updateState(userId, ORDER_STATES.AWAITING_QUANTITY);

  return {
    response: `✅ Selected: ${bottleType}\n\nPlease enter the quantity (number of bottles):\n\n💡 Type 'menu' to cancel and return to main menu`,
  };
}

function handleQuantityInput(userId, message) {
  const quantity = parseInt(message.trim());

  if (isNaN(quantity) || quantity <= 0) {
    return {
      response: '❌ Invalid quantity. Please enter a positive number:',
    };
  }

  if (quantity > 1000) {
    return {
      response: '❌ Quantity too large. Please contact our support team for bulk orders exceeding 1000 bottles.',
    };
  }

  sessionStore.setTempData(userId, 'quantity', quantity);
  sessionStore.updateState(userId, ORDER_STATES.AWAITING_ADDRESS);

  return {
    response: `✅ Quantity: ${quantity} bottles\n\nPlease enter the delivery address:\n\n💡 Type 'menu' to cancel and return to main menu`,
  };
}

function handleAddressInput(userId, message) {
  const address = message.trim();

  if (address.length < 10) {
    return {
      response: '❌ Address is too short. Please provide a complete delivery address:',
    };
  }

  sessionStore.setTempData(userId, 'deliveryAddress', address);
  sessionStore.updateState(userId, ORDER_STATES.AWAITING_DELIVERY_DATE);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return {
    response: `✅ Address saved\n\nPlease enter preferred delivery date (YYYY-MM-DD format):\n\nExample: ${minDate}\nNote: Minimum 1 day advance notice required.\n\n💡 Type 'menu' to cancel and return to main menu`,
  };
}

function handleDeliveryDateInput(userId, message) {
  const dateStr = message.trim();
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(dateStr)) {
    return {
      response: '❌ Invalid date format. Please use YYYY-MM-DD format (e.g., 2025-12-25):',
    };
  }

  const deliveryDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (deliveryDate < tomorrow) {
    return {
      response: '❌ Delivery date must be at least 1 day in advance. Please enter a valid future date:',
    };
  }

  sessionStore.setTempData(userId, 'deliveryDate', dateStr);
  sessionStore.updateState(userId, ORDER_STATES.AWAITING_CONFIRMATION);

  return {
    response: getOrderSummary(userId),
  };
}

function getOrderSummary(userId) {
  const bottleType = sessionStore.getTempData(userId, 'bottleType');
  const quantity = sessionStore.getTempData(userId, 'quantity');
  const address = sessionStore.getTempData(userId, 'deliveryAddress');
  const date = sessionStore.getTempData(userId, 'deliveryDate');

  return `
📋 *Order Summary*

🍾 Bottle Type: ${bottleType}
📦 Quantity: ${quantity} bottles
📍 Delivery Address: ${address}
📅 Delivery Date: ${date}

Do you want to confirm this order?

Reply 'YES' to confirm or 'NO' to cancel:`;
}

async function handleConfirmation(userId, message) {
  const response = message.trim().toLowerCase();

  if (response === 'no' || response === 'cancel') {
    sessionStore.clearTempData(userId);
    return {
      response: '❌ Order cancelled.\n\nType "menu" to return to the main menu.',
      showMenu: true,
    };
  }

  if (response !== 'yes' && response !== 'confirm') {
    return {
      response: 'Please reply with YES to confirm or NO to cancel:',
    };
  }

  // Create the order
  const supabaseUserId = getAuthenticatedUserId(userId);
  
  const orderData = {
    user_id: supabaseUserId,
    bottle_type: sessionStore.getTempData(userId, 'bottleType'),
    quantity: sessionStore.getTempData(userId, 'quantity'),
    delivery_address: sessionStore.getTempData(userId, 'deliveryAddress'),
    preferred_delivery_date: sessionStore.getTempData(userId, 'deliveryDate'),
    order_status: 'Pending',
  };

  const result = await createOrder(orderData);

  sessionStore.clearTempData(userId);

  if (!result.success) {
    return {
      response: `❌ Failed to create order: ${result.error}\n\nPlease try again or contact support.`,
      showMenu: true,
    };
  }

  // Send order notification
  const userEmail = sessionStore.getSession(userId)?.email;
  if (userEmail) {
    await sendOrderNotification(result.order, userEmail);
  }

  return {
    response: `✅ *Order Placed Successfully!*\n\n📋 Order ID: ${result.order.id.substring(0, 8)}...\n📧 Confirmation sent to: ${userEmail}\n\nYour order has been received and will be processed shortly. You will receive updates via email.\n\n💡 Type "menu" to return to the main menu.`,
    showMenu: true,
    notification: true,
  };
}
