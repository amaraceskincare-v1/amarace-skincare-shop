require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

const testEmail = async () => {
    console.log('Testing email sending...');
    console.log(`User: ${process.env.EMAIL_USER}`);
    console.log(`Pass starts with: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 4) : 'UNDEFINED'}`);

    // Target the user's temp email from the screenshot
    const targetEmail = 'kabihaj438@lawicon.com';

    try {
        await sendEmail({
            to: targetEmail,
            subject: 'Test Email from AmaraCe Debugger',
            html: '<h1>If you see this, email execution is working!</h1><p>The issue might be in how the email address is passed during checkout.</p>'
        });
        console.log('✅ Manual test finished. Check the logs above to see if it said "sent successfully".');
    } catch (error) {
        console.error('❌ Manual test crashed:', error);
    }
};

testEmail();
