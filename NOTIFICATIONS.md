# Notification System Integration Guide

The bot includes a notification system that triggers when orders are placed successfully.

## Current Implementation

### What's Included:
- ✅ Order notification logging in console
- ✅ Visual toast notification in web UI
- ✅ Email confirmation message to user
- ✅ Order details captured for notifications

## Email Service Integration

To send actual emails, integrate one of these services:

### Option 1: SendGrid (Recommended)

1. **Sign up** at [sendgrid.com](https://sendgrid.com)
2. **Get API Key** from Settings → API Keys
3. **Install package:**
   ```bash
   npm install @sendgrid/mail
   ```

4. **Update `.env`:**
   ```env
   SENDGRID_API_KEY=your_api_key_here
   NOTIFICATION_EMAIL_FROM=orders@amrutdhara.com
   ADMIN_EMAIL=admin@amrutdhara.com
   ```

5. **Update `src/utils/supabase.js`:**
   ```javascript
   import sgMail from '@sendgrid/mail';
   
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   
   export async function sendOrderNotification(order, userEmail) {
     const msg = {
       to: userEmail,
       from: process.env.NOTIFICATION_EMAIL_FROM,
       subject: `Order Confirmation - ${order.id.substring(0, 8)}`,
       html: `
         <h2>Order Placed Successfully!</h2>
         <p>Order ID: ${order.id}</p>
         <p>Bottle Type: ${order.bottle_type}</p>
         <p>Quantity: ${order.quantity}</p>
         <p>Delivery Date: ${order.delivery_date}</p>
         <p>Address: ${order.delivery_address}</p>
       `,
     };
     
     await sgMail.send(msg);
     
     // Also notify admin
     const adminMsg = {
       to: process.env.ADMIN_EMAIL,
       from: process.env.NOTIFICATION_EMAIL_FROM,
       subject: `New Order - ${order.id.substring(0, 8)}`,
       html: `New order received from ${userEmail}...`,
     };
     
     await sgMail.send(adminMsg);
   }
   ```

### Option 2: Resend

1. **Sign up** at [resend.com](https://resend.com)
2. **Get API Key**
3. **Install:**
   ```bash
   npm install resend
   ```

4. **Code:**
   ```javascript
   import { Resend } from 'resend';
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   await resend.emails.send({
     from: 'orders@amrutdhara.com',
     to: userEmail,
     subject: 'Order Confirmation',
     html: '<p>Your order has been placed!</p>',
   });
   ```

### Option 3: Supabase Edge Functions

1. Create edge function for email sending
2. Use with Resend or SendGrid
3. Trigger from database webhook

### Option 4: AWS SES

1. Set up AWS SES
2. Install AWS SDK
3. Configure SMTP or API
4. Send emails through SES

## SMS Notifications

### Twilio Integration:

```bash
npm install twilio
```

```javascript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  body: `Order ${order.id.substring(0, 8)} confirmed!`,
  from: process.env.TWILIO_PHONE,
  to: userPhone,
});
```

## WhatsApp Notifications

Use WhatsApp Business API to send order confirmations directly to WhatsApp.

## Push Notifications

For web push notifications, integrate with:
- Firebase Cloud Messaging (FCM)
- OneSignal
- Pusher

## Database Triggers

You can also set up Supabase database triggers:

```sql
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('new_order', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();
```

## Current Notification Flow

1. User completes order
2. Order saved to database
3. `sendOrderNotification()` called
4. Logs order details to console
5. Returns success
6. UI shows toast notification
7. User sees confirmation message

## What You Need to Add

To enable actual email/SMS notifications:
1. Choose a service (SendGrid recommended)
2. Add credentials to `.env`
3. Install required npm package
4. Update `sendOrderNotification()` function
5. Test with real email

## Testing

```bash
# Test notification without placing order
node -e "
  const { sendOrderNotification } = require('./src/utils/supabase.js');
  sendOrderNotification({
    id: 'test-123',
    bottle_type: '500ml',
    quantity: 10,
    delivery_address: 'Test Address',
    delivery_date: '2025-12-25'
  }, 'test@example.com');
"
```
