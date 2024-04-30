const client = require('./waclient');

const sendMessage = (req, res) => {
    const number = req.body.number;
    const text = req.body.text;
    const chatId = number.substring(1) + '@c.us';
    client.sendMessage(chatId, text);
    res.send({ status: 'Message sent' });
};

const sendMessages = (req, res) => {
    // Bulk message sending logic
};

module.exports = {
    sendMessage,
    sendMessages,
};
