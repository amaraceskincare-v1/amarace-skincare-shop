// Native Fetch implementation (No axios required)
const sendTelegram = async (message) => {
    // 1. Get these from your Telegram Bot (I can teach you how)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Log for now if keys are missing
    if (!botToken || !chatId) {
        console.log('--- TELEGRAM MOCK ---');
        console.log(`To Admin Chat`);
        console.log(`Message: ${message}`);
        console.log('--- (Add TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID to .env to enable) ---');
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML' // Allows bolding like <b>text</b>
            })
        });

        console.log('Telegram sent successfully');
    } catch (error) {
        console.error('Telegram Send Failed:', error.message);
    }
};

module.exports = sendTelegram;
