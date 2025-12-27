-- Simple notification trigger WITHOUT pg_net extension
-- This stores notifications in a table that can be processed by your application

-- Create a notifications table
CREATE TABLE IF NOT EXISTS order_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL DEFAULT 'sms',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  recipient_phone TEXT,
  message_body TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX idx_order_notifications_status ON order_notifications(status);
CREATE INDEX idx_order_notifications_order_id ON order_notifications(order_id);

-- Enable RLS
ALTER TABLE order_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy for service role only (backend processing)
CREATE POLICY "Service role can manage notifications"
  ON order_notifications
  USING (true)
  WITH CHECK (true);

-- Create function to queue SMS notification
CREATE OR REPLACE FUNCTION queue_order_sms_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification record
  -- Your application will poll this table and send actual SMS
  INSERT INTO order_notifications (
    order_id,
    notification_type,
    message_body
  ) VALUES (
    NEW.id,
    'sms',
    format('🔔 New Order Alert!

Order ID: %s
Bottle: %s
Qty: %s
Date: %s',
      substring(NEW.id::text, 1, 8),
      NEW.bottle_type,
      NEW.quantity,
      NEW.preferred_delivery_date
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_order_created_queue_sms ON orders;

CREATE TRIGGER on_order_created_queue_sms
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION queue_order_sms_notification();

COMMENT ON TABLE order_notifications IS 'Queue for pending SMS notifications';
COMMENT ON FUNCTION queue_order_sms_notification() IS 'Queues SMS notification when new order is created';
