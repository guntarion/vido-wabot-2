const replyWithDelay = require('./utility');

async function handleMessage(msg) {
    console.log('MESSAGE RECEIVED', msg);
    const chat = await msg.getChat();

    if (msg.body === '.status') {
        const currentDate = new Date();
        const masehiDateTime = currentDate.toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
        });
        const hijriDateTime = currentDate.toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
            calendar: 'islamic-umalqura',
        });

        const replyMessage = `WA-Bot Vido is up and running 🚀\nMasehi: ${masehiDateTime}\nHijriah: ${hijriDateTime}`;
        await replyWithDelay(chat, msg, replyMessage);
    } else if (msg.body.startsWith('!ping')) {
        await replyWithDelay(chat, msg, 'pong');
    } else if (msg.body === '!ping reply') {
        // Send a new message as a reply to the current one
        msg.reply('pong');
    } 
}

module.exports = handleMessage;
