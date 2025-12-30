# Amrut-Dhara B2B Order Bot 🌊

A conversational chatbot for B2B water bottle order management, built with Node.js, Express, and Supabase.

## Features

- ✅ Email/Password authentication
- 📦 Place new water bottle orders (20L/10L)
- 📋 View order history
- 🔍 View detailed order information
- 💬 Multi-channel support (WhatsApp Business API, Web Chat)
- 🔐 Secure with Row Level Security (RLS)
- 💾 Session management with automatic timeout

## Tech Stack

- **Backend:** Node.js + Express
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Session Store:** In-memory (can be upgraded to Redis)

## Project Structure

```
Amrut-Bot/
├── src/
│   ├── flows/
│   │   ├── authFlow.js          # Authentication logic
│   │   ├── menuFlow.js          # Main menu router
│   │   ├── newOrderFlow.js      # New order placement
│   │   ├── orderHistoryFlow.js  # Order history display
│   │   └── orderDetailsFlow.js  # Order details viewer
│   ├── utils/
│   │   ├── supabase.js          # Supabase client & helpers
│   │   └── sessionStore.js      # Session management
│   ├── messageHandler.js        # Main message processor
│   └── server.js                # Express server & webhooks
├── database/
│   ├── schema.sql               # Database schema with RLS
│   └── seed.sql                 # Sample data for testing
├── .env.example                 # Environment variables template
├── package.json
└── README.md
```

## Setup Instructions

### 1. Clone the Repository

```bash
cd /Users/anupamprasad/Documents/Projects/Amrut-Bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API** and copy:
   - `Project URL` (SUPABASE_URL)
   - `anon public` key (SUPABASE_ANON_KEY)

### 4. Set Up Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Run the contents of `database/schema.sql`
3. (Optional) Run `database/seed.sql` for sample data

### 5. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=3000
SESSION_TIMEOUT_MINUTES=30
BOT_NAME=Amrut-Dhara Water Solutions
SUPPORT_CONTACT=+91-XXXXXXXXXX
```

### 6. Create Test Users in Supabase

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add User** → **Create new user**
3. Add email and password
4. Copy the user's UUID
5. Insert user data into the `users` table:

```sql
INSERT INTO users (id, company_name, contact_name, mobile_number, email)
VALUES (
  'user-uuid-from-auth',
  'Test Company',
  'Test User',
  '+91-1234567890',
  'test@example.com'
);
```

### 7. Run the Bot

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### 8. Test the Bot

Open your browser and navigate to:
```
http://localhost:3000
```

You'll see a web chat interface where you can test the bot.

## API Endpoints

### Health Check
```
GET /health
```

### Generic Webhook
```
POST /webhook
Content-Type: application/json

{
  "userId": "unique_user_id",
  "message": "user message"
}
```

### WhatsApp Webhook
```
POST /webhook/whatsapp
```
Receives WhatsApp Business API webhook events.

```
GET /webhook/whatsapp?hub.mode=subscribe&hub.verify_token=token&hub.challenge=challenge
```
WhatsApp webhook verification endpoint.

## Conversation Flow

### 1. Authentication
```
Bot: Welcome to Amrut-Dhara Water Solutions! 🌊
     Please enter your registered email address:
User: test@example.com
Bot: Please enter your password:
User: ********
Bot: ✅ Authentication successful!
```

### 2. Main Menu
```
📋 Main Menu

1️⃣ Place New Order
2️⃣ View Order History
3️⃣ View Order Details
4️⃣ Help / Support
```

### 3. Place New Order
```
Bot: Please select bottle type:
     1️⃣ 20L
     2️⃣ 10L
User: 1
Bot: Please enter the quantity:
User: 50
Bot: Please enter the delivery address:
User: 123 Main Street, Bangalore
Bot: Please enter preferred delivery date (YYYY-MM-DD):
User: 2025-12-25
Bot: [Order Summary]
     Confirm? (YES/NO)
User: YES
Bot: ✅ Order Placed Successfully!
```

## Database Schema

### `users` table
- `id` (UUID, Primary Key)
- `company_name` (Text)
- `contact_name` (Text)
- `mobile_number` (Text, Unique)
- `email` (Text, Unique)
- `created_at` (Timestamp)

### `orders` table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `bottle_type` (Text: '20L' or '10L')
- `quantity` (Integer)
- `delivery_address` (Text)
- `delivery_date` (Date)
- `order_status` (Text: 'Pending', 'Confirmed', 'Delivered')
- `created_at` (Timestamp)

## Security Features

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own data
- ✅ Environment variables for sensitive data
- ✅ Session timeout after inactivity
- ✅ Input validation on all user inputs

## Testing

### Manual Testing via Web Interface
1. Start the server: `npm start`
2. Open http://localhost:3000
3. Follow the conversation flow

### Testing with cURL

```bash
# Send a message
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "message": "start"
  }'
```

## Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create amrut-dhara-bot

# Set environment variables
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key

# Deploy
git push heroku main
```

### Deploy to Render / Railway / Vercel

1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

## WhatsApp Integration

To integrate with WhatsApp Business API:

1. Sign up for WhatsApp Business API
2. Configure webhook URL: `https://your-domain.com/webhook/whatsapp`
3. Set verify token in `.env`: `WHATSAPP_VERIFY_TOKEN=your_token`
4. Implement message sending logic in the webhook handler

## Future Enhancements

- [ ] Order status notifications (SMS/Email)
- [ ] Admin dashboard for order approval
- [ ] Multilingual support (Hindi, regional languages)
- [ ] Payment integration
- [ ] CRM integration
- [ ] Redis for distributed session storage
- [ ] Rate limiting and abuse prevention
- [ ] Analytics and reporting
- [ ] Order modification/cancellation

## Support

For issues or questions:
- Email: support@amrutdhara.com
- Phone: +91-XXXXXXXXXX

## License

ISC
