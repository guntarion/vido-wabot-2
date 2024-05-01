const { Client, NoAuth, LocalAuth } = require('../index');
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


const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3002;



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

    /* Create HTTP server */
    http.createServer(app).listen(port);
    console.info('listening on port ' + port);
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




/* Get endpoint to check current status  */
app.get('/api/health', async (req, res) => {
    res.json({
        success: true,
        message: 'Server is running healthy',
    });
});

app.post('/send-message', (req, res) => {
    const number = req.body.number;
    const text = req.body.text;

    const chatId = number.substring(1) + '@c.us';

    client.sendMessage(chatId, text);

    res.send({ status: 'Message sent' });
});

app.post('/send-messages', (req, res) => {
    const numbers = req.body.numbers; // Expect an array of numbers
    const text = req.body.text;

    numbers.forEach((number, index) => {
        // Generate a random delay between 2 to 8 seconds
        const delay = Math.floor(Math.random() * (8000 - 2000 + 1)) + 2000;

        setTimeout(() => {
            const chatId = number.substring(1) + '@c.us';
            client.sendMessage(chatId, text);
        }, index * delay);
    });

    res.send({ status: 'Messages sent' });
});

app.post('/send-unique-messages', (req, res) => {
    const messages = req.body.messages; // Expect an array of objects { number: '123', text: 'Hello' }

    messages.forEach((message, index) => {
        // Generate a random delay between 2 to 8 seconds
        const delay = Math.floor(Math.random() * (8000 - 2000 + 1)) + 2000;

        setTimeout(() => {
            const chatId = message.number.substring(1) + '@c.us';
            client.sendMessage(chatId, message.text);
        }, index * delay);
    });

    res.send({ status: 'Messages sent' });
});

app.post('/send-message-group', (req, res) => {
    const number = req.body.number;
    const text = req.body.text;

    const chatId = number.substring(1) + '@g.us';

    client.sendMessage(chatId, text);

    res.send({ status: 'Message sent' });
});

app.post('/send-media', (req, res) => {
    const number = req.body.number;
    const media = req.body.media;

    const chatId = number.substring(1) + '@c.us';

    client.sendImage(chatId, media, 'media', 'Media caption');

    res.send({ status: 'Media sent' });
});

app.post('/send-media-group', (req, res) => {
    const number = req.body.number;
    const media = req.body.media;

    const chatId = number.substring(1) + '@g.us';

    client.sendImage(chatId, media, 'media', 'Media caption');

    res.send({ status: 'Media sent' });
});

app.post('/send-location', (req, res) => {
    const number = req.body.number;
    const lat = req.body.lat;
    const long = req.body.long;
    const loc = req.body.loc;

    const chatId = number.substring(1) + '@c.us';

    client.sendLocation(chatId, lat, long, loc);

    res.send({ status: 'Location sent' });
});

app.post('/send-location-group', (req, res) => {
    const number = req.body.number;
    const lat = req.body.lat;
    const long = req.body.long;
    const loc = req.body.loc;

    const chatId = number.substring(1) + '@g.us';

    client.sendLocation(chatId, lat, long, loc);

    res.send({ status: 'Location sent' });
});

app.post('/send-contacts', (req, res) => {
    const number = req.body.number;
    const contact = req.body.contact;

    const chatId = number.substring(1) + '@c.us';

    client.sendContact(chatId, contact);

    res.send({ status: 'Contact sent' });
});

app.post('/send-contacts-group', (req, res) => {
    const number = req.body.number;
    const contact = req.body.contact;

    const chatId = number.substring(1) + '@g.us';

    client.sendContact(chatId, contact);

    res.send({ status: 'Contact sent' });
});

app.post('/send-link-preview', (req, res) => {
    const number = req.body.number;
    const link = req.body.link;

    const chatId = number.substring(1) + '@c.us';

    client.sendMessage(chatId, link);

    res.send({ status: 'Link sent' });
});

app.post('/send-link-preview-group', (req, res) => {
    const number = req.body.number;
    const link = req.body.link;

    const chatId = number.substring(1) + '@g.us';

    client.sendMessage(chatId, link);

    res.send({ status: 'Link sent' });
});

app.post('/send-voice', (req, res) => {
    const number = req.body.number;
    const voice = req.body.voice;

    const chatId = number.substring(1) + '@c.us';

    client.sendVoice(chatId, voice);

    res.send({ status: 'Voice sent' });
});

app.post('/send-voice-group', (req, res) => {
    const number = req.body.number;
    const voice = req.body.voice;

    const chatId = number.substring(1) + '@g.us';

    client.sendVoice(chatId, voice);

    res.send({ status: 'Voice sent' });
});


app.post('/send-video', (req, res) => {
    const number = req.body.number;
    const video = req.body.video;

    const chatId = number.substring(1) + '@c.us';

    client.sendVideo(chatId, video, 'video', 'Video caption');

    res.send({ status: 'Video sent' });
});

app.post('/send-video-group', (req, res) => {
    const number = req.body.number;
    const video = req.body.video;

    const chatId = number.substring(1) + '@g.us';

    client.sendVideo(chatId, video, 'video', 'Video caption');

    res.send({ status: 'Video sent' });
});

app.post('/send-document', (req, res) => {
    const number = req.body.number;
    const document = req.body.document;

    const chatId = number.substring(1) + '@c.us';

    client.sendDocument(chatId, document, 'document', 'Document caption');

    res.send({ status: 'Document sent' });
});

app.post('/send-document-group', (req, res) => {
    const number = req.body.number;
    const document = req.body.document;

    const chatId = number.substring(1) + '@g.us';

    client.sendDocument(chatId, document, 'document', 'Document caption');

    res.send({ status: 'Document sent' });
});

app.post('/send-sticker', (req, res) => {
    const number = req.body.number;
    const sticker = req.body.sticker;

    const chatId = number.substring(1) + '@c.us';

    client.sendImageAsSticker(chatId, sticker);

    res.send({ status: 'Sticker sent' });
});

app.post('/send-sticker-group', (req, res) => {
    const number = req.body.number;
    const sticker = req.body.sticker;

    const chatId = number.substring(1) + '@g.us';

    client.sendImageAsSticker(chatId, sticker);

    res.send({ status: 'Sticker sent' });
});

