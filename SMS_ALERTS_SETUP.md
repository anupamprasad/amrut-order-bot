# SMS Alerts for New Orders

Automatic SMS notifications are sent to admin when a new order is created in the database using Supabase triggers.

## How It Works

1. **Order Created** → `orders` table INSERT
2. **Database Trigger** → Fires `on_order_created_send_sms`
3. **Edge Function** → Calls Supabase Edge Function
4. **SMS Sent** → Via Twilio to admin phone

## Setup Instructions

### Step 1: Sign Up for Twilio

1. Go to [twilio.com](https://www.twilio.com)
2. Sign up for free account ($15 trial credit)
3. Get a phone number from Twilio dashboard
4. Copy your credentials:
   - Account SID
   - Auth Token
   - Phone Number

### Step 2: Deploy Supabase Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the edge function
supabase functions deploy send-order-sms

# Set environment secrets
supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
supabase secrets set ADMIN_PHONE_NUMBER=+919876543210
```

### Step 3: Enable pg_net Extension

In Supabase SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Step 4: Create Database Trigger

1. Open `database/create-order-sms-trigger.sql`
2. Replace `YOUR_PROJECT_REF` with your Supabase project reference
3. Replace `YOUR_ANON_KEY` with your Supabase anon key
4. Run the SQL in Supabase SQL Editor

### Step 5: Test It!

Place a test order through the bot and you should receive an SMS!

## Alternative: Direct SMS in Application Code

If you prefer to send SMS directly from your Node.js application instead of using database triggers:

### Install Twilio SDK

```bash
npm install twilio
```

### Update sendOrderNotification in supabase.js

```javascript
import twilio from 'twilio';

// Initialize Twilio client
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Add this to sendOrderNotification function after order is created
if (twilioClient && process.env.ADMIN_PHONE_NUMBER) {
  try {
    const smsMessage = `🔔 New Order!\n\nID: ${order.id.substring(0, 8)}\nBottle: ${order.bottle_type}\nQty: ${order.quantity}\nDate: ${order.preferred_delivery_date}`;
    
    await twilioClient.messages.create({
      body: smsMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.ADMIN_PHONE_NUMBER,
    });
    
    console.log('✅ Admin SMS alert sent');
  } catch (error) {
    console.error('❌ SMS alert failed:', error);
  }
}
```

### Add to .env

```env
# Twilio SMS Alerts
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
ADMIN_PHONE_NUMBER=+919876543210
```

## SMS Message Format

```
🔔 New Order Alert!

Order ID: 12ab34cd
Bottle: 500ml
Qty: 20
Date: 2025-12-25
Address: 123 Main Street, City...
```

## Cost Estimate

**Twilio Pricing:**
- Free trial: $15 credit (~500 SMS)
- After trial: $0.0079/SMS (US), varies by country
- India: ~$0.04/SMS

**For 100 orders/month:** ~$4/month

## Benefits of Database Trigger Approach

✅ **Reliable** - Works even if app crashes
✅ **Consistent** - Fires for every order, guaranteed
✅ **Independent** - Doesn't depend on application code
✅ **Scalable** - Runs on Supabase infrastructure
✅ **Audit trail** - Can log all notifications

## Benefits of Application Code Approach

✅ **Simpler setup** - No edge functions needed
✅ **Works on Vercel** - No Supabase hosting required
✅ **Easier debugging** - Logs in your application
✅ **More control** - Can customize logic easily

## Recommended Approach

**For Production:** Use **database trigger** (more reliable)

**For Quick Setup:** Use **application code** (easier to implement)

## Troubleshooting

### SMS Not Sending

1. Check Twilio credentials in Supabase secrets
2. Verify phone numbers are in correct format (+1234567890)
3. Check Twilio account has credits
4. Check edge function logs: `supabase functions logs send-order-sms`

### Trigger Not Firing

1. Verify pg_net extension is enabled
2. Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_order_created_send_sms';`
3. Check function exists: `\df notify_new_order_sms` in psql

### Phone Number Format Issues

Twilio requires E.164 format:
- ✅ `+919876543210` (India)
- ✅ `+12125551234` (US)
- ❌ `9876543210` (missing country code)
- ❌ `+91-98765-43210` (has dashes)

## Next Steps

1. Choose your approach (trigger vs application code)
2. Set up Twilio account
3. Configure credentials
4. Test with a real order
5. Monitor SMS delivery

For support, check Twilio logs at [console.twilio.com](https://console.twilio.com)
