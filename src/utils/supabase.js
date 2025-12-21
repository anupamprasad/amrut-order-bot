import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

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
