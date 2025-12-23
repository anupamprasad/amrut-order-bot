# Textbelt SMS Integration Setup

Your bot now sends SMS notifications via Textbelt when orders are placed!

## How It Works

When a customer places an order:
1. ✅ Order saved to database
2. 📧 Email sent (via Resend)
3. 📱 **SMS sent to customer's mobile number** (via Textbelt)

## SMS Message Format

```
Amrut-Dhara: Order 12ab34cd confirmed! 10x 500ml to be delivered on 2025-12-25. Thank you!
```

## Free Tier Usage

**Textbelt Free Tier:**
- 75 SMS per day
- No signup required
- Use `TEXTBELT_API_KEY=textbelt`

**Current Configuration:**
```env
TEXTBELT_API_KEY=textbelt
ENABLE_SMS_NOTIFICATIONS=true
```

## Phone Number Requirements

### For Testing:
Use **US phone numbers** in the database (Textbelt free tier is US-only):
- Format: `+1234567890` or `1234567890`
- Example: `+15551234567`

### For Production (India):
**Upgrade to paid Textbelt account** or use **India-specific providers**:

#### Option 1: Textbelt Paid (Works globally)
1. Buy credits at [textbelt.com](https://textbelt.com)
2. Get your API key
3. Update `.env`: `TEXTBELT_API_KEY=your_paid_api_key`
4. Cost: ~$0.035/SMS

#### Option 2: India SMS Providers (Recommended)
For Indian phone numbers, switch to:
- **MSG91** (₹0.15-0.25/SMS)
- **Fast2SMS** (₹0.10-0.20/SMS)
- **Twilio** ($0.0079/SMS globally)

## Setup Instructions

### Current Setup (Already Done):
✅ Textbelt integration added to code
✅ Environment variables configured
✅ SMS enabled by default

### To Use Right Now:
1. **Update user phone numbers in database** to US format:
   ```sql
   UPDATE users 
   SET mobile_number = '+15551234567' 
   WHERE email = 'test@example.com';
   ```

2. **Place a test order** through the bot

3. **Check console logs** for SMS status:
   ```
   ✅ SMS sent to +15551234567
   📊 Textbelt quota remaining: 74
   ```

### For Indian Phone Numbers:

Since Textbelt free tier only supports US numbers, here's how to add an Indian SMS provider:

#### Quick Switch to Twilio (India + Global):

1. **Sign up** at [twilio.com](https://twilio.com)
2. **Install package:**
   ```bash
   npm install twilio
   ```

3. **Update `supabase.js`** - replace the `sendSMS` function:
   ```javascript
   import twilio from 'twilio';
   
   async function sendSMS(phoneNumber, message) {
     try {
       const client = twilio(
         process.env.TWILIO_ACCOUNT_SID,
         process.env.TWILIO_AUTH_TOKEN
       );
       
       const result = await client.messages.create({
         body: message,
         from: process.env.TWILIO_PHONE_NUMBER,
         to: phoneNumber, // Supports +91XXXXXXXXXX
       });
       
       console.log(`✅ SMS sent: ${result.sid}`);
       return { success: true, result };
     } catch (error) {
       console.error('SMS error:', error);
       return { success: false, error: error.message };
     }
   }
   ```

4. **Update `.env`:**
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

## Disable SMS Notifications

To turn off SMS (keep only email):
```env
ENABLE_SMS_NOTIFICATIONS=false
```

## Check Quota

The free Textbelt tier shows remaining quota in console:
```
📊 Textbelt quota remaining: 73
```

Monitor this to know when you're running low.

## Troubleshooting

### "No phone number available for SMS"
- User's `mobile_number` is "Not provided" in database
- Update user records with valid phone numbers

### "Invalid phone number"
- Free Textbelt requires US format: `+1234567890`
- For Indian numbers, switch to Twilio/MSG91

### "Quota exceeded"
- You've used 75 free SMS today
- Wait 24 hours or upgrade to paid tier

## Production Recommendations

1. **For US customers:** Keep Textbelt free tier
2. **For Indian customers:** Switch to MSG91 or Twilio
3. **For global customers:** Use Twilio ($15 free credit)

## Testing Tips

1. **Test with your own US number first** (if you have one)
2. **Check console logs** for detailed error messages
3. **Start with small batch** to avoid quota issues
4. **Monitor Textbelt dashboard** at textbelt.com

## Next Steps

- [ ] Update user phone numbers to US format for testing
- [ ] Place test order to verify SMS works
- [ ] Monitor quota usage
- [ ] Decide on production SMS provider for India
- [ ] Configure Vercel environment variables
