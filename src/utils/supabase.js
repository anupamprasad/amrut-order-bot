import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { sendWhatsAppMessage } from './whatsapp.js';

dotenv.config();

// Initialize Twilio client for SMS alerts
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    const twilio = await import('twilio');
    twilioClient = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio SMS client initialized');
  } catch (error) {
    console.error('⚠️  Twilio initialization failed:', error.message);
  }
}

// Initialize Resend client (lazy loading to avoid errors if not configured)
let resend = null;
async function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  
  if (!resend) {
    try {
      const { Resend } = await import('resend');
      resend = new Resend(process.env.RESEND_API_KEY);
    } catch (error) {
      console.error('Failed to initialize Resend:', error);
      return null;
    }
  }
  
  return resend;
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to authenticate user
export async function authenticateUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Check if user exists in users table, create if not
  await ensureUserExists(data.user);

  return { success: true, user: data.user };
}

// Helper function to ensure user exists in users table
async function ensureUserExists(authUser) {
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', authUser.id)
    .single();

  if (existingUser) {
    return; // User already exists
  }

  // Create user record in users table
  const { error } = await supabase
    .from('users')
    .insert([{
      id: authUser.id,
      email: authUser.email,
      company_name: authUser.user_metadata?.company_name || 'Unknown Company',
      contact_name: authUser.user_metadata?.contact_name || authUser.email.split('@')[0],
      mobile_number: authUser.user_metadata?.mobile_number || 'Not provided',
    }]);

  if (error) {
    console.error('Error creating user record:', error);
  }
}

// Helper function to get user details
export async function getUserDetails(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data };
}

// Helper function to create order
export async function createOrder(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, order: data };
}

// Helper function to get user orders
export async function getUserOrders(userId, limit = 10) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, orders: data };
}

// Helper function to get order by ID
export async function getOrderById(orderId, userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, order: data };
}

// Helper function to send order notification
export async function sendOrderNotification(order, userEmail) {
  try {
    // Get user details including phone number
    const userResult = await getUserDetails(order.user_id);
    const userPhone = userResult.success ? userResult.user.mobile_number : null;

    // Format order details
    const orderDetails = {
      orderId: order.id,
      bottleType: order.bottle_type,
      quantity: order.quantity,
      deliveryAddress: order.delivery_address,
      deliveryDate: order.preferred_delivery_date,
      orderDate: new Date(order.created_at).toLocaleDateString(),
      userEmail: userEmail,
      userPhone: userPhone,
    };

    console.log('📧 Order Notification:', orderDetails);

    // Send WhatsApp notification (if enabled)
    if (userPhone && process.env.ENABLE_WHATSAPP_NOTIFICATIONS !== 'false') {
      const whatsappMessage = `🎉 *Order Confirmed!*

Order ID: #${order.id.substring(0, 8)}
📦 ${order.quantity}x ${order.bottle_type}
📅 Delivery: ${order.preferred_delivery_date}
📍 Address: ${order.delivery_address}

Thank you for your order!
- ${process.env.BOT_NAME || 'Amrut-Dhara Water Solutions'}`;
      
      await sendWhatsAppMessage(userPhone, whatsappMessage);
    }

    // Get Resend client and send email notification
    const resendClient = await getResendClient();
    
    if (resendClient && process.env.NOTIFICATION_EMAIL_FROM) {
      // Send confirmation email to customer
      await resendClient.emails.send({
        from: process.env.NOTIFICATION_EMAIL_FROM,
        to: userEmail,
        subject: `Order Confirmation - ${order.id.substring(0, 8)}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .detail-label { font-weight: bold; color: #667eea; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Order Confirmed!</h1>
              </div>
              <div class="content">
                <p>Dear Customer,</p>
                <p>Thank you for your order! We're pleased to confirm that we've received your order and it's being processed.</p>
                
                <div class="order-details">
                  <h2>Order Details</h2>
                  <div class="detail-row">
                    <span class="detail-label">Order ID:</span>
                    <span>${order.id}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Bottle Type:</span>
                    <span>${order.bottle_type}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Quantity:</span>
                    <span>${order.quantity} bottles</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Delivery Address:</span>
                    <span>${order.delivery_address}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Preferred Delivery Date:</span>
                    <span>${order.preferred_delivery_date}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Order Date:</span>
                    <span>${new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <p>Our team will contact you shortly to confirm the delivery details.</p>
                
                <div class="footer">
                  <p>Thank you for choosing Amrut-Dhara Water Solutions!</p>
                  <p>If you have any questions, please don't hesitate to contact us.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      // Send notification to admin if configured
      if (process.env.ADMIN_EMAIL) {
        await resendClient.emails.send({
          from: process.env.NOTIFICATION_EMAIL_FROM,
          to: process.env.ADMIN_EMAIL,
          subject: `New Order Received - ${order.id.substring(0, 8)}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2d3748; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f7fafc; padding: 20px; border-radius: 0 0 8px 8px; }
                .order-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #667eea; }
                .label { font-weight: bold; color: #667eea; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>🔔 New Order Alert</h2>
                </div>
                <div class="content">
                  <p>A new order has been placed:</p>
                  <div class="order-info">
                    <p><span class="label">Order ID:</span> ${order.id}</p>
                    <p><span class="label">Customer Email:</span> ${userEmail}</p>
                    <p><span class="label">Bottle Type:</span> ${order.bottle_type}</p>
                    <p><span class="label">Quantity:</span> ${order.quantity} bottles</p>
                    <p><span class="label">Delivery Address:</span> ${order.delivery_address}</p>
                    <p><span class="label">Preferred Delivery Date:</span> ${order.preferred_delivery_date}</p>
                    <p><span class="label">Order Time:</span> ${new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <p><strong>Action Required:</strong> Please contact the customer to confirm delivery details.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
      }

      console.log('✅ Email notifications sent successfully');
    } else {
      console.log('⚠️  Email not configured. Set RESEND_API_KEY and NOTIFICATION_EMAIL_FROM in .env');
    }

    // Send SMS alert to admin
    if (twilioClient && process.env.ADMIN_PHONE_NUMBER && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const smsMessage = `🔔 New Order Alert!

Order ID: ${order.id.substring(0, 8)}
Bottle: ${order.bottle_type}
Qty: ${order.quantity}
Date: ${order.preferred_delivery_date}
Customer: ${userEmail}
Address: ${order.delivery_address.substring(0, 50)}${order.delivery_address.length > 50 ? '...' : ''}`;

        const message = await twilioClient.messages.create({
          body: smsMessage,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.ADMIN_PHONE_NUMBER,
        });

        console.log('✅ Admin SMS alert sent:', message.sid);
      } catch (smsError) {
        console.error('❌ SMS alert failed:', smsError.message);
      }
    } else {
      console.log('⚠️  SMS alerts not configured. Set TWILIO credentials in .env');
    }
    
    return { success: true, notification: orderDetails };
  } catch (error) {
    console.error('Notification error:', error);
    return { success: false, error: error.message };
  }
}
