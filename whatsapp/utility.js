async function replyWithDelay(chat, msg, replyText) {
    chat.sendStateTyping();
    setTimeout(() => {
        msg.reply(replyText);
    }, Math.random() * 2000 + 2000);
}

module.exports = replyWithDelay;
