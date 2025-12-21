# Quick Fix Guide - Foreign Key Constraint Error

## Problem
You're getting this error:
```
❌ Failed to create order: insert or update on table "orders" violates foreign key constraint "orders_user_id_fkey"
```

## Cause
When a user authenticates with Supabase Auth, they get a user ID in the `auth.users` table, but there's no corresponding entry in the `users` table. Orders require a valid `user_id` from the `users` table.

## Solution

### Option 1: Run Migration Script (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/fix-user-policy.sql`
4. Click **Run**

This will:
- Add a policy allowing users to create their own records
- Make certain fields nullable for auto-creation
- Create a trigger that automatically creates user records when someone signs up

### Option 2: Manual Fix for Existing Users

If you already have authenticated users, you need to create their records in the `users` table:

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Copy the user's UUID
3. Go to **SQL Editor** and run:

```sql
INSERT INTO users (id, email, company_name, contact_name, mobile_number)
VALUES (
  'paste-user-uuid-here',
  'user@example.com',
  'Company Name',
  'Contact Name',
  '+91-XXXXXXXXXX'
)
ON CONFLICT (id) DO NOTHING;
```

### Option 3: The Code Fix is Already Applied

The bot code has been updated to automatically create user records when someone logs in. Just make sure to:

1. Run the migration script from Option 1
2. Restart your bot server
3. Try logging in again

## Testing

After applying the fix:

1. Go to http://localhost:3000
2. Log in with your credentials
3. Try placing an order
4. It should now work without the foreign key error

## Verification

To verify the fix worked:

1. Go to Supabase **Table Editor** → **users**
2. Check if your user record exists
3. The `id` should match your auth user ID

## Need Help?

If you're still getting errors:
1. Check Supabase logs in Dashboard → Logs
2. Verify RLS policies are enabled
3. Make sure the migration script ran successfully
