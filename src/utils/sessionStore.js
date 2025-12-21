// Session store for managing conversation state
class SessionStore {
  constructor(timeoutMinutes = 30) {
    this.sessions = new Map();
    this.timeoutMs = timeoutMinutes * 60 * 1000;
  }

  // Create or update session
  setSession(userId, data) {
    const existingSession = this.sessions.get(userId) || {};
    this.sessions.set(userId, {
      ...existingSession,
      ...data,
      lastActivity: Date.now(),
    });
  }

  // Get session
  getSession(userId) {
    const session = this.sessions.get(userId);
    
    if (!session) {
      return null;
    }

    // Check if session has expired
    if (Date.now() - session.lastActivity > this.timeoutMs) {
      this.clearSession(userId);
      return null;
    }

    // Update last activity
    session.lastActivity = Date.now();
    return session;
  }

  // Clear session
  clearSession(userId) {
    this.sessions.delete(userId);
  }

  // Update session state
  updateState(userId, state, data = {}) {
    const session = this.getSession(userId) || {};
    this.setSession(userId, {
      ...session,
      state,
      ...data,
    });
  }

  // Get current state
  getState(userId) {
    const session = this.getSession(userId);
    return session ? session.state : null;
  }

  // Store temporary data in session
  setTempData(userId, key, value) {
    const session = this.getSession(userId) || {};
    const tempData = session.tempData || {};
    tempData[key] = value;
    this.setSession(userId, { ...session, tempData });
  }

  // Get temporary data from session
  getTempData(userId, key) {
    const session = this.getSession(userId);
    return session?.tempData?.[key];
  }

  // Clear temporary data
  clearTempData(userId) {
    const session = this.getSession(userId);
    if (session) {
      delete session.tempData;
      this.setSession(userId, session);
    }
  }

  // Cleanup expired sessions (call periodically)
  cleanupExpiredSessions() {
    const now = Date.now();
    for (const [userId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.timeoutMs) {
        this.sessions.delete(userId);
      }
    }
  }
}

export const sessionStore = new SessionStore(
  parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30')
);

// Run cleanup every 5 minutes
setInterval(() => {
  sessionStore.cleanupExpiredSessions();
}, 5 * 60 * 1000);
