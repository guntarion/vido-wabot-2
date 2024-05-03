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
const { getNextStepMessage, conversationPricingKaos, conversationTestimoni, conversationDesainKaos, conversationSizeFitting, } = require('./conversationFlow');
const { replyWithDelay, sendMessageWithDelay } = require('./utility');
const { generateImage, generateResponseAsCS, generateTestimonial } = require('./openaiService');

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
        initializeUserState(userId, conversationPricingKaos);
        activateConversation(userId);
        const initialMessage = getNextStepMessage(conversationPricingKaos, 'askJenisKaos'); // Use the first step from the specific conversation
        // const initialMessage = getNextStepMessage('askJenisKaos'); // Ensure to use the initial step key
        // const initialMessage = getNextStepMessage(conversationPricingKaos, userState.step);
        await sendMessageWithDelay(client, chat, msg, initialMessage);
        // Do not update the user state here. It should be updated after the user responds.
    } else if (msg.body.toLowerCase() === 'feedback') {
        initializeUserState(userId, conversationTestimoni);
        activateConversation(userId);
        const initialMessage = getNextStepMessage(conversationTestimoni, 'askAlasanMemilih');
        await sendMessageWithDelay(client, chat, msg, initialMessage);
    } else if (msg.body.toLowerCase() === 'desain kaos') {
        initializeUserState(userId, conversationDesainKaos);
        activateConversation(userId);
        const initialMessage = getNextStepMessage(conversationDesainKaos, 'askJenisKaos');
        await sendMessageWithDelay(client, chat, msg, initialMessage);
    } else if (msg.body.toLowerCase() === 'size order') {
        initializeUserState(userId, conversationSizeFitting);
        activateConversation(userId);
        const initialMessage = getNextStepMessage(conversationSizeFitting, 'askOrderPO');
        await sendMessageWithDelay(client, chat, msg, initialMessage);
    } else if (userState.active) {
        if (msg.body.toLowerCase() === 'exit') {
            client.sendMessage(msg.from, 'Conversation ended.');
            deactivateConversation(userId);
            initializeUserState(userId);
        } else {
            // Pass the userState.conversationType directly to handle steps based on the active conversation
            await handleConversationStep(msg, userId, chat, userState.conversationType);
        }
    }
});

async function handleConversationStep(msg, userId, chat) {
    const userState = getUserState(userId);
    const currentStep = userState.conversationType.steps[userState.step];

    if (currentStep && msg.body.trim() !== '') {
        saveUserResponse(userId, userState.step, msg.body.trim());

        if (currentStep.nextStep) {
            updateUserState(userId, { step: currentStep.nextStep });
            const nextStepMessage = getNextStepMessage(userState.conversationType, currentStep.nextStep);
            await sendMessageWithDelay(client, chat, msg, nextStepMessage);
        } else {
            await processFinalStep(msg, userId, chat, userState.conversationType.type);
        }
    } else {
        await replyWithDelay(chat, msg, 'Bisa tolong diulangi?');
    }
}


async function processFinalStep(msg, userId, chat, conversationType) {
    const userState = getUserState(userId);
    const { responses } = userState;

    switch (conversationType) {
    case 'pricingKaos':
        // eslint-disable-next-line no-case-declarations
        const { priceIndividual, priceTotal } = calculatePrices(responses);
        await sendMessageWithDelay(client, chat, msg, `Harga per pcs @: Rp ${priceIndividual.toLocaleString('id-ID')}, Total Biayanya: Rp ${priceTotal.toLocaleString('id-ID')}`);
        break;
    case 'testimoni':
        try {
            const rekomendasiTestimonial = await suggestTestimonial(userState.responses);
            const message = `Terima kasih atas feedback Anda! Jika Anda berkenan, barangkali Anda bisa memberikan review untuk kami di https://bitly/AGCS32.\n\nBerikut adalah rekomendasi testimonial dari Anda:\n\n${rekomendasiTestimonial}\n\nTerima kasih atas kerjasamanya!`;
            await sendMessageWithDelay(client, chat, msg, message);
        } catch (error) {
            console.error('Error generating testimonial:', error);
            await sendMessageWithDelay(client, chat, msg, 'Maaf, terjadi kesalahan saat memproses testimonial Anda.');
        }
        break;
    case 'desainKaos':
        await sendMessageWithDelay(client, chat, msg, 'Desain Anda telah kami terima dan akan segera diproses.');
        break;
    case 'sizeFitting':
        await sendMessageWithDelay(client, chat, msg, 'Detail ukuran telah dicatat. Terima kasih telah mengonfirmasi ukuran Anda.');
        break;
    default:
        await sendMessageWithDelay(client, chat, msg, 'Kami telah selesai dengan proses ini.');
        break;
    }

    deactivateConversation(userId);
    initializeUserState(userId);
}


// function suggestTestimonial(responses) {

//     const { askAlasanMemilih, askKesanPertama, askKesanTerakhir, askMerekomendasikan } = responses;

//     console.log(`askAlasanMemilih: ${askAlasanMemilih}`);
//     console.log(`askKesanPertama: ${askKesanPertama}`);
//     console.log(`askKesanTerakhir: ${askKesanTerakhir}`);
//     console.log(`askMerekomendasikan: ${askMerekomendasikan}`);

//     return rekomendasiTestimonial;
// }


async function suggestTestimonial(responses) {
    // Parsing responses for multiple choice answers
    const parseResponse = (response, options) => {
        const indices = response.split(/[ ,]+/).map(Number); // Split by comma or space and convert to numbers
        return indices
            .map((index) => options[index - 1])
            .filter(Boolean)
            .join(', ');
    };

    // Options corresponding to the numbers for 'askAlasanMemilih'
    const optionsAlasanMemilih = [
        'Atas rekomendasi teman/relasi',
        'Review yang banyak dan bagus',
        'Lokasi mudah ditemukan',
        'Mendapat masukan bermanfaat',
        'Mendapat rekomendasi bagus',
        'Banyak referensi pilihan',
        'Harganya kompetitif',
    ];

    // Options corresponding to the numbers for 'askYangBerkesanApa'
    const optionsYangBerkesanApa = [
        'Lokasi cukup nyaman',
        'Pilihan desain/bahan/warna beragam',
        'Proses pra produksi efektif & positif',
        'Mendapatkan harga terbaik',
        'Hasil jahitan rapi/kuat',
        'Hasil sablonan/bordiran bagus',
        'Ketepatan waktu delivery',
        'Penanganan komplain baik',
    ];

    const responAlasanMemilih = parseResponse(
        responses.askAlasanMemilih,
        optionsAlasanMemilih
    );
    const responYangBerkesanApa = parseResponse(
        responses.askYangBerkesanApa,
        optionsYangBerkesanApa
    );

    const responKesanTambahan  = responses.askKesanTambahan;

    console.log(`responAlasanMemilih: ${responAlasanMemilih}`);
    console.log(`responYangBerkesanApa: ${responYangBerkesanApa}`);
    console.log(`responKesanTambahan: ${responKesanTambahan}`);

    // Here you can form a complete testimonial string using responses
    const clueTestimonial = `Alasan memilih Vido: ${responAlasanMemilih}. Perihal yang positif/berkesan: ${responYangBerkesanApa}. Kesan/catatan tambahan: ${responKesanTambahan}`;

    return generateTestimonial(clueTestimonial);
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
