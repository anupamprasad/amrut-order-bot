// Supabase Edge Function to send SMS when new order is created
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')
const ADMIN_PHONE_NUMBER = Deno.env.get('ADMIN_PHONE_NUMBER')

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    // Get order details from the webhook payload
    const order = record
    
    console.log('New order received:', order.id)

    // Prepare SMS message
    const message = `🔔 New Order Alert!\n\nOrder ID: ${order.id.substring(0, 8)}\nBottle: ${order.bottle_type}\nQty: ${order.quantity}\nDate: ${order.preferred_delivery_date}\nAddress: ${order.delivery_address.substring(0, 50)}...`

    // Send SMS via Twilio
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && ADMIN_PHONE_NUMBER) {
      const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: ADMIN_PHONE_NUMBER,
            From: TWILIO_PHONE_NUMBER,
            Body: message,
          }),
        }
      )

      const data = await response.json()
      
      if (response.ok) {
        console.log('SMS sent successfully:', data.sid)
        return new Response(
          JSON.stringify({ success: true, sid: data.sid }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      } else {
        console.error('Twilio error:', data)
        throw new Error(data.message || 'Failed to send SMS')
      }
    } else {
      console.log('SMS not configured - missing credentials')
      return new Response(
        JSON.stringify({ success: false, reason: 'SMS not configured' }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
