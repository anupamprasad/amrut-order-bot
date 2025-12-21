# Deployment Guide - Amrut-Dhara Bot

## Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Domain name (for production)

## Supabase Setup (Detailed)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Fill in:
   - Name: `amrut-dhara-bot`
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Click **Create new project**

### 2. Get API Credentials

1. Go to **Project Settings** (gear icon)
2. Click **API** in sidebar
3. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

### 3. Set Up Database

1. Go to **SQL Editor** in Supabase dashboard
2. Create a new query
3. Copy entire contents of `database/schema.sql`
4. Click **Run** to execute
5. Verify tables created in **Table Editor**

### 4. Create Test User

1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter:
   - Email: `test@amrutdhara.com`
   - Password: `TestPass123!`
   - Confirm email: Yes
4. Click **Create User**
5. **Copy the User UUID** (you'll need this)

### 5. Add User to users Table

1. Go to **Table Editor** → **users**
2. Click **Insert** → **Insert row**
3. Fill in:
   - `id`: Paste the UUID from step 4
   - `company_name`: Test Company
   - `contact_name`: Test User
   - `mobile_number`: +91-9999999999
   - `email`: test@amrutdhara.com
4. Click **Save**

## Local Development

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

Add your Supabase credentials:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
SESSION_TIMEOUT_MINUTES=30
BOT_NAME=Amrut-Dhara Water Solutions
SUPPORT_CONTACT=+91-9876543210
```

### 2. Install and Run

```bash
# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Or run in production mode
npm start
```

### 3. Test Locally

Open browser: http://localhost:3000

Test login:
- Email: `test@amrutdhara.com`
- Password: `TestPass123!`

## Production Deployment

### Option 1: Deploy to Render

1. **Create account** at [render.com](https://render.com)

2. **Create new Web Service**
   - Connect your GitHub repository
   - Or use "Deploy from Git URL"

3. **Configure Service**
   - Name: `amrut-dhara-bot`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables**
   ```
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   SESSION_TIMEOUT_MINUTES=30
   BOT_NAME=Amrut-Dhara Water Solutions
   SUPPORT_CONTACT=+91-9876543210
   ```

5. **Deploy** - Click "Create Web Service"

6. **Get URL** - Copy the `.onrender.com` URL

### Option 2: Deploy to Railway

1. **Create account** at [railway.app](https://railway.app)

2. **New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add Environment Variables**
   - Go to Variables tab
   - Add all variables from .env

4. **Deploy**
   - Railway auto-deploys on push

5. **Get Domain**
   - Go to Settings → Generate Domain

### Option 3: Deploy to Heroku

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create amrut-dhara-bot

# Add environment variables
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
heroku config:set SESSION_TIMEOUT_MINUTES=30
heroku config:set BOT_NAME="Amrut-Dhara Water Solutions"
heroku config:set SUPPORT_CONTACT="+91-9876543210"

# Deploy
git push heroku main

# Open app
heroku open
```

### Option 4: Deploy to VPS (Ubuntu)

```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/yourusername/amrut-bot.git
cd amrut-bot

# Install dependencies
npm install

# Create .env file
nano .env
# (paste your environment variables)

# Start with PM2
pm2 start src/server.js --name amrut-bot

# Save PM2 configuration
pm2 save
pm2 startup

# Install Nginx
sudo apt install nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/amrut-bot
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/amrut-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## WhatsApp Business API Setup

### 1. Meta for Developers Setup

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a new app → "Business"
3. Add **WhatsApp** product
4. Get test number or add your own business number

### 2. Configure Webhook

1. In WhatsApp settings, click **Configuration**
2. Set Webhook URL: `https://your-domain.com/webhook/whatsapp`
3. Set Verify Token: (create a random string)
4. Add to `.env`:
   ```
   WHATSAPP_VERIFY_TOKEN=your_random_token
   ```
5. Subscribe to webhook fields:
   - `messages`

### 3. Test WhatsApp Integration

1. Get test number from Meta
2. Send a message to the test number
3. Check server logs for incoming webhook

## Monitoring & Maintenance

### View Logs (Render/Railway)
- Dashboard → Logs tab

### View Logs (Heroku)
```bash
heroku logs --tail
```

### View Logs (PM2 on VPS)
```bash
pm2 logs amrut-bot
```

### Restart Service

**Render/Railway:** Push new commit to GitHub

**Heroku:**
```bash
heroku restart
```

**PM2:**
```bash
pm2 restart amrut-bot
```

## Database Backups

### Automatic (Supabase)
Supabase automatically backs up your database daily on paid plans.

### Manual Backup
1. Go to Supabase Dashboard → Database
2. Click "Backups"
3. Download backup

## Scaling Considerations

### Session Store
For production with multiple instances:
1. Install Redis
2. Replace in-memory session store with Redis
3. Use `ioredis` or `redis` npm package

### Database
- Supabase auto-scales on paid plans
- Monitor connection pool usage
- Add database indexes for frequently queried columns

## Security Checklist

- ✅ Environment variables not committed to git
- ✅ HTTPS enabled (SSL certificate)
- ✅ Supabase RLS policies active
- ✅ Rate limiting enabled (optional: use `express-rate-limit`)
- ✅ Input validation on all user inputs
- ✅ Regular security updates: `npm audit`

## Troubleshooting

### Bot not responding
1. Check server logs
2. Verify .env variables are set correctly
3. Test database connection
4. Check Supabase service status

### Authentication failing
1. Verify user exists in Supabase Auth
2. Verify user UUID matches in users table
3. Check RLS policies are enabled

### Database errors
1. Check Supabase connection limit
2. Verify table structure matches schema.sql
3. Check RLS policies allow the operation

## Support

For deployment issues:
- Check logs first
- Verify all environment variables
- Test database connection
- Review Supabase dashboard for errors
