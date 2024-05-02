const { Client, LocalAuth, MessageMedia } = require('../index'); // Adjust the path as necessary
const qrcode = require('qrcode-terminal');
// const handleMessage = require('./handleMessage');
const {
    getUserState,
    updateUserState,
    activateConversation,
    initializeUserState,
    saveUserResponse,
    deactivateConversation,
} = require('./stateManager');
const { getNextStepMessage, conversationSteps } = require('./conversationFlow');
const { replyWithDelay, sendMessageWithDelay } = require('./utility');
const { generateImage, generateResponseAsCS } = require('./openaiService');

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

// client.on('message', handleMessage);

client.on('message', async (msg) => {
    console.log('MESSAGE RECEIVED', msg);
    const chat = await msg.getChat();
    const sender = await msg.getContact();
    const userId = sender.number;

    const userState = getUserState(userId);

    if (msg.body === '.status') {
        const currentDate = new Date();
        const masehiDateTime = currentDate.toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
        });
        const replyMessage = `WA-Bot Vido is up and running 🚀\nMasehi: ${masehiDateTime}`;
        await replyWithDelay(chat, msg, replyMessage);
    } else if (msg.body.startsWith('!ping')) {
        await replyWithDelay(chat, msg, 'pong');
    } else if (msg.body === '!ping reply') {
        msg.reply('pong');
    } 
    else if (msg.body.toLowerCase().startsWith('ask ')) {
        const prompt = msg.body.slice(4);

        generateResponseAsCS(prompt)
            .then((response) => {
                // Send the response text back to the user
                msg.reply(response);
            })
            .catch((error) => {
                console.error('OpenAI Error:', error);
                msg.reply(
                    'Mohon maaf, terjadi error saat memproses request Anda.',
                    error
                );
            });
    }
    else if (msg.body.toLowerCase().startsWith('sablon ')) {
        const prompt = msg.body.slice(7);
        generateImage(prompt)
            .then(async (imageUrl) => {
                console.log('Image URL:', imageUrl);
                const media = await MessageMedia.fromUrl(imageUrl);
                console.log('Media:', media);

                // Send the image as an attachment
                await client.sendMessage(msg.from, media);
            })
            .catch((error) => {
                console.error('OpenAI Error:', error);
                msg.reply(
                    'Sorry, I encountered an error while processing your request.'
                );
            });
    } else if (msg.body.toLowerCase() === 'harga kaos') {
        initializeUserState(userId);
        activateConversation(userId);
        const initialMessage = getNextStepMessage('askJenisKaos'); // Ensure to use the initial step key
        await sendMessageWithDelay(client, chat, msg, initialMessage);
        // Do not update the user state here. It should be updated after the user responds.
    } else if (userState.active) {
        if (msg.body.toLowerCase() === 'exit') {
            client.sendMessage(msg.from, 'Conversation ended.');
            // await replyWithDelay(chat, msg, 'Conversation ended.');
            deactivateConversation(userId);
            initializeUserState(userId);
        } else {
            await handleConversationStep(msg, userId, chat);
        }
    }
});

async function handleConversationStep(msg, userId, chat) {
    const userState = getUserState(userId);
    const currentStep = conversationSteps[userState.step];

    if (currentStep && msg.body.trim() !== '') {
        // Save the user's response first
        saveUserResponse(userId, userState.step, msg.body.trim());

        // Check if there's a next step and move to it
        if (currentStep.nextStep) {
            // If there is a next step, move to it and send the corresponding message
            updateUserState(userId, { step: currentStep.nextStep });
            const nextStepMessage = getNextStepMessage(currentStep.nextStep);
            await sendMessageWithDelay(client, chat, msg, nextStepMessage);
        } else {
            // If there is no next step, process the final step
            await processFinalStep(msg, userId, chat);
        }
    } else {
        await replyWithDelay(chat, msg, 'Can you please repeat?');
    }
}


async function processFinalStep(msg, userId, chat) {
    const userState = getUserState(userId);
    const { responses } = userState;
    const { priceIndividual, priceTotal } = calculatePrices(responses);
    
    // console.log('Final responses:', responses);
    // console.log(`Price per item: ${priceIndividual}, Total price: ${priceTotal}`);

    await sendMessageWithDelay(client,chat,msg,
        `Harga per pcs @: Rp ${priceIndividual.toLocaleString('id-ID')}, Total Biayanya: Rp ${priceTotal.toLocaleString('id-ID')}`
    );

    deactivateConversation(userId);
    initializeUserState(userId); // Reset the state for future interactions
}


function calculatePrices(responses) {
    let price = 0;
    const { askJenisKaos, askJenisSablon, askTitikSablon, askQuantityPesan } =
        responses;

    console.log(`askJenisKaos: ${askJenisKaos}`);
    console.log(`askJenisSablon: ${askJenisSablon}`);
    console.log(`askTitikSablon: ${askTitikSablon}`);
    console.log(`askQuantityPesan: ${askQuantityPesan}`);

    switch (askJenisKaos) {
    case '1': // Kaos Oblong
        price += 2000;
        break;
    case '2': // Kaos Kerah
        price += 1500;
        break;
    case '3': // Kaos Raglan
        price += 500;
        break;
    }

    console.log(`price 1: ${price}`);

    const titikSablon = parseInt(askTitikSablon, 10);
    switch (askJenisSablon) {
    case '1': // Sablon Plastisol
        price += 4500 * titikSablon;
        break;
    case '2': // Sablon Rubber
        price += 2500 * titikSablon;
        break;
    case '3': // Sablon Discharge
        price += 3000 * titikSablon;
        break;
    case '4': // Belum Tahu
        price += 2500 * titikSablon; // Default case
        break;
    }

    console.log(`price 2: ${price}`);

    const quantityPesan = parseInt(askQuantityPesan, 10);

    console.log(`askQuantityPesan: ${askQuantityPesan}`);
    const priceIndividual = price;
    const priceTotal = priceIndividual * quantityPesan;

    return { priceIndividual, priceTotal };
}



module.exports = client;
