// Quick test script to verify Twilio SMS is working
import 'dotenv/config';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const toNumber = process.env.ADMIN_PHONE_NUMBER;

console.log('🔍 Testing Twilio Configuration...\n');
console.log('Account SID:', accountSid);
console.log('Auth Token:', authToken ? '✓ Set' : '✗ Missing');
console.log('From Number:', fromNumber);
console.log('To Number:', toNumber);
console.log('\n' + '='.repeat(50) + '\n');

if (!accountSid || !authToken || !fromNumber || !toNumber) {
  console.error('❌ Missing required environment variables!');
  process.exit(1);
}

try {
  const client = twilio(accountSid, authToken);
  
  console.log('📤 Sending test SMS...\n');
  
  const message = await client.messages.create({
    body: '🧪 Test SMS from Amrut Bot - Your Twilio integration is working!',
    from: fromNumber,
    to: toNumber,
  });
  
  console.log('✅ SMS sent successfully!');
  console.log('Message SID:', message.sid);
  console.log('Status:', message.status);
  console.log('From:', message.from);
  console.log('To:', message.to);
  console.log('\n✨ Check your phone for the test message!');
  
} catch (error) {
  console.error('\n❌ SMS sending failed:');
  console.error('Error:', error.message);
  
  if (error.code === 21608) {
    console.error('\n💡 Tip: The "From" phone number is not verified or not owned by your Twilio account.');
    console.error('   Go to https://console.twilio.com/us1/develop/phone-numbers/manage/incoming and verify your number.');
  } else if (error.code === 21211) {
    console.error('\n💡 Tip: Invalid "To" phone number format. Use E.164 format like +919810554738');
  } else if (error.code === 20003) {
    console.error('\n💡 Tip: Invalid credentials. Check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
  } else {
    console.error('\nTwilio Error Code:', error.code);
    console.error('More info:', error.moreInfo);
  }
  
  process.exit(1);
}
