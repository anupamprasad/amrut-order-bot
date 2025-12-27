-- Create a database trigger to send SMS when new order is inserted
-- This trigger calls a Supabase Edge Function

-- First, create the function that will be triggered
CREATE OR REPLACE FUNCTION notify_new_order_sms()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Call the edge function via pg_net extension
  -- Make sure pg_net extension is enabled in your Supabase project
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-order-sms',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := jsonb_build_object(
      'record', row_to_json(NEW)
    )
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on orders table
DROP TRIGGER IF EXISTS on_order_created_send_sms ON orders;

CREATE TRIGGER on_order_created_send_sms
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order_sms();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA net TO postgres, anon, authenticated, service_role;

-- To enable pg_net extension (run in SQL editor):
-- CREATE EXTENSION IF NOT EXISTS pg_net;
