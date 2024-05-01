const {
    getUserState,
    updateUserState,
    activateConversation,
    deactivateConversation,
    initializeUserState,
} = require('./stateManager');
const { getNextStepMessage, conversationSteps } = require('./conversationFlow');
const replyWithDelay = require('./utility');

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
        if (currentStep.nextStep) {
            updateUserState(userId, { step: currentStep.nextStep }); // Update state first to move to the next step
            await replyWithDelay(chat, msg, currentStep.message);
        } else {
            await replyWithDelay(chat, msg, currentStep.message);
            deactivateConversation(userId);
            initializeUserState(userId); // Reset state after completion
        }
    } else {
        await replyWithDelay(chat, msg, 'Can you please repeat?');
    }
}

module.exports = handleMessage;
