import { sessionStore } from '../utils/sessionStore.js';
import { authenticateUser } from '../utils/supabase.js';

// Conversation states
const STATES = {
  INIT: 'INIT',
  AWAITING_EMAIL: 'AWAITING_EMAIL',
  AWAITING_PASSWORD: 'AWAITING_PASSWORD',
  AUTHENTICATED: 'AUTHENTICATED',
};

export async function handleAuthFlow(userId, message) {
  const state = sessionStore.getState(userId) || STATES.INIT;

  switch (state) {
    case STATES.INIT:
      return startAuthFlow(userId);

    case STATES.AWAITING_EMAIL:
      return handleEmailInput(userId, message);

    case STATES.AWAITING_PASSWORD:
      return handlePasswordInput(userId, message);

    default:
      return startAuthFlow(userId);
  }
}

function startAuthFlow(userId) {
  sessionStore.updateState(userId, STATES.AWAITING_EMAIL);
  return {
    response: `Welcome to ${process.env.BOT_NAME || 'Amrut-Dhara Water Solutions'}! 🌊\n\nPlease enter your registered email address:`,
    authenticated: false,
  };
}

function handleEmailInput(userId, email) {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      response: '❌ Invalid email format. Please enter a valid email address:',
      authenticated: false,
    };
  }

  // Store email temporarily
  sessionStore.setTempData(userId, 'email', email);
  sessionStore.updateState(userId, STATES.AWAITING_PASSWORD);

  return {
    response: 'Please enter your password:',
    authenticated: false,
  };
}

async function handlePasswordInput(userId, password) {
  const email = sessionStore.getTempData(userId, 'email');

  if (!email) {
    return {
      response: '❌ Session expired. Please start again.',
      authenticated: false,
      restart: true,
    };
  }

  // Authenticate with Supabase
  const result = await authenticateUser(email, password);

  if (!result.success) {
    // Clear stored email on failed attempt
    sessionStore.clearTempData(userId);
    sessionStore.updateState(userId, STATES.INIT);

    return {
      response: `❌ Authentication failed: ${result.error}\n\nPlease try again.`,
      authenticated: false,
      restart: true,
    };
  }

  // Store user info in session
  sessionStore.setSession(userId, {
    userId: result.user.id,
    email: result.user.email,
    authenticated: true,
    state: STATES.AUTHENTICATED,
  });

  // Clear temporary data
  sessionStore.clearTempData(userId);

  return {
    response: `✅ Authentication successful!\n\nWelcome back, ${email}!\n\n📋 Type 'menu' anytime to see available options.`,
    authenticated: true,
    supabaseUserId: result.user.id,
  };
}

export function isAuthenticated(userId) {
  const session = sessionStore.getSession(userId);
  return session?.authenticated === true;
}

export function getAuthenticatedUserId(userId) {
  const session = sessionStore.getSession(userId);
  return session?.userId;
}
