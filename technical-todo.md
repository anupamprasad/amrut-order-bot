# Technical TODO – Amrut-Dhara B2B Order Bot

This document outlines the **technical task list** and **conversation flow (wireframe)** for a chatbot that accepts water bottle orders for the Amrut-Dhara B2B product via chat.

**Last Updated:** December 27, 2025

---

## ✅ Implementation Status

### Completed Features
- ✅ Bot architecture with Node.js + Express
- ✅ Supabase authentication and database
- ✅ Complete order placement flow
- ✅ Order history and details viewing
- ✅ Session management (in-memory)
- ✅ Email notifications (Resend)
- ✅ WhatsApp notifications (Baileys)
- ✅ SMS notifications (Twilio) - Admin alerts
- ✅ Web interface with modern UI
- ✅ Vercel deployment configuration
- ✅ GitHub repository
- ✅ Database triggers for SMS (optional)

### Pending Features
- ⏳ WhatsApp Business API integration (currently using Baileys)
- ⏳ Admin dashboard
- ⏳ Payment integration
- ⏳ Redis for distributed sessions
- ⏳ Multilingual support

---

## 1. Bot Overview

### Purpose

To allow B2B customers to place water bottle orders, view order history, and check order details through a conversational chat interface instead of a mobile app.

### Supported Channels

* ✅ **Web Chat** (implemented)
* ✅ **WhatsApp** (via Baileys - open source)
* ⏳ WhatsApp Business API (planned)
* ⏳ Slack, Microsoft Teams (future)

---

## 2. High-Level Architecture

* **Frontend:** ✅ Embedded Web Chat + WhatsApp
* **Bot Engine:** ✅ Node.js (Express) with ES modules
* **NLP / Logic:** ✅ Rule-based conversation flows
* **Backend:** ✅ Supabase (Auth + PostgreSQL + RLS)
* **Hosting:** ✅ Vercel (serverless)
* **Notifications:** ✅ Resend (email) + Baileys (WhatsApp) + Twilio (SMS)
* **Repository:** ✅ GitHub (anupamprasad/amrut-order-bot)

---

## 3. Supabase Backend Setup

### ✅ Completed Tasks

* ✅ Created Supabase project
* ✅ Enabled Email & Password authentication
* ✅ Created database tables with RLS
* ✅ Configured Row Level Security policies
* ✅ Auto-user creation on first login
* ✅ API keys configured

### Database Tables

**users**

* id (UUID) - Primary Key
* company_name (TEXT)
* contact_name (TEXT)
* mobile_number (TEXT UNIQUE)
* email (TEXT UNIQUE)
* created_at (TIMESTAMP)

**orders**

* id (UUID) - Primary Key
* user_id (UUID FK → users.id)
* bottle_type (200ml / 300ml / 500ml)
* quantity (INTEGER)
* delivery_address (TEXT)
* preferred_delivery_date (DATE)
* order_status (Pending / Confirmed / Delivered)
* created_at (TIMESTAMP)

---

## 4. Bot Authentication Flow

### ✅ Implemented Wireframe

1. ✅ Bot: "Welcome to Amrut-Dhara Water Solutions! 🌊"
2. ✅ Bot: "Please enter your registered email address:"
3. ✅ User: enters email
4. ✅ Bot: "Please enter your password:"
5. ✅ Bot: "✅ Authentication successful! Welcome back, [email]!"
6. ✅ Bot: Displays main menu

### ✅ Completed Technical Tasks

* ✅ User verification via Supabase Auth
* ✅ Session mapping to user_id
* ✅ Failed authentication handling with retry
* ✅ Session persistence (30-minute timeout)
* ✅ Email validation
* ✅ Auto-user creation in users table

---

## 5. Main Menu Flow

### ✅ Implemented Wireframe

Bot presents menu options (vertical layout):

* 1️⃣ Place New Order
* 2️⃣ View Order History
* 3️⃣ View Order Details
* 4️⃣ Help / Support

Navigation hints: "Type 'menu' anytime to return"

### ✅ Completed Technical Tasks

* ✅ Menu router with state management
* ✅ Conversation state persistence
* ✅ Invalid input handling
* ✅ Vertical button layout in UI
* ✅ Modern gradient design

---

## 6. New Order Placement Flow

### ✅ Implemented Wireframe

1. ✅ Bot: "Select bottle type" (shows images)
   * 200ml
   * 300ml
   * 500ml
2. ✅ User selects option
3. ✅ Bot: "Enter quantity (minimum 10)"
4. ✅ Bot: "Enter delivery address"
5. ✅ Bot: "Enter preferred delivery date (YYYY-MM-DD)"
6. ✅ Bot: Shows order summary with confirmation
7. ✅ Bot: "✅ Order placed successfully!"
8. ✅ Sends email + WhatsApp + SMS notifications

### ✅ Completed Technical Tasks

* ✅ Step-wise data capture with validation
* ✅ Numeric validation (quantity ≥ 10)
* ✅ Date format validation
* ✅ Order saved to Supabase
* ✅ UUID order ID generation
* ✅ Confirmation with order details
* ✅ Image support (bottle.svg)
* ✅ Multi-channel notifications (email, WhatsApp, SMS)

---

## 7. Order History Flow

### ✅ Implemented Wireframe

1. ✅ Bot: "Here are your recent orders:"
2. ✅ Bot displays formatted list (last 10):
   * Order ID (short) | Date | Bottle Type | Quantity | Status
3. ✅ Bot: "Type order ID to view details or 'menu' to go back"

### ✅ Completed Technical Tasks

* ✅ Fetch orders by user_id with RLS
* ✅ Limited to last 10 orders
* ✅ Sorted by created_at DESC
* ✅ Formatted display for chat
* ✅ Empty state handling

---

## 8. Order Details Flow

### ✅ Implemented Wireframe

Bot displays:

* ✅ Order ID (full UUID)
* ✅ Bottle Type & Quantity
* ✅ Delivery Address
* ✅ Preferred Delivery Date
* ✅ Order Status
* ✅ Order Date

### ✅ Completed Technical Tasks

* ✅ Fetch order by order_id with user authorization
* ✅ RLS ensures users only see their orders
* ✅ Error handling for invalid/unauthorized IDs
* ✅ Formatted display

---

## 9. Help & Support Flow

### ✅ Implemented Wireframe

Bot: "For support, contact Amrut-Dhara team at +91-9810554738"

### ✅ Completed Technical Tasks

* ✅ Static response from environment variable
* ✅ Configurable support contact

---

## 10. Conversation State Management

### ✅ Completed Technical Tasks

* ✅ In-memory session store (Map-based)
* ✅ 30-minute session timeout
* ✅ Automatic cleanup every 5 minutes
* ✅ State tracking per user
* ✅ Temporary data storage
* ✅ Restart and fallback handling

### ⏳ Future Enhancement
* ⏳ Redis for distributed sessions (for scaling)

---

## 11. Notification System

### ✅ Implemented Features

**Email Notifications (Resend)**
* ✅ Customer order confirmation with HTML template
* ✅ Admin order alerts
* ✅ Gradient design matching UI
* ✅ Free tier: 3,000 emails/month
* ✅ Graceful fallback if not configured

**WhatsApp Notifications (Baileys)**
* ✅ Rich formatted messages with emojis
* ✅ Order confirmation to customer
* ✅ QR code authentication
* ✅ Session persistence
* ✅ Auto-reconnection
* ✅ Free and open-source

**SMS Notifications (Twilio)**
* ✅ Admin SMS alerts on new orders
* ✅ Application-based implementation (ready to use)
* ✅ Database trigger approach (optional, for high-reliability)
* ✅ Formatted order details in SMS
* ✅ Queue-based alternative (no pg_net required)
* ✅ Test script for validation (test-sms.js)
* ✅ Free trial: $15 credit (~500-1900 SMS)
* ✅ Comprehensive setup guide (SMS_ALERTS_SETUP.md)

### Configuration
* `RESEND_API_KEY` - Email service
* `NOTIFICATION_EMAIL_FROM` - Sender email
* `ADMIN_EMAIL` - Admin notifications
* `ENABLE_WHATSAPP_NOTIFICATIONS` - WhatsApp toggle
* `TWILIO_ACCOUNT_SID` - Twilio account identifier
* `TWILIO_AUTH_TOKEN` - Twilio authentication token
* `TWILIO_PHONE_NUMBER` - Twilio sender number
* `ADMIN_PHONE_NUMBER` - SMS recipient (admin)

### SMS Implementation Options
1. **Application Code (Recommended)**: SMS sent via `sendOrderNotification()` function
2. **Database Trigger with pg_net**: Uses Supabase edge function (advanced)
3. **Notification Queue**: Table-based queue without pg_net extension

---

## 12. Security & Compliance

### ✅ Completed Technical Tasks

* ✅ Environment variables for API keys
* ✅ Supabase RLS policies enabled
* ✅ User authentication required
* ✅ Session-based authorization
* ✅ .env excluded from Git
* ✅ WhatsApp session data ignored in Git

### Security Features
* ✅ Users can only view/modify own data
* ✅ Foreign key constraints
* ✅ Unique email/phone constraints
* ✅ Check constraints on bottle types and quantities

---

## 13. Testing

### ✅ Completed Testing

* ✅ End-to-end conversation flow tested
* ✅ Authentication flow validated
* ✅ Order placement tested
* ✅ Order history retrieval tested
* ✅ Invalid input handling verified
* ✅ Database constraints tested
* ✅ Email notifications tested
* ✅ WhatsApp integration tested
* ✅ SMS notifications tested (Twilio)
* ✅ SMS test utility created and validated

### ⏳ Pending Testing
* ⏳ Load testing for concurrent users
* ⏳ Automated unit tests
* ⏳ Integration tests

---

## 14. Deployment & Monitoring

### ✅ Completed Deployment Tasks

* ✅ Production environment on Vercel
* ✅ GitHub integration with auto-deploy
* ✅ Environment variables configured
* ✅ Static file serving (images)
* ✅ Webhook endpoints configured
* ✅ Console logging for monitoring

### Deployment URLs
* **Repository:** github.com/anupamprasad/amrut-order-bot
* **Production:** Vercel (auto-deploys from main branch)

### ⏳ Pending Monitoring
* ⏳ Error tracking (Sentry)
* ⏳ Analytics dashboard
* ⏳ Performance monitoring

---

## 15. User Interface

### ✅ Implemented Features

* ✅ Embedded web chat interface
* ✅ Modern gradient design (purple/blue)
* ✅ Vertical button layout
* ✅ Responsive design
* ✅ Image support for products
* ✅ Loading states
* ✅ Error handling
* ✅ Toast notifications
* ✅ Navigation hints throughout journey

---

## 16. Future Enhancements

### High Priority
* ⏳ Payment integration (Razorpay/Stripe)
* ⏳ Admin dashboard for order management
* ⏳ WhatsApp Business API (official)
* ⏳ Redis for session storage

### Medium Priority
* ⏳ Order status update workflow
* ⏳ Admin approval process
* ⏳ Order cancellation
* ⏳ Delivery tracking
* ⏳ CRM integration

### Low Priority
* ⏳ Multilingual support (Hindi)
* ⏳ Slack integration
* ⏳ Microsoft Teams integration
* ⏳ Voice ordering
* ⏳ Bulk order discounts

---

## 17. Technical Stack Summary

### Backend
* **Runtime:** Node.js v18+
* **Framework:** Express.js
* **Module System:** ES Modules
* **Database:** PostgreSQL (via Supabase)
* **Authentication:** Supabase Auth
* **Session:** In-memory Map

### Notifications
* **Email:** Resend API
* **WhatsApp:** Baileys (open-source)
* **SMS:** Twilio API

### Deployment
* **Platform:** Vercel (serverless)
* **Version Control:** Git + GitHub
* **CI/CD:** GitHub → Vercel auto-deploy

### Dependencies
* @supabase/supabase-js
* express
* dotenv
* resend
* @whiskeysockets/baileys
* @hapi/boom
* pino
* qrcode-terminal
* twilio

---

## 18. Known Limitations

### Current Limitations
* ⚠️ Baileys is against WhatsApp ToS (use for testing only)
* ⚠️ In-memory sessions don't scale horizontally
* ⚠️ WhatsApp won't work on Vercel (needs persistent connection)
* ⚠️ No payment processing yet
* ⚠️ No admin interface

### Workarounds
* ✅ Email notifications work on Vercel
* ✅ Can disable WhatsApp for Vercel deployment
* ✅ WhatsApp works on VPS/Railway/Render
* ✅ Plan migration to Meta Cloud API for production

---

## 19. Documentation

### ✅ Available Documentation
* ✅ README.md - Project overview
* ✅ RESEND_SETUP.md - Email configuration guide
* ✅ BAILEYS_SETUP.md - WhatsApp setup guide
* ✅ NOTIFICATIONS.md - Notification integration options
* ✅ SMS_ALERTS_SETUP.md - Twilio SMS configuration guide
* ✅ technical-todo.md - This file
* ✅ test-sms.js - SMS testing utility

---

**End of technical-todo.md (B2B Order Bot)**

**Status:** ✅ MVP Complete | 🚀 Production Ready | 📱 Deployed on Vercel

---

## 1. Bot Overview

### Purpose

To allow B2B customers to place water bottle orders, view order history, and check order details through a conversational chat interface instead of a mobile app.

### Supported Channels (Phase 1)

* WhatsApp Business API / Web Chat
* Future: Slack, Microsoft Teams

---

## 2. High-Level Architecture

* **Frontend:** Chat interface (WhatsApp/Web)
* **Bot Engine:** Node.js / Python (FastAPI)
* **NLP / Logic:** Rule-based + optional LLM
* **Backend:** Supabase (Auth + PostgreSQL)
* **Hosting:** Cloud VM / Serverless

---

## 3. Supabase Backend Setup

### Technical Tasks

* Create Supabase project
* Enable Email & Password authentication
* Create database tables
* Configure Row Level Security (RLS)
* Generate API keys

### Database Tables

**users**

* id (UUID)
* company_name
* contact_name
* mobile_number
* email
* created_at

**orders**

* id (UUID)
* user_id (FK → users.id)
* bottle_type
* quantity
* delivery_address
* preferred_delivery_date
* order_status (Pending / Confirmed / Delivered)
* created_at

---

## 4. Bot Authentication Flow

### Conversation Wireframe

1. Bot: "Welcome to Amrut-Dhara Water Solutions"
2. Bot: "Please enter your registered email"
3. User: enters email
4. Bot: "Please enter your password / OTP"
5. Bot: Authentication success → Home Menu

### Technical Tasks

* Implement user verification
* Map chat user to Supabase user_id
* Handle failed authentication
* Persist session context

---

## 5. Main Menu Flow

### Conversation Wireframe

Bot presents menu options:

* 1️⃣ Place New Order
* 2️⃣ View Order History
* 3️⃣ View Order Details
* 4️⃣ Help / Support

### Technical Tasks

* Build menu router
* Maintain conversation state
* Handle invalid input

---

## 6. New Order Placement Flow

### Conversation Wireframe

1. Bot: "Select bottle type (20L / 10L)"
2. User selects option
3. Bot: "Enter quantity"
4. Bot: "Enter delivery address"
5. Bot: "Enter preferred delivery date"
6. Bot: "Confirm order? (Yes / No)"
7. Bot: "✅ Order placed successfully"

### Technical Tasks

* Step-wise data capture
* Input validation (numeric, date)
* Save order to Supabase
* Generate order ID
* Send confirmation message

---

## 7. Order History Flow

### Conversation Wireframe

1. Bot: "Here are your recent orders"
2. Bot displays list:

   * Order ID | Date | Status
3. Bot: "Reply with Order ID to view details"

### Technical Tasks

* Fetch orders by user_id
* Limit records (last 5–10)
* Format data for chat display

---

## 8. Order Details Flow

### Conversation Wireframe

Bot displays:

* Order ID
* Bottle Type & Quantity
* Delivery Address
* Delivery Date
* Order Status

### Technical Tasks

* Fetch order by order_id
* Authorization check
* Error handling for invalid ID

---

## 9. Help & Support Flow

### Conversation Wireframe

Bot: "For support, contact Amrut-Dhara team at +91-XXXXXXXXXX"

### Technical Tasks

* Static response handling
* Optional human handoff

---

## 10. Conversation State Management

### Technical Tasks

* Implement session store (Redis / in-memory)
* Timeout inactive sessions
* Handle restart & fallback intents

---

## 11. Security & Compliance

### Technical Tasks

* Secure API keys
* Enable Supabase RLS
* Mask sensitive data in chat
* Audit logs for orders

---

## 12. Testing

### Technical Tasks

* Unit tests for bot logic
* End-to-end conversation testing
* Edge cases (invalid input, drop-offs)
* Load testing for concurrent chats

---

## 14. Future Enhancements

### High Priority
* ⏳ Payment integration (Razorpay/Stripe)
