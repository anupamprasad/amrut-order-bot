import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';

let sock = null;
let isConnected = false;
let connectionPromise = null;

// Initialize WhatsApp connection
export async function initWhatsApp() {
  // Prevent multiple simultaneous connections
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      const { state, saveCreds } = await useMultiFileAuthState('auth_info');
      const { version } = await fetchLatestBaileysVersion();

      sock = makeWASocket({
        version,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        printQRInTerminal: false, // We'll handle QR display ourselves
        logger: pino({ level: process.env.NODE_ENV === 'development' ? 'info' : 'silent' }),
        browser: ['Amrut-Dhara Bot', 'Chrome', '10.0'],
        getMessage: async () => undefined,
      });

      // Handle connection updates
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Display QR code for scanning
        if (qr) {
          console.log('\n📱 WhatsApp QR Code - Scan with your phone:\n');
          qrcode.generate(qr, { small: true });
          console.log('\n👆 Scan the QR code above with WhatsApp on your phone');
          console.log('   (WhatsApp → Settings → Linked Devices → Link a Device)\n');
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error instanceof Boom)
            ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
            : true;

          console.log('🔴 WhatsApp disconnected. Reconnecting:', shouldReconnect);
          isConnected = false;

          if (shouldReconnect) {
            connectionPromise = null;
            setTimeout(() => initWhatsApp(), 5000); // Reconnect after 5 seconds
          }
        } else if (connection === 'open') {
          console.log('✅ WhatsApp connected successfully!');
          isConnected = true;
        }
      });

      // Save credentials when updated
      sock.ev.on('creds.update', saveCreds);

      // Handle messages (optional - for two-way communication)
      sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.key.fromMe && msg.message) {
          console.log('📨 Received message:', msg.message.conversation || 'Media message');
          // You can add auto-reply logic here if needed
        }
      });

      return sock;
    } catch (error) {
      console.error('❌ WhatsApp initialization error:', error);
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
}

// Send WhatsApp message
export async function sendWhatsAppMessage(phoneNumber, message) {
  try {
    // Ensure WhatsApp is connected
    if (!isConnected || !sock) {
      console.log('⚠️  WhatsApp not connected. Skipping WhatsApp notification.');
      return { success: false, reason: 'Not connected' };
    }

    // Format phone number for WhatsApp
    // Remove any non-digit characters except +
    let formattedNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Remove + if present and ensure it starts with country code
    if (formattedNumber.startsWith('+')) {
      formattedNumber = formattedNumber.substring(1);
    }
    
    // Add @s.whatsapp.net suffix for individual chats
    const jid = `${formattedNumber}@s.whatsapp.net`;

    // Send the message
    await sock.sendMessage(jid, { text: message });
    
    console.log(`✅ WhatsApp message sent to ${phoneNumber}`);
    return { success: true };
  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    return { success: false, error: error.message };
  }
}

// Send WhatsApp message with image
export async function sendWhatsAppImage(phoneNumber, imageUrl, caption) {
  try {
    if (!isConnected || !sock) {
      console.log('⚠️  WhatsApp not connected. Skipping WhatsApp notification.');
      return { success: false, reason: 'Not connected' };
    }

    let formattedNumber = phoneNumber.replace(/[^\d+]/g, '');
    if (formattedNumber.startsWith('+')) {
      formattedNumber = formattedNumber.substring(1);
    }
    const jid = `${formattedNumber}@s.whatsapp.net`;

    await sock.sendMessage(jid, {
      image: { url: imageUrl },
      caption: caption,
    });
    
    console.log(`✅ WhatsApp image sent to ${phoneNumber}`);
    return { success: true };
  } catch (error) {
    console.error('❌ WhatsApp image send error:', error);
    return { success: false, error: error.message };
  }
}

// Check if WhatsApp is connected
export function isWhatsAppConnected() {
  return isConnected;
}

// Get WhatsApp socket (for advanced usage)
export function getWhatsAppSocket() {
  return sock;
}

// Graceful shutdown
export async function closeWhatsApp() {
  if (sock) {
    console.log('👋 Closing WhatsApp connection...');
    await sock.logout();
    sock = null;
    isConnected = false;
  }
}
