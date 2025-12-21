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
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .chat-container {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #0066cc;
          text-align: center;
        }
        .messages {
          height: 400px;
          overflow-y: auto;
          border: 1px solid #ddd;
          padding: 15px;
          margin-bottom: 20px;
          background: #fafafa;
          border-radius: 5px;
        }
        .message {
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 5px;
        }
        .user-message {
          background: #0066cc;
          color: white;
          text-align: right;
        }
        .bot-message {
          background: #e9e9e9;
          color: #333;
        }
        .bottle-images {
          display: flex;
          gap: 15px;
          margin: 15px 0;
          justify-content: center;
        }
        .bottle-option {
          text-align: center;
          cursor: pointer;
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 10px;
          transition: all 0.3s;
        }
        .bottle-option:hover {
          border-color: #0066cc;
          transform: scale(1.05);
        }
        .bottle-option img {
          width: 150px;
          height: 200px;
          object-fit: contain;
          border-radius: 5px;
        }
        .bottle-option .caption {
          margin-top: 10px;
          font-weight: bold;
          color: #0066cc;
        }
        .input-container {
          display: flex;
          gap: 10px;
        }
        input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }
        button {
          padding: 10px 20px;
          background: #0066cc;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }
        button:hover {
          background: #0052a3;
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
          } catch (error) {
            addMessage('Error: Could not connect to server', 'bot');
          }
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
              imgElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="200"%3E%3Crect fill="%23ddd" width="150" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3E' + img.caption + '%3C/text%3E%3C/svg%3E';
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
