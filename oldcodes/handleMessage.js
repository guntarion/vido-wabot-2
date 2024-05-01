
const {
    getUserState,
    updateUserState,
    activateConversation,
    initializeUserState,
    saveUserResponse,
    deactivateConversation,
} = require('./stateManager');
const { getNextStepMessage, conversationSteps } = require('./conversationFlow');
const { replyWithDelay} = require('./utility');

async function handleMessage(msg) {
    console.log('MESSAGE RECEIVED', msg);
    const chat = await msg.getChat();
    const sender = await msg.getContact();
    const userId = sender.number;

    const userState = getUserState(userId);

    // const currentStep = conversationSteps[userState.step];

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
        // Send a new message as a reply to the current one
        msg.reply('pong');
    } else if (msg.body === '.pesanKaos') {
        initializeUserState(userId); // Ensure user state is reset when conversation starts
        activateConversation(userId);
        await replyWithDelay(chat, msg, getNextStepMessage(userState.step));
        updateUserState(userId, {
            step: conversationSteps[userState.step].nextStep,
        }); // Move to next step immediately after initial message
    } else if (userState.active) {
        if (msg.body.toLowerCase() === 'exit') {
            await replyWithDelay(chat, msg, 'Conversation ended.');
            deactivateConversation(userId);
            initializeUserState(userId); // Reset state on exit
        } else {
            await handleConversationStep(msg, userId, chat);
        }
    }
    // else {
    //     // Respond to non-conversation messages or ignore.
    //     await replyWithDelay(chat, msg, 'Type \'.pesanKaos\' to start ordering.');
    // }
}

async function handleConversationStep(msg, userId, chat) {
    const userState = getUserState(userId);
    const currentStep = conversationSteps[userState.step];

    if (currentStep && msg.body.trim() !== '') {
        // Save the response before moving to the next step
        saveUserResponse(userId, userState.step, msg.body.trim());

        if (currentStep.nextStep) {
            updateUserState(userId, { step: currentStep.nextStep }); // Update state first to move to the next step
            await replyWithDelay(chat, msg, currentStep.message);
        } else {
            // Process responses at the end of the conversation
            const { responses } = userState;
            const { priceIndividual, priceTotal } = calculatePrices(responses);
            console.log(
                `Price per item: ${priceIndividual}, Total price: ${priceTotal}`
            );

            await replyWithDelay(chat, msg, `Harga per pcs @: Rp ${priceIndividual.toLocaleString('id-ID')}, Total Biayanya: Rp ${priceTotal.toLocaleString('id-ID')}`);
            await replyWithDelay(chat, msg, currentStep.message);
            deactivateConversation(userId);
            initializeUserState(userId); // Reset state after completion
        }
    } else {
        await replyWithDelay(chat, msg, 'Can you please repeat?');
    }
}


function calculatePrices(responses) {
    let price = 0;
    const { askJenisKaos, askJenisSablon, askTitikSablon, askQuantityPesan } =
        responses;

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

    const quantityPesan = parseInt(askQuantityPesan, 10);
    const priceIndividual = price;
    const priceTotal = priceIndividual * quantityPesan;

    return { priceIndividual, priceTotal };
}


module.exports = handleMessage;
