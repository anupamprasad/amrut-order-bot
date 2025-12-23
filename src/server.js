import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { processMessage } from './messageHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (images) - compatible with Vercel
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use(express.static('public'));

// Serve bottle.svg directly
app.get('/images/bottle.svg', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/images/bottle.svg'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Amrut-Dhara Bot is running' });
});

// Webhook endpoint for receiving messages
app.post('/webhook', async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId and message' 
      });
    }

    // Process the message
    const result = await processMessage(userId, message);

    res.json({
      success: true,
      response: result.response,
      images: result.images || [],
      menuButtons: result.menuButtons || [],
      notification: result.notification || false,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// WhatsApp-specific webhook (optional - for WhatsApp Business API)
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    // Parse WhatsApp message format
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages?.[0];

    if (!messages) {
      return res.sendStatus(200); // Acknowledge but do nothing
    }

    const userId = messages.from; // WhatsApp phone number
    const message = messages.text?.body || '';

    // Process the message
    const result = await processMessage(userId, message);

    // Here you would send the response back to WhatsApp
    // This requires WhatsApp Business API setup
    console.log('Response to send:', result.response);

    res.sendStatus(200);

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.sendStatus(500);
  }
});

// WhatsApp webhook verification (required by WhatsApp)
app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'amrut_dhara_verify_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Simple web interface for testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Amrut-Dhara Bot</title>
      <style>
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .chat-container {
          background: white;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          height: calc(100vh - 40px);
          display: flex;
          flex-direction: column;
        }
        h1 {
          color: #0066cc;
          text-align: center;
          margin: 0 0 20px 0;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .messages {
          flex: 1;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          padding: 15px;
          margin-bottom: 20px;
          background: #f8f9fa;
          border-radius: 10px;
        }
        .message {
          margin-bottom: 15px;
          padding: 12px 16px;
          border-radius: 18px;
          max-width: 80%;
          word-wrap: break-word;
          white-space: pre-wrap;
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .user-message {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          margin-left: auto;
          text-align: right;
          border-bottom-right-radius: 5px;
        }
        .bot-message {
          background: white;
          color: #333;
          border: 1px solid #e0e0e0;
          margin-right: auto;
          border-bottom-left-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .bottle-images {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 15px 0;
        }
        .bottle-option {
          display: flex;
          align-items: center;
          gap: 15px;
          cursor: pointer;
          padding: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          transition: all 0.3s;
          background: white;
        }
        .bottle-option:hover {
          border-color: #667eea;
          background: #f8f9ff;
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }
        .bottle-option img {
          width: 60px;
          height: 80px;
          object-fit: contain;
          border-radius: 5px;
        }
        .bottle-option .caption {
          flex: 1;
          font-weight: 600;
          color: #333;
          font-size: 16px;
        }
        .menu-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 15px 0;
        }
        .menu-button {
          padding: 15px 20px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: left;
          font-size: 15px;
          font-weight: 500;
          color: #333;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .menu-button:hover {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        .menu-button .icon {
          font-size: 20px;
        }
        .input-container {
          display: flex;
          gap: 10px;
        }
        input {
          flex: 1;
          padding: 14px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 25px;
          font-size: 15px;
          outline: none;
          transition: all 0.3s;
        }
        input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        button {
          padding: 14px 28px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        button:active {
          transform: translateY(0);
        }
        .notification-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          animation: slideIn 0.3s ease-out, slideOut 0.3s ease-in 2.7s;
          z-index: 1000;
        }
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
        .notification-icon {
          font-size: 24px;
          animation: bounce 0.6s ease-in-out;
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      </style>
    </head>
    <body>
      <div class="chat-container">
        <h1>🌊 Amrut-Dhara Bot</h1>
        <div class="messages" id="messages"></div>
        <div class="input-container">
          <input type="text" id="messageInput" placeholder="Type your message..." onkeypress="handleKeyPress(event)">
          <button onclick="sendMessage()">Send</button>
        </div>
      </div>

      <script>
        const userId = 'web_user_' + Math.random().toString(36).substring(7);
        
        async function sendMessage() {
          const input = document.getElementById('messageInput');
          const message = input.value.trim();
          
          if (!message) return;
          
          addMessage(message, 'user');
          input.value = '';
          
          try {
            const response = await fetch('/webhook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, message })
            });
            
            const data = await response.json();
            addMessage(data.response, 'bot');
            
            // Display images if present
            if (data.images && data.images.length > 0) {
              addImages(data.images);
            }
            
            // Display menu buttons if present
            if (data.menuButtons && data.menuButtons.length > 0) {
              addMenuButtons(data.menuButtons);
            }
            
            // Show notification if present
            if (data.notification) {
              showNotification('Order placed successfully! Check your email for confirmation.');
            }
          } catch (error) {
            addMessage('Error: Could not connect to server', 'bot');
          }
        }
        
        function showNotification(message) {
          const notification = document.createElement('div');
          notification.className = 'notification-toast';
          notification.innerHTML = \`
            <span class="notification-icon">✅</span>
            <span>\${message}</span>
          \`;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.remove();
          }, 3000);
        }
        
        function addMessage(text, type) {
          const messages = document.getElementById('messages');
          const messageDiv = document.createElement('div');
          messageDiv.className = 'message ' + type + '-message';
          messageDiv.textContent = text;
          messages.appendChild(messageDiv);
          messages.scrollTop = messages.scrollHeight;
        }
        
        function addImages(images) {
          const messages = document.getElementById('messages');
          const imagesContainer = document.createElement('div');
          imagesContainer.className = 'bottle-images';
          
          images.forEach((img, index) => {
            const bottleDiv = document.createElement('div');
            bottleDiv.className = 'bottle-option';
            bottleDiv.onclick = () => {
              document.getElementById('messageInput').value = (index + 1).toString();
              sendMessage();
            };
            
            const imgElement = document.createElement('img');
            imgElement.src = img.url;
            imgElement.alt = img.caption;
            imgElement.onerror = () => {
              imgElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="80"%3E%3Crect fill="%23e0e0e0" width="60" height="80" rx="5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="10"%3E🍾%3C/text%3E%3C/svg%3E';
            };
            
            const caption = document.createElement('div');
            caption.className = 'caption';
            caption.textContent = img.caption;
            
            bottleDiv.appendChild(imgElement);
            bottleDiv.appendChild(caption);
            imagesContainer.appendChild(bottleDiv);
          });
          
          messages.appendChild(imagesContainer);
          messages.scrollTop = messages.scrollHeight;
        }
        
        function addMenuButtons(options) {
          const messages = document.getElementById('messages');
          const menuContainer = document.createElement('div');
          menuContainer.className = 'menu-buttons';
          
          options.forEach((option, index) => {
            const button = document.createElement('div');
            button.className = 'menu-button';
            button.onclick = () => {
              document.getElementById('messageInput').value = option.value;
              sendMessage();
            };
            
            const icon = document.createElement('span');
            icon.className = 'icon';
            icon.textContent = option.icon;
            
            const text = document.createElement('span');
            text.textContent = option.text;
            
            button.appendChild(icon);
            button.appendChild(text);
            menuContainer.appendChild(button);
          });
          
          messages.appendChild(menuContainer);
          messages.scrollTop = messages.scrollHeight;
        }
        
        function handleKeyPress(event) {
          if (event.key === 'Enter') {
            sendMessage();
          }
        }
        
        // Send initial message to start conversation
        window.onload = async () => {
          const response = await fetch('/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, message: 'start' })
          });
          
          const data = await response.json();
          addMessage(data.response, 'bot');
          
          // Display images if present
          if (data.images && data.images.length > 0) {
            addImages(data.images);
          }
        };
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Amrut-Dhara Bot server running on port ${PORT}`);
  console.log(`📱 Web interface: http://localhost:${PORT}`);
  console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`📞 WhatsApp webhook: http://localhost:${PORT}/webhook/whatsapp`);
});
