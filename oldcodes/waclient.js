const { Client, LocalAuth } = require('../index'); // Adjust the path as necessary
const qrcode = require('qrcode-terminal');
const handleMessage = require('./handleMessage');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    },
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', (msg) => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('🧤 WhatsApp Client is ready!');
});

client.on('message', handleMessage);

module.exports = client;
