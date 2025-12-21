import { handleAuthFlow, isAuthenticated } from './flows/authFlow.js';
import { showMainMenu, handleMenuSelection, isMenuCommand } from './flows/menuFlow.js';
import { handleNewOrderFlow } from './flows/newOrderFlow.js';
import { handleOrderHistory } from './flows/orderHistoryFlow.js';
import { handleOrderDetails } from './flows/orderDetailsFlow.js';
import { sessionStore } from './utils/sessionStore.js';

export async function processMessage(userId, message) {
  try {
    // Check if user wants to return to menu
    if (isMenuCommand(message)) {
      return showMainMenu(userId);
    }

    // Check if user is authenticated
    if (!isAuthenticated(userId)) {
      return await handleAuthFlow(userId, message);
    }

    // Get current conversation state
    const state = sessionStore.getState(userId);

    // Handle different flows based on state
    if (state === 'MAIN_MENU') {
      const menuResult = handleMenuSelection(userId, message);
      
      // Route to appropriate flow based on menu selection
      if (menuResult.action === 'NEW_ORDER') {
        return await handleNewOrderFlow(userId, message);
      } else if (menuResult.action === 'ORDER_HISTORY') {
        return await handleOrderHistory(userId);
      } else if (menuResult.action === 'HELP' || menuResult.action === 'INVALID') {
        return menuResult;
      }
      
      return menuResult;
    }

    // Handle new order flow
    if (state && state.startsWith('NEW_ORDER') || state === 'AWAITING_BOTTLE_TYPE' || 
        state === 'AWAITING_QUANTITY' || state === 'AWAITING_ADDRESS' || 
        state === 'AWAITING_DELIVERY_DATE' || state === 'AWAITING_CONFIRMATION') {
      const result = await handleNewOrderFlow(userId, message);
      
      // Show menu after order completion if indicated
      if (result.showMenu) {
        const menuResponse = showMainMenu(userId);
        return {
          response: result.response + '\n\n' + menuResponse.response,
        };
      }
      
      return result;
    }

    // Handle order details flow
    if (state === 'AWAITING_ORDER_ID') {
      return await handleOrderDetails(userId, message);
    }

    // Default: show main menu
    return showMainMenu(userId);

  } catch (error) {
    console.error('Error processing message:', error);
    return {
      response: '❌ An error occurred while processing your request. Please try again or contact support.',
    };
  }
}
