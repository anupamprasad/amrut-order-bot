import { sessionStore } from '../utils/sessionStore.js';

const MENU_OPTIONS = {
  NEW_ORDER: '1',
  ORDER_HISTORY: '2',
  ORDER_DETAILS: '3',
  HELP: '4',
};

export function showMainMenu(userId) {
  const menuText = `
📋 *Main Menu*

Please select an option:

1️⃣ Place New Order
2️⃣ View Order History
3️⃣ View Order Details
4️⃣ Help / Support

Reply with the number of your choice (1-4)

💡 You can type 'menu' anytime during your order to return here.`;

  sessionStore.updateState(userId, 'MAIN_MENU');
  return { 
    response: menuText,
    menuButtons: [
      { icon: '📦', text: '1. Place New Order', value: '1' },
      { icon: '📋', text: '2. View Order History', value: '2' },
      { icon: '🔍', text: '3. View Order Details', value: '3' },
      { icon: '🆘', text: '4. Help / Support', value: '4' }
    ]
  };
}

export function handleMenuSelection(userId, message) {
  const choice = message.trim();

  switch (choice) {
    case MENU_OPTIONS.NEW_ORDER:
      sessionStore.updateState(userId, 'NEW_ORDER_START');
      return { 
        response: 'Starting new order process...',
        action: 'NEW_ORDER',
      };

    case MENU_OPTIONS.ORDER_HISTORY:
      return { 
        response: 'Fetching your order history...',
        action: 'ORDER_HISTORY',
      };

    case MENU_OPTIONS.ORDER_DETAILS:
      sessionStore.updateState(userId, 'AWAITING_ORDER_ID');
      return { 
        response: 'Please enter the Order ID you want to view:\n\n💡 Type "menu" to return to main menu',
        action: 'ORDER_DETAILS',
      };

    case MENU_OPTIONS.HELP:
      return { 
        response: getHelpMessage(),
        action: 'HELP',
      };

    default:
      return { 
        response: '❌ Invalid option. Please reply with a number between 1-4.',
        action: 'INVALID',
      };
  }
}

function getHelpMessage() {
  return `
🆘 *Help & Support*

For assistance with:
• Order placement
• Delivery queries
• Account issues
• Billing questions

📞 Contact Amrut-Dhara Support Team:
${process.env.SUPPORT_CONTACT || '+91-XXXXXXXXXX'}

📧 Email: support@amrutdhara.com

Business Hours: Mon-Sat, 9 AM - 6 PM

💡 Type 'menu' to return to the main menu.`;
}

export function isMenuCommand(message) {
  const msg = message.toLowerCase().trim();
  return msg === 'menu' || msg === 'main menu' || msg === 'home';
}
