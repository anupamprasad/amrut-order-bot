# Deploy to Render - Quick Guide

## Steps to Deploy

### 1. Push Latest Changes to GitHub

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### 2. Deploy to Render (Recommended - Free)

1. Go to [render.com](https://render.com) and sign up/login
2. Click **New +** → **Web Service**
3. Connect your GitHub account
4. Select repository: `anupamprasad/amrut-order-bot`
5. Configure:
   - **Name:** `amrut-order-bot`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

6. Add Environment Variables:
   - Click **Environment** tab
   - Add these variables:
     - `SUPABASE_URL` = your_supabase_url
     - `SUPABASE_ANON_KEY` = your_supabase_key
     - `SESSION_TIMEOUT_MINUTES` = 30
     - `BOT_NAME` = Amrut-Dhara Water Solutions
     - `SUPPORT_CONTACT` = +91-XXXXXXXXXX

7. Click **Create Web Service**

8. Wait for deployment (takes 2-3 minutes)

9. Your bot will be live at: `https://amrut-order-bot.onrender.com`

### Alternative: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `anupamprasad/amrut-order-bot`
4. Add environment variables in Settings → Variables
5. Railway auto-deploys, gives you a public URL

### Alternative: Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Follow prompts, add environment variables when asked.

---

## After Deployment

Your bot will be accessible at the public URL provided by the platform.

Test it by visiting:
- `https://your-url.com` - Web chat interface
- `https://your-url.com/webhook` - Webhook endpoint
- `https://your-url.com/health` - Health check

## Important Notes

- Free tier services may sleep after inactivity
- Render free tier wakes up automatically when accessed
- For production, consider upgrading to paid tier for better performance
