const { Client, NoAuth, LocalAuth } = require('./index');
const qrcode = require('qrcode-terminal');

const wwebVersion = '2.2412.54';

const client = new Client({
    // authStrategy: new NoAuth(),
    authStrategy: new LocalAuth(),
    // proxyAuthentication: { username: 'username', password: 'password' },
    puppeteer: {
        // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
        headless: false,
    },
    webVersionCache: {
        type: 'remote',
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
    },
});

client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    // qrcode.generate(qr, { small: true });
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', (msg) => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('🧤 READY');
});


// SIMULATING TYPING AND DELAYED REPLIES

async function replyWithDelay(chat, msg, replyText) {
    // Simulate typing in the chat
    chat.sendStateTyping();

    // Wait for a random time between 2 and 4 seconds
    const delay = Math.random() * 2000 + 2000;
    setTimeout(() => {
        msg.reply(replyText);
    }, delay);
}

async function sendMessageWithDelay(chat, msg, messageText) {
    // Simulate typing in the chat
    chat.sendStateTyping();

    // Wait for a random time between 2 and 4 seconds
    const delay = Math.random() * 2000 + 2000;
    setTimeout(() => {
        client.sendMessage(msg.from, messageText);
    }, delay);
}


client.on('message', async (msg) => {
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
    } else if (msg.body === '!ping reply') {
        // Send a new message as a reply to the current one
        msg.reply('pong');
    } else if (msg.body === '!ping') {
        // Send a new message to the same chat
        client.sendMessage(msg.from, 'pong');
    }
});

client.on('message_create', async (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        // do stuff here
    }

    // Unpins a message
    if (msg.fromMe && msg.body.startsWith('!unpin')) {
        const pinnedMsg = await msg.getQuotedMessage();
        if (pinnedMsg) {
            // Will unpin a message
            const result = await pinnedMsg.unpin();
            console.log(result); // True if the operation completed successfully, false otherwise
        }
    }
});
