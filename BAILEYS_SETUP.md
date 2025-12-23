# Baileys WhatsApp Integration

Your bot now sends **WhatsApp notifications** using Baileys (free & open-source)!

## 🎉 What's Implemented

✅ WhatsApp message sending via Baileys
✅ Rich formatted messages with emojis
✅ Auto-reconnection on disconnect
✅ QR code scanning for authentication
✅ Session persistence (stays logged in)
✅ Graceful error handling

## 📱 How It Works

When an order is placed:
1. Email sent via Resend ✉️
2. SMS sent via Textbelt 📱
3. **WhatsApp message sent via Baileys** 💬

## WhatsApp Message Format

```
🎉 *Order Confirmed!*

Order ID: #12ab34cd
📦 10x 500ml
📅 Delivery: 25-Dec-2025
📍 Address: [Full Address]

Thank you for your order!
- Amrut-Dhara Water Solutions
```

## 🚀 Setup Instructions

### Step 1: Start the Server

```bash
npm start
```

### Step 2: Scan QR Code

When you start the server, you'll see:

```
📱 WhatsApp QR Code - Scan with your phone:

█████████████████████████████████
█████████████████████████████████
███   ▄▄▄   ████   ▄▄▄   ███   ██
███ █████ ██████ █████ █████ ████
...

👆 Scan the QR code above with WhatsApp on your phone
   (WhatsApp → Settings → Linked Devices → Link a Device)
```

### Step 3: Link Your Phone

1. Open **WhatsApp** on your phone
2. Go to **Settings** → **Linked Devices**
3. Tap **Link a Device**
4. Scan the QR code from your terminal

### Step 4: Success!

```
✅ WhatsApp connected successfully!
```

Your bot is now ready to send WhatsApp messages!

## 📂 Session Management

**Session files are stored in:** `auth_info/`

- Credentials are saved automatically
- No need to scan QR again on restart
- Session persists across server restarts

**Important:** `auth_info/` is in `.gitignore` (don't commit it!)

## ⚙️ Configuration

### Enable/Disable WhatsApp

In `.env`:
```env
ENABLE_WHATSAPP_NOTIFICATIONS=true  # Enable
ENABLE_WHATSAPP_NOTIFICATIONS=false # Disable
```

### Phone Number Format

WhatsApp uses international format:
- ✅ `+919876543210`
- ✅ `919876543210`
- ❌ `9876543210` (missing country code)

The code automatically formats numbers correctly.

## 🔄 Reconnection

If WhatsApp disconnects:
- ✅ Auto-reconnects in 5 seconds
- ✅ Preserves session (no QR scan needed)
- ✅ Continues working after reconnection

## ⚠️ Important Notes

### WhatsApp Terms of Service

**Baileys is NOT officially supported by WhatsApp.**

**Risks:**
- ⚠️ Your WhatsApp number could get banned
- ⚠️ Against WhatsApp Business Terms of Service
- ⚠️ Best for personal use or testing

**Recommendations:**
- ✅ Use a **separate WhatsApp number** (not your personal)
- ✅ Don't spam or send to unknown numbers
- ✅ Keep message volume low (< 100/day)
- ✅ For production, switch to **Meta Cloud API** (official)

### Best Practices

1. **Use for testing/MVP only**
2. **Don't send bulk messages** (risk of ban)
3. **Get user consent** before messaging
4. **Monitor for disconnections**
5. **Have fallback** (SMS/Email still work)

## 🚨 Troubleshooting

### QR Code Not Appearing

```bash
# Check if WhatsApp is enabled
echo $ENABLE_WHATSAPP_NOTIFICATIONS

# Should be: true
```

### "WhatsApp not connected"

Server logs will show:
```
⚠️  WhatsApp not connected. Skipping WhatsApp notification.
```

**Solution:** Scan QR code again or restart server

### Session Expired

Delete session and scan again:
```bash
rm -rf auth_info/
npm start
# Scan new QR code
```

### Phone Gets Banned

**If your number gets banned:**
1. Stop using Baileys immediately
2. Wait 24-48 hours
3. Contact WhatsApp support
4. Switch to official Meta Cloud API for production

## 📊 Monitoring

Check console logs for WhatsApp activity:

```bash
✅ WhatsApp connected successfully!
✅ WhatsApp message sent to +919876543210
🔴 WhatsApp disconnected. Reconnecting: true
```

## 🔐 Security

**Session Security:**
- Session files contain authentication tokens
- Keep `auth_info/` secure
- Never commit to Git (already in `.gitignore`)
- Use environment variables for sensitive data

## 🎯 Production Migration

### When to Switch to Official API

**Switch to Meta Cloud API when:**
- 📈 Sending > 100 messages/day
- 💼 Running production business
- 🛡️ Need reliability guarantees
- 📜 Want legal compliance

### Migration Steps

1. Sign up at [developers.facebook.com](https://developers.facebook.com)
2. Create WhatsApp Business API app
3. Verify your business
4. Replace Baileys with Meta Cloud API
5. Update code to use official endpoints

**Cost:** 1,000 free conversations/month with Meta Cloud API

## 🎨 Advanced Features

### Send Images

```javascript
import { sendWhatsAppImage } from './utils/whatsapp.js';

await sendWhatsAppImage(
  '+919876543210',
  'https://yoursite.com/bottle.jpg',
  'Your order is ready!'
);
```

### Two-Way Communication

Baileys supports receiving messages too! Check `whatsapp.js` for the message event handler.

## 💡 Tips

1. **Test with your own number first**
2. **Start small** (few messages/day)
3. **Monitor for bans** (disconnections)
4. **Use dedicated number** (not personal)
5. **Plan migration** to official API

## 📱 Vercel Deployment

**Note:** Baileys won't work on Vercel serverless functions (needs persistent connection)

**Options:**
1. **Deploy on VPS** (DigitalOcean, AWS EC2, etc.)
2. **Use Railway** / **Render** (supports long-running processes)
3. **Switch to Meta Cloud API** (serverless-compatible)

**For Vercel:** Disable WhatsApp in `.env`:
```env
ENABLE_WHATSAPP_NOTIFICATIONS=false
```

Keep email and SMS working on Vercel.

## 📚 Resources

- **Baileys GitHub:** [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys)
- **Documentation:** [Baileys Docs](https://whiskeysockets.github.io/)
- **Meta Cloud API:** [developers.facebook.com](https://developers.facebook.com/docs/whatsapp/cloud-api)

## ✅ Current Status

- ✅ Baileys installed and configured
- ✅ WhatsApp service created
- ✅ Order notifications integrated
- ✅ Auto-reconnection implemented
- ✅ Session persistence enabled
- ✅ Graceful shutdown handling

**Next:** Start server and scan QR code! 📱
