// Utility to send SMS (Mock implementation for now)
// To fully enable, install 'twilio' and uncomment the logic below with valid credentials

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);

const sendSMS = async (to, body) => {
    console.log('--- SMS MOCK ---');
    console.log(`To: ${to}`);
    console.log(`Message: ${body}`);
    console.log('----------------');

    // Real implementation example:
    /*
    try {
      await client.messages.create({
        body: body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });
    } catch (error) {
      console.error('SMS Failed:', error);
    }
    */
};

module.exports = sendSMS;
