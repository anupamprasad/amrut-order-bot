# SMS Alerts for New Orders

Automatic SMS notifications are sent to admin when a new order is created.

## ✅ Current Implementation (Ready to Use!)

**Status:** SMS alerts are already implemented in your application code!

When a new order is placed:
1. Order is saved to database
2. `sendOrderNotification()` is called
3. SMS is sent via Twilio to admin phone
4. No additional setup needed!

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Twilio Credentials

1. Sign up at [twilio.com](https://www.twilio.com) - $15 free credit
2. Go to Console Dashboard
3. Copy these values:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click to reveal)
4. Get a phone number:
   - Click "Get a Trial Number" or buy a number
   - Copy your **Twilio Phone Number** (e.g., +1234567890)

### Step 2: Update .env File

Add these lines to your `.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
ADMIN_PHONE_NUMBER=+919876543210
```

**Important:** 
- Use your actual Indian number for `ADMIN_PHONE_NUMBER` (format: +91XXXXXXXXXX)
- Keep Twilio credentials secret - never commit to Git

### Step 3: Restart Server

```bash
npm start
```

You'll see:
```
✅ Twilio SMS client initialized
```

### Step 4: Test It!

1. Place a test order through the bot
2. Check your phone for SMS! 📱

## 📱 SMS Message Format

```
🔔 New Order Alert!

Order ID: 12ab34cd
Bottle: 500ml
Qty: 20
Date: 2025-12-25
Customer: user@example.com
Address: 123 Main Street...
```

## 💰 Cost

**Twilio Pricing:**
- Free trial: $15 credit (~500-1900 SMS)
- India SMS: $0.04/message
- US SMS: $0.0079/message

**For 100 orders/month:** ~$4 (India)

## ⚠️ Troubleshooting

### "SMS not configured" in logs

**Solution:** Add Twilio credentials to `.env` file

### "SMS failed: Unable to create record"

**Possible causes:**
1. **Invalid phone number format**
   - ✅ Correct: `+919876543210`
   - ❌ Wrong: `9876543210` (missing +91)
   
2. **Trial account restrictions**
   - Twilio trial can only send to verified numbers
   - Solution: Verify your admin phone in Twilio console

3. **Invalid credentials**
   - Double-check Account SID and Auth Token
   - Make sure no extra spaces in `.env`

### Phone not receiving SMS

1. **Check Twilio logs:**
   - Go to [console.twilio.com/monitor/logs/messages](https://console.twilio.com/monitor/logs/messages)
   - See delivery status

2. **Verify phone number:**
   - For trial accounts, verify recipient number in Twilio console
   - Go to Phone Numbers → Verified Caller IDs

3. **Check credits:**
   - Ensure you have Twilio credits remaining

## 🔄 Alternative: Database Trigger Approach

If you want SMS to be sent even if your app crashes:

### Option A: Simple Notification Queue (Recommended)

This approach creates a notification queue in the database:

1. **Run in Supabase SQL Editor:**
   ```sql
   -- Copy contents from database/simple-notification-queue.sql
   ```

2. **Benefits:**
   - ✅ No pg_net extension needed
   - ✅ Creates notification queue table
   - ✅ Your app processes the queue
   - ✅ Retry failed notifications

### Option B: Edge Function with pg_net

For real-time database triggers (advanced):

1. **Enable pg_net extension:**

### Option B: Edge Function with pg_net

For real-time database triggers (advanced):

1. **Enable pg_net extension in Supabase SQL Editor:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
   ```

2. **Deploy edge function:**
   ```bash
   supabase functions deploy send-order-sms
   supabase secrets set TWILIO_ACCOUNT_SID=your_sid
   supabase secrets set TWILIO_AUTH_TOKEN=your_token
   supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
   supabase secrets set ADMIN_PHONE_NUMBER=+919876543210
   ```

3. **Create database trigger:**
   - Run `database/create-order-sms-trigger.sql` in Supabase SQL Editor

**Note:** Most users don't need this - the application code approach is simpler and works great!

## 📊 Current Status

✅ **Application Code Approach** (Active)
- SMS sent when order is created
- Works immediately after adding Twilio credentials
- Easy to debug with console logs
- **Recommended for most users**

⏳ **Database Trigger Approach** (Optional)
- Requires pg_net extension
- More complex setup
- Better for high-reliability needs
- Good for microservices architecture

## 🎯 Recommendation

**For your bot:** Use the **application code approach** (already implemented!)

Just add Twilio credentials to `.env` and you're done! 🚀

## 📝 Logs to Watch

When order is created, you'll see:

```bash
✅ Twilio SMS client initialized
📧 Order Notification: { orderId: '...', ... }
✅ Admin SMS alert sent: SMxxxxxxxxxxxxxxxx
```

If SMS is not configured:
```bash
⚠️  SMS alerts not configured. Set TWILIO credentials in .env
```

## 🔐 Security Notes

- ✅ Twilio credentials in `.env` (not committed to Git)
- ✅ `.env` is in `.gitignore`
- ✅ Use environment variables in production (Vercel)
- ✅ Never share Auth Token publicly

## 🚀 Vercel Deployment

To enable SMS on Vercel:

1. Choose your approach (trigger vs application code)
2. Set up Twilio account
3. Configure credentials
4. Test with a real order
5. Monitor SMS delivery

For support, check Twilio logs at [console.twilio.com](https://console.twilio.com)
