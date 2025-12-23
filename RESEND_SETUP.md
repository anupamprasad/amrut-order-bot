# Resend Email Integration Setup

Your bot now has Resend email integration! Here's how to activate it:

## Step 1: Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Sign up with your email (free tier: 3,000 emails/month)
3. Verify your email address

## Step 2: Get Your API Key

1. Log in to Resend dashboard
2. Go to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "Amrut Bot Production")
5. Copy the API key (starts with `re_`)

## Step 3: Verify Your Domain

### Option A: Use Resend's Free Domain (Quick Start)
- You can use `onboarding@resend.dev` for testing
- Limited to 1 recipient at a time
- Perfect for testing before custom domain setup

### Option B: Add Your Own Domain (Recommended)
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `amrutdhara.com`)
4. Add the DNS records shown (MX, TXT, CNAME)
5. Wait for verification (usually 5-30 minutes)
6. Once verified, you can send from `orders@amrutdhara.com`

## Step 4: Configure Environment Variables

Update your `.env` file:

```env
# Resend Configuration
RESEND_API_KEY=re_your_actual_api_key_here
NOTIFICATION_EMAIL_FROM=orders@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

**For testing with Resend's free domain:**
```env
RESEND_API_KEY=re_your_actual_api_key_here
NOTIFICATION_EMAIL_FROM=onboarding@resend.dev
ADMIN_EMAIL=your-email@gmail.com
```

## Step 5: Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:
   - `RESEND_API_KEY` = your API key
   - `NOTIFICATION_EMAIL_FROM` = orders@yourdomain.com
   - `ADMIN_EMAIL` = admin@yourdomain.com
4. Redeploy your application

## Step 6: Test It!

1. Place a test order through your bot
2. Check your email inbox (both customer and admin)
3. Check Resend dashboard for delivery logs

## Email Features

### Customer Email
- 🎨 Beautiful HTML template with brand colors
- 📋 Complete order details
- ✅ Order confirmation number
- 📅 Delivery date
- 📍 Delivery address

### Admin Email
- 🔔 New order alert
- 👤 Customer information
- 📦 Order summary
- ⚡ Action required notice

## Troubleshooting

### Emails Not Sending?
1. Check API key is correct in `.env`
2. Verify domain is verified in Resend
3. Check Vercel environment variables are set
4. Look at console logs: `✅ Email notifications sent successfully`
5. Check Resend dashboard logs for errors

### Testing Without Domain
Use `onboarding@resend.dev` as sender for testing.

### Rate Limits
Free tier: 100 emails/day, 3,000/month
- Upgrade if you need more

## What Happens When Email Not Configured

If `RESEND_API_KEY` is not set:
- Bot continues to work normally
- Order confirmation toast still shows in UI
- Console logs order details
- No emails sent (graceful fallback)

## Next Steps

✅ Email integration complete
- [ ] Set up Resend account
- [ ] Get API key
- [ ] Configure environment variables
- [ ] Test with real order
- [ ] Monitor in Resend dashboard

## Support

- Resend Docs: [resend.com/docs](https://resend.com/docs)
- Resend Dashboard: [resend.com/emails](https://resend.com/emails)
- Bot Issues: Check console logs
