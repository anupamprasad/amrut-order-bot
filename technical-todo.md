# Technical TODO – Amrut-Dhara B2B Order Bot

This document outlines the **technical task list** and **conversation flow (wireframe)** for a chatbot that accepts water bottle orders for the Amrut-Dhara B2B product via chat.

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

## 13. Deployment & Monitoring

### Technical Tasks

* Setup production environment
* Configure webhook endpoints
* Enable logging & alerts
* Monitor failures & retries

---

## 14. Future Enhancements

* Order status notifications
* Admin approval workflow
* Multilingual support
* Payment integration
* CRM integration

---

**End of technical-todo.md (B2B Order Bot)**
