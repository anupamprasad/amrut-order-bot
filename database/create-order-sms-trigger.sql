-- Create a database trigger to send SMS when new order is inserted
-- This trigger calls a Supabase Edge Function

-- STEP 1: Enable pg_net extension (run this FIRST)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- STEP 2: Create the function that will be triggered
CREATE OR REPLACE FUNCTION notify_new_order_sms()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  function_url text;
BEGIN
  -- Replace YOUR_PROJECT_REF with your actual Supabase project reference
  -- Example: https://abcdefghijk.supabase.co/functions/v1/send-order-sms
  function_url := 'https://ocirtugzqeraqgdoyegz.supabase.co/functions/v1/send-order-sms';
  
  -- Call the edge function via pg_net extension
  SELECT extensions.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'record', row_to_json(NEW)
    )
  ) INTO request_id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the order insert
    RAISE WARNING 'Failed to send SMS notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Create the trigger on orders table
DROP TRIGGER IF EXISTS on_order_created_send_sms ON orders;

CREATE TRIGGER on_order_created_send_sms
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order_sms();

-- STEP 4: Grant necessary permissions
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

COMMENT ON FUNCTION notify_new_order_sms() IS 'Sends SMS notification when new order is created';
